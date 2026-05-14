import { prisma } from '../db/prisma'

export interface CreateAreaInput {
  name: string
  cityId: number
}

export interface UpdateAreaInput {
  name?: string
  cityId?: number
  status?: string
}

export class AreaService {
  // Create new area
  static async createArea(data: CreateAreaInput) {
    return prisma.area.create({
      data,
      include: {
        city: true,
      },
    })
  }

  // Get all areas with filters and pagination
  static async getAllAreas(
    filters?: {
      cityId?: number
      status?: string
    },
    pagination?: { page?: number; limit?: number }
  ) {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}
    if (filters?.status) where.status = filters.status
    if (filters?.cityId) where.cityId = filters.cityId

    const [areas, total] = await Promise.all([
      prisma.area.findMany({
        where,
        include: {
          city: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.area.count({ where }),
    ])

    return {
      data: areas,
      pagination: {
        page,
        limit,
        totalCount: total,
      },
    }
  }

  // Get area by ID
  static async getAreaById(id: number) {
    return prisma.area.findUnique({
      where: { id },
      include: {
        city: true,
      },
    })
  }

  // Update area
  static async updateArea(id: number, data: UpdateAreaInput) {
    return prisma.area.update({
      where: { id },
      data,
      include: {
        city: true,
      },
    })
  }

  // Delete area
  static async deleteArea(id: number) {
    return prisma.area.delete({
      where: { id },
    })
  }

  // Get areas by city ID
  static async getAreasByCity(cityId: number) {
    return prisma.area.findMany({
      where: { cityId, status: 'active' },
      orderBy: { name: 'asc' },
    })
  }
}
