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
exports.TenantService = void 0;
const prisma_1 = require("../db/prisma");
class TenantService {
    static getTenantsByPG(pgId_1, status_1) {
        return __awaiter(this, arguments, void 0, function* (pgId, status, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const where = { pgId };
            if (status)
                where.status = status;
            const [data, total] = yield Promise.all([
                prisma_1.prisma.tenant.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma_1.prisma.tenant.count({ where }),
            ]);
            return {
                data,
                pagination: {
                    skip,
                    count: data.length,
                    totalCount: total,
                },
            };
        });
    }
    static getTenantById(pgId, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.tenant.findFirst({
                where: { id: tenantId, pgId },
            });
        });
    }
    static createTenant(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.tenant.create({
                data: {
                    name: data.name,
                    phone: data.phone,
                    aadhar: data.aadhar,
                    pgId: data.pgId,
                    roomId: data.roomId,
                    address: data.address,
                    emergency: data.emergency,
                    emergencyPhone: data.emergencyPhone,
                    idProofUrl: data.idProofUrl,
                    photoUrl: data.photoUrl,
                    moveInDate: data.moveInDate,
                    moveOutDate: data.moveOutDate,
                    status: data.status || 'active',
                },
            });
        });
    }
    static updateTenant(pgId, tenantId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = {};
            if (data.name)
                updateData.name = data.name;
            if (data.phone)
                updateData.phone = data.phone;
            if (data.aadhar)
                updateData.aadhar = data.aadhar;
            if (data.roomId !== undefined)
                updateData.roomId = data.roomId;
            if (data.address)
                updateData.address = data.address;
            if (data.emergency)
                updateData.emergency = data.emergency;
            if (data.emergencyPhone)
                updateData.emergencyPhone = data.emergencyPhone;
            if (data.idProofUrl)
                updateData.idProofUrl = data.idProofUrl;
            if (data.photoUrl)
                updateData.photoUrl = data.photoUrl;
            if (data.moveInDate)
                updateData.moveInDate = data.moveInDate;
            if (data.moveOutDate)
                updateData.moveOutDate = data.moveOutDate;
            if (data.status)
                updateData.status = data.status;
            const updated = yield prisma_1.prisma.tenant.updateMany({
                where: { id: tenantId, pgId },
                data: updateData,
            });
            if (updated.count === 0) {
                return null;
            }
            return prisma_1.prisma.tenant.findFirst({ where: { id: tenantId, pgId } });
        });
    }
    static checkoutTenant(pgId, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield prisma_1.prisma.tenant.updateMany({
                where: { id: tenantId, pgId },
                data: {
                    status: 'inactive',
                    moveOutDate: new Date(),
                },
            });
            if (updated.count === 0) {
                return null;
            }
            return prisma_1.prisma.tenant.findFirst({ where: { id: tenantId, pgId } });
        });
    }
    static deleteTenant(pgId, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.tenant.deleteMany({
                where: { id: tenantId, pgId },
            });
        });
    }
}
exports.TenantService = TenantService;
