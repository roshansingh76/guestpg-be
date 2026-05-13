import { Response } from 'express'

export type ErrorDetail = {
  field?: string
  message: string
  code?: string
  [key: string]: unknown
}

// Single resource response (GET /api/resource/id, POST, PUT, DELETE)
export const sendSuccess = (
  res: Response,
  data: unknown,
  status = 200
) => {
  return res.status(status).json({
    success: true,
    data,
    error: null,
  })
}

// Create operation (201)
export const sendCreated = (
  res: Response,
  data: unknown
) => sendSuccess(res, data, 201)

// List response with pagination (GET /api/resource?skip=0&limit=20)
export const sendList = (
  res: Response,
  items: unknown[],
  pagination: { skip: number; count: number; totalCount: number },
  status = 200
) => {
  return res.status(status).json({
    success: true,
    data: {
      items,
      pagination,
    },
    error: null,
  })
}

export const sendError = (
  res: Response,
  message = 'Internal server error',
  code = 'INTERNAL_SERVER_ERROR',
  details: ErrorDetail[] = [],
  status = 500
) => {
  return res.status(status).json({
    success: false,
    data: null,
    error: {
      message,
      code,
      details: details.length > 0 ? details : [],
    },
  })
}

export const sendBadRequest = (
  res: Response,
  message = 'Bad request',
  details: ErrorDetail[] = []
) => sendError(res, message, 'BAD_REQUEST', details, 400)

export const sendNotFound = (
  res: Response,
  message = 'Resource not found',
  details: ErrorDetail[] = []
) => sendError(res, message, 'NOT_FOUND', details, 404)

export const sendConflict = (
  res: Response,
  message = 'Conflict',
  details: ErrorDetail[] = []
) => sendError(res, message, 'CONFLICT', details, 409)

export const sendUnauthorized = (
  res: Response,
  message = 'Unauthorized',
  details: ErrorDetail[] = []
) => sendError(res, message, 'UNAUTHORIZED', details, 401)
