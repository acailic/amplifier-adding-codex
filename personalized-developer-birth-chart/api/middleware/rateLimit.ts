import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import Redis from 'redis';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Redis client for production rate limiting
let redisClient: Redis.RedisClientType | null = null;

// Initialize Redis client if configured
async function getRedisClient(): Promise<Redis.RedisClientType | null> {
  if (!config.redisUrl || config.isDevelopment) {
    return null; // Use in-memory store in development
  }

  if (!redisClient) {
    try {
      redisClient = Redis.createClient({
        url: config.redisUrl,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
        },
        // Add retry strategy for production resilience
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          // Retry after min(3 seconds, retry delay)
          return Math.min(options.attempt * 100, 3000);
        }
      });

      redisClient.on('error', (err) => {
        console.error('Redis rate limiting error:', err);
        // Fallback to in-memory store if Redis fails
        redisClient = null;
      });

      redisClient.on('connect', () => {
        console.log('Redis rate limiting connected');
      });

      await redisClient.connect();
    } catch (error) {
      console.error('Failed to initialize Redis for rate limiting:', error);
      redisClient = null;
    }
  }

  return redisClient;
}

// In-memory store for fallback (in production, use Redis)
const rateLimitStore: RateLimitStore = {};

// Rate limit configurations for different endpoints
export const rateLimitConfigs = {
  default: {
    windowMs: config.rateLimitWindowMs,
    maxRequests: config.rateLimitMaxRequests,
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
  },
  chartGeneration: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 charts per minute
  },
  apiCall: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 API calls per minute
  },
  sharing: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 sharing events per minute
  },
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 uploads per minute
  }
};

// Generate a unique key for rate limiting
function generateRateLimitKey(
  identifier: string,
  endpoint: string,
  windowMs: number
): string {
  const timeWindow = Math.floor(Date.now() / windowMs);
  return createHash('sha256')
    .update(`${identifier}:${endpoint}:${timeWindow}`)
    .digest('hex');
}

// Clean up expired entries from rate limit store
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime <= now) {
      delete rateLimitStore[key];
    }
  }
}

// Safely extract user ID from JWT token with proper verification
function extractUserIdFromToken(token: string): string | null {
  try {
    // Verify JWT signature first - never decode without verification
    const payload = jwt.verify(token, config.jwtSecret) as any;
    return payload?.userId || null;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

// Get client identifier for rate limiting
function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const userId = extractUserIdFromToken(token);
      if (userId) {
        return `user:${userId}`;
      }
      // Fall back to IP if token is invalid
    } catch {
      // Fall back to IP if token processing fails
    }
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return `ip:${ip}`;
}

// Redis-based rate limiting
async function isRateLimitedRedis(
  identifier: string,
  endpoint: string,
  windowMs: number,
  maxRequests: number,
  redis: Redis.RedisClientType
): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
  const key = generateRateLimitKey(identifier, endpoint, windowMs);
  const now = Date.now();
  const resetTime = now + windowMs;

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.multi();
    
    // Get current count
    pipeline.get(key);
    
    // Increment count with expiration
    pipeline.incr(key);
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();
    const currentCount = parseInt(results[0][1] as string) || 0;
    const newCount = parseInt(results[1][1] as string);

    return {
      limited: newCount > maxRequests,
      remaining: Math.max(maxRequests - newCount, 0),
      resetTime
    };
  } catch (error) {
    console.error('Redis rate limiting error, falling back to in-memory:', error);
    // Fallback to in-memory rate limiting
    return isRateLimitedMemory(identifier, endpoint, windowMs, maxRequests);
  }
}

// In-memory rate limiting fallback
function isRateLimitedMemory(
  identifier: string,
  endpoint: string,
  windowMs: number,
  maxRequests: number
): { limited: boolean; remaining: number; resetTime: number } {
  cleanupExpiredEntries();

  const key = generateRateLimitKey(identifier, endpoint, windowMs);
  const now = Date.now();
  const resetTime = now + windowMs;

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 1,
      resetTime
    };
    return {
      limited: false,
      remaining: maxRequests - 1,
      resetTime
    };
  }

  const record = rateLimitStore[key];

  // If the window has expired, reset the counter
  if (record.resetTime <= now) {
    record.count = 1;
    record.resetTime = resetTime;
    return {
      limited: false,
      remaining: maxRequests - 1,
      resetTime
    };
  }

  record.count++;

  return {
    limited: record.count > maxRequests,
    remaining: Math.max(maxRequests - record.count, 0),
    resetTime: record.resetTime
  };
}

// Check if a request should be rate limited
async function isRateLimited(
  identifier: string,
  endpoint: string,
  windowMs: number,
  maxRequests: number
): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
  const redis = await getRedisClient();
  
  if (redis) {
    return isRateLimitedRedis(identifier, endpoint, windowMs, maxRequests, redis);
  } else {
    return isRateLimitedMemory(identifier, endpoint, windowMs, maxRequests);
  }
}

// Rate limiting middleware
export function rateLimit(configName: keyof typeof rateLimitConfigs = 'default') {
  const { windowMs, maxRequests } = rateLimitConfigs[configName];

  return function(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
    return async (request: NextRequest, ...args: any[]): Promise<Response> => {
      try {
        const identifier = getClientIdentifier(request);
        const endpoint = new URL(request.url).pathname;

        const { limited, remaining, resetTime } = await isRateLimited(
          identifier,
          endpoint,
          windowMs,
          maxRequests
        );

        // Add rate limit headers to response
        const headers = {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        };

        if (limited) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
              }
            },
            {
              status: 429,
              headers: {
                ...headers,
                'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
              }
            }
          );
        }

        // Execute the handler and add headers to the response
        const response = await handler(request, ...args);

        // If response is a NextResponse, add headers
        if (response instanceof NextResponse) {
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }

        return response;
      } catch (error) {
        console.error('Rate limiting error:', error);
        // Continue with the request if rate limiting fails
        return handler(request, ...args);
      }
    };
  };
}

// Usage-based rate limiting (for premium features)
export function usageBasedRateLimit(
  eventType: string,
  defaultLimit: number,
  premiumMultiplier = 5
) {
  return async function(request: NextRequest, ...args: any[]): Promise<Response> {
    try {
      // This would integrate with your usage tracking system
      // For now, we'll use a simplified version

      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No auth, use default rate limiting
        return rateLimit()(args[0])(request, ...args.slice(1));
      }

      const token = authHeader.substring(7);
      const userId = extractUserIdFromToken(token);
      if (!userId) {
        // Invalid token, fall back to default rate limiting
        return rateLimit()(args[0])(request, ...args.slice(1));
      }

      // Check user's current usage from your usage tracking system
      // This is a placeholder - integrate with your actual usage tracking
      const currentUsage = await getCurrentUsage(userId, eventType);
      const userLimit = await getUserLimit(userId, defaultLimit, premiumMultiplier);

      if (currentUsage >= userLimit) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'USAGE_LIMIT_EXCEEDED',
              message: 'You have reached your usage limit for this feature.',
              currentUsage,
              limit: userLimit,
              resetDate: getNextResetDate()
            }
          },
          { status: 429 }
        );
      }

      // Execute the handler
      const response = await args[0](request, ...args.slice(1));

      // If the request was successful, track the usage
      if (response instanceof Response && response.ok) {
        await trackUsage(userId, eventType);
      }

      return response;
    } catch (error) {
      console.error('Usage-based rate limiting error:', error);
      // Continue with the request if rate limiting fails
      return args[0](request, ...args.slice(1));
    }
  };
}

// Placeholder functions - implement these based on your actual usage tracking
async function getCurrentUsage(userId: string, eventType: string): Promise<number> {
  // Implement based on your usage tracking system
  // This should return the current usage count for the user and event type
  return 0;
}

async function getUserLimit(userId: string, defaultLimit: number, multiplier: number): Promise<number> {
  // Implement based on your subscription system
  // This should return the user's limit based on their subscription tier
  return defaultLimit;
}

function getNextResetDate(): string {
  // Implement based on your reset schedule (daily, monthly, etc.)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

async function trackUsage(userId: string, eventType: string): Promise<void> {
  // Implement based on your usage tracking system
  // This should increment the usage count for the user and event type
}

// Advanced rate limiting for specific patterns
export function adaptiveRateLimit(baseLimit: number) {
  return rateLimit()(
    async (request: NextRequest, ...args: any[]): Promise<Response> => {
      const authHeader = request.headers.get('authorization');

      let multiplier = 1;

      // Check if user has premium subscription for higher limits
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const userId = extractUserIdFromToken(token);
          if (!userId) {
            // Invalid token, fall back to default limit
            multiplier = 1;
          } else {
            // Check user's subscription tier
            const userLimit = await getUserLimit(userId, baseLimit, 5);
            multiplier = userLimit / baseLimit;
          }
        } catch {
          // Fall back to default limit if token is invalid
          multiplier = 1;
        }
      }

      const adjustedLimit = Math.ceil(baseLimit * multiplier);

      // Create a custom rate limit config for this request
      const customConfig = {
        windowMs: rateLimitConfigs.default.windowMs,
        maxRequests: adjustedLimit,
      };

      // Apply the custom rate limit
      const identifier = getClientIdentifier(request);
      const endpoint = new URL(request.url).pathname;

      const { limited, remaining, resetTime } = await isRateLimited(
        identifier,
        endpoint,
        customConfig.windowMs,
        customConfig.maxRequests
      );

      if (limited) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please try again later.',
              retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
            }
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': customConfig.maxRequests.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': new Date(resetTime).toISOString(),
              'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }

      // Execute the original handler
      return args[0](request, ...args.slice(1));
    }
  );
}

export default rateLimit;
