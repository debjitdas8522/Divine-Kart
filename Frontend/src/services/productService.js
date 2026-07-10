import api from './api';

// Get all products with optional filters
export const getProducts = async (params = {}) => {
    const { data } = await api.get('/api/products', { params });
    return data;
};

// Get products from specific store IDs (for hyperlocal home feed)
export const getProductsByStoreIds = async (storeIds = [], params = {}) => {
    if (storeIds.length === 0) return { products: [], pagination: {} };
    const { data } = await api.get('/api/products', {
        params: { storeIds: storeIds.join(','), ...params },
    });
    return data;
};


// Get product by ID
export const getProductById = async (productId) => {
    const { data } = await api.get(`/api/products/${productId}`);
    return data;
};

// Search products
export const searchProducts = async (query, params = {}) => {
    const { data } = await api.get('/api/products/search', {
        params: { q: query, ...params },
    });
    return data;
};

// Get products by category
export const getProductsByCategory = async (category, params = {}) => {
    const { data } = await api.get('/api/products', {
        params: { category, ...params },
    });
    return data;
};

// Create product (Admin only) — accepts FormData for file uploads
export const createProduct = async (formData) => {
    const { data } = await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

// Update product (Admin only) — accepts FormData for file uploads
export const updateProduct = async (productId, formData) => {
    const { data } = await api.put(`/api/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

// Delete product (Admin only)
export const deleteProduct = async (productId) => {
    const { data } = await api.delete(`/api/products/${productId}`);
    return data;
};
