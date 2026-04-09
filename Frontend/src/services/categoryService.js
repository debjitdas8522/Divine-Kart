import api from './api';

// Get all active categories
export const getCategories = async () => {
    const { data } = await api.get('/api/category/get');
    return data;
};

// Seed categories (Admin only)
export const seedCategories = async () => {
    const { data } = await api.post('/api/category/seed');
    return data;
};

// Create category (Admin only)
export const createCategory = async (categoryData) => {
    const { data } = await api.post('/api/category/create', categoryData);
    return data;
};
