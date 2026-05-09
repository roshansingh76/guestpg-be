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
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues })

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return res.status(401).json({ message: 'Invalid email or password' })

  const ok = bcrypt.compareSync(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' })

  const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, jwtSecret(), { expiresIn: '7d' })
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}

