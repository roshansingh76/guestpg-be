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
exports.deleteRoom = exports.updateRoom = exports.getRoomById = exports.getRoomsByPG = exports.createRoom = void 0;
const room_service_1 = require("../services/room.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const validation_1 = require("../utils/validation");
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId } = req.params;
        const auth = req.auth;
        if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== Number(pgId)) {
            return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
        }
        const { roomNumber, totalBeds, availableBeds, pricePerBed, acType, securityPerBed } = req.body;
        const missingFields = (0, validation_1.buildMissingFieldDetails)(req.body, [
            'roomNumber',
            'totalBeds',
            'availableBeds',
            'pricePerBed',
            'acType',
            'securityPerBed',
        ]);
        if (missingFields.length > 0) {
            return (0, response_1.sendBadRequest)(res, 'Missing required fields', missingFields);
        }
        const room = yield room_service_1.RoomService.createRoom({
            pgId: Number(pgId),
            roomNumber,
            totalBeds: Number(totalBeds),
            availableBeds: Number(availableBeds),
            pricePerBed: Number(pricePerBed),
            acType,
            securityPerBed: Boolean(securityPerBed),
        });
        return (0, response_1.sendCreated)(res, room);
    }
    catch (error) {
        logger_1.logger.error('Create room failed', { error });
        if (error.code === 'P2002') {
            return (0, response_1.sendConflict)(res, 'Room number already exists for this PG');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error creating room');
    }
});
exports.createRoom = createRoom;
const getRoomsByPG = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId } = req.params;
        const auth = req.auth;
        if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== Number(pgId)) {
            return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
        }
        const { skip = 0, limit = 10 } = req.query;
        const page = Math.floor(Number(skip) / Number(limit)) + 1;
        const result = yield room_service_1.RoomService.getRoomsByPG(Number(pgId), {
            page,
            limit: Number(limit),
        });
        return (0, response_1.sendList)(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount });
    }
    catch (error) {
        logger_1.logger.error('Get rooms by PG failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching rooms');
    }
});
exports.getRoomsByPG = getRoomsByPG;
const getRoomById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId, roomId } = req.params;
        const auth = req.auth;
        if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== Number(pgId)) {
            return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
        }
        const room = yield room_service_1.RoomService.getRoomById(Number(roomId), Number(pgId));
        if (!room) {
            return (0, response_1.sendNotFound)(res, 'Room not found');
        }
        return (0, response_1.sendSuccess)(res, room);
    }
    catch (error) {
        logger_1.logger.error('Get room by id failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching room');
    }
});
exports.getRoomById = getRoomById;
const updateRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId, roomId } = req.params;
        const auth = req.auth;
        if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== Number(pgId)) {
            return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
        }
        const updateData = req.body;
        const updated = yield room_service_1.RoomService.updateRoom(Number(roomId), Number(pgId), updateData);
        if (updated.count === 0) {
            return (0, response_1.sendNotFound)(res, 'Room not found');
        }
        const room = yield room_service_1.RoomService.getRoomById(Number(roomId), Number(pgId));
        return (0, response_1.sendSuccess)(res, room);
    }
    catch (error) {
        logger_1.logger.error('Update room failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating room');
    }
});
exports.updateRoom = updateRoom;
const deleteRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId, roomId } = req.params;
        const auth = req.auth;
        if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== Number(pgId)) {
            return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
        }
        const deleted = yield room_service_1.RoomService.deleteRoom(Number(roomId), Number(pgId));
        if (deleted.count === 0) {
            return (0, response_1.sendNotFound)(res, 'Room not found');
        }
        return (0, response_1.sendSuccess)(res, { success: true });
    }
    catch (error) {
        logger_1.logger.error('Delete room failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error deleting room');
    }
});
exports.deleteRoom = deleteRoom;
