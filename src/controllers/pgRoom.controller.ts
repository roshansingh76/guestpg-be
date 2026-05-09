import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

// Create a new room for a PG
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const {
      roomType,
      roomNumber,
      totalBeds,
      availableBeds,
      pricePerBed,
      acType,
    } = req.body

    // Validate required fields
    if (
      !roomType ||
      !roomNumber ||
      totalBeds === undefined ||
      availableBeds === undefined ||
      pricePerBed === undefined ||
      !acType
    ) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Check if PG exists
    const pg = await prisma.pG.findUnique({
      where: { id: Number(pgId) },
    })

    if (!pg) {
      return res.status(404).json({ message: 'PG not found' })
    }

    // Check if room number already exists for this PG
    const existingRoom = await prisma.pGRoom.findUnique({
      where: {
        pgId_roomNumber: {
          pgId: Number(pgId),
          roomNumber,
        },
      },
    })

    if (existingRoom) {
      return res.status(400).json({
        message: 'Room number already exists for this PG',
      })
    }

    const room = await prisma.pGRoom.create({
      data: {
        pgId: Number(pgId),
        roomType,
        roomNumber,
        totalBeds,
        availableBeds,
        pricePerBed,
        acType,
      },
    })

    res.status(201).json({
      message: 'Room created successfully',
      data: room,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error creating room',
      error: error.message,
    })
  }
}

// Get all rooms for a PG
export const getRoomsByPG = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const { page = 1, limit = 10 } = req.query

    // Check if PG exists
    const pg = await prisma.pG.findUnique({
      where: { id: Number(pgId) },
    })

    if (!pg) {
      return res.status(404).json({ message: 'PG not found' })
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [rooms, total] = await Promise.all([
      prisma.pGRoom.findMany({
        where: { pgId: Number(pgId) },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pGRoom.count({ where: { pgId: Number(pgId) } }),
    ])

    res.json({
      data: rooms,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching rooms',
      error: error.message,
    })
  }
}

// Get room by ID
export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { pgId, roomId } = req.params

    const room = await prisma.pGRoom.findFirst({
      where: {
        id: Number(roomId),
        pgId: Number(pgId),
      },
    })

    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    res.json(room)
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching room',
      error: error.message,
    })
  }
}

// Update room
export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { pgId, roomId } = req.params
    const updateData = req.body

    const room = await prisma.pGRoom.updateMany({
      where: {
        id: Number(roomId),
        pgId: Number(pgId),
      },
      data: updateData,
    })

    if (room.count === 0) {
      return res.status(404).json({ message: 'Room not found' })
    }

    const updatedRoom = await prisma.pGRoom.findUnique({
      where: { id: Number(roomId) },
    })

    res.json({
      message: 'Room updated successfully',
      data: updatedRoom,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error updating room',
      error: error.message,
    })
  }
}

// Delete room
export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { pgId, roomId } = req.params

    const room = await prisma.pGRoom.deleteMany({
      where: {
        id: Number(roomId),
        pgId: Number(pgId),
      },
    })

    if (room.count === 0) {
      return res.status(404).json({ message: 'Room not found' })
    }

    res.json({
      message: 'Room deleted successfully',
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error deleting room',
      error: error.message,
    })
  }
}
