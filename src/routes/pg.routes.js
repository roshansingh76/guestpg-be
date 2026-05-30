"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pg_controller_1 = require("../controllers/pg.controller");
const pgRoom_controller_1 = require("../controllers/pgRoom.controller");
const auth_1 = require("../middleware/auth");
const pgPhoto_controller_1 = require("../controllers/pgPhoto.controller");
const expense_routes_1 = __importDefault(require("./expense.routes"));
const tenant_routes_1 = __importDefault(require("./tenant.routes"));
const billing_routes_1 = __importDefault(require("./billing.routes"));
const router = (0, express_1.Router)();
// ============ PG Routes ============
router.post('/', auth_1.authRequired, pg_controller_1.createPG);
router.get('/', auth_1.authRequired, pg_controller_1.getAllPGs);
router.get('/:id', auth_1.authRequired, pg_controller_1.getPGById);
router.put('/:id', auth_1.authRequired, pg_controller_1.updatePG);
router.delete('/:id', auth_1.authRequired, pg_controller_1.deletePG);
router.patch('/:id/status', auth_1.authRequired, pg_controller_1.changePGStatus);
// ============ PG Room Routes ============
router.post('/:pgId/rooms', auth_1.authRequired, pgRoom_controller_1.createRoom);
router.get('/:pgId/rooms', auth_1.authRequired, pgRoom_controller_1.getRoomsByPG);
router.get('/:pgId/rooms/:roomId', auth_1.authRequired, pgRoom_controller_1.getRoomById);
router.put('/:pgId/rooms/:roomId', auth_1.authRequired, pgRoom_controller_1.updateRoom);
router.delete('/:pgId/rooms/:roomId', auth_1.authRequired, pgRoom_controller_1.deleteRoom);
// ============ PG Photo Routes ============
router.post('/:pgId/photos', auth_1.authRequired, pgPhoto_controller_1.addPGPhoto);
router.get('/:pgId/photos', auth_1.authRequired, pgPhoto_controller_1.getPGPhotos);
router.delete('/:pgId/photos/:photoId', auth_1.authRequired, pgPhoto_controller_1.deletePGPhoto);
// ============ Expense Routes ============
router.use('/:pgId/expenses', expense_routes_1.default);
// ============ Tenant Routes ============
router.use('/:pgId/tenants', tenant_routes_1.default);
// ============ Billing Routes ============
router.use('/:pgId/bills', billing_routes_1.default);
exports.default = router;
