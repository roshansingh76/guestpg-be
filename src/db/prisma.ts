import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Load .env for local development
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// Build connection string from env if DATABASE_URL not provided
const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${
        process.env.DB_HOST || 'localhost'
    }:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'guestpg'}?schema=${process.env.DB_SCHEMA || 'public'}`

const adapter = new PrismaPg({ connectionString })

// Use the standard PrismaClient. Keep a global cached instance in development
// to avoid exhausting database connections when using hot-reloading.
const globalAny: any = global

export const prisma: PrismaClient = (() => {
    if (process.env.NODE_ENV !== 'production') {
        if (!globalAny.__prisma) {
            globalAny.__prisma = new PrismaClient({ adapter })
        }
        return globalAny.__prisma
    }
    return new PrismaClient({ adapter })
})()
