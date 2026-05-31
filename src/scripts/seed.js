"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../db/prisma");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const adminEmail = 'admin@gmail.com';
        const adminPassword = '12345';
        yield prisma_1.prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                name: 'Admin User',
                role: 'super_admin',
                phone: '0000000000',
                passwordHash: bcryptjs_1.default.hashSync(adminPassword, 10),
            },
            create: {
                name: 'Admin User',
                email: adminEmail,
                phone: '0000000000',
                role: 'super_admin',
                passwordHash: bcryptjs_1.default.hashSync(adminPassword, 10),
            },
        });
        // Create PG owner for existing PG
        const pgOwnerEmail = 'owner@pgsystem.com';
        const pgOwnerPassword = 'password';
        const existingPG = yield prisma_1.prisma.pG.findFirst();
        if (existingPG) {
            yield prisma_1.prisma.user.upsert({
                where: { email: pgOwnerEmail },
                update: {
                    name: 'PG Owner',
                    role: 'pg_owner',
                    phone: '1111111111',
                    pgId: existingPG.id,
                    passwordHash: bcryptjs_1.default.hashSync(pgOwnerPassword, 10),
                },
                create: {
                    name: 'PG Owner',
                    email: pgOwnerEmail,
                    phone: '1111111111',
                    role: 'pg_owner',
                    pgId: existingPG.id,
                    passwordHash: bcryptjs_1.default.hashSync(pgOwnerPassword, 10),
                },
            });
        }
        const categories = [
            { name: 'Banner Image', description: 'Primary banner image for the PG listing' },
            { name: 'Interior Photos', description: 'Interior room and common area photos' },
            { name: 'Exterior Photos', description: 'Exterior property and street view photos' },
        ];
        for (const category of categories) {
            yield prisma_1.prisma.photoCategory.upsert({
                where: { name: category.name },
                update: { description: category.description },
                create: category,
            });
        }
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () { return prisma_1.prisma.$disconnect(); }))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma_1.prisma.$disconnect();
    process.exit(1);
}));
