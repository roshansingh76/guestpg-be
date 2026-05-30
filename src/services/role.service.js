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
exports.RoleService = exports.ALL_PERMISSIONS = void 0;
const prisma_1 = require("../db/prisma");
// All valid permissions in the system
exports.ALL_PERMISSIONS = [
    // Users
    'users:read',
    'users:write',
    'users:delete',
    // PGs
    'pgs:read',
    'pgs:write',
    'pgs:delete',
    // Tenants
    'tenants:read',
    'tenants:write',
    'tenants:delete',
    // Billing
    'billing:read',
    'billing:write',
    // Expenses
    'expenses:read',
    'expenses:write',
    'expenses:delete',
    // Cities & Areas
    'cities:read',
    'cities:write',
    'areas:read',
    'areas:write',
    // Roles (admin-only)
    'roles:read',
    'roles:write',
];
class RoleService {
    // ─── Create ─────────────────────────────────────────────────────────────────
    static createRole(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            return prisma_1.prisma.role.create({
                data: {
                    name: data.name.toLowerCase().trim(),
                    displayName: data.displayName.trim(),
                    description: (_a = data.description) === null || _a === void 0 ? void 0 : _a.trim(),
                    permissions: data.permissions,
                    status: (_b = data.status) !== null && _b !== void 0 ? _b : 'active',
                    isSystem: false,
                },
            });
        });
    }
    // ─── Read: list all with filters + pagination ────────────────────────────────
    static getAllRoles(filters, pagination) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = (pagination === null || pagination === void 0 ? void 0 : pagination.page) || 1;
            const limit = (pagination === null || pagination === void 0 ? void 0 : pagination.limit) || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
                where.status = filters.status;
            }
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { displayName: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            const [roles, total] = yield Promise.all([
                prisma_1.prisma.role.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
                }),
                prisma_1.prisma.role.count({ where }),
            ]);
            return {
                data: roles,
                pagination: {
                    page,
                    limit,
                    totalCount: total,
                },
            };
        });
    }
    // ─── Read: single by ID ──────────────────────────────────────────────────────
    static getRoleById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.role.findUnique({ where: { id } });
        });
    }
    // ─── Read: single by name ────────────────────────────────────────────────────
    static getRoleByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.role.findUnique({
                where: { name: name.toLowerCase().trim() },
            });
        });
    }
    // ─── Update ──────────────────────────────────────────────────────────────────
    static updateRole(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Prevent mutating system roles' permissions/status if desired
            const existing = yield prisma_1.prisma.role.findUnique({ where: { id } });
            if (!existing)
                return null;
            const updateData = {};
            if (data.displayName !== undefined)
                updateData.displayName = data.displayName.trim();
            if (data.description !== undefined)
                updateData.description = (_b = (_a = data.description) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : null;
            if (data.permissions !== undefined)
                updateData.permissions = data.permissions;
            if (data.status !== undefined)
                updateData.status = data.status;
            return prisma_1.prisma.role.update({ where: { id }, data: updateData });
        });
    }
    // ─── Delete ──────────────────────────────────────────────────────────────────
    static deleteRole(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield prisma_1.prisma.role.findUnique({ where: { id } });
            if (!existing)
                return null;
            if (existing.isSystem) {
                throw new Error('System roles cannot be deleted');
            }
            return prisma_1.prisma.role.delete({ where: { id } });
        });
    }
    // ─── Seed default system roles ───────────────────────────────────────────────
    static seedSystemRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            const systemRoles = [
                {
                    name: 'super_admin',
                    displayName: 'Super Admin',
                    description: 'Full access to everything in the system',
                    permissions: [...exports.ALL_PERMISSIONS],
                    isSystem: true,
                },
                {
                    name: 'admin',
                    displayName: 'Admin',
                    description: 'Administrative access, can manage users, PGs, billing and configuration',
                    permissions: exports.ALL_PERMISSIONS.filter((p) => p !== 'roles:write'),
                    isSystem: true,
                },
                {
                    name: 'pg_owner',
                    displayName: 'PG Owner',
                    description: 'Manages their own PG properties, tenants and billing',
                    permissions: [
                        'pgs:read',
                        'pgs:write',
                        'tenants:read',
                        'tenants:write',
                        'billing:read',
                        'billing:write',
                        'expenses:read',
                        'expenses:write',
                    ],
                    isSystem: true,
                },
                {
                    name: 'pg_staff',
                    displayName: 'PG Staff',
                    description: 'Day-to-day operations for a PG — view tenants and raise bills',
                    permissions: [
                        'pgs:read',
                        'tenants:read',
                        'tenants:write',
                        'billing:read',
                        'billing:write',
                        'expenses:read',
                    ],
                    isSystem: true,
                },
            ];
            for (const role of systemRoles) {
                yield prisma_1.prisma.role.upsert({
                    where: { name: role.name },
                    update: {
                        displayName: role.displayName,
                        description: role.description,
                        permissions: role.permissions,
                    },
                    create: Object.assign(Object.assign({}, role), { permissions: role.permissions, status: 'active' }),
                });
            }
            return prisma_1.prisma.role.findMany({ where: { isSystem: true } });
        });
    }
    // ─── Stats ───────────────────────────────────────────────────────────────────
    static getRoleStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const [total, active, inactive, system, custom] = yield Promise.all([
                prisma_1.prisma.role.count(),
                prisma_1.prisma.role.count({ where: { status: 'active' } }),
                prisma_1.prisma.role.count({ where: { status: 'inactive' } }),
                prisma_1.prisma.role.count({ where: { isSystem: true } }),
                prisma_1.prisma.role.count({ where: { isSystem: false } }),
            ]);
            return { total, active, inactive, system, custom };
        });
    }
}
exports.RoleService = RoleService;
