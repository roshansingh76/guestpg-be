import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../db/prisma'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function jwtSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-me'
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success)
    return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues })

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return res.status(401).json({ message: 'Invalid email or password' })

  if (user.status !== 'active')
    return res.status(403).json({ message: 'Account is deactivated' })

  const ok = bcrypt.compareSync(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' })

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email, pgId: user.pgId },
    jwtSecret(),
    { expiresIn: '7d' }
  )

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, pgId: user.pgId },
  })
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword, confirmPassword } = req.body
  const userId = (req as any).auth?.sub

  if (!currentPassword || !newPassword || !confirmPassword)
    return res.status(400).json({ message: 'All password fields are required' })

  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: 'New password and confirm password do not match' })

  if (newPassword.length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters long' })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return res.status(404).json({ message: 'User not found' })

  const valid = bcrypt.compareSync(currentPassword, user.passwordHash)
  if (!valid) return res.status(401).json({ message: 'Current password is incorrect' })

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hashed } })

  return res.json({ message: 'Password changed successfully' })
}

export async function getProfile(req: Request, res: Response) {
  const userId = (req as any).auth?.sub

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, status: true, pgId: true, createdAt: true },
  })
  if (!user) return res.status(404).json({ message: 'User not found' })

  return res.json(user)
}
