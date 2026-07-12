import express from 'express';
import {
    adminGetAllUsers,
    adminSuspendUser,
    adminActivateUser,
} from '../controllers/adminUserController.js';

import authMiddleware from '../middleware/auth.js';
import adminAuthMiddleware from '../middleware/adminAuth.js';

const adminUserRouter = express.Router();

// All routes here require: valid JWT + admin role
// The chain: authMiddleware → adminAuthMiddleware → controller

/**
 * GET /api/admin/users
 * List all users. Supports ?search= &role=user|admin|vendor &status=Active|Suspended &page= &limit=
 */
adminUserRouter.get('/', authMiddleware, adminAuthMiddleware, adminGetAllUsers);

/**
 * PUT /api/admin/users/:id/suspend
 * Suspend a user account.
 */
adminUserRouter.put('/:id/suspend', authMiddleware, adminAuthMiddleware, adminSuspendUser);

/**
 * PUT /api/admin/users/:id/activate
 * Reactivate a suspended user account.
 */
adminUserRouter.put('/:id/activate', authMiddleware, adminAuthMiddleware, adminActivateUser);

export default adminUserRouter;
