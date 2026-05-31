"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, Promise, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](e)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPhotoCategories = void 0;
const prismaClient_1 = require("./prismaClient");
const photoCategories = [
    { name: 'Banner Image', description: 'Primary banner image for the PG listing' },
    { name: 'Interior Photos', description: 'Interior room and common area photos' },
    { name: 'Exterior Photos', description: 'Exterior property and street view photos' },
];
function seedPhotoCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding photo categories...');
        for (const category of photoCategories) {
            yield prismaClient_1.prisma.photoCategory.upsert({
                where: { name: category.name },
                update: { description: category.description },
                create: category,
            });
        }
        console.log('Photo categories seeded.');
    });
}
exports.seedPhotoCategories = seedPhotoCategories;
if (require.main === module) {
    seedPhotoCategories()
        .then(() => prismaClient_1.prisma.$disconnect())
        .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        console.error(error);
        yield prismaClient_1.prisma.$disconnect();
        process.exit(1);
    }));
}
