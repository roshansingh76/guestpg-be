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
  createPGStaff,
  getPGStaff,
  getPGStaffById,
  updatePGStaff,
  deletePGStaff,
  changePGStaffStatus,
} from '../controllers/pgStaff.controller'
import {
  addPGPhoto,
  getPGPhotos,
  deletePGPhoto,
} from '../controllers/pgPhoto.controller'

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

// ============ PG Staff Routes ============
// Create staff member
router.post('/:pgId/staff', createPGStaff)

// Get all staff members
router.get('/:pgId/staff', getPGStaff)

// Get staff member by ID
router.get('/:pgId/staff/:staffId', getPGStaffById)

// Update staff member
router.put('/:pgId/staff/:staffId', updatePGStaff)

// Delete staff member
router.delete('/:pgId/staff/:staffId', deletePGStaff)

// Change staff member status
router.patch('/:pgId/staff/:staffId/status', changePGStaffStatus)

// ============ PG Photo Routes ============
// Add photo
router.post('/:pgId/photos', addPGPhoto)

// Get all photos
router.get('/:pgId/photos', getPGPhotos)

// Delete photo
router.delete('/:pgId/photos/:photoId', deletePGPhoto)

export default router
