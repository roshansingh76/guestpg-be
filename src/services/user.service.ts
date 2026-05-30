import { prisma } from '../db/prisma'
import * as bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export interface CreateUserInput {
  name: string
  email: string
  phone: string
  password: string
  role: 'admin' | 'pg_owner' | 'pg_staff'
  pgId?: number
  pgIds?: number[]
  status?: 'active' | 'inactive'
}

export interface UpdateUserInput {
  name?: string
  email?: string
  phone?: string
  password?: string
  role?: 'admin' | 'pg_owner' | 'pg_staff'
  pgId?: number | null
  pgIds?: number[] | null
  status?: 'active' | 'inactive'
}

export class UserService {
  // Create new user
  static async createUser(data: CreateUserInput) {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: hashedPassword,
        role: data.role,
        pgId: data.pgId ?? data.pgIds?.[0] ?? null,
        status: data.status || 'active',
        userPGs:
          data.pgIds && data.pgIds.length > 0
            ? {
                create: data.pgIds.map((pgId) => ({ pg: { connect: { id: pgId } } })),
              }
            : data.pgId
            ? {
                create: { pg: { connect: { id: data.pgId } } },
              }
            : undefined,
      },
      include: {
        pg: true,
        userPGs: {
          select: {
            pgId: true,
            pg: {
              select: {
                id: true,
                pgName: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
    })

    const { passwordHash: _, ...userWithoutPassword } = user as any
    const pgIds = user.userPGs?.map((assignment: any) => assignment.pgId) ?? []
    return { ...userWithoutPassword, pgIds }
  }

  // Get all users with filters and pagination
  static async getAllUsers(
    filters?: {
      role?: string
      status?: string
      pgId?: number
    },
    pagination?: { page?: number; limit?: number }
  ) {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}
    if (filters?.role) where.role = filters.role
    if (filters?.status) where.status = filters.status
    if (filters?.pgId) where.userPGs = { some: { pgId: filters.pgId } }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          pgId: true,
          pg: {
            select: {
              id: true,
              pgName: true,
              city: true,
              state: true,
            },
          },
          userPGs: {
            select: {
              pgId: true,
              pg: {
                select: {
                  id: true,
                  pgName: true,
                  city: true,
                  state: true,
                },
              },
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    const mappedUsers = users.map((user: any) => {
      const pgIds = user.userPGs?.map((assignment: any) => assignment.pgId) ?? []
      return { ...user, pgIds }
    })

    return {
      data: mappedUsers,
      pagination: {
        skip,
        count: mappedUsers.length,
        totalCount: total,
      },
    }
  }

  // Get user by ID
  static async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        pgId: true,
        pg: {
          select: {
            id: true,
            pgName: true,
            city: true,
            state: true,
            pgType: true,
          },
        },
        userPGs: {
          select: {
            pgId: true,
            pg: {
              select: {
                id: true,
                pgName: true,
                city: true,
                state: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) return null

    const pgIds = user.userPGs?.map((assignment: any) => assignment.pgId) ?? []
    return { ...user, pgIds }
  }

  // Update user
  static async updateUser(id: number, data: UpdateUserInput) {
    const updateData: any = {}

    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.phone) updateData.phone = data.phone
    if (data.role) updateData.role = data.role
    if (data.status) updateData.status = data.status
    if (data.pgId !== undefined) updateData.pgId = data.pgId
    if (data.pgIds !== undefined) {
      updateData.pgId = data.pgIds && data.pgIds.length > 0 ? data.pgIds[0] : null
      updateData.userPGs = {
        deleteMany: {},
        create: data.pgIds?.map((pgId) => ({ pg: { connect: { id: pgId } } })) ?? [],
      }
    }

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        pgId: true,
        pg: {
          select: {
            id: true,
            pgName: true,
            city: true,
            state: true,
          },
        },
        userPGs: {
          select: {
            pgId: true,
            pg: {
              select: {
                id: true,
                pgName: true,
                city: true,
                state: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    const pgIds = user.userPGs?.map((assignment: any) => assignment.pgId) ?? []
    return { ...user, pgIds }
  }

  // Delete user
  static async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id },
    })
  }

  // Check if email exists
  static async emailExists(email: string, excludeId?: number) {
    const where: any = { email }
    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    return prisma.user.findFirst({ where })
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userPGs: {
          select: {
            pgId: true,
          },
        },
      },
    })

    if (!user) {
      return null
    }

    // Check if user is active
    if (user.status !== 'active') {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return null
    }

    const { passwordHash: _, userPGs, ...userWithoutPassword } = user as any
    const pgIds = userPGs?.map((assignment: any) => assignment.pgId) ?? []
    return { ...userWithoutPassword, pgIds }
  }

  // Get all available PGs for assignment
  static async getAvailablePGs() {
    return prisma.pG.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        pgName: true,
        city: true,
        state: true,
        pgType: true,
        area: true,
        ownerName: true,
      },
      orderBy: { pgName: 'asc' },
    })
  }

  // Get user count by role
  static async getUserCountByRole(role: string) {
    return prisma.user.count({
      where: { role: role as any },
    })
  }

  // Get user statistics
  static async getUserStatistics() {
    const total = await prisma.user.count()
    const admins = await prisma.user.count({ where: { role: 'admin' } })
    const pgOwners = await prisma.user.count({ where: { role: 'pg_owner' } })
    const pgStaff = await prisma.user.count({ where: { role: 'pg_staff' } })
    const active = await prisma.user.count({ where: { status: 'active' } })
    const inactive = total - active

    return {
      total,
      admins,
      pgOwners,
      pgStaff,
      active,
      inactive,
    }
  }
}
