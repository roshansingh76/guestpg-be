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
exports.seedSystemRoles = exports.changeRoleStatus = exports.deleteRole = exports.updateRole = exports.getRoleById = exports.getRoleStats = exports.getPermissions = exports.getAllRoles = exports.createRole = void 0;
const zod_1 = require("zod");
const role_service_1 = require("../services/role.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
// ─── Validation Schemas ──────────────────────────────────────────────────────
const createRoleSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Role name must be at least 2 characters')
        .max(50, 'Role name must be at most 50 characters')
        .regex(/^[a-z0-9_]+$/, 'Role name must be lowercase letters, numbers and underscores only'),
    displayName: zod_1.z
        .string()
        .min(2, 'Display name must be at least 2 characters')
        .max(100, 'Display name must be at most 100 characters'),
    description: zod_1.z.string().max(500, 'Description must be at most 500 characters').optional(),
    permissions: zod_1.z
        .array(zod_1.z.string())
        .min(1, 'At least one permission is required')
        .refine((perms) => perms.every((p) => role_service_1.ALL_PERMISSIONS.includes(p)), {
        message: 'One or more permissions are invalid. Check GET /api/roles/permissions for the full list.',
    }),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
const updateRoleSchema = zod_1.z.object({
    displayName: zod_1.z
        .string()
        .min(2, 'Display name must be at least 2 characters')
        .max(100)
        .optional(),
    description: zod_1.z.string().max(500).optional(),
    permissions: zod_1.z
        .array(zod_1.z.string())
        .min(1, 'At least one permission is required')
        .refine((perms) => perms.every((p) => role_service_1.ALL_PERMISSIONS.includes(p)), {
        message: 'One or more permissions are invalid. Check GET /api/roles/permissions for the full list.',
    })
        .optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
// ─── Handlers ────────────────────────────────────────────────────────────────
/**
 * POST /api/roles
 * Create a new custom role (admin only)
 */
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const parsed = createRoleSchema.safeParse(req.body);
        if (!parsed.success) {
            return (0, response_1.sendBadRequest)(res, 'Validation failed', parsed.error.issues);
        }
        const { name, displayName, description, permissions, status } = parsed.data;
        // Check for duplicate name
        const existing = yield role_service_1.RoleService.getRoleByName(name);
        if (existing) {
            return (0, response_1.sendConflict)(res, `Role with name "${name}" already exists`);
        }
        const role = yield role_service_1.RoleService.createRole({
            name,
            displayName,
            description,
            permissions,
            status,
        });
        logger_1.logger.info('Role created', { roleId: role.id, name: role.name, by: (_a = req.auth) === null || _a === void 0 ? void 0 : _a.sub });
        return (0, response_1.sendCreated)(res, role);
    }
    catch (error) {
        logger_1.logger.error('Create role failed', { error });
        if (error.code === 'P2002') {
            return (0, response_1.sendConflict)(res, 'Role name already exists');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error creating role');
    }
});
exports.createRole = createRole;
/**
 * GET /api/roles
 * List all roles with optional filters and pagination (admin only)
 */
const getAllRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, search, skip = 0, limit = 10 } = req.query;
        const parsedLimit = Math.min(Number(limit) || 10, 100);
        const parsedSkip = Number(skip) || 0;
        const page = Math.floor(parsedSkip / parsedLimit) + 1;
        const result = yield role_service_1.RoleService.getAllRoles({
            status: status,
            search: search,
        }, { page, limit: parsedLimit });
        return (0, response_1.sendList)(res, result.data, {
            skip: parsedSkip,
            count: result.data.length,
            totalCount: result.pagination.totalCount,
        });
    }
    catch (error) {
        logger_1.logger.error('Get all roles failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching roles');
    }
});
exports.getAllRoles = getAllRoles;
/**
 * GET /api/roles/permissions
 * Return the full list of available permissions (admin only)
 */
const getPermissions = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Group permissions by resource for better UX
        const grouped = {};
        for (const perm of role_service_1.ALL_PERMISSIONS) {
            const [resource] = perm.split(':');
            if (!grouped[resource])
                grouped[resource] = [];
            grouped[resource].push(perm);
        }
        return (0, response_1.sendSuccess)(res, {
            permissions: role_service_1.ALL_PERMISSIONS,
            grouped,
        });
    }
    catch (error) {
        logger_1.logger.error('Get permissions failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching permissions');
    }
});
exports.getPermissions = getPermissions;
/**
 * GET /api/roles/stats
 * Role statistics (admin only)
 */
const getRoleStats = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield role_service_1.RoleService.getRoleStats();
        return (0, response_1.sendSuccess)(res, stats);
    }
    catch (error) {
        logger_1.logger.error('Get role stats failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching role stats');
    }
});
exports.getRoleStats = getRoleStats;
/**
 * GET /api/roles/:id
 * Get a single role by ID (admin only)
 */
const getRoleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return (0, response_1.sendBadRequest)(res, 'Invalid role ID');
        const role = yield role_service_1.RoleService.getRoleById(id);
        if (!role)
            return (0, response_1.sendNotFound)(res, 'Role not found');
        return (0, response_1.sendSuccess)(res, role);
    }
    catch (error) {
        logger_1.logger.error('Get role by id failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching role');
    }
});
exports.getRoleById = getRoleById;
/**
 * PUT /api/roles/:id
 * Update a role (admin only)
 * System roles: can update displayName, description, permissions
 * Custom roles: full update
 */
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return (0, response_1.sendBadRequest)(res, 'Invalid role ID');
        const parsed = updateRoleSchema.safeParse(req.body);
        if (!parsed.success) {
            return (0, response_1.sendBadRequest)(res, 'Validation failed', parsed.error.issues);
        }
        if (Object.keys(parsed.data).length === 0) {
            return (0, response_1.sendBadRequest)(res, 'No fields provided for update');
        }
        const role = yield role_service_1.RoleService.updateRole(id, parsed.data);
        if (!role)
            return (0, response_1.sendNotFound)(res, 'Role not found');
        logger_1.logger.info('Role updated', { roleId: id, by: (_a = req.auth) === null || _a === void 0 ? void 0 : _a.sub });
        return (0, response_1.sendSuccess)(res, role);
    }
    catch (error) {
        logger_1.logger.error('Update role failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating role');
    }
});
exports.updateRole = updateRole;
/**
 * DELETE /api/roles/:id
 * Delete a custom role (admin only — system roles are protected)
 */
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return (0, response_1.sendBadRequest)(res, 'Invalid role ID');
        const role = yield role_service_1.RoleService.deleteRole(id);
        if (!role)
            return (0, response_1.sendNotFound)(res, 'Role not found');
        logger_1.logger.info('Role deleted', { roleId: id, by: (_a = req.auth) === null || _a === void 0 ? void 0 : _a.sub });
        return (0, response_1.sendSuccess)(res, { message: 'Role deleted successfully' });
    }
    catch (error) {
        logger_1.logger.error('Delete role failed', { error });
        if (error.message === 'System roles cannot be deleted') {
            return (0, response_1.sendBadRequest)(res, 'System roles cannot be deleted');
        }
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error deleting role');
    }
});
exports.deleteRole = deleteRole;
/**
 * PATCH /api/roles/:id/status
 * Toggle role active/inactive (admin only)
 */
const changeRoleStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return (0, response_1.sendBadRequest)(res, 'Invalid role ID');
        const { status } = req.body;
        if (!['active', 'inactive'].includes(status)) {
            return (0, response_1.sendBadRequest)(res, 'Status must be "active" or "inactive"');
        }
        const role = yield role_service_1.RoleService.updateRole(id, { status });
        if (!role)
            return (0, response_1.sendNotFound)(res, 'Role not found');
        logger_1.logger.info('Role status changed', { roleId: id, status, by: (_a = req.auth) === null || _a === void 0 ? void 0 : _a.sub });
        return (0, response_1.sendSuccess)(res, role);
    }
    catch (error) {
        logger_1.logger.error('Change role status failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating role status');
    }
});
exports.changeRoleStatus = changeRoleStatus;
/**
 * POST /api/roles/seed
 * Seed default system roles — idempotent, safe to call multiple times (super_admin only)
 */
const seedSystemRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const roles = yield role_service_1.RoleService.seedSystemRoles();
        logger_1.logger.info('System roles seeded', { count: roles.length, by: (_a = req.auth) === null || _a === void 0 ? void 0 : _a.sub });
        return (0, response_1.sendSuccess)(res, {
            message: `${roles.length} system roles seeded successfully`,
            roles,
        });
    }
    catch (error) {
        logger_1.logger.error('Seed system roles failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error seeding system roles');
    }
});
exports.seedSystemRoles = seedSystemRoles;
