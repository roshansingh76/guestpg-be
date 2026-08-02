import { prisma } from '../db/prisma'

export interface CreateStateInput {
  name: string
}

export interface UpdateStateInput {
  name?: string
  isActive?: number
}

export class StateService {
  // Create new state
  static async createState(data: CreateStateInput) {
    return prisma.state.create({
      data,
      include: {
        cities: true,
      },
    })
  }

  // Get all states with filters and pagination
  static async getAllStates(
    filters?: {
      isActive?: number
    },
    pagination?: { page?: number; limit?: number }
  ) {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 100
    const skip = (page - 1) * limit

    const where: any = {}
    if (filters?.isActive !== undefined) where.isActive = filters.isActive

    const [states, total] = await Promise.all([
      prisma.state.findMany({
        where,
        include: {
          cities: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.state.count({ where }),
    ])

    return {
      data: states,
      pagination: {
        page,
        limit,
        totalCount: total,
      },
    }
  }

  // Get state by ID
  static async getStateById(id: number) {
    return prisma.state.findUnique({
      where: { id },
      include: {
        cities: true,
      },
    })
  }

  // Update state
  static async updateState(id: number, data: UpdateStateInput) {
    return prisma.state.update({
      where: { id },
      data,
      include: {
        cities: true,
      },
    })
  }

  // Delete state
  static async deleteState(id: number) {
    return prisma.state.delete({
      where: { id },
    })
  }
}
