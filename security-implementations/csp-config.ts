/**
 * Content Security Policy Configuration for Vizualni-Admin
 * Provides elite-grade security against XSS, data injection, and other attacks
 */

export interface CSPConfig {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'font-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'frame-ancestors': string[];
  'base-uri': string[];
  'form-action': string[];
  'upgrade-insecure-requests': string[];
}

export const PRODUCTION_CSP: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'", 
    "'unsafe-inline'", // Required for React development
    "https://cdn.jsdelivr.net",
    "https://unpkg.com"
  ],
  'style-src': [
    "'self'", 
    "'unsafe-inline'", // Required for CSS-in-JS
    "https://fonts.googleapis.com"
  ],
  'font-src': [
    "'self'", 
    "https://fonts.gstatic.com"
  ],
  'img-src': [
    "'self'", 
    "data:", // Required for base64 images in charts
    "https:" // Allow secure external images
  ],
  'connect-src': [
    "'self'",
    "https://api.vizualni-admin.com",
    "https://data.gov.rs", // Official Serbian data source
    "wss://api.vizualni-admin.com" // WebSocket connections
  ],
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [] // Force HTTPS
};

export const DEVELOPMENT_CSP: CSPConfig = {
  ...PRODUCTION_CSP,
  'script-src': [
    ...PRODUCTION_CSP['script-src'],
    "'unsafe-eval'", // Required for development tools
    "http://localhost:*",
    "ws://localhost:*"
  ],
  'connect-src': [
    ...PRODUCTION_CSP['connect-src'],
    "http://localhost:*",
    "ws://localhost:*"
  ]
};

export const generateCSPHeader = (config: CSPConfig): string => {
  return Object.entries(config)
    .map(([directive, sources]) => {
      const sourceList = sources.join(' ');
      return `${directive} ${sourceList}`;
    })
    .join('; ');
};

export const getCSPHeader = (isDevelopment: boolean = false): string => {
  const config = isDevelopment ? DEVELOPMENT_CSP : PRODUCTION_CSP;
  return generateCSPHeader(config);
};

// For Next.js middleware or Express middleware
export const cspMiddleware = (isDevelopment: boolean = false) => {
  return (req: any, res: any, next: any) => {
    const cspHeader = getCSPHeader(isDevelopment);
    res.setHeader('Content-Security-Policy', cspHeader);
    next();
  };
};

// For React helmet or manual meta tag injection
export const CSPMetaTag = (isDevelopment: boolean = false) => {
  const cspValue = getCSPHeader(isDevelopment);
  return {
    'http-equiv': 'Content-Security-Policy',
    content: cspValue
  };
};