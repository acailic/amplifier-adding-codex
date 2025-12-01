import { z } from 'zod';

// Simple HTML sanitization function (fallback when DOMPurify is not available)
function simpleSanitizeHTML(input: string, allowedTags: string[] = []): string {
  if (typeof input !== 'string') {
    throw new Error('HTML input must be a string');
  }

  // Remove all HTML tags if none are allowed
  if (allowedTags.length === 0) {
    return input.replace(/<[^>]*>/g, '');
  }

  // Basic sanitization for allowed tags
  const tagPattern = '(?!\\\\/?(' + allowedTags.join('|') + ')\\\\b)[^>]*>';
  const tagRegex = new RegExp('<' + tagPattern + '>', 'gi');
  return input.replace(tagRegex, '');
}

// Utility function to create a sanitizer configuration
const createSanitizerConfig = (allowHTML: boolean = false) => ({
  allowHTML,
  allowedTags: allowHTML ? ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] : [],
});

// Enhanced string validation and sanitization
export function sanitizeString(input: unknown, maxLength: number = 1000, allowHTML: boolean = false): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Check for null bytes and other injection attempts
  if (input.includes('\0') || input.includes('\r') || input.includes('\n')) {
    throw new Error('Invalid characters in input');
  }

  // Check for potential SQL injection patterns
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bOR\b.*=.*\bOR\b)/i,
    /(\bAND\b.*=.*\bAND\b)/i,
    /(\bWHERE\b.*=.*\bOR\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(<script|javascript:|vbscript:|onload=|onerror=)/i
  ];

  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(input)) {
      throw new Error('Potentially malicious input detected');
    }
  }

  // Length validation
  if (input.length > maxLength) {
    throw new Error('Input exceeds maximum length of ' + maxLength + ' characters');
  }

  // Trim whitespace
  const trimmed = input.trim();

  // HTML sanitization
  const config = createSanitizerConfig(allowHTML);
  const sanitized = simpleSanitizeHTML(trimmed, config.allowedTags);

  return sanitized;
}

// Email validation with detailed checks
export function validateEmail(email: unknown): string {
  if (typeof email !== 'string') {
    throw new Error('Email must be a string');
  }

  const sanitized = sanitizeString(email.toLowerCase().trim(), 254);

  // Comprehensive email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  // Additional security checks
  if (sanitized.startsWith('.') || sanitized.endsWith('.')) {
    throw new Error('Invalid email format');
  }

  if (sanitized.includes('..')) {
    throw new Error('Invalid email format');
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /[\x00-\x1F\x7F]/, // Control characters
    /[<>]/, // HTML brackets
    /javascript:/i,
    /data:/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Invalid email format');
    }
  }

  return sanitized;
}

// UUID validation
export function validateUUID(uuid: unknown): string {
  if (typeof uuid !== 'string') {
    throw new Error('UUID must be a string');
  }

  const sanitized = sanitizeString(uuid.trim(), 36);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(sanitized)) {
    throw new Error('Invalid UUID format');
  }

  return sanitized;
}

// Password validation
export function validatePassword(password: unknown): string {
  if (typeof password !== 'string') {
    throw new Error('Password must be a string');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    throw new Error('Password must be less than 128 characters long');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    throw new Error('Password is too common. Please choose a stronger password.');
  }

  // Check for sufficient complexity
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (complexityScore < 3) {
    throw new Error('Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, special characters');
  }

  return password; // Don't sanitize passwords, just validate
}

// URL validation
export function validateURL(url: unknown): string {
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }

  const sanitized = sanitizeString(url.trim(), 2048);

  try {
    const parsedURL = new URL(sanitized);
    
    // Only allow specific protocols
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsedURL.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are allowed');
    }

    // Prevent localhost in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsedURL.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.')) {
        throw new Error('Localhost URLs are not allowed in production');
      }
    }

    return sanitized;
  } catch (error) {
    throw new Error('Invalid URL format');
  }
}

// Number validation with range checking
export function validateNumber(input: unknown, min: number = -Infinity, max: number = Infinity): number {
  const num = Number(input);
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid number');
  }

  if (num < min || num > max) {
    throw new Error('Number must be between ' + min + ' and ' + max);
  }

  return num;
}

// Date validation
export function validateDate(input: unknown): Date {
  if (typeof input === 'string') {
    const sanitized = sanitizeString(input.trim(), 100);
    const date = new Date(sanitized);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    
    return date;
  }
  
  if (input instanceof Date) {
    if (isNaN(input.getTime())) {
      throw new Error('Invalid date');
    }
    return input;
  }
  
  throw new Error('Date must be a string or Date object');
}

// Boolean validation
export function validateBoolean(input: unknown): boolean {
  if (typeof input === 'boolean') {
    return input;
  }
  
  if (typeof input === 'string') {
    const sanitized = sanitizeString(input.trim(), 10).toLowerCase();
    
    if (sanitized === 'true') return true;
    if (sanitized === 'false') return false;
    if (sanitized === '1') return true;
    if (sanitized === '0') return false;
  }
  
  throw new Error('Invalid boolean value');
}

// Array validation with item validation
export function validateArray<T>(
  input: unknown,
  itemValidator: (item: unknown) => T,
  maxLength: number = 100
): T[] {
  if (!Array.isArray(input)) {
    throw new Error('Input must be an array');
  }

  if (input.length > maxLength) {
    throw new Error('Array exceeds maximum length of ' + maxLength);
  }

  return input.map((item, index) => {
    try {
      return itemValidator(item);
    } catch (error) {
      throw new Error('Invalid item at index ' + index + ': ' + error.message);
    }
  });
}

// Object validation with property validation
export function validateObject(
  input: unknown,
  requiredProps: string[] = [],
  optionalProps: string[] = []
): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('Input must be an object');
  }

  const obj = input as Record<string, unknown>;
  const keys = Object.keys(obj);

  // Check for required properties
  for (const prop of requiredProps) {
    if (!(prop in obj)) {
      throw new Error('Missing required property: ' + prop);
    }
  }

  // Check for unexpected properties
  const allowedProps = [...requiredProps, ...optionalProps];
  const unexpectedProps = keys.filter(key => !allowedProps.includes(key));
  
  if (unexpectedProps.length > 0) {
    throw new Error('Unexpected properties: ' + unexpectedProps.join(', '));
  }

  return obj;
}

// Sanitize HTML content safely
export function sanitizeHTML(html: string, allowedTags: string[] = []): string {
  if (typeof html !== 'string') {
    throw new Error('HTML input must be a string');
  }

  return simpleSanitizeHTML(html, allowedTags);
}

// Phone number validation (basic)
export function validatePhone(phone: unknown): string {
  if (typeof phone !== 'string') {
    throw new Error('Phone number must be a string');
  }

  const sanitized = sanitizeString(phone.trim(), 20);
  
  // Remove all non-digit characters except + for international numbers
  const digitsOnly = sanitized.replace(/[^\d+]/g, '');
  
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    throw new Error('Phone number must be between 10 and 15 digits');
  }

  if (digitsOnly.startsWith('+')) {
    // International format
    if (!digitsOnly.match(/^\+\d{1,3}\d{6,14}$/)) {
      throw new Error('Invalid international phone number format');
    }
  } else {
    // Local format - assume US format for basic validation
    if (!digitsOnly.match(/^\d{10}$/)) {
      throw new Error('Invalid phone number format');
    }
  }

  return sanitized;
}

// File validation (basic checks)
export function validateFile(file: File, allowedTypes: string[], maxSize: number): void {
  if (!(file instanceof File)) {
    throw new Error('Invalid file object');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type ' + file.type + ' is not allowed');
  }

  if (file.size > maxSize) {
    throw new Error('File size exceeds maximum allowed size of ' + maxSize + ' bytes');
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension) {
    const mimeToExtension: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'application/pdf': 'pdf',
      'text/plain': 'txt'
    };

    if (mimeToExtension[file.type] && extension !== mimeToExtension[file.type]) {
      throw new Error('File extension does not match file type');
    }
  }
}

// Comprehensive validation schemas using Zod
export const commonSchemas = {
  email: z.string().email().max(254),
  uuid: z.string().uuid(),
  password: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  url: z.string().url().max(2048),
  phoneNumber: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number format'),
  nonEmptyString: z.string().min(1).max(1000),
  positiveInteger: z.number().int().positive(),
  boolean: z.boolean(),
  date: z.string().datetime(),
};

// Request body validation wrapper
export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => err.path.join('.') + ': ' + err.message);
        throw new Error('Validation failed: ' + errors.join(', '));
      }
      throw error;
    }
  };
}
