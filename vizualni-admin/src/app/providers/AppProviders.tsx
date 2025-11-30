/**
 * Application Providers
 * Провајдери апликације
 */

import React, { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalErrorBoundary } from '../error-boundaries';
import { initializeAppStore } from '../../shared/stores/app-store';
import { logger } from '../../shared/utils/logger';

interface AppProvidersProps {
  children: ReactNode;
  enableDevtools?: boolean;
}

// Create QueryClient instance
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  enableDevtools = process.env.NODE_ENV === 'development',
}) => {
  const [queryClient] = React.useState(() => createQueryClient());

  useEffect(() => {
    // Initialize app store
    initializeAppStore();

    // Set up global error handlers
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', event.reason, {
        type: 'unhandledRejection',
      });
    };

    const handleError = (event: ErrorEvent) => {
      logger.error('Unhandled error', event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'unhandledError',
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <GlobalErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('React error boundary caught an error', error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        {enableDevtools && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

// Higher-order component for easy provider setup
export const withAppProviders = (
  Component: React.ComponentType<any>,
  options?: { enableDevtools?: boolean }
) => {
  return function WrappedComponent(props: any) {
    return (
      <AppProviders enableDevtools={options?.enableDevtools}>
        <Component {...props} />
      </AppProviders>
    );
  };
};