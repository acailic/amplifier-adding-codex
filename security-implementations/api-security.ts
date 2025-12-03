/**
 * Elite-Grade API Security for Vizualni-Admin
 * Implements rate limiting, authentication, and secure communication
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Security configuration
export const API_SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  JWT_EXPIRES_IN: '1h',
  JWT_ISSUER: 'vizualni-admin',
  
  // API keys
  API_KEY_HEADER: 'X-API-Key',
  BEARER_TOKEN_HEADER: 'Authorization',
  
  // Request size limits
  MAX_REQUEST_SIZE: 1024 * 1024, // 1MB
  MAX_RESPONSE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Timeout configurations
  REQUEST_TIMEOUT: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 10000, // 10 seconds
};

// Allowlisted domains for API calls
export const ALLOWED_API_DOMAINS = [
  'api.vizualni-admin.com',
  'data.gov.rs',
  'api.github.com',
  'cdn.jsdelivr.net'
];

// Rate limiter implementation
export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  isAllowed(clientId: string, limit: number = API_SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS): boolean {
    const now = Date.now();
    const windowStart = now - API_SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    // Get existing requests for this client
    const clientRequests = this.requests.get(clientId) || [];
    
    // Remove old requests outside the window
    const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= limit) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(clientId, validRequests);
    
    return true;
  }
  
  getRemainingRequests(clientId: string): number {
    const now = Date.now();
    const windowStart = now - API_SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    const clientRequests = this.requests.get(clientId) || [];
    const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, API_SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS - validRequests.length);
  }
  
  clearExpiredEntries(): void {
    const now = Date.now();
    const windowStart = now - API_SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    for (const [clientId, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(clientId);
      } else {
        this.requests.set(clientId, validRequests);
      }
    }
  }
}

// JWT token management
export class TokenManager {
  static generateToken(payload: Record<string, any>, expiresIn: string = API_SECURITY_CONFIG.JWT_EXPIRES_IN): string {
    return jwt.sign(payload, API_SECURITY_CONFIG.JWT_SECRET, {
      expiresIn,
      issuer: API_SECURITY_CONFIG.JWT_ISSUER,
      audience: 'vizualni-admin-users'
    });
  }
  
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, API_SECURITY_CONFIG.JWT_SECRET, {
        issuer: API_SECURITY_CONFIG.JWT_ISSUER,
        audience: 'vizualni-admin-users'
      });
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }
  
  static refreshToken(refreshToken: string): string {
    const payload = this.verifyToken(refreshToken);
    
    // Remove standard JWT claims
    const { iat, exp, iss, aud, ...userPayload } = payload;
    
    return this.generateToken(userPayload);
  }
}

// Secure HTTP client
export class SecureApiClient {
  private rateLimiter = new RateLimiter();
  private baseUrl: string;
  private apiKey?: string;
  private token?: string;
  
  constructor(config: SecureApiConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.token = config.token;
    
    // Validate URL is allowed
    this.validateBaseUrl();
  }
  
  private validateBaseUrl(): void {
    try {
      const url = new URL(this.baseUrl);
      
      if (!ALLOWED_API_DOMAINS.includes(url.hostname)) {
        throw new Error(`Domain not allowed: ${url.hostname}`);
      }
      
      if (url.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are allowed');
      }
    } catch (error) {
      throw new Error(`Invalid base URL: ${error.message}`);
    }
  }
  
  private getClientId(): string {
    // Generate a unique client ID for rate limiting
    return crypto.createHash('sha256')
      .update(this.apiKey || this.token || 'anonymous')
      .digest('hex');
  }
  
  private async makeRequest(endpoint: string, options: RequestOptions = {}): Promise<Response> {
    const clientId = this.getClientId();
    
    // Check rate limit
    if (!this.rateLimiter.isAllowed(clientId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Validate endpoint
    const fullUrl = `${this.baseUrl}${endpoint}`;
    this.validateEndpoint(fullUrl);
    
    // Prepare secure headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'User-Agent': 'vizualni-admin/1.0.0',
      ...options.headers
    });
    
    // Add authentication
    if (this.apiKey) {
      headers.set(API_SECURITY_CONFIG.API_KEY_HEADER, this.apiKey);
    }
    
    if (this.token) {
      headers.set(API_SECURITY_CONFIG.BEARER_TOKEN_HEADER, `Bearer ${this.token}`);
    }
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers,
      signal: AbortSignal.timeout(API_SECURITY_CONFIG.REQUEST_TIMEOUT),
      ...options
    };
    
    // Validate request body
    if (options.body) {
      this.validateRequestBody(options.body);
    }
    
    try {
      const response = await fetch(fullUrl, requestOptions);
      
      // Validate response
      await this.validateResponse(response);
      
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
  
  private validateEndpoint(url: string): void {
    try {
      const parsedUrl = new URL(url);
      
      if (!ALLOWED_API_DOMAINS.includes(parsedUrl.hostname)) {
        throw new Error(`Endpoint domain not allowed: ${parsedUrl.hostname}`);
      }
    } catch (error) {
      throw new Error(`Invalid endpoint: ${error.message}`);
    }
  }
  
  private validateRequestBody(body: any): void {
    const bodyString = JSON.stringify(body);
    
    if (bodyString.length > API_SECURITY_CONFIG.MAX_REQUEST_SIZE) {
      throw new Error('Request body too large');
    }
    
    // Check for potentially dangerous content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(bodyString)) {
        throw new Error('Request contains potentially dangerous content');
      }
    }
  }
  
  private async validateResponse(response: Response): Promise<void> {
    const contentLength = response.headers.get('content-length');
    
    if (contentLength && parseInt(contentLength) > API_SECURITY_CONFIG.MAX_RESPONSE_SIZE) {
      throw new Error('Response too large');
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    const allowedTypes = [
      'application/json',
      'text/plain',
      'text/html',
      'application/octet-stream'
    ];
    
    if (contentType && !allowedTypes.some(type => contentType.includes(type))) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    
    // Check response status
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
  
  // Public API methods
  async get(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<any> {
    const response = await this.makeRequest(endpoint, { ...options, method: 'GET' });
    return response.json();
  }
  
  async post(endpoint: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<any> {
    const response = await this.makeRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async put(endpoint: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<any> {
    const response = await this.makeRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async delete(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<any> {
    const response = await this.makeRequest(endpoint, { ...options, method: 'DELETE' });
    return response.json();
  }
}

// API Security middleware for Express
export const apiSecurityMiddleware = (req: any, res: any, next: any) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? '*' : 'https://vizualni-admin.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Validate request size
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength) > API_SECURITY_CONFIG.MAX_REQUEST_SIZE) {
    return res.status(413).json({ error: 'Request entity too large' });
  }
  
  next();
};

// Security monitoring
export class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;
  
  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(securityEvent);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Check for attack patterns
    this.detectAttackPatterns(securityEvent);
  }
  
  private detectAttackPatterns(event: SecurityEvent): void {
    // Detect brute force attacks
    if (event.type === 'auth_failure') {
      const recentFailures = this.events
        .filter(e => e.type === 'auth_failure' && e.clientId === event.clientId)
        .filter(e => Date.now() - new Date(e.timestamp).getTime() < 300000); // 5 minutes
      
      if (recentFailures.length > 5) {
        this.raiseAlert('Brute force attack detected', 'HIGH', event);
      }
    }
    
    // Detect suspicious API calls
    if (event.type === 'api_call' && event.endpoint?.includes('/admin')) {
      const recentAdminCalls = this.events
        .filter(e => e.type === 'api_call' && e.endpoint?.includes('/admin'))
        .filter(e => Date.now() - new Date(e.timestamp).getTime() < 60000); // 1 minute
      
      if (recentAdminCalls.length > 20) {
        this.raiseAlert('Suspicious admin activity detected', 'MEDIUM', event);
      }
    }
  }
  
  private raiseAlert(message: string, severity: string, event: SecurityEvent): void {
    console.error(`SECURITY ALERT [${severity}]: ${message}`, {
      event,
      timestamp: new Date().toISOString()
    });
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Integration with monitoring service like Sentry, DataDog, etc.
    }
  }
  
  getRecentEvents(hours: number = 24): SecurityEvent[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.events.filter(e => new Date(e.timestamp).getTime() > cutoff);
  }
}

// Type definitions
interface SecureApiConfig {
  baseUrl: string;
  apiKey?: string;
  token?: string;
  timeout?: number;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

interface SecurityEvent {
  type: 'auth_failure' | 'api_call' | 'xss_attempt' | 'rate_limit_exceeded';
  clientId?: string;
  endpoint?: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
}

export default {
  RateLimiter,
  TokenManager,
  SecureApiClient,
  apiSecurityMiddleware,
  SecurityMonitor,
  API_SECURITY_CONFIG,
  ALLOWED_API_DOMAINS
};