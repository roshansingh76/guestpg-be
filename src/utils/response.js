"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUnauthorized = exports.sendConflict = exports.sendNotFound = exports.sendBadRequest = exports.sendError = exports.sendList = exports.sendCreated = exports.sendSuccess = void 0;
// Single resource response (GET /api/resource/id, POST, PUT, DELETE)
const sendSuccess = (res, data, status = 200) => {
    return res.status(status).json({
        success: true,
        data,
        error: null,
    });
};
exports.sendSuccess = sendSuccess;
// Create operation (201)
const sendCreated = (res, data) => (0, exports.sendSuccess)(res, data, 201);
exports.sendCreated = sendCreated;
// List response with pagination (GET /api/resource?skip=0&limit=20)
const sendList = (res, items, pagination, status = 200) => {
    return res.status(status).json({
        success: true,
        data: {
            items,
            pagination,
        },
        error: null,
    });
};
exports.sendList = sendList;
const sendError = (res, message = 'Internal server error', code = 'INTERNAL_SERVER_ERROR', details = [], status = 500) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: {
            message,
            code,
            details: details.length > 0 ? details : [],
        },
    });
};
exports.sendError = sendError;
const sendBadRequest = (res, message = 'Bad request', details = []) => (0, exports.sendError)(res, message, 'BAD_REQUEST', details, 400);
exports.sendBadRequest = sendBadRequest;
const sendNotFound = (res, message = 'Resource not found', details = []) => (0, exports.sendError)(res, message, 'NOT_FOUND', details, 404);
exports.sendNotFound = sendNotFound;
const sendConflict = (res, message = 'Conflict', details = []) => (0, exports.sendError)(res, message, 'CONFLICT', details, 409);
exports.sendConflict = sendConflict;
const sendUnauthorized = (res, message = 'Unauthorized', details = []) => (0, exports.sendError)(res, message, 'UNAUTHORIZED', details, 401);
exports.sendUnauthorized = sendUnauthorized;
