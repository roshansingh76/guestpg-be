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
const prismaClient_1 = require("./prismaClient");
const _01_roles_seed_1 = require("./01_roles.seed");
const _02_users_seed_1 = require("./02_users.seed");
const _03_cities_seed_1 = require("./03_cities.seed");
const _04_areas_seed_1 = require("./04_areas.seed");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Starting Prisma seed runner...');
            yield (0, _01_roles_seed_1.seedRoles)();
            yield (0, _02_users_seed_1.seedUsers)();
            yield (0, _03_cities_seed_1.seedCities)();
            yield (0, _04_areas_seed_1.seedAreas)();
            console.log('Prisma seed runner complete.');
        }
        finally {
            yield prismaClient_1.prisma.$disconnect();
        }
    });
}
main().catch((error) => {
    console.error('Seed runner failed:', error);
    process.exit(1);
});
