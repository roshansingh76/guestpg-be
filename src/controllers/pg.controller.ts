import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

// Create a new PG
export const createPG = async (req: Request, res: Response) => {
  try {
    const {
      pgName,
      ownerName,
      ownerPhone,
      ownerEmail,
      addressLine1,
      addressLine2,
      nearbyMark,
      area,
      city,
      state,
      latitude,
      longitude,
      pgType,
      numberOfRooms,
      isFoodAvailable,
    } = req.body

    // Validate required fields
    if (
      !pgName ||
      !ownerName ||
      !ownerPhone ||
      !ownerEmail ||
      !addressLine1 ||
      !area ||
      !city ||
      !state ||
      latitude == null ||
      longitude == null ||
      !pgType
    ) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const pg = await prisma.pG.create({
      data: {
        pgName,
        ownerName,
        ownerPhone,
        ownerEmail,
        addressLine1,
        addressLine2,
        nearbyMark,
        area,
        city,
        state,
        latitude: Number(latitude),
        longitude: Number(longitude),
        pgType,
        numberOfRooms,
        isFoodAvailable: isFoodAvailable || false,
      },
      include: {
        rooms: true,
        photos: true,
      },
    })

    res.status(201).json({
      message: 'PG created successfully',
      data: pg,
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Owner email already exists',
      })
    }
    res.status(500).json({
      message: 'Error creating PG',
      error: error.message,
    })
  }
}

// Get all PGs
export const getAllPGs = async (req: Request, res: Response) => {
  try {
    const { status, city, pgType, page = 1, limit = 10 } = req.query

    const where: any = {}
    if (status) where.status = status
    if (city) where.city = city
    if (pgType) where.pgType = pgType

    const skip = (Number(page) - 1) * Number(limit)

    const [pgs, total] = await Promise.all([
      prisma.pG.findMany({
        where,
        include: {
          rooms: true,
          photos: true,
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pG.count({ where }),
    ])

    res.json({
      data: pgs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching PGs',
      error: error.message,
    })
  }
}

// Get PG by ID
export const getPGById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const pg = await prisma.pG.findUnique({
      where: { id: Number(id) },
      include: {
        rooms: true,
        photos: true,
      },
    })

    if (!pg) {
      return res.status(404).json({ message: 'PG not found' })
    }

    res.json(pg)
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching PG',
      error: error.message,
    })
  }
}

// Update PG
export const updatePG = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const pg = await prisma.pG.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        rooms: true,
        photos: true,
      },
    })

    res.json({
      message: 'PG updated successfully',
      data: pg,
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'PG not found' })
    }
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Owner email already exists',
      })
    }
    res.status(500).json({
      message: 'Error updating PG',
      error: error.message,
    })
  }
}

// Delete PG
export const deletePG = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await prisma.pG.delete({
      where: { id: Number(id) },
    })

    res.json({
      message: 'PG deleted successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'PG not found' })
    }
    res.status(500).json({
      message: 'Error deleting PG',
      error: error.message,
    })
  }
}

// Change PG status
export const changePGStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be active or inactive',
      })
    }

    const pg = await prisma.pG.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        rooms: true,
        photos: true,
      },
    })

    res.json({
      message: 'PG status updated successfully',
      data: pg,
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'PG not found' })
    }
    res.status(500).json({
      message: 'Error updating PG status',
      error: error.message,
    })
  }
}
