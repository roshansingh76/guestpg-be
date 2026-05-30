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
exports.seedAreas = seedAreas;
const prismaClient_1 = require("./prismaClient");
const areas_1 = require("./data/areas");
function seedAreas() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding areas...');
        for (const area of areas_1.areas) {
            const city = yield prismaClient_1.prisma.city.findUnique({
                where: { name: area.cityName }
            });
            if (!city) {
                throw new Error(`City not found: ${area.cityName}`);
            }
            yield prismaClient_1.prisma.area.upsert({
                where: {
                    name_cityId: {
                        name: area.name,
                        cityId: city.id
                    }
                },
                update: {
                    isActive: area.isActive
                },
                create: {
                    name: area.name,
                    cityId: city.id,
                    isActive: area.isActive
                }
            });
        }
        console.log('Areas seeded.');
    });
}
if (require.main === module) {
    seedAreas()
        .then(() => prismaClient_1.prisma.$disconnect())
        .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        console.error(error);
        yield prismaClient_1.prisma.$disconnect();
        process.exit(1);
    }));
}
