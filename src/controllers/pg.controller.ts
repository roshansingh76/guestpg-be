import { Request, Response } from 'express'
import { PGService } from '../services/pg.service'
import { logger } from '../utils/logger'
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

export const createPG = async (req: Request, res: Response) => {
  try {
    const {
      pgName,
      ownerName,
      ownerPhone,
      ownerEmail,
      addressLine1,
      addressLine2,
      nearbyMark,
      area,
      city,
      state,
      latitude,
      longitude,
      pgType,
      numberOfRooms,
      isFoodAvailable,
    } = req.body

    if (
      !pgName ||
      !ownerName ||
      !ownerPhone ||
      !ownerEmail ||
      !addressLine1 ||
      !area ||
      !city ||
      !state ||
      latitude == null ||
      longitude == null ||
      !pgType
    ) {
      return sendBadRequest(res, 'Missing required fields')
    }

    const pg = await PGService.createPG({
      pgName,
      ownerName,
      ownerPhone,
      ownerEmail,
      addressLine1,
      addressLine2,
      nearbyMark,
      area,
      city,
      state,
      latitude: Number(latitude),
      longitude: Number(longitude),
      pgType,
      numberOfRooms,
      isFoodAvailable: isFoodAvailable || false,
    })

    return sendCreated(res, pg)
  } catch (error: any) {
    logger.error('Create PG failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'Owner email already exists')
    }
    return sendError(res, error?.message || 'Error creating PG')
  }
}

export const getAllPGs = async (req: Request, res: Response) => {
  try {
    const auth = req.auth as AuthPayload
    const { status, city, pgType, skip = 0, limit = 10 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await PGService.getAllPGs(
      {
        status: status as any,
        city: city as string,
        pgType: pgType as string,
        userId: auth.sub,
        userRole: auth.role,
        userPgId: auth.pgId ?? undefined,
      },
      { page: Number(page), limit: Number(limit) }
    )

    return sendList(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount })
  } catch (error: any) {
    logger.error('Get all PGs failed', { error })
    return sendError(res, error?.message || 'Error fetching PGs')
  }
}

export const getPGById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const pg = await PGService.getPGById(Number(id))

    if (!pg) {
      return sendNotFound(res, 'PG not found')
    }

    return sendSuccess(res, pg)
  } catch (error: any) {
    logger.error('Get PG by id failed', { error })
    return sendError(res, error?.message || 'Error fetching PG')
  }
}

export const updatePG = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const pg = await PGService.updatePG(Number(id), updateData)
    return sendSuccess(res, pg)
  } catch (error: any) {
    logger.error('Update PG failed', { error })
    if (error.code === 'P2025') {
      return sendNotFound(res, 'PG not found')
    }
    if (error.code === 'P2002') {
      return sendConflict(res, 'Owner email already exists')
    }
    return sendError(res, error?.message || 'Error updating PG')
  }
}

export const deletePG = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await PGService.deletePG(Number(id))
    return sendSuccess(res, { success: true })
  } catch (error: any) {
    logger.error('Delete PG failed', { error })
    if (error.code === 'P2025') {
      return sendNotFound(res, 'PG not found')
    }
    return sendError(res, error?.message || 'Error deleting PG')
  }
}

export const changePGStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'inactive'].includes(status)) {
      return sendBadRequest(res, 'Invalid status. Must be active or inactive')
    }

    const pg = await PGService.updatePG(Number(id), { status: status as any })
    return sendSuccess(res, pg)
  } catch (error: any) {
    logger.error('Change PG status failed', { error })
    if (error.code === 'P2025') {
      return sendNotFound(res, 'PG not found')
    }
    return sendError(res, error?.message || 'Error updating PG status')
  }
}
