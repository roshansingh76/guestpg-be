import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    id: number
    pgId: number
    username: string
    role: 'Owner' | 'Manager'
  }
}

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key'

// Middleware to verify JWT token
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any
    req.user = decoded
    next()
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid token', error: error.message })
  }
}

// Middleware to check if user is PG Owner
export const isPGOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'Owner') {
    return res.status(403).json({ message: 'Only PG Owner can perform this action' })
  }
  next()
}

// Middleware to check if user belongs to the PG
export const belongsToPG = (req: AuthRequest, res: Response, next: NextFunction) => {
  const pgId = Number(req.params.pgId)

  if (req.user?.pgId !== pgId) {
    return res.status(403).json({
      message: 'You do not have access to this PG',
    })
  }
  next()
}

// Generate JWT token for staff login
export const generateToken = (staffId: number, pgId: number, username: string, role: 'Owner' | 'Manager') => {
  return jwt.sign(
    {
      id: staffId,
      pgId,
      username,
      role,
    },
    SECRET_KEY,
    { expiresIn: '24h' }
  )
}

// Verify password using bcryptjs
export const verifyPassword = async (password: string, hashedPassword: string) => {
  const bcrypt = require('bcryptjs')
  return bcrypt.compare(password, hashedPassword)
}
