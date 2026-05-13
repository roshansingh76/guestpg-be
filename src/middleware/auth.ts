import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export type AuthPayload = { sub: number; role: string; email: string; pgId: number | null; pgIds?: number[] }

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload
    }
  }
}

function jwtSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-me'
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Missing token' })
  try {
    const payload = jwt.verify(token, jwtSecret()) as unknown as AuthPayload
      ; (req as any).auth = payload
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export function hasPGAccess(auth: AuthPayload, pgId: number) {
  if (auth.role === 'admin' || auth.role === 'super_admin') return true
  if (!auth.pgIds || auth.pgIds.length === 0) return true
  return auth.pgIds.includes(pgId) || auth.pgId === pgId
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth as AuthPayload
    if (!auth || !roles.includes(auth.role))
      return res.status(403).json({ message: 'Forbidden' })
    return next()
  }
}
