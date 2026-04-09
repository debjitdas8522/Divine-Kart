import api from './api';

// Get user's cart
export const getCart = async () => {
    const { data } = await api.get('/api/cart');
    return data;
};

// Add item to cart
export const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/api/cart', {
        productId,
        quantity
    });
    return data;
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
    const { data } = await api.put(`/api/cart/${itemId}`, { quantity });
    return data;
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
    const { data } = await api.delete(`/api/cart/${itemId}`);
    return data;
};

// Clear entire cart
export const clearCart = async () => {
    const { data } = await api.delete('/api/cart');
    return data;
};
