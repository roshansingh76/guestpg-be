import { prisma } from '../db/prisma'

export interface CreateTenantInput {
  name: string
  phone: string
  aadhar: string
  pgId: number
  address?: string
  emergency?: string
  emergencyPhone?: string
  idProofUrl?: string
  photoUrl?: string
  moveInDate: Date
  moveOutDate?: Date
  status?: string
}

export interface UpdateTenantInput {
  name?: string
  phone?: string
  aadhar?: string
  address?: string
  emergency?: string
  emergencyPhone?: string
  idProofUrl?: string
  photoUrl?: string
  moveInDate?: Date
  moveOutDate?: Date
  status?: string
}

export class TenantService {
  static async getTenantsByPG(pgId: number, status?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit
    const where: any = { pgId }
    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenant.count({ where }),
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

  static async getTenantById(pgId: number, tenantId: number) {
    return prisma.tenant.findFirst({
      where: { id: tenantId, pgId },
    })
  }

  static async createTenant(data: CreateTenantInput) {
    return prisma.tenant.create({
      data: {
        name: data.name,
        phone: data.phone,
        aadhar: data.aadhar,
        pgId: data.pgId,
        address: data.address,
        emergency: data.emergency,
        emergencyPhone: data.emergencyPhone,
        idProofUrl: data.idProofUrl,
        photoUrl: data.photoUrl,
        moveInDate: data.moveInDate,
        moveOutDate: data.moveOutDate,
        status: data.status || 'active',
      },
    })
  }

  static async updateTenant(pgId: number, tenantId: number, data: UpdateTenantInput) {
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.phone) updateData.phone = data.phone
    if (data.aadhar) updateData.aadhar = data.aadhar
    if (data.address) updateData.address = data.address
    if (data.emergency) updateData.emergency = data.emergency
    if (data.emergencyPhone) updateData.emergencyPhone = data.emergencyPhone
    if (data.idProofUrl) updateData.idProofUrl = data.idProofUrl
    if (data.photoUrl) updateData.photoUrl = data.photoUrl
    if (data.moveInDate) updateData.moveInDate = data.moveInDate
    if (data.moveOutDate) updateData.moveOutDate = data.moveOutDate
    if (data.status) updateData.status = data.status

    const updated = await prisma.tenant.updateMany({
      where: { id: tenantId, pgId },
      data: updateData,
    })

    if (updated.count === 0) {
      return null
    }

    return prisma.tenant.findFirst({ where: { id: tenantId, pgId } })
  }

  static async checkoutTenant(pgId: number, tenantId: number) {
    const updated = await prisma.tenant.updateMany({
      where: { id: tenantId, pgId },
      data: {
        status: 'inactive',
        moveOutDate: new Date(),
      },
    })

    if (updated.count === 0) {
      return null
    }

    return prisma.tenant.findFirst({ where: { id: tenantId, pgId } })
  }

  static async deleteTenant(pgId: number, tenantId: number) {
    return prisma.tenant.deleteMany({
      where: { id: tenantId, pgId },
    })
  }
}
