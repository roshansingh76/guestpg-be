import { prisma } from './prismaClient'

const expenseCategories = [
  {
    name: 'Rent',
    description: 'Monthly rent payment for PG',
  },
  {
    name: 'Salary',
    description: 'Staff salary expenses',
  },
  {
    name: 'Electricity',
    description: 'Electricity bill',
  },
  {
    name: 'Water',
    description: 'Water bill',
  },
  {
    name: 'Internet',
    description: 'Internet service bill',
  },
  {
    name: 'Maintenance',
    description: 'Building and facility maintenance',
  },
  {
    name: 'Food',
    description: 'Food and meal expenses',
  },
  {
    name: 'Milk',
    description: 'Daily milk supply',
  },
  {
    name: 'Ration',
    description: 'Groceries and ration supplies',
  },
  {
    name: 'Other',
    description: 'Other miscellaneous expenses',
  },
]

export async function seedExpenseCategories() {
  console.log('Seeding expense categories...')
  for (const category of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
      },
      create: category,
    })
  }
  console.log('Expense categories seeded.')
}

if (require.main === module) {
  seedExpenseCategories()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
