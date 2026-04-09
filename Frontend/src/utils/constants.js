// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// App Info
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Blinkit';

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_OTP: '/verify-otp',
    RESET_PASSWORD: '/reset-password',
    PROFILE: '/profile',
    CART: '/cart',
    CHECKOUT: '/checkout',
    ORDERS: '/orders',
    ORDER_DETAIL: '/orders/:id',
    PRODUCT_DETAIL: '/product/:id',
    CATEGORY: '/category/:category',
    SEARCH: '/search',
    // Admin routes
    ADMIN: '/admin',
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_PRODUCT_NEW: '/admin/products/new',
    ADMIN_PRODUCT_EDIT: '/admin/products/edit/:id',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_ORDER_DETAIL: '/admin/orders/:id',
    ADMIN_USERS: '/admin/users',
};

// Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    CART: 'cart',
};

// Order Status
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};

// Payment Methods
export const PAYMENT_METHODS = [
    { id: 'cod', name: 'Cash on Delivery', description: 'Pay when your order arrives', icon: '💵' },
    { id: 'online', name: 'Online Payment', description: 'UPI, Card, Net Banking', icon: '💳' },
];

// Categories
export const CATEGORIES = [
    { id: 'agarbatti', name: 'Agarbatti & Dhoop', icon: '🕯️' },
    { id: 'murti', name: 'Idols & Murti', icon: '🕉️' },
    { id: 'diya', name: 'Diya & Oil', icon: '🪔' },
    { id: 'samagri', name: 'Pujan Samagri', icon: '🥣' },
    { id: 'flowers', name: 'Flowers & Garlands', icon: '🌸' },
    { id: 'books', name: 'Spiritual Books', icon: '📖' },
    { id: 'vessels', name: 'Puja Vessels', icon: '🏺' },
    { id: 'decor', name: 'Temple Decor', icon: '🏮' },
];

// Delivery Fee
export const DELIVERY_CONFIG = {
    FREE_DELIVERY_THRESHOLD: 500,
    DELIVERY_FEE: 49,
};
