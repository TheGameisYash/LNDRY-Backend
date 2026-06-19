import { v4 as uuidv4 } from 'uuid'
import { redis } from '../../config/redis.js'
import { query } from '../../config/database.js'
import { success, error } from '../../utils/apiResponse.js'

export default async function quotesRoutes(fastify) {
  // POST /api/v1/quotes -> Generate quote
  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.authorize(['CUSTOMER'])],
    schema: {
      tags: ['Quotes'],
      summary: 'Create laundry quotation',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['vendor_id', 'service_id'],
        properties: {
          vendor_id: { type: 'string', format: 'uuid' },
          service_id: { type: 'string', format: 'uuid' },
          garment_lines: {
            type: 'array',
            items: {
              type: 'object',
              required: ['garment_type_id', 'quantity'],
              properties: {
                garment_type_id: { type: 'string', format: 'uuid' },
                quantity: { type: 'integer', minimum: 1 }
              }
            }
          },
          estimated_weight_kg: { type: 'number', minimum: 0.1 }
        }
      }
    }
  }, async (request, reply) => {
    const { vendor_id, service_id, garment_lines, estimated_weight_kg } = request.body

    // 1. Verify vendor
    const vendorRes = await query('SELECT id FROM vendors WHERE id = $1 AND is_active = true AND deleted_at IS NULL', [vendor_id])
    if (vendorRes.rows.length === 0) {
      return reply.code(404).send(error('Vendor not found or inactive', 'VENDOR_NOT_FOUND'))
    }

    let estimate_paise = 0
    const snapshot_lines = []

    // 2. Pricing calculation
    if (garment_lines && garment_lines.length > 0) {
      for (const line of garment_lines) {
        const rateRes = await query(
          `SELECT gr.id, gr.name, gr.unit,
                  COALESCE(vs.sale_price, vs.price, gr.sale_price, gr.price) AS price
             FROM garment_rates gr
             LEFT JOIN vendor_services vs ON vs.garment_rate_id = gr.id AND vs.vendor_id = $1
            WHERE gr.id = $2
              AND gr.category_id = $3
              AND gr.is_active = true
              AND (vs.id IS NULL OR (vs.is_available = true AND vs.deleted_at IS NULL))`,
          [vendor_id, line.garment_type_id, service_id]
        )

        if (rateRes.rows.length === 0) {
          return reply.code(400).send(error(`Garment type ${line.garment_type_id} is not offered by this vendor under the selected service.`, 'INVALID_GARMENT_TYPE'))
        }

        const rateRow = rateRes.rows[0]
        const rate_paise = Math.round(Number(rateRow.price) * 100)
        const line_total = rate_paise * line.quantity
        estimate_paise += line_total

        snapshot_lines.push({
          garment_type_id: rateRow.id,
          name: rateRow.name,
          unit: rateRow.unit,
          quantity: line.quantity,
          rate_paise,
          total_paise: line_total
        })
      }
    } else if (estimated_weight_kg) {
      // Find weight rate in category
      const rateRes = await query(
        `SELECT gr.id, gr.name, gr.unit,
                COALESCE(vs.sale_price, vs.price, gr.sale_price, gr.price) AS price
           FROM garment_rates gr
           LEFT JOIN vendor_services vs ON vs.garment_rate_id = gr.id AND vs.vendor_id = $1
          WHERE gr.category_id = $2
            AND gr.unit = 'kg'
            AND gr.is_active = true
            AND (vs.id IS NULL OR (vs.is_available = true AND vs.deleted_at IS NULL))
          LIMIT 1`,
        [vendor_id, service_id]
      )

      let rateRow = rateRes.rows[0]
      let rate_paise = 9900 // default fallback 99 rupees per kg
      let garment_rate_id = null
      let name = 'Weight Care'
      let unit = 'kg'

      if (rateRow) {
        rate_paise = Math.round(Number(rateRow.price) * 100)
        garment_rate_id = rateRow.id
        name = rateRow.name
        unit = rateRow.unit
      }

      const total = Math.round(rate_paise * estimated_weight_kg)
      estimate_paise = total

      snapshot_lines.push({
        garment_type_id,
        name,
        unit,
        quantity: 1,
        weight: estimated_weight_kg,
        rate_paise,
        total_paise: total
      })
    } else {
      return reply.code(400).send(error('Either garment_lines or estimated_weight_kg must be provided', 'INVALID_INPUT'))
    }

    const quote_id = uuidv4()
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 mins

    const quote = {
      quote_id,
      vendor_id,
      service_id,
      garment_lines: snapshot_lines,
      estimated_weight_kg: estimated_weight_kg || null,
      estimate_paise,
      expiry
    }

    // Save in Redis
    await redis.setex(`quote:${quote_id}`, 600, JSON.stringify(quote))

    return reply.code(201).send(success({
      quote_id,
      estimate_paise,
      expiry
    }, 'Quotation generated successfully'))
  })

  // PATCH /api/v1/quotes/:quoteId -> Update quote
  fastify.patch('/:quoteId', {
    preHandler: [fastify.authenticate, fastify.authorize(['CUSTOMER'])],
    schema: {
      tags: ['Quotes'],
      summary: 'Update quote garment quantities and recalculate price',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['quoteId'],
        properties: {
          quoteId: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        properties: {
          garment_lines: {
            type: 'array',
            items: {
              type: 'object',
              required: ['garment_type_id', 'quantity'],
              properties: {
                garment_type_id: { type: 'string', format: 'uuid' },
                quantity: { type: 'integer', minimum: 1 }
              }
            }
          },
          estimated_weight_kg: { type: 'number', minimum: 0.1 }
        }
      }
    }
  }, async (request, reply) => {
    const { quoteId } = request.params
    const { garment_lines, estimated_weight_kg } = request.body

    const cached = await redis.get(`quote:${quoteId}`)
    if (!cached) {
      return reply.code(404).send(error('Quotation not found or expired', 'QUOTE_NOT_FOUND'))
    }

    const quote = JSON.parse(cached)
    let estimate_paise = 0
    const snapshot_lines = []

    if (garment_lines && garment_lines.length > 0) {
      for (const line of garment_lines) {
        const rateRes = await query(
          `SELECT gr.id, gr.name, gr.unit,
                  COALESCE(vs.sale_price, vs.price, gr.sale_price, gr.price) AS price
             FROM garment_rates gr
             LEFT JOIN vendor_services vs ON vs.garment_rate_id = gr.id AND vs.vendor_id = $1
            WHERE gr.id = $2
              AND gr.category_id = $3
              AND gr.is_active = true
              AND (vs.id IS NULL OR (vs.is_available = true AND vs.deleted_at IS NULL))`,
          [quote.vendor_id, line.garment_type_id, quote.service_id]
        )

        if (rateRes.rows.length === 0) {
          return reply.code(400).send(error(`Garment type ${line.garment_type_id} is not offered by this vendor under the selected service.`, 'INVALID_GARMENT_TYPE'))
        }

        const rateRow = rateRes.rows[0]
        const rate_paise = Math.round(Number(rateRow.price) * 100)
        const line_total = rate_paise * line.quantity
        estimate_paise += line_total

        snapshot_lines.push({
          garment_type_id: rateRow.id,
          name: rateRow.name,
          unit: rateRow.unit,
          quantity: line.quantity,
          rate_paise,
          total_paise: line_total
        })
      }
      quote.garment_lines = snapshot_lines
      quote.estimated_weight_kg = null
    } else if (estimated_weight_kg) {
      const rateRes = await query(
        `SELECT gr.id, gr.name, gr.unit,
                COALESCE(vs.sale_price, vs.price, gr.sale_price, gr.price) AS price
           FROM garment_rates gr
           LEFT JOIN vendor_services vs ON vs.garment_rate_id = gr.id AND vs.vendor_id = $1
          WHERE gr.category_id = $2
            AND gr.unit = 'kg'
            AND gr.is_active = true
            AND (vs.id IS NULL OR (vs.is_available = true AND vs.deleted_at IS NULL))
          LIMIT 1`,
        [quote.vendor_id, quote.service_id]
      )

      let rateRow = rateRes.rows[0]
      let rate_paise = 9900
      let garment_rate_id = null
      let name = 'Weight Care'
      let unit = 'kg'

      if (rateRow) {
        rate_paise = Math.round(Number(rateRow.price) * 100)
        garment_rate_id = rateRow.id
        name = rateRow.name
        unit = rateRow.unit
      }

      const total = Math.round(rate_paise * estimated_weight_kg)
      estimate_paise = total

      snapshot_lines.push({
        garment_type_id,
        name,
        unit,
        quantity: 1,
        weight: estimated_weight_kg,
        rate_paise,
        total_paise: total
      })
      quote.garment_lines = snapshot_lines
      quote.estimated_weight_kg = estimated_weight_kg
    } else {
      return reply.code(400).send(error('Either garment_lines or estimated_weight_kg must be provided', 'INVALID_INPUT'))
    }

    quote.estimate_paise = estimate_paise
    quote.expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString() // reset TTL

    // Update Redis
    await redis.setex(`quote:${quoteId}`, 600, JSON.stringify(quote))

    return reply.code(200).send(success({
      quote_id: quoteId,
      estimate_paise,
      expiry: quote.expiry
    }, 'Quotation updated and recalculated successfully'))
  })
}
