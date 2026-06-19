import slugify from 'slugify'
import { getClient } from '../../config/database.js'
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
}
