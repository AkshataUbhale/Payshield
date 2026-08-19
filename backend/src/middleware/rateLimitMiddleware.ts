import { type Request, type Response, type NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests allowed per window
  message?: string;
}

interface ClientRecord {
  timestamps: number[];
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = "Too many requests, please try again later." } = options;
  const store = new Map<string, ClientRecord>();

  // Cleanup old records every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 120000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip =
      req.headers["x-forwarded-for"]?.toString() ||
      req.socket.remoteAddress ||
      "unknown-ip";
    
    // If authenticated, use user ID as part of key
    const userKey = (req as any).user?.id ? `user:${(req as any).user.id}` : `ip:${ip}`;
    const now = Date.now();

    let record = store.get(userKey);
    if (!record) {
      record = { timestamps: [] };
      store.set(userKey, record);
    }

    // Filter out timestamps older than window
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.timestamps.length - 1));

    if (record.timestamps.length >= max) {
      const oldest = record.timestamps[0] || now;
      const resetTimeSec = Math.ceil((oldest + windowMs - now) / 1000);
      res.setHeader("Retry-After", resetTimeSec);
      res.status(429).json({
        message,
        retryAfter: resetTimeSec,
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}

// 30 requests per minute for heavy AI / Gemini / RAG endpoints
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "AI rate limit exceeded. Please wait a moment before sending more AI requests.",
});

// 100 requests per minute for mutating API endpoints
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: "API request rate limit exceeded. Please slow down.",
});
