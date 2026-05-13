import { prisma } from '../db/prisma'
import { ExpenseCategory } from '@prisma/client'

export interface CreateExpenseInput {
  pgId: number
  category: ExpenseCategory
  amount: number
  description?: string
  date: Date
}

export interface UpdateExpenseInput {
  category?: ExpenseCategory
  amount?: number
  description?: string
  date?: Date
}

export class ExpenseService {
  static async createExpense(data: CreateExpenseInput) {
    return prisma.expense.create({
      data,
    })
  }

  static async getExpensesByPG(pgId: number, filters?: { startDate?: Date; endDate?: Date }, page = 1, limit = 10) {
    const where: any = { pgId }
    if (filters?.startDate) {
      where.date = { gte: filters.startDate }
    }
    if (filters?.endDate) {
      where.date = where.date || {}
      where.date.lte = filters.endDate
    }

    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.expense.count({ where }),
    ])

    return {
      data,
      pagination: {
        skip,
        count: data.length,
        totalCount: total,
      },
    }
  }

  static async getExpenseById(pgId: number, expenseId: number) {
    return prisma.expense.findFirst({
      where: { id: expenseId, pgId },
    })
  }

  static async updateExpense(pgId: number, expenseId: number, data: UpdateExpenseInput) {
    const updateData: any = {}
    if (data.category) updateData.category = data.category
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.description) updateData.description = data.description
    if (data.date) updateData.date = data.date

    const updatedExpense = await prisma.expense.updateMany({
      where: { id: expenseId, pgId },
      data: updateData,
    })

    return updatedExpense.count === 0 ? null : prisma.expense.findUnique({ where: { id: expenseId } })
  }

  static async deleteExpense(pgId: number, expenseId: number) {
    return prisma.expense.deleteMany({
      where: { id: expenseId, pgId },
    })
  }

  static async getExpenseSummary(pgId: number, startDate?: Date, endDate?: Date) {
    const where: any = { pgId }
    if (startDate) {
      where.date = { gte: startDate }
    }
    if (endDate) {
      where.date = where.date || {}
      where.date.lte = endDate
    }

    const totalExpenses = await prisma.expense.aggregate({
      _sum: { amount: true },
      where,
    })

    return {
      totalExpenses: totalExpenses._sum.amount || 0,
    }
  }
}
