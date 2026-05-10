import { Router } from 'express'
import {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseSummary,
} from '../controllers/expense.controller'

const router = Router({ mergeParams: true })

router.get('/summary', getExpenseSummary)
router.get('/', getExpenses)
router.get('/:expenseId', getExpenseById)
router.post('/', createExpense)
router.put('/:expenseId', updateExpense)
router.delete('/:expenseId', deleteExpense)

export default router
