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
exports.getCitiesWithAreas = exports.deleteCity = exports.updateCity = exports.getCityById = exports.getAllCities = exports.createCity = void 0;
const city_service_1 = require("../services/city.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const createCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, state } = req.body;
        if (!name) {
            return (0, response_1.sendBadRequest)(res, 'City name is required');
        }
        const city = yield city_service_1.CityService.createCity({ name, state });
        return (0, response_1.sendCreated)(res, city);
    }
    catch (error) {
        logger_1.logger.error('Create city failed', { error });
        if (error.code === 'P2002') {
            return (0, response_1.sendConflict)(res, 'City already exists');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error creating city');
    }
});
exports.createCity = createCity;
const getAllCities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, skip = 0, limit = 100 } = req.query;
        const page = Math.floor(Number(skip) / Number(limit)) + 1;
        const result = yield city_service_1.CityService.getAllCities({ status: status }, { page: Number(page), limit: Number(limit) });
        return (0, response_1.sendList)(res, result.data, {
            skip: Number(skip),
            count: result.data.length,
            totalCount: result.pagination.totalCount,
        });
    }
    catch (error) {
        logger_1.logger.error('Get all cities failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching cities');
    }
});
exports.getAllCities = getAllCities;
const getCityById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const city = yield city_service_1.CityService.getCityById(Number(id));
        if (!city) {
            return (0, response_1.sendNotFound)(res, 'City not found');
        }
        return (0, response_1.sendSuccess)(res, city);
    }
    catch (error) {
        logger_1.logger.error('Get city by id failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching city');
    }
});
exports.getCityById = getCityById;
const updateCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, state, status } = req.body;
        const city = yield city_service_1.CityService.updateCity(Number(id), { name, state, status });
        if (!city) {
            return (0, response_1.sendNotFound)(res, 'City not found');
        }
        return (0, response_1.sendSuccess)(res, city);
    }
    catch (error) {
        logger_1.logger.error('Update city failed', { error });
        if (error.code === 'P2002') {
            return (0, response_1.sendConflict)(res, 'City name already exists');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating city');
    }
});
exports.updateCity = updateCity;
const deleteCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const city = yield city_service_1.CityService.deleteCity(Number(id));
        if (!city) {
            return (0, response_1.sendNotFound)(res, 'City not found');
        }
        return (0, response_1.sendSuccess)(res, { message: 'City deleted successfully' });
    }
    catch (error) {
        logger_1.logger.error('Delete city failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error deleting city');
    }
});
exports.deleteCity = deleteCity;
const getCitiesWithAreas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cities = yield city_service_1.CityService.getCitiesWithAreas();
        return (0, response_1.sendSuccess)(res, cities);
    }
    catch (error) {
        logger_1.logger.error('Get cities with areas failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching cities');
    }
});
exports.getCitiesWithAreas = getCitiesWithAreas;
