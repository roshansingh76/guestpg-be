import { Router } from 'express'
import {
  createCity,
  getAllCities,
  getCityById,
  updateCity,
  deleteCity,
  getCitiesWithAreas,
} from '../controllers/city.controller'
import { authRequired } from '../middleware/auth'

const router = Router()

// Public routes
router.get('/with-areas', getCitiesWithAreas)

// Protected routes (admin only)
router.post('/', authRequired, createCity)
router.get('/', authRequired, getAllCities)
router.get('/:id', authRequired, getCityById)
router.put('/:id', authRequired, updateCity)
router.delete('/:id', authRequired, deleteCity)

export default router
