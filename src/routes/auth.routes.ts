import { Router } from 'express'
import { login, changePassword, getProfile } from '../controllers/auth.controller'
import { authRequired } from '../middleware/auth'

const router = Router()

router.post('/login', login)
router.get('/profile', authRequired, getProfile)
router.put('/change-password', authRequired, changePassword)

export default router
