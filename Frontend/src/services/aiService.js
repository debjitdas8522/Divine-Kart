import api from './api';

// ─── AI Chat Assistant ─────────────────────────────────────────────────────────

/**
 * Send a message to the AI shopping assistant.
 * @param {string} message
 * @returns {{ text: string, products: Array }}
 */
export const getChatResponse = async (message) => {
  const { data } = await api.post('/api/ai/chat', { message });
  return data;
};

// ─── AI Smart Search ───────────────────────────────────────────────────────────

/**
 * Search products using a natural language query.
 * @param {string} query
 * @returns {{ products: Array, filters: object }}
 */
export const getAiSearchResults = async (query) => {
  const { data } = await api.get('/api/ai/search', { params: { q: query } });
  return data;
};

// ─── AI Description Generator (Admin) ─────────────────────────────────────────

/**
 * Generate a product description using Gemini AI.
 * @param {{ name: string, category: string, price: number, keywords?: string[] }} productData
 * @returns {{ description: string }}
 */
export const generateProductDescription = async (productData) => {
  const { data } = await api.post('/api/ai/generate-description', productData);
  return data;
};

// ─── Recommendation Helpers ────────────────────────────────────────────────────

/**
 * Get personalized recommendations for the current user.
 * @param {number} limit
 */
export const getPersonalizedRecommendations = async (limit = 10) => {
  const { data } = await api.get('/api/recommendations', { params: { limit } });
  return data;
};

/**
 * Get popular products.
 * @param {number} limit
 */
export const getPopularProducts = async (limit = 10) => {
  const { data } = await api.get('/api/recommendations/popular', { params: { limit } });
  return data;
};

/**
 * Get products similar to a given product.
 * @param {string} productId
 * @param {number} limit
 */
export const getSimilarProducts = async (productId, limit = 5) => {
  const { data } = await api.get(`/api/recommendations/similar/${productId}`, {
    params: { limit },
  });
  return data;
};

/**
 * Get frequently bought together products.
 * @param {string} productId
 * @param {number} limit
 */
export const getFrequentlyBoughtTogether = async (productId, limit = 5) => {
  const { data } = await api.get(
    `/api/recommendations/frequently-bought-together/${productId}`,
    { params: { limit } }
  );
  return data;
};
