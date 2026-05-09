import { Router } from 'express'
import {
  pgStaffLogin,
  pgStaffLogout,
  changePassword,
  getCurrentProfile,
} from '../controllers/pgAuth.controller'
import { verifyToken, belongsToPG } from '../middleware/pgAuth'

const router = Router()

// Public routes
// Staff login
router.post('/login', pgStaffLogin)

// Protected routes
// Staff logout
router.post('/logout', verifyToken, pgStaffLogout)

// Change password
router.put('/:pgId/staff/:staffId/change-password', verifyToken, belongsToPG, changePassword)

// Get current profile
router.get('/:pgId/staff/:staffId/profile', verifyToken, belongsToPG, getCurrentProfile)

export default router
