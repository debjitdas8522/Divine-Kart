import { processChatMessage } from '../services/chatService.js';

/**
 * POST /api/ai/chat
 * AI shopping assistant — accepts a user message and returns a reply + products.
 * Works for both authenticated and guest users.
 */
export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string.',
      });
    }

    if (message.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message must be 500 characters or less.',
      });
    }

    const userId = req.user?._id || null;
    const result = await processChatMessage(message.trim(), userId);

    res.json({
      success: true,
      text: result.text,
      products: result.products,
      productCount: result.products.length,
    });
  } catch (error) {
    // Handle Gemini API quota errors specifically
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      console.error('Gemini API quota exceeded:', error.message);
      return res.status(429).json({
        success: false,
        message: 'AI service is temporarily unavailable due to high usage. Please try again in a moment.',
        isQuotaError: true,
      });
    }
    next(error);
  }
};
