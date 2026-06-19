import { success, error } from '../../utils/apiResponse.js'

export class VendorsController {
  constructor(service) {
    this.service = service
  }

  async apply(request, reply) {
    try {
      const vendor = await this.service.apply(request.user.id, request.body)
      return reply.code(201).send(success(vendor, 'Application submitted successfully'))
    } catch (err) {
      return reply.code(err.statusCode || 500).send(error(err.message || 'Onboarding failed'))
    }
  }

  async getProfile(request, reply) {
    try {
      const profile = await this.service.getProfile(request.user.id)
      if (!profile) {
        return reply.code(404).send(error('Vendor profile not found', 'NOT_FOUND'))
      }
      return reply.send(success(profile, 'Vendor profile fetched'))
    } catch (err) {
      return reply.code(err.statusCode || 500).send(error(err.message || 'Failed to load profile'))
    }
  }

  async updateProfile(request, reply) {
    try {
      const profile = await this.service.updateProfile(request.user.id, request.body)
      return reply.send(success(profile, 'Vendor profile updated'))
    } catch (err) {
      return reply.code(err.statusCode || 500).send(error(err.message || 'Update failed'))
    }
  }

  async uploadDocument(request, reply) {
    const { documentType, fileUrl } = request.body
    try {
      const doc = await this.service.uploadDocument(request.user.id, documentType, fileUrl)
      return reply.code(201).send(success(doc, 'Document uploaded successfully'))
    } catch (err) {
      return reply.code(err.statusCode || 500).send(error(err.message || 'Upload failed'))
    }
  }

  async adminList(request, reply) {
    try {
      const { vendors, total } = await this.service.adminList(request.query)
      return reply.send(success(vendors, 'Vendors list fetched', { total }))
    } catch (err) {
      return reply.code(err.statusCode || 500).send(error(err.message || 'Failed to list vendors'))
    }
  }

  async adminGetDetails(request, reply) {
    try {
      const details = await this.service.adminGetDetails(request.params.id)
      if (!details) {
        return reply.code(404).send(error('Vendor not found', 'NOT_FOUND'))
      }

      // Mask private file URLs with preview proxy URLs for admins
      if (details.documents && Array.isArray(details.documents)) {
        details.documents = details.documents.map(doc => ({
          ...doc,
          file_url: `/api/v1/vendors/admin/documents/${doc.id}/preview`
        }))
      }

      return reply.send(success(details, 'Vendor details fetched'))
    } catch (err) {
      return reply.code(err.statusCode || 500).send(error(err.message || 'Failed to get vendor details'))
    }
  }

  async adminReview(request, reply) {
    try {
      const vendor = await this.service.adminReview(request.params.id, request.body)
      return reply.send(success(vendor, 'Vendor application status updated'))
    } catch (err) {
      return reply.code(err.statusCode || 500).send(error(err.message || 'Review action failed'))
    }
  }

  async previewKycDocument(request, reply) {
    const { documentId } = request.params
    try {
      const { buffer, contentType } = await this.service.previewKycDocument(documentId, request.user)
      return reply
        .code(200)
        .header('Content-Type', contentType)
        .send(buffer)
    } catch (err) {
      return reply.code(err.statusCode || 500).send(error(err.message || 'Failed to preview KYC document'))
    }
  }
}
