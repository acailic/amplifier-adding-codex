'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { reportWebVitals, isPerformanceHealthy, getPerformanceScore } from '../utils/performance-monitor';
import { performanceBudgetMonitor, setupPerformanceRegressionTesting } from '../utils/performance-budgets';
import { register } from '../utils/service-worker-registration';

interface PerformanceContextValue {
  score: number;
  isHealthy: boolean;
  isLoading: boolean;
  lastUpdate: number;
  refreshMetrics: () => void;
  clearCache: () => Promise<void>;
  performanceData: any;
}

const PerformanceContext = React.createContext<PerformanceContextValue | null>(null);

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  enableServiceWorker?: boolean;
  monitoringInterval?: number;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  enableMonitoring = process.env.NODE_ENV === 'production',
  enableServiceWorker = true,
  monitoringInterval = 30000, // 30 seconds
}) => {
  const [score, setScore] = useState<number>(0);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [performanceData, setPerformanceData] = useState<any>(null);

  // Refresh performance metrics
  const refreshMetrics = useCallback(() => {
    const currentScore = getPerformanceScore();
    const currentHealth = isPerformanceHealthy();
    const budgetResult = performanceBudgetMonitor.checkBudgets();

    setScore(currentScore);
    setIsHealthy(currentHealth);
    setLastUpdate(Date.now());
    setPerformanceData({
      score: currentScore,
      health: currentHealth,
      budget: budgetResult,
      webVitals: budgetResult,
    });

    // Log performance data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance] Metrics updated:', {
        score: currentScore,
        healthy: currentHealth,
        budget: budgetResult,
      });
    }
  }, []);

  // Clear performance cache
  const clearCache = useCallback(async () => {
    try {
      // Clear service worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear performance cache
      localStorage.removeItem('performance-baseline');
      localStorage.removeItem('performance-budget-results');

      // Refresh metrics after clearing cache
      setTimeout(refreshMetrics, 1000);

      console.log('[Performance] Cache cleared');
    } catch (error) {
      console.error('[Performance] Failed to clear cache:', error);
    }
  }, [refreshMetrics]);

  // Initialize performance monitoring
  useEffect(() => {
    if (!enableMonitoring) {
      setIsLoading(false);
      return;
    }

    // Start web vitals monitoring
    reportWebVitals();

    // Setup regression testing
    setupPerformanceRegressionTesting();

    // Set initial baseline if not exists
    if (!localStorage.getItem('performance-baseline')) {
      setTimeout(() => {
        performanceBudgetMonitor.setBaseline();
      }, 5000); // Wait for initial metrics
    }

    // Initial metrics collection
    setTimeout(() => {
      refreshMetrics();
      setIsLoading(false);
    }, 3000); // Wait for initial metrics to be collected

    // Set up periodic monitoring
    const interval = setInterval(refreshMetrics, monitoringInterval);

    return () => {
      clearInterval(interval);
    };
  }, [enableMonitoring, monitoringInterval, refreshMetrics]);

  // Register service worker
  useEffect(() => {
    if (enableServiceWorker && process.env.NODE_ENV === 'production') {
      register({
        onUpdate: (registration) => {
          console.log('[Performance] Service worker updated');
          // Show update notification
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('service-worker-updated', {
              detail: { registration }
            }));
          }
        },
        onSuccess: (registration) => {
          console.log('[Performance] Service worker registered successfully');
        },
        onOffline: () => {
          console.log('[Performance] App is offline');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app-offline'));
          }
        },
        onOnline: () => {
          console.log('[Performance] App is online');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app-online'));
          }
        },
      });
    }
  }, [enableServiceWorker]);

  // Performance context value
  const contextValue = useMemo(() => ({
    score,
    isHealthy,
    isLoading,
    lastUpdate,
    refreshMetrics,
    clearCache,
    performanceData,
  }), [score, isHealthy, isLoading, lastUpdate, refreshMetrics, clearCache, performanceData]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}

      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceIndicator
          score={score}
          isHealthy={isHealthy}
          isLoading={isLoading}
        />
      )}
    </PerformanceContext.Provider>
  );
};

// Development performance indicator
const PerformanceIndicator: React.FC<{
  score: number;
  isHealthy: boolean;
  isLoading: boolean;
}> = ({ score, isHealthy, isLoading }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthColor = (healthy: boolean) => {
    return healthy ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-800">Performance</h4>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="text-xs text-gray-500">Loading metrics...</div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Score:</span>
            <span className={`text-xs font-semibold ${getScoreColor(score)}`}>
              {score}/100
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Health:</span>
            <span className={`text-xs font-semibold ${getHealthColor(isHealthy)}`}>
              {isHealthy ? 'Good' : 'Issues'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook to use performance context
export const usePerformance = (): PerformanceContextValue => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

// Hook to monitor component performance
export const useComponentPerformance = (componentName: string) => {
  const renderCount = React.useRef(0);
  const renderTime = React.useRef<number[]>([]);

  React.useEffect(() => {
    renderCount.current += 1;
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderDuration = endTime - startTime;
      renderTime.current.push(renderDuration);

      // Keep only last 10 renders
      if (renderTime.current.length > 10) {
        renderTime.current = renderTime.current.slice(-10);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} render #${renderCount.current}: ${renderDuration.toFixed(2)}ms`);
      }
    };
  });

  const getAverageRenderTime = useCallback(() => {
    if (renderTime.current.length === 0) return 0;
    return renderTime.current.reduce((a, b) => a + b, 0) / renderTime.current.length;
  }, []);

  return {
    renderCount: renderCount.current,
    averageRenderTime: getAverageRenderTime(),
    recentRenderTimes: renderTime.current.slice(-5),
  };
};

// Higher-order component for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = React.memo((props: P) => {
    const name = componentName || Component.displayName || Component.name;
    const { renderCount, averageRenderTime } = useComponentPerformance(name);

    // Track performance issues
    React.useEffect(() => {
      if (averageRenderTime > 16) { // 60fps = 16.67ms per frame
        console.warn(`[Performance] ${name} is slow (${averageRenderTime.toFixed(2)}ms average)`);
      }
    }, [name, averageRenderTime]);

    return <Component {...props} />;
  });

  WrappedComponent.displayName = `WithPerformanceMonitoring(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default PerformanceProvider;