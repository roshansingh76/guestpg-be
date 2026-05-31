"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const config_1 = require("prisma/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '.env') });
const rawConnectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'guestpg'}?schema=${process.env.DB_SCHEMA || 'public'}`;
const connectionString = addSslMode(rawConnectionString);
function addSslMode(url) {
    if (url.includes('sslmode='))
        return url;
    return url.includes('?') ? `${url}&sslmode=prefer` : `${url}?sslmode=prefer`;
}
module.exports = (0, config_1.defineConfig)({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: connectionString,
    },
    migrate: {
        adapter: () => new adapter_pg_1.PrismaPg({ connectionString }),
    },
});
