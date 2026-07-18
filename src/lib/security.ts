/**
 * Security utilities — prevents API key leakage
 */

/** Patterns that indicate sensitive data */
const SENSITIVE_PATTERNS = [
  /sk-[a-zA-Z0-9\-_]{20,}/g,          // OpenRouter, OpenAI keys
  /nvapi-[a-zA-Z0-9\-_]{20,}/g,       // NVIDIA keys
  /AIza[a-zA-Z0-9\-_]{30,}/g,         // Google API keys
  /AQ\.[a-zA-Z0-9\-_]{30,}/g,         // Gemini keys
  /Bearer\s+[a-zA-Z0-9\-_.]{20,}/g,   // Bearer tokens
  /EAA[a-zA-Z0-9]{20,}/g,             // Meta access tokens
  /xoxb-[a-zA-Z0-9\-]{20,}/g,         // Slack tokens
  /ghp_[a-zA-Z0-9]{20,}/g,            // GitHub tokens
  /postgresql:\/\/[^"'\s]+/g,          // Database URLs
];

/**
 * Mask sensitive values in a string — replaces with [REDACTED]
 */
export function redactSecrets(text: string): string {
  let result = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]");
  }
  return result;
}

/**
 * Mask a key for display (show first 8 chars + last 4)
 */
export function maskKey(key: string): string {
  if (!key || key.length < 16) return "••••••••";
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

/**
 * Sanitize an object by removing known sensitive fields
 */
export function sanitizeForClient<T extends Record<string, unknown>>(
  obj: T,
  sensitiveFields: string[] = ["apiKey", "token", "secret", "password", "authToken", "accessToken", "tokenCipher", "tokenIv", "tokenTag"]
): T {
  const cleaned = { ...obj };
  for (const field of sensitiveFields) {
    if (field in cleaned) {
      (cleaned as Record<string, unknown>)[field] = "[PROTECTED]";
    }
  }
  return cleaned;
}

/**
 * Validate that a request has proper internal authorization
 */
export function isInternalRequest(headers: Headers): boolean {
  const internalKey = headers.get("x-internal-key");
  return internalKey === process.env.BETTER_AUTH_SECRET;
}

/**
 * Rate limiter store (in-memory, per deployment)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkApiRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}
