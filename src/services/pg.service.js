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
exports.PGService = void 0;
const prisma_1 = require("../db/prisma");
class PGService {
    // Create new PG
    static createPG(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Remove undefined values
            const cleanData = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
            return prisma_1.prisma.pG.create({
                data: cleanData,
                include: {
                    rooms: true,
                    photos: true,
                    city: {
                        select: { id: true, name: true, state: true },
                    },
                    area: {
                        select: { id: true, name: true },
                    },
                },
            });
        });
    }
    // Get all PGs with filters and pagination
    static getAllPGs(filters, pagination) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = (pagination === null || pagination === void 0 ? void 0 : pagination.page) || 1;
            const limit = (pagination === null || pagination === void 0 ? void 0 : pagination.limit) || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.status)
                where.status = filters.status;
            if (filters === null || filters === void 0 ? void 0 : filters.cityId)
                where.cityId = filters.cityId;
            if (filters === null || filters === void 0 ? void 0 : filters.pgType)
                where.pgType = filters.pgType;
            // Filter PGs based on user role
            if ((filters === null || filters === void 0 ? void 0 : filters.userRole) === 'pg_owner' || (filters === null || filters === void 0 ? void 0 : filters.userRole) === 'pg_staff') {
                if ((filters === null || filters === void 0 ? void 0 : filters.userPgIds) && filters.userPgIds.length > 0) {
                    where.id = { in: filters.userPgIds };
                }
                else if (filters === null || filters === void 0 ? void 0 : filters.userPgId) {
                    where.id = filters.userPgId;
                }
                else {
                    // If user doesn't have any assigned PGs, return no PGs
                    where.id = -1;
                }
            }
            // super_admin and admin can see all PGs (no additional filtering needed)
            const [pgs, total] = yield Promise.all([
                prisma_1.prisma.pG.findMany({
                    where,
                    include: {
                        rooms: true,
                        photos: true,
                        city: { select: { id: true, name: true, state: true } },
                        area: { select: { id: true, name: true } },
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma_1.prisma.pG.count({ where }),
            ]);
            return {
                data: pgs,
                pagination: {
                    skip,
                    count: pgs.length,
                    totalCount: total,
                },
            };
        });
    }
    // Get PG by ID
    static getPGById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pG.findUnique({
                where: { id },
                include: {
                    rooms: true,
                    photos: true,
                    city: { select: { id: true, name: true, state: true } },
                    area: { select: { id: true, name: true } },
                },
            });
        });
    }
    // Update PG
    static updatePG(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pG.update({
                where: { id },
                data,
                include: {
                    rooms: true,
                    photos: true,
                    city: { select: { id: true, name: true, state: true } },
                    area: { select: { id: true, name: true } },
                },
            });
        });
    }
    // Delete PG
    static deletePG(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pG.delete({
                where: { id },
            });
        });
    }
    // Check if email exists
    static emailExists(email, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { ownerEmail: email };
            if (excludeId) {
                where.NOT = { id: excludeId };
            }
            return prisma_1.prisma.pG.findFirst({ where });
        });
    }
    // Get PG statistics
    static getPGStatistics() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalPGs = yield prisma_1.prisma.pG.count();
            const activePGs = yield prisma_1.prisma.pG.count({
                where: { status: 'active' },
            });
            const totalRooms = yield prisma_1.prisma.pGRoom.count();
            const totalUsers = yield prisma_1.prisma.user.count({
                where: { role: { in: ['pg_owner', 'pg_staff'] } },
            });
            return {
                totalPGs,
                activePGs,
                inactivePGs: totalPGs - activePGs,
                totalRooms,
                totalUsers,
            };
        });
    }
}
exports.PGService = PGService;
