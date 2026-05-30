"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const city_controller_1 = require("../controllers/city.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/with-areas', city_controller_1.getCitiesWithAreas);
// Protected routes (admin only)
router.post('/', auth_1.authRequired, city_controller_1.createCity);
router.get('/', auth_1.authRequired, city_controller_1.getAllCities);
router.get('/:id', auth_1.authRequired, city_controller_1.getCityById);
router.put('/:id', auth_1.authRequired, city_controller_1.updateCity);
router.delete('/:id', auth_1.authRequired, city_controller_1.deleteCity);
exports.default = router;
