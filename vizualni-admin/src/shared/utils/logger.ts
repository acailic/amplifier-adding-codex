/**
 * Structured Logging System
 * Систем организованог логирања
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  feature?: string;
  userId?: string;
  sessionId?: string;
  error?: Error;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxLogEntries: number;
  bufferSize: number;
}

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableRemote: false,
      maxLogEntries: 1000,
      bufferSize: 100,
      ...config,
    };

    this.setupFlushTimer();
  }

  private setupFlushTimer() {
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.flushTimer = setInterval(() => {
        this.flushLogs();
      }, 5000); // Flush every 5 seconds
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      feature: this.getCurrentFeature(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      error,
    };

    // Add to buffer
    this.logBuffer.push(entry);

    // Trim buffer if too large
    if (this.logBuffer.length > this.config.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogEntries);
    }

    // Console output if enabled
    if (this.config.enableConsole && level >= this.config.level) {
      this.outputToConsole(entry);
    }

    // Flush buffer if it's full
    if (this.config.enableRemote && this.logBuffer.length >= this.config.bufferSize) {
      this.flushLogs();
    }
  }

  private outputToConsole(entry: LogEntry) {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${LogLevel[entry.level]}] [${entry.feature || 'unknown'}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.context);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.context);
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.error, entry.context);
        break;
    }
  }

  private getCurrentFeature(): string | undefined {
    // Try to infer current feature from URL or component stack
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/dashboard')) return 'dashboard';
      if (path.includes('/charts')) return 'charts';
      if (path.includes('/configurator')) return 'configurator';
      if (path.includes('/users')) return 'user-management';
      if (path.includes('/validation')) return 'data-validation';
    }
    return undefined;
  }

  private getUserId(): string | undefined {
    // Get user ID from auth context or localStorage
    return localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || undefined;
  }

  private getSessionId(): string | undefined {
    // Get or generate session ID
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private async flushLogs() {
    if (!this.config.enableRemote || !this.config.remoteEndpoint || this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
      });
    } catch (error) {
      // If remote logging fails, add logs back to buffer
      this.logBuffer.unshift(...logsToSend);
      console.warn('Failed to flush logs to remote endpoint:', error);
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Feature-specific logging methods
  featureDebug(feature: string, message: string, context?: Record<string, any>) {
    this.debug(message, { ...context, feature });
  }

  featureInfo(feature: string, message: string, context?: Record<string, any>) {
    this.info(message, { ...context, feature });
  }

  featureWarn(feature: string, message: string, context?: Record<string, any>) {
    this.warn(message, { ...context, feature });
  }

  featureError(feature: string, message: string, error?: Error, context?: Record<string, any>) {
    this.error(message, error, { ...context, feature });
  }

  // Performance logging
  performance(operation: string, duration: number, context?: Record<string, any>) {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      ...context,
      type: 'performance',
      operation,
      duration,
    });
  }

  // User action logging
  userAction(action: string, context?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      ...context,
      type: 'user_action',
      action,
    });
  }

  // Get recent logs
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  // Set log level
  setLevel(level: LogLevel) {
    this.config.level = level;
  }

  // Enable/disable remote logging
  setRemoteLogging(enabled: boolean, endpoint?: string) {
    this.config.enableRemote = enabled;
    if (endpoint) {
      this.config.remoteEndpoint = endpoint;
    }
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushLogs(); // Final flush
  }
}

// Create default logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.REACT_APP_LOG_ENDPOINT,
});

// Export logger class for custom instances
export { Logger };

// Performance measurement utility
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      logger.performance(operation, duration, context);
      resolve(result);
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      logger.performance(`${operation} (failed)`, duration, context);
      logger.error(`Performance error in ${operation}`, error as Error, context);
      reject(error);
    }
  });
}

// Performance hook for React
export function usePerformanceLogger(feature: string) {
  return (operation: string, fn: () => any | Promise<any>, context?: Record<string, any>) => {
    return measurePerformance(`${feature}:${operation}`, fn, context);
  };
}