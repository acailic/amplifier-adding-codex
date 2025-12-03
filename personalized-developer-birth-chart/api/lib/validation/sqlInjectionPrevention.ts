import { validateString, validateUUID, validateNumber } from './inputValidation';

// SQL injection prevention utilities

export interface QueryParameter {
  name: string;
  value: unknown;
  type: 'string' | 'number' | 'uuid' | 'boolean' | 'date' | 'array';
}

// Enhanced parameter validation for SQL queries
export function validateQueryParameter(param: QueryParameter): unknown {
  const { name, value, type } = param;

  try {
    switch (type) {
      case 'string':
        return validateString(value, 1000);
      case 'number':
        return validateNumber(value);
      case 'uuid':
        return validateUUID(value);
      case 'boolean':
        return value === true || value === false || value === 1 || value === 0;
      case 'date':
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (typeof value === 'string') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format for parameter ${name}`);
          }
          return date.toISOString();
        }
        throw new Error(`Invalid date value for parameter ${name}`);
      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`Parameter ${name} must be an array`);
        }
        return value.map(item => validateString(item, 100));
      default:
        throw new Error(`Unsupported parameter type: ${type}`);
    }
  } catch (error) {
    throw new Error(`Invalid parameter ${name}: ${error.message}`);
  }
}

// Sanitize SQL identifiers (table names, column names)
export function sanitizeIdentifier(identifier: string): string {
  if (typeof identifier !== 'string') {
    throw new Error('Identifier must be a string');
  }

  // Remove any non-alphanumeric characters and underscores
  const sanitized = identifier.replace(/[^a-zA-Z0-9_]/g, '');
  
  // Ensure it doesn't start with a number
  if (/^[0-9]/.test(sanitized)) {
    throw new Error('Identifier cannot start with a number');
  }

  // Check for SQL keywords
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'TRUNCATE', 'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', 'WHERE', 'ORDER',
    'GROUP', 'HAVING', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
    'CROSS', 'FULL', 'NATURAL', 'USING', 'ON', 'AND', 'OR', 'NOT',
    'NULL', 'TRUE', 'FALSE', 'IS', 'IN', 'EXISTS', 'BETWEEN', 'LIKE',
    'ILIKE', 'REGEXP', 'RLIKE', 'SIMILAR', 'DISTINCT', 'ALL', 'ANY',
    'SOME', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'COALESCE',
    'NULLIF', 'CAST', 'CONVERT', 'AS', 'FROM', 'INTO', 'VALUES', 'SET'
  ];

  if (sqlKeywords.includes(sanitized.toUpperCase())) {
    throw new Error(`Identifier cannot be a SQL keyword: ${identifier}`);
  }

  if (sanitized.length === 0 || sanitized.length > 64) {
    throw new Error('Identifier must be between 1 and 64 characters');
  }

  return sanitized;
}

// Build a secure WHERE clause with parameterized queries
export function buildSecureWhereClause(conditions: Record<string, unknown>): {
  whereClause: string;
  parameters: QueryParameter[];
  parameterizedQuery: string;
} {
  const conditions_: string[] = [];
  const parameters: QueryParameter[] = [];

  Object.entries(conditions).forEach(([key, value]) => {
    const sanitizedKey = sanitizeIdentifier(key);
    
    if (value === null || value === undefined) {
      conditions_.push(`${sanitizedKey} IS NULL`);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        conditions_.push('FALSE'); // Empty array means no matches
      } else {
        const placeholders = value.map((_, index) => `$${parameters.length + index + 1}`).join(', ');
        conditions_.push(`${sanitizedKey} IN (${placeholders})`);
        value.forEach(item => {
          parameters.push({
            name: sanitizedKey,
            value: item,
            type: typeof item === 'number' ? 'number' : 'string'
          });
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      // Handle range queries
      if ('min' in value || 'max' in value) {
        if ('min' in value && value.min !== undefined) {
          conditions_.push(`${sanitizedKey} >= $${parameters.length + 1}`);
          parameters.push({
            name: `${sanitizedKey}_min`,
            value: value.min,
            type: typeof value.min === 'number' ? 'number' : 'string'
          });
        }
        if ('max' in value && value.max !== undefined) {
          conditions_.push(`${sanitizedKey} <= $${parameters.length + 1}`);
          parameters.push({
            name: `${sanitizedKey}_max`,
            value: value.max,
            type: typeof value.max === 'number' ? 'number' : 'string'
          });
        }
      } else {
        throw new Error(`Invalid object condition for ${key}`);
      }
    } else {
      conditions_.push(`${sanitizedKey} = $${parameters.length + 1}`);
      parameters.push({
        name: sanitizedKey,
        value,
        type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string'
      });
    }
  });

  const whereClause = conditions_.length > 0 ? `WHERE ${conditions_.join(' AND ')}` : '';
  
  return {
    whereClause,
    parameters,
    parameterizedQuery: whereClause
  };
}

// Validate and sanitize ORDER BY clause
export function sanitizeOrderByClause(orderBy: Record<string, 'ASC' | 'DESC'>): string {
  if (typeof orderBy !== 'object' || orderBy === null) {
    throw new Error('ORDER BY clause must be an object');
  }

  const orderings: string[] = [];

  Object.entries(orderBy).forEach(([column, direction]) => {
    const sanitizedColumn = sanitizeIdentifier(column);
    
    if (direction !== 'ASC' && direction !== 'DESC') {
      throw new Error(`Invalid sort direction: ${direction}. Must be ASC or DESC`);
    }

    orderings.push(`${sanitizedColumn} ${direction}`);
  });

  return orderings.length > 0 ? `ORDER BY ${orderings.join(', ')}` : '';
}

// Validate and sanitize LIMIT and OFFSET clauses
export function sanitizeLimitOffset(limit?: number, offset?: number): {
  limitClause: string;
  validatedLimit?: number;
  validatedOffset?: number;
} {
  let validatedLimit: number | undefined;
  let validatedOffset: number | undefined;
  const clauses: string[] = [];

  if (limit !== undefined && limit !== null) {
    validatedLimit = validateNumber(limit, 1, 1000); // Max 1000 records
    clauses.push(`LIMIT ${validatedLimit}`);
  }

  if (offset !== undefined && offset !== null) {
    validatedOffset = validateNumber(offset, 0);
    clauses.push(`OFFSET ${validatedOffset}`);
  }

  return {
    limitClause: clauses.join(' '),
    validatedLimit,
    validatedOffset
  };
}

// Build a secure SELECT query
export function buildSecureSelectQuery(options: {
  table: string;
  columns?: string[];
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  limit?: number;
  offset?: number;
  groupBy?: string[];
}): {
  query: string;
  parameters: QueryParameter[];
} {
  const { table, columns = ['*'], where, orderBy, limit, offset, groupBy } = options;
  
  const sanitizedTable = sanitizeIdentifier(table);
  const sanitizedColumns = columns.map(col => {
    if (col === '*') return '*';
    return sanitizeIdentifier(col);
  });

  const { whereClause, parameters } = where ? buildSecureWhereClause(where) : { whereClause: '', parameters: [] };
  const orderByClause = orderBy ? sanitizeOrderByClause(orderBy) : '';
  const { limitClause } = sanitizeLimitOffset(limit, offset);
  
  const groupByClause = groupBy && groupBy.length > 0 
    ? `GROUP BY ${groupBy.map(col => sanitizeIdentifier(col)).join(', ')}`
    : '';

  const query = [
    `SELECT ${sanitizedColumns.join(', ')}`,
    `FROM ${sanitizedTable}`,
    whereClause,
    groupByClause,
    orderByClause,
    limitClause
  ].filter(Boolean).join(' ');

  return { query, parameters };
}

// Validate user input for dynamic queries
export function validateDynamicQueryInput(input: {
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data?: Record<string, unknown>;
  where?: Record<string, unknown>;
  returning?: string[];
}): {
  operation: string;
  table: string;
  sanitizedData?: Record<string, unknown>;
  whereClause?: string;
  returningClause?: string;
  parameters: QueryParameter[];
} {
  const { operation, table, data, where, returning } = input;
  
  // Validate operation
  const allowedOperations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  if (!allowedOperations.includes(operation)) {
    throw new Error(`Invalid operation: ${operation}`);
  }

  const sanitizedTable = sanitizeIdentifier(table);
  const parameters: QueryParameter[] = [];

  // Validate data for INSERT/UPDATE
  let sanitizedData: Record<string, unknown> | undefined;
  if (data && (operation === 'INSERT' || operation === 'UPDATE')) {
    sanitizedData = {};
    Object.entries(data).forEach(([key, value]) => {
      const sanitizedKey = sanitizeIdentifier(key);
      sanitizedData[sanitizedKey] = value;
      
      parameters.push({
        name: sanitizedKey,
        value,
        type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string'
      });
    });
  }

  // Build WHERE clause for UPDATE/DELETE/SELECT
  const whereClauseResult = where ? buildSecureWhereClause(where) : { whereClause: '', parameters: [] };
  parameters.push(...whereClauseResult.parameters);

  // Validate RETURNING clause
  let returningClause: string | undefined;
  if (returning && returning.length > 0) {
    const sanitizedReturning = returning.map(col => {
      if (col === '*') return '*';
      return sanitizeIdentifier(col);
    });
    returningClause = `RETURNING ${sanitizedReturning.join(', ')}`;
  }

  return {
    operation,
    table: sanitizedTable,
    sanitizedData,
    whereClause: whereClauseResult.whereClause,
    returningClause,
    parameters
  };
}

// Log query attempts for security monitoring
export function logQueryAttempt(query: string, parameters: QueryParameter[], success: boolean, error?: string): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    query: query.replace(/\s+/g, ' ').trim(), // Normalize whitespace
    parameterCount: parameters.length,
    parameterTypes: parameters.map(p => p.type),
    success,
    error: error || null,
    // Don't log actual parameter values for security
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Query attempt:', logEntry);
  } else {
    // In production, you might want to send this to a logging service
    console.warn('Security query log:', JSON.stringify(logEntry));
  }
}

// Check for suspicious query patterns
export function detectSuspiciousPatterns(query: string): boolean {
  const suspiciousPatterns = [
    /(\b(DROP|TRUNCATE|ALTER|CREATE)\b+\s+(TABLE|DATABASE|SCHEMA|INDEX))/i,
    /(\bEXEC\b|EXECUTE\b|xp_cmdshell|sp_OACreate)/i,
    /(\bUNION\b\s+\bSELECT\b)/i,
    /(--|#|\/\*|\*\/)/, // Comments
    /(\bOR\b\s+\b1\s*=\s*1\b|\bAND\b\s+\b1\s*=\s*1\b)/i,
    /(\bWAITFOR\b\s+\bDELAY\b|\bSLEEP\b)/i,
    /(\bBENCHMARK\b|LOAD_FILE|OUTFILE)/i,
    /(\bINFORMATION_SCHEMA\b|SYS\.|MASTER\.\.)/i,
    /(\bCONCAT\b|CHAR\(|ASCII\(|ORD\()/i,
    /(javascript:|vbscript:|onload=|onerror=)/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(query));
}

// Wrapper for executing secure queries
export async function executeSecureQuery<T>(
  queryExecutor: (query: string, parameters: unknown[]) => Promise<T>,
  query: string,
  parameters: QueryParameter[] = []
): Promise<T> {
  try {
    // Validate query for suspicious patterns
    if (detectSuspiciousPatterns(query)) {
      const error = 'Suspicious query pattern detected';
      logQueryAttempt(query, parameters, false, error);
      throw new Error(error);
    }

    // Validate parameters
    const validatedParameters = parameters.map(param => validateQueryParameter(param));

    // Execute query
    const result = await queryExecutor(query, validatedParameters);
    
    logQueryAttempt(query, parameters, true);
    return result;
  } catch (error) {
    logQueryAttempt(query, parameters, false, error.message);
    throw error;
  }
}

// Export common query builders
export const QueryBuilder = {
  select: buildSecureSelectQuery,
  insert: (table: string, data: Record<string, unknown>, returning?: string[]) => {
    const sanitized = validateDynamicQueryInput({ 
      operation: 'INSERT', 
      table, 
      data, 
      returning 
    });
    
    const columns = Object.keys(sanitized.sanitizedData!).join(', ');
    const placeholders = Object.keys(sanitized.sanitizedData!).map((_, i) => `$${i + 1}`).join(', ');
    
    return {
      query: `INSERT INTO ${sanitized.table} (${columns}) VALUES (${placeholders})${sanitized.returningClause ? ` ${sanitized.returningClause}` : ''}`,
      parameters: sanitized.parameters
    };
  },
  
  update: (table: string, data: Record<string, unknown>, where: Record<string, unknown>, returning?: string[]) => {
    const sanitized = validateDynamicQueryInput({ 
      operation: 'UPDATE', 
      table, 
      data, 
      where, 
      returning 
    });
    
    const setClause = Object.keys(sanitized.sanitizedData!).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const whereClause = sanitized.whereClause;
    
    return {
      query: `UPDATE ${sanitized.table} SET ${setClause}${whereClause ? ` ${whereClause}` : ''}${sanitized.returningClause ? ` ${sanitized.returningClause}` : ''}`,
      parameters: sanitized.parameters
    };
  },
  
  delete: (table: string, where: Record<string, unknown>, returning?: string[]) => {
    const sanitized = validateDynamicQueryInput({ 
      operation: 'DELETE', 
      table, 
      where, 
      returning 
    });
    
    return {
      query: `DELETE FROM ${sanitized.table}${sanitized.whereClause ? ` ${sanitized.whereClause}` : ''}${sanitized.returningClause ? ` ${sanitized.returningClause}` : ''}`,
      parameters: sanitized.parameters
    };
  }
};
