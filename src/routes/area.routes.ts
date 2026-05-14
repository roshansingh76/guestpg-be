import { Router } from 'express'
import {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea,
  getAreasByCity,
} from '../controllers/area.controller'
import { authRequired } from '../middleware/auth'

const router = Router()

// Public route
router.get('/city/:cityId', getAreasByCity)

// Protected routes (admin only)
router.post('/', authRequired, createArea)
router.get('/', authRequired, getAllAreas)
router.get('/:id', authRequired, getAreaById)
router.put('/:id', authRequired, updateArea)
router.delete('/:id', authRequired, deleteArea)

export default router
