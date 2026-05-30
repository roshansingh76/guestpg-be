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
exports.seedRoles = seedRoles;
const prismaClient_1 = require("./prismaClient");
const roles_1 = require("./data/roles");
function seedRoles() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding role definitions...');
        for (const role of roles_1.roles) {
            yield prismaClient_1.prisma.role.upsert({
                where: { name: role.name },
                update: {
                    displayName: role.displayName,
                    description: role.description,
                    permissions: role.permissions,
                    status: role.status,
                    isSystem: role.isSystem
                },
                create: role
            });
        }
        console.log('Role definitions seeded.');
    });
}
if (require.main === module) {
    seedRoles()
        .then(() => prismaClient_1.prisma.$disconnect())
        .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        console.error(error);
        yield prismaClient_1.prisma.$disconnect();
        process.exit(1);
    }));
}
