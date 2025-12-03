/**
 * Elite-Grade Input Validation and Sanitization for Vizualni-Admin
 * Prevents XSS, injection attacks, and data tampering
 */

import Joi from 'joi';
import DOMPurify from 'dompurify';

// Enhanced XSS protection configuration
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'],
  ALLOWED_ATTR: ['class', 'style'],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  SANITIZE_NAMED_PROPS: true,
  WHOLE_DOCUMENT: false,
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: null,
    attributeNameCheck: null,
    allowCustomizedBuiltInElements: false,
  }
};

// Chart data validation schema
export const chartDataPointSchema = Joi.object({
  [Joi.string()]: Joi.alternatives().try(
    Joi.string().max(1000), // Limit string length
    Joi.number().min(Number.MIN_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER),
    Joi.boolean(),
    Joi.date().iso(),
    Joi.null()
  )
});

export const chartDataSchema = Joi.object({
  data: Joi.array()
    .items(chartDataPointSchema)
    .min(0)
    .max(10000) // Prevent DoS through large datasets
    .required(),
  metadata: Joi.object({
    id: Joi.string()
      .alphanum()
      .max(50)
      .required(),
    title: Joi.string()
      .max(200)
      .pattern(/^[a-zA-Z0-9\u0400-\u04FF\s\-_.,!?()[\]{}:;'"\/\\]+$/) // Allow Serbian characters
      .required(),
    description: Joi.string()
      .max(1000)
      .optional(),
    source: Joi.string()
      .uri()
      .max(500)
      .optional(),
    lastUpdated: Joi.date()
      .iso()
      .optional()
  }).optional(),
  config: Joi.object({
    responsive: Joi.boolean().default(true),
    maintainAspectRatio: Joi.boolean().default(true),
    animation: Joi.object({
      duration: Joi.number().min(0).max(10000).default(1000),
      easing: Joi.string().valid('linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad').default('easeInOutQuad')
    }).optional(),
    colors: Joi.array()
      .items(Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/))
      .max(20)
      .optional()
  }).optional()
});

// API request validation schema
export const apiRequestSchema = Joi.object({
  endpoint: Joi.string()
    .pattern(/^\/api\/[a-zA-Z0-9\-_\/]*$/)
    .required(),
  method: Joi.string()
    .valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH')
    .required(),
  headers: Joi.object()
    .pattern(Joi.string(), Joi.string().max(1000))
    .max(20)
    .optional(),
  body: Joi.object()
    .max(100) // Limit number of properties
    .pattern(Joi.string(), Joi.alternatives().try(
      Joi.string().max(10000),
      Joi.number(),
      Joi.boolean(),
      Joi.object(),
      Joi.array()
    ))
    .optional()
});

// User input sanitization
export class InputSanitizer {
  /**
   * Sanitize chart labels and text content
   */
  static sanitizeChartLabel(label: string): string {
    if (typeof label !== 'string') {
      throw new Error('Chart label must be a string');
    }
    
    return DOMPurify.sanitize(label.trim(), DOMPURIFY_CONFIG);
  }

  /**
   * Sanitize tooltip content
   */
  static sanitizeTooltipContent(content: string): string {
    if (typeof content !== 'string') {
      throw new Error('Tooltip content must be a string');
    }
    
    return DOMPurify.sanitize(content.trim(), {
      ...DOMPURIFY_CONFIG,
      ALLOWED_TAGS: [], // No HTML in tooltips
      ALLOWED_ATTR: []
    });
  }

  /**
   * Sanitize user-provided URLs
   */
  static sanitizeUrl(url: string): string {
    if (typeof url !== 'string') {
      throw new Error('URL must be a string');
    }

    try {
      const parsedUrl = new URL(url);
      
      // Only allow HTTPS in production
      if (process.env.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are allowed in production');
      }

      // Allowlist of safe domains
      const allowedDomains = [
        'vizualni-admin.com',
        'data.gov.rs',
        'localhost',
        '127.0.0.1'
      ];

      const isAllowed = allowedDomains.some(domain => 
        parsedUrl.hostname === domain || 
        parsedUrl.hostname?.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        throw new Error(`Domain not allowed: ${parsedUrl.hostname}`);
      }

      return parsedUrl.toString();
    } catch (error) {
      throw new Error(`Invalid URL: ${error.message}`);
    }
  }

  /**
   * Sanitize file names
   */
  static sanitizeFileName(fileName: string): string {
    if (typeof fileName !== 'string') {
      throw new Error('File name must be a string');
    }

    // Remove dangerous characters and normalize
    const sanitized = fileName
      .replace(/[^a-zA-Z0-9\u0400-\u04FF.\-_\s]/g, '') // Allow Serbian characters
      .replace(/\.\./g, '') // Remove directory traversal
      .replace(/^\./, '') // Remove hidden files
      .trim()
      .substring(0, 255); // Limit length

    if (!sanitized || sanitized === '' || sanitized === '.') {
      throw new Error('Invalid file name');
    }

    return sanitized;
  }

  /**
   * Validate and normalize chart data
   */
  static validateChartData(data: unknown): ChartDataValidationResult {
    const { error, value } = chartDataSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    return {
      isValid: !error,
      data: error ? null : value,
      errors: error ? error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
        code: d.type
      })) : []
    };
  }

  /**
   * Validate API request parameters
   */
  static validateApiRequest(request: unknown): ApiRequestValidationResult {
    const { error, value } = apiRequestSchema.validate(request, {
      abortEarly: false,
      stripUnknown: true
    });

    return {
      isValid: !error,
      request: error ? null : value,
      errors: error ? error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
        code: d.type
      })) : []
    };
  }
}

// Type definitions
export interface ChartDataValidationResult {
  isValid: boolean;
  data: any | null;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface ApiRequestValidationResult {
  isValid: boolean;
  request: any | null;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// React Hook for input validation
export const useSecureInput = (initialValue: string = '', validator?: (value: string) => string | null) => {
  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState<string | null>(null);
  const [isValid, setIsValid] = React.useState(false);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    
    if (validator) {
      const validationError = validator(newValue);
      setError(validationError);
      setIsValid(!validationError);
    }
  };

  return {
    value,
    setValue: handleChange,
    error,
    isValid,
    clearError: () => setError(null)
  };
};

// Higher-order component for secure inputs
export const withSecureValidation = <P extends object>(
  Component: React.ComponentType<P>,
  validator: (props: P) => string | null
) => {
  return React.memo((props: P) => {
    const validationError = validator(props);
    
    if (validationError) {
      return (
        <div className="validation-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{validationError}</span>
        </div>
      );
    }

    return <Component {...props} />;
  });
};