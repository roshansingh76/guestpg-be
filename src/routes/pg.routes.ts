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
import { authRequired } from '../middleware/auth'
import {
  addPGPhoto,
  getPGPhotos,
  deletePGPhoto,
} from '../controllers/pgPhoto.controller'
import expenseRoutes from './expense.routes'
import tenantRoutes from './tenant.routes'
import billingRoutes from './billing.routes'

const router = Router()

// ============ PG Routes ============
router.post('/', authRequired, createPG)
router.get('/', authRequired, getAllPGs)
router.get('/:id', authRequired, getPGById)
router.put('/:id', authRequired, updatePG)
router.delete('/:id', authRequired, deletePG)
router.patch('/:id/status', authRequired, changePGStatus)

// ============ PG Room Routes ============
router.post('/:pgId/rooms', createRoom)
router.get('/:pgId/rooms', getRoomsByPG)
router.get('/:pgId/rooms/:roomId', getRoomById)
router.put('/:pgId/rooms/:roomId', updateRoom)
router.delete('/:pgId/rooms/:roomId', deleteRoom)

// ============ PG Photo Routes ============
router.post('/:pgId/photos', addPGPhoto)
router.get('/:pgId/photos', getPGPhotos)
router.delete('/:pgId/photos/:photoId', deletePGPhoto)

// ============ Expense Routes ============
router.use('/:pgId/expenses', expenseRoutes)

// ============ Tenant Routes ============
router.use('/:pgId/tenants', tenantRoutes)

// ============ Billing Routes ============
router.use('/:pgId/bills', billingRoutes)

export default router
