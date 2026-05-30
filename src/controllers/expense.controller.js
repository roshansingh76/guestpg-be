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
exports.getExpenseSummary = exports.deleteExpense = exports.updateExpense = exports.getExpenseById = exports.getExpenses = exports.createExpense = void 0;
const expense_service_1 = require("../services/expense.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId } = req.params;
        const { category, amount, description, date } = req.body;
        if (!category || amount === undefined) {
            return (0, response_1.sendBadRequest)(res, 'category and amount are required');
        }
        const expense = yield expense_service_1.ExpenseService.createExpense({
            pgId: Number(pgId),
            category: category,
            amount: Number(amount),
            description,
            date: date ? new Date(date) : new Date(),
        });
        return (0, response_1.sendCreated)(res, expense);
    }
    catch (error) {
        logger_1.logger.error('Create expense failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error creating expense');
    }
});
exports.createExpense = createExpense;
const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId } = req.params;
        const { category, from, to, skip = 0, limit = 20 } = req.query;
        const page = Math.floor(Number(skip) / Number(limit)) + 1;
        const result = yield expense_service_1.ExpenseService.getExpensesByPG(Number(pgId), {
            startDate: from ? new Date(from) : undefined,
            endDate: to ? new Date(to) : undefined,
        }, page, Number(limit));
        return (0, response_1.sendList)(res, result.data, { skip: Number(skip), count: result.data.length, totalCount: result.pagination.totalCount });
    }
    catch (error) {
        logger_1.logger.error('Get expenses failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching expenses');
    }
});
exports.getExpenses = getExpenses;
const getExpenseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId, expenseId } = req.params;
        const expense = yield expense_service_1.ExpenseService.getExpenseById(Number(pgId), Number(expenseId));
        if (!expense)
            return (0, response_1.sendNotFound)(res, 'Expense not found');
        return (0, response_1.sendSuccess)(res, expense);
    }
    catch (error) {
        logger_1.logger.error('Get expense by id failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching expense');
    }
});
exports.getExpenseById = getExpenseById;
const updateExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId, expenseId } = req.params;
        const { category, amount, description, date } = req.body;
        const expense = yield expense_service_1.ExpenseService.updateExpense(Number(pgId), Number(expenseId), {
            category: category,
            amount: amount !== undefined ? Number(amount) : undefined,
            description,
            date: date ? new Date(date) : undefined,
        });
        if (!expense)
            return (0, response_1.sendNotFound)(res, 'Expense not found');
        return (0, response_1.sendSuccess)(res, expense);
    }
    catch (error) {
        logger_1.logger.error('Update expense failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error updating expense');
    }
});
exports.updateExpense = updateExpense;
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId, expenseId } = req.params;
        const deleted = yield expense_service_1.ExpenseService.deleteExpense(Number(pgId), Number(expenseId));
        if (deleted.count === 0)
            return (0, response_1.sendNotFound)(res, 'Expense not found');
        return (0, response_1.sendSuccess)(res, { success: true });
    }
    catch (error) {
        logger_1.logger.error('Delete expense failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error deleting expense');
    }
});
exports.deleteExpense = deleteExpense;
const getExpenseSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pgId } = req.params;
        const { from, to } = req.query;
        const summary = yield expense_service_1.ExpenseService.getExpenseSummary(Number(pgId), from ? new Date(from) : undefined, to ? new Date(to) : undefined);
        return (0, response_1.sendSuccess)(res, summary);
    }
    catch (error) {
        logger_1.logger.error('Get expense summary failed', { error });
        return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Error fetching expense summary');
    }
});
exports.getExpenseSummary = getExpenseSummary;
