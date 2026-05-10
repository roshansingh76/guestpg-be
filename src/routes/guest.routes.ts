import { Router } from 'express'
import { authRequired } from '../middleware/auth'
import {
    listGuests,
    getGuest,
    createGuest,
    updateGuest,
    checkoutGuest,
    deleteGuest,
} from '../controllers/guest.controller'

const router = Router({ mergeParams: true })

router.get('/', authRequired, listGuests)
router.get('/:id', authRequired, getGuest)
router.post('/', authRequired, createGuest)
router.put('/:id', authRequired, updateGuest)
router.patch('/:id/checkout', authRequired, checkoutGuest)
router.delete('/:id', authRequired, deleteGuest)

export default router
