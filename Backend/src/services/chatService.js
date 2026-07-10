import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { Product } from '../models/productModel.js';
import { recordQuotaError, retryWithBackoff } from '../utils/geminiQuotaHelper.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── In-Memory Cache (development/single-instance) ─────────────────────────────
const memoryCache = new Map();
const cacheTTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_ENTRIES = 500;

const getCache = async (key) => {
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  if (cached) memoryCache.delete(key);
  return null;
};

const setCache = async (key, value, ttlSeconds = 3600) => {
  // Evict oldest entries if cache is full
  if (memoryCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

// ─── AI Shopping Chat Assistant ────────────────────────────────────────────────

/**
 * Process a user chat message and return an AI response with
 * optional product recommendations embedded.
 */
export const processChatMessage = async (message, userId = null) => {
  // Hash the message for cache key (cache per unique query regardless of user)
  const msgHash = crypto.createHash('md5').update(message.toLowerCase().trim()).digest('hex');
  const cacheKey = `chat:${msgHash}`;

  try {
    // 1. Check in-memory cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log('✓ Chat response from cache');
      return cached;
    }

    // 2. Fetch a sample of products to give AI context about the catalog
    const products = await Product.find({})
      .select('_id name description category price stock')
      .limit(50)
      .lean();

    const productContext = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description || '',
      category: p.category,
      price: p.price,
      inStock: p.stock > 0,
    }));

    // 3. Build prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are a friendly and knowledgeable shopping assistant for Divine-Kart, an e-commerce store.

Here is the current product catalog:
${JSON.stringify(productContext, null, 2)}

User message: "${message}"

Instructions:
- Reply helpfully and concisely (2-4 sentences max).
- If the user is looking for products, identify relevant product IDs from the catalog.
- Return ONLY valid JSON in this exact format (no markdown, no explanation outside JSON):
{
  "text": "Your friendly reply here",
  "productIds": ["id1", "id2"]
}
- If no specific products are relevant, return an empty array for productIds.
- Always respond in the same language as the user's message.
    `.trim();

    // 4. Call API with retry logic for transient errors
    let result;
    try {
      result = await retryWithBackoff(() => model.generateContent(prompt), 2);
    } catch (error) {
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        recordQuotaError();
        throw error;
      }
      throw error;
    }

    const raw = result.response.text().trim();

    // 5. Safely parse the AI response
    const cleanJson = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    // 6. Fetch full product details for matched IDs
    let matchedProducts = [];
    if (parsed.productIds && parsed.productIds.length > 0) {
      matchedProducts = await Product.find({ _id: { $in: parsed.productIds } })
        .select('_id name description category price imageUrl stock OldPrice')
        .lean();
    }

    const response = {
      text: parsed.text || "I'm here to help! Ask me anything about our products.",
      products: matchedProducts,
    };

    // 7. Cache for 1 hour to reduce API calls
    await setCache(cacheKey, response, 3600);

    return response;
  } catch (error) {
    const errorMessage = error.message || '';
    
    // Handle Gemini API quota/rate limit errors
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      console.error('🚨 Gemini API Quota Error:', errorMessage);
      const message = 'AI service is temporarily unavailable. Our smart search feature will return in a moment.';
      return {
        text: message,
        products: [],
        isQuotaError: true,
      };
    }
    
    console.error('processChatMessage error:', errorMessage);
    return {
      text: "Sorry, I'm having trouble understanding that right now. Try browsing our categories or searching for a product!",
      products: [],
    };
  }
};

// ─── AI Smart Search ───────────────────────────────────────────────────────────

/**
 * Convert a natural-language search query into filtered product results.
 * Uses Gemini to extract structured filters then queries MongoDB.
 */
export const aiSearch = async (query) => {
  const queryHash = crypto.createHash('md5').update(query.toLowerCase().trim()).digest('hex');
  const cacheKey = `aisearch:${queryHash}`;

  try {
    // 1. Check cache (5 minute TTL)
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    // 2. Get distinct categories for context
    const categories = await Product.distinct('category');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are a search filter extractor for an e-commerce store called Divine-Kart.

Available categories: ${JSON.stringify(categories)}

User search query: "${query}"

Extract search intent and return ONLY valid JSON (no markdown):
{
  "category": "exact category name or null",
  "minPrice": number or null,
  "maxPrice": number or null,
  "keywords": ["keyword1", "keyword2"]
}

Rules:
- category must exactly match one of the available categories, or be null
- Use Indian Rupees (₹) for price context
- keywords should be 1-3 most relevant product-name words
    `.trim();

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const cleanJson = raw.replace(/```json|```/g, '').trim();
    const filters = JSON.parse(cleanJson);

    // 3. Build MongoDB query from extracted filters
    const mongoQuery = {};

    if (filters.category) {
      mongoQuery.category = filters.category;
    }

    if (filters.minPrice != null || filters.maxPrice != null) {
      mongoQuery.price = {};
      if (filters.minPrice != null) mongoQuery.price.$gte = filters.minPrice;
      if (filters.maxPrice != null) mongoQuery.price.$lte = filters.maxPrice;
    }

    // Keyword search across name and description (escape regex metacharacters)
    if (filters.keywords && filters.keywords.length > 0) {
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const keywordRegex = filters.keywords.map((kw) => new RegExp(escapeRegex(kw), 'i'));
      mongoQuery.$or = [
        { name: { $in: keywordRegex } },
        { description: { $in: keywordRegex } },
      ];
    }

    const products = await Product.find(mongoQuery)
      .select('_id name description category price imageUrl stock OldPrice')
      .limit(20)
      .lean();

    const response = { products, filters };

    // 4. Cache for 5 minutes
    await setCache(cacheKey, response, 300);

    return response;
  } catch (error) {
    console.error('aiSearch error:', error.message);

    // Fallback: basic text search on name (escape regex metacharacters)
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const products = await Product.find({
      name: { $regex: escapedQuery, $options: 'i' },
    })
      .limit(20)
      .lean();

    return { products, filters: null };
  }
};
