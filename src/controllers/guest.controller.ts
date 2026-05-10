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
  idProofUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  bedId: z.number().int().optional(),
  moveInDate: z.string().optional(),
  status: z.string().optional(),
})

// List guests for a PG
export async function listGuests(req: Request, res: Response) {
  const pgId = Number(req.params.pgId)
  const { status, page = 1, limit = 20 } = req.query

  const where: any = { pgId }
  if (status) where.status = status

  const skip = (Number(page) - 1) * Number(limit)

  const [items, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        bed: { select: { id: true, bedNumber: true, room: { select: { roomNumber: true } } } },
      },
    }),
    prisma.guest.count({ where }),
  ])

  return res.json({
    data: items,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
  })
}

// Get single guest
export async function getGuest(req: Request, res: Response) {
  const pgId = Number(req.params.pgId)
  const id = Number(req.params.id)

  const guest = await prisma.guest.findFirst({
    where: { id, pgId },
    include: {
      bed: { include: { room: true } },
    },
  })
  if (!guest) return res.status(404).json({ message: 'Guest not found' })
  return res.json(guest)
}

// Create guest (onboard tenant)
export async function createGuest(req: Request, res: Response) {
  const pgId = Number(req.params.pgId)

  const parsed = guestCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues })

  const pg = await prisma.pG.findUnique({ where: { id: pgId } })
  if (!pg) return res.status(404).json({ message: 'PG not found' })

  // Validate bed belongs to this PG and is vacant
  if (parsed.data.bedId) {
    const bed = await prisma.pGBed.findFirst({ where: { id: parsed.data.bedId, pgId } })
    if (!bed) return res.status(404).json({ message: 'Bed not found in this PG' })
    if (bed.status !== 'vacant') return res.status(400).json({ message: 'Bed is not vacant' })
  }

  const guest = await prisma.$transaction(async (tx) => {
    const g = await tx.guest.create({
      data: {
        pgId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        aadhar: parsed.data.aadhar,
        address: parsed.data.address,
        emergency: parsed.data.emergency,
        emergencyPhone: parsed.data.emergencyPhone,
        idProofUrl: parsed.data.idProofUrl,
        photoUrl: parsed.data.photoUrl,
        bedId: parsed.data.bedId || null,
        moveInDate: parsed.data.moveInDate ? new Date(parsed.data.moveInDate) : new Date(),
        status: parsed.data.status || 'active',
      },
    })

    // Mark bed as occupied
    if (parsed.data.bedId) {
      await tx.pGBed.update({ where: { id: parsed.data.bedId }, data: { status: 'occupied' } })
    }

    return g
  })

  return res.status(201).json({ message: 'Guest created successfully', data: guest })
}

// Update guest
export async function updateGuest(req: Request, res: Response) {
  const pgId = Number(req.params.pgId)
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  const parsed = guestCreateSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues })

  const existing = await prisma.guest.findFirst({ where: { id, pgId } })
  if (!existing) return res.status(404).json({ message: 'Guest not found' })

  // Handle bed change
  if (parsed.data.bedId !== undefined && parsed.data.bedId !== existing.bedId) {
    if (parsed.data.bedId) {
      const bed = await prisma.pGBed.findFirst({ where: { id: parsed.data.bedId, pgId } })
      if (!bed) return res.status(404).json({ message: 'Bed not found in this PG' })
      if (bed.status !== 'vacant') return res.status(400).json({ message: 'Bed is not vacant' })
    }

    await prisma.$transaction(async (tx) => {
      // Free old bed
      if (existing.bedId) {
        await tx.pGBed.update({ where: { id: existing.bedId }, data: { status: 'vacant' } })
      }
      // Occupy new bed
      if (parsed.data.bedId) {
        await tx.pGBed.update({ where: { id: parsed.data.bedId }, data: { status: 'occupied' } })
      }
    })
  }

  const guest = await prisma.guest.update({ where: { id }, data: parsed.data })
  return res.json({ message: 'Guest updated successfully', data: guest })
}

// Check out guest (move-out)
export async function checkoutGuest(req: Request, res: Response) {
  const pgId = Number(req.params.pgId)
  const id = Number(req.params.id)

  const guest = await prisma.guest.findFirst({ where: { id, pgId } })
  if (!guest) return res.status(404).json({ message: 'Guest not found' })
  if (guest.status === 'inactive') return res.status(400).json({ message: 'Guest already checked out' })

  await prisma.$transaction(async (tx) => {
    await tx.guest.update({
      where: { id },
      data: { status: 'inactive', moveOutDate: new Date(), bedId: null },
    })
    if (guest.bedId) {
      await tx.pGBed.update({ where: { id: guest.bedId }, data: { status: 'vacant' } })
    }
  })

  return res.json({ message: 'Guest checked out successfully' })
}

// Delete guest
export async function deleteGuest(req: Request, res: Response) {
  const pgId = Number(req.params.pgId)
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  const guest = await prisma.guest.findFirst({ where: { id, pgId } })
  if (!guest) return res.status(404).json({ message: 'Guest not found' })

  await prisma.$transaction(async (tx) => {
    if (guest.bedId) {
      await tx.pGBed.update({ where: { id: guest.bedId }, data: { status: 'vacant' } })
    }
    await tx.guest.delete({ where: { id } })
  })

  return res.status(204).send()
}
