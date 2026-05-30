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
exports.RoomService = void 0;
const prisma_1 = require("../db/prisma");
class RoomService {
    // Create new room
    static createRoom(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGRoom.create({
                data,
            });
        });
    }
    // Get rooms for PG
    static getRoomsByPG(pgId, pagination) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = (pagination === null || pagination === void 0 ? void 0 : pagination.page) || 1;
            const limit = (pagination === null || pagination === void 0 ? void 0 : pagination.limit) || 10;
            const skip = (page - 1) * limit;
            const [rooms, total] = yield Promise.all([
                prisma_1.prisma.pGRoom.findMany({
                    where: { pgId },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma_1.prisma.pGRoom.count({ where: { pgId } }),
            ]);
            return {
                data: rooms,
                pagination: {
                    skip,
                    count: rooms.length,
                    totalCount: total,
                },
            };
        });
    }
    // Get room by ID
    static getRoomById(id, pgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGRoom.findFirst({
                where: {
                    id,
                    pgId,
                },
            });
        });
    }
    // Update room
    static updateRoom(id, pgId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGRoom.updateMany({
                where: {
                    id,
                    pgId,
                },
                data,
            });
        });
    }
    // Delete room
    static deleteRoom(id, pgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGRoom.deleteMany({
                where: {
                    id,
                    pgId,
                },
            });
        });
    }
    // Check if room number exists for PG
    static roomNumberExists(pgId, roomNumber, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                pgId,
                roomNumber,
            };
            if (excludeId) {
                where.NOT = { id: excludeId };
            }
            return prisma_1.prisma.pGRoom.findFirst({ where });
        });
    }
    // Get available beds count for PG
    static getAvailableBeds(pgId) {
        return __awaiter(this, void 0, void 0, function* () {
            const rooms = yield prisma_1.prisma.pGRoom.findMany({
                where: { pgId },
            });
            return rooms.reduce((total, room) => total + room.availableBeds, 0);
        });
    }
    // Update available beds
    static updateAvailableBeds(roomId, pgId, availableBeds) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pGRoom.updateMany({
                where: {
                    id: roomId,
                    pgId,
                },
                data: { availableBeds },
            });
        });
    }
}
exports.RoomService = RoomService;
