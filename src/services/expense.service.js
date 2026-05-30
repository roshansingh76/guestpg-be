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
exports.ExpenseService = void 0;
const prisma_1 = require("../db/prisma");
class ExpenseService {
    static createExpense(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.expense.create({
                data,
            });
        });
    }
    static getExpensesByPG(pgId_1, filters_1) {
        return __awaiter(this, arguments, void 0, function* (pgId, filters, page = 1, limit = 10) {
            const where = { pgId };
            if (filters === null || filters === void 0 ? void 0 : filters.startDate) {
                where.date = { gte: filters.startDate };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.endDate) {
                where.date = where.date || {};
                where.date.lte = filters.endDate;
            }
            const skip = (page - 1) * limit;
            const [data, total] = yield Promise.all([
                prisma_1.prisma.expense.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { date: 'desc' },
                }),
                prisma_1.prisma.expense.count({ where }),
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
    static getExpenseById(pgId, expenseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.expense.findFirst({
                where: { id: expenseId, pgId },
            });
        });
    }
    static updateExpense(pgId, expenseId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = {};
            if (data.category)
                updateData.category = data.category;
            if (data.amount !== undefined)
                updateData.amount = data.amount;
            if (data.description)
                updateData.description = data.description;
            if (data.date)
                updateData.date = data.date;
            const updatedExpense = yield prisma_1.prisma.expense.updateMany({
                where: { id: expenseId, pgId },
                data: updateData,
            });
            return updatedExpense.count === 0 ? null : prisma_1.prisma.expense.findUnique({ where: { id: expenseId } });
        });
    }
    static deleteExpense(pgId, expenseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.expense.deleteMany({
                where: { id: expenseId, pgId },
            });
        });
    }
    static getExpenseSummary(pgId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { pgId };
            if (startDate) {
                where.date = { gte: startDate };
            }
            if (endDate) {
                where.date = where.date || {};
                where.date.lte = endDate;
            }
            const totalExpenses = yield prisma_1.prisma.expense.aggregate({
                _sum: { amount: true },
                where,
            });
            return {
                totalExpenses: totalExpenses._sum.amount || 0,
            };
        });
    }
}
exports.ExpenseService = ExpenseService;
