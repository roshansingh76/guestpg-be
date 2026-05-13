import type { Request, Response } from 'express'
import { BillingService } from '../services/billing.service'
import { logger } from '../utils/logger'
import {
  sendBadRequest,
  sendCreated,
  sendError,
  sendNotFound,
  sendSuccess,
  sendList,
} from '../utils/response'

export async function generateBills(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const { month, year, dueDate, extraItems } = req.body

    if (!month || !year || !dueDate) {
      return sendBadRequest(res, 'month, year, and dueDate are required')
    }

    if (extraItems !== undefined && !Array.isArray(extraItems)) {
      return sendBadRequest(res, 'extraItems must be an array')
    }

    const result = await BillingService.generateBills({
      pgId,
      month: Number(month),
      year: Number(year),
      dueDate: new Date(dueDate),
      extraItems,
    })

    if (!result.created.length) {
      if (result.reason === 'no_active_tenants') {
        return sendBadRequest(res, 'No active tenants found for this PG', { requestedMonth: month, requestedYear: year } as any)
      }
      if (result.reason === 'all_existing') {
        return sendBadRequest(res, 'All active tenants already have bills for this month', { requestedMonth: month, requestedYear: year } as any)
      }
      return sendBadRequest(res, 'No bills created because the requested month already exists or there are no active tenants', { requestedMonth: month, requestedYear: year } as any)
    }

    return sendCreated(res, { created: result.created, skipped: result.skipped })
  } catch (error: any) {
    logger.error('Generate bills failed', { error })
    return sendError(res, error?.message || 'Failed to generate bills')
  }
}

export async function getBills(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const { status, skip = 0, limit = 20 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await BillingService.getBillsByPG(pgId, status as string | undefined, page, Number(limit))
    return sendList(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount })
  } catch (error: any) {
    logger.error('Get bills failed', { error })
    return sendError(res, error?.message || 'Failed to fetch bills')
  }
}

export async function getBillById(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const billId = Number(req.params.billId)

    const bill = await BillingService.getBillById(billId, pgId)
    if (!bill) return sendNotFound(res, 'Bill not found')

    return sendSuccess(res, bill)
  } catch (error: any) {
    logger.error('Get bill by id failed', { error })
    return sendError(res, error?.message || 'Failed to fetch bill')
  }
}

export async function getBillByIdUnified(req: Request, res: Response) {
  try {
    const billId = Number(req.params.billId)
    const bill = await BillingService.getBillById(billId)
    if (!bill) return sendNotFound(res, 'Bill not found')

    return sendSuccess(res, bill)
  } catch (error: any) {
    logger.error('Get bill by id failed', { error })
    return sendError(res, error?.message || 'Failed to fetch bill')
  }
}

export async function addBillItem(req: Request, res: Response) {
  try {
    const billId = Number(req.params.billId)
    const { label, amount } = req.body

    if (!label || amount === undefined) {
      return sendBadRequest(res, 'label and amount are required')
    }

    const bill = await BillingService.addBillItem(billId, { label, amount: Number(amount) })
    if (!bill) return sendNotFound(res, 'Bill not found')

    return sendCreated(res, bill)
  } catch (error: any) {
    logger.error('Add bill item failed', { error })
    return sendError(res, error?.message || 'Failed to add bill item')
  }
}

export async function updateBillItem(req: Request, res: Response) {
  try {
    const billId = Number(req.params.billId)
    const itemId = Number(req.params.itemId)
    const { label, amount } = req.body

    if (label === undefined && amount === undefined) {
      return sendBadRequest(res, 'label or amount is required')
    }

    const bill = await BillingService.updateBillItem(billId, itemId, {
      label,
      amount: amount !== undefined ? Number(amount) : undefined,
    })
    if (!bill) return sendNotFound(res, 'Bill or bill item not found')

    return sendSuccess(res, bill)
  } catch (error: any) {
    logger.error('Update bill item failed', { error })
    return sendError(res, error?.message || 'Failed to update bill item')
  }
}

export async function recordPayment(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const billId = Number(req.params.billId)
    const { amount, mode, referenceNo, note, paidAt } = req.body

    if (amount === undefined || !mode) {
      return sendBadRequest(res, 'amount and mode are required')
    }

    const validModes = ['cash', 'upi', 'bank_transfer', 'cheque', 'other']
    if (!validModes.includes(mode)) {
      return sendBadRequest(res, `Invalid mode. Must be one of: ${validModes.join(', ')}`)
    }

    const payment = await BillingService.recordPayment(pgId, billId, {
      amount: Number(amount),
      mode,
      referenceNo,
      note,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    })

    if (!payment) return sendNotFound(res, 'Bill not found')
    return sendCreated(res, payment)
  } catch (error: any) {
    logger.error('Record payment failed', { error })
    return sendError(res, error?.message || 'Failed to record payment')
  }
}

export async function getOverdueBills(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const bills = await BillingService.getOverdueBills(pgId)
    const totalDue = bills.reduce((sum, bill) => sum + Number((bill as any).dueAmount || 0), 0)

    return sendSuccess(res, bills)
  } catch (error: any) {
    logger.error('Get overdue bills failed', { error })
    return sendError(res, error?.message || 'Failed to fetch overdue bills')
  }
}

export async function getReceipt(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const billId = Number(req.params.billId)

    const receipt = await BillingService.getReceipt(pgId, billId)
    if (!receipt) return sendNotFound(res, 'Bill not found')

    return sendSuccess(res, receipt)
  } catch (error: any) {
    logger.error('Get receipt failed', { error })
    return sendError(res, error?.message || 'Failed to fetch receipt')
  }
}

export async function getAllBills(req: Request, res: Response) {
  try {
    const { pgId, status, skip = 0, limit = 20 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await BillingService.getAllBills(
      pgId ? Number(pgId) : undefined,
      status as string | undefined,
      page,
      Number(limit)
    )
    return sendList(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount })
  } catch (error: any) {
    logger.error('Get all bills failed', { error })
    return sendError(res, error?.message || 'Failed to fetch bills')
  }
}
