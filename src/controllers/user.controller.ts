import { Request, Response } from 'express'
import { UserService } from '../services/user.service'

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      pgId,
      status,
    } = req.body

    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Validate role
    if (!['admin', 'pg_owner', 'pg_staff'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be admin, pg_owner, or pg_staff',
      })
    }

    // Validate that pgId is provided for pg_owner and pg_staff
    if ((role === 'pg_owner' || role === 'pg_staff') && !pgId) {
      return res.status(400).json({
        message: `pgId is required for role: ${role}`,
      })
    }

    const user = await UserService.createUser({
      name,
      email,
      phone,
      password,
      role,
      pgId,
      status: status || 'active',
    })

    res.status(201).json({
      message: 'User created successfully',
      data: user,
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Email already exists',
      })
    }
    res.status(500).json({
      message: 'Error creating user',
      error: error.message,
    })
  }
}

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, status, pgId, page = 1, limit = 10 } = req.query

    const filters: any = {}
    if (role) filters.role = role
    if (status) filters.status = status
    if (pgId) filters.pgId = Number(pgId)

    const result = await UserService.getAllUsers(
      filters,
      { page: Number(page), limit: Number(limit) }
    )

    res.json(result)
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message,
    })
  }
}

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await UserService.getUserById(Number(id))

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching user',
      error: error.message,
    })
  }
}

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      name,
      email,
      phone,
      role,
      pgId,
      status,
      password,
    } = req.body

    // Validate role if provided
    if (role && !['admin', 'pg_owner', 'pg_staff'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be admin, pg_owner, or pg_staff',
      })
    }

    // Validate that pgId is provided for pg_owner and pg_staff
    if ((role === 'pg_owner' || role === 'pg_staff') && !pgId) {
      return res.status(400).json({
        message: `pgId is required for role: ${role}`,
      })
    }

    const user = await UserService.updateUser(Number(id), {
      name,
      email,
      phone,
      role,
      pgId,
      status,
      password,
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      message: 'User updated successfully',
      data: user,
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Email already exists',
      })
    }
    res.status(500).json({
      message: 'Error updating user',
      error: error.message,
    })
  }
}

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await UserService.deleteUser(Number(id))

    res.json({
      message: 'User deleted successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message,
    })
  }
}

// Change user status
export const changeUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be active or inactive',
      })
    }

    const user = await UserService.updateUser(Number(id), { status })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      message: 'User status updated successfully',
      data: user,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error updating user status',
      error: error.message,
    })
  }
}

// Get users by PG
export const getUsersByPG = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const { page = 1, limit = 10 } = req.query

    const result = await UserService.getAllUsers(
      { pgId: Number(pgId) },
      { page: Number(page), limit: Number(limit) }
    )

    res.json(result)
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message,
    })
  }
}

// Get available PGs for user assignment
export const getAvailablePGs = async (req: Request, res: Response) => {
  try {
    const pgs = await UserService.getAvailablePGs()

    res.json({
      data: pgs,
      total: pgs.length,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching PGs',
      error: error.message,
    })
  }
}
