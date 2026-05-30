"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../db/prisma");
const bcrypt = __importStar(require("bcryptjs"));
const SALT_ROUNDS = 10;
class UserService {
    // Create new user
    static createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Hash password
            const hashedPassword = yield bcrypt.hash(data.password, SALT_ROUNDS);
            // Create user first without PG relations to avoid passing `pgId` into Prisma create
            const userBase = yield prisma_1.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    passwordHash: hashedPassword,
                    roleId: data.roleId,
                    status: data.status || 'active',
                },
                include: { userPGs: { select: { pgId: true } }, pg: { select: { id: true, pgName: true } } },
            });
            let finalUser = userBase;
            // If pg assignment(s) provided, update the user to set pGId and create userPGs entries
            if ((data.pgIds && data.pgIds.length > 0) || data.pgId) {
                const pgIdsToAssign = data.pgIds && data.pgIds.length > 0 ? data.pgIds : data.pgId ? [data.pgId] : [];
                const updateData = {};
                if (pgIdsToAssign.length > 0)
                    updateData.pGId = pgIdsToAssign[0];
                if (pgIdsToAssign.length > 0) {
                    updateData.userPGs = {
                        create: pgIdsToAssign.map((pgId) => ({ pg: { connect: { id: pgId } } })),
                    };
                }
                finalUser = yield prisma_1.prisma.user.update({
                    where: { id: userBase.id },
                    data: updateData,
                    include: {
                        pg: { select: { id: true, pgName: true } },
                        userPGs: {
                            select: {
                                pgId: true,
                                pg: {
                                    select: {
                                        id: true,
                                        pgName: true,
                                        city: { select: { id: true, name: true, state: true } },
                                        state: true,
                                    },
                                },
                            },
                        },
                    },
                });
            }
            const user = finalUser;
            const _c = user, { passwordHash: _ } = _c, userWithoutPassword = __rest(_c, ["passwordHash"]);
            const pgIds = (_b = (_a = user.userPGs) === null || _a === void 0 ? void 0 : _a.map((assignment) => assignment.pgId)) !== null && _b !== void 0 ? _b : [];
            const result = Object.assign(Object.assign({}, userWithoutPassword), { pgIds });
            if (user.pGId !== undefined && user.pGId !== null)
                result.pgId = user.pGId;
            return result;
        });
    }
    // Get all users with filters and pagination
    static getAllUsers(filters, pagination) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = (pagination === null || pagination === void 0 ? void 0 : pagination.page) || 1;
            const limit = (pagination === null || pagination === void 0 ? void 0 : pagination.limit) || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.roleId)
                where.roleId = filters.roleId;
            else if (filters === null || filters === void 0 ? void 0 : filters.role)
                where.role = { name: filters.role };
            if (filters === null || filters === void 0 ? void 0 : filters.status)
                where.status = filters.status;
            if (filters === null || filters === void 0 ? void 0 : filters.pgId)
                where.userPGs = { some: { pgId: filters.pgId } };
            const [users, total] = yield Promise.all([
                prisma_1.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        status: true,
                        pGId: true,
                        pg: { select: { id: true, pgName: true, city: { select: { id: true, name: true, state: true } }, state: true } },
                        userPGs: {
                            select: {
                                pgId: true,
                                pg: {
                                    select: {
                                        id: true,
                                        pgName: true,
                                        city: { select: { id: true, name: true, state: true } },
                                        state: true,
                                    },
                                },
                            },
                        },
                        createdAt: true,
                        updatedAt: true,
                    },
                }),
                prisma_1.prisma.user.count({ where }),
            ]);
            const mappedUsers = users.map((user) => {
                var _a, _b, _c, _d;
                const pgIds = (_b = (_a = user.userPGs) === null || _a === void 0 ? void 0 : _a.map((assignment) => assignment.pgId)) !== null && _b !== void 0 ? _b : [];
                const roleName = (_d = (_c = user.role) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : user.role;
                const apiUser = Object.assign(Object.assign({}, user), { role: roleName, pgIds });
                if (user.pGId !== undefined && user.pGId !== null)
                    apiUser.pgId = user.pGId;
                return apiUser;
            });
            return {
                data: mappedUsers,
                pagination: {
                    skip,
                    count: mappedUsers.length,
                    totalCount: total,
                },
            };
        });
    }
    // Get user by ID
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const user = yield prisma_1.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    status: true,
                    pGId: true,
                    pg: { select: { id: true, pgName: true, city: { select: { id: true, name: true, state: true } }, state: true, pgType: true } },
                    userPGs: { select: { pgId: true, pg: { select: { id: true, pgName: true, city: { select: { id: true, name: true, state: true } }, state: true } } } },
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!user)
                return null;
            const pgIds = (_b = (_a = user.userPGs) === null || _a === void 0 ? void 0 : _a.map((assignment) => assignment.pgId)) !== null && _b !== void 0 ? _b : [];
            const roleName = (_d = (_c = user.role) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : user.role;
            const result = Object.assign(Object.assign({}, user), { role: roleName, pgIds });
            if (user.pGId !== undefined && user.pGId !== null)
                result.pgId = user.pGId;
            return result;
        });
    }
    // Update user
    static updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const updateData = {};
            if (data.name)
                updateData.name = data.name;
            if (data.email)
                updateData.email = data.email;
            if (data.phone)
                updateData.phone = data.phone;
            if (data.roleId !== undefined)
                updateData.roleId = data.roleId;
            if (data.status)
                updateData.status = data.status;
            if (data.pgId !== undefined)
                updateData.pgId = data.pgId;
            if (data.pgIds !== undefined) {
                updateData.pgId = data.pgIds && data.pgIds.length > 0 ? data.pgIds[0] : null;
                updateData.userPGs = {
                    deleteMany: {},
                    create: (_b = (_a = data.pgIds) === null || _a === void 0 ? void 0 : _a.map((pgId) => ({ pg: { connect: { id: pgId } } }))) !== null && _b !== void 0 ? _b : [],
                };
            }
            if (data.password) {
                updateData.passwordHash = yield bcrypt.hash(data.password, SALT_ROUNDS);
            }
            const user = yield prisma_1.prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    status: true,
                    pGId: true,
                    pg: { select: { id: true, pgName: true, city: { select: { id: true, name: true, state: true } }, state: true, pgType: true } },
                    userPGs: { select: { pgId: true, pg: { select: { id: true, pgName: true, city: { select: { id: true, name: true, state: true } }, state: true } } } },
                    createdAt: true,
                    updatedAt: true,
                },
            });
            const pgIds = (_d = (_c = user.userPGs) === null || _c === void 0 ? void 0 : _c.map((assignment) => assignment.pgId)) !== null && _d !== void 0 ? _d : [];
            const result = Object.assign(Object.assign({}, user), { pgIds });
            if (user.pGId !== undefined && user.pGId !== null)
                result.pgId = user.pGId;
            return result;
        });
    }
    // Delete user
    static deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.delete({
                where: { id },
            });
        });
    }
    // Check if email exists
    static emailExists(email, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { email };
            if (excludeId) {
                where.NOT = { id: excludeId };
            }
            return prisma_1.prisma.user.findFirst({ where });
        });
    }
    // Authenticate user
    static authenticateUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = yield prisma_1.prisma.user.findUnique({
                where: { email },
                include: {
                    role: { select: { id: true, name: true } },
                    userPGs: {
                        select: {
                            pgId: true,
                        },
                    },
                },
            });
            if (!user) {
                return null;
            }
            // Check if user is active
            if (user.status !== 'active') {
                return null;
            }
            const isPasswordValid = yield bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                return null;
            }
            const _b = user, { passwordHash: _, userPGs, role } = _b, userWithoutPassword = __rest(_b, ["passwordHash", "userPGs", "role"]);
            const pgIds = (_a = userPGs === null || userPGs === void 0 ? void 0 : userPGs.map((assignment) => assignment.pgId)) !== null && _a !== void 0 ? _a : [];
            const roleName = role === null || role === void 0 ? void 0 : role.name;
            return Object.assign(Object.assign({}, userWithoutPassword), { role: roleName, pgIds });
        });
    }
    // Get all available PGs for assignment
    static getAvailablePGs() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.pG.findMany({
                where: { status: 'active' },
                select: {
                    id: true,
                    pgName: true,
                    city: { select: { id: true, name: true, state: true } },
                    state: true,
                    pgType: true,
                    area: { select: { id: true, name: true } },
                    ownerName: true,
                },
                orderBy: { pgName: 'asc' },
            });
        });
    }
    // Get user count by role
    static getUserCountByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!isNaN(Number(role))) {
                return prisma_1.prisma.user.count({ where: { roleId: Number(role) } });
            }
            return prisma_1.prisma.user.count({ where: { role: { name: String(role) } } });
        });
    }
    // Get user statistics
    static getUserStatistics() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield prisma_1.prisma.user.count();
            const admins = yield prisma_1.prisma.user.count({ where: { role: { name: 'admin' } } });
            const pgOwners = yield prisma_1.prisma.user.count({ where: { role: { name: 'pg_owner' } } });
            const pgStaff = yield prisma_1.prisma.user.count({ where: { role: { name: 'pg_staff' } } });
            const active = yield prisma_1.prisma.user.count({ where: { status: 'active' } });
            const inactive = total - active;
            return {
                total,
                admins,
                pgOwners,
                pgStaff,
                active,
                inactive,
            };
        });
    }
}
exports.UserService = UserService;
