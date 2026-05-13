import { Request, Response } from 'express'
import { ExpenseService } from '../services/expense.service'
import { logger } from '../utils/logger'
import {
  sendBadRequest,
  sendCreated,
  sendError,
  sendNotFound,
  sendSuccess,
  sendList,
} from '../utils/response'

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const { category, amount, description, date } = req.body

    if (!category || amount === undefined) {
      return sendBadRequest(res, 'category and amount are required')
    }

    const expense = await ExpenseService.createExpense({
      pgId: Number(pgId),
      category: category as any,
      amount: Number(amount),
      description,
      date: date ? new Date(date) : new Date(),
    })

    return sendCreated(res, expense)
  } catch (error: any) {
    logger.error('Create expense failed', { error })
    return sendError(res, error?.message || 'Error creating expense')
  }
}

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const { category, from, to, skip = 0, limit = 20 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await ExpenseService.getExpensesByPG(
      Number(pgId),
      {
        startDate: from ? new Date(from as string) : undefined,
        endDate: to ? new Date(to as string) : undefined,
      },
      page,
      Number(limit)
    )

    return sendList(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount })
  } catch (error: any) {
    logger.error('Get expenses failed', { error })
    return sendError(res, error?.message || 'Error fetching expenses')
  }
}

export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { pgId, expenseId } = req.params

    const expense = await ExpenseService.getExpenseById(Number(pgId), Number(expenseId))
    if (!expense) return sendNotFound(res, 'Expense not found')

    return sendSuccess(res, expense)
  } catch (error: any) {
    logger.error('Get expense by id failed', { error })
    return sendError(res, error?.message || 'Error fetching expense')
  }
}

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { pgId, expenseId } = req.params
    const { category, amount, description, date } = req.body

    const expense = await ExpenseService.updateExpense(Number(pgId), Number(expenseId), {
      category: category as any,
      amount: amount !== undefined ? Number(amount) : undefined,
      description,
      date: date ? new Date(date) : undefined,
    })
    if (!expense) return sendNotFound(res, 'Expense not found')

    return sendSuccess(res, expense)
  } catch (error: any) {
    logger.error('Update expense failed', { error })
    return sendError(res, error?.message || 'Error updating expense')
  }
}

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { pgId, expenseId } = req.params

    const deleted = await ExpenseService.deleteExpense(Number(pgId), Number(expenseId))
    if (deleted.count === 0) return sendNotFound(res, 'Expense not found')

    return sendSuccess(res, { success: true })
  } catch (error: any) {
    logger.error('Delete expense failed', { error })
    return sendError(res, error?.message || 'Error deleting expense')
  }
}

export const getExpenseSummary = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const { from, to } = req.query

    const summary = await ExpenseService.getExpenseSummary(
      Number(pgId),
      from ? new Date(from as string) : undefined,
      to ? new Date(to as string) : undefined
    )

    return sendSuccess(res, summary)
  } catch (error: any) {
    logger.error('Get expense summary failed', { error })
    return sendError(res, error?.message || 'Error fetching expense summary')
  }
}
