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

// ── Admin + Super Admin routes ─────────────────────────────────────────────

// GET  /api/roles/permissions  — list all available permissions
router.get('/permissions', requireRole('admin', 'super_admin'), getPermissions)

// GET  /api/roles/stats         — role statistics
router.get('/stats', requireRole('admin', 'super_admin'), getRoleStats)

// POST /api/roles/seed          — seed default system roles (super_admin only)
router.post('/seed', requireRole('super_admin'), seedSystemRoles)

// GET  /api/roles               — list all roles (with pagination + filters)
router.get('/', requireRole('admin', 'super_admin'), getAllRoles)

// POST /api/roles               — create a new custom role
router.post('/', requireRole('admin', 'super_admin'), createRole)

// GET  /api/roles/:id           — get a single role
router.get('/:id', requireRole('admin', 'super_admin'), getRoleById)

// PUT  /api/roles/:id           — update a role
router.put('/:id', requireRole('admin', 'super_admin'), updateRole)

// PATCH /api/roles/:id/status   — toggle active/inactive
router.patch('/:id/status', requireRole('admin', 'super_admin'), changeRoleStatus)

// DELETE /api/roles/:id         — delete a custom role (system roles blocked)
router.delete('/:id', requireRole('super_admin'), deleteRole)

export default router
