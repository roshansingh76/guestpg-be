const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const migrationsDir = path.resolve(__dirname, '../prisma/migrations')

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set.\nSet it to your Render database URL before running this script.')
  process.exit(1)
}

let items
try {
  items = fs.readdirSync(migrationsDir, { withFileTypes: true })
} catch (err) {
  console.error('Failed to read migrations directory:', migrationsDir)
  console.error(err)
  process.exit(1)
}

const migrationDirs = items
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => /^\d{14}_/.test(name))
  .sort()

if (migrationDirs.length === 0) {
  console.log('No migrations found in', migrationsDir)
  process.exit(0)
}

console.log('Found migrations:')
migrationDirs.forEach((m) => console.log(' -', m))

console.log('\nMarking migrations as applied (oldest → newest).')
for (const migrationName of migrationDirs) {
  console.log('\nResolving migration:', migrationName)
  // Use shell to ensure cross-platform resolution of `npx` on Windows
  const res = spawnSync('npx prisma migrate resolve --applied ' + migrationName, {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  })

  if (res.error) {
    console.error('Error running prisma migrate resolve for', migrationName)
    console.error(res.error)
    process.exit(1)
  }
  if (res.status !== 0) {
    console.error('prisma migrate resolve exited with code', res.status)
    process.exit(res.status)
  }
}

console.log('\nAll migrations marked applied. Now run `npx prisma migrate deploy` to apply any remaining migrations.')
