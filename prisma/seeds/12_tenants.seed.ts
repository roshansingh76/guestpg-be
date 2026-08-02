import { prisma } from './prismaClient'
import { tenants } from './data/tenants'

export async function seedTenants() {
  console.log('Seeding dummy PG tenants...')

  const touchedRoomIds = new Set<number>()

  for (const tenantData of tenants) {
    const pg = await prisma.pG.findUnique({ where: { ownerEmail: tenantData.pgOwnerEmail } })
    if (!pg) {
      throw new Error(`PG not found for tenant seed: ${tenantData.pgOwnerEmail}`)
    }

    const room = await prisma.pGRoom.findUnique({
      where: { pgId_roomNumber: { pgId: pg.id, roomNumber: tenantData.roomNumber } }
    })
    if (!room) {
      throw new Error(`Room not found for tenant seed: ${tenantData.roomNumber} in ${tenantData.pgOwnerEmail}`)
    }

    const tenantRecord: any = {
      pgId: pg.id,
      roomId: room.id,
      name: tenantData.name,
      phone: tenantData.phone,
      aadhar: tenantData.aadhar,
      address: tenantData.address,
      emergency: tenantData.emergency,
      emergencyPhone: tenantData.emergencyPhone,
      moveInDate: new Date(tenantData.moveInDate),
      moveOutDate: tenantData.moveOutDate ? new Date(tenantData.moveOutDate) : null,
      status: tenantData.status
    }

    const existing = await prisma.tenant.findFirst({
      where: { pgId: pg.id, aadhar: tenantData.aadhar }
    })

    if (existing) {
      await prisma.tenant.update({ where: { id: existing.id }, data: tenantRecord })
    } else {
      await prisma.tenant.create({ data: tenantRecord })
    }

    touchedRoomIds.add(room.id)
  }

  // Recompute available beds for every room touched, based on active tenants currently assigned
  for (const roomId of touchedRoomIds) {
    const room = await prisma.pGRoom.findUnique({ where: { id: roomId } })
    if (!room) continue

    const activeTenantCount = await prisma.tenant.count({
      where: { roomId: room.id, status: 'active' }
    })

    await prisma.pGRoom.update({
      where: { id: room.id },
      data: { availableBeds: Math.max(room.totalBeds - activeTenantCount, 0) }
    })
  }

  console.log('Dummy PG tenants seeded.')
}

if (require.main === module) {
  seedTenants()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
