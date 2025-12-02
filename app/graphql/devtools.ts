/**
 * GraphQL DevTools
 *
 * Development tools for GraphQL debugging and monitoring.
 * Safely disables in production environments.
 */

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

export interface GraphQLResponse {
  data?: any;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
  extensions?: Record<string, any>;
}

export interface DevToolsMiddleware {
  onRequest?: (request: GraphQLRequest) => void;
  onResponse?: (response: GraphQLResponse, request: GraphQLRequest) => void;
  onError?: (error: Error, request: GraphQLRequest) => void;
}

class DevTools {
  private enabled: boolean;

  constructor() {
    this.enabled = this.isEnabled();
  }

  public getEnabled(): boolean {
    return this.enabled;
  }

  public createDevToolsMiddleware(): DevToolsMiddleware {
    if (!this.enabled) {
      return {};
    }

    return {
      onRequest: (request: GraphQLRequest) => {
        if (process.env.NODE_ENV === 'development') {
          console.group(`🔍 GraphQL Request: ${request.operationName || 'Anonymous'}`);
          console.log('Query:', request.query);
          console.log('Variables:', request.variables);
          console.groupEnd();
        }
      },

      onResponse: (response: GraphQLResponse, request: GraphQLRequest) => {
        if (process.env.NODE_ENV === 'development') {
          console.group(`✅ GraphQL Response: ${request.operationName || 'Anonymous'}`);
          console.log('Data:', response.data);
          if (response.errors) {
            console.warn('Errors:', response.errors);
          }
          console.groupEnd();
        }
      },

      onError: (error: Error, request: GraphQLRequest) => {
        if (process.env.NODE_ENV === 'development') {
          console.group(`❌ GraphQL Error: ${request.operationName || 'Anonymous'}`);
          console.error('Error:', error.message);
          console.log('Request:', request);
          console.groupEnd();
        }
      }
    };
  }

  private isEnabled(): boolean {
    // Only enable in development mode
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      return true;
    }

    // Check if we're in browser development environment
    if (typeof window !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      return true;
    }

    return false;
  }
}

// Create singleton instance
export const devtools = new DevTools();

// Export convenience functions
export function createDevToolsMiddleware(): DevToolsMiddleware {
  return devtools.createDevToolsMiddleware();
}

export function isDevToolsEnabled(): boolean {
  return devtools.getEnabled();
}

// Development-only utilities
export const logGraphQLError = (error: Error, request?: GraphQLRequest) => {
  if (devtools.getEnabled()) {
    console.error('GraphQL Error:', error);
    if (request) {
      console.log('Request details:', request);
    }
  }
};

export const logGraphQLRequest = (request: GraphQLRequest) => {
  if (devtools.getEnabled()) {
    console.log('GraphQL Request:', request);
  }
};

export const logGraphQLResponse = (response: GraphQLResponse, request?: GraphQLRequest) => {
  if (devtools.getEnabled()) {
    console.log('GraphQL Response:', response);
    if (request) {
      console.log('For request:', request.operationName || 'Anonymous');
    }
  }
};