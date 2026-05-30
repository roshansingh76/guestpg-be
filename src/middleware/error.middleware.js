"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Unhandled exception caught by middleware', {
        path: req.path,
        method: req.method,
        message: err === null || err === void 0 ? void 0 : err.message,
        stack: err === null || err === void 0 ? void 0 : err.stack,
    });
    if (res.headersSent) {
        return next(err);
    }
    const status = (err === null || err === void 0 ? void 0 : err.statusCode) || 500;
    const code = (err === null || err === void 0 ? void 0 : err.code) || 'INTERNAL_SERVER_ERROR';
    const message = (err === null || err === void 0 ? void 0 : err.message) || 'Internal server error';
    const details = Array.isArray(err === null || err === void 0 ? void 0 : err.details)
        ? err.details
        : Array.isArray(err === null || err === void 0 ? void 0 : err.errors)
            ? err.errors
            : [];
    return (0, response_1.sendError)(res, message, code, details, status);
};
exports.errorHandler = errorHandler;
