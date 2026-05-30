"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const area_controller_1 = require("../controllers/area.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public route
router.get('/city/:cityId', area_controller_1.getAreasByCity);
// Protected routes (admin only)
router.post('/', auth_1.authRequired, area_controller_1.createArea);
router.get('/', auth_1.authRequired, area_controller_1.getAllAreas);
router.get('/:id', auth_1.authRequired, area_controller_1.getAreaById);
router.put('/:id', auth_1.authRequired, area_controller_1.updateArea);
router.delete('/:id', auth_1.authRequired, area_controller_1.deleteArea);
exports.default = router;
