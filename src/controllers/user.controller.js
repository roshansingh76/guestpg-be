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
exports.getAvailablePGs = exports.getUsersByPG = exports.changeUserStatus = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const user_service_1 = require("../services/user.service");
const role_service_1 = require("../services/role.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, password, role, pgId, status } = req.body;
        // Accept numeric role id (preferred). If a string role name is sent, allow it too.
        if (!name || !email || !phone || !password || role === undefined || role === null) {
            return (0, response_1.sendBadRequest)(res, 'Missing required fields');
        }
        // Normalize role input: if numeric -> treat as roleId, else treat as role name
        let roleRecord = null;
        if (!isNaN(Number(role))) {
            roleRecord = yield role_service_1.RoleService.getRoleById(Number(role));
        }
        else {
            roleRecord = yield role_service_1.RoleService.getRoleByName(String(role));
        }
        if (!roleRecord) {
            return (0, response_1.sendBadRequest)(res, 'Invalid role. Must be a valid role id or role name');
        }
        if ((roleRecord.name === 'pg_owner' || roleRecord.name === 'pg_staff') && !pgId && !Array.isArray(req.body.pgIds)) {
            return (0, response_1.sendBadRequest)(res, `pgId or pgIds is required for role: ${roleRecord.name}`);
        }
        const user = yield user_service_1.UserService.createUser({
            name,
            email,
            phone,
            password,
            roleId: roleRecord.id,
            pgId,
            pgIds: Array.isArray(req.body.pgIds) ? req.body.pgIds.map(Number) : undefined,
            status: status || 'active',
        });
        return (0, response_1.sendCreated)(res, user);
    }
    catch (error) {
        logger_1.logger.error('Create user failed', { error });
        if (error.code === 'P2002') {
            return (0, response_1.sendConflict)(res, 'Email already exists');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error creating user');
    }
});
exports.createUser = createUser;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role, status, pgId, skip = 0, limit = 10 } = req.query;
        const filters = {};
        if (role) {
            // role query can be id or name; prefer numeric id
            if (!isNaN(Number(role)))
                filters.roleId = Number(role);
            else
                filters.role = String(role);
        }
        if (status)
            filters.status = status;
        if (pgId)
            filters.pgId = Number(pgId);
        const page = Math.floor(Number(skip) / Number(limit)) + 1;
        const result = yield user_service_1.UserService.getAllUsers(filters, {
            page,
            limit: Number(limit),
        });
        return (0, response_1.sendList)(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount });
    }
    catch (error) {
        logger_1.logger.error('Get all users failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching users');
    }
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_service_1.UserService.getUserById(Number(id));
        if (!user) {
            return (0, response_1.sendNotFound)(res, 'User not found');
        }
        return (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        logger_1.logger.error('Get user by id failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching user');
    }
});
exports.getUserById = getUserById;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, phone, role, pgId, status, password } = req.body;
        let roleRecord = null;
        if (role !== undefined) {
            if (!isNaN(Number(role))) {
                roleRecord = yield role_service_1.RoleService.getRoleById(Number(role));
            }
            else {
                roleRecord = yield role_service_1.RoleService.getRoleByName(String(role));
            }
            if (!roleRecord)
                return (0, response_1.sendBadRequest)(res, 'Invalid role ID or name');
        }
        if (roleRecord && (roleRecord.name === 'pg_owner' || roleRecord.name === 'pg_staff') && !pgId && !Array.isArray(req.body.pgIds)) {
            return (0, response_1.sendBadRequest)(res, `pgId or pgIds is required for role: ${roleRecord.name}`);
        }
        const user = yield user_service_1.UserService.updateUser(Number(id), {
            name,
            email,
            phone,
            roleId: roleRecord ? roleRecord.id : undefined,
            pgId,
            pgIds: Array.isArray(req.body.pgIds) ? req.body.pgIds.map(Number) : undefined,
            status,
            password,
        });
        if (!user) {
            return (0, response_1.sendNotFound)(res, 'User not found');
        }
        return (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        logger_1.logger.error('Update user failed', { error });
        if (error.code === 'P2002') {
            return (0, response_1.sendConflict)(res, 'Email already exists');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating user');
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield user_service_1.UserService.deleteUser(Number(id));
        return (0, response_1.sendSuccess)(res, { success: true });
    }
    catch (error) {
        logger_1.logger.error('Delete user failed', { error });
        if (error.code === 'P2025') {
            return (0, response_1.sendNotFound)(res, 'User not found');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error deleting user');
    }
});
exports.deleteUser = deleteUser;
const changeUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['active', 'inactive'].includes(status)) {
            return (0, response_1.sendBadRequest)(res, 'Invalid status. Must be active or inactive');
        }
        const user = yield user_service_1.UserService.updateUser(Number(id), { status });
        if (!user) {
            return (0, response_1.sendNotFound)(res, 'User not found');
        }
        return (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        logger_1.logger.error('Change user status failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating user status');
    }
});
exports.changeUserStatus = changeUserStatus;
const getUsersByPG = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId } = req.params;
        const { skip = 0, limit = 10 } = req.query;
        const page = Math.floor(Number(skip) / Number(limit)) + 1;
        const result = yield user_service_1.UserService.getAllUsers({ pgId: Number(pgId) }, { page, limit: Number(limit) });
        return (0, response_1.sendList)(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount });
    }
    catch (error) {
        logger_1.logger.error('Get users by pg failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching users');
    }
});
exports.getUsersByPG = getUsersByPG;
const getAvailablePGs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pgs = yield user_service_1.UserService.getAvailablePGs();
        return (0, response_1.sendSuccess)(res, pgs);
    }
    catch (error) {
        logger_1.logger.error('Get available pgs failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching PGs');
    }
});
exports.getAvailablePGs = getAvailablePGs;
