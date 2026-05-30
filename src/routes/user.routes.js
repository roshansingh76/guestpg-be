"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// Create user
router.post('/', user_controller_1.createUser);
// Get all users (with filters and pagination)
router.get('/', user_controller_1.getAllUsers);
// Get available PGs for assignment
router.get('/pgs/available', user_controller_1.getAvailablePGs);
// Get users by PG
router.get('/pg/:pgId', user_controller_1.getUsersByPG);
// Get user by ID
router.get('/:id', user_controller_1.getUserById);
// Update user
router.put('/:id', user_controller_1.updateUser);
// Delete user
router.delete('/:id', user_controller_1.deleteUser);
// Change user status
router.patch('/:id/status', user_controller_1.changeUserStatus);
exports.default = router;
