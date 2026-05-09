import { prisma } from '../db/prisma'
import { RoomType } from '@prisma/client'

export interface CreateRoomInput {
  pgId: number
  roomType: string
  roomNumber: string
  totalBeds: number
  availableBeds: number
  pricePerBed: number
  acType: RoomType
}

export interface UpdateRoomInput {
  roomType?: string
  roomNumber?: string
  totalBeds?: number
  availableBeds?: number
  pricePerBed?: number
  acType?: RoomType
}

export class RoomService {
  // Create new room
  static async createRoom(data: CreateRoomInput) {
    return prisma.pGRoom.create({
      data,
    })
  }

  // Get rooms for PG
  static async getRoomsByPG(
    pgId: number,
    pagination?: { page?: number; limit?: number }
  ) {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 10
    const skip = (page - 1) * limit

    const [rooms, total] = await Promise.all([
      prisma.pGRoom.findMany({
        where: { pgId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pGRoom.count({ where: { pgId } }),
    ])

    return {
      data: rooms,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Get room by ID
  static async getRoomById(id: number, pgId: number) {
    return prisma.pGRoom.findFirst({
      where: {
        id,
        pgId,
      },
    })
  }

  // Update room
  static async updateRoom(id: number, pgId: number, data: UpdateRoomInput) {
    return prisma.pGRoom.updateMany({
      where: {
        id,
        pgId,
      },
      data,
    })
  }

  // Delete room
  static async deleteRoom(id: number, pgId: number) {
    return prisma.pGRoom.deleteMany({
      where: {
        id,
        pgId,
      },
    })
  }

  // Check if room number exists for PG
  static async roomNumberExists(pgId: number, roomNumber: string, excludeId?: number) {
    const where: any = {
      pgId,
      roomNumber,
    }
    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    return prisma.pGRoom.findFirst({ where })
  }

  // Get available beds count for PG
  static async getAvailableBeds(pgId: number) {
    const rooms = await prisma.pGRoom.findMany({
      where: { pgId },
    })

    return rooms.reduce((total, room) => total + room.availableBeds, 0)
  }

  // Update available beds
  static async updateAvailableBeds(
    roomId: number,
    pgId: number,
    availableBeds: number
  ) {
    return prisma.pGRoom.updateMany({
      where: {
        id: roomId,
        pgId,
      },
      data: { availableBeds },
    })
  }
}
