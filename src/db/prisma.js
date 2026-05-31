"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
// Load .env for local development
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// Build connection string from env if DATABASE_URL not provided
const rawConnectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'guestpg'}?schema=${process.env.DB_SCHEMA || 'public'}`;
const connectionString = addSslMode(rawConnectionString);
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
function addSslMode(url) {
    if (url.includes('sslmode=')) return url;
    return url.includes('?') ? `${url}&sslmode=prefer` : `${url}?sslmode=prefer`;
}
// Use the standard PrismaClient. Keep a global cached instance in development
// to avoid exhausting database connections when using hot-reloading.
const globalAny = global;
exports.prisma = (() => {
    if (process.env.NODE_ENV !== 'production') {
        if (!globalAny.__prisma) {
            globalAny.__prisma = new client_1.PrismaClient({ adapter });
        }
        return globalAny.__prisma;
    }
    return new client_1.PrismaClient({ adapter });
})();
