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
exports.AreaService = void 0;
const prisma_1 = require("../db/prisma");
class AreaService {
    // Create new area
    static createArea(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.area.create({
                data,
                include: {
                    city: true,
                },
            });
        });
    }
    // Get all areas with filters and pagination
    static getAllAreas(filters, pagination) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = (pagination === null || pagination === void 0 ? void 0 : pagination.page) || 1;
            const limit = (pagination === null || pagination === void 0 ? void 0 : pagination.limit) || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if ((filters === null || filters === void 0 ? void 0 : filters.isActive) !== undefined)
                where.isActive = filters.isActive;
            if (filters === null || filters === void 0 ? void 0 : filters.cityId)
                where.cityId = filters.cityId;
            const [areas, total] = yield Promise.all([
                prisma_1.prisma.area.findMany({
                    where,
                    include: {
                        city: true,
                    },
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' },
                }),
                prisma_1.prisma.area.count({ where }),
            ]);
            return {
                data: areas,
                pagination: {
                    page,
                    limit,
                    totalCount: total,
                },
            };
        });
    }
    // Get area by ID
    static getAreaById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.area.findUnique({
                where: { id },
                include: {
                    city: true,
                },
            });
        });
    }
    // Update area
    static updateArea(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.area.update({
                where: { id },
                data,
                include: {
                    city: true,
                },
            });
        });
    }
    // Delete area
    static deleteArea(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.area.delete({
                where: { id },
            });
        });
    }
    // Get areas by city ID
    static getAreasByCity(cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.area.findMany({
                where: { cityId, isActive: 1 },
                orderBy: { name: 'asc' },
            });
        });
    }
}
exports.AreaService = AreaService;
