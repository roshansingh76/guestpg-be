import type { Request, Response } from 'express'
import { z } from 'zod'
import { TenantService } from '../services/tenant.service'
import { logger } from '../utils/logger'
import {
  sendBadRequest,
  sendCreated,
  sendError,
  sendNotFound,
  sendSuccess,
  sendList,
} from '../utils/response'
import type { AuthPayload } from '../middleware/auth'

const tenantCreateSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  aadhar: z.string().min(4),
  address: z.string().optional(),
  emergency: z.string().optional(),
  emergencyPhone: z.string().optional(),
  idProofUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  moveInDate: z.string().optional(),
  moveOutDate: z.string().optional(),
  status: z.string().optional(),
})

export async function listTenants(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }
    const { status, skip = 0, limit = 20 } = req.query

    const page = Math.floor(Number(skip) / Number(limit)) + 1
    const result = await TenantService.getTenantsByPG(pgId, status as string | undefined, page, Number(limit))
    return sendList(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount })
  } catch (error: any) {
    logger.error('List tenants failed', { error })
    return sendError(res, error?.message || 'Error fetching tenants')
  }
}

export async function getTenant(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const id = Number(req.params.id)
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }

    const tenant = await TenantService.getTenantById(pgId, id)
    if (!tenant) return sendNotFound(res, 'Tenant not found')

    return sendSuccess(res, tenant)
  } catch (error: any) {
    logger.error('Get tenant failed', { error })
    return sendError(res, error?.message || 'Error fetching tenant')
  }
}

export async function createTenant(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    if (!Number.isFinite(pgId) || pgId <= 0) return sendBadRequest(res, 'Invalid pgId')
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }

    const parsed = tenantCreateSchema.safeParse(req.body)
    if (!parsed.success) return sendBadRequest(res, 'Invalid input', parsed.error.issues as any)

    const tenant = await TenantService.createTenant({
      name: parsed.data.name,
      phone: parsed.data.phone,
      aadhar: parsed.data.aadhar,
      pgId,
      address: parsed.data.address,
      emergency: parsed.data.emergency,
      emergencyPhone: parsed.data.emergencyPhone,
      idProofUrl: parsed.data.idProofUrl,
      photoUrl: parsed.data.photoUrl,
      moveInDate: parsed.data.moveInDate ? new Date(parsed.data.moveInDate) : new Date(),
      moveOutDate: parsed.data.moveOutDate ? new Date(parsed.data.moveOutDate) : undefined,
      status: parsed.data.status || 'active',
    })

    return sendCreated(res, tenant)
  } catch (error: any) {
    logger.error('Create tenant failed', { error })
    if ((error as any).statusCode === 404) {
      return sendNotFound(res, (error as any).message)
    }
    if ((error as any).statusCode === 400) {
      return sendBadRequest(res, (error as any).message)
    }
    return sendError(res, error?.message || 'Error creating tenant')
  }
}

export async function updateTenant(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return sendBadRequest(res, 'Invalid id')
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }

    const parsed = tenantCreateSchema.partial().safeParse(req.body)
    if (!parsed.success) return sendBadRequest(res, 'Invalid input', parsed.error.issues as any)

    const tenant = await TenantService.updateTenant(pgId, id, {
      name: parsed.data.name,
      phone: parsed.data.phone,
      aadhar: parsed.data.aadhar,
      address: parsed.data.address,
      emergency: parsed.data.emergency,
      emergencyPhone: parsed.data.emergencyPhone,
      idProofUrl: parsed.data.idProofUrl,
      photoUrl: parsed.data.photoUrl,
      moveInDate: parsed.data.moveInDate ? new Date(parsed.data.moveInDate) : undefined,
      moveOutDate: parsed.data.moveOutDate ? new Date(parsed.data.moveOutDate) : undefined,
      status: parsed.data.status,
    })

    if (!tenant) return sendNotFound(res, 'Tenant not found')
    return sendSuccess(res, tenant)
  } catch (error: any) {
    logger.error('Update tenant failed', { error })
    if ((error as any).statusCode === 404) {
      return sendNotFound(res, (error as any).message)
    }
    if ((error as any).statusCode === 400) {
      return sendBadRequest(res, (error as any).message)
    }
    return sendError(res, error?.message || 'Error updating tenant')
  }
}

export async function checkoutTenant(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const id = Number(req.params.id)
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }

    const tenant = await TenantService.checkoutTenant(pgId, id)
    if (!tenant) return sendNotFound(res, 'Tenant not found')

    return sendSuccess(res, { success: true })
  } catch (error: any) {
    logger.error('Checkout tenant failed', { error })
    return sendError(res, error?.message || 'Error checking out tenant')
  }
}

export async function deleteTenant(req: Request, res: Response) {
  try {
    const pgId = Number(req.params.pgId)
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return sendBadRequest(res, 'Invalid id')
    const auth = req.auth as AuthPayload
    if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
      return sendError(res, 'Forbidden', 'FORBIDDEN', [], 403)
    }

    const deleted = await TenantService.deleteTenant(pgId, id)
    if (deleted.count === 0) return sendNotFound(res, 'Tenant not found')

    return sendSuccess(res, { success: true })
  } catch (error: any) {
    logger.error('Delete tenant failed', { error })
    return sendError(res, error?.message || 'Error deleting tenant')
  }
}
