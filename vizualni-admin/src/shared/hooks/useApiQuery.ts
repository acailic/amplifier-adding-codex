/**
 * Custom API Query Hook
 * Прилагођена API Query кукица
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { api, ApiResponse } from '../services/api-client';
import { logger } from '../utils/logger';
import { useAppStore } from '../stores/app-store';

export interface UseApiQueryOptions<TData, TError>
  extends Omit<UseQueryOptions<TData, TError>, 'queryFn' | 'queryKey'> {
  endpoint: string;
  queryKey?: string[];
  enableGlobalLoading?: boolean;
  loadingKey?: string;
  errorKey?: string;
  successMessage?: string;
  errorMessage?: string;
  retries?: number;
  retryDelay?: number;
}

export function useApiQuery<TData = any, TError = Error>({
  endpoint,
  queryKey = [],
  enableGlobalLoading = false,
  loadingKey,
  errorKey,
  successMessage,
  errorMessage,
  retries = 3,
  retryDelay = 1000,
  ...options
}: UseApiQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const addNotification = useAppStore((state) => state.addNotification);
  const setGlobalLoading = useAppStore((state) => state.setGlobalLoading);

  const finalQueryKey = ['api', endpoint, ...queryKey];

  const query = useQuery<TData, TError>({
    queryKey: finalQueryKey,
    queryFn: async () => {
      try {
        // Set loading states
        if (enableGlobalLoading) {
          setGlobalLoading(true);
        }
        if (loadingKey) {
          setLoading(loadingKey, true);
        }

        logger.debug(`API Query: ${endpoint}`, { queryKey });

        const response: ApiResponse<TData> = await api.get(endpoint);

        if (!response.success) {
          throw new Error(response.error?.message || 'API request failed');
        }

        // Success handling
        if (successMessage) {
          addNotification({
            type: 'success',
            title: 'Успех',
            message: successMessage,
            duration: 3000,
          });
        }

        logger.info(`API Query success: ${endpoint}`, {
          data: response.data,
          status: response.status,
        });

        return response.data as TData;
      } catch (error) {
        const finalErrorMessage = errorMessage || (error as Error).message;

        // Set error states
        if (errorKey) {
          setError(errorKey, finalErrorMessage);
        }

        // Add error notification
        addNotification({
          type: 'error',
          title: 'Грешка',
          message: finalErrorMessage,
          duration: 5000,
        });

        logger.error(`API Query error: ${endpoint}`, error as Error, {
          endpoint,
          queryKey,
        });

        throw error;
      } finally {
        // Clear loading states
        if (enableGlobalLoading) {
          setGlobalLoading(false);
        }
        if (loadingKey) {
          setLoading(loadingKey, false);
        }
      }
    },
    retry: (failureCount, error: any) => {
      if (failureCount >= retries) return false;

      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }

      logger.debug(`API Query retry: ${endpoint}`, { failureCount, error: error.message });
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, retryDelay),
    ...options,
  });

  return query;
}

// Hook for mutations
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

export interface UseApiMutationOptions<TData, TError, TVariables>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  loadingKey?: string;
  errorKey?: string;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[][];
}

export function useApiMutation<TData = any, TError = Error, TVariables = void>({
  endpoint,
  method = 'POST',
  loadingKey,
  errorKey,
  successMessage,
  errorMessage,
  invalidateQueries = [],
  ...options
}: UseApiMutationOptions<TData, TError, TVariables>): UseMutationResult<TData, TError, TVariables> {
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        // Set loading state
        if (loadingKey) {
          setLoading(loadingKey, true);
        }

        logger.debug(`API Mutation: ${method} ${endpoint}`, { variables });

        let response: ApiResponse<TData>;

        switch (method) {
          case 'POST':
            response = await api.post(endpoint, variables);
            break;
          case 'PUT':
            response = await api.put(endpoint, variables);
            break;
          case 'PATCH':
            response = await api.patch(endpoint, variables);
            break;
          case 'DELETE':
            response = await api.delete(endpoint);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        if (!response.success) {
          throw new Error(response.error?.message || 'API mutation failed');
        }

        // Success handling
        if (successMessage) {
          addNotification({
            type: 'success',
            title: 'Успех',
            message: successMessage,
            duration: 3000,
          });
        }

        logger.info(`API Mutation success: ${method} ${endpoint}`, {
          data: response.data,
          status: response.status,
        });

        // Invalidate specified queries
        if (invalidateQueries.length > 0) {
          // Note: This would need access to QueryClient
          // For now, just log that invalidation should happen
          logger.debug('Should invalidate queries', { queries: invalidateQueries });
        }

        return response.data as TData;
      } catch (error) {
        const finalErrorMessage = errorMessage || (error as Error).message;

        // Set error state
        if (errorKey) {
          setError(errorKey, finalErrorMessage);
        }

        // Add error notification
        addNotification({
          type: 'error',
          title: 'Грешка',
          message: finalErrorMessage,
          duration: 5000,
        });

        logger.error(`API Mutation error: ${method} ${endpoint}`, error as Error, {
          endpoint,
          method,
          variables,
        });

        throw error;
      } finally {
        // Clear loading state
        if (loadingKey) {
          setLoading(loadingKey, false);
        }
      }
    },
    ...options,
  });
}