"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_controller_1 = require("../controllers/role.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All role routes require authentication
router.use(auth_1.authRequired);
// ── Admin + Super Admin routes ─────────────────────────────────────────────
// GET  /api/roles/permissions  — list all available permissions
router.get('/permissions', (0, auth_1.requireRole)('admin', 'super_admin'), role_controller_1.getPermissions);
// GET  /api/roles/stats         — role statistics
router.get('/stats', (0, auth_1.requireRole)('admin', 'super_admin'), role_controller_1.getRoleStats);
// POST /api/roles/seed          — seed default system roles (super_admin only)
router.post('/seed', (0, auth_1.requireRole)('super_admin'), role_controller_1.seedSystemRoles);
// GET  /api/roles               — list all roles (with pagination + filters)
router.get('/', (0, auth_1.requireRole)('admin', 'super_admin'), role_controller_1.getAllRoles);
// POST /api/roles               — create a new custom role
router.post('/', (0, auth_1.requireRole)('admin', 'super_admin'), role_controller_1.createRole);
// GET  /api/roles/:id           — get a single role
router.get('/:id', (0, auth_1.requireRole)('admin', 'super_admin'), role_controller_1.getRoleById);
// PUT  /api/roles/:id           — update a role
router.put('/:id', (0, auth_1.requireRole)('admin', 'super_admin'), role_controller_1.updateRole);
// PATCH /api/roles/:id/status   — toggle active/inactive
router.patch('/:id/status', (0, auth_1.requireRole)('admin', 'super_admin'), role_controller_1.changeRoleStatus);
// DELETE /api/roles/:id         — delete a custom role (system roles blocked)
router.delete('/:id', (0, auth_1.requireRole)('super_admin'), role_controller_1.deleteRole);
exports.default = router;
