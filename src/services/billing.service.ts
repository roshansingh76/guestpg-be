import { prisma } from '../db/prisma'
import { BillCategory } from '@prisma/client'

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
  static normalizeBillCategory(label: unknown): BillCategory | undefined {
    if (label === undefined || label === null) return undefined
    const normalized = String(label).trim()
    return (Object.values(BillCategory) as BillCategory[]).find(
      (category) => category.toLowerCase() === normalized.toLowerCase(),
    )
  }

  static async generateBills(data: CreateBillInput) {
    const tenants = await prisma.tenant.findMany({
      where: {
        pgId: data.pgId,
        status: 'active',
      },
      include: {
        room: { select: { pricePerBed: true } },
      },
    })

    if (tenants.length === 0) {
      return { created: [], skipped: [], reason: 'no_active_tenants' }
    }

    const requestedItems = (data.extraItems ?? []).map((item) => {
      const label = BillingService.normalizeBillCategory(item.label)
      if (!label) {
        throw new Error(`Invalid bill category: ${item.label}`)
      }
      return { tenantId: item.tenantId, label, amount: item.amount }
    })

    if (requestedItems.length === 0) {
      const defaultItems = tenants
        .filter((tenant) => tenant.room?.pricePerBed && tenant.room.pricePerBed > 0)
        .map((tenant) => ({
          tenantId: tenant.id,
          label: BillCategory.Rent,
          amount: tenant.room!.pricePerBed,
        }))

      if (defaultItems.length === 0) {
        return { created: [], skipped: [], reason: 'no_bill_items' }
      }

      requestedItems.push(...defaultItems)
    }

    const activeTenantIds = new Set(tenants.map((tenant) => tenant.id))
    const tenantIds = [...new Set(requestedItems.map((item) => item.tenantId))]
    const invalidTenantId = tenantIds.find((tenantId) => !activeTenantIds.has(tenantId))
    if (invalidTenantId !== undefined) {
      throw new Error(`Invalid or inactive tenant selected: ${invalidTenantId}`)
    }

    const created: any[] = []
    const skipped: any[] = []

    for (const tenantId of tenantIds) {
      const tenant = tenants.find((tenant) => tenant.id === tenantId)
      if (!tenant) continue

      const existing = await prisma.bill.findUnique({
        where: {
          tenantId_billMonth_billYear: {
            tenantId,
            billMonth: data.month,
            billYear: data.year,
          },
        },
      })
      if (existing) {
        skipped.push({ tenantId, name: tenant.name })
        continue
      }

      const extras = requestedItems.filter((item) => item.tenantId === tenantId)
      const totalAmount = extras.reduce((sum, item) => sum + item.amount, 0)

      const bill = await prisma.bill.create({
        data: {
          pgId: data.pgId,
          tenantId,
          billMonth: data.month,
          billYear: data.year,
          totalAmount,
          paidAmount: 0,
          dueAmount: totalAmount,
          dueDate: data.dueDate,
          status: 'pending',
          items: {
            create: extras.map((item) => ({ label: item.label, amount: item.amount })),
          },
        },
        include: { items: true },
      })

      created.push(bill)
    }

    const reason = created.length === 0 && skipped.length === tenants.length ? 'all_existing' : undefined
    return { created, skipped, reason }
  }

  static async getBillsByPG(pgId: number, status?: string, page = 1, limit = 10) {
    const where: any = { pgId }
    if (status) where.status = status

    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      prisma.bill.findMany({
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
      prisma.bill.count({ where }),
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

  static async getAllBills(pgId?: number, status?: string, page = 1, limit = 10) {
    const where: any = {}
    if (pgId) where.pgId = pgId
    if (status) where.status = status

    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ billYear: 'desc' }, { billMonth: 'desc' }],
        include: {
          tenant: { select: { id: true, name: true, phone: true } },
          items: true,
          payments: true,
          pg: { select: { id: true, pgName: true } },
        },
      }),
      prisma.bill.count({ where }),
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

  static async getBillById(billId: number, pgId?: number) {
    const where: any = { id: billId }
    if (pgId !== undefined) where.pgId = pgId

    return prisma.bill.findFirst({
      where,
      include: {
        tenant: { select: { id: true, name: true, phone: true, aadhar: true } },
        items: true,
        payments: true,
        pg: { select: { id: true, pgName: true } },
      },
    })
  }

  static async addBillItem(billId: number, data: { label: unknown; amount: number }) {
    const label = BillingService.normalizeBillCategory(data.label)
    if (!label) {
      throw new Error(`Invalid bill category: ${data.label}`)
    }

    return prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findUnique({ where: { id: billId } })
      if (!bill) return null

      await tx.billItem.create({
        data: {
          billId,
          label,
          amount: data.amount,
        },
      })

      const totalAmount = bill.totalAmount + data.amount
      const dueAmount = Math.max(totalAmount - bill.paidAmount, 0)
      const status = dueAmount <= 0 ? 'paid' : bill.paidAmount > 0 ? 'partial' : 'pending'

      return tx.bill.update({
        where: { id: billId },
        data: {
          totalAmount,
          dueAmount,
          status,
        },
        include: {
          tenant: { select: { id: true, name: true, phone: true, aadhar: true } },
          items: true,
          payments: true,
          pg: { select: { id: true, pgName: true } },
        },
      })
    })
  }

  static async updateBillItem(billId: number, itemId: number, data: { label?: unknown; amount?: number }) {
    const label = data.label !== undefined ? BillingService.normalizeBillCategory(data.label) : undefined
    if (data.label !== undefined && !label) {
      throw new Error(`Invalid bill category: ${data.label}`)
    }

    return prisma.$transaction(async (tx) => {
      const item = await tx.billItem.findFirst({ where: { id: itemId, billId } })
      if (!item) return null

      const bill = await tx.bill.findUnique({ where: { id: billId } })
      if (!bill) return null

      const updatedAmount = data.amount ?? item.amount
      await tx.billItem.update({
        where: { id: itemId },
        data: {
          label: label ?? item.label,
          amount: updatedAmount,
        },
      })

      const totalAmount = bill.totalAmount + (updatedAmount - item.amount)
      const dueAmount = Math.max(totalAmount - bill.paidAmount, 0)
      const status = dueAmount <= 0 ? 'paid' : bill.paidAmount > 0 ? 'partial' : 'pending'

      return tx.bill.update({
        where: { id: billId },
        data: {
          totalAmount,
          dueAmount,
          status,
        },
        include: {
          tenant: { select: { id: true, name: true, phone: true, aadhar: true } },
          items: true,
          payments: true,
          pg: { select: { id: true, pgName: true } },
        },
      })
    })
  }

  static async recordPayment(pgId: number, billId: number, payment: PaymentInput) {
    return prisma.$transaction(async (tx) => {
      const existingBill = await tx.bill.findFirst({ where: { id: billId, pgId } })
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

      return tx.bill.update({
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
    return prisma.bill.findMany({
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
    return prisma.bill.findFirst({
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
