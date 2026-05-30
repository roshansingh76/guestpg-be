"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const pg_routes_1 = __importDefault(require("./pg.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const city_routes_1 = __importDefault(require("./city.routes"));
const area_routes_1 = __importDefault(require("./area.routes"));
const role_routes_1 = __importDefault(require("./role.routes"));
const billing_controller_1 = require("../controllers/billing.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => res.json({ ok: true }));
router.use('/auth', auth_routes_1.default);
router.use('/pgs', pg_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/cities', city_routes_1.default);
router.use('/areas', area_routes_1.default);
router.use('/roles', role_routes_1.default);
// ============ Unified Bills Route ============
router.get('/bills', auth_1.authRequired, billing_controller_1.getAllBills);
router.get('/bills/:billId', auth_1.authRequired, billing_controller_1.getBillByIdUnified);
router.post('/bills/:billId/items', auth_1.authRequired, billing_controller_1.addBillItem);
router.put('/bills/:billId/items/:itemId', auth_1.authRequired, billing_controller_1.updateBillItem);
exports.default = router;
