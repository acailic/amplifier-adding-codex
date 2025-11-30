/**
 * Centralized API Client
 * Централизован API клијент
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { logger } from '../utils/logger';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  status: number;
  success: boolean;
}

export class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL?: string) {
    this.instance = axios.create({
      baseURL: baseURL || process.env.REACT_APP_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          url: config.url,
          method: config.method,
          headers: config.headers,
        });

        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.url}`, {
          status: response.status,
          url: response.config.url,
        });

        return response;
      },
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message || 'Unknown API error',
          code: error.code,
          details: error.response?.data,
          timestamp: new Date(),
        };

        // Handle specific error cases
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 401:
              apiError.message = 'Неовлашћен приступ';
              this.handleAuthError();
              break;
            case 403:
              apiError.message = 'Забрањен приступ';
              break;
            case 404:
              apiError.message = 'Ресурс није пронађен';
              break;
            case 422:
              apiError.message = 'Валидациона грешка';
              break;
            case 500:
              apiError.message = 'Грешка на серверу';
              break;
            default:
              apiError.message = data?.message || `HTTP ${status} Error`;
          }
        } else if (error.request) {
          apiError.message = 'Мрежна грешка - проверите интернет конекцију';
        }

        logger.error('API Response Error:', apiError);
        return Promise.reject(apiError);
      }
    );
  }

  private getAuthToken(): string | null {
    // Get token from localStorage, context, or other auth mechanism
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  private handleAuthError() {
    // Clear auth tokens and redirect to login
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return {
        error: error as ApiError,
        status: (error as any).response?.status || 0,
        success: false,
      };
    }
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return {
        error: error as ApiError,
        status: (error as any).response?.status || 0,
        success: false,
      };
    }
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return {
        error: error as ApiError,
        status: (error as any).response?.status || 0,
        success: false,
      };
    }
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.patch<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return {
        error: error as ApiError,
        status: (error as any).response?.status || 0,
        success: false,
      };
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return {
        error: error as ApiError,
        status: (error as any).response?.status || 0,
        success: false,
      };
    }
  }
}

// Create default instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
};