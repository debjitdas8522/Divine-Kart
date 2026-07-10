/**
 * storeService.js — Vendor & Store API calls.
 *
 * All authenticated vendor endpoints use `vendorApi` (dedicated instance,
 * no cookies, always sends vendor-token from localStorage).
 *
 * Public discovery endpoints use the shared `api` instance (no auth needed).
 */

import api from './api.js';
import vendorApi from './vendorApi.js';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const registerStore = (data) =>
    api.post('/api/stores/register', data).then((r) => r.data);

export const sendVendorOtp = (email) =>
    api.post('/api/stores/login/send-otp', { email }).then((r) => r.data);

export const verifyVendorOtp = (email, otp) =>
    api.post('/api/stores/login/verify-otp', { email, otp }).then((r) => r.data);

// ── Store Profile (vendor-authenticated) ─────────────────────────────────────

export const getMyStore = () =>
    vendorApi.get('/api/stores/me').then((r) => r.data);

export const updateMyStore = (data) =>
    vendorApi.put('/api/stores/me', data).then((r) => r.data);

export const toggleMyStoreStatus = () =>
    vendorApi.patch('/api/stores/me/status').then((r) => r.data);

export const uploadStoreLogo = (file) => {
    const form = new FormData();
    form.append('logo', file);
    return vendorApi.put('/api/stores/me/logo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
};

// ── Notifications (vendor-authenticated) ─────────────────────────────────────

export const getMyNotifications = (params = {}) =>
    vendorApi.get('/api/stores/me/notifications', { params }).then((r) => r.data);

export const markNotificationRead = (id) =>
    vendorApi.put(`/api/stores/me/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
    vendorApi.put('/api/stores/me/notifications/read-all').then((r) => r.data);

// ── Orders (vendor-authenticated) ────────────────────────────────────────────

export const getMyStoreOrders = (storeId, params = {}) =>
    vendorApi.get(`/api/stores/${storeId}/orders`, { params }).then((r) => r.data);

export const getMyStoreOrderById = (storeId, orderId) =>
    vendorApi.get(`/api/stores/${storeId}/orders/${orderId}`).then((r) => r.data);

export const updateMyStoreOrderStatus = (storeId, orderId, status, note = '') =>
    vendorApi.put(`/api/stores/${storeId}/orders/${orderId}`, { status, note }).then((r) => r.data);


// ── Vendor Products (vendor-authenticated) ────────────────────────────────────

export const getMyProducts = (params = {}) =>
    vendorApi.get('/api/stores/me/products', { params }).then((r) => r.data);

export const getMyProductById = (productId) =>
    vendorApi.get(`/api/stores/me/products/${productId}`).then((r) => r.data);

export const createMyProduct = (formData) =>
    vendorApi.post('/api/stores/me/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);

export const updateMyProduct = (productId, formData) =>
    vendorApi.put(`/api/stores/me/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);

export const deleteMyProduct = (productId) =>
    vendorApi.delete(`/api/stores/me/products/${productId}`).then((r) => r.data);

// ── Public Discovery (no auth) ────────────────────────────────────────────────

/**
 * Find nearby stores by GPS coordinates (preferred), pincode, city, or district (fallbacks).
 * Backend tries strategies in order: geo → pincode → city/district.
 */
export const getNearbyStores = (lat, lng, radius = 10, pincode, city, district) => {
    const params = {};
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
        params.lat = lat;
        params.lng = lng;
        params.radius = radius;
    }
    if (pincode) params.pincode = pincode;
    // Send both city and district — backend uses city first, then district as a second word-match pass
    if (city) params.city = city;
    if (district && district !== city) params.district = district;
    return api.get('/api/stores/nearby', { params }).then((r) => r.data);
};
