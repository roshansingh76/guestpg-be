import { prisma } from './prismaClient'

const amenities = [
  { name: 'Wardrobe', description: 'Built-in or standalone wardrobe/closet for clothing storage' },
  { name: 'Meals', description: 'On-site or included meal service for tenants' },
  { name: 'RO Water', description: 'Reverse osmosis purified drinking water supply' },
  { name: 'Geyser', description: 'Hot water geyser available for showers and washing' },
  { name: 'Power Backup', description: 'Emergency power backup for uninterrupted electricity' },
  { name: 'High-Speed Wi-Fi', description: 'High-speed wireless internet access' },
  { name: 'Housekeeping', description: 'Regular housekeeping and room cleaning service' },
  { name: 'Washing Machine', description: 'Shared or in-room washing machine facility' },
  { name: 'Air Conditioner', description: 'Air conditioned rooms for cooling comfort' },
  { name: 'Refrigerator', description: 'Room refrigerator for food storage' },
  { name: 'Microwave', description: 'Microwave oven for quick heating and cooking' },
  { name: 'Induction Cooktop', description: 'Electric induction cooktop for cooking' },
  { name: 'Gym', description: 'On-site gym or fitness center access' },
  { name: 'TV Lounge', description: 'Common TV lounge or entertainment area' },
]

export async function seedAmenities() {
  console.log('Seeding PG amenities master list...')
  for (const amenity of amenities) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {
        description: amenity.description,
      },
      create: amenity,
    })
  }
  console.log('PG amenities seeded.')
}

if (require.main === module) {
  seedAmenities()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
