/**
 * Sentry Integration for Error Tracking and Performance Monitoring
 */

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Logger } from 'winston';
import { logger } from './logger';

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  release?: string;
  debug?: boolean;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  chartId?: string;
  platform?: string;
  metadata?: Record<string, any>;
}

export class SentryMonitoring {
  private config: SentryConfig;
  private initialized: boolean = false;

  constructor(config: SentryConfig) {
    this.config = config;
    this.initialize();
  }

  /**
   * Initialize Sentry
   */
  private initialize(): void {
    try {
      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        tracesSampleRate: this.config.tracesSampleRate,
        profilesSampleRate: this.config.profilesSampleRate,
        release: this.config.release,
        debug: this.config.debug,
        integrations: [
          new ProfilingIntegration(),
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app: null }),
          new Sentry.Integrations.Functions(),
        ],
        beforeSend(event, hint) {
          // Filter out sensitive information
          if (event.exception) {
            const error = hint.originalException as Error;
            event.contexts = {
              ...event.contexts,
              custom: {
                ...event.contexts?.custom,
                errorMessage: error.message,
                errorName: error.name
              }
            };
          }

          // Remove sensitive headers
          if (event.request?.headers) {
            const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
            Object.keys(event.request.headers).forEach(header => {
              if (sensitiveHeaders.includes(header.toLowerCase())) {
                delete event.request.headers[header];
              }
            });
          }

          return event;
        },
      });

      this.initialized = true;
      logger.info('Sentry initialized successfully', {
        environment: this.config.environment,
        tracesSampleRate: this.config.tracesSampleRate,
        profilesSampleRate: this.config.profilesSampleRate
      });

    } catch (error) {
      logger.error('Failed to initialize Sentry', { error });
      this.initialized = false;
    }
  }

  /**
   * Track error with context
   */
  trackError(error: Error, context: ErrorContext): void {
    if (!this.initialized) {
      logger.error('Sentry not initialized, falling back to logger', { error, context });
      return;
    }

    try {
      Sentry.withScope((scope) => {
        // Set tags
        scope.setTag('operation', context.operation);
        scope.setTag('platform', context.platform || 'unknown');
        scope.setTag('environment', this.config.environment);

        // Set user
        if (context.userId) {
          scope.setUser({ id: context.userId });
        }

        // Set extra context
        if (context.chartId) {
          scope.setExtra('chartId', context.chartId);
        }

        if (context.metadata) {
          Object.entries(context.metadata).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }

        // Capture exception
        Sentry.captureException(error, {
          tags: {
            operation: context.operation,
            platform: context.platform || 'unknown'
          },
          extra: {
            chartId: context.chartId,
            ...context.metadata
          }
        });
      });

    } catch (sentryError) {
      logger.error('Failed to capture error in Sentry', { sentryError, originalError: error, context });
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: PerformanceMetrics): void {
    if (!this.initialized) {
      logger.debug('Sentry not initialized, skipping performance tracking', { metrics });
      return;
    }

    try {
      Sentry.withScope((scope) => {
        scope.setTag('operation', metrics.operation);
        scope.setTag('success', metrics.success);

        if (metrics.metadata) {
          Object.entries(metrics.metadata).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }

        // Create transaction
        const transaction = Sentry.startTransaction({
          name: metrics.operation,
          op: metrics.operation,
          data: metrics.metadata
        });

        // Set transaction data
        transaction.setData('duration', metrics.duration);
        transaction.setData('success', metrics.success);

        // Finish transaction
        transaction.finish(metrics.duration / 1000); // Convert to seconds

        logger.debug('Performance tracked in Sentry', {
          operation: metrics.operation,
          duration: metrics.duration,
          success: metrics.success
        });
      });

    } catch (error) {
      logger.error('Failed to track performance in Sentry', { error, metrics });
    }
  }

  /**
   * Track API performance
   */
  trackApiPerformance(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    this.trackPerformance({
      operation: `api.${method.toLowerCase()}.${endpoint}`,
      duration,
      success: statusCode < 400,
      metadata: {
        endpoint,
        method,
        statusCode,
        ...metadata
      }
    });
  }

  /**
   * Track GitHub API performance
   */
  trackGitHubPerformance(
    operation: string,
    username: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    this.trackPerformance({
      operation: `github.${operation}`,
      duration,
      success,
      metadata: {
        username,
        ...metadata
      }
    });
  }

  /**
   * Track social media performance
   */
  trackSocialPerformance(
    platform: string,
    action: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    this.trackPerformance({
      operation: `social.${platform}.${action}`,
      duration,
      success,
      metadata: {
        platform,
        action,
        ...metadata
      }
    });
  }

  /**
   * Track chart generation performance
   */
  trackChartGeneration(
    chartId: string,
    username: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    this.trackPerformance({
      operation: 'chart.generation',
      duration,
      success,
      metadata: {
        chartId,
        username,
        ...metadata
      }
    });
  }

  /**
   * Track image generation performance
   */
  trackImageGeneration(
    chartId: string,
    platform: string,
    theme: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    this.trackPerformance({
      operation: 'image.generation',
      duration,
      success,
      metadata: {
        chartId,
        platform,
        theme,
        ...metadata
      }
    });
  }

  /**
   * Track database performance
   */
  trackDatabasePerformance(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    this.trackPerformance({
      operation: `database.${operation}`,
      duration,
      success,
      metadata: {
        table,
        ...metadata
      }
    });
  }

  /**
   * Track cache performance
   */
  trackCachePerformance(
    operation: string,
    key: string,
    hit: boolean,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    this.trackPerformance({
      operation: `cache.${operation}`,
      duration,
      success: true,
      metadata: {
        key,
        hit,
        ...metadata
      }
    });
  }

  /**
   * Track user behavior
   */
  trackUserBehavior(
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.initialized) {
      logger.debug('Sentry not initialized, skipping user behavior tracking', { userId, action });
      return;
    }

    try {
      Sentry.withScope((scope) => {
        scope.setUser({ id: userId });
        scope.setTag('action', action);

        if (metadata) {
          Object.entries(metadata).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }

        // Create breadcrumb for user action
        Sentry.addBreadcrumb({
          message: `User action: ${action}`,
          category: 'user',
          level: 'info',
          data: metadata
        });

        logger.debug('User behavior tracked in Sentry', { userId, action });
      });

    } catch (error) {
      logger.error('Failed to track user behavior in Sentry', { error, userId, action });
    }
  }

  /**
   * Track business metrics
   */
  trackBusinessMetric(
    metric: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    if (!this.initialized) {
      logger.debug('Sentry not initialized, skipping business metric tracking', { metric, value, tags });
      return;
    }

    try {
      Sentry.withScope((scope) => {
        scope.setTag('metric', metric);

        if (tags) {
          Object.entries(tags).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }

        // Add metric as custom breadcrumb
        Sentry.addBreadcrumb({
          message: `Business metric: ${metric} = ${value}`,
          category: 'business',
          level: 'info',
          data: { metric, value, tags }
        });

        logger.debug('Business metric tracked in Sentry', { metric, value, tags });
      });

    } catch (error) {
      logger.error('Failed to track business metric in Sentry', { error, metric, value, tags });
    }
  }

  /**
   * Create custom span for detailed tracking
   */
  createSpan<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.initialized) {
      return fn();
    }

    return Sentry.withScope(async (scope) => {
      scope.setTag('operation', operation);

      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      const transaction = Sentry.startTransaction({
        name: operation,
        op: operation,
        data: metadata
      });

      try {
        const startTime = Date.now();
        const result = await fn();
        const duration = Date.now() - startTime;

        transaction.setData('duration', duration);
        transaction.setData('success', true);
        transaction.finish();

        return result;

      } catch (error) {
        const duration = Date.now() - transaction.startTimestamp;

        transaction.setData('duration', duration);
        transaction.setData('success', false);
        transaction.setStatus('internal_error');
        transaction.finish();

        throw error;
      }
    });
  }

  /**
   * Add custom context to all future events
   */
  setGlobalContext(context: Record<string, any>): void {
    if (!this.initialized) {
      return;
    }

    try {
      Sentry.configureScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      });

    } catch (error) {
      logger.error('Failed to set global context in Sentry', { error, context });
    }
  }

  /**
   * Set user context
   */
  setUser(userId: string, email?: string, username?: string): void {
    if (!this.initialized) {
      return;
    }

    try {
      Sentry.setUser({
        id: userId,
        email,
        username
      });

    } catch (error) {
      logger.error('Failed to set user in Sentry', { error, userId });
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.initialized) {
      return;
    }

    try {
      Sentry.setUser(null);
    } catch (error) {
      logger.error('Failed to clear user in Sentry', { error });
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(
    message: string,
    category?: string,
    level?: Sentry.SeverityLevel,
    data?: Record<string, any>
  ): void {
    if (!this.initialized) {
      return;
    }

    try {
      Sentry.addBreadcrumb({
        message,
        category,
        level: level || 'info',
        data
      });

    } catch (error) {
      logger.error('Failed to add breadcrumb in Sentry', { error, message, category });
    }
  }

  /**
   * Get Sentry health status
   */
  getHealthStatus(): {
    initialized: boolean;
    environment: string;
    dsn: string;
    sampleRate: number;
  } {
    return {
      initialized: this.initialized,
      environment: this.config.environment,
      dsn: this.config.dsn.replace(/@.*$/, '@***'), // Hide sensitive part
      sampleRate: this.config.tracesSampleRate
    };
  }
}

// Initialize Sentry instance
export const sentryMonitoring = new SentryMonitoring({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
  release: process.env.SENTRY_RELEASE || `developer-birth-chart@${process.env.npm_package_version || '1.0.0'}`,
  debug: process.env.NODE_ENV === 'development'
});

// Express middleware for Sentry
export function sentryMiddleware() {
  if (!sentryMonitoring.getHealthStatus().initialized) {
    return (req: any, res: any, next: any) => next();
  }

  return Sentry.Handlers.requestHandler();
}

// Error handler middleware for Sentry
export function sentryErrorHandler() {
  if (!sentryMonitoring.getHealthStatus().initialized) {
    return (err: Error, req: any, res: any, next: any) => {
      logger.error('Unhandled error', { error: err });
      res.status(500).json({ error: 'Internal server error' });
    };
  }

  return Sentry.Handlers.errorHandler();
}

// Performance monitoring middleware
export function performanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      sentryMonitoring.trackApiPerformance(
        req.route?.path || req.path,
        req.method,
        statusCode,
        duration,
        {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          query: req.query
        }
      );
    });

    next();
  };
}