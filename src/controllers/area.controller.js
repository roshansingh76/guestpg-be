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
exports.getAreasByCity = exports.deleteArea = exports.updateArea = exports.getAreaById = exports.getAllAreas = exports.createArea = void 0;
const area_service_1 = require("../services/area.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const createArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, cityId } = req.body;
        if (!name || !cityId) {
            return (0, response_1.sendBadRequest)(res, 'Area name and city ID are required');
        }
        const area = yield area_service_1.AreaService.createArea({ name, cityId: Number(cityId) });
        return (0, response_1.sendCreated)(res, area);
    }
    catch (error) {
        logger_1.logger.error('Create area failed', { error });
        if (error.code === 'P2002') {
            return (0, response_1.sendConflict)(res, 'Area already exists for this city');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error creating area');
    }
});
exports.createArea = createArea;
const getAllAreas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cityId, status, skip = 0, limit = 100 } = req.query;
        const page = Math.floor(Number(skip) / Number(limit)) + 1;
        const result = yield area_service_1.AreaService.getAllAreas({ cityId: cityId ? Number(cityId) : undefined, status: status }, { page: Number(page), limit: Number(limit) });
        return (0, response_1.sendList)(res, result.data, {
            skip: Number(skip),
            count: result.data.length,
            totalCount: result.pagination.totalCount,
        });
    }
    catch (error) {
        logger_1.logger.error('Get all areas failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching areas');
    }
});
exports.getAllAreas = getAllAreas;
const getAreaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const area = yield area_service_1.AreaService.getAreaById(Number(id));
        if (!area) {
            return (0, response_1.sendNotFound)(res, 'Area not found');
        }
        return (0, response_1.sendSuccess)(res, area);
    }
    catch (error) {
        logger_1.logger.error('Get area by id failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching area');
    }
});
exports.getAreaById = getAreaById;
const updateArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, cityId, status } = req.body;
        const area = yield area_service_1.AreaService.updateArea(Number(id), {
            name,
            cityId: cityId ? Number(cityId) : undefined,
            status,
        });
        if (!area) {
            return (0, response_1.sendNotFound)(res, 'Area not found');
        }
        return (0, response_1.sendSuccess)(res, area);
    }
    catch (error) {
        logger_1.logger.error('Update area failed', { error });
        if (error.code === 'P2002') {
            return (0, response_1.sendConflict)(res, 'Area already exists for this city');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating area');
    }
});
exports.updateArea = updateArea;
const deleteArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const area = yield area_service_1.AreaService.deleteArea(Number(id));
        if (!area) {
            return (0, response_1.sendNotFound)(res, 'Area not found');
        }
        return (0, response_1.sendSuccess)(res, { message: 'Area deleted successfully' });
    }
    catch (error) {
        logger_1.logger.error('Delete area failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error deleting area');
    }
});
exports.deleteArea = deleteArea;
const getAreasByCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cityId } = req.params;
        if (!cityId) {
            return (0, response_1.sendBadRequest)(res, 'City ID is required');
        }
        const areas = yield area_service_1.AreaService.getAreasByCity(Number(cityId));
        return (0, response_1.sendSuccess)(res, areas);
    }
    catch (error) {
        logger_1.logger.error('Get areas by city failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching areas');
    }
});
exports.getAreasByCity = getAreasByCity;
