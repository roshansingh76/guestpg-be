import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

// Create expense
export const createExpense = async (req: Request, res: Response) => {
    try {
        const { pgId } = req.params
        const { category, amount, description, date } = req.body

        if (!category || amount === undefined) {
            return res.status(400).json({ message: 'category and amount are required' })
        }

        const pg = await prisma.pG.findUnique({ where: { id: Number(pgId) } })
        if (!pg) return res.status(404).json({ message: 'PG not found' })

        const expense = await prisma.expense.create({
            data: {
                pgId: Number(pgId),
                category,
                amount: Number(amount),
                description,
                date: date ? new Date(date) : new Date(),
            },
        })

        res.status(201).json({ message: 'Expense created successfully', data: expense })
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating expense', error: error.message })
    }
}

// Get all expenses for a PG
export const getExpenses = async (req: Request, res: Response) => {
    try {
        const { pgId } = req.params
        const { category, from, to, page = 1, limit = 20 } = req.query

        const where: any = { pgId: Number(pgId) }
        if (category) where.category = category
        if (from || to) {
            where.date = {}
            if (from) where.date.gte = new Date(from as string)
            if (to) where.date.lte = new Date(to as string)
        }

        const skip = (Number(page) - 1) * Number(limit)

        const [expenses, total] = await Promise.all([
            prisma.expense.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { date: 'desc' },
            }),
            prisma.expense.count({ where }),
        ])

        // Sum total amount for the filtered period
        const aggregate = await prisma.expense.aggregate({
            where,
            _sum: { amount: true },
        })

        res.json({
            data: expenses,
            totalAmount: aggregate._sum.amount || 0,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        })
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message })
    }
}

// Get expense by ID
export const getExpenseById = async (req: Request, res: Response) => {
    try {
        const { pgId, expenseId } = req.params

        const expense = await prisma.expense.findFirst({
            where: { id: Number(expenseId), pgId: Number(pgId) },
        })
        if (!expense) return res.status(404).json({ message: 'Expense not found' })

        res.json(expense)
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching expense', error: error.message })
    }
}

// Update expense
export const updateExpense = async (req: Request, res: Response) => {
    try {
        const { pgId, expenseId } = req.params
        const { category, amount, description, date } = req.body

        const expense = await prisma.expense.findFirst({
            where: { id: Number(expenseId), pgId: Number(pgId) },
        })
        if (!expense) return res.status(404).json({ message: 'Expense not found' })

        const updated = await prisma.expense.update({
            where: { id: Number(expenseId) },
            data: {
                ...(category && { category }),
                ...(amount !== undefined && { amount: Number(amount) }),
                ...(description !== undefined && { description }),
                ...(date && { date: new Date(date) }),
            },
        })

        res.json({ message: 'Expense updated successfully', data: updated })
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating expense', error: error.message })
    }
}

// Delete expense
export const deleteExpense = async (req: Request, res: Response) => {
    try {
        const { pgId, expenseId } = req.params

        const expense = await prisma.expense.findFirst({
            where: { id: Number(expenseId), pgId: Number(pgId) },
        })
        if (!expense) return res.status(404).json({ message: 'Expense not found' })

        await prisma.expense.delete({ where: { id: Number(expenseId) } })
        res.json({ message: 'Expense deleted successfully' })
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message })
    }
}

// Get expense summary by category
export const getExpenseSummary = async (req: Request, res: Response) => {
    try {
        const { pgId } = req.params
        const { from, to } = req.query

        const where: any = { pgId: Number(pgId) }
        if (from || to) {
            where.date = {}
            if (from) where.date.gte = new Date(from as string)
            if (to) where.date.lte = new Date(to as string)
        }

        const summary = await prisma.expense.groupBy({
            by: ['category'],
            where,
            _sum: { amount: true },
            _count: { id: true },
        })

        const total = summary.reduce((acc, s) => acc + (s._sum.amount || 0), 0)

        res.json({
            data: summary.map((s) => ({
                category: s.category,
                total: s._sum.amount || 0,
                count: s._count.id,
            })),
            grandTotal: total,
        })
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching expense summary', error: error.message })
    }
}
