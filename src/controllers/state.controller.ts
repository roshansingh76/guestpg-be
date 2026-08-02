import { Request, Response } from 'express'
import { StateService } from '../services/state.service'
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

export const createState = async (req: Request, res: Response) => {
  try {
    const { name } = req.body

    if (!name) {
      return sendBadRequest(res, 'State name is required')
    }

    const state = await StateService.createState({ name })
    return sendCreated(res, state)
  } catch (error: any) {
    logger.error('Create state failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'State already exists')
    }
    return sendError(res, error?.message || 'Error creating state')
  }
}

export const getAllStates = async (req: Request, res: Response) => {
  try {
    const { isActive, skip = 0, limit = 100 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await StateService.getAllStates(
      { isActive: isActive !== undefined ? Number(isActive) : undefined },
      { page: Number(page), limit: Number(limit) }
    )

    return sendList(res, result.data, {
      skip: Number(skip),
      count: result.data.length,
      totalCount: result.pagination.totalCount,
    })
  } catch (error: any) {
    logger.error('Get all states failed', { error })
    return sendError(res, error?.message || 'Error fetching states')
  }
}

export const getStateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const state = await StateService.getStateById(Number(id))

    if (!state) {
      return sendNotFound(res, 'State not found')
    }

    return sendSuccess(res, state)
  } catch (error: any) {
    logger.error('Get state by id failed', { error })
    return sendError(res, error?.message || 'Error fetching state')
  }
}

export const updateState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, isActive } = req.body

    const state = await StateService.updateState(Number(id), {
      name,
      isActive: isActive !== undefined ? Number(isActive) : undefined,
    })

    if (!state) {
      return sendNotFound(res, 'State not found')
    }

    return sendSuccess(res, state)
  } catch (error: any) {
    logger.error('Update state failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'State name already exists')
    }
    if (error.code === 'P2025') {
      return sendNotFound(res, 'State not found')
    }
    return sendError(res, error?.message || 'Error updating state')
  }
}

export const deleteState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const state = await StateService.deleteState(Number(id))

    if (!state) {
      return sendNotFound(res, 'State not found')
    }

    return sendSuccess(res, { message: 'State deleted successfully' })
  } catch (error: any) {
    logger.error('Delete state failed', { error })
    if (error.code === 'P2025') {
      return sendNotFound(res, 'State not found')
    }
    return sendError(res, error?.message || 'Error deleting state')
  }
}
