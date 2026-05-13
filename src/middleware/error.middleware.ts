import { NextFunction, Request, Response } from 'express'
import { sendError } from '../utils/response'
import { logger } from '../utils/logger'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled exception caught by middleware', {
    path: req.path,
    method: req.method,
    message: err?.message,
    stack: err?.stack,
  })

  if (res.headersSent) {
    return next(err)
  }

  const status = err?.statusCode || 500
  const code = err?.code || 'INTERNAL_SERVER_ERROR'
  const message = err?.message || 'Internal server error'
  const details = err?.details || []

  return sendError(res, message, code, details, status)
}
