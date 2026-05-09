import { Router } from 'express'
import { authRequired } from '../middleware/auth'
import { createGuest, deleteGuest, listGuests, updateGuest } from '../controllers/guest.controller'

const router = Router()

router.get('/', authRequired, listGuests)
router.post('/', authRequired, createGuest)
router.put('/:id', authRequired, updateGuest)
router.delete('/:id', authRequired, deleteGuest)

export default router

