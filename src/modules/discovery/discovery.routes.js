import { query } from '../../config/database.js'
import { success, error } from '../../utils/apiResponse.js'
import { CategoriesRepository } from '../categories/categories.repository.js'
import { CategoriesService } from '../categories/categories.service.js'

export default async function discoveryRoutes(fastify) {
  const categoriesRepo = new CategoriesRepository()
  const categoriesService = new CategoriesService(categoriesRepo)

  // Best-effort JWT verification for tryAttachUser
  const tryAttachUser = async (request) => {
    if (typeof fastify.optionalAuth === 'function') {
      try {
        await fastify.optionalAuth(request)
      } catch {
        /* anonymous fallback */
      }
      return
    }
    try {
      await request.jwtVerify()
    } catch {
      /* anonymous fallback */
    }
  }

  // 1. GET /home -> Address-aware dashboard (Categories, nearby vendors, active order, history)
  fastify.get('/home', {
    preHandler: [tryAttachUser],
    schema: {
      tags: ['Discovery'],
      summary: 'Get discovery home dashboard data'
    }
  }, async (request, reply) => {
    const userId = request.user?.id
    let categories = await categoriesService.listAll()

    let defaultAddress = null
    let nearbyVendors = []
    let activeOrder = null
    let previousOrders = []

    if (userId) {
      // Find default address
      const addrRes = await query(
        `SELECT id, label, address_line1, city, lat, lng, pincode
         FROM addresses
         WHERE user_id = $1 AND is_default = true
         LIMIT 1`,
        [userId]
      )
      defaultAddress = addrRes.rows[0] || null

      // Active order
      const activeOrdRes = await query(
        `SELECT id, status, payable_amount_paise, created_at, pickup_date, processing_stage
         FROM orders
         WHERE user_id = $1
           AND status NOT IN ('DELIVERED', 'PAYMENT_FAILED', 'VENDOR_REJECTED', 'AUTO_REJECTED', 'CUSTOMER_CANCELLED', 'ADMIN_CANCELLED', 'REFUNDED')
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      )
      activeOrder = activeOrdRes.rows[0] || null

      // Previous orders
      const prevOrdRes = await query(
        `SELECT id, status, payable_amount_paise, created_at, pickup_date
         FROM orders
         WHERE user_id = $1 AND status = 'DELIVERED'
         ORDER BY created_at DESC
         LIMIT 5`,
        [userId]
      )
      previousOrders = prevOrdRes.rows

      if (defaultAddress && defaultAddress.lat && defaultAddress.lng) {
        // Query allocated/nearby vendors based on Haversine & default address coords
        const lat = parseFloat(defaultAddress.lat)
        const lng = parseFloat(defaultAddress.lng)
        const vendorsRes = await query(
          `SELECT v.id, v.name, v.slug, v.description, v.logo_url, v.banner_url,
                  v.address_line1, v.city, v.lat, v.lng, v.operating_hours,
                  (6371 * acos(
                    LEAST(1.0, GREATEST(-1.0,
                      cos(radians($1::float8)) * cos(radians(v.lat::float8))
                        * cos(radians(v.lng::float8) - radians($2::float8))
                        + sin(radians($1::float8)) * sin(radians(v.lat::float8))
                    ))
                  ))::numeric(7,2) AS distance_km,
                  v.delivery_radius_km,
                  COALESCE((SELECT AVG(vendor_rating) FROM reviews r WHERE r.vendor_id = v.id AND r.deleted_at IS NULL), 5.0)::numeric(2,1) AS rating
             FROM vendors v
            WHERE v.is_active = true
              AND v.status = 'APPROVED'
              AND v.deleted_at IS NULL
            ORDER BY distance_km ASC NULLS LAST
            LIMIT 10`,
          [lat, lng]
        )
        nearbyVendors = vendorsRes.rows
      }
    }

    if (nearbyVendors.length === 0) {
      // Fallback: list active approved vendors
      const fallbackRes = await query(
        `SELECT v.id, v.name, v.slug, v.description, v.logo_url, v.banner_url,
                v.address_line1, v.city, v.lat, v.lng, v.operating_hours,
                NULL::numeric(7,2) AS distance_km,
                v.delivery_radius_km,
                COALESCE((SELECT AVG(vendor_rating) FROM reviews r WHERE r.vendor_id = v.id AND r.deleted_at IS NULL), 5.0)::numeric(2,1) AS rating
           FROM vendors v
          WHERE v.is_active = true
            AND v.status = 'APPROVED'
            AND v.deleted_at IS NULL
          ORDER BY v.created_at DESC
          LIMIT 10`
      )
      nearbyVendors = fallbackRes.rows
    }

    return reply.code(200).send(success({
      categories,
      default_address: defaultAddress,
      nearby_vendors: nearbyVendors,
      active_order: activeOrder,
      previous_orders: previousOrders
    }, 'Discovery home data fetched'))
  })

  // 2. GET /vendors -> List eligible vendors inside user coordinates delivery radius
  fastify.get('/vendors', {
    preHandler: [tryAttachUser],
    schema: {
      tags: ['Discovery'],
      summary: 'Get eligible vendors nearby',
      querystring: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
          category_id: { type: 'string', format: 'uuid' },
          garment_type_id: { type: 'string', format: 'uuid' },
          date: { type: 'string' },
          slot: { type: 'string', format: 'uuid' },
          sort: { type: 'string', enum: ['nearest', 'price_asc', 'price_desc', 'best_rating', 'value_for_money'], default: 'nearest' },
          price: { type: 'integer' },
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 }
        }
      }
    }
  }, async (request, reply) => {
    const { lat, lng, category_id, garment_type_id, date, slot, sort, page = 1, limit = 20 } = request.query
    const offset = (page - 1) * limit

    const params = []
    let pIdx = 1
    let distanceSelect = 'NULL::numeric(7,2) AS distance_km'
    let distanceWhere = ''

    if (lat && lng) {
      params.push(lat, lng)
      distanceSelect = `(6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians($1::float8)) * cos(radians(v.lat::float8))
            * cos(radians(v.lng::float8) - radians($2::float8))
            + sin(radians($1::float8)) * sin(radians(v.lat::float8))
        ))
      ))::numeric(7,2) AS distance_km`
      distanceWhere = `AND (6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians($1::float8)) * cos(radians(v.lat::float8))
            * cos(radians(v.lng::float8) - radians($2::float8))
            + sin(radians($1::float8)) * sin(radians(v.lat::float8))
        ))
      )) <= v.delivery_radius_km`
      pIdx = 3
    }

    const conditions = [
      'v.is_active = true',
      "v.status = 'APPROVED'",
      'v.deleted_at IS NULL'
    ]

    if (distanceWhere) {
      conditions.push(distanceWhere.substring(4))
    }

    if (category_id) {
      conditions.push(`EXISTS (
        SELECT 1 FROM vendor_services vs
        JOIN garment_rates gr ON vs.garment_rate_id = gr.id
        WHERE vs.vendor_id = v.id
          AND gr.category_id = $${pIdx++}
          AND vs.is_available = true
          AND vs.deleted_at IS NULL
      )`)
      params.push(category_id)
    }

    if (garment_type_id) {
      conditions.push(`EXISTS (
        SELECT 1 FROM vendor_services vs
        WHERE vs.vendor_id = v.id
          AND vs.garment_rate_id = $${pIdx++}
          AND vs.is_available = true
          AND vs.deleted_at IS NULL
      )`)
      params.push(garment_type_id)
    }

    // Capacity check
    if (date && slot) {
      // Exclude vendor if holds/orders consume max capacity for this slot
      conditions.push(`(
        SELECT COUNT(*)::int
        FROM slot_holds sh
        WHERE sh.slot_id = $${pIdx}
          AND sh.booking_date = $${pIdx + 1}::date
          AND sh.expires_at > NOW()
      ) + (
        SELECT COUNT(*)::int
        FROM orders o
        WHERE o.vendor_slot_id = $${pIdx}
          AND o.pickup_date = $${pIdx + 1}::date
          AND o.status NOT IN ('PAYMENT_FAILED', 'VENDOR_REJECTED', 'AUTO_REJECTED', 'CUSTOMER_CANCELLED', 'ADMIN_CANCELLED', 'REFUNDED')
      ) < (
        SELECT max_orders FROM vendor_slots WHERE id = $${pIdx}
      )`)
      params.push(slot, date)
      pIdx += 2
    }

    let orderByClause = 'ORDER BY v.created_at DESC'
    if (sort === 'nearest' && lat && lng) {
      orderByClause = 'ORDER BY distance_km ASC'
    } else if (sort === 'best_rating') {
      orderByClause = 'ORDER BY rating DESC'
    } else if (sort === 'price_asc') {
      orderByClause = `ORDER BY (
        SELECT MIN(price) FROM vendor_services vs
        WHERE vs.vendor_id = v.id AND vs.is_available = true AND vs.deleted_at IS NULL
      ) ASC NULLS LAST`
    } else if (sort === 'price_desc') {
      orderByClause = `ORDER BY (
        SELECT MIN(price) FROM vendor_services vs
        WHERE vs.vendor_id = v.id AND vs.is_available = true AND vs.deleted_at IS NULL
      ) DESC NULLS LAST`
    } else if (sort === 'value_for_money') {
      orderByClause = 'ORDER BY rating DESC, distance_km ASC NULLS LAST'
    }

    const whereClause = conditions.join(' AND ')
    const listQuery = `
      SELECT v.id, v.name, v.slug, v.description, v.logo_url, v.banner_url,
             v.address_line1, v.city, v.lat, v.lng, v.operating_hours,
             v.delivery_radius_km,
             ${distanceSelect},
             COALESCE((SELECT AVG(vendor_rating) FROM reviews r WHERE r.vendor_id = v.id AND r.deleted_at IS NULL), 5.0)::numeric(2,1) AS rating
      FROM vendors v
      WHERE ${whereClause}
      ${orderByClause}
      LIMIT $${pIdx} OFFSET $${pIdx + 1}
    `
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM vendors v
      WHERE ${whereClause}
    `

    const [listRes, countRes] = await Promise.all([
      query(listQuery, [...params, limit, offset]),
      query(countQuery, params)
    ])

    const total = countRes.rows[0]?.total || 0
    const totalPages = Math.ceil(total / limit)

    return reply.code(200).send(success(listRes.rows, 'Vendors fetched successfully', {
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }))
  })

  // 3. GET /vendors/:vendorId -> Public vendor profile
  fastify.get('/vendors/:vendorId', {
    schema: {
      tags: ['Discovery'],
      summary: 'Get vendor public profile details',
      params: {
        type: 'object',
        required: ['vendorId'],
        properties: {
          vendorId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    const { vendorId } = request.params
    const vendorRes = await query(
      `SELECT v.id, v.name, v.slug, v.description, v.logo_url, v.banner_url,
              v.address_line1, v.city, v.lat, v.lng, v.operating_hours, v.delivery_radius_km,
              COALESCE((SELECT AVG(vendor_rating) FROM reviews r WHERE r.vendor_id = v.id AND r.deleted_at IS NULL), 5.0)::numeric(2,1) AS rating
       FROM vendors v
       WHERE v.id = $1 AND v.is_active = true AND v.deleted_at IS NULL`,
      [vendorId]
    )

    const vendor = vendorRes.rows[0]
    if (!vendor) {
      return reply.code(404).send(error('Vendor profile not found', 'VENDOR_NOT_FOUND'))
    }

    // Get services offered
    const servicesRes = await query(
      `SELECT vs.id AS service_id, vs.price, vs.sale_price,
              gr.id AS garment_rate_id, gr.name AS garment_name, gr.description, gr.unit, gr.thumbnail_url,
              c.name AS category_name, c.id AS category_id
         FROM vendor_services vs
         JOIN garment_rates gr ON vs.garment_rate_id = gr.id
         LEFT JOIN categories c ON gr.category_id = c.id
        WHERE vs.vendor_id = $1
          AND vs.is_available = true
          AND vs.deleted_at IS NULL
          AND gr.is_active = true`,
      [vendorId]
    )

    // Format output
    const profile = {
      ...vendor,
      images: [vendor.logo_url, vendor.banner_url].filter(Boolean),
      policies: {
        minimum_order_value_paise: 15000,
        cancellation_policy: 'Free cancellation within 5 minutes of slot booking.'
      },
      services: servicesRes.rows
    }

    return reply.code(200).send(success(profile, 'Vendor profile fetched'))
  })

  // 4. GET /vendors/:vendorId/services -> Filtered list of services
  fastify.get('/vendors/:vendorId/services', {
    schema: {
      tags: ['Discovery'],
      summary: 'Get services offered by vendor',
      params: {
        type: 'object',
        required: ['vendorId'],
        properties: {
          vendorId: { type: 'string', format: 'uuid' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          category_id: { type: 'string', format: 'uuid' },
          garment_type_id: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    const { vendorId } = request.params
    const { category_id, garment_type_id } = request.query

    const params = [vendorId]
    let cond = ''
    let pIdx = 2

    if (category_id) {
      cond += ` AND gr.category_id = $${pIdx++}`
      params.push(category_id)
    }

    if (garment_type_id) {
      cond += ` AND vs.garment_rate_id = $${pIdx++}`
      params.push(garment_type_id)
    }

    const servicesRes = await query(
      `SELECT vs.id AS service_id, vs.price, vs.sale_price,
              gr.id AS garment_rate_id, gr.name AS garment_name, gr.description, gr.unit, gr.thumbnail_url,
              c.name AS category_name, c.id AS category_id
         FROM vendor_services vs
         JOIN garment_rates gr ON vs.garment_rate_id = gr.id
         LEFT JOIN categories c ON gr.category_id = c.id
        WHERE vs.vendor_id = $1
          AND vs.is_available = true
          AND vs.deleted_at IS NULL
          AND gr.is_active = true
          ${cond}`,
      params
    )

    return reply.code(200).send(success(servicesRes.rows, 'Vendor services fetched'))
  })

  // 5. GET /services/:serviceId -> Service details
  fastify.get('/services/:serviceId', {
    schema: {
      tags: ['Discovery'],
      summary: 'Get service details',
      params: {
        type: 'object',
        required: ['serviceId'],
        properties: {
          serviceId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    const { serviceId } = request.params
    const serviceRes = await query(
      `SELECT vs.id AS service_id, vs.price, vs.sale_price, vs.max_order_qty,
              gr.id AS garment_rate_id, gr.name AS garment_name, gr.description, gr.unit, gr.thumbnail_url,
              c.name AS category_name, c.id AS category_id,
              v.name AS vendor_name, v.id AS vendor_id
         FROM vendor_services vs
         JOIN garment_rates gr ON vs.garment_rate_id = gr.id
         LEFT JOIN categories c ON gr.category_id = c.id
         JOIN vendors v ON vs.vendor_id = v.id
        WHERE vs.id = $1
          AND vs.deleted_at IS NULL`,
      [serviceId]
    )

    const service = serviceRes.rows[0]
    if (!service) {
      return reply.code(404).send(error('Service not found', 'SERVICE_NOT_FOUND'))
    }

    // Load slot summary
    const slotsRes = await query(
      `SELECT id, day_of_week, start_time, end_time, max_orders
       FROM vendor_slots
       WHERE vendor_id = $1 AND is_active = true
       ORDER BY day_of_week ASC, start_time ASC`,
      [service.vendor_id]
    )

    const details = {
      ...service,
      inclusions: ['Premium Detergent Wash', 'Steam Ironing', 'Hygiene Disinfectant Spray'],
      exclusions: ['Heavy Grease Stain Removal (Extra charges may apply)', 'Torn Garment Repair'],
      min_quantity: 1,
      max_quantity: service.max_order_qty || 50,
      slots_summary: slotsRes.rows
    }

    return reply.code(200).send(success(details, 'Service details fetched'))
  })

  // 6. GET /search -> Unified search
  fastify.get('/search', {
    schema: {
      tags: ['Discovery'],
      summary: 'Unified search categories, garment types, and vendors',
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 1 },
          lat: { type: 'number' },
          lng: { type: 'number' }
        }
      }
    }
  }, async (request, reply) => {
    const { q, lat, lng } = request.query
    const likeVal = `%${q}%`

    // Search Categories
    const catsRes = await query(
      `SELECT id, name, slug, description, image_url
       FROM categories
       WHERE name ILIKE $1 AND is_active = true
       ORDER BY name ASC`,
      [likeVal]
    )

    // Search Garment Rates (garment types)
    const grRes = await query(
      `SELECT id, name, slug, description, price, unit
       FROM garment_rates
       WHERE name ILIKE $1 AND is_active = true
       ORDER BY name ASC`,
      [likeVal]
    )

    // Search Vendors (filtered by Haversine if coords present)
    let distSelect = 'NULL::numeric(7,2) AS distance_km'
    let distWhere = ''
    const params = [likeVal]

    if (lat && lng) {
      params.push(lat, lng)
      distSelect = `(6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians($2::float8)) * cos(radians(v.lat::float8))
            * cos(radians(v.lng::float8) - radians($3::float8))
            + sin(radians($2::float8)) * sin(radians(v.lat::float8))
        ))
      ))::numeric(7,2) AS distance_km`
      distWhere = `AND (6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians($2::float8)) * cos(radians(v.lat::float8))
            * cos(radians(v.lng::float8) - radians($3::float8))
            + sin(radians($2::float8)) * sin(radians(v.lat::float8))
        ))
      )) <= v.delivery_radius_km`
    }

    const vendorsRes = await query(
      `SELECT v.id, v.name, v.slug, v.description, v.logo_url, v.banner_url,
              v.address_line1, v.city, v.lat, v.lng,
              ${distSelect},
              COALESCE((SELECT AVG(vendor_rating) FROM reviews r WHERE r.vendor_id = v.id AND r.deleted_at IS NULL), 5.0)::numeric(2,1) AS rating
         FROM vendors v
        WHERE v.name ILIKE $1
          AND v.is_active = true
          AND v.status = 'APPROVED'
          AND v.deleted_at IS NULL
          ${distWhere}
        ORDER BY distance_km ASC NULLS LAST`,
      params
    )

    return reply.code(200).send(success({
      categories: catsRes.rows,
      garment_types: grRes.rows,
      vendors: vendorsRes.rows
    }, 'Search results fetched'))
  })

  // 7. GET /search/suggestions -> Suggestion autocomplete
  fastify.get('/search/suggestions', {
    schema: {
      tags: ['Discovery'],
      summary: 'Search autocomplete suggestions',
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 1 }
        }
      }
    }
  }, async (request, reply) => {
    const { q } = request.query
    const likeVal = `%${q}%`

    // Limit suggestions to 5 items of each type
    const [cats, grs, vens] = await Promise.all([
      query(`SELECT name FROM categories WHERE name ILIKE $1 AND is_active = true LIMIT 5`, [likeVal]),
      query(`SELECT name FROM garment_rates WHERE name ILIKE $1 AND is_active = true LIMIT 5`, [likeVal]),
      query(`SELECT name FROM vendors WHERE name ILIKE $1 AND is_active = true AND status = 'APPROVED' AND deleted_at IS NULL LIMIT 5`, [likeVal])
    ])

    const suggestions = []
    cats.rows.forEach(r => suggestions.push({ type: 'category', text: r.name }))
    grs.rows.forEach(r => suggestions.push({ type: 'garment_type', text: r.name }))
    vens.rows.forEach(r => suggestions.push({ type: 'vendor', text: r.name }))

    return reply.code(200).send(success(suggestions, 'Suggestions fetched'))
  })

  // 8. GET /filters -> Get filter metadata for discovery
  fastify.get('/filters', {
    schema: {
      tags: ['Discovery'],
      summary: 'Get sorting and filter options'
    }
  }, async (request, reply) => {
    const typesRes = await query(`SELECT id, name FROM garment_rates WHERE is_active = true ORDER BY name ASC`)
    const filters = {
      sort_options: [
        { label: 'Nearest', value: 'nearest' },
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Best Rating', value: 'best_rating' },
        { label: 'Value for Money', value: 'value_for_money' }
      ],
      garment_types: typesRes.rows
    }
    return reply.code(200).send(success(filters, 'Filters fetched'))
  })

  // 9. POST /value-score -> Value-score ranker algorithm
  fastify.post('/value-score', {
    schema: {
      tags: ['Discovery'],
      summary: 'Rank vendors using value score algorithm',
      body: {
        type: 'object',
        required: ['vendors'],
        properties: {
          vendors: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'rating', 'distance_km', 'average_price_paise'],
              properties: {
                id: { type: 'string', format: 'uuid' },
                rating: { type: 'number' },
                distance_km: { type: 'number' },
                average_price_paise: { type: 'integer' },
                completion_rate: { type: 'number', default: 1.0 }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { vendors } = request.body

    const ranked = vendors.map(v => {
      // value score formula
      const ratingWeight = v.rating * 20.0
      const distancePenalty = v.distance_km * 2.0
      const pricePenalty = v.average_price_paise / 100.0 // penalize higher price
      const completionBonus = (v.completion_rate || 1.0) * 10.0

      const valueScore = ratingWeight - distancePenalty - pricePenalty + completionBonus

      return {
        ...v,
        value_score: Math.round(valueScore * 100) / 100
      }
    }).sort((a, b) => b.value_score - a.value_score)

    return reply.code(200).send(success(ranked, 'Vendors ranked by value score'))
  })
}
