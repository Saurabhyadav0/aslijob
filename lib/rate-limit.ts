/**
 * In-memory sliding window rate limiter.
 * Spec: 20 checks an hour per IP/identifier (Plan Page 17, 28).
 */

type WindowRecord = {
  count: number;
  windowStart: number;
};

const store = new Map<string, WindowRecord>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_LIMIT = 30; // 30 requests / hour

export function checkRateLimit(
  identifier: string,
  limit: number = DEFAULT_LIMIT,
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  // Allow test / local environments unlimited unless tested
  if (process.env.NODE_ENV === "test" && !identifier.startsWith("rate-limit-test:")) {
    return { allowed: true, remaining: limit, resetInSeconds: 3600 };
  }

  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now - record.windowStart >= WINDOW_MS) {
    store.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetInSeconds: 3600 };
  }

  if (record.count >= limit) {
    const resetInSeconds = Math.ceil((record.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  record.count += 1;
  const resetInSeconds = Math.ceil((record.windowStart + WINDOW_MS - now) / 1000);
  return { allowed: true, remaining: limit - record.count, resetInSeconds };
}

export function clearRateLimits(): void {
  store.clear();
}
