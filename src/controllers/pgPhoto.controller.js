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
exports.deletePGPhoto = exports.getPGPhotos = exports.addPGPhoto = void 0;
const photo_service_1 = require("../services/photo.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const addPGPhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId } = req.params;
        const { photoUrl, categoryId } = req.body;
        if (!photoUrl || categoryId === undefined) {
            return (0, response_1.sendBadRequest)(res, 'photoUrl and categoryId are required');
        }
        const photo = yield photo_service_1.PhotoService.addPhoto({
            pgId: Number(pgId),
            photoUrl,
            categoryId: Number(categoryId),
        });
        return (0, response_1.sendCreated)(res, photo);
    }
    catch (error) {
        logger_1.logger.error('Add PG photo failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error adding photo');
    }
});
exports.addPGPhoto = addPGPhoto;
const getPGPhotos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId } = req.params;
        const photos = yield photo_service_1.PhotoService.getPhotosByPG(Number(pgId));
        return (0, response_1.sendSuccess)(res, photos);
    }
    catch (error) {
        logger_1.logger.error('Get PG photos failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching photos');
    }
});
exports.getPGPhotos = getPGPhotos;
const deletePGPhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId, photoId } = req.params;
        const deleted = yield photo_service_1.PhotoService.deletePhoto(Number(photoId), Number(pgId));
        if (deleted.count === 0) {
            return (0, response_1.sendNotFound)(res, 'Photo not found');
        }
        return (0, response_1.sendSuccess)(res, { success: true });
    }
    catch (error) {
        logger_1.logger.error('Delete PG photo failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error deleting photo');
    }
});
exports.deletePGPhoto = deletePGPhoto;
