/**
 * vendorApi — Dedicated Axios instance for the Vendor Portal.
 *
 * Why a separate instance?
 * - The shared `api` instance sends httpOnly cookies automatically (withCredentials: true).
 *   When a regular user is also logged in, their session cookie would contaminate vendor
 *   requests, causing the backend to authenticate the wrong user.
 * - Vendor auth is 100% localStorage-based (no cookies), so we MUST NOT send cookies.
 * - Using a dedicated instance avoids all header-merge races with the shared interceptor.
 */

import axios from 'axios';

const vendorApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false, // Never send browser cookies — vendor auth is localStorage only
});

// ── Request interceptor: always attach vendor token ──────────────────────────
vendorApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('vendor-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: handle vendor session expiry ───────────────────────
vendorApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            error.response?.data?.vendorTokenExpired
        ) {
            localStorage.removeItem('vendor-token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default vendorApi;
