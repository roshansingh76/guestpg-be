// Keep in sync with ALL_PERMISSIONS in src/services/role.service.ts
const ALL_PERMISSIONS = [
  'users:read',
  'users:write',
  'users:delete',
  'pgs:read',
  'pgs:write',
  'pgs:delete',
  'tenants:read',
  'tenants:write',
  'tenants:delete',
  'billing:read',
  'billing:write',
  'expenses:read',
  'expenses:write',
  'expenses:delete',
  'cities:read',
  'cities:write',
  'areas:read',
  'areas:write',
  'roles:read',
  'roles:write'
]

export const roles = [
  {
    name: 'super_admin',
    displayName: 'Super Admin',
    description: 'Full access to all administration and management features.',
    permissions: [...ALL_PERMISSIONS],
    isActive: 1,
    isSystem: true
  },
  {
    name: 'staff',
    displayName: 'Staff',
    description: 'Sub-admin with full operational access — manages users, PGs, billing and configuration, but cannot manage roles.',
    permissions: ALL_PERMISSIONS.filter((p) => p !== 'roles:write'),
    isActive: 1,
    isSystem: true
  },
  {
    name: 'pg_owner',
    displayName: 'PG Owner',
    description: 'Owner-level access for managing a specific PG location.',
    permissions: [
      'pgs:read',
      'pgs:write',
      'tenants:read',
      'tenants:write',
      'billing:read',
      'billing:write',
      'expenses:read',
      'expenses:write'
    ],
    isActive: 1,
    isSystem: true
  },
  {
    name: 'pg_staff',
    displayName: 'PG Staff',
    description: 'Staff access for daily PG operations and tenant support.',
    permissions: [
      'pgs:read',
      'tenants:read',
      'tenants:write',
      'billing:read',
      'billing:write',
      'expenses:read'
    ],
    isActive: 1,
    isSystem: true
  }
]
