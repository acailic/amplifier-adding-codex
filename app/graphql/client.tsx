/**
 * GraphQL Client
 *
 * A simple GraphQL client for the application that handles development
 * and production environments appropriately.
 */

import { devtools, GraphQLRequest, GraphQLResponse } from '@/graphql/devtools';

interface GraphQLClientOptions {
  endpoint: string;
  headers?: Record<string, string>;
  timeout?: number;
  enableDevTools?: boolean;
}

class GraphQLClient {
  private endpoint: string;
  private headers: Record<string, string>;
  private timeout: number;
  private middleware?: ReturnType<typeof devtools.createDevToolsMiddleware>;

  constructor(options: GraphQLClientOptions) {
    this.endpoint = options.endpoint;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    this.timeout = options.timeout || 10000;

    // Enable devtools if requested and available
    if (options.enableDevTools !== false && devtools.getEnabled()) {
      this.middleware = devtools.createDevToolsMiddleware();
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  private async makeRequest(request: GraphQLRequest): Promise<GraphQLResponse> {
    const body = JSON.stringify(request);

    // Log request if devtools are enabled
    this.middleware?.onRequest?.(request);

    const response = await this.fetchWithTimeout(
      this.endpoint,
      {
        method: 'POST',
        headers: this.headers,
        body,
      },
      this.timeout
    );

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(
        `GraphQL request failed: ${response.status} ${response.statusText} - ${errorText}`
      );

      // Log error if devtools are enabled
      this.middleware?.onError?.(error, request);

      throw error;
    }

    let data: GraphQLResponse;

    try {
      data = await response.json();
    } catch (parseError) {
      const error = new Error(`Failed to parse GraphQL response: ${parseError}`);

      // Log error if devtools are enabled
      this.middleware?.onError?.(error as Error, request);

      throw error;
    }

    // Log response if devtools are enabled
    this.middleware?.onResponse?.(data, request);

    return data;
  }

  public async request(request: GraphQLRequest): Promise<GraphQLResponse> {
    return await this.makeRequest(request);
  }

  public async query(query: string, variables?: Record<string, any>): Promise<any> {
    const response = await this.request({
      query,
      variables,
      operationName: this.extractOperationName(query),
    });

    if (response.errors) {
      throw new Error(
        `GraphQL errors: ${response.errors.map(err => err.message).join(', ')}`
      );
    }

    return response.data;
  }

  public async mutate(
    mutation: string,
    variables?: Record<string, any>
  ): Promise<any> {
    const response = await this.request({
      query: mutation,
      variables,
      operationName: this.extractOperationName(mutation),
    });

    if (response.errors) {
      throw new Error(
        `GraphQL errors: ${response.errors.map(err => err.message).join(', ')}`
      );
    }

    return response.data;
  }

  private extractOperationName(query: string): string | undefined {
    // Simple regex to extract operation name from GraphQL query
    const match = query.match(/(?:query|mutation|subscription)\s+(\w+)/i);
    return match ? match[1] : undefined;
  }

  // Utility method to set headers dynamically
  public setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  // Utility method to remove headers
  public removeHeader(key: string): void {
    delete this.headers[key];
  }

  // Get current configuration
  public getConfig(): Omit<GraphQLClientOptions, 'enableDevTools'> {
    return {
      endpoint: this.endpoint,
      headers: { ...this.headers },
      timeout: this.timeout,
    };
  }
}

// Create a default client instance if we have a GraphQL endpoint configured
let defaultClient: GraphQLClient | null = null;

export function createGraphQLClient(options: GraphQLClientOptions): GraphQLClient {
  return new GraphQLClient(options);
}

export function getDefaultGraphQLClient(): GraphQLClient | null {
  return defaultClient;
}

export function setDefaultGraphQLClient(client: GraphQLClient): void {
  defaultClient = client;
}

// Initialize default client if environment variables are available
if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GRAPHQL_ENDPOINT) {
  defaultClient = createGraphQLClient({
    endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    enableDevTools: true,
  });
}

export { GraphQLClient };
export type { GraphQLClientOptions };