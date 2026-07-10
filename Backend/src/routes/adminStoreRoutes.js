import express from 'express';
import {
    adminGetAllStores,
    adminApproveStore,
    adminSuspendStore,
    adminDeleteStore,
    adminGetStoreOrders
} from '../controllers/storeController.js';

import authMiddleware from '../middleware/auth.js';
import adminAuthMiddleware from '../middleware/adminAuth.js';

const adminStoreRouter = express.Router();

// All routes here require: valid JWT + admin role
// The chain: authMiddleware → adminAuthMiddleware → controller

/**
 * GET /api/admin/stores
 * List all stores. Supports ?status=active|pending|suspended &city= &pincode= &page= &limit=
 */
adminStoreRouter.get('/', authMiddleware, adminAuthMiddleware, adminGetAllStores);

/**
 * PUT /api/admin/stores/:id/approve
 * Approve or reject a store.  Body: { action: 'approve' | 'reject', reason?: string }
 */
adminStoreRouter.put('/:id/approve', authMiddleware, adminAuthMiddleware, adminApproveStore);

/**
 * PUT /api/admin/stores/:id/suspend
 * Toggle suspension status (isActive flip).
 */
adminStoreRouter.put('/:id/suspend', authMiddleware, adminAuthMiddleware, adminSuspendStore);

/**
 * DELETE /api/admin/stores/:id
 * Permanently remove a store.
 */
adminStoreRouter.delete('/:id', authMiddleware, adminAuthMiddleware, adminDeleteStore);

/**
 * GET /api/admin/stores/:id/orders
 * Orders routed to a specific store.
 */
adminStoreRouter.get('/:id/orders', authMiddleware, adminAuthMiddleware, adminGetStoreOrders);

export default adminStoreRouter;
