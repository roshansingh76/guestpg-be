import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { UserService } from '../services/user.service'
import { logger } from '../utils/logger'
import {
  sendBadRequest,
  sendCreated,
  sendError,
  sendNotFound,
  sendSuccess,
} from '../utils/response'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function jwtSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-me'
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return sendBadRequest(res, 'Invalid input', parsed.error.issues as any)

    const { email, password } = parsed.data
    const user = await UserService.authenticateUser(email.toLowerCase(), password)
    if (!user) return sendError(res, 'Invalid email or password', 'UNAUTHORIZED', [], 401)

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email, pgId: user.pgId },
      jwtSecret(),
      { expiresIn: '7d' }
    )

    return sendSuccess(res, { token, user })
  } catch (error: any) {
    logger.error('Login failed', { error })
    return sendError(res, error?.message || 'Login failed')
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body
    const userId = (req as any).auth?.sub

    if (!userId) return sendError(res, 'Authentication required', 'UNAUTHORIZED', [], 401)
    if (!currentPassword || !newPassword || !confirmPassword)
      return sendBadRequest(res, 'All password fields are required')
    if (newPassword !== confirmPassword)
      return sendBadRequest(res, 'New password and confirm password do not match')
    if (newPassword.length < 8)
      return sendBadRequest(res, 'Password must be at least 8 characters long')

    const user = await UserService.getUserById(Number(userId))
    if (!user) return sendNotFound(res, 'User not found')

    await UserService.updateUser(Number(userId), { password: newPassword })
    return sendSuccess(res, { success: true })
  } catch (error: any) {
    logger.error('Change password failed', { error })
    return sendError(res, error?.message || 'Unable to change password')
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.sub
    if (!userId) return sendError(res, 'Authentication required', 'UNAUTHORIZED', [], 401)

    const user = await UserService.getUserById(Number(userId))
    if (!user) return sendNotFound(res, 'User not found')

    return sendSuccess(res, user)
  } catch (error: any) {
    logger.error('Get profile failed', { error })
    return sendError(res, error?.message || 'Unable to fetch profile')
  }
}
