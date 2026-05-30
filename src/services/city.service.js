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
exports.CityService = void 0;
const prisma_1 = require("../db/prisma");
class CityService {
    // Create new city
    static createCity(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.city.create({
                data,
                include: {
                    areas: true,
                },
            });
        });
    }
    // Get all cities with filters and pagination
    static getAllCities(filters, pagination) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = (pagination === null || pagination === void 0 ? void 0 : pagination.page) || 1;
            const limit = (pagination === null || pagination === void 0 ? void 0 : pagination.limit) || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.status)
                where.status = filters.status;
            const [cities, total] = yield Promise.all([
                prisma_1.prisma.city.findMany({
                    where,
                    include: {
                        areas: true,
                    },
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' },
                }),
                prisma_1.prisma.city.count({ where }),
            ]);
            return {
                data: cities,
                pagination: {
                    page,
                    limit,
                    totalCount: total,
                },
            };
        });
    }
    // Get city by ID
    static getCityById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.city.findUnique({
                where: { id },
                include: {
                    areas: true,
                },
            });
        });
    }
    // Update city
    static updateCity(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.city.update({
                where: { id },
                data,
                include: {
                    areas: true,
                },
            });
        });
    }
    // Delete city
    static deleteCity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.city.delete({
                where: { id },
            });
        });
    }
    // Get all cities with areas
    static getCitiesWithAreas() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.city.findMany({
                where: { status: 'active' },
                include: {
                    areas: {
                        where: { status: 'active' },
                        orderBy: { name: 'asc' },
                    },
                },
                orderBy: { name: 'asc' },
            });
        });
    }
}
exports.CityService = CityService;
