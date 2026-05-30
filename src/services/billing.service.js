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
exports.BillingService = void 0;
const prisma_1 = require("../db/prisma");
const client_1 = require("@prisma/client");
class BillingService {
    static normalizeBillCategory(label) {
        if (label === undefined || label === null)
            return undefined;
        const normalized = String(label).trim();
        return Object.values(client_1.BillCategory).find((category) => category.toLowerCase() === normalized.toLowerCase());
    }
    static generateBills(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const tenants = yield prisma_1.prisma.tenant.findMany({
                where: {
                    pgId: data.pgId,
                    status: 'active',
                },
                include: {
                    room: { select: { pricePerBed: true } },
                },
            });
            if (tenants.length === 0) {
                return { created: [], skipped: [], reason: 'no_active_tenants' };
            }
            const requestedItems = ((_a = data.extraItems) !== null && _a !== void 0 ? _a : []).map((item) => {
                const label = BillingService.normalizeBillCategory(item.label);
                if (!label) {
                    throw new Error(`Invalid bill category: ${item.label}`);
                }
                return { tenantId: item.tenantId, label, amount: item.amount };
            });
            if (requestedItems.length === 0) {
                const defaultItems = tenants
                    .filter((tenant) => { var _a; return ((_a = tenant.room) === null || _a === void 0 ? void 0 : _a.pricePerBed) && tenant.room.pricePerBed > 0; })
                    .map((tenant) => ({
                    tenantId: tenant.id,
                    label: client_1.BillCategory.Rent,
                    amount: tenant.room.pricePerBed,
                }));
                if (defaultItems.length === 0) {
                    return { created: [], skipped: [], reason: 'no_bill_items' };
                }
                requestedItems.push(...defaultItems);
            }
            const activeTenantIds = new Set(tenants.map((tenant) => tenant.id));
            const tenantIds = [...new Set(requestedItems.map((item) => item.tenantId))];
            const invalidTenantId = tenantIds.find((tenantId) => !activeTenantIds.has(tenantId));
            if (invalidTenantId !== undefined) {
                throw new Error(`Invalid or inactive tenant selected: ${invalidTenantId}`);
            }
            const created = [];
            const skipped = [];
            for (const tenantId of tenantIds) {
                const tenant = tenants.find((tenant) => tenant.id === tenantId);
                if (!tenant)
                    continue;
                const existing = yield prisma_1.prisma.bill.findUnique({
                    where: {
                        tenantId_billMonth_billYear: {
                            tenantId,
                            billMonth: data.month,
                            billYear: data.year,
                        },
                    },
                });
                if (existing) {
                    skipped.push({ tenantId, name: tenant.name });
                    continue;
                }
                const extras = requestedItems.filter((item) => item.tenantId === tenantId);
                const totalAmount = extras.reduce((sum, item) => sum + item.amount, 0);
                const bill = yield prisma_1.prisma.bill.create({
                    data: {
                        pgId: data.pgId,
                        tenantId,
                        billMonth: data.month,
                        billYear: data.year,
                        totalAmount,
                        paidAmount: 0,
                        dueAmount: totalAmount,
                        dueDate: data.dueDate,
                        status: 'pending',
                        items: {
                            create: extras.map((item) => ({ label: item.label, amount: item.amount })),
                        },
                    },
                    include: { items: true },
                });
                created.push(bill);
            }
            const reason = created.length === 0 && skipped.length === tenants.length ? 'all_existing' : undefined;
            return { created, skipped, reason };
        });
    }
    static getBillsByPG(pgId_1, status_1) {
        return __awaiter(this, arguments, void 0, function* (pgId, status, page = 1, limit = 10) {
            const where = { pgId };
            if (status)
                where.status = status;
            const skip = (page - 1) * limit;
            const [data, total] = yield Promise.all([
                prisma_1.prisma.bill.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [{ billYear: 'desc' }, { billMonth: 'desc' }],
                    include: {
                        tenant: { select: { id: true, name: true, phone: true } },
                        items: true,
                        payments: true,
                    },
                }),
                prisma_1.prisma.bill.count({ where }),
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
    static getAllBills(pgId_1, status_1) {
        return __awaiter(this, arguments, void 0, function* (pgId, status, page = 1, limit = 10) {
            const where = {};
            if (pgId)
                where.pgId = pgId;
            if (status)
                where.status = status;
            const skip = (page - 1) * limit;
            const [data, total] = yield Promise.all([
                prisma_1.prisma.bill.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [{ billYear: 'desc' }, { billMonth: 'desc' }],
                    include: {
                        tenant: { select: { id: true, name: true, phone: true } },
                        items: true,
                        payments: true,
                        pg: { select: { id: true, pgName: true } },
                    },
                }),
                prisma_1.prisma.bill.count({ where }),
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
    static getBillById(billId, pgId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { id: billId };
            if (pgId !== undefined)
                where.pgId = pgId;
            return prisma_1.prisma.bill.findFirst({
                where,
                include: {
                    tenant: { select: { id: true, name: true, phone: true, aadhar: true } },
                    items: true,
                    payments: true,
                    pg: { select: { id: true, pgName: true } },
                },
            });
        });
    }
    static addBillItem(billId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const label = BillingService.normalizeBillCategory(data.label);
            if (!label) {
                throw new Error(`Invalid bill category: ${data.label}`);
            }
            return prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const bill = yield tx.bill.findUnique({ where: { id: billId } });
                if (!bill)
                    return null;
                yield tx.billItem.create({
                    data: {
                        billId,
                        label,
                        amount: data.amount,
                    },
                });
                const totalAmount = bill.totalAmount + data.amount;
                const dueAmount = Math.max(totalAmount - bill.paidAmount, 0);
                const status = dueAmount <= 0 ? 'paid' : bill.paidAmount > 0 ? 'partial' : 'pending';
                return tx.bill.update({
                    where: { id: billId },
                    data: {
                        totalAmount,
                        dueAmount,
                        status,
                    },
                    include: {
                        tenant: { select: { id: true, name: true, phone: true, aadhar: true } },
                        items: true,
                        payments: true,
                        pg: { select: { id: true, pgName: true } },
                    },
                });
            }));
        });
    }
    static updateBillItem(billId, itemId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const label = data.label !== undefined ? BillingService.normalizeBillCategory(data.label) : undefined;
            if (data.label !== undefined && !label) {
                throw new Error(`Invalid bill category: ${data.label}`);
            }
            return prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const item = yield tx.billItem.findFirst({ where: { id: itemId, billId } });
                if (!item)
                    return null;
                const bill = yield tx.bill.findUnique({ where: { id: billId } });
                if (!bill)
                    return null;
                const updatedAmount = (_a = data.amount) !== null && _a !== void 0 ? _a : item.amount;
                yield tx.billItem.update({
                    where: { id: itemId },
                    data: {
                        label: label !== null && label !== void 0 ? label : item.label,
                        amount: updatedAmount,
                    },
                });
                const totalAmount = bill.totalAmount + (updatedAmount - item.amount);
                const dueAmount = Math.max(totalAmount - bill.paidAmount, 0);
                const status = dueAmount <= 0 ? 'paid' : bill.paidAmount > 0 ? 'partial' : 'pending';
                return tx.bill.update({
                    where: { id: billId },
                    data: {
                        totalAmount,
                        dueAmount,
                        status,
                    },
                    include: {
                        tenant: { select: { id: true, name: true, phone: true, aadhar: true } },
                        items: true,
                        payments: true,
                        pg: { select: { id: true, pgName: true } },
                    },
                });
            }));
        });
    }
    static recordPayment(pgId, billId, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const existingBill = yield tx.bill.findFirst({ where: { id: billId, pgId } });
                if (!existingBill) {
                    return null;
                }
                const newPaidAmount = existingBill.paidAmount + payment.amount;
                const newDueAmount = Math.max(existingBill.totalAmount - newPaidAmount, 0);
                const newStatus = newDueAmount <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending';
                yield tx.payment.create({
                    data: {
                        billId,
                        pgId,
                        tenantId: existingBill.tenantId,
                        amount: payment.amount,
                        mode: payment.mode,
                        referenceNo: payment.referenceNo,
                        note: payment.note,
                        paidAt: payment.paidAt,
                    },
                });
                return tx.bill.update({
                    where: { id: billId },
                    data: {
                        paidAmount: newPaidAmount,
                        dueAmount: newDueAmount,
                        status: newStatus,
                    },
                });
            }));
        });
    }
    static getOverdueBills(pgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.bill.findMany({
                where: {
                    pgId,
                    status: 'overdue',
                },
                include: {
                    tenant: { select: { id: true, name: true, phone: true } },
                    items: true,
                },
                orderBy: { dueDate: 'asc' },
            });
        });
    }
    static getReceipt(pgId, billId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.bill.findFirst({
                where: { id: billId, pgId },
                include: {
                    pg: {
                        select: {
                            pgName: true,
                            ownerName: true,
                            ownerPhone: true,
                            addressLine1: true,
                            city: true,
                        },
                    },
                    tenant: { select: { id: true, name: true, phone: true } },
                    items: true,
                    payments: { orderBy: { paidAt: 'asc' } },
                },
            });
        });
    }
}
exports.BillingService = BillingService;
