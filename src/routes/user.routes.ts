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

const router = Router()

// Create user
router.post('/', createUser)

// Get all users (with filters and pagination)
router.get('/', getAllUsers)

// Get available PGs for assignment
router.get('/pgs/available', getAvailablePGs)

// Get user by ID
router.get('/:id', getUserById)

// Update user
router.put('/:id', updateUser)

// Delete user
router.delete('/:id', deleteUser)

// Change user status
router.patch('/:id/status', changeUserStatus)

// Get users by PG
router.get('/pg/:pgId', getUsersByPG)

export default router
