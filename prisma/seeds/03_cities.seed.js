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
exports.seedCities = seedCities;
const prismaClient_1 = require("./prismaClient");
const cities_1 = require("./data/cities");
function seedCities() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding cities...');
        for (const city of cities_1.cities) {
            yield prismaClient_1.prisma.city.upsert({
                where: { name: city.name },
                update: {
                    state: city.state,
                    isActive: city.isActive
                },
                create: city
            });
        }
        console.log('Cities seeded.');
    });
}
if (require.main === module) {
    seedCities()
        .then(() => prismaClient_1.prisma.$disconnect())
        .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        console.error(error);
        yield prismaClient_1.prisma.$disconnect();
        process.exit(1);
    }));
}
