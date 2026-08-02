import { Router } from 'express'
import {
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteState,
} from '../controllers/state.controller'
import { authRequired } from '../middleware/auth'

const router = Router()

router.post('/', authRequired, createState)
router.get('/', authRequired, getAllStates)
router.get('/:id', authRequired, getStateById)
router.put('/:id', authRequired, updateState)
router.delete('/:id', authRequired, deleteState)

export default router
