import { useCallback, useRef, useEffect, useState } from 'react';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheConfig {
  defaultTTL: number; // Default time-to-live in milliseconds
  maxSize: number; // Maximum number of entries in cache
  enableBackgroundRefresh: boolean;
}

interface RequestConfig {
  cacheKey?: string;
  ttl?: number;
  skipCache?: boolean;
  priority?: 'high' | 'normal' | 'low';
  retryAttempts?: number;
  retryDelay?: number;
}

interface ApiRequest<T = any> {
  url: string;
  options?: RequestInit;
  config?: RequestConfig;
}

interface ApiResponse<T = any> {
  data: T;
  cached: boolean;
  timestamp: number;
}

class ApiCacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private backgroundRefreshTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      enableBackgroundRefresh: true,
      ...config,
    };

    // Cleanup expired entries periodically
    setInterval(() => this.cleanup(), 60 * 1000); // Every minute
  }

  // Get cached data
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Set cached data
  set<T = any>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key,
    };

    this.cache.set(key, entry);

    // Setup background refresh if enabled
    if (this.config.enableBackgroundRefresh) {
      this.setupBackgroundRefresh(key, entry);
    }
  }

  // Delete cached data
  delete(key: string): boolean {
    const timer = this.backgroundRefreshTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.backgroundRefreshTimers.delete(key);
    }
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.backgroundRefreshTimers.forEach(timer => clearTimeout(timer));
    this.backgroundRefreshTimers.clear();
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const size = this.cache.size;
    const maxSize = this.config.maxSize;

    // Calculate approximate memory usage (rough estimate)
    let memoryUsage = 0;
    this.cache.forEach(entry => {
      memoryUsage += JSON.stringify(entry.data).length;
    });

    return {
      size,
      maxSize,
      hitRate: 0, // Would need to track hits/misses
      memoryUsage,
    };
  }

  // Setup background refresh for cached data
  private setupBackgroundRefresh<T>(key: string, entry: CacheEntry<T>): void {
    // Clear existing timer
    const existingTimer = this.backgroundRefreshTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Setup new timer to refresh before expiration
    const refreshTime = entry.ttl * 0.8; // Refresh at 80% of TTL
    const timer = setTimeout(() => {
      this.backgroundRefresh(key);
    }, refreshTime);

    this.backgroundRefreshTimers.set(key, timer);
  }

  // Background refresh (to be implemented by specific API calls)
  private async backgroundRefresh(key: string): Promise<void> {
    // This would need to be implemented based on the specific API endpoints
    // For now, just remove the entry to force refresh on next request
    this.cache.delete(key);
    this.backgroundRefreshTimers.delete(key);
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        const timer = this.backgroundRefreshTimers.get(key);
        if (timer) {
          clearTimeout(timer);
          this.backgroundRefreshTimers.delete(key);
        }
      }
    }
  }
}

// Global API cache instance
export const apiCache = new ApiCacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  enableBackgroundRefresh: true,
});

// Optimized fetch function with caching
export async function optimizedFetch<T = any>(
  url: string,
  options: RequestInit = {},
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const cacheKey = config.cacheKey || `${url}:${JSON.stringify(options)}`;
  const method = options.method || 'GET';

  // Only cache GET requests
  if (method === 'GET' && !config.skipCache) {
    // Try to get from cache first
    const cached = apiCache.get<T>(cacheKey);
    if (cached) {
      return {
        data: cached,
        cached: true,
        timestamp: Date.now(),
      };
    }
  }

  try {
    // Make actual request
    const response = await fetchWithRetry(url, options, {
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response if it's a GET request
    if (method === 'GET' && !config.skipCache) {
      apiCache.set(cacheKey, data, config.ttl);
    }

    return {
      data,
      cached: false,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('[API] Fetch error:', error);
    throw error;
  }
}

// Fetch with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryConfig: { retryAttempts: number; retryDelay: number }
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= retryConfig.retryAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      return response;
    } catch (error) {
      lastError = error as Error;

      if (attempt < retryConfig.retryAttempts) {
        // Exponential backoff
        const delay = retryConfig.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// Hook for optimized API calls
export function useOptimizedApi<T = any>(
  apiCall: () => Promise<T>,
  dependencies: React.DependencyList = [],
  config: RequestConfig = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    // Cancel previous request if still running
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// Prefetch utility
export function prefetchApi(url: string, options: RequestInit = {}, config: RequestConfig = {}): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      optimizedFetch(url, options, config);
    });
  } else {
    setTimeout(() => {
      optimizedFetch(url, options, config);
    }, 100);
  }
}

// Batch API requests
export async function batchApi<T = any>(requests: ApiRequest<T>[]): Promise<ApiResponse<T>[]> {
  const batchPromises = requests.map(({ url, options, config }) =>
    optimizedFetch<T>(url, options, config)
  );

  try {
    const results = await Promise.allSettled(batchPromises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`[API] Batch request ${index} failed:`, result.reason);
        throw result.reason;
      }
    });
  } catch (error) {
    console.error('[API] Batch request error:', error);
    throw error;
  }
}

// Debounced API call
export function useDebouncedApi<T = any>(
  apiCall: () => Promise<T>,
  delay: number,
  dependencies: React.DependencyList = []
) {
  const debouncedCall = useCallback(
    debounce(async () => {
      try {
        return await apiCall();
      } catch (error) {
        console.error('[API] Debounced call error:', error);
        throw error;
      }
    }, delay),
    [apiCall, ...dependencies]
  );

  return useOptimizedApi(debouncedCall, [delay, ...dependencies]);
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Priority-based API request queue
class ApiRequestQueue {
  private queues: {
    high: ApiRequest[];
    normal: ApiRequest[];
    low: ApiRequest[];
  };
  private processing: boolean = false;

  constructor() {
    this.queues = {
      high: [],
      normal: [],
      low: [],
    };
  }

  add(request: ApiRequest): void {
    const priority = request.config?.priority || 'normal';
    this.queues[priority].push(request);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queues.high.length > 0 || this.queues.normal.length > 0 || this.queues.low.length > 0) {
      const request = this.queues.high.shift() ||
                    this.queues.normal.shift() ||
                    this.queues.low.shift();

      if (request) {
        try {
          await optimizedFetch(request.url, request.options, request.config);
        } catch (error) {
          console.error('[API] Queue request error:', error);
        }
      }
    }

    this.processing = false;
  }
}

export const apiQueue = new ApiRequestQueue();

// Smart prefetching based on user behavior
export class SmartPrefetcher {
  private observer: IntersectionObserver;
  private visitedUrls: Set<string> = new Set();

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const url = element.dataset.prefetchUrl;
            if (url && !this.visitedUrls.has(url)) {
              this.visitedUrls.add(url);
              prefetchApi(url);
            }
          }
        });
      },
      { rootMargin: '50px' }
    );
  }

  observe(element: HTMLElement, url: string): void {
    element.dataset.prefetchUrl = url;
    this.observer.observe(element);
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}

export const smartPrefetcher = new SmartPrefetcher();

// API optimization utilities
export const apiOptimizations = {
  cache: apiCache,
  optimizedFetch,
  useOptimizedApi,
  prefetchApi,
  batchApi,
  useDebouncedApi,
  apiQueue,
  smartPrefetcher,
};

export default apiOptimizations;