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
// import { buildMissingFieldDetails } from '../utils/validation'
import { z } from 'zod'

const numberFromString = (val: unknown) => {
  if (typeof val === 'string' && val.trim() !== '') return Number(val)
  return val
}

const createPGSchema = z.object({
  pgName: z.string().min(1),
  ownerName: z.string().min(1),
  ownerPhone: z.string().min(5),
  ownerEmail: z.string().email(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  nearbyMark: z.string().optional(),
  areaId: z.preprocess(numberFromString, z.number().int()).optional(),
  areaOther: z.string().min(1).optional(),
  cityId: z.preprocess(numberFromString, z.number().int()).optional(),
  cityOther: z.string().min(1).optional(),
  state: z.string().min(1),
  latitude: z.preprocess(numberFromString, z.number()),
  longitude: z.preprocess(numberFromString, z.number()),
  pgType: z.enum(['Boys', 'Girls', 'CoLiving']),
  numberOfRooms: z.preprocess(numberFromString, z.number().int().nonnegative()),
  isFoodAvailable: z.boolean().optional(),
  amenityIds: z.array(z.preprocess(numberFromString, z.number().int())).optional(),
})

const updatePGSchema = createPGSchema.partial()

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
      areaId,
        areaOther,
      cityId,
        cityOther,
      state,
      latitude,
      longitude,
      pgType,
      numberOfRooms,
      isFoodAvailable,
      amenityIds,
    } = req.body
    // Validate request body with Zod
    const parsed = createPGSchema.safeParse(req.body)
    if (!parsed.success) {
      const details = parsed.error.issues.map((e: z.ZodIssue) => ({ field: (e.path || []).join('.'), message: e.message }))
      return sendBadRequest(res, 'Invalid request body', details)
    }

    const pg = await PGService.createPG({
      pgName,
      ownerName,
      ownerPhone,
      ownerEmail,
      addressLine1,
      addressLine2,
      nearbyMark,
      areaId: areaId !== undefined ? Number(areaId) : undefined,
      areaOther: areaOther ? String(areaOther).trim() : undefined,
      cityId: cityId !== undefined ? Number(cityId) : undefined,
      cityOther: cityOther ? String(cityOther).trim() : undefined,
      state,
      latitude: Number(latitude),
      longitude: Number(longitude),
      pgType,
      numberOfRooms,
      isFoodAvailable: isFoodAvailable || false,
      amenityIds: Array.isArray(amenityIds) ? amenityIds.map(Number) : undefined,
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
    const { status, cityId, pgType, skip = 0, limit = 10 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await PGService.getAllPGs(
      {
        status: status as any,
        cityId: cityId ? Number(cityId) : undefined,
        pgType: pgType as string,
        userId: auth.sub,
        userRole: auth.role,
        userPgIds: auth.pgIds,
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

    const parsed = updatePGSchema.safeParse(updateData)
    if (!parsed.success) {
      const details = parsed.error.issues.map((e: z.ZodIssue) => ({ field: (e.path || []).join('.'), message: e.message }))
      return sendBadRequest(res, 'Invalid request body', details)
    }

    const pg = await PGService.updatePG(Number(id), parsed.data)
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
