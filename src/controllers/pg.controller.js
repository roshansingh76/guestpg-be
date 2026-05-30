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
exports.changePGStatus = exports.deletePG = exports.updatePG = exports.getPGById = exports.getAllPGs = exports.createPG = void 0;
const pg_service_1 = require("../services/pg.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const validation_1 = require("../utils/validation");
const createPG = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgName, ownerName, ownerPhone, ownerEmail, addressLine1, addressLine2, nearbyMark, areaId, cityId, state, latitude, longitude, pgType, numberOfRooms, isFoodAvailable, } = req.body;
        const missingFields = (0, validation_1.buildMissingFieldDetails)(req.body, [
            'pgName',
            'ownerName',
            'ownerPhone',
            'ownerEmail',
            'addressLine1',
            'state',
            'latitude',
            'longitude',
            'pgType',
        ]);
        if (missingFields.length > 0) {
            return (0, response_1.sendBadRequest)(res, 'Missing required fields', missingFields);
        }
        const pg = yield pg_service_1.PGService.createPG({
            pgName,
            ownerName,
            ownerPhone,
            ownerEmail,
            addressLine1,
            addressLine2,
            nearbyMark,
            areaId: areaId ? Number(areaId) : undefined,
            cityId: cityId ? Number(cityId) : undefined,
            state,
            latitude: Number(latitude),
            longitude: Number(longitude),
            pgType,
            numberOfRooms,
            isFoodAvailable: isFoodAvailable || false,
        });
        return (0, response_1.sendCreated)(res, pg);
    }
    catch (error) {
        logger_1.logger.error('Create PG failed', { error });
        if (error.code === 'P2002') {
            return (0, response_1.sendConflict)(res, 'Owner email already exists');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error creating PG');
    }
});
exports.createPG = createPG;
const getAllPGs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const auth = req.auth;
        const { status, cityId, pgType, skip = 0, limit = 10 } = req.query;
        const page = Math.floor(Number(skip) / Number(limit)) + 1;
        const result = yield pg_service_1.PGService.getAllPGs({
            status: status,
            cityId: cityId ? Number(cityId) : undefined,
            pgType: pgType,
            userId: auth.sub,
            userRole: auth.role,
            userPgIds: auth.pgIds,
        }, { page: Number(page), limit: Number(limit) });
        return (0, response_1.sendList)(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount });
    }
    catch (error) {
        logger_1.logger.error('Get all PGs failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching PGs');
    }
});
exports.getAllPGs = getAllPGs;
const getPGById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const pg = yield pg_service_1.PGService.getPGById(Number(id));
        if (!pg) {
            return (0, response_1.sendNotFound)(res, 'PG not found');
        }
        return (0, response_1.sendSuccess)(res, pg);
    }
    catch (error) {
        logger_1.logger.error('Get PG by id failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching PG');
    }
});
exports.getPGById = getPGById;
const updatePG = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const pg = yield pg_service_1.PGService.updatePG(Number(id), updateData);
        return (0, response_1.sendSuccess)(res, pg);
    }
    catch (error) {
        logger_1.logger.error('Update PG failed', { error });
        if (error.code === 'P2025') {
            return (0, response_1.sendNotFound)(res, 'PG not found');
        }
        if (error.code === 'P2002') {
            return (0, response_1.sendConflict)(res, 'Owner email already exists');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating PG');
    }
});
exports.updatePG = updatePG;
const deletePG = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield pg_service_1.PGService.deletePG(Number(id));
        return (0, response_1.sendSuccess)(res, { success: true });
    }
    catch (error) {
        logger_1.logger.error('Delete PG failed', { error });
        if (error.code === 'P2025') {
            return (0, response_1.sendNotFound)(res, 'PG not found');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error deleting PG');
    }
});
exports.deletePG = deletePG;
const changePGStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['active', 'inactive'].includes(status)) {
            return (0, response_1.sendBadRequest)(res, 'Invalid status. Must be active or inactive');
        }
        const pg = yield pg_service_1.PGService.updatePG(Number(id), { status: status });
        return (0, response_1.sendSuccess)(res, pg);
    }
    catch (error) {
        logger_1.logger.error('Change PG status failed', { error });
        if (error.code === 'P2025') {
            return (0, response_1.sendNotFound)(res, 'PG not found');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating PG status');
    }
});
exports.changePGStatus = changePGStatus;
