import express from 'express';
import authMiddleware from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import { verifyRazorpayPayment, createOrder, deleteOrder, getOrderById, getOrders, updateOrder } from '../controllers/orderController.js';
import { validateCreateOrder } from '../middleware/validation.js';

const orderRouter = express.Router();

// ── Customer: place an order ──────────────────────────────────────────────────
orderRouter.post('/', authMiddleware, validateCreateOrder, createOrder);
orderRouter.post('/verify', authMiddleware, verifyRazorpayPayment);

// ── Customer: read their own orders ──────────────────────────────────────────
orderRouter.get('/', authMiddleware, getOrders);
orderRouter.get('/:id', authMiddleware, getOrderById);

// ── Admin only: update / delete orders ───────────────────────────────────────
// Vendors use PUT /api/stores/:storeId/orders/:orderId instead
orderRouter.put('/:id', authMiddleware, isAdmin, updateOrder);
orderRouter.delete('/:id', authMiddleware, isAdmin, deleteOrder);

export default orderRouter;