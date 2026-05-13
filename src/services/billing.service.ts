import { prisma } from '../db/prisma'

export interface CreateBillInput {
  pgId: number
  month: number
  year: number
  dueDate: Date
  extraItems?: {
    tenantId: number
    label: string
    amount: number
  }[]
}

export interface PaymentInput {
  amount: number
  mode: string
  referenceNo?: string
  note?: string
  paidAt: Date
}

export class BillingService {
  static async generateBills(data: CreateBillInput) {
    const existingBills = await prisma.rentBill.findMany({
      where: {
        pgId: data.pgId,
        billMonth: data.month,
        billYear: data.year,
      },
    })

    if (existingBills.length > 0) {
      return { created: [], skipped: existingBills }
    }

    const tenants = await prisma.tenant.findMany({
      where: {
        pgId: data.pgId,
        status: 'active',
      },
    })

    const created: any[] = []
    const skipped: any[] = []

    for (const tenant of tenants) {
      const existing = await prisma.rentBill.findUnique({
        where: {
          tenantId_billMonth_billYear: {
            tenantId: tenant.id,
            billMonth: data.month,
            billYear: data.year,
          },
        },
      })
      if (existing) {
        skipped.push({ tenantId: tenant.id, name: tenant.name })
        continue
      }

      const rentAmount = 0
      const extras = (data.extraItems ?? []).filter((item) => item.tenantId === tenant.id)
      const extraTotal = extras.reduce((sum, item) => sum + item.amount, 0)
      const totalAmount = rentAmount + extraTotal

      const bill = await prisma.rentBill.create({
        data: {
          pgId: data.pgId,
          tenantId: tenant.id,
          billMonth: data.month,
          billYear: data.year,
          rentAmount,
          totalAmount,
          paidAmount: 0,
          dueAmount: totalAmount,
          dueDate: data.dueDate,
          status: 'pending',
          items: {
            create: [
              { label: 'Rent', amount: rentAmount },
              ...extras.map((item) => ({ label: item.label, amount: item.amount })),
            ],
          },
        },
        include: { items: true },
      })

      created.push(bill)
    }

    return { created, skipped }
  }

  static async getBillsByPG(pgId: number, status?: string, page = 1, limit = 10) {
    const where: any = { pgId }
    if (status) where.status = status

    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      prisma.rentBill.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ billYear: 'desc' }, { billMonth: 'desc' }],
        include: {
          tenant: { select: { id: true, name: true, phone: true } },
          items: true,
          payments: true,
        },
      }),
      prisma.rentBill.count({ where }),
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

  static async getBillById(pgId: number, billId: number) {
    return prisma.rentBill.findFirst({
      where: { id: billId, pgId },
      include: {
        tenant: { select: { id: true, name: true, phone: true, aadhar: true } },
        items: true,
        payments: true,
      },
    })
  }

  static async recordPayment(pgId: number, billId: number, payment: PaymentInput) {
    return prisma.$transaction(async (tx) => {
      const existingBill = await tx.rentBill.findFirst({ where: { id: billId, pgId } })
      if (!existingBill) {
        return null
      }

      const newPaidAmount = existingBill.paidAmount + payment.amount
      const newDueAmount = Math.max(existingBill.totalAmount - newPaidAmount, 0)
      const newStatus = newDueAmount <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

      await tx.payment.create({
        data: {
          billId,
          pgId,
          tenantId: existingBill.tenantId,
          amount: payment.amount,
          mode: payment.mode as any,
          referenceNo: payment.referenceNo,
          note: payment.note,
          paidAt: payment.paidAt,
        },
      })

      return tx.rentBill.update({
        where: { id: billId },
        data: {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: newStatus,
        },
      })
    })
  }

  static async getOverdueBills(pgId: number) {
    return prisma.rentBill.findMany({
      where: {
        pgId,
        status: 'overdue',
      },
      include: {
        tenant: { select: { id: true, name: true, phone: true } },
        items: true,
      },
      orderBy: { dueDate: 'asc' },
    })
  }

  static async getReceipt(pgId: number, billId: number) {
    return prisma.rentBill.findFirst({
      where: { id: billId, pgId },
      include: {
        pg: {
          select: {
            pgName: true,
            ownerName: true,
            ownerPhone: true,
            addressLine1: true,
            city: true,
          },
        },
        tenant: { select: { id: true, name: true, phone: true } },
        items: true,
        payments: { orderBy: { paidAt: 'asc' } },
      },
    })
  }
}
