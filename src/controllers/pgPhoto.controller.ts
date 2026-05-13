import { Request, Response } from 'express'
import { PhotoService } from '../services/photo.service'
import { logger } from '../utils/logger'
import {
  sendBadRequest,
  sendCreated,
  sendError,
  sendNotFound,
  sendSuccess,
} from '../utils/response'

export const addPGPhoto = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const { photoUrl, categoryId } = req.body

    if (!photoUrl || categoryId === undefined) {
      return sendBadRequest(res, 'photoUrl and categoryId are required')
    }

    const photo = await PhotoService.addPhoto({
      pgId: Number(pgId),
      photoUrl,
      categoryId: Number(categoryId),
    })

    return sendCreated(res, photo)
  } catch (error: any) {
    logger.error('Add PG photo failed', { error })
    return sendError(res, error?.message || 'Error adding photo')
  }
}

export const getPGPhotos = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const photos = await PhotoService.getPhotosByPG(Number(pgId))

    return sendSuccess(res, photos)
  } catch (error: any) {
    logger.error('Get PG photos failed', { error })
    return sendError(res, error?.message || 'Error fetching photos')
  }
}

export const deletePGPhoto = async (req: Request, res: Response) => {
  try {
    const { pgId, photoId } = req.params
    const deleted = await PhotoService.deletePhoto(Number(photoId), Number(pgId))

    if (deleted.count === 0) {
      return sendNotFound(res, 'Photo not found')
    }

    return sendSuccess(res, { success: true })
  } catch (error: any) {
    logger.error('Delete PG photo failed', { error })
    return sendError(res, error?.message || 'Error deleting photo')
  }
}
