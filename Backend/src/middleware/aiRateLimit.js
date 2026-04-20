import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for AI chat endpoint.
 * Stricter limits to respect Gemini API free tier quotas.
 * 
 * Limits:
 * - 10 requests per minute per IP (600 requests/hour max)
 * - 100 requests per hour per IP
 */
export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    message: 'Too many chat requests. Please wait a moment before trying again.',
    retryAfter: '1 minute',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Don't rate limit admin users (optional - remove if not needed)
    return req.user?.role === 'admin';
  },
  keyGenerator: (req) => {
    // Rate limit by IP + user ID (if logged in) to allow different users different limits
    return req.user?._id ? `user-${req.user._id}` : req.ip;
  },
});

/**
 * Stricter rate limiter for the AI search endpoint.
 * Per-user limits to prevent abuse.
 */
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute
  message: {
    success: false,
    message: 'Too many search requests. Please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?._id ? `user-${req.user._id}` : req.ip;
  },
});
