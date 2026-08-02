import { prisma } from './prismaClient'
import { pgs } from './data/pgs'

export async function seedPGs() {
  console.log('Seeding dummy PGs...')

  for (const pgData of pgs) {
    const city = await prisma.city.findUnique({ where: { name: pgData.cityName } })
    if (!city) {
      throw new Error(`City not found: ${pgData.cityName}`)
    }

    const area = await prisma.area.findUnique({
      where: { name_cityId: { name: pgData.areaName, cityId: city.id } }
    })
    if (!area) {
      throw new Error(`Area not found: ${pgData.areaName} in ${pgData.cityName}`)
    }

    const owner = await prisma.user.findUnique({ where: { email: pgData.ownerEmail } })
    if (!owner) {
      throw new Error(`PG owner user not found: ${pgData.ownerEmail}`)
    }

    const pgRecord: any = {
      pgName: pgData.pgName,
      ownerName: owner.name,
      ownerPhone: owner.phone,
      ownerEmail: owner.email,
      addressLine1: pgData.addressLine1,
      addressLine2: pgData.addressLine2,
      areaId: area.id,
      cityId: city.id,
      state: pgData.state,
      latitude: pgData.latitude,
      longitude: pgData.longitude,
      pgType: pgData.pgType,
      numberOfRooms: pgData.numberOfRooms,
      isFoodAvailable: pgData.isFoodAvailable,
      status: pgData.status
    }

    const pg = await prisma.pG.upsert({
      where: { ownerEmail: pgData.ownerEmail },
      update: pgRecord,
      create: pgRecord
    })

    await prisma.user.update({
      where: { id: owner.id },
      data: { pGId: pg.id }
    })

    await prisma.userPG.upsert({
      where: { userId_pgId: { userId: owner.id, pgId: pg.id } },
      update: {},
      create: { userId: owner.id, pgId: pg.id }
    })
  }

  console.log('Dummy PGs seeded.')
}

if (require.main === module) {
  seedPGs()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
