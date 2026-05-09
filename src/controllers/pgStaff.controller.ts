import { Request, Response } from 'express'
import { prisma } from '../db/prisma'
import * as bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

// Create a new staff member for a PG
export const createPGStaff = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const { name, email, phone, role, username, password } = req.body

    // Validate required fields
    if (!name || !email || !phone || !role || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Validate role
    if (!['Owner', 'Manager'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be Owner or Manager',
      })
    }

    // Check if PG exists
    const pg = await prisma.pG.findUnique({
      where: { id: Number(pgId) },
    })

    if (!pg) {
      return res.status(404).json({ message: 'PG not found' })
    }

    // Check if username already exists
    const existingUser = await prisma.pGStaff.findUnique({
      where: { username },
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const staff = await prisma.pGStaff.create({
      data: {
        pgId: Number(pgId),
        name,
        email,
        phone,
        role,
        username,
        password: hashedPassword,
      },
    })

    // Return without password
    const { password: _, ...staffWithoutPassword } = staff
    res.status(201).json({
      message: 'Staff member created successfully',
      data: staffWithoutPassword,
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Email or username already exists',
      })
    }
    res.status(500).json({
      message: 'Error creating staff member',
      error: error.message,
    })
  }
}

// Get all staff members for a PG
export const getPGStaff = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const { status, role, page = 1, limit = 10 } = req.query

    // Check if PG exists
    const pg = await prisma.pG.findUnique({
      where: { id: Number(pgId) },
    })

    if (!pg) {
      return res.status(404).json({ message: 'PG not found' })
    }

    const where: any = { pgId: Number(pgId) }
    if (status) where.status = status
    if (role) where.role = role

    const skip = (Number(page) - 1) * Number(limit)

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
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pGStaff.count({ where }),
    ])

    res.json({
      data: staff,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching staff members',
      error: error.message,
    })
  }
}

// Get staff member by ID
export const getPGStaffById = async (req: Request, res: Response) => {
  try {
    const { pgId, staffId } = req.params

    const staff = await prisma.pGStaff.findFirst({
      where: {
        id: Number(staffId),
        pgId: Number(pgId),
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

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' })
    }

    res.json(staff)
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching staff member',
      error: error.message,
    })
  }
}

// Update staff member
export const updatePGStaff = async (req: Request, res: Response) => {
  try {
    const { pgId, staffId } = req.params
    const { name, email, phone, role, username, password } = req.body

    // Validate role if provided
    if (role && !['Owner', 'Manager'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be Owner or Manager',
      })
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (role) updateData.role = role
    if (username) updateData.username = username
    if (password) {
      updateData.password = await bcrypt.hash(password, SALT_ROUNDS)
    }

    const staff = await prisma.pGStaff.updateMany({
      where: {
        id: Number(staffId),
        pgId: Number(pgId),
      },
      data: updateData,
    })

    if (staff.count === 0) {
      return res.status(404).json({ message: 'Staff member not found' })
    }

    const updatedStaff = await prisma.pGStaff.findUnique({
      where: { id: Number(staffId) },
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

    res.json({
      message: 'Staff member updated successfully',
      data: updatedStaff,
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Email or username already exists',
      })
    }
    res.status(500).json({
      message: 'Error updating staff member',
      error: error.message,
    })
  }
}

// Delete staff member
export const deletePGStaff = async (req: Request, res: Response) => {
  try {
    const { pgId, staffId } = req.params

    const staff = await prisma.pGStaff.deleteMany({
      where: {
        id: Number(staffId),
        pgId: Number(pgId),
      },
    })

    if (staff.count === 0) {
      return res.status(404).json({ message: 'Staff member not found' })
    }

    res.json({
      message: 'Staff member deleted successfully',
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error deleting staff member',
      error: error.message,
    })
  }
}

// Change staff member status
export const changePGStaffStatus = async (req: Request, res: Response) => {
  try {
    const { pgId, staffId } = req.params
    const { status } = req.body

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be active or inactive',
      })
    }

    const staff = await prisma.pGStaff.updateMany({
      where: {
        id: Number(staffId),
        pgId: Number(pgId),
      },
      data: { status },
    })

    if (staff.count === 0) {
      return res.status(404).json({ message: 'Staff member not found' })
    }

    const updatedStaff = await prisma.pGStaff.findUnique({
      where: { id: Number(staffId) },
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

    res.json({
      message: 'Staff member status updated successfully',
      data: updatedStaff,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error updating staff member status',
      error: error.message,
    })
  }
}
