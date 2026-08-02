import { Router } from 'express'
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  changeRoleStatus,
  getPermissions,
  getRoleStats,
  seedSystemRoles,
} from '../controllers/role.controller'
import { authRequired, requireRole } from '../middleware/auth'

const router = Router()

// All role routes require authentication
router.use(authRequired)

// ── Read routes: Staff + Super Admin (roles:read) ───────────────────────────

// GET  /api/roles/permissions  — list all available permissions
router.get('/permissions', requireRole('staff', 'super_admin'), getPermissions)

// GET  /api/roles/stats         — role statistics
router.get('/stats', requireRole('staff', 'super_admin'), getRoleStats)

// GET  /api/roles               — list all roles (with pagination + filters)
router.get('/', requireRole('staff', 'super_admin'), getAllRoles)

// GET  /api/roles/:id           — get a single role
router.get('/:id', requireRole('staff', 'super_admin'), getRoleById)

// ── Write routes: Super Admin only (roles:write) ────────────────────────────

// POST /api/roles/seed          — seed default system roles
router.post('/seed', requireRole('super_admin'), seedSystemRoles)

// POST /api/roles               — create a new custom role
router.post('/', requireRole('super_admin'), createRole)

// PUT  /api/roles/:id           — update a role
router.put('/:id', requireRole('super_admin'), updateRole)

// PATCH /api/roles/:id/status   — toggle active/inactive
router.patch('/:id/status', requireRole('super_admin'), changeRoleStatus)

// DELETE /api/roles/:id         — delete a custom role (system roles blocked)
router.delete('/:id', requireRole('super_admin'), deleteRole)

export default router
