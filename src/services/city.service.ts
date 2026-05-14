import { prisma } from '../db/prisma'

export interface CreateCityInput {
  name: string
  state?: string
}

export interface UpdateCityInput {
  name?: string
  state?: string
  status?: string
}

export class CityService {
  // Create new city
  static async createCity(data: CreateCityInput) {
    return prisma.city.create({
      data,
      include: {
        areas: true,
      },
    })
  }

  // Get all cities with filters and pagination
  static async getAllCities(
    filters?: {
      status?: string
    },
    pagination?: { page?: number; limit?: number }
  ) {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}
    if (filters?.status) where.status = filters.status

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        include: {
          areas: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.city.count({ where }),
    ])

    return {
      data: cities,
      pagination: {
        page,
        limit,
        totalCount: total,
      },
    }
  }

  // Get city by ID
  static async getCityById(id: number) {
    return prisma.city.findUnique({
      where: { id },
      include: {
        areas: true,
      },
    })
  }

  // Update city
  static async updateCity(id: number, data: UpdateCityInput) {
    return prisma.city.update({
      where: { id },
      data,
      include: {
        areas: true,
      },
    })
  }

  // Delete city
  static async deleteCity(id: number) {
    return prisma.city.delete({
      where: { id },
    })
  }

  // Get all cities with areas
  static async getCitiesWithAreas() {
    return prisma.city.findMany({
      where: { status: 'active' },
      include: {
        areas: {
          where: { status: 'active' },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })
  }
}
