import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
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

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role, pgId, status } = req.body

    if (!name || !email || !phone || !password || !role) {
      return sendBadRequest(res, 'Missing required fields')
    }

    if (!['admin', 'pg_owner', 'pg_staff'].includes(role)) {
      return sendBadRequest(res, 'Invalid role. Must be admin, pg_owner, or pg_staff')
    }

    if ((role === 'pg_owner' || role === 'pg_staff') && !pgId && !Array.isArray(req.body.pgIds)) {
      return sendBadRequest(res, `pgId or pgIds is required for role: ${role}`)
    }

    const user = await UserService.createUser({
      name,
      email,
      phone,
      password,
      role,
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
    const { role, status, pgId, skip = 0, limit = 10 } = req.query

    const filters: any = {}
    if (role) filters.role = role
    if (status) filters.status = status
    if (pgId) filters.pgId = Number(pgId)

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

    if (role && !['admin', 'pg_owner', 'pg_staff'].includes(role)) {
      return sendBadRequest(res, 'Invalid role. Must be admin, pg_owner, or pg_staff')
    }

    if ((role === 'pg_owner' || role === 'pg_staff') && !pgId && !Array.isArray(req.body.pgIds)) {
      return sendBadRequest(res, `pgId or pgIds is required for role: ${role}`)
    }

    const user = await UserService.updateUser(Number(id), {
      name,
      email,
      phone,
      role,
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
