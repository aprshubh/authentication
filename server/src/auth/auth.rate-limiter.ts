import type { NextFunction, Request, Response } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export const createRateLimiter = ({
  windowMs,
  max,
  message = 'Too many requests from this IP, please try again later.',
}: RateLimiterOptions) => {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup expired entries periodically (every 5 minutes)
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  // Unref interval so it does not block Node process termination
  cleanupInterval.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // Use Express's resolved IP. Do not trust X-Forwarded-For directly;
    // configure app.set('trust proxy', ...) only for known reverse proxies.
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-ip';

    const now = Date.now();
    let record = store.get(clientIp);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(clientIp, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      res.status(429).json({ message });
      return;
    }

    next();
  };
};

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

export const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many password reset requests. Please try again after an hour.',
});

export const refreshTokenLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many refresh attempts. Please try again later.',
});

export const verificationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many email verification attempts. Please try again after an hour.',
});

export const sendVerificationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many verification emails requested. Please try again after an hour.',
});
