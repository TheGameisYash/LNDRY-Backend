import { success, error } from '../../utils/apiResponse.js'

export class SlotsController {
  constructor(service) {
    this.service = service
  }

  async getAvailableSlots(request, reply) {
    const { vendorId, date } = request.query
    try {
      const slots = await this.service.getAvailableSlots(vendorId, date)
      return reply.send(success(slots, 'Available slots fetched'))
    } catch (err) {
      return reply.code(err.statusCode || 500).send(error(err.message || 'Failed to fetch slots'))
    }
  }

  async holdSlot(request, reply) {
    const { vendorId, slotId, date } = request.body
    try {
      const hold = await this.service.holdSlot(request.user.id, vendorId, slotId, date)
      return reply.code(201).send(success(hold, 'Slot held successfully'))
    } catch (err) {
      return reply.code(err.statusCode || 500).send(error(err.message || 'Failed to hold slot'))
    }
  }
}
