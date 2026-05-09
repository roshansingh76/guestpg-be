import { prisma } from '../db/prisma'
import { PGStatus, PGType } from '@prisma/client'

export interface CreatePGInput {
  pgName: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  addressLine1: string
  addressLine2?: string
  nearbyMark?: string
  area: string
  city: string
  state: string
  latitude: number
  longitude: number
  pgType: PGType
  numberOfRooms: number
  isFoodAvailable?: boolean
}

export interface UpdatePGInput {
  pgName?: string
  ownerName?: string
  ownerPhone?: string
  ownerEmail?: string
  addressLine1?: string
  addressLine2?: string
  nearbyMark?: string
  area?: string
  city?: string
  state?: string
  latitude?: number
  longitude?: number
  pgType?: PGType
  numberOfRooms?: number
  isFoodAvailable?: boolean
  status?: PGStatus
}

export class PGService {
  // Create new PG
  static async createPG(data: CreatePGInput) {
    return prisma.pG.create({
      data,
      include: {
        rooms: true,
        staff: true,
        photos: true,
      },
    })
  }

  // Get all PGs with filters and pagination
  static async getAllPGs(
    filters?: {
      status?: PGStatus
      city?: string
      pgType?: string
    },
    pagination?: { page?: number; limit?: number }
  ) {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}
    if (filters?.status) where.status = filters.status
    if (filters?.city) where.city = filters.city
    if (filters?.pgType) where.pgType = filters.pgType

    const [pgs, total] = await Promise.all([
      prisma.pG.findMany({
        where,
        include: {
          rooms: true,
          staff: true,
          photos: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pG.count({ where }),
    ])

    return {
      data: pgs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Get PG by ID
  static async getPGById(id: number) {
    return prisma.pG.findUnique({
      where: { id },
      include: {
        rooms: true,
        staff: true,
        photos: true,
      },
    })
  }

  // Update PG
  static async updatePG(id: number, data: UpdatePGInput) {
    return prisma.pG.update({
      where: { id },
      data,
      include: {
        rooms: true,
        staff: true,
        photos: true,
      },
    })
  }

  // Delete PG
  static async deletePG(id: number) {
    return prisma.pG.delete({
      where: { id },
    })
  }

  // Check if email exists
  static async emailExists(email: string, excludeId?: number) {
    const where: any = { ownerEmail: email }
    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    return prisma.pG.findFirst({ where })
  }

  // Get PG statistics
  static async getPGStatistics() {
    const totalPGs = await prisma.pG.count()
    const activePGs = await prisma.pG.count({
      where: { status: 'active' },
    })
    const totalRooms = await prisma.pGRoom.count()
    const totalStaff = await prisma.pGStaff.count()

    return {
      totalPGs,
      activePGs,
      inactivePGs: totalPGs - activePGs,
      totalRooms,
      totalStaff,
    }
  }
}
