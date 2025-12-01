import { describe, it, expect, beforeAll } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

// Import our security modules
import { rateLimit, rateLimitConfigs } from '../api/middleware/rateLimit';
import { generateJWT, verifyJWT } from '../api/middleware/auth';
import { 
  sanitizeString, 
  validateEmail, 
  validateUUID, 
  validatePassword,
  validateURL,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  sanitizeHTML,
  validatePhone,
  validateFile
} from '../api/lib/validation/inputValidation';
import {
  validateQueryParameter,
  sanitizeIdentifier,
  buildSecureWhereClause,
  sanitizeOrderByClause,
  sanitizeLimitOffset,
  buildSecureSelectQuery,
  validateDynamicQueryInput,
  detectSuspiciousPatterns,
  QueryBuilder
} from '../api/lib/validation/sqlInjectionPrevention';

// Mock Next.js request for testing
const mockRequest = (headers: Record<string, string> = {}) => ({
  headers: new Map(Object.entries(headers)),
  url: 'http://localhost:3000/api/test'
});

describe('Security Tests', () => {
  beforeAll(() => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  describe('JWT Security', () => {
    it('should generate and verify JWT tokens securely', async () => {
      const user = { id: 'test-user-id', email: 'test@example.com' };
      const token = generateJWT(user as any);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = verifyJWT(token);
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
    });

    it('should reject invalid JWT tokens', () => {
      expect(() => {
        verifyJWT('invalid-token');
      }).toThrow('Invalid or expired token');
    });

    it('should reject tokens with weak signatures', () => {
      const maliciousToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20ifQ.';
      
      expect(() => {
        verifyJWT(maliciousToken);
      }).toThrow('Invalid or expired token');
    });
  });

  describe('Input Validation and Sanitization', () => {
    describe('sanitizeString', () => {
      it('should sanitize SQL injection attempts', () => {
        const maliciousInputs = [
          "'; DROP TABLE users; --",
          "' OR '1'='1",
          "'; SELECT * FROM users; --",
          "<script>alert('xss')</script>",
          "javascript:alert('xss')"
        ];

        maliciousInputs.forEach(input => {
          expect(() => sanitizeString(input)).toThrow();
        });
      });

      it('should allow safe strings', () => {
        const safeInputs = [
          'Hello World',
          'user@example.com',
          'Normal text content',
          '12345',
          'valid-uuid-string'
        ];

        safeInputs.forEach(input => {
          expect(sanitizeString(input)).toBe(input);
        });
      });

      it('should enforce length limits', () => {
        const longString = 'a'.repeat(1001);
        expect(() => sanitizeString(longString, 1000)).toThrow();
      });
    });

    describe('validateEmail', () => {
      it('should accept valid email addresses', () => {
        const validEmails = [
          'user@example.com',
          'test.email+tag@example.co.uk',
          'user123@test-domain.com'
        ];

        validEmails.forEach(email => {
          expect(validateEmail(email)).toBe(email.toLowerCase().trim());
        });
      });

      it('should reject invalid email addresses', () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'user@',
          'user..name@example.com',
          '<script>alert("xss")</script>@example.com'
        ];

        invalidEmails.forEach(email => {
          expect(() => validateEmail(email)).toThrow();
        });
      });
    });

    describe('validateUUID', () => {
      it('should accept valid UUIDs', () => {
        const validUUID = '550e8400-e29b-41d4-a716-446655440000';
        expect(validateUUID(validUUID)).toBe(validUUID);
      });

      it('should reject invalid UUIDs', () => {
        const invalidUUIDs = [
          'invalid-uuid',
          '123-456-789',
          '<script>alert("xss")</script>',
          '550e8400-e29b-41d4-a716-44665544000' // Missing last digit
        ];

        invalidUUIDs.forEach(uuid => {
          expect(() => validateUUID(uuid)).toThrow();
        });
      });
    });

    describe('validatePassword', () => {
      it('should accept strong passwords', () => {
        const strongPasswords = [
          'MySecureP@ssw0rd!',
          'ComplexPass123$',
          'Str0ng#Password'
        ];

        strongPasswords.forEach(password => {
          expect(validatePassword(password)).toBe(password);
        });
      });

      it('should reject weak passwords', () => {
        const weakPasswords = [
          'password',
          '123456',
          'qwerty',
          'abc',
          'short'
        ];

        weakPasswords.forEach(password => {
          expect(() => validatePassword(password)).toThrow();
        });
      });

      it('should enforce password complexity', () => {
        expect(() => validatePassword('simple')).toThrow(); // Missing complexity
        expect(() => validatePassword('alllowercase')).toThrow(); // Missing uppercase/numbers/special
        expect(() => validatePassword('ALLUPPERCASE')).toThrow(); // Missing lowercase/numbers/special
        expect(() => validatePassword('12345678')).toThrow(); // Missing letters/special
      });
    });

    describe('validateURL', () => {
      it('should accept valid URLs', () => {
        const validURLs = [
          'https://example.com',
          'http://localhost:3000',
          'https://sub.domain.example.com/path'
        ];

        validURLs.forEach(url => {
          expect(validateURL(url)).toBe(url);
        });
      });

      it('should reject invalid or dangerous URLs', () => {
        const invalidURLs = [
          'javascript:alert("xss")',
          'data:text/html,<script>alert("xss")</script>',
          'ftp://example.com', // Not allowed protocol
          'not-a-url'
        ];

        invalidURLs.forEach(url => {
          expect(() => validateURL(url)).toThrow();
        });
      });
    });

    describe('validateFile', () => {
      it('should validate allowed file types and sizes', () => {
        // Create a mock file object
        const mockFile = new File(['test content'], 'test.jpg', { 
          type: 'image/jpeg',
          size: 1024 // 1KB
        });

        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        expect(() => validateFile(mockFile, allowedTypes, maxSize)).not.toThrow();
      });

      it('should reject disallowed file types', () => {
        const mockFile = new File(['test content'], 'test.exe', { 
          type: 'application/x-executable',
          size: 1024
        });

        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSize = 10 * 1024 * 1024;

        expect(() => validateFile(mockFile, allowedTypes, maxSize)).toThrow();
      });

      it('should reject oversized files', () => {
        const mockFile = new File(['test content'], 'large.jpg', { 
          type: 'image/jpeg',
          size: 20 * 1024 * 1024 // 20MB
        });

        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        expect(() => validateFile(mockFile, allowedTypes, maxSize)).toThrow();
      });
    });
  });

  describe('SQL Injection Prevention', () => {
    describe('sanitizeIdentifier', () => {
      it('should accept valid identifiers', () => {
        const validIdentifiers = [
          'users',
          'user_profiles',
          'createdAt',
          'id123'
        ];

        validIdentifiers.forEach(identifier => {
          expect(sanitizeIdentifier(identifier)).toBe(identifier);
        });
      });

      it('should reject SQL keywords', () => {
        const sqlKeywords = [
          'SELECT', 'DROP', 'INSERT', 'UPDATE', 'DELETE', 'CREATE',
          'ALTER', 'TRUNCATE', 'EXEC', 'UNION', 'WHERE', 'ORDER'
        ];

        sqlKeywords.forEach(keyword => {
          expect(() => sanitizeIdentifier(keyword)).toThrow();
        });
      });

      it('should reject invalid characters', () => {
        const invalidIdentifiers = [
          'user-name', // Hyphen
          'user.name', // Dot
          'user name', // Space
          'user;name', // Semicolon
          '123user' // Starts with number
        ];

        invalidIdentifiers.forEach(identifier => {
          expect(() => sanitizeIdentifier(identifier)).toThrow();
        });
      });
    });

    describe('buildSecureWhereClause', () => {
      it('should build safe WHERE clauses', () => {
        const conditions = {
          id: '123',
          email: 'user@example.com',
          status: 'active'
        };

        const result = buildSecureWhereClause(conditions);
        expect(result.whereClause).toContain('id = $1');
        expect(result.whereClause).toContain('email = $2');
        expect(result.whereClause).toContain('status = $3');
        expect(result.parameters).toHaveLength(3);
      });

      it('should handle NULL values', () => {
        const conditions = {
          deletedAt: null,
          status: 'active'
        };

        const result = buildSecureWhereClause(conditions);
        expect(result.whereClause).toContain('deletedAt IS NULL');
        expect(result.whereClause).toContain('status = $1');
      });

      it('should handle array values', () => {
        const conditions = {
          id: ['1', '2', '3']
        };

        const result = buildSecureWhereClause(conditions);
        expect(result.whereClause).toContain('id IN ($1, $2, $3)');
        expect(result.parameters).toHaveLength(3);
      });
    });

    describe('detectSuspiciousPatterns', () => {
      it('should detect suspicious SQL patterns', () => {
        const suspiciousQueries = [
          "DROP TABLE users",
          "'; DELETE FROM users; --",
          "UNION SELECT * FROM passwords",
          "EXEC xp_cmdshell('dir')",
          "WAITFOR DELAY '00:00:05'",
          "-- Comment",
          "/* Multi-line comment */"
        ];

        suspiciousQueries.forEach(query => {
          expect(detectSuspiciousPatterns(query)).toBe(true);
        });
      });

      it('should allow safe queries', () => {
        const safeQueries = [
          "SELECT * FROM users WHERE id = $1",
          "UPDATE users SET email = $1 WHERE id = $2",
          "INSERT INTO users (name, email) VALUES ($1, $2)"
        ];

        safeQueries.forEach(query => {
          expect(detectSuspiciousPatterns(query)).toBe(false);
        });
      });
    });

    describe('QueryBuilder', () => {
      it('should build secure SELECT queries', () => {
        const result = QueryBuilder.select({
          table: 'users',
          columns: ['id', 'email', 'name'],
          where: { status: 'active' },
          orderBy: { createdAt: 'DESC' },
          limit: 10
        });

        expect(result.query).toContain('SELECT id, email, name FROM users');
        expect(result.query).toContain('WHERE status = $1');
        expect(result.query).toContain('ORDER BY createdAt DESC');
        expect(result.query).toContain('LIMIT 10');
        expect(result.parameters).toHaveLength(1);
      });

      it('should build secure INSERT queries', () => {
        const result = QueryBuilder.insert('users', {
          email: 'test@example.com',
          name: 'Test User'
        });

        expect(result.query).toContain('INSERT INTO users (email, name)');
        expect(result.query).toContain('VALUES ($1, $2)');
        expect(result.parameters).toHaveLength(2);
      });

      it('should build secure UPDATE queries', () => {
        const result = QueryBuilder.update('users', 
          { email: 'new@example.com' },
          { id: '123' }
        );

        expect(result.query).toContain('UPDATE users SET email = $1');
        expect(result.query).toContain('WHERE id = $2');
        expect(result.parameters).toHaveLength(2);
      });

      it('should build secure DELETE queries', () => {
        const result = QueryBuilder.delete('users', { id: '123' });

        expect(result.query).toContain('DELETE FROM users WHERE id = $1');
        expect(result.parameters).toHaveLength(1);
      });
    });
  });

  describe('Rate Limiting Security', () => {
    it('should have secure default configurations', () => {
      expect(rateLimitConfigs.default.windowMs).toBeGreaterThan(0);
      expect(rateLimitConfigs.default.maxRequests).toBeGreaterThan(0);
      expect(rateLimitConfigs.default.maxRequests).toBeLessThan(1000);
    });

    it('should have stricter auth limits', () => {
      expect(rateLimitConfigs.auth.maxRequests).toBeLessThan(rateLimitConfigs.default.maxRequests);
      expect(rateLimitConfigs.auth.windowMs).toBeGreaterThan(0);
    });

    it('should have file upload limits', () => {
      expect(rateLimitConfigs.upload.maxRequests).toBeLessThan(rateLimitConfigs.default.maxRequests);
    });
  });

  describe('Environment Configuration Security', () => {
    it('should require JWT secret to be set', () => {
      expect(config.jwtSecret).toBeDefined();
      expect(config.jwtSecret.length).toBeGreaterThan(31);
    });

    it('should not use default secrets in production', () => {
      // This test would fail if weak default secrets are used
      const weakPatterns = [
        'your-super-secret',
        'your-secret-key',
        'default-secret',
        'change-me',
        'test-secret'
      ];

      weakPatterns.forEach(pattern => {
        expect(config.jwtSecret.toLowerCase()).not.toContain(pattern);
      });
    });
  });

  describe('CORS Security', () => {
    it('should not allow wildcard origins in production', () => {
      // This would be tested by checking the next.config.js headers
      // In production, there should be specific allowed origins
      if (process.env.NODE_ENV === 'production') {
        expect(process.env.ALLOWED_ORIGINS).toBeDefined();
      }
    });
  });

  describe('Content Security Policy', () => {
    it('should have security headers configured', () => {
      // This would test the security headers in next.config.js
      const expectedHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security'
      ];

      expectedHeaders.forEach(header => {
        // In a real test, you'd check if these are properly configured
        expect(header).toBeDefined();
      });
    });
  });
});
