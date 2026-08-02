import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { RoleService } from '../services/role.service'
import { logger } from '../utils/logger'
import { hasPGAccess } from '../middleware/auth'
import type { AuthPayload } from '../middleware/auth'
import {
  sendBadRequest,
  sendCreated,
  sendError,
  sendNotFound,
  sendSuccess,
  sendList,
  sendConflict,
} from '../utils/response'

export const createUser = async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth as AuthPayload
    const { name, email, phone, password, role, pgId, status } = req.body

    // Accept numeric role id (preferred). If a string role name is sent, allow it too.
    if (!name || !email || !phone || !password || role === undefined || role === null) {
      return sendBadRequest(res, 'Missing required fields')
    }

    if (String(password).length < 6) {
      return sendBadRequest(res, 'Password must be at least 6 characters')
    }

    // Normalize role input: if numeric -> treat as roleId, else treat as role name
    let roleRecord: any = null
    if (!isNaN(Number(role))) {
      roleRecord = await RoleService.getRoleById(Number(role))
    } else {
      roleRecord = await RoleService.getRoleByName(String(role))
    }

    if (!roleRecord) {
      return sendBadRequest(res, 'Invalid role. Must be a valid role id or role name')
    }

    // pg_owner can only create pg_staff users for their own PGs
    if (auth.role === 'pg_owner') {
      if (roleRecord.name !== 'pg_staff') {
        return sendError(res, 'PG owners can only create staff users', 'FORBIDDEN', [], 403)
      }
      const requestedPgIds: number[] = Array.isArray(req.body.pgIds)
        ? req.body.pgIds.map(Number)
        : pgId ? [Number(pgId)] : []
      const ownerPgIds = auth.pgIds || []
      const unauthorized = requestedPgIds.filter((id) => !ownerPgIds.includes(id))
      if (unauthorized.length > 0) {
        return sendError(res, 'Cannot assign users to PGs you do not manage', 'FORBIDDEN', [], 403)
      }
    }

    if ((roleRecord.name === 'pg_owner' || roleRecord.name === 'pg_staff') && !pgId && !Array.isArray(req.body.pgIds)) {
      return sendBadRequest(res, `pgId or pgIds is required for role: ${roleRecord.name}`)
    }

    const user = await UserService.createUser({
      name,
      email,
      phone,
      password,
      roleId: roleRecord.id,
      pgId,
      pgIds: Array.isArray(req.body.pgIds) ? req.body.pgIds.map(Number) : undefined,
      status: status || 'active',
    })

    return sendCreated(res, user)
  } catch (error: any) {
    logger.error('Create user failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'Email already exists')
    }
    return sendError(res, error?.message || 'Error creating user')
  }
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth as AuthPayload
    const { role, roles, status, pgId, skip = 0, limit = 10 } = req.query

    const filters: any = {}
    if (roles) {
      filters.roles = String(roles).split(',').map((r) => r.trim()).filter(Boolean)
    } else if (role) {
      if (!isNaN(Number(role))) filters.roleId = Number(role)
      else filters.role = String(role)
    }
    if (status) filters.status = status
    if (pgId) filters.pgId = Number(pgId)

    // pg_owner can only see users assigned to their own PGs
    if (auth.role === 'pg_owner') {
      const ownerPgIds = auth.pgIds || []
      if (pgId && !ownerPgIds.includes(Number(pgId))) {
        return sendList(res, [], { skip: Number(skip), count: 0, totalCount: 0 })
      }
      if (!pgId && ownerPgIds.length > 0) {
        filters.pgIds = ownerPgIds
      }
    }

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await UserService.getAllUsers(filters, {
      page,
      limit: Number(limit),
    })

    return sendList(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount })
  } catch (error: any) {
    logger.error('Get all users failed', { error })
    return sendError(res, error?.message || 'Error fetching users')
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await UserService.getUserById(Number(id))

    if (!user) {
      return sendNotFound(res, 'User not found')
    }

    return sendSuccess(res, user)
  } catch (error: any) {
    logger.error('Get user by id failed', { error })
    return sendError(res, error?.message || 'Error fetching user')
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, email, phone, role, pgId, status, password } = req.body

    let roleRecord: any = null
    if (role !== undefined) {
      if (!isNaN(Number(role))) {
        roleRecord = await RoleService.getRoleById(Number(role))
      } else {
        roleRecord = await RoleService.getRoleByName(String(role))
      }

      if (!roleRecord) return sendBadRequest(res, 'Invalid role ID or name')
    }

    if (roleRecord && (roleRecord.name === 'pg_owner' || roleRecord.name === 'pg_staff') && !pgId && !Array.isArray(req.body.pgIds)) {
      return sendBadRequest(res, `pgId or pgIds is required for role: ${roleRecord.name}`)
    }

    const user = await UserService.updateUser(Number(id), {
      name,
      email,
      phone,
      roleId: roleRecord ? roleRecord.id : undefined,
      pgId,
      pgIds: Array.isArray(req.body.pgIds) ? req.body.pgIds.map(Number) : undefined,
      status,
      password,
    })

    if (!user) {
      return sendNotFound(res, 'User not found')
    }

    return sendSuccess(res, user)
  } catch (error: any) {
    logger.error('Update user failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'Email already exists')
    }
    return sendError(res, error?.message || 'Error updating user')
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await UserService.deleteUser(Number(id))
    return sendSuccess(res, { success: true })
  } catch (error: any) {
    logger.error('Delete user failed', { error })
    if (error.code === 'P2025') {
      return sendNotFound(res, 'User not found')
    }
    return sendError(res, error?.message || 'Error deleting user')
  }
}

export const changeUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'inactive'].includes(status)) {
      return sendBadRequest(res, 'Invalid status. Must be active or inactive')
    }

    const user = await UserService.updateUser(Number(id), { status })

    if (!user) {
      return sendNotFound(res, 'User not found')
    }

    return sendSuccess(res, user)
  } catch (error: any) {
    logger.error('Change user status failed', { error })
    return sendError(res, error?.message || 'Error updating user status')
  }
}

export const getUsersByPG = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const { skip = 0, limit = 10 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await UserService.getAllUsers(
      { pgId: Number(pgId) },
      { page, limit: Number(limit) }
    )

    return sendList(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount })
  } catch (error: any) {
    logger.error('Get users by pg failed', { error })
    return sendError(res, error?.message || 'Error fetching users')
  }
}

export const getAvailablePGs = async (req: Request, res: Response) => {
  try {
    const pgs = await UserService.getAvailablePGs()
    return sendSuccess(res, pgs)
  } catch (error: any) {
    logger.error('Get available pgs failed', { error })
    return sendError(res, error?.message || 'Error fetching PGs')
  }
}
