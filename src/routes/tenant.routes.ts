import { Router } from 'express'
import multer from 'multer'
import { authRequired } from '../middleware/auth'
import {
  listTenants,
  getTenant,
  createTenant,
  updateTenant,
  checkoutTenant,
  deleteTenant,
} from '../controllers/tenant.controller'

const upload = multer({ storage: multer.memoryStorage() })
const router = Router({ mergeParams: true })

router.get('/', authRequired, listTenants)
router.get('/:id', authRequired, getTenant)
router.post('/', authRequired, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'idProof', maxCount: 1 }]), createTenant)
router.put('/:id', authRequired, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'idProof', maxCount: 1 }]), updateTenant)
router.patch('/:id/checkout', authRequired, checkoutTenant)
router.delete('/:id', authRequired, deleteTenant)

export default router
