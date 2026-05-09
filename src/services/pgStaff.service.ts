import { prisma } from '../db/prisma'
import { UserRole, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export interface CreatePGStaffInput {
  pgId: number
  name: string
  email: string
  phone: string
  role: UserRole
  username: string
  password: string
}

export interface UpdatePGStaffInput {
  name?: string
  email?: string
  phone?: string
  role?: UserRole
  username?: string
  password?: string
  status?: UserStatus
}

export class PGStaffService {
  // Create new staff member
  static async createStaff(data: CreatePGStaffInput) {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)

    return prisma.pGStaff.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    })
  }

  // Get staff members for PG
  static async getStaffByPG(
    pgId: number,
    filters?: {
      status?: UserStatus
      role?: UserRole
    },
    pagination?: { page?: number; limit?: number }
  ) {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 10
    const skip = (page - 1) * limit

    const where: any = { pgId }
    if (filters?.status) where.status = filters.status
    if (filters?.role) where.role = filters.role

    const [staff, total] = await Promise.all([
      prisma.pGStaff.findMany({
        where,
        select: {
          id: true,
          pgId: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          username: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pGStaff.count({ where }),
    ])

    return {
      data: staff,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Get staff member by ID
  static async getStaffById(id: number, pgId: number) {
    return prisma.pGStaff.findFirst({
      where: {
        id,
        pgId,
      },
      select: {
        id: true,
        pgId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        username: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  // Update staff member
  static async updateStaff(id: number, pgId: number, data: UpdatePGStaffInput) {
    const updateData: any = {}

    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.phone) updateData.phone = data.phone
    if (data.role) updateData.role = data.role
    if (data.username) updateData.username = data.username
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS)
    }
    if (data.status) updateData.status = data.status

    return prisma.pGStaff.updateMany({
      where: {
        id,
        pgId,
      },
      data: updateData,
    })
  }

  // Delete staff member
  static async deleteStaff(id: number, pgId: number) {
    return prisma.pGStaff.deleteMany({
      where: {
        id,
        pgId,
      },
    })
  }

  // Check if username exists
  static async usernameExists(username: string, excludeId?: number) {
    const where: any = { username }
    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    return prisma.pGStaff.findFirst({ where })
  }

  // Check if email exists
  static async emailExists(email: string, excludeId?: number) {
    const where: any = { email }
    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    return prisma.pGStaff.findFirst({ where })
  }

  // Authenticate staff member
  static async authenticateStaff(username: string, password: string) {
    const staff = await prisma.pGStaff.findFirst({
      where: { username },
    })

    if (!staff) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password)

    if (!isPasswordValid) {
      return null
    }

    const { password: _, ...staffWithoutPassword } = staff
    return staffWithoutPassword
  }

  // Get staff count by PG
  static async getStaffCountByPG(pgId: number) {
    return prisma.pGStaff.count({
      where: { pgId },
    })
  }
}
