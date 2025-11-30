/**
 * Feature Error Boundary
 * Граница грешака за функционалности
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Trans } from '@lingui/macro';
import { logger } from '../../shared/utils/logger';

interface Props {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
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

    // Log the error with context
    logger.featureError(
      this.props.feature,
      `Error in feature ${this.props.feature}`,
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: 'FeatureErrorBoundary',
        retryCount: this.state.retryCount,
      }
    );

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));

      logger.featureInfo(
        this.props.feature,
        `Retrying feature ${this.props.feature} after error`,
        { retryCount: this.state.retryCount + 1 }
      );
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });

    logger.featureInfo(this.props.feature, `Reset feature ${this.props.feature}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="feature-error-boundary p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="max-w-lg">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              <Trans>Дошло је до грешке</Trans>
            </h2>
            <p className="text-red-600 mb-4">
              <Trans>
                Функционалност "{this.props.feature}" тренутно није доступна због техничке грешке.
              </Trans>
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 p-3 bg-red-100 rounded text-sm">
                <summary className="font-medium text-red-800 cursor-pointer">
                  <Trans>Детали грешке (само за развој)</Trans>
                </summary>
                <pre className="mt-2 text-red-700 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              {this.props.enableRetry && this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Trans>Покушај поново</Trans>
                  {this.state.retryCount > 0 && ` (${this.state.retryCount}/${this.maxRetries})`}
                </button>
              )}

              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <Trans>Ресетуј</Trans>
              </button>

              {this.state.retryCount >= this.maxRetries && (
                <span className="text-red-600 py-2">
                  <Trans>Достигнут је максимални број покушаја</Trans>
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for easier usage
export function withFeatureErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  feature: string,
  options?: {
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    enableRetry?: boolean;
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <FeatureErrorBoundary feature={feature} {...options}>
        <Component {...props} />
      </FeatureErrorBoundary>
    );
  };
}