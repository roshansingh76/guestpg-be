import dotenv from 'dotenv'
import path from 'path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

dotenv.config({ path: path.resolve(__dirname, '.env') })

const rawConnectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'guestpg'}?schema=${process.env.DB_SCHEMA || 'public'}`

const connectionString = addSslMode(rawConnectionString)

function addSslMode(url: string) {
    if (url.includes('sslmode=')) return url
    return url.includes('?') ? `${url}&sslmode=prefer` : `${url}?sslmode=prefer`
}

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: connectionString,
    },
    migrate: {
        adapter: () => new PrismaPg({ connectionString }),
    },
})
