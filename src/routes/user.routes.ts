import { Router } from 'express'
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserStatus,
  getUsersByPG,
  getAvailablePGs,
} from '../controllers/user.controller'
import { authRequired } from '../middleware/auth'

const router = Router()

// Create user
router.post('/', authRequired, createUser)

// Get all users (with filters and pagination)
router.get('/', authRequired, getAllUsers)

// Get available PGs for assignment
router.get('/pgs/available', authRequired, getAvailablePGs)

// Get users by PG
router.get('/pg/:pgId', authRequired, getUsersByPG)

// Get user by ID
router.get('/:id', authRequired, getUserById)

// Update user
router.put('/:id', authRequired, updateUser)

// Delete user
router.delete('/:id', authRequired, deleteUser)

// Change user status
router.patch('/:id/status', authRequired, changeUserStatus)

export default router
