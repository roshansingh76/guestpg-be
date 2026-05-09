import type { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma'

const guestCreateSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  aadhar: z.string().min(4),
  address: z.string().optional(),
  emergency: z.string().optional(),
  emergencyPhone: z.string().optional(),
  status: z.string().optional(),
})

export async function listGuests(_req: Request, res: Response) {
  const items = await prisma.guest.findMany({ orderBy: { id: 'desc' } })
  return res.json({ data: items })
}

export async function createGuest(req: Request, res: Response) {
  const parsed = guestCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues })

  const guest = await prisma.guest.create({ data: parsed.data })
  return res.status(201).json(guest)
}

export async function updateGuest(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  const parsed = guestCreateSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues })

  try {
    const guest = await prisma.guest.update({ where: { id }, data: parsed.data })
    return res.json(guest)
  } catch {
    return res.status(404).json({ message: 'Guest not found' })
  }
}

export async function deleteGuest(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })
  try {
    await prisma.guest.delete({ where: { id } })
    return res.status(204).send()
  } catch {
    return res.status(404).json({ message: 'Guest not found' })
  }
}

