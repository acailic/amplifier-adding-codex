/**
 * Data.gov.rs API Client
 * Production-ready client for Serbian government open data portal
 */

import type {
  DataGovRsConfig,
  ApiResponse,
  PaginatedResponse,
  DatasetMetadata,
  ResourceMetadata,
  Organization,
  SearchRequest,
  SearchResponse,
  CacheEntry,
  CacheStats,
  Webhook,
  WebhookPayload,
  BulkOperation,
  QualityMetrics,
  ValidationError,
  SerbianValidators,
  ValidationResult,
  RateLimitInfo,
  ApiError,
  SerbianInstitution,
  SerbianDocument,
  SerbianRegulation,
} from './types';

// ============================================================================
// CACHE IMPLEMENTATION
// ============================================================================

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private cleanupInterval?: NodeJS.Timeout;
  private stats: CacheStats = {
    size: 0,
    itemCount: 0,
    hitRate: 0,
    missRate: 0,
    evictionCount: 0,
    memoryUsage: 0,
    oldestEntry: 0,
    newestEntry: 0,
    hitsByTag: {},
    popularKeys: [],
  };

  constructor(
    private config: DataGovRsConfig['cache'],
    private monitoring: DataGovRsConfig['monitoring']
  ) {
    this.maxSize = config.maxSize;
    this.startCleanup();
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.updateStats('miss');
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.updateStats('miss');
      return null;
    }

    entry.lastAccessed = Date.now();
    entry.hits++;
    this.updateStats('hit', entry);
    
    return entry.data;
  }

  async set<T>(
    key: string, 
    data: T, 
    ttl: number = this.config.defaultTTL,
    tags: string[] = []
  ): Promise<void> {
    const now = Date.now();
    const size = this.calculateSize(data);

    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: now,
      expiresAt: now + ttl,
      size,
      hits: 0,
      lastAccessed: now,
      source: 'api',
      metadata: {
        ttl,
        tags,
        priority: 1,
      },
    };

    this.cache.set(key, entry);
    this.updateStats('set', entry);
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata?.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.stats.itemCount = 0;
    this.stats.size = 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictionCount++;
    }
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length * 2;
  }

  private updateStats(operation: 'hit' | 'miss' | 'set', entry?: CacheEntry<any>): void {
    const total = this.stats.hitRate + this.stats.missRate;
    
    switch (operation) {
      case 'hit':
        this.stats.hitRate = ((this.stats.hitRate * total) + 1) / (total + 1);
        break;
      case 'miss':
        this.stats.missRate = ((this.stats.missRate * total) + 1) / (total + 1);
        break;
      case 'set':
        if (entry) {
          this.stats.itemCount = this.cache.size;
          this.stats.size += entry.size;
          this.stats.oldestEntry = Math.min(this.stats.oldestEntry, entry.timestamp);
          this.stats.newestEntry = Math.max(this.stats.newestEntry, entry.timestamp);
          
          entry.metadata?.tags.forEach(tag => {
            this.stats.hitsByTag[tag] = (this.stats.hitsByTag[tag] || 0) + 1;
          });
        }
        break;
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60000);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// ============================================================================
// RATE LIMITER
// ============================================================================

class RateLimiter {
  private requests: number[] = [];
  private requestCounts = {
    minute: 0,
    hour: 0,
    day: 0,
  };

  constructor(private config: DataGovRsConfig['rateLimit']) {}

  async checkLimit(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const now = Date.now();
    const oneMinute = 60 * 1000;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;

    this.requests = this.requests.filter(time => {
      const age = now - time;
      return age < oneDay;
    });

    this.requestCounts = {
      minute: this.requests.filter(time => now - time < oneMinute).length,
      hour: this.requests.filter(time => now - time < oneHour).length,
      day: this.requests.length,
    };

    if (this.requestCounts.minute >= this.config.requestsPerMinute) {
      const waitTime = oneMinute - (now - this.requests[0]);
      throw new RateLimitError('Minute limit exceeded', waitTime);
    }

    if (this.requestCounts.hour >= this.config.requestsPerHour) {
      const waitTime = oneHour - (now - this.requests[0]);
      throw new RateLimitError('Hour limit exceeded', waitTime);
    }

    if (this.requestCounts.day >= this.config.requestsPerDay) {
      const waitTime = oneDay - (now - this.requests[0]);
      throw new RateLimitError('Daily limit exceeded', waitTime);
    }

    this.requests.push(now);
  }

  getStats() {
    return {
      ...this.requestCounts,
      limits: {
        minute: this.config.requestsPerMinute,
        hour: this.config.requestsPerHour,
        day: this.config.requestsPerDay,
      },
    };
  }
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

class DataGovRsError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'DataGovRsError';
  }
}

class RateLimitError extends DataGovRsError {
  constructor(message: string, public retryAfter: number) {
    super(message, 'RATE_LIMIT_EXCEEDED', { retryAfter }, 429);
    this.name = 'RateLimitError';
  }
}

class ValidationError extends DataGovRsError {
  constructor(
    message: string,
    public field: string,
    public value: any,
    public rule?: string
  ) {
    super(message, 'VALIDATION_ERROR', { field, value, rule }, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends DataGovRsError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR', undefined, 401);
    this.name = 'AuthenticationError';
  }
}

class NotFoundError extends DataGovRsError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`, 'NOT_FOUND', { resource, id }, 404);
    this.name = 'NotFoundError';
  }
}

// ============================================================================
// SERBIAN VALIDATORS
// ============================================================================

class SerbianDataValidators implements SerbianValidators {
  jmbg(jmbg: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (!/^\d{13}$/.test(jmbg)) {
      errors.push({
        field: 'jmbg',
        message: 'JMBG must be exactly 13 digits',
        messageSr: 'JMBG mora imati tačno 13 cifara',
        value: jmbg,
        rule: 'format',
      });
    }

    if (jmbg.length === 13) {
      const day = parseInt(jmbg.substring(0, 2));
      const month = parseInt(jmbg.substring(2, 4));

      if (day < 1 || day > 31) {
        errors.push({
          field: 'jmbg',
          message: 'Invalid day in JMBG',
          messageSr: 'Nevalidan dan u JMBG',
          value: day,
          rule: 'date_range',
        });
      }

      if (month < 1 || month > 12) {
        errors.push({
          field: 'jmbg',
          message: 'Invalid month in JMBG',
          messageSr: 'Nevalidan mesec u JMBG',
          value: month,
          rule: 'date_range',
        });
      }
    }

    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.map(w => ({
        field: 'jmbg',
        message: w,
        severity: 'low' as const,
      })),
      score,
    };
  }

  pib(pib: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (!/^\d{9}$/.test(pib)) {
      errors.push({
        field: 'pib',
        message: 'PIB must be exactly 9 digits',
        messageSr: 'PIB mora imati tačno 9 cifara',
        value: pib,
        rule: 'format',
      });
    }

    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.map(w => ({
        field: 'pib',
        message: w,
        severity: 'low' as const,
      })),
      score,
    };
  }

  maticniBroj(maticniBroj: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (!/^\d{8}$/.test(maticniBroj)) {
      errors.push({
        field: 'maticniBroj',
        message: 'Maticni broj must be exactly 8 digits',
        messageSr: 'Matični broj mora imati tačno 8 cifara',
        value: maticniBroj,
        rule: 'format',
      });
    }

    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.map(w => ({
        field: 'maticniBroj',
        message: w,
        severity: 'low' as const,
      })),
      score,
    };
  }

  postalCode(postalCode: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (!/^\d{5}$/.test(postalCode)) {
      errors.push({
        field: 'postalCode',
        message: 'Postal code must be exactly 5 digits',
        messageSr: 'Poštanski broj mora imati tačno 5 cifara',
        value: postalCode,
        rule: 'format',
      });
    }

    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.map(w => ({
        field: 'postalCode',
        message: w,
        severity: 'low' as const,
      })),
      score,
    };
  }

  phoneNumber(phone: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const serbianPhoneRegex = /^(\+381|0)[1-9][0-9]{7,8}$/;
    
    if (!serbianPhoneRegex.test(cleanPhone)) {
      errors.push({
        field: 'phone',
        message: 'Invalid Serbian phone number format',
        messageSr: 'Nevalidan format srpskog telefonskog broja',
        value: phone,
        rule: 'format',
      });
    }

    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.map(w => ({
        field: 'phone',
        message: w,
        severity: 'low' as const,
      })),
      score,
    };
  }

  licensePlate(plate: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    const serbianPlateRegex = /^[A-Z]{2}\s?\d{3}-[A-Z]{2}\d{0,1}$/;
    if (!serbianPlateRegex.test(plate.toUpperCase())) {
      errors.push({
        field: 'licensePlate',
        message: 'Invalid Serbian license plate format',
        messageSr: 'Nevalidan format srpske registarske tablice',
        value: plate,
        rule: 'format',
      });
    }

    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.map(w => ({
        field: 'licensePlate',
        message: w,
        severity: 'low' as const,
      })),
      score,
    };
  }

  oib(oib: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (!/^\d{11}$/.test(oib)) {
      errors.push({
        field: 'oib',
        message: 'OIB must be exactly 11 digits',
        messageSr: 'OIB mora imati tačno 11 cifara',
        value: oib,
        rule: 'format',
      });
    }

    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.map(w => ({
        field: 'oib',
        message: w,
        severity: 'low' as const,
      })),
      score,
    };
  }
}

// ============================================================================
// MAIN CLIENT CLASS
// ============================================================================

export class DataGovRsClient {
  private cache: CacheManager;
  private rateLimiter: RateLimiter;
  private validators: SerbianDataValidators;

  constructor(private config: DataGovRsConfig) {
    this.cache = new CacheManager(config.cache, config.monitoring);
    this.rateLimiter = new RateLimiter(config.rateLimit);
    this.validators = new SerbianDataValidators();
    
    if (config.monitoring.enabled) {
      this.startHealthChecks();
    }
  }

  async getDatasets(
    page: number = 1,
    pageSize: number = 20,
    filters?: any
  ): Promise<PaginatedResponse<DatasetMetadata>> {
    const cacheKey = 'datasets:' + page + ':' + pageSize + ':' + JSON.stringify(filters || {});
    
    const cached = await this.cache.get<PaginatedResponse<DatasetMetadata>>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.makeRequest<PaginatedResponse<DatasetMetadata>>(
      '/datasets',
      'GET',
      undefined,
      { page, pageSize, ...filters }
    );

    await this.cache.set(cacheKey, response, 300000);

    return response;
  }

  async getDataset(id: string): Promise<ApiResponse<DatasetMetadata>> {
    const cacheKey = 'dataset:' + id;
    
    const cached = await this.cache.get<ApiResponse<DatasetMetadata>>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.makeRequest<ApiResponse<DatasetMetadata>>(
      '/datasets/' + id
    );

    await this.cache.set(cacheKey, response, 600000);

    return response;
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    const cacheKey = 'search:' + JSON.stringify(request);
    
    const cached = await this.cache.get<SearchResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.makeRequest<SearchResponse>(
      '/search',
      'POST',
      request
    );

    await this.cache.set(cacheKey, response, 120000);

    return response;
  }

  async validateDataset(dataset: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (!dataset.name) {
      errors.push({
        field: 'name',
        message: 'Dataset name is required',
        messageSr: 'Naziv skupa podataka je obavezan',
        value: dataset.name,
        rule: 'required',
      });
    }

    if (!dataset.description) {
      errors.push({
        field: 'description',
        message: 'Dataset description is required',
        messageSr: 'Opis skupa podataka je obavezan',
        value: dataset.description,
        rule: 'required',
      });
    }

    const score = Math.max(0, 100 - (errors.length * 10) - (warnings.length * 2));

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.map(w => ({
        field: 'dataset',
        message: w,
        severity: 'low' as const,
      })),
      score,
    };
  }

  validateSerbianData(type: string, value: string): ValidationResult {
    switch (type) {
      case 'jmbg':
        return this.validators.jmbg(value);
      case 'pib':
        return this.validators.pib(value);
      case 'maticniBroj':
        return this.validators.maticniBroj(value);
      case 'postalCode':
        return this.validators.postalCode(value);
      case 'phoneNumber':
        return this.validators.phoneNumber(value);
      case 'licensePlate':
        return this.validators.licensePlate(value);
      case 'oib':
        return this.validators.oib(value);
      default:
        return {
          valid: false,
          errors: [{
            field: type,
            message: 'Unknown validation type: ' + type,
            messageSr: 'Nepoznat tip validacije: ' + type,
            value,
            rule: 'unknown_type',
          }],
          warnings: [],
          score: 0,
        };
    }
  }

  async getHealthStatus(): Promise<ApiResponse<any>> {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cache: this.cache.getStats(),
      rateLimiter: this.rateLimiter.getStats(),
    };

    return {
      success: true,
      data: health,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any,
    params?: any,
    responseType: 'json' | 'blob' = 'json'
  ): Promise<T> {
    await this.rateLimiter.checkLimit();

    const url = new URL(endpoint, this.config.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'User-Agent': 'data-gov-rs-client/1.0',
      'Accept-Language': this.config.localization.defaultLanguage + ',en;q=0.9',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = 'Bearer ' + this.config.apiKey;
    }

    if (data && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      if (responseType === 'blob') {
        return (await response.blob()) as T;
      }

      return (await response.json()) as T;

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new DataGovRsError(
          'Request timeout',
          'REQUEST_TIMEOUT',
          { timeout: this.config.timeout }
        );
      }

      throw error;
    }
  }

  private async handleErrorResponse(response: Response): Promise<void> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = {};
    }

    const message = errorData.message || 'HTTP ' + response.status;
    const code = errorData.code || 'HTTP_ERROR';

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message);
      case 404:
        throw new NotFoundError('resource', 'unknown');
      case 429:
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError(
          message,
          retryAfter ? parseInt(retryAfter) * 1000 : 60000
        );
      default:
        throw new DataGovRsError(message, code, errorData, response.status);
    }
  }

  private startHealthChecks(): void {
    setInterval(async () => {
      try {
        const health = await this.getHealthStatus();
        
        const alertThresholds = this.config.monitoring.alertThresholds;
        
        if (health.data?.cache?.hitRate < alertThresholds.cacheHitRate) {
          console.warn('Cache hit rate below threshold: ' + health.data.cache.hitRate + '%');
        }

      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, this.config.monitoring.healthCheckInterval);
  }

  destroy(): void {
    this.cache.destroy();
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createDataGovRsClient(config: Partial<DataGovRsConfig> = {}): DataGovRsClient {
  const defaultConfig: DataGovRsConfig = {
    baseURL: 'https://data.gov.rs/api/v1',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    cache: {
      enabled: true,
      defaultTTL: 300000,
      maxSize: 1000,
      strategy: 'lru',
      storage: 'memory',
      compression: false,
      compressionThreshold: 1024,
    },
    rateLimit: {
      enabled: true,
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burstLimit: 10,
      backoffStrategy: 'exponential',
      retryAfterBase: 1000,
      maxRetryDelay: 60000,
    },
    webhooks: {
      enabled: false,
      secret: '',
      maxRetries: 3,
      timeout: 10000,
      batchSize: 100,
      flushInterval: 5000,
      queueSize: 1000,
    },
    quality: {
      enabled: true,
      thresholds: {
        completeness: 80,
        accuracy: 90,
        consistency: 85,
        timeliness: 80,
        validity: 95,
        overall: 85,
      },
      assessmentInterval: 86400000,
      autoReject: false,
      notifications: true,
    },
    localization: {
      defaultLanguage: 'sr',
      fallbackLanguage: 'en',
      dateFormat: 'DD.MM.YYYY.',
      numberFormat: 'sr-RS',
      currency: 'RSD',
      timezone: 'Europe/Belgrade',
      translationCache: true,
    },
    security: {
      validateSSLCertificates: true,
      allowedHosts: ['data.gov.rs', 'api.data.gov.rs'],
      dataRetentionDays: 90,
      auditLogging: true,
      sensitiveDataMasking: true,
      apiKeyRotation: 2592000,
      rateLimiting: true,
    },
    monitoring: {
      enabled: true,
      loggingLevel: 'info',
      performanceTracking: true,
      healthCheckInterval: 300000,
      alertThresholds: {
        responseTime: 5000,
        errorRate: 5,
        cacheHitRate: 80,
        memoryUsage: 500 * 1024 * 1024,
      },
    },
  };

  const mergedConfig = {
    ...defaultConfig,
    ...config,
    cache: { ...defaultConfig.cache, ...config.cache },
    rateLimit: { ...defaultConfig.rateLimit, ...config.rateLimit },
    webhooks: { ...defaultConfig.webhooks, ...config.webhooks },
    quality: { ...defaultConfig.quality, ...config.quality },
    localization: { ...defaultConfig.localization, ...config.localization },
    security: { ...defaultConfig.security, ...config.security },
    monitoring: { ...defaultConfig.monitoring, ...config.monitoring },
  };

  return new DataGovRsClient(mergedConfig);
}

export default DataGovRsClient;

export {
  DataGovRsError,
  RateLimitError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  CacheManager,
  RateLimiter,
  SerbianDataValidators,
};

export type {
  DataGovRsConfig,
  ApiResponse,
  PaginatedResponse,
  DatasetMetadata,
  ResourceMetadata,
  Organization,
  SearchRequest,
  SearchResponse,
  Webhook,
  BulkOperation,
  QualityMetrics,
  SerbianInstitution,
  SerbianDocument,
  SerbianRegulation,
};
