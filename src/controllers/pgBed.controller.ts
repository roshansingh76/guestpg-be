import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

// Create a bed in a room
export const createBed = async (req: Request, res: Response) => {
    try {
        const { pgId, roomId } = req.params
        const { bedNumber, status } = req.body

        if (!bedNumber) return res.status(400).json({ message: 'bedNumber is required' })

        const room = await prisma.pGRoom.findFirst({ where: { id: Number(roomId), pgId: Number(pgId) } })
        if (!room) return res.status(404).json({ message: 'Room not found' })

        const existing = await prisma.pGBed.findUnique({
            where: { roomId_bedNumber: { roomId: Number(roomId), bedNumber } },
        })
        if (existing) return res.status(400).json({ message: 'Bed number already exists in this room' })

        const bed = await prisma.pGBed.create({
            data: { pgId: Number(pgId), roomId: Number(roomId), bedNumber, status: status || 'vacant' },
        })

        res.status(201).json({ message: 'Bed created successfully', data: bed })
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating bed', error: error.message })
    }
}

// Get all beds for a room
export const getBedsByRoom = async (req: Request, res: Response) => {
    try {
        const { pgId, roomId } = req.params

        const room = await prisma.pGRoom.findFirst({ where: { id: Number(roomId), pgId: Number(pgId) } })
        if (!room) return res.status(404).json({ message: 'Room not found' })

        const beds = await prisma.pGBed.findMany({
            where: { roomId: Number(roomId) },
            include: { guests: { where: { status: 'active' }, select: { id: true, name: true, phone: true } } },
            orderBy: { bedNumber: 'asc' },
        })

        res.json({ data: beds, total: beds.length })
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching beds', error: error.message })
    }
}

// Get all beds for a PG (across all rooms)
export const getBedsByPG = async (req: Request, res: Response) => {
    try {
        const { pgId } = req.params
        const { status } = req.query

        const where: any = { pgId: Number(pgId) }
        if (status) where.status = status

        const beds = await prisma.pGBed.findMany({
            where,
            include: {
                room: { select: { id: true, roomNumber: true, roomType: true } },
                guests: { where: { status: 'active' }, select: { id: true, name: true, phone: true } },
            },
            orderBy: [{ room: { roomNumber: 'asc' } }, { bedNumber: 'asc' }],
        })

        res.json({ data: beds, total: beds.length })
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching beds', error: error.message })
    }
}

// Update bed status
export const updateBed = async (req: Request, res: Response) => {
    try {
        const { pgId, roomId, bedId } = req.params
        const { status, bedNumber } = req.body

        const bed = await prisma.pGBed.findFirst({
            where: { id: Number(bedId), roomId: Number(roomId), pgId: Number(pgId) },
        })
        if (!bed) return res.status(404).json({ message: 'Bed not found' })

        const updated = await prisma.pGBed.update({
            where: { id: Number(bedId) },
            data: { ...(status && { status }), ...(bedNumber && { bedNumber }) },
        })

        res.json({ message: 'Bed updated successfully', data: updated })
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating bed', error: error.message })
    }
}

// Delete a bed
export const deleteBed = async (req: Request, res: Response) => {
    try {
        const { pgId, roomId, bedId } = req.params

        const bed = await prisma.pGBed.findFirst({
            where: { id: Number(bedId), roomId: Number(roomId), pgId: Number(pgId) },
        })
        if (!bed) return res.status(404).json({ message: 'Bed not found' })

        if (bed.status === 'occupied') {
            return res.status(400).json({ message: 'Cannot delete an occupied bed' })
        }

        await prisma.pGBed.delete({ where: { id: Number(bedId) } })
        res.json({ message: 'Bed deleted successfully' })
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting bed', error: error.message })
    }
}
