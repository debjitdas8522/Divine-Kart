/**
 * Utility for handling Gemini API calls with retry logic and quotas awareness.
 * Helps prevent hitting rate limits by implementing exponential backoff.
 */

const API_QUOTA_RESET_MS = 3600000; // 1 hour
let lastQuotaError = null;
let quotaErrorCount = 0;

/**
 * Check if we should skip API calls due to recent quota errors
 * If we hit quota errors 3+ times in an hour, suggest upgrading
 */
export const shouldSkipAPICall = () => {
  if (!lastQuotaError) return false;
  
  const timeSinceError = Date.now() - lastQuotaError;
  if (timeSinceError > API_QUOTA_RESET_MS) {
    lastQuotaError = null;
    quotaErrorCount = 0;
    return false;
  }
  
  return quotaErrorCount >= 3;
};

/**
 * Record a quota error for monitoring
 */
export const recordQuotaError = () => {
  lastQuotaError = Date.now();
  quotaErrorCount++;
  console.warn(
    `⚠️  Gemini API quota error #${quotaErrorCount}. ` +
    `Consider upgrading to a paid plan at https://console.cloud.google.com/billing`
  );
};

/**
 * Get current quota error status for debugging
 */
export const getQuotaStatus = () => ({
  hasErrors: quotaErrorCount > 0,
  errorCount: quotaErrorCount,
  timeUntilReset: lastQuotaError 
    ? Math.max(0, API_QUOTA_RESET_MS - (Date.now() - lastQuotaError))
    : 0,
});

/**
 * Exponential backoff for retries
 * Use when encountering transient API errors
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Don't retry quota errors
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        recordQuotaError();
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.min(1000 * Math.pow(2, i), 5000);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await sleep(delay);
    }
  }
};
