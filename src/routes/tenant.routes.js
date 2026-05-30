"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const tenant_controller_1 = require("../controllers/tenant.controller");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/', auth_1.authRequired, tenant_controller_1.listTenants);
router.get('/:id', auth_1.authRequired, tenant_controller_1.getTenant);
router.post('/', auth_1.authRequired, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'idProof', maxCount: 1 }]), tenant_controller_1.createTenant);
router.put('/:id', auth_1.authRequired, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'idProof', maxCount: 1 }]), tenant_controller_1.updateTenant);
router.patch('/:id/checkout', auth_1.authRequired, tenant_controller_1.checkoutTenant);
router.delete('/:id', auth_1.authRequired, tenant_controller_1.deleteTenant);
exports.default = router;
