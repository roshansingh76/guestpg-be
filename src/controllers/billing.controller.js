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
exports.generateBills = generateBills;
exports.getBills = getBills;
exports.getBillById = getBillById;
exports.getBillByIdUnified = getBillByIdUnified;
exports.addBillItem = addBillItem;
exports.updateBillItem = updateBillItem;
exports.recordPayment = recordPayment;
exports.getOverdueBills = getOverdueBills;
exports.getReceipt = getReceipt;
exports.getAllBills = getAllBills;
const billing_service_1 = require("../services/billing.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
function generateBills(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pgId = Number(req.params.pgId);
            const { month, year, dueDate, extraItems } = req.body;
            if (!month || !year || !dueDate) {
                return (0, response_1.sendBadRequest)(res, 'month, year, and dueDate are required');
            }
            if (extraItems !== undefined && !Array.isArray(extraItems)) {
                return (0, response_1.sendBadRequest)(res, 'extraItems must be an array');
            }
            const result = yield billing_service_1.BillingService.generateBills({
                pgId,
                month: Number(month),
                year: Number(year),
                dueDate: new Date(dueDate),
                extraItems,
            });
            if (!result.created.length) {
                if (result.reason === 'no_active_tenants') {
                    return (0, response_1.sendBadRequest)(res, 'No active tenants found for this PG', { requestedMonth: month, requestedYear: year });
                }
                if (result.reason === 'all_existing') {
                    return (0, response_1.sendBadRequest)(res, 'All active tenants already have bills for this month', { requestedMonth: month, requestedYear: year });
                }
                return (0, response_1.sendBadRequest)(res, 'No bills created because the requested month already exists or there are no active tenants', { requestedMonth: month, requestedYear: year });
            }
            return (0, response_1.sendCreated)(res, { created: result.created, skipped: result.skipped });
        }
        catch (error) {
            logger_1.logger.error('Generate bills failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Failed to generate bills');
        }
    });
}
function getBills(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pgId = Number(req.params.pgId);
            const { status, skip = 0, limit = 20 } = req.query;
            const page = Math.floor(Number(skip) / Number(limit)) + 1;
            const result = yield billing_service_1.BillingService.getBillsByPG(pgId, status, page, Number(limit));
            return (0, response_1.sendList)(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount });
        }
        catch (error) {
            logger_1.logger.error('Get bills failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch bills');
        }
    });
}
function getBillById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pgId = Number(req.params.pgId);
            const billId = Number(req.params.billId);
            const bill = yield billing_service_1.BillingService.getBillById(billId, pgId);
            if (!bill)
                return (0, response_1.sendNotFound)(res, 'Bill not found');
            return (0, response_1.sendSuccess)(res, bill);
        }
        catch (error) {
            logger_1.logger.error('Get bill by id failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch bill');
        }
    });
}
function getBillByIdUnified(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const billId = Number(req.params.billId);
            const bill = yield billing_service_1.BillingService.getBillById(billId);
            if (!bill)
                return (0, response_1.sendNotFound)(res, 'Bill not found');
            return (0, response_1.sendSuccess)(res, bill);
        }
        catch (error) {
            logger_1.logger.error('Get bill by id failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch bill');
        }
    });
}
function addBillItem(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const billId = Number(req.params.billId);
            const { label, amount } = req.body;
            if (!label || amount === undefined) {
                return (0, response_1.sendBadRequest)(res, 'label and amount are required');
            }
            const bill = yield billing_service_1.BillingService.addBillItem(billId, { label, amount: Number(amount) });
            if (!bill)
                return (0, response_1.sendNotFound)(res, 'Bill not found');
            return (0, response_1.sendCreated)(res, bill);
        }
        catch (error) {
            logger_1.logger.error('Add bill item failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Failed to add bill item');
        }
    });
}
function updateBillItem(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const billId = Number(req.params.billId);
            const itemId = Number(req.params.itemId);
            const { label, amount } = req.body;
            if (label === undefined && amount === undefined) {
                return (0, response_1.sendBadRequest)(res, 'label or amount is required');
            }
            const bill = yield billing_service_1.BillingService.updateBillItem(billId, itemId, {
                label,
                amount: amount !== undefined ? Number(amount) : undefined,
            });
            if (!bill)
                return (0, response_1.sendNotFound)(res, 'Bill or bill item not found');
            return (0, response_1.sendSuccess)(res, bill);
        }
        catch (error) {
            logger_1.logger.error('Update bill item failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Failed to update bill item');
        }
    });
}
function recordPayment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pgId = Number(req.params.pgId);
            const billId = Number(req.params.billId);
            const { amount, mode, referenceNo, note, paidAt } = req.body;
            if (amount === undefined || !mode) {
                return (0, response_1.sendBadRequest)(res, 'amount and mode are required');
            }
            const validModes = ['cash', 'upi', 'bank_transfer', 'cheque', 'other'];
            if (!validModes.includes(mode)) {
                return (0, response_1.sendBadRequest)(res, `Invalid mode. Must be one of: ${validModes.join(', ')}`);
            }
            const payment = yield billing_service_1.BillingService.recordPayment(pgId, billId, {
                amount: Number(amount),
                mode,
                referenceNo,
                note,
                paidAt: paidAt ? new Date(paidAt) : new Date(),
            });
            if (!payment)
                return (0, response_1.sendNotFound)(res, 'Bill not found');
            return (0, response_1.sendCreated)(res, payment);
        }
        catch (error) {
            logger_1.logger.error('Record payment failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Failed to record payment');
        }
    });
}
function getOverdueBills(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pgId = Number(req.params.pgId);
            const bills = yield billing_service_1.BillingService.getOverdueBills(pgId);
            const totalDue = bills.reduce((sum, bill) => sum + Number(bill.dueAmount || 0), 0);
            return (0, response_1.sendSuccess)(res, bills);
        }
        catch (error) {
            logger_1.logger.error('Get overdue bills failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch overdue bills');
        }
    });
}
function getReceipt(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pgId = Number(req.params.pgId);
            const billId = Number(req.params.billId);
            const receipt = yield billing_service_1.BillingService.getReceipt(pgId, billId);
            if (!receipt)
                return (0, response_1.sendNotFound)(res, 'Bill not found');
            return (0, response_1.sendSuccess)(res, receipt);
        }
        catch (error) {
            logger_1.logger.error('Get receipt failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch receipt');
        }
    });
}
function getAllBills(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { pgId, status, skip = 0, limit = 20 } = req.query;
            const page = Math.floor(Number(skip) / Number(limit)) + 1;
            const result = yield billing_service_1.BillingService.getAllBills(pgId ? Number(pgId) : undefined, status, page, Number(limit));
            return (0, response_1.sendList)(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount });
        }
        catch (error) {
            logger_1.logger.error('Get all bills failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch bills');
        }
    });
}
