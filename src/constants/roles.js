export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  RIDER: 'RIDER',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
  VENDOR_OWNER: 'VENDOR_OWNER',
  VENDOR_STAFF: 'VENDOR_STAFF',
  VENDOR_EMPLOYEE: 'VENDOR_EMPLOYEE',
  ADMIN: 'ADMIN',
}

export const ALL_ROLES = Object.values(ROLES)

/** Roles allowed to access delivery / rider endpoints */
export const RIDER_ROLES = [ROLES.RIDER, ROLES.DELIVERY_PARTNER]

/** Roles that operate within a vendor context (require vendor_id scope) */
export const VENDOR_ROLES = [ROLES.VENDOR_OWNER, ROLES.VENDOR_STAFF, ROLES.VENDOR_EMPLOYEE]
