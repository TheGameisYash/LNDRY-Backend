import slugify from 'slugify'
import { getClient, query } from '../../config/database.js'
import { logger } from '../../config/logger.js'
import { WatermarkService } from '../watermark/watermark.service.js'
import { emit as emitAudit } from '../../utils/audit-log.js'


export class VendorsService {
  constructor(repository) {
    this.repo = repository
    this.watermarkService = new WatermarkService()
  }

  async apply(userId, data) {
    // Generate unique slug
    let baseSlug = slugify(data.name, { lower: true, strict: true })
    const slugCount = await this.repo.getSlugCount(baseSlug)
    const slug = slugCount > 0 ? `${baseSlug}-${slugCount + 1}` : baseSlug

    const branchCode = 'VND-' + Math.random().toString(36).substring(2, 8).toUpperCase()

    const applicationData = {
      ...data,
      slug,
      branch_code: branchCode,
      created_by: userId,
      status: 'WAITING_FOR_APPROVAL',
      is_active: false
    }

    const vendor = await this.repo.create(applicationData)
    logger.info({ vendorId: vendor.id, userId }, 'Vendor onboarding application submitted')
    return vendor
  }

  async getProfile(userId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) return null
    const documents = await this.repo.getDocuments(vendor.id)
    return {
      ...vendor,
      documents
    }
  }

  async updateProfile(userId, data) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor profile not found' }
    }
    // Cannot update status directly
    delete data.status
    delete data.is_active
    delete data.created_by
    return this.repo.update(vendor.id, data)
  }

  async uploadDocument(userId, type, fileUrl) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor profile not found' }
    }
    return this.repo.addDocument(vendor.id, type, fileUrl)
  }

  async adminList(filters) {
    return this.repo.findMany(filters)
  }

  async adminGetDetails(id) {
    const vendor = await this.repo.findById(id)
    if (!vendor) return null
    const documents = await this.repo.getDocuments(id)
    return {
      ...vendor,
      documents
    }
  }

  async adminReview(id, { status, approvedRadius, documentReviews }) {
    const vendor = await this.repo.findById(id)
    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor not found' }
    }

    const validStatuses = ['APPROVED', 'REJECTED', 'CORRECTION_REQUIRED', 'SUSPENDED']
    if (!validStatuses.includes(status)) {
      throw { statusCode: 400, message: 'Invalid vendor status' }
    }

    const updates = { status }
    if (status === 'APPROVED') {
      updates.is_active = true
      if (approvedRadius) {
        updates.delivery_radius_km = approvedRadius
      }
    } else {
      updates.is_active = false
    }

    // Process document reviews if provided
    if (Array.isArray(documentReviews)) {
      for (const dr of documentReviews) {
        await this.repo.updateDocumentStatus(dr.documentId, dr.status, dr.rejectionReason)
      }
    }

    const updatedVendor = await this.repo.update(id, updates)
    logger.info({ vendorId: id, status, approvedRadius }, 'Vendor application reviewed by admin')

    // Mock notification dispatch
    logger.info({ vendorId: id, status }, `Sent notification: Vendor status updated to ${status}`)

    return updatedVendor;
  }

  async previewKycDocument(docId, user) {
    const doc = await this.repo.getDocumentById(docId)
    if (!doc) {
      throw { statusCode: 404, message: 'Document not found' }
    }

    const isAdmin = user.role === 'ADMIN' || user.platform_role === 'ADMIN'
    if (!isAdmin) {
      const userVendor = await this.repo.findByUserId(user.id)
      if (!userVendor || userVendor.id !== doc.vendor_id) {
        throw { statusCode: 403, message: 'Forbidden' }
      }
    }

    const vendor = await this.repo.findById(doc.vendor_id)
    const settings = await this.repo.getWatermarkSettings() || { enabled: true, text: 'For LNDRY Verification Only', position: 'center', scale: 1.0, opacity: 0.4 }

    emitAudit('kyc_document_viewed', {
      actor_user_id: user.id,
      actor_role: user.role || user.platform_role || null,
      actor_shop_id: doc.vendor_id,
      target_type: 'vendor_document',
      target_id: docId,
      before: null,
      after: { document_type: doc.document_type },
    })

    return this.watermarkService.processKycPreview(
      doc.file_url,
      vendor ? vendor.branch_code : 'VND-UNKNOWN',
      settings
    )
  }

  async createApplication(userId, data) {
    const existing = await this.repo.findByUserId(userId)
    if (existing) {
      return existing
    }

    let baseSlug = slugify(data.name || 'Vendor', { lower: true, strict: true })
    const slugCount = await this.repo.getSlugCount(baseSlug)
    const slug = slugCount > 0 ? `${baseSlug}-${slugCount + 1}` : baseSlug
    const branchCode = 'VND-' + Math.random().toString(36).substring(2, 8).toUpperCase()

    const applicationData = {
      name: data.name || 'My Laundry Business',
      address_line1: data.address_line1 || 'Draft Address',
      city: data.city || 'Draft City',
      state: data.state || 'Draft State',
      pincode: data.pincode || '000000',
      lat: data.lat || 0,
      lng: data.lng || 0,
      slug,
      branch_code: branchCode,
      created_by: userId,
      status: 'DRAFT',
      is_active: false
    }

    return this.repo.create(applicationData)
  }

  async getApplicationMe(userId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) {
      throw { statusCode: 404, message: 'No onboarding application found' }
    }
    const documents = await this.repo.getDocuments(vendor.id)
    
    // Check missing steps for onboarding wizard
    const missingSteps = []
    if (!vendor.bank_account_number || !vendor.bank_ifsc) {
      missingSteps.push('bank_details')
    }
    if (!vendor.gst_number && !vendor.pan_number) {
      missingSteps.push('tax_details')
    }
    const requiredDocs = ['owner_identity', 'shop_photo', 'registration_document']
    const uploadedDocs = documents.map(d => d.document_type)
    for (const docType of requiredDocs) {
      if (!uploadedDocs.includes(docType)) {
        missingSteps.push(`document:${docType}`)
      }
    }

    return {
      application: {
        ...vendor,
        documents
      },
      missing_steps: missingSteps,
    }
  }

  async verifyApplicationAccess(userId, applicationId) {
    const vendor = await this.repo.findById(applicationId)
    if (!vendor) {
      throw { statusCode: 404, message: 'Application not found' }
    }
    if (vendor.created_by !== userId) {
      throw { statusCode: 403, message: 'Forbidden' }
    }
    return vendor
  }

  async updateApplicationOwner(userId, appId, data) {
    await this.verifyApplicationAccess(userId, appId)
    const updates = {}
    if (data.email) updates.email = data.email
    if (data.phone) updates.phone = data.phone
    if (data.bank_account_number) updates.bank_account_number = data.bank_account_number
    if (data.bank_ifsc) updates.bank_ifsc = data.bank_ifsc
    if (data.bank_name) updates.bank_name = data.bank_name
    if (data.bank_holder_name) updates.bank_holder_name = data.bank_holder_name
    
    return this.repo.update(appId, updates)
  }

  async updateApplicationBusiness(userId, appId, data) {
    await this.verifyApplicationAccess(userId, appId)
    const updates = {}
    if (data.name) updates.name = data.name
    if (data.description) updates.description = data.description
    if (data.operating_hours) updates.operating_hours = data.operating_hours
    if (data.gst_number) updates.gst_number = data.gst_number
    if (data.pan_number) updates.pan_number = data.pan_number

    return this.repo.update(appId, updates)
  }

  async updateApplicationLocation(userId, appId, data) {
    await this.verifyApplicationAccess(userId, appId)
    const updates = {}
    if (data.address_line1) updates.address_line1 = data.address_line1
    if (data.address_line2) updates.address_line2 = data.address_line2
    if (data.city) updates.city = data.city
    if (data.state) updates.state = data.state
    if (data.pincode) updates.pincode = data.pincode
    if (data.lat !== undefined) updates.lat = data.lat
    if (data.lng !== undefined) updates.lng = data.lng

    return this.repo.update(appId, updates)
  }

  async updateApplicationRadius(userId, appId, data) {
    await this.verifyApplicationAccess(userId, appId)
    const updates = {}
    if (data.requested_radius_km !== undefined) {
      updates.delivery_radius_km = data.requested_radius_km
    }
    return this.repo.update(appId, updates)
  }

  async addApplicationDocument(userId, appId, type, fileUrl) {
    await this.verifyApplicationAccess(userId, appId)
    return this.repo.addDocument(appId, type, fileUrl)
  }

  async deleteApplicationDocument(userId, appId, docId) {
    await this.verifyApplicationAccess(userId, appId)
    const doc = await this.repo.getDocumentById(docId)
    if (!doc || doc.vendor_id !== appId) {
      throw { statusCode: 404, message: 'Document not found' }
    }
    await query('DELETE FROM vendor_documents WHERE id = $1', [docId])
    return { success: true }
  }

  async submitApplication(userId, appId) {
    const vendor = await this.verifyApplicationAccess(userId, appId)
    if (vendor.status !== 'DRAFT' && vendor.status !== 'CORRECTION_REQUIRED') {
      throw { statusCode: 400, message: 'Application is already submitted' }
    }
    return this.repo.update(appId, { status: 'WAITING_FOR_APPROVAL' })
  }

  async resubmitApplication(userId, appId) {
    const vendor = await this.verifyApplicationAccess(userId, appId)
    if (vendor.status !== 'CORRECTION_REQUIRED') {
      throw { statusCode: 400, message: 'Application is not in CORRECTION_REQUIRED status' }
    }
    return this.repo.update(appId, { status: 'WAITING_FOR_APPROVAL' })
  }

  async publishProfile(userId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor profile not found' }
    }
    if (vendor.status !== 'APPROVED') {
      throw { statusCode: 400, message: 'Cannot publish vendor profile until application is APPROVED' }
    }
    const hasService = await this.repo.hasActiveService(vendor.id)
    if (!hasService) {
      throw { statusCode: 400, message: 'Cannot publish vendor without at least one active service' }
    }

    return this.repo.update(vendor.id, { is_active: true })
  }

  async getPublicPreview(userId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor profile not found' }
    }
    const documents = await this.repo.getDocuments(vendor.id)
    return {
      ...vendor,
      documents
    }
  }

  async updateProfileLocation(userId, data) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor profile not found' }
    }
    const updates = {
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      lat: data.lat,
      lng: data.lng,
      status: 'WAITING_FOR_APPROVAL',
      is_active: false
    }
    return this.repo.update(vendor.id, updates)
  }

  async getVendorCategories() {
    const { rows } = await query('SELECT id, name, slug, description, image, display_order FROM categories WHERE is_active = true ORDER BY display_order ASC')
    return rows
  }

  async getVendorServices(userId, { status, categoryId, page = 1, limit = 20 } = {}) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const conditions = ['vs.vendor_id = $1', 'vs.deleted_at IS NULL']
    const params = [vendor.id]
    let idx = 2

    if (categoryId) {
      conditions.push(`gr.category_id = $${idx++}`)
      params.push(categoryId)
    }

    if (status !== undefined) {
      conditions.push(`vs.is_available = $${idx++}`)
      params.push(status === 'active' || status === 'true')
    }

    const offset = (page - 1) * limit
    const where = conditions.join(' AND ')

    const { rows } = await query(
      `SELECT vs.id, vs.price, vs.is_available, gr.id as garment_rate_id, gr.name as garment_name, gr.unit, gr.category_id, c.name as category_name
       FROM vendor_services vs
       JOIN garment_rates gr ON vs.garment_rate_id = gr.id
       JOIN categories c ON gr.category_id = c.id
       WHERE ${where}
       ORDER BY c.name, gr.name
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    )

    const countRes = await query(
      `SELECT COUNT(*)::int as total
       FROM vendor_services vs
       JOIN garment_rates gr ON vs.garment_rate_id = gr.id
       WHERE ${where}`,
      params
    )

    return {
      services: rows,
      total: countRes.rows[0].total,
      page,
      limit
    }
  }

  async createVendorServiceDraft(userId, categoryId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const { rows: grs } = await query('SELECT id, price FROM garment_rates WHERE category_id = $1 AND is_active = true', [categoryId])
    if (grs.length === 0) {
      throw { statusCode: 400, message: 'No active garments found in this category' }
    }

    for (const gr of grs) {
      await query(
        `INSERT INTO vendor_services (vendor_id, garment_rate_id, price, is_available)
         VALUES ($1, $2, $3, false)
         ON CONFLICT (vendor_id, garment_rate_id) DO UPDATE SET deleted_at = NULL`,
        [vendor.id, gr.id, gr.price]
      )
    }

    return { success: true, message: 'Draft service created' }
  }

  async getVendorServiceDetails(userId, categoryId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const { rows } = await query(
      `SELECT gr.id as garment_rate_id, gr.name as garment_name, gr.unit, gr.price as base_price,
              vs.id as vendor_service_id, vs.price as override_price, vs.is_available
       FROM garment_rates gr
       LEFT JOIN vendor_services vs ON vs.garment_rate_id = gr.id AND vs.vendor_id = $1 AND vs.deleted_at IS NULL
       WHERE gr.category_id = $2 AND gr.is_active = true`,
      [vendor.id, categoryId]
    )

    const catRes = await query('SELECT name, description FROM categories WHERE id = $1', [categoryId])

    return {
      category: catRes.rows[0] || null,
      garments: rows
    }
  }

  async updateVendorService(userId, categoryId, isAvailable) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    await query(
      `UPDATE vendor_services vs
       SET is_available = $1, updated_at = NOW()
       FROM garment_rates gr
       WHERE vs.garment_rate_id = gr.id AND vs.vendor_id = $2 AND gr.category_id = $3`,
      [isAvailable, vendor.id, categoryId]
    )

    return { success: true }
  }

  async deleteVendorService(userId, categoryId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    await query(
      `UPDATE vendor_services vs
       SET deleted_at = NOW(), updated_at = NOW()
       FROM garment_rates gr
       WHERE vs.garment_rate_id = gr.id AND vs.vendor_id = $1 AND gr.category_id = $2`,
      [vendor.id, categoryId]
    )

    return { success: true }
  }

  async addGarmentRate(userId, categoryId, data) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const slug = slugify(data.garment_type_name, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 6)
    const priceRupees = data.rate_paise / 100

    const { rows: grs } = await query(
      `INSERT INTO garment_rates (name, slug, unit, price, category_id, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, name, unit, price`,
      [data.garment_type_name, slug, data.rate_unit || 'piece', priceRupees, categoryId]
    )

    const grId = grs[0].id
    await query(
      `INSERT INTO vendor_services (vendor_id, garment_rate_id, price, is_available)
       VALUES ($1, $2, $3, true)`,
      [vendor.id, grId, priceRupees]
    )

    return grs[0]
  }

  async updateGarmentRate(userId, categoryId, garmentRateId, data) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const updates = []
    const params = []
    let idx = 1

    if (data.rate_paise !== undefined) {
      updates.push(`price = $${idx++}`)
      params.push(data.rate_paise / 100)
    }

    if (data.is_available !== undefined) {
      updates.push(`is_available = $${idx++}`)
      params.push(data.is_available)
    }

    if (updates.length === 0) return { success: true }

    params.push(vendor.id, garmentRateId)
    await query(
      `UPDATE vendor_services
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE vendor_id = $${idx} AND garment_rate_id = $${idx + 1}`,
      params
    )

    return { success: true }
  }

  async deleteGarmentRate(userId, categoryId, garmentRateId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    await query(
      `UPDATE vendor_services
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE vendor_id = $1 AND garment_rate_id = $2`,
      [vendor.id, garmentRateId]
    )

    return { success: true }
  }

  async bulkUpsertGarmentRates(userId, categoryId, items) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    for (const item of items) {
      const priceRupees = item.rate_paise / 100
      await query(
        `INSERT INTO vendor_services (vendor_id, garment_rate_id, price, is_available)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (vendor_id, garment_rate_id)
         DO UPDATE SET price = $3, is_available = $4, deleted_at = NULL, updated_at = NOW()`,
        [vendor.id, item.garment_rate_id, priceRupees, item.is_available !== false]
      )
    }

    return { success: true }
  }

  async publishService(userId, categoryId) {
    return this.updateVendorService(userId, categoryId, true)
  }

  async unpublishService(userId, categoryId, reason) {
    return this.updateVendorService(userId, categoryId, false)
  }

  async getCapacity(userId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const { rows: slots } = await query('SELECT id, day_of_week, start_time, end_time, max_orders, is_active FROM vendor_slots WHERE vendor_id = $1', [vendor.id])
    const { rows: exceptions } = await query('SELECT id, date, type, limit_count, reason FROM slot_exceptions WHERE vendor_id = $1', [vendor.id])

    return {
      daily_limit: vendor.operating_hours?.max_orders_per_day || null,
      weekly_availability: slots,
      exceptions
    }
  }

  async updateDailyLimit(userId, maxOrdersPerDay) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const operatingHours = vendor.operating_hours || {}
    operatingHours.max_orders_per_day = maxOrdersPerDay

    return this.repo.update(vendor.id, { operating_hours: operatingHours })
  }

  async getPickupSlots(userId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const { rows } = await query(
      'SELECT id, day_of_week, start_time, end_time, max_orders, is_active FROM vendor_slots WHERE vendor_id = $1',
      [vendor.id]
    )
    return rows
  }

  async createPickupSlot(userId, data) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const { rows } = await query(
      `INSERT INTO vendor_slots (vendor_id, day_of_week, start_time, end_time, max_orders, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, day_of_week, start_time, end_time, max_orders, is_active`,
      [vendor.id, data.day_of_week, data.start, data.end, data.max_orders || 5]
    )
    return rows[0]
  }

  async updatePickupSlot(userId, slotId, data) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const updates = []
    const params = []
    let idx = 1

    if (data.max_orders !== undefined) {
      updates.push(`max_orders = $${idx++}`)
      params.push(data.max_orders)
    }

    if (data.is_active !== undefined) {
      updates.push(`is_active = $${idx++}`)
      params.push(data.is_active)
    }

    if (updates.length === 0) return { success: true }

    params.push(vendor.id, slotId)
    const { rows } = await query(
      `UPDATE vendor_slots
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE vendor_id = $${idx} AND id = $${idx + 1}
       RETURNING id, day_of_week, start_time, end_time, max_orders, is_active`,
      params
    )
    return rows[0] || null
  }

  async deletePickupSlot(userId, slotId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    await query('DELETE FROM vendor_slots WHERE vendor_id = $1 AND id = $2', [vendor.id, slotId])
    return { success: true }
  }

  async createCapacityException(userId, data) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    const { rows } = await query(
      `INSERT INTO slot_exceptions (vendor_id, date, type, limit_count, reason)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (vendor_id, date)
       DO UPDATE SET type = $3, limit_count = $4, reason = $5, created_at = NOW()
       RETURNING id, date, type, limit_count, reason`,
      [vendor.id, data.date, data.type, data.limit || null, data.reason || null]
    )
    return rows[0]
  }

  async deleteCapacityException(userId, exceptionId) {
    const vendor = await this.repo.findByUserId(userId)
    if (!vendor) throw { statusCode: 404, message: 'Vendor profile not found' }

    await query('DELETE FROM slot_exceptions WHERE vendor_id = $1 AND id = $2', [vendor.id, exceptionId])
    return { success: true }
  }
}


