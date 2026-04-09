import api from './api';

// Create new order
export const createOrder = async (orderData) => {
    const { data } = await api.post('/api/orders', orderData);
    return data;
};

// Get user's orders
export const getOrders = async (params = {}) => {
    const { data } = await api.get('/api/orders', { params });
    return data;
};

// Get order details by ID
export const getOrderById = async (orderId) => {
    const { data } = await api.get(`/api/orders/${orderId}`);
    return data;
};

// Update order status (Admin only)
export const updateOrderStatus = async (orderId, status) => {
    const { data } = await api.put(`/api/orders/${orderId}`, { status });
    return data;
};

// Verify Razorpay payment
export const verifyPayment = async (paymentData) => {
    const { data } = await api.post('/api/orders/verify', paymentData);
    return data;
};
