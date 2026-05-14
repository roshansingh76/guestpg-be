import { Request, Response } from 'express'
import { CityService } from '../services/city.service'
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

export const createCity = async (req: Request, res: Response) => {
  try {
    const { name, state } = req.body

    if (!name) {
      return sendBadRequest(res, 'City name is required')
    }

    const city = await CityService.createCity({ name, state })
    return sendCreated(res, city)
  } catch (error: any) {
    logger.error('Create city failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'City already exists')
    }
    return sendError(res, error?.message || 'Error creating city')
  }
}

export const getAllCities = async (req: Request, res: Response) => {
  try {
    const { status, skip = 0, limit = 100 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await CityService.getAllCities(
      { status: status as string },
      { page: Number(page), limit: Number(limit) }
    )

    return sendList(res, result.data, {
      skip: Number(skip),
      count: result.data.length,
      totalCount: result.pagination.totalCount,
    })
  } catch (error: any) {
    logger.error('Get all cities failed', { error })
    return sendError(res, error?.message || 'Error fetching cities')
  }
}

export const getCityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const city = await CityService.getCityById(Number(id))

    if (!city) {
      return sendNotFound(res, 'City not found')
    }

    return sendSuccess(res, city)
  } catch (error: any) {
    logger.error('Get city by id failed', { error })
    return sendError(res, error?.message || 'Error fetching city')
  }
}

export const updateCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, state, status } = req.body

    const city = await CityService.updateCity(Number(id), { name, state, status })

    if (!city) {
      return sendNotFound(res, 'City not found')
    }

    return sendSuccess(res, city)
  } catch (error: any) {
    logger.error('Update city failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'City name already exists')
    }
    return sendError(res, error?.message || 'Error updating city')
  }
}

export const deleteCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const city = await CityService.deleteCity(Number(id))

    if (!city) {
      return sendNotFound(res, 'City not found')
    }

    return sendSuccess(res, { message: 'City deleted successfully' })
  } catch (error: any) {
    logger.error('Delete city failed', { error })
    return sendError(res, error?.message || 'Error deleting city')
  }
}

export const getCitiesWithAreas = async (req: Request, res: Response) => {
  try {
    const cities = await CityService.getCitiesWithAreas()
    return sendSuccess(res, cities)
  } catch (error: any) {
    logger.error('Get cities with areas failed', { error })
    return sendError(res, error?.message || 'Error fetching cities')
  }
}
