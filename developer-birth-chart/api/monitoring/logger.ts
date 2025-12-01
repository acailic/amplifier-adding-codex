/**
 * Advanced Logger with Winston
 * Provides structured logging for monitoring and debugging
 */

import winston from 'winston';
import { TransformableInfo } from 'logform';

export interface LogContext {
  userId?: string;
  chartId?: string;
  platform?: string;
  operation?: string;
  duration?: number;
  error?: Error;
  requestId?: string;
  [key: string]: any;
}

export interface LoggerConfig {
  level: string;
  environment: string;
  service: string;
  version?: string;
  enableConsole: boolean;
  enableFile: boolean;
  enableExternal?: boolean;
  externalService?: 'sentry' | 'datadog' | 'papertrail';
}

export class AdvancedLogger {
  private logger: winston.Logger;
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.logger = this.createLogger();
  }

  /**
   * Create Winston logger with custom configuration
   */
  private createLogger(): winston.Logger {
    const transports: winston.transport[] = [];

    // Console transport for development
    if (this.config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          )
        })
      );
    }

    // File transport for production
    if (this.config.enableFile) {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    }

    return winston.createLogger({
      level: this.config.level,
      defaultMeta: {
        service: this.config.service,
        environment: this.config.environment,
        version: this.config.version
      },
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports
    });
  }

  /**
   * Log info message with context
   */
  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  /**
   * Log warning message with context
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  /**
   * Log error message with context
   */
  error(message: string, context?: LogContext): void {
    this.logger.error(message, {
      ...context,
      stack: context.error?.stack
    });
  }

  /**
   * Log debug message with context
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  /**
   * Log verbose message with context
   */
  verbose(message: string, context?: LogContext): void {
    this.logger.verbose(message, context);
  }

  /**
   * Log HTTP request
   */
  logRequest(req: any, res: any, duration?: number): void {
    const context: LogContext = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestId: req.id
    };

    if (duration) {
      context.duration = duration;
    }

    const level = res.statusCode >= 400 ? 'warn' : 'info';
    this.logger.log(level, 'HTTP Request', context);
  }

  /**
   * Log API call
   */
  logApiCall(
    service: string,
    operation: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ): void {
    this.logger.info('API Call', {
      service,
      operation,
      duration,
      success,
      ...context
    });
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ): void {
    this.logger.info('Database Operation', {
      operation,
      table,
      duration,
      success,
      ...context
    });
  }

  /**
   * Log cache operation
   */
  logCacheOperation(
    operation: string,
    key: string,
    hit: boolean,
    duration?: number,
    context?: LogContext
  ): void {
    this.logger.debug('Cache Operation', {
      operation,
      key,
      hit,
      duration,
      ...context
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: LogContext
  ): void {
    this.logger.warn('Security Event', {
      event,
      severity,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * Log business metric
   */
  logBusinessMetric(
    metric: string,
    value: number,
    tags?: Record<string, string>,
    context?: LogContext
  ): void {
    this.logger.info('Business Metric', {
      metric,
      value,
      tags,
      ...context
    });
  }

  /**
   * Log performance metric
   */
  logPerformanceMetric(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
    context?: LogContext
  ): void {
    this.logger.info('Performance Metric', {
      operation,
      duration,
      metadata,
      ...context
    });
  }

  /**
   * Log user action
   */
  logUserAction(
    userId: string,
    action: string,
    metadata?: Record<string, any>,
    context?: LogContext
  ): void {
    this.logger.info('User Action', {
      userId,
      action,
      timestamp: new Date().toISOString(),
      metadata,
      ...context
    });
  }

  /**
   * Log webhook event
   */
  logWebhookEvent(
    source: string,
    eventType: string,
    success: boolean,
    context?: LogContext
  ): void {
    this.logger.info('Webhook Event', {
      source,
      eventType,
      success,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * Log integration event
   */
  logIntegrationEvent(
    platform: string,
    action: string,
    success: boolean,
    duration?: number,
    context?: LogContext
  ): void {
    this.logger.info('Integration Event', {
      platform,
      action,
      success,
      duration,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * Log chart generation event
   */
  logChartGeneration(
    username: string,
    chartId: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ): void {
    this.logger.info('Chart Generation', {
      username,
      chartId,
      duration,
      success,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * Log image generation event
   */
  logImageGeneration(
    chartId: string,
    platform: string,
    theme: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ): void {
    this.logger.info('Image Generation', {
      chartId,
      platform,
      theme,
      duration,
      success,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * Log rate limit event
   */
  logRateLimitEvent(
    identifier: string,
    limit: number,
    remaining: number,
    context?: LogContext
  ): void {
    this.logger.warn('Rate Limit', {
      identifier,
      limit,
      remaining,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * Log system health check
   */
  logHealthCheck(
    service: string,
    status: 'healthy' | 'unhealthy',
    details?: Record<string, any>
  ): void {
    const level = status === 'healthy' ? 'info' : 'error';
    this.logger.log(level, 'Health Check', {
      service,
      status,
      timestamp: new Date().toISOString(),
      details
    });
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): AdvancedLogger {
    const childLogger = new AdvancedLogger(this.config) as any;
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }

  /**
   * Get logger instance for advanced usage
   */
  getWinstonLogger(): winston.Logger {
    return this.logger;
  }

  /**
   * Update log level
   */
  setLevel(level: string): void {
    this.config.level = level;
    this.logger.level = level;
    this.logger.transports.forEach(transport => {
      transport.level = level;
    });
  }

  /**
   * Add custom transport
   */
  addTransport(transport: winston.transport): void {
    this.logger.add(transport);
  }

  /**
   * Remove transport
   */
  removeTransport(transport: winston.transport): void {
    this.logger.remove(transport);
  }

  /**
   * Get log statistics
   */
  getStats(): {
    level: string;
    transports: number;
    memoryUsage: NodeJS.MemoryUsage;
  } {
    return {
      level: this.logger.level,
      transports: this.logger.transports.length,
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Stream logs for external services
   */
  createLogStream(): NodeJS.ReadableStream {
    return new winston.transports.Stream({
      stream: process.stdout,
      format: winston.format.json()
    });
  }

  /**
   * Query logs (would need additional setup for log querying)
   */
  async queryLogs(
    options: {
      level?: string;
      from?: Date;
      to?: Date;
      limit?: number;
      search?: string;
    }
  ): Promise<any[]> {
    // This would require integration with log management systems
    // like Elasticsearch, Loki, or cloud logging services
    this.info('Log query requested', { options });
    return [];
  }

  /**
   * Export logs to external service
   */
  async exportLogs(
    format: 'json' | 'csv' | 'txt',
    from?: Date,
    to?: Date
  ): Promise<Buffer> {
    // This would implement log export functionality
    this.info('Log export requested', { format, from, to });
    return Buffer.from('Log export functionality not implemented');
  }

  /**
   * Cleanup old logs
   */
  async cleanupLogs(olderThanDays: number): Promise<void> {
    this.info('Log cleanup started', { olderThanDays });
    // This would implement log cleanup based on retention policies
  }

  /**
   * Rotate logs
   */
  rotateLogs(): void {
    this.info('Log rotation requested');
    // This would trigger log rotation
  }
}

// Create default logger instance
export const logger = new AdvancedLogger({
  level: process.env.LOG_LEVEL || 'info',
  environment: process.env.NODE_ENV || 'development',
  service: 'developer-birth-chart-api',
  version: process.env.npm_package_version || '1.0.0',
  enableConsole: process.env.NODE_ENV !== 'production',
  enableFile: process.env.NODE_ENV === 'production',
  enableExternal: !!process.env.EXTERNAL_LOGGING_ENABLED,
  externalService: (process.env.EXTERNAL_LOGGING_SERVICE as any) || 'sentry'
});

// Request logger middleware
export function requestLogger() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    req.id = req.id || generateRequestId();

    // Log request start
    logger.info('Request started', {
      requestId: req.id,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;

      logger.info('Request completed', {
        requestId: req.id,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration
      });

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

// Generate unique request ID
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Error logging middleware
export function errorLogger() {
  return (error: Error, req: any, res: any, next: any) => {
    logger.error('Unhandled error', {
      requestId: req.id,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      error: error.message,
      stack: error.stack
    });

    next(error);
  };
}