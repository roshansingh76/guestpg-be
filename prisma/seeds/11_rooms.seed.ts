import { prisma } from './prismaClient'
import { RoomType } from '@prisma/client'
import { rooms } from './data/rooms'

export async function seedRooms() {
  console.log('Seeding dummy PG rooms...')

  for (const roomData of rooms) {
    const pg = await prisma.pG.findUnique({ where: { ownerEmail: roomData.pgOwnerEmail } })
    if (!pg) {
      throw new Error(`PG not found for room seed: ${roomData.pgOwnerEmail}`)
    }

    const roomRecord: any = {
      pgId: pg.id,
      roomNumber: roomData.roomNumber,
      totalBeds: roomData.totalBeds,
      availableBeds: roomData.totalBeds,
      pricePerBed: roomData.pricePerBed,
      acType: roomData.acType as RoomType,
      securityPerBed: roomData.securityPerBed
    }

    await prisma.pGRoom.upsert({
      where: { pgId_roomNumber: { pgId: pg.id, roomNumber: roomData.roomNumber } },
      update: roomRecord,
      create: roomRecord
    })
  }

  console.log('Dummy PG rooms seeded.')
}

if (require.main === module) {
  seedRooms()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
