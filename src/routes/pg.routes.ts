import { Router } from 'express'
import {
  createPG,
  getAllPGs,
  getPGById,
  updatePG,
  deletePG,
  changePGStatus,
} from '../controllers/pg.controller'
import {
  createRoom,
  getRoomsByPG,
  getRoomById,
  updateRoom,
  deleteRoom,
} from '../controllers/pgRoom.controller'
import {
  addPGPhoto,
  getPGPhotos,
  deletePGPhoto,
} from '../controllers/pgPhoto.controller'
import {
  createBed,
  getBedsByRoom,
  getBedsByPG,
  updateBed,
  deleteBed,
} from '../controllers/pgBed.controller'
import expenseRoutes from './expense.routes'
import guestRoutes from './guest.routes'
import billingRoutes from './billing.routes'

const router = Router()

// ============ PG Routes ============
// Create PG
router.post('/', createPG)

// Get all PGs
router.get('/', getAllPGs)

// Get PG by ID
router.get('/:id', getPGById)

// Update PG
router.put('/:id', updatePG)

// Delete PG
router.delete('/:id', deletePG)

// Change PG status
router.patch('/:id/status', changePGStatus)

// ============ PG Room Routes ============
// Create room for PG
router.post('/:pgId/rooms', createRoom)

// Get all rooms for PG
router.get('/:pgId/rooms', getRoomsByPG)

// Get room by ID
router.get('/:pgId/rooms/:roomId', getRoomById)

// Update room
router.put('/:pgId/rooms/:roomId', updateRoom)

// Delete room
router.delete('/:pgId/rooms/:roomId', deleteRoom)

// ============ PG Photo Routes ============
// Add photo
router.post('/:pgId/photos', addPGPhoto)

// Get all photos
router.get('/:pgId/photos', getPGPhotos)

// Delete photo
router.delete('/:pgId/photos/:photoId', deletePGPhoto)

// ============ PG Bed Routes ============
router.post('/:pgId/rooms/:roomId/beds', createBed)
router.get('/:pgId/rooms/:roomId/beds', getBedsByRoom)
router.get('/:pgId/beds', getBedsByPG)
router.put('/:pgId/rooms/:roomId/beds/:bedId', updateBed)
router.delete('/:pgId/rooms/:roomId/beds/:bedId', deleteBed)

// ============ Expense Routes ============
router.use('/:pgId/expenses', expenseRoutes)

// ============ Guest / Tenant Routes ============
router.use('/:pgId/guests', guestRoutes)

// ============ Billing Routes ============
router.use('/:pgId/bills', billingRoutes)

export default router
