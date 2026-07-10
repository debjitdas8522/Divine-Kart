import api from './api.js';

export const adminGetStores = (params = {}) =>
    api.get('/api/admin/stores', { params }).then((r) => r.data);

export const adminGetStoreById = (id) =>
    api.get(`/api/admin/stores/${id}`).then((r) => r.data);

export const adminApproveStore = (id, action, reason = '') =>
    api.put(`/api/admin/stores/${id}/approve`, { action, reason }).then((r) => r.data);

export const adminSuspendStore = (id) =>
    api.put(`/api/admin/stores/${id}/suspend`).then((r) => r.data);

export const adminDeleteStore = (id) =>
    api.delete(`/api/admin/stores/${id}`).then((r) => r.data);

export const adminGetStoreOrders = (id, params = {}) =>
    api.get(`/api/admin/stores/${id}/orders`, { params }).then((r) => r.data);
