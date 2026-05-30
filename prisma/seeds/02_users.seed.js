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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const prismaClient_1 = require("./prismaClient");
const users_1 = require("./data/users");
function seedUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding default users...');
        const hashedUsers = yield (0, users_1.hashSeedPasswords)();
        const roleNames = hashedUsers.map((user) => user.role);
        const roles = yield prismaClient_1.prisma.role.findMany({ where: { name: { in: roleNames } } });
        const roleMap = new Map(roles.map((role) => [role.name, role.id]));
        for (const user of hashedUsers) {
            const roleId = roleMap.get(user.role);
            if (!roleId) {
                throw new Error(`Missing role for seed user: ${user.role}`);
            }
            const userData = {
                name: user.name,
                email: user.email,
                phone: user.phone,
                passwordHash: user.passwordHash,
                role: { connect: { id: roleId } },
                isActive: user.isActive,
            };
            yield prismaClient_1.prisma.user.upsert({
                where: { email: user.email },
                update: userData,
                create: userData,
            });
        }
        console.log('Default users seeded.');
    });
}
if (require.main === module) {
    seedUsers()
        .then(() => prismaClient_1.prisma.$disconnect())
        .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        console.error(error);
        yield prismaClient_1.prisma.$disconnect();
        process.exit(1);
    }));
}
