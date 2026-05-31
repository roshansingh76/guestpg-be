"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        return step((generator || (generator = Promise.resolve(value))).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("./prismaClient");
const expenseCategories = [
    {
        name: 'Rent',
        description: 'Monthly rent payment for PG',
    },
    {
        name: 'Salary',
        description: 'Staff salary expenses',
    },
    {
        name: 'Electricity',
        description: 'Electricity bill',
    },
    {
        name: 'Water',
        description: 'Water bill',
    },
    {
        name: 'Internet',
        description: 'Internet service bill',
    },
    {
        name: 'Maintenance',
        description: 'Building and facility maintenance',
    },
    {
        name: 'Food',
        description: 'Food and meal expenses',
    },
    {
        name: 'Milk',
        description: 'Daily milk supply',
    },
    {
        name: 'Ration',
        description: 'Groceries and ration supplies',
    },
    {
        name: 'Other',
        description: 'Other miscellaneous expenses',
    },
];
function seedExpenseCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding expense categories...');
        for (const category of expenseCategories) {
            const existing = yield prismaClient_1.prisma.expenseCategory.findUnique({
                where: { name: category.name },
            });
            if (!existing) {
                yield prismaClient_1.prisma.expenseCategory.create({
                    data: category,
                });
                console.log(`✓ Created expense category: ${category.name}`);
            }
            else {
                console.log(`✓ Expense category already exists: ${category.name}`);
            }
        }
    });
}
exports.default = seedExpenseCategories;
