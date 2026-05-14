import { Request, Response } from 'express'
import { AreaService } from '../services/area.service'
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

export const createArea = async (req: Request, res: Response) => {
  try {
    const { name, cityId } = req.body

    if (!name || !cityId) {
      return sendBadRequest(res, 'Area name and city ID are required')
    }

    const area = await AreaService.createArea({ name, cityId: Number(cityId) })
    return sendCreated(res, area)
  } catch (error: any) {
    logger.error('Create area failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'Area already exists for this city')
    }
    return sendError(res, error?.message || 'Error creating area')
  }
}

export const getAllAreas = async (req: Request, res: Response) => {
  try {
    const { cityId, status, skip = 0, limit = 100 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await AreaService.getAllAreas(
      { cityId: cityId ? Number(cityId) : undefined, status: status as string },
      { page: Number(page), limit: Number(limit) }
    )

    return sendList(res, result.data, {
      skip: Number(skip),
      count: result.data.length,
      totalCount: result.pagination.totalCount,
    })
  } catch (error: any) {
    logger.error('Get all areas failed', { error })
    return sendError(res, error?.message || 'Error fetching areas')
  }
}

export const getAreaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const area = await AreaService.getAreaById(Number(id))

    if (!area) {
      return sendNotFound(res, 'Area not found')
    }

    return sendSuccess(res, area)
  } catch (error: any) {
    logger.error('Get area by id failed', { error })
    return sendError(res, error?.message || 'Error fetching area')
  }
}

export const updateArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, cityId, status } = req.body

    const area = await AreaService.updateArea(Number(id), {
      name,
      cityId: cityId ? Number(cityId) : undefined,
      status,
    })

    if (!area) {
      return sendNotFound(res, 'Area not found')
    }

    return sendSuccess(res, area)
  } catch (error: any) {
    logger.error('Update area failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'Area already exists for this city')
    }
    return sendError(res, error?.message || 'Error updating area')
  }
}

export const deleteArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const area = await AreaService.deleteArea(Number(id))

    if (!area) {
      return sendNotFound(res, 'Area not found')
    }

    return sendSuccess(res, { message: 'Area deleted successfully' })
  } catch (error: any) {
    logger.error('Delete area failed', { error })
    return sendError(res, error?.message || 'Error deleting area')
  }
}

export const getAreasByCity = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params

    if (!cityId) {
      return sendBadRequest(res, 'City ID is required')
    }

    const areas = await AreaService.getAreasByCity(Number(cityId))
    return sendSuccess(res, areas)
  } catch (error: any) {
    logger.error('Get areas by city failed', { error })
    return sendError(res, error?.message || 'Error fetching areas')
  }
}
