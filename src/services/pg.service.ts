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
  areaId: number
  cityId: number
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
  areaId?: number
  cityId?: number
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
        photos: true,
        city: true,
        area: true,
      },
    })
  }

  // Get all PGs with filters and pagination
  static async getAllPGs(
    filters?: {
      status?: PGStatus
      cityId?: number
      pgType?: string
      userId?: number
      userRole?: string
      userPgId?: number
      userPgIds?: number[]
    },
    pagination?: { page?: number; limit?: number }
  ) {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}
    if (filters?.status) where.status = filters.status
    if (filters?.cityId) where.cityId = filters.cityId
    if (filters?.pgType) where.pgType = filters.pgType

    // Filter PGs based on user role
    if (filters?.userRole === 'pg_owner' || filters?.userRole === 'pg_staff') {
      if (filters?.userPgIds && filters.userPgIds.length > 0) {
        where.id = { in: filters.userPgIds }
      } else if (filters?.userPgId) {
        where.id = filters.userPgId
      } else {
        // If user doesn't have any assigned PGs, return no PGs
        where.id = -1
      }
    }
    // super_admin and admin can see all PGs (no additional filtering needed)

    const [pgs, total] = await Promise.all([
      prisma.pG.findMany({
        where,
        include: {
          rooms: true,
          photos: true,
          city: true,
          area: true,
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
        skip,
        count: pgs.length,
        totalCount: total,
      },
    }
  }

  // Get PG by ID
  static async getPGById(id: number) {
    return prisma.pG.findUnique({
      where: { id },
      include: {
        rooms: true,
        photos: true,
        city: true,
        area: true,
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
        photos: true,
        city: true,
        area: true,
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
    const totalUsers = await prisma.user.count({
      where: { role: { in: ['pg_owner', 'pg_staff'] } },
    })

    return {
      totalPGs,
      activePGs,
      inactivePGs: totalPGs - activePGs,
      totalRooms,
      totalUsers,
    }
  }
}
