import { SlotsController } from './slots.controller.js'
import { SlotsService } from './slots.service.js'

export default async function slotRoutes(fastify) {
  const service = new SlotsService()
  const controller = new SlotsController(service)

  fastify.get('/available', {
    schema: {
      tags: ['Slots'],
      summary: 'Get available pickup slots for a vendor on a specific date',
      querystring: {
        type: 'object',
        required: ['vendorId', 'date'],
        properties: {
          vendorId: { type: 'string', format: 'uuid' },
          date: { type: 'string', format: 'date' } // YYYY-MM-DD
        }
      }
    }
  }, controller.getAvailableSlots.bind(controller))

  fastify.post('/hold', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['Slots'],
      summary: 'Create a 10-minute hold on a pickup slot',
      body: {
        type: 'object',
        required: ['vendorId', 'slotId', 'date'],
        properties: {
          vendorId: { type: 'string', format: 'uuid' },
          slotId: { type: 'string', format: 'uuid' },
          date: { type: 'string', format: 'date' }
        }
      }
    }
  }, controller.holdSlot.bind(controller))
}
