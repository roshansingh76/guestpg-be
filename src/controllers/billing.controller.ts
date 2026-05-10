import type { Request, Response } from 'express'
import { prisma } from '../db/prisma'

// Generate bills for all active guests of a PG for a given month/year
export async function generateBills(req: Request, res: Response) {
    const pgId = Number(req.params.pgId)
    const { month, year, dueDate, extraItems } = req.body
    // extraItems: [{ guestId, label, amount }] — optional per-guest extras

    if (!month || !year || !dueDate)
        return res.status(400).json({ message: 'month, year, and dueDate are required' })

    const pg = await prisma.pG.findUnique({ where: { id: pgId } })
    if (!pg) return res.status(404).json({ message: 'PG not found' })

    const guests = await prisma.guest.findMany({
        where: { pgId, status: 'active' },
        include: { bed: { include: { room: true } } },
    })

    if (!guests.length)
        return res.status(400).json({ message: 'No active guests found for this PG' })

    const due = new Date(dueDate)
    const created: any[] = []
    const skipped: any[] = []

    for (const guest of guests) {
        // Skip if bill already exists
        const existing = await prisma.rentBill.findUnique({
            where: { guestId_billMonth_billYear: { guestId: guest.id, billMonth: month, billYear: year } },
        })
        if (existing) { skipped.push({ guestId: guest.id, name: guest.name }); continue }

        const rentAmount = guest.bed?.room?.pricePerBed ?? 0
        const extras: { label: string; amount: number }[] =
            (extraItems ?? []).filter((e: any) => e.guestId === guest.id)

        const extraTotal = extras.reduce((s: number, e: any) => s + Number(e.amount), 0)
        const totalAmount = rentAmount + extraTotal

        const bill = await prisma.rentBill.create({
            data: {
                pgId,
                guestId: guest.id,
                billMonth: month,
                billYear: year,
                rentAmount,
                totalAmount,
                paidAmount: 0,
                dueAmount: totalAmount,
                dueDate: due,
                status: 'pending',
                items: {
                    create: [
                        { label: 'Rent', amount: rentAmount },
                        ...extras.map((e: any) => ({ label: e.label, amount: Number(e.amount) })),
                    ],
                },
            },
            include: { items: true },
        })
        created.push(bill)
    }

    return res.status(201).json({
        message: `Bills generated: ${created.length}, skipped (already exist): ${skipped.length}`,
        created,
        skipped,
    })
}

// Get all bills for a PG
export async function getBills(req: Request, res: Response) {
    const pgId = Number(req.params.pgId)
    const { month, year, status, guestId, page = 1, limit = 20 } = req.query

    const where: any = { pgId }
    if (month) where.billMonth = Number(month)
    if (year) where.billYear = Number(year)
    if (status) where.status = status as string
    if (guestId) where.guestId = Number(guestId)

    const skip = (Number(page) - 1) * Number(limit)

    const [bills, total] = await Promise.all([
        prisma.rentBill.findMany({
            where,
            include: {
                guest: { select: { id: true, name: true, phone: true } },
                items: true,
                payments: true,
            },
            skip,
            take: Number(limit),
            orderBy: [{ billYear: 'desc' }, { billMonth: 'desc' }],
        }),
        prisma.rentBill.count({ where }),
    ])

    return res.json({
        data: bills,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    })
}

// Get single bill
export async function getBillById(req: Request, res: Response) {
    const pgId = Number(req.params.pgId)
    const billId = Number(req.params.billId)

    const bill = await prisma.rentBill.findFirst({
        where: { id: billId, pgId },
        include: {
            guest: { select: { id: true, name: true, phone: true, aadhar: true } },
            items: true,
            payments: true,
        },
    })
    if (!bill) return res.status(404).json({ message: 'Bill not found' })

    return res.json(bill)
}

// Record a payment against a bill
export async function recordPayment(req: Request, res: Response) {
    const pgId = Number(req.params.pgId)
    const billId = Number(req.params.billId)
    const { amount, mode, referenceNo, note, paidAt } = req.body

    if (!amount || !mode)
        return res.status(400).json({ message: 'amount and mode are required' })

    const validModes = ['cash', 'upi', 'bank_transfer', 'cheque', 'other']
    if (!validModes.includes(mode))
        return res.status(400).json({ message: `Invalid mode. Must be one of: ${validModes.join(', ')}` })

    const bill = await prisma.rentBill.findFirst({ where: { id: billId, pgId } })
    if (!bill) return res.status(404).json({ message: 'Bill not found' })
    if (bill.status === 'paid') return res.status(400).json({ message: 'Bill is already fully paid' })

    const payAmount = Number(amount)
    const newPaid = bill.paidAmount + payAmount
    const newDue = bill.totalAmount - newPaid

    const newStatus =
        newDue <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'pending'

    const [payment] = await prisma.$transaction([
        prisma.payment.create({
            data: {
                billId,
                pgId,
                guestId: bill.guestId,
                amount: payAmount,
                mode,
                referenceNo,
                note,
                paidAt: paidAt ? new Date(paidAt) : new Date(),
            },
        }),
        prisma.rentBill.update({
            where: { id: billId },
            data: { paidAmount: newPaid, dueAmount: Math.max(newDue, 0), status: newStatus },
        }),
    ])

    return res.status(201).json({ message: 'Payment recorded successfully', data: payment })
}

// Get overdue bills for a PG
export async function getOverdueBills(req: Request, res: Response) {
    const pgId = Number(req.params.pgId)

    // Mark overdue: pending/partial bills past due date
    await prisma.rentBill.updateMany({
        where: {
            pgId,
            status: { in: ['pending', 'partial'] },
            dueDate: { lt: new Date() },
        },
        data: { status: 'overdue' },
    })

    const bills = await prisma.rentBill.findMany({
        where: { pgId, status: 'overdue' },
        include: {
            guest: { select: { id: true, name: true, phone: true } },
            items: true,
        },
        orderBy: { dueDate: 'asc' },
    })

    const totalDue = bills.reduce((s: number, b: any) => s + b.dueAmount, 0)

    return res.json({ data: bills, totalDue, count: bills.length })
}

// Get payment receipt (bill + all payments)
export async function getReceipt(req: Request, res: Response) {
    const pgId = Number(req.params.pgId)
    const billId = Number(req.params.billId)

    const bill = await prisma.rentBill.findFirst({
        where: { id: billId, pgId },
        include: {
            pg: { select: { pgName: true, ownerName: true, ownerPhone: true, addressLine1: true, city: true } },
            guest: { select: { id: true, name: true, phone: true } },
            items: true,
            payments: { orderBy: { paidAt: 'asc' } },
        },
    })
    if (!bill) return res.status(404).json({ message: 'Bill not found' })

    return res.json(bill)
}
