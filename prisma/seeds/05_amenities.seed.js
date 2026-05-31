"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](e)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAmenities = void 0;
const prismaClient_1 = require("./prismaClient");
const amenities = [
    { name: 'Wardrobe', description: 'Built-in or standalone wardrobe/closet for clothing storage' },
    { name: 'Meals', description: 'On-site or included meal service for tenants' },
    { name: 'RO Water', description: 'Reverse osmosis purified drinking water supply' },
    { name: 'Geyser', description: 'Hot water geyser available for showers and washing' },
    { name: 'Power Backup', description: 'Emergency power backup for uninterrupted electricity' },
    { name: 'High-Speed Wi-Fi', description: 'High-speed wireless internet access' },
    { name: 'Housekeeping', description: 'Regular housekeeping and room cleaning service' },
    { name: 'Washing Machine', description: 'Shared or in-room washing machine facility' },
    { name: 'Air Conditioner', description: 'Air conditioned rooms for cooling comfort' },
    { name: 'Refrigerator', description: 'Room refrigerator for food storage' },
    { name: 'Microwave', description: 'Microwave oven for quick heating and cooking' },
    { name: 'Induction Cooktop', description: 'Electric induction cooktop for cooking' },
    { name: 'Gym', description: 'On-site gym or fitness center access' },
    { name: 'TV Lounge', description: 'Common TV lounge or entertainment area' },
];
function seedAmenities() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding PG amenities master list...');
        for (const amenity of amenities) {
            yield prismaClient_1.prisma.amenity.upsert({
                where: { name: amenity.name },
                update: {
                    description: amenity.description,
                },
                create: amenity,
            });
        }
        console.log('PG amenities seeded.');
    });
}
exports.seedAmenities = seedAmenities;
if (require.main === module) {
    seedAmenities()
        .then(() => prismaClient_1.prisma.$disconnect())
        .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        console.error(error);
        yield prismaClient_1.prisma.$disconnect();
        process.exit(1);
    }));
}
