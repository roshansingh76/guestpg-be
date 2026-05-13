import { Request, Response } from 'express'
import { RoomService } from '../services/room.service'
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
import type { AuthPayload } from '../middleware/auth'

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== Number(pgId)) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }
    const { roomType, roomNumber, totalBeds, availableBeds, pricePerBed, acType } = req.body

    if (
      !roomType ||
      !roomNumber ||
      totalBeds === undefined ||
      availableBeds === undefined ||
      pricePerBed === undefined ||
      !acType
    ) {
      return sendBadRequest(res, 'Missing required fields')
    }

    const room = await RoomService.createRoom({
      pgId: Number(pgId),
      roomType,
      roomNumber,
      totalBeds: Number(totalBeds),
      availableBeds: Number(availableBeds),
      pricePerBed: Number(pricePerBed),
      acType,
    })

    return sendCreated(res, room)
  } catch (error: any) {
    logger.error('Create room failed', { error })
    if (error.code === 'P2002') {
      return sendConflict(res, 'Room number already exists for this PG')
    }
    return sendError(res, error?.message || 'Error creating room')
  }
}

export const getRoomsByPG = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== Number(pgId)) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }
    const { skip = 0, limit = 10 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await RoomService.getRoomsByPG(Number(pgId), {
      page,
      limit: Number(limit),
    })

    return sendList(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount })
  } catch (error: any) {
    logger.error('Get rooms by PG failed', { error })
    return sendError(res, error?.message || 'Error fetching rooms')
  }
}

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { pgId, roomId } = req.params
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== Number(pgId)) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }
    const room = await RoomService.getRoomById(Number(roomId), Number(pgId))

    if (!room) {
      return sendNotFound(res, 'Room not found')
    }

    return sendSuccess(res, room)
  } catch (error: any) {
    logger.error('Get room by id failed', { error })
    return sendError(res, error?.message || 'Error fetching room')
  }
}

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { pgId, roomId } = req.params
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== Number(pgId)) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }
    const updateData = req.body

    const updated = await RoomService.updateRoom(Number(roomId), Number(pgId), updateData)
    if (updated.count === 0) {
      return sendNotFound(res, 'Room not found')
    }

    const room = await RoomService.getRoomById(Number(roomId), Number(pgId))
    return sendSuccess(res, room)
  } catch (error: any) {
    logger.error('Update room failed', { error })
    return sendError(res, error?.message || 'Error updating room')
  }
}

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { pgId, roomId } = req.params
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== Number(pgId)) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }
    const deleted = await RoomService.deleteRoom(Number(roomId), Number(pgId))

    if (deleted.count === 0) {
      return sendNotFound(res, 'Room not found')
    }

    return sendSuccess(res, { success: true })
  } catch (error: any) {
    logger.error('Delete room failed', { error })
    return sendError(res, error?.message || 'Error deleting room')
  }
}
