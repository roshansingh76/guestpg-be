import { Router } from 'express'
import {
    generateBills,
    getBills,
    getBillById,
    recordPayment,
    getOverdueBills,
    getReceipt,
} from '../controllers/billing.controller'
import { authRequired } from '../middleware/auth'

const router = Router({ mergeParams: true })

router.post('/generate', authRequired, generateBills)
router.get('/', authRequired, getBills)
router.get('/overdue', authRequired, getOverdueBills)
router.get('/:billId', authRequired, getBillById)
router.get('/:billId/receipt', authRequired, getReceipt)
router.post('/:billId/payments', authRequired, recordPayment)

export default router
