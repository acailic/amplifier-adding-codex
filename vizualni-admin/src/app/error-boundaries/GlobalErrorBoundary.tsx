/**
 * Global Error Boundary
 * Глобална граница грешака
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Trans } from '@lingui/macro';
import { logger } from '../../shared/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log critical application error
    logger.error('Critical application error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary',
      level: 'critical',
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default global error UI
      return (
        <div className="global-error-boundary min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              {/* Error icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                <Trans>Нешто је пошло наопако</Trans>
              </h1>
              <p className="text-gray-600 mb-6">
                <Trans>
                  Дошло је до неочекиване грешке у апликацији. Покушајте да освежите страницу или се вратите на почетну
                  страницу.
                </Trans>
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-red-600 font-medium">
                    <Trans>Детали грешке (само за развој)</Trans>
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
                    <pre className="whitespace-pre-wrap text-gray-800">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}

              <div className="space-y-2">
                <button
                  onClick={this.handleReload}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Trans>Освежи страницу</Trans>
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <Trans>Почетна страница</Trans>
                </button>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                <Trans>
                  Ако се проблем настави, контактирајте техничку подршку.
                </Trans>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}