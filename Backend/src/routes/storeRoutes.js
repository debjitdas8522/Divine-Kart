import express from 'express';
import {
    // Auth
    sendVendorLoginOtp,
    verifyVendorLoginOtp,
    // Registration
    registerStore,
    // Profile (Vendor)
    getMyStore,
    updateMyStore,
    updateStoreLogo,
    // Discovery (Public)
    getNearbyStores,
    getStoreDetails,
    getStoreProducts,
    // Orders (Vendor)
    getStoreOrders
} from '../controllers/storeController.js';

import {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from '../controllers/storeNotificationController.js';

import authMiddleware from '../middleware/auth.js';
import { isVendorRole, checkStoreOwner } from '../middleware/storeOwner.js';
import upload from '../middleware/multer.js';

const storeRouter = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Store Registration
// ─────────────────────────────────────────────────────────────────────────────
storeRouter.post('/register', registerStore);

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR AUTH — OTP Login
// ─────────────────────────────────────────────────────────────────────────────
storeRouter.post('/login/send-otp', sendVendorLoginOtp);
storeRouter.post('/login/verify-otp', verifyVendorLoginOtp);

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Store Discovery
// Must be before /:id to avoid route collision
// ─────────────────────────────────────────────────────────────────────────────
storeRouter.get('/nearby', getNearbyStores);

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR — My Store Profile (auth required, vendor role)
// ─────────────────────────────────────────────────────────────────────────────
storeRouter.get('/me', authMiddleware, isVendorRole, getMyStore);
storeRouter.put('/me', authMiddleware, isVendorRole, updateMyStore);
storeRouter.put('/me/logo', authMiddleware, isVendorRole, upload.single('logo'), updateStoreLogo);

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR — Notifications
// ─────────────────────────────────────────────────────────────────────────────
storeRouter.get('/me/notifications', authMiddleware, isVendorRole, getMyNotifications);
storeRouter.put('/me/notifications/read-all', authMiddleware, isVendorRole, markAllNotificationsRead);
storeRouter.put('/me/notifications/:id/read', authMiddleware, isVendorRole, markNotificationRead);

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Individual Store
// ─────────────────────────────────────────────────────────────────────────────
storeRouter.get('/:id', getStoreDetails);
storeRouter.get('/:id/products', getStoreProducts);

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR — Store Orders (ownership verified)
// ─────────────────────────────────────────────────────────────────────────────
storeRouter.get('/:storeId/orders', authMiddleware, isVendorRole, checkStoreOwner, getStoreOrders);

export default storeRouter;
