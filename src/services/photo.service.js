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
exports.PhotoService = void 0;
const prisma_1 = require("../db/prisma");
class PhotoService {
    // Add photo to PG
    static addPhoto(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGPhoto.create({
                data: {
                    pgId: data.pgId,
                    categoryId: data.categoryId,
                    photoUrl: data.photoUrl,
                },
            });
        });
    }
    // Get all photos for PG
    static getPhotosByPG(pgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGPhoto.findMany({
                where: { pgId },
                include: { category: true },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    // Get photo by ID
    static getPhotoById(id, pgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGPhoto.findFirst({
                where: {
                    id,
                    pgId,
                },
                include: { category: true },
            });
        });
    }
    // Delete photo
    static deletePhoto(id, pgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGPhoto.deleteMany({
                where: {
                    id,
                    pgId,
                },
            });
        });
    }
    // Delete all photos for PG
    static deletePhotosByPG(pgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGPhoto.deleteMany({
                where: { pgId },
            });
        });
    }
    // Get photo count for PG
    static getPhotoCount(pgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGPhoto.count({
                where: { pgId },
            });
        });
    }
}
exports.PhotoService = PhotoService;
