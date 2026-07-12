import api from './api.js';

export const adminGetUsers = (params = {}) =>
    api.get('/api/admin/users', { params }).then((r) => r.data);

export const adminSuspendUser = (id) =>
    api.put(`/api/admin/users/${id}/suspend`).then((r) => r.data);

export const adminActivateUser = (id) =>
    api.put(`/api/admin/users/${id}/activate`).then((r) => r.data);
