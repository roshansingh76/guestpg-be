import { prisma } from '../db/prisma'

const seedCitiesAndAreas = async () => {
  try {
    console.log('🌱 Starting Cities and Areas seeding...')

    // Delhi
    const delhi = await prisma.city.upsert({
      where: { name: 'Delhi' },
      update: {},
      create: {
        name: 'Delhi',
        state: 'Delhi',
        status: 'active',
      },
    })

    const delhiAreas = [
      'Dwarka',
      'Rohini',
      'Delhi Cantonment',
      'Indirapuram',
      'Karol Bagh',
      'Lajpat Nagar',
      'Malviya Nagar',
      'New Delhi',
      'Saket',
      'Vasant Kunj',
    ]

    for (const areaName of delhiAreas) {
      await prisma.area.upsert({
        where: {
          name_cityId: {
            name: areaName,
            cityId: delhi.id,
          },
        },
        update: {},
        create: {
          name: areaName,
          cityId: delhi.id,
          status: 'active',
        },
      })
    }

    console.log(`✅ Created Delhi with ${delhiAreas.length} areas`)

    // Gurgaon (Gurugram)
    const gurgaon = await prisma.city.upsert({
      where: { name: 'Gurgaon' },
      update: {},
      create: {
        name: 'Gurgaon',
        state: 'Haryana',
        status: 'active',
      },
    })

    const gurgaonAreas = [
      'Sector 7',
      'Sector 8',
      'Sector 9',
      'Sector 14',
      'Sector 15',
      'Sector 27',
      'Sector 29',
      'Sector 31',
      'Sector 37',
      'DLF City',
      'Golf Course Road',
      'MG Road',
      'Old City',
      'Cyber City',
      'Mahipalpur',
    ]

    for (const areaName of gurgaonAreas) {
      await prisma.area.upsert({
        where: {
          name_cityId: {
            name: areaName,
            cityId: gurgaon.id,
          },
        },
        update: {},
        create: {
          name: areaName,
          cityId: gurgaon.id,
          status: 'active',
        },
      })
    }

    console.log(`✅ Created Gurgaon with ${gurgaonAreas.length} areas`)

    // Noida
    const noida = await prisma.city.upsert({
      where: { name: 'Noida' },
      update: {},
      create: {
        name: 'Noida',
        state: 'Uttar Pradesh',
        status: 'active',
      },
    })

    const noidaAreas = [
      'Sector 1',
      'Sector 2',
      'Sector 3',
      'Sector 4',
      'Sector 8',
      'Sector 12',
      'Sector 14',
      'Sector 15',
      'Sector 16',
      'Sector 18',
      'Sector 19',
      'Sector 39',
      'Sector 40',
      'Sector 50',
      'Sector 60',
      'Sector 62',
      'Sector 63',
      'City Center',
      'Greater Noida',
    ]

    for (const areaName of noidaAreas) {
      await prisma.area.upsert({
        where: {
          name_cityId: {
            name: areaName,
            cityId: noida.id,
          },
        },
        update: {},
        create: {
          name: areaName,
          cityId: noida.id,
          status: 'active',
        },
      })
    }

    console.log(`✅ Created Noida with ${noidaAreas.length} areas`)

    console.log('✅ Cities and Areas seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding cities and areas:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedCitiesAndAreas().catch((error) => {
  console.error(error)
  process.exit(1)
})
