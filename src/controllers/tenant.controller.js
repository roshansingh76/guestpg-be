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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTenants = listTenants;
exports.getTenant = getTenant;
exports.createTenant = createTenant;
exports.updateTenant = updateTenant;
exports.checkoutTenant = checkoutTenant;
exports.deleteTenant = deleteTenant;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const tenant_service_1 = require("../services/tenant.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const tenantCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(5),
    aadhar: zod_1.z.string().min(4),
    roomId: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    emergency: zod_1.z.string().optional(),
    emergencyPhone: zod_1.z.string().optional(),
    idProofUrl: zod_1.z.string().optional(),
    photoUrl: zod_1.z.string().optional(),
    moveInDate: zod_1.z.string().optional(),
    moveOutDate: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
const assetsRoot = path_1.default.resolve(__dirname, '../..', 'assets');
function saveTenantFile(file, pgId, tenantId, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = path_1.default.resolve(assetsRoot, String(pgId), String(tenantId), folder);
        yield promises_1.default.mkdir(dir, { recursive: true });
        const extension = path_1.default.extname(file.originalname) || '';
        const filename = `${Date.now()}${extension}`;
        const filePath = path_1.default.join(dir, filename);
        yield promises_1.default.writeFile(filePath, file.buffer);
        return `/assets/${pgId}/${tenantId}/${folder}/${filename}`;
    });
}
function listTenants(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pgId = Number(req.params.pgId);
            const auth = req.auth;
            if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
                return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
            }
            const { status, skip = 0, limit = 20 } = req.query;
            const page = Math.floor(Number(skip) / Number(limit)) + 1;
            const result = yield tenant_service_1.TenantService.getTenantsByPG(pgId, status, page, Number(limit));
            return (0, response_1.sendList)(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount });
        }
        catch (error) {
            logger_1.logger.error('List tenants failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching tenants');
        }
    });
}
function getTenant(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pgId = Number(req.params.pgId);
            const id = Number(req.params.id);
            const auth = req.auth;
            if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
                return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
            }
            const tenant = yield tenant_service_1.TenantService.getTenantById(pgId, id);
            if (!tenant)
                return (0, response_1.sendNotFound)(res, 'Tenant not found');
            return (0, response_1.sendSuccess)(res, tenant);
        }
        catch (error) {
            logger_1.logger.error('Get tenant failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching tenant');
        }
    });
}
function createTenant(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const pgId = Number(req.params.pgId);
            if (!Number.isFinite(pgId) || pgId <= 0)
                return (0, response_1.sendBadRequest)(res, 'Invalid pgId');
            const auth = req.auth;
            if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
                return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
            }
            const parsed = tenantCreateSchema.safeParse(req.body);
            if (!parsed.success)
                return (0, response_1.sendBadRequest)(res, 'Invalid input', parsed.error.issues);
            const tenant = yield tenant_service_1.TenantService.createTenant({
                name: parsed.data.name,
                phone: parsed.data.phone,
                aadhar: parsed.data.aadhar,
                pgId,
                roomId: parsed.data.roomId ? Number(parsed.data.roomId) : undefined,
                address: parsed.data.address,
                emergency: parsed.data.emergency,
                emergencyPhone: parsed.data.emergencyPhone,
                idProofUrl: parsed.data.idProofUrl,
                photoUrl: parsed.data.photoUrl,
                moveInDate: parsed.data.moveInDate ? new Date(parsed.data.moveInDate) : new Date(),
                moveOutDate: parsed.data.moveOutDate ? new Date(parsed.data.moveOutDate) : undefined,
                status: parsed.data.status || 'active',
            });
            const files = req.files;
            const updateData = {};
            if ((_a = files === null || files === void 0 ? void 0 : files.photo) === null || _a === void 0 ? void 0 : _a[0]) {
                updateData.photoUrl = yield saveTenantFile(files.photo[0], pgId, tenant.id, 'photo');
            }
            if ((_b = files === null || files === void 0 ? void 0 : files.idProof) === null || _b === void 0 ? void 0 : _b[0]) {
                updateData.idProofUrl = yield saveTenantFile(files.idProof[0], pgId, tenant.id, 'id-proof');
            }
            if (Object.keys(updateData).length > 0) {
                const updatedTenant = yield tenant_service_1.TenantService.updateTenant(pgId, tenant.id, updateData);
                return (0, response_1.sendCreated)(res, updatedTenant || tenant);
            }
            return (0, response_1.sendCreated)(res, tenant);
        }
        catch (error) {
            logger_1.logger.error('Create tenant failed', { error });
            if (error.statusCode === 404) {
                return (0, response_1.sendNotFound)(res, error.message);
            }
            if (error.statusCode === 400) {
                return (0, response_1.sendBadRequest)(res, error.message);
            }
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error creating tenant');
        }
    });
}
function updateTenant(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const pgId = Number(req.params.pgId);
            const id = Number(req.params.id);
            if (!Number.isFinite(id))
                return (0, response_1.sendBadRequest)(res, 'Invalid id');
            const auth = req.auth;
            if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
                return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
            }
            const parsed = tenantCreateSchema.partial().safeParse(req.body);
            if (!parsed.success)
                return (0, response_1.sendBadRequest)(res, 'Invalid input', parsed.error.issues);
            const tenant = yield tenant_service_1.TenantService.updateTenant(pgId, id, {
                name: parsed.data.name,
                phone: parsed.data.phone,
                aadhar: parsed.data.aadhar,
                roomId: parsed.data.roomId ? Number(parsed.data.roomId) : undefined,
                address: parsed.data.address,
                emergency: parsed.data.emergency,
                emergencyPhone: parsed.data.emergencyPhone,
                idProofUrl: parsed.data.idProofUrl,
                photoUrl: parsed.data.photoUrl,
                moveInDate: parsed.data.moveInDate ? new Date(parsed.data.moveInDate) : undefined,
                moveOutDate: parsed.data.moveOutDate ? new Date(parsed.data.moveOutDate) : undefined,
                status: parsed.data.status,
            });
            const files = req.files;
            const updateData = {};
            if ((_a = files === null || files === void 0 ? void 0 : files.photo) === null || _a === void 0 ? void 0 : _a[0]) {
                updateData.photoUrl = yield saveTenantFile(files.photo[0], pgId, id, 'photo');
            }
            if ((_b = files === null || files === void 0 ? void 0 : files.idProof) === null || _b === void 0 ? void 0 : _b[0]) {
                updateData.idProofUrl = yield saveTenantFile(files.idProof[0], pgId, id, 'id-proof');
            }
            if (Object.keys(updateData).length > 0) {
                const tenantWithFiles = yield tenant_service_1.TenantService.updateTenant(pgId, id, updateData);
                if (!tenantWithFiles)
                    return (0, response_1.sendNotFound)(res, 'Tenant not found');
                return (0, response_1.sendSuccess)(res, tenantWithFiles);
            }
            if (!tenant)
                return (0, response_1.sendNotFound)(res, 'Tenant not found');
            return (0, response_1.sendSuccess)(res, tenant);
        }
        catch (error) {
            logger_1.logger.error('Update tenant failed', { error });
            if (error.statusCode === 404) {
                return (0, response_1.sendNotFound)(res, error.message);
            }
            if (error.statusCode === 400) {
                return (0, response_1.sendBadRequest)(res, error.message);
            }
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating tenant');
        }
    });
}
function checkoutTenant(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pgId = Number(req.params.pgId);
            const id = Number(req.params.id);
            const auth = req.auth;
            if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
                return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
            }
            const tenant = yield tenant_service_1.TenantService.checkoutTenant(pgId, id);
            if (!tenant)
                return (0, response_1.sendNotFound)(res, 'Tenant not found');
            return (0, response_1.sendSuccess)(res, { success: true });
        }
        catch (error) {
            logger_1.logger.error('Checkout tenant failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error checking out tenant');
        }
    });
}
function deleteTenant(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pgId = Number(req.params.pgId);
            const id = Number(req.params.id);
            if (!Number.isFinite(id))
                return (0, response_1.sendBadRequest)(res, 'Invalid id');
            const auth = req.auth;
            if (auth.role !== 'admin' && auth.role !== 'super_admin' && auth.pgId !== pgId) {
                return (0, response_1.sendError)(res, 'Forbidden', 'FORBIDDEN', [], 403);
            }
            const deleted = yield tenant_service_1.TenantService.deleteTenant(pgId, id);
            if (deleted.count === 0)
                return (0, response_1.sendNotFound)(res, 'Tenant not found');
            return (0, response_1.sendSuccess)(res, { success: true });
        }
        catch (error) {
            logger_1.logger.error('Delete tenant failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error deleting tenant');
        }
    });
}
