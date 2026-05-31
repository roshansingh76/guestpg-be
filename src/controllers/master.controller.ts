import { Request, Response } from 'express'
import { prisma } from '../db/prisma'
import { sendSuccess, sendError } from '../utils/response'
import { logger } from '../utils/logger'

export const getAmenitiesList = async (req: Request, res: Response) => {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: { name: 'asc' },
    })
    return sendSuccess(res, amenities)
  } catch (error: any) {
    logger.error('Get amenities list failed', { error })
    return sendError(res, error?.message || 'Error fetching amenities')
  }
}

export const getPhotoCategoriesList = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.photoCategory.findMany({
      orderBy: { name: 'asc' },
    })
    return sendSuccess(res, categories)
  } catch (error: any) {
    logger.error('Get photo categories list failed', { error })
    return sendError(res, error?.message || 'Error fetching photo categories')
  }
}

export const getExpenseCategoriesList = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
    })
    return sendSuccess(res, categories)
  } catch (error: any) {
    logger.error('Get expense categories list failed', { error })
    return sendError(res, error?.message || 'Error fetching expense categories')
  }
}
