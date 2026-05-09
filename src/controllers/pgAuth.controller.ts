import { Request, Response } from 'express'
import { PGStaffService } from '../services/pgStaff.service'
import { generateToken } from '../middleware/pgAuth'
import * as bcrypt from 'bcryptjs'

// Staff login
export const pgStaffLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
      })
    }

    // Authenticate staff member
    const staff = await PGStaffService.authenticateStaff(username, password)

    if (!staff) {
      return res.status(401).json({
        message: 'Invalid username or password',
      })
    }

    // Check if staff is active
    if (staff.status !== 'active') {
      return res.status(403).json({
        message: 'Your account has been deactivated',
      })
    }

    // Generate JWT token
    const token = generateToken(staff.id, staff.pgId, staff.username, staff.role as 'Owner' | 'Manager')

    res.json({
      message: 'Login successful',
      token,
      data: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        pgId: staff.pgId,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error during login',
      error: error.message,
    })
  }
}

// Staff logout (optional - client-side would handle token removal)
export const pgStaffLogout = async (req: Request, res: Response) => {
  try {
    res.json({
      message: 'Logout successful. Please remove the token from client.',
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error during logout',
      error: error.message,
    })
  }
}

// Change password for staff member
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { pgId, staffId } = req.params
    const { currentPassword, newPassword, confirmPassword } = req.body

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'All password fields are required',
      })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New password and confirm password do not match',
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
      })
    }

    // Get staff member
    const staff = await PGStaffService.getStaffById(Number(staffId), Number(pgId))

    if (!staff) {
      return res.status(404).json({
        message: 'Staff member not found',
      })
    }

    // Verify current password (get full staff record with password)
    const { prisma } = require('../db/prisma')
    const staffWithPassword = await prisma.pGStaff.findUnique({
      where: { id: Number(staffId) },
    })

    const isPasswordValid = await bcrypt.compare(currentPassword, staffWithPassword.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Current password is incorrect',
      })
    }

    // Update password
    await PGStaffService.updateStaff(Number(staffId), Number(pgId), {
      password: newPassword,
    })

    res.json({
      message: 'Password changed successfully',
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error changing password',
      error: error.message,
    })
  }
}

// Get current staff profile
export const getCurrentProfile = async (req: Request, res: Response) => {
  try {
    const { pgId, staffId } = req.params

    const staff = await PGStaffService.getStaffById(Number(staffId), Number(pgId))

    if (!staff) {
      return res.status(404).json({
        message: 'Staff member not found',
      })
    }

    res.json(staff)
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message,
    })
  }
}
