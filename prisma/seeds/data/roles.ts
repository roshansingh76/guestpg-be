export const roles = [
  {
    name: 'super_admin',
    displayName: 'Super Admin',
    description: 'Full access to all administration and management features.',
    permissions: [
      'manage_users',
      'manage_pgs',
      'manage_tenants',
      'manage_billing',
      'manage_expenses',
      'manage_settings'
    ],
    isActive: 1,
    isSystem: true
  },
  {
    name: 'pg_owner',
    displayName: 'PG Owner',
    description: 'Owner-level access for managing a specific PG location.',
    permissions: [
      'manage_pgs',
      'manage_tenants',
      'manage_billing',
      'manage_expenses'
    ],
    isActive: 1,
    isSystem: true
  },
  {
    name: 'pg_staff',
    displayName: 'PG Staff',
    description: 'Staff access for daily PG operations and tenant support.',
    permissions: [
      'manage_tenants',
      'manage_billing',
      'manage_expenses'
    ],
    isActive: 1,
    isSystem: true
  }
]
