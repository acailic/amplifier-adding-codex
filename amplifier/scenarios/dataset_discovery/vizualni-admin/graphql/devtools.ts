/**
 * GraphQL DevTools Module
 *
 * This module provides development tools for GraphQL debugging and introspection.
 * It's designed to work safely in both development and production environments.
 *
 * In production, devtools are disabled to avoid performance overhead and security risks.
 * In development, devtools are enabled when available.
 */

interface DevToolsOptions {
  enabled?: boolean;
  endpoint?: string;
  headers?: Record<string, string>;
}

interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

interface GraphQLResponse {
  data?: any;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
  extensions?: Record<string, any>;
}

class GraphQLDevTools {
  private enabled: boolean;
  private endpoint?: string;
  private headers?: Record<string, string>;

  constructor(options: DevToolsOptions = {}) {
    this.enabled = options.enabled ?? this.isDevelopment();
    this.endpoint = options.endpoint;
    this.headers = options.headers;
  }

  private isDevelopment(): boolean {
    // Check if we're in development environment
    return process.env.NODE_ENV === 'development' ||
           process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
           typeof window !== 'undefined' && window.location?.hostname === 'localhost';
  }

  private log(level: 'info' | 'warn' | 'error', message: string, ...args: any[]) {
    if (!this.enabled) return;

    const prefix = '[GraphQL DevTools]';
    switch (level) {
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  public logRequest(request: GraphQLRequest) {
    if (!this.enabled) return;

    this.log('info', 'GraphQL Request:', {
      query: request.query,
      variables: request.variables,
      operationName: request.operationName,
    });
  }

  public logResponse(response: GraphQLResponse, request?: GraphQLRequest) {
    if (!this.enabled) return;

    if (response.errors && response.errors.length > 0) {
      this.log('error', 'GraphQL Errors:', response.errors);
    }

    this.log('info', 'GraphQL Response:', {
      data: response.data,
      errors: response.errors,
      extensions: response.extensions,
    });

    if (request && response.data) {
      this.validateResponseAgainstQuery(request, response.data);
    }
  }

  public logError(error: Error, request?: GraphQLRequest) {
    if (!this.enabled) return;

    this.log('error', 'GraphQL Network Error:', {
      error: error.message,
      stack: error.stack,
      request: request,
    });
  }

  private validateResponseAgainstQuery(request: GraphQLRequest, data: any) {
    if (!this.enabled || !request.operationName) return;

    // Basic validation to ensure data structure makes sense
    // This is a simplified validation - in a real devtools implementation,
    // you'd want to parse the GraphQL query and validate against the schema
    try {
      const hasData = data && typeof data === 'object';
      if (!hasData) {
        this.log('warn', 'Response has no data for operation:', request.operationName);
      }
    } catch (error) {
      this.log('warn', 'Failed to validate response:', error);
    }
  }

  public createDevToolsMiddleware() {
    if (!this.enabled) {
      return undefined;
    }

    return {
      onRequest: (request: GraphQLRequest) => this.logRequest(request),
      onResponse: (response: GraphQLResponse, request?: GraphQLRequest) =>
        this.logResponse(response, request),
      onError: (error: Error, request?: GraphQLRequest) =>
        this.logError(error, request),
    };
  }

  public getEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled && this.isDevelopment();
  }
}

// Create a singleton instance for global use
const devtools = new GraphQLDevTools();

// Export the instance and class
export { devtools, GraphQLDevTools };
export type { DevToolsOptions, GraphQLRequest, GraphQLResponse };

// Default export for compatibility
export default devtools;