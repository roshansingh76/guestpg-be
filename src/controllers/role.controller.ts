import { Request, Response } from 'express'
import { z } from 'zod'
import { RoleService, ALL_PERMISSIONS } from '../services/role.service'
import { logger } from '../utils/logger'
import {
  sendBadRequest,
  sendCreated,
  sendError,
  sendNotFound,
  sendSuccess,
  sendList,
  sendConflict,
} from '../utils/response'

// ─── Validation Schemas ──────────────────────────────────────────────────────

const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must be at most 50 characters')
    .regex(/^[a-z0-9_]+$/, 'Role name must be lowercase letters, numbers and underscores only'),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  permissions: z
    .array(z.string())
    .min(1, 'At least one permission is required')
    .refine(
      (perms: string[]) => perms.every((p: string) => (ALL_PERMISSIONS as readonly string[]).includes(p)),
      {
        message: 'One or more permissions are invalid. Check GET /api/roles/permissions for the full list.',
      }
    ),
  status: z.enum(['active', 'inactive']).optional(),
})

const updateRoleSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100)
    .optional(),
  description: z.string().max(500).optional(),
  permissions: z
    .array(z.string())
    .min(1, 'At least one permission is required')
    .refine(
      (perms: string[]) => perms.every((p: string) => (ALL_PERMISSIONS as readonly string[]).includes(p)),
      {
        message: 'One or more permissions are invalid. Check GET /api/roles/permissions for the full list.',
      }
    )
    .optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// ─── Handlers ────────────────────────────────────────────────────────────────

/**
 * POST /api/roles
 * Create a new custom role (admin only)
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const parsed = createRoleSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendBadRequest(res, 'Validation failed', parsed.error.issues as any)
    }

    const { name, displayName, description, permissions, status } = parsed.data

    // Check for duplicate name
    const existing = await RoleService.getRoleByName(name)
    if (existing) {
      return sendConflict(res, `Role with name "${name}" already exists`)
    }

    const role = await RoleService.createRole({
      name,
      displayName,
      description,
      permissions,
      status,
    })

    logger.info('Role created', { roleId: role.id, name: role.name, by: (req as any).auth?.sub })
    return sendCreated(res, role)
  } catch (error: any) {
    logger.error('Create role failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'Role name already exists')
    }
    return sendError(res, error?.message || 'Error creating role')
  }
}

/**
 * GET /api/roles
 * List all roles with optional filters and pagination (admin only)
 */
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const { status, search, skip = 0, limit = 10 } = req.query

    const parsedLimit = Math.min(Number(limit) || 10, 100)
    const parsedSkip = Number(skip) || 0
    const page = Math.floor(parsedSkip / parsedLimit) + 1

    const result = await RoleService.getAllRoles(
      {
        status: status as string | undefined,
        search: search as string | undefined,
      },
      { page, limit: parsedLimit }
    )

    return sendList(res, result.data, {
      skip: parsedSkip,
      count: result.data.length,
      totalCount: result.pagination.totalCount,
    })
  } catch (error: any) {
    logger.error('Get all roles failed', { error })
    return sendError(res, error?.message || 'Error fetching roles')
  }
}

/**
 * GET /api/roles/permissions
 * Return the full list of available permissions (admin only)
 */
export const getPermissions = async (_req: Request, res: Response) => {
  try {
    // Group permissions by resource for better UX
    const grouped: Record<string, string[]> = {}
    for (const perm of ALL_PERMISSIONS) {
      const [resource] = perm.split(':')
      if (!grouped[resource]) grouped[resource] = []
      grouped[resource].push(perm)
    }

    return sendSuccess(res, {
      permissions: ALL_PERMISSIONS,
      grouped,
    })
  } catch (error: any) {
    logger.error('Get permissions failed', { error })
    return sendError(res, error?.message || 'Error fetching permissions')
  }
}

/**
 * GET /api/roles/stats
 * Role statistics (admin only)
 */
export const getRoleStats = async (_req: Request, res: Response) => {
  try {
    const stats = await RoleService.getRoleStats()
    return sendSuccess(res, stats)
  } catch (error: any) {
    logger.error('Get role stats failed', { error })
    return sendError(res, error?.message || 'Error fetching role stats')
  }
}

/**
 * GET /api/roles/:id
 * Get a single role by ID (admin only)
 */
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return sendBadRequest(res, 'Invalid role ID')

    const role = await RoleService.getRoleById(id)
    if (!role) return sendNotFound(res, 'Role not found')

    return sendSuccess(res, role)
  } catch (error: any) {
    logger.error('Get role by id failed', { error })
    return sendError(res, error?.message || 'Error fetching role')
  }
}

/**
 * PUT /api/roles/:id
 * Update a role (admin only)
 * System roles: can update displayName, description, permissions
 * Custom roles: full update
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return sendBadRequest(res, 'Invalid role ID')

    const parsed = updateRoleSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendBadRequest(res, 'Validation failed', parsed.error.issues as any)
    }

    if (Object.keys(parsed.data).length === 0) {
      return sendBadRequest(res, 'No fields provided for update')
    }

    const role = await RoleService.updateRole(id, parsed.data)
    if (!role) return sendNotFound(res, 'Role not found')

    logger.info('Role updated', { roleId: id, by: (req as any).auth?.sub })
    return sendSuccess(res, role)
  } catch (error: any) {
    logger.error('Update role failed', { error })
    return sendError(res, error?.message || 'Error updating role')
  }
}

/**
 * DELETE /api/roles/:id
 * Delete a custom role (admin only — system roles are protected)
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return sendBadRequest(res, 'Invalid role ID')

    const role = await RoleService.deleteRole(id)
    if (!role) return sendNotFound(res, 'Role not found')

    logger.info('Role deleted', { roleId: id, by: (req as any).auth?.sub })
    return sendSuccess(res, { message: 'Role deleted successfully' })
  } catch (error: any) {
    logger.error('Delete role failed', { error })
    if (error.message === 'System roles cannot be deleted') {
      return sendBadRequest(res, 'System roles cannot be deleted')
    }
    return sendError(res, error?.message || 'Error deleting role')
  }
}

/**
 * PATCH /api/roles/:id/status
 * Toggle role active/inactive (admin only)
 */
export const changeRoleStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return sendBadRequest(res, 'Invalid role ID')

    const { status } = req.body
    if (!['active', 'inactive'].includes(status)) {
      return sendBadRequest(res, 'Status must be "active" or "inactive"')
    }

    const role = await RoleService.updateRole(id, { status })
    if (!role) return sendNotFound(res, 'Role not found')

    logger.info('Role status changed', { roleId: id, status, by: (req as any).auth?.sub })
    return sendSuccess(res, role)
  } catch (error: any) {
    logger.error('Change role status failed', { error })
    return sendError(res, error?.message || 'Error updating role status')
  }
}

/**
 * POST /api/roles/seed
 * Seed default system roles — idempotent, safe to call multiple times (super_admin only)
 */
export const seedSystemRoles = async (req: Request, res: Response) => {
  try {
    const roles = await RoleService.seedSystemRoles()
    logger.info('System roles seeded', { count: roles.length, by: (req as any).auth?.sub })
    return sendSuccess(res, {
      message: `${roles.length} system roles seeded successfully`,
      roles,
    })
  } catch (error: any) {
    logger.error('Seed system roles failed', { error })
    return sendError(res, error?.message || 'Error seeding system roles')
  }
}
