import { prisma } from '../db/prisma'

// All valid permissions in the system
export const ALL_PERMISSIONS = [
  // Users
  'users:read',
  'users:write',
  'users:delete',
  // PGs
  'pgs:read',
  'pgs:write',
  'pgs:delete',
  // Tenants
  'tenants:read',
  'tenants:write',
  'tenants:delete',
  // Billing
  'billing:read',
  'billing:write',
  // Expenses
  'expenses:read',
  'expenses:write',
  'expenses:delete',
  // Cities & Areas
  'cities:read',
  'cities:write',
  'areas:read',
  'areas:write',
  // Roles (admin-only)
  'roles:read',
  'roles:write',
] as const

export type Permission = (typeof ALL_PERMISSIONS)[number]

export interface CreateRoleInput {
  name: string
  displayName: string
  description?: string
  permissions: string[]
  status?: 'active' | 'inactive'
}

export interface UpdateRoleInput {
  displayName?: string
  description?: string
  permissions?: string[]
  status?: 'active' | 'inactive'
}

export interface RoleFilters {
  status?: string
  search?: string
}

export interface PaginationOptions {
  page?: number
  limit?: number
}

export class RoleService {
  // ─── Create ─────────────────────────────────────────────────────────────────

  static async createRole(data: CreateRoleInput) {
    return prisma.roleDefinition.create({
      data: {
        name: data.name.toLowerCase().trim(),
        displayName: data.displayName.trim(),
        description: data.description?.trim(),
        permissions: data.permissions,
        status: data.status ?? 'active',
        isSystem: false,
      },
    })
  }

  // ─── Read: list all with filters + pagination ────────────────────────────────

  static async getAllRoles(filters?: RoleFilters, pagination?: PaginationOptions) {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { displayName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [roles, total] = await Promise.all([
      prisma.roleDefinition.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
      }),
      prisma.roleDefinition.count({ where }),
    ])

    return {
      data: roles,
      pagination: {
        page,
        limit,
        totalCount: total,
      },
    }
  }

  // ─── Read: single by ID ──────────────────────────────────────────────────────

  static async getRoleById(id: number) {
    return prisma.roleDefinition.findUnique({ where: { id } })
  }

  // ─── Read: single by name ────────────────────────────────────────────────────

  static async getRoleByName(name: string) {
    return prisma.roleDefinition.findUnique({
      where: { name: name.toLowerCase().trim() },
    })
  }

  // ─── Update ──────────────────────────────────────────────────────────────────

  static async updateRole(id: number, data: UpdateRoleInput) {
    // Prevent mutating system roles' permissions/status if desired
    const existing = await prisma.roleDefinition.findUnique({ where: { id } })
    if (!existing) return null

    const updateData: any = {}
    if (data.displayName !== undefined) updateData.displayName = data.displayName.trim()
    if (data.description !== undefined) updateData.description = data.description?.trim() ?? null
    if (data.permissions !== undefined) updateData.permissions = data.permissions
    if (data.status !== undefined) updateData.status = data.status

    return prisma.roleDefinition.update({ where: { id }, data: updateData })
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────

  static async deleteRole(id: number) {
    const existing = await prisma.roleDefinition.findUnique({ where: { id } })
    if (!existing) return null
    if (existing.isSystem) {
      throw new Error('System roles cannot be deleted')
    }
    return prisma.roleDefinition.delete({ where: { id } })
  }

  // ─── Seed default system roles ───────────────────────────────────────────────

  static async seedSystemRoles() {
    const systemRoles = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Full access to everything in the system',
        permissions: [...ALL_PERMISSIONS],
        isSystem: true,
      },
      {
        name: 'admin',
        displayName: 'Admin',
        description: 'Administrative access, can manage users, PGs, billing and configuration',
        permissions: ALL_PERMISSIONS.filter((p) => p !== 'roles:write'),
        isSystem: true,
      },
      {
        name: 'pg_owner',
        displayName: 'PG Owner',
        description: 'Manages their own PG properties, tenants and billing',
        permissions: [
          'pgs:read',
          'pgs:write',
          'tenants:read',
          'tenants:write',
          'billing:read',
          'billing:write',
          'expenses:read',
          'expenses:write',
        ],
        isSystem: true,
      },
      {
        name: 'pg_staff',
        displayName: 'PG Staff',
        description: 'Day-to-day operations for a PG — view tenants and raise bills',
        permissions: [
          'pgs:read',
          'tenants:read',
          'tenants:write',
          'billing:read',
          'billing:write',
          'expenses:read',
        ],
        isSystem: true,
      },
    ]

    for (const role of systemRoles) {
      await prisma.roleDefinition.upsert({
        where: { name: role.name },
        update: {
          displayName: role.displayName,
          description: role.description,
          permissions: role.permissions as string[],
        },
        create: {
          ...role,
          permissions: role.permissions as string[],
          status: 'active',
        },
      })
    }

    return prisma.roleDefinition.findMany({ where: { isSystem: true } })
  }

  // ─── Stats ───────────────────────────────────────────────────────────────────

  static async getRoleStats() {
    const [total, active, inactive, system, custom] = await Promise.all([
      prisma.roleDefinition.count(),
      prisma.roleDefinition.count({ where: { status: 'active' } }),
      prisma.roleDefinition.count({ where: { status: 'inactive' } }),
      prisma.roleDefinition.count({ where: { isSystem: true } }),
      prisma.roleDefinition.count({ where: { isSystem: false } }),
    ])
    return { total, active, inactive, system, custom }
  }
}
