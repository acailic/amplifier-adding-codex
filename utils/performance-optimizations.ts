import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';

// Enhanced memo with custom comparison
export function memoWithComparison<T extends React.ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: any, nextProps: any) => boolean
): T {
  return memo(Component, areEqual) as T;
}

// Deep comparison utility for props
export function deepCompare(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepCompare(item, b[index]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => deepCompare(a[key], b[key]));
  }
  return false;
}

// Memoized chart data processor
export function useProcessedChartData<T>(
  data: T[],
  processors: ((data: T[]) => T[])[]
): T[] {
  return useMemo(() => {
    return processors.reduce((acc, processor) => processor(acc), data);
  }, [data, processors]);
}

// Memoized chart configuration
export function useMemoizedChartConfig(
  baseConfig: any,
  dynamicConfig: any = {}
) {
  return useMemo(() => ({
    ...baseConfig,
    ...dynamicConfig,
  }), [baseConfig, dynamicConfig]);
}

// Debounced callback for user interactions
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay, ...deps]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Throttled callback for performance-critical operations
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const lastRunRef = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRunRef.current >= delay) {
        callback(...args);
        lastRunRef.current = Date.now();
      }
    },
    [callback, delay, ...deps]
  ) as T;

  return throttledCallback;
}

// Virtual scrolling for large datasets
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useRef(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop.current / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop.current + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      offsetY: startIndex * itemHeight,
      visibleItems: items.slice(startIndex, endIndex + 1),
    };
  }, [items, itemHeight, containerHeight, overscan, scrollTop.current]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      if (Math.abs(newScrollTop - scrollTop.current) > itemHeight) {
        scrollTop.current = newScrollTop;
      }
    },
    [itemHeight]
  );

  return {
    ...visibleRange,
    handleScroll,
  };
}

// Memoized formatters to prevent unnecessary recalculations
export function useMemoizedFormatters() {
  return useMemo(() => ({
    serbianNumberFormatter: (value: number) => {
      return new Intl.NumberFormat('sr-RS', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    },
    serbianCurrencyFormatter: (value: number) => {
      return new Intl.NumberFormat('sr-RS', {
        style: 'currency',
        currency: 'RSD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    },
    serbianPercentFormatter: (value: number) => {
      return new Intl.NumberFormat('sr-RS', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(value / 100);
    },
    serbianDateFormatter: (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat('sr-RS', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(dateObj);
    },
  }), []);
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const startTimeRef = useRef<number>();

  useEffect(() => {
    renderCountRef.current += 1;
    startTimeRef.current = performance.now();

    return () => {
      if (startTimeRef.current) {
        const renderTime = performance.now() - startTimeRef.current;
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[Performance] ${componentName} render #${renderCountRef.current}: ${renderTime.toFixed(2)}ms`
          );
        }
      }
    };
  });

  return {
    renderCount: renderCountRef.current,
  };
}

// Intersection observer for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsIntersecting(true);
          setHasIntersected(true);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Resize observer with debouncing
export function useResizeObserver(
  ref: React.RefObject<Element>,
  callback: (entries: ResizeObserverEntry[]) => void,
  debounceMs: number = 100
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let timeoutId: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callbackRef.current(entries);
      }, debounceMs);
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [ref, debounceMs]);
}

// Idle callback for non-critical operations
export function useIdleCallback(callback: () => void, deps: React.DependencyList = []) {
  useEffect(() => {
    const handleIdle = requestIdleCallback(callback);
    return () => cancelIdleCallback(handleIdle);
  }, deps);
}

// Memoized chart colors and themes
export function useMemoizedChartTheme() {
  return useMemo(() => ({
    serbianColors: {
      primary: '#0C2340',      // Serbian flag blue
      secondary: '#C6363C',    // Serbian flag red
      success: '#4CAF50',      // Green
      warning: '#FF9800',      // Orange
      info: '#2196F3',         // Light blue
      error: '#F44336',        // Red
      background: '#F8F9FA',   // Light gray
      text: '#212529',         // Dark text
      border: '#DEE2E6',       // Border color
    },
    chartDefaults: {
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
      animationDuration: 300,
      strokeWidth: 2,
      fontSize: 12,
    },
  }), []);
}

// Performance-optimized event handler
export function useOptimizedEventHandler<T extends (...args: any[]) => any>(
  handler: T,
  options: {
    debounce?: number;
    throttle?: number;
    passive?: boolean;
  } = {}
): T {
  const memoizedHandler = useCallback(handler, []);

  const optimizedHandler = useMemo(() => {
    let result = memoizedHandler;

    if (options.debounce) {
      let timeoutId: NodeJS.Timeout;
      result = ((...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => memoizedHandler(...args), options.debounce);
      }) as T;
    }

    if (options.throttle) {
      let lastRun = 0;
      result = ((...args: Parameters<T>) => {
        if (Date.now() - lastRun >= options.throttle!) {
          memoizedHandler(...args);
          lastRun = Date.now();
        }
      }) as T;
    }

    return result;
  }, [memoizedHandler, options.debounce, options.throttle]);

  return optimizedHandler as T;
}

export default {
  memoWithComparison,
  deepCompare,
  useProcessedChartData,
  useMemoizedChartConfig,
  useDebouncedCallback,
  useThrottledCallback,
  useVirtualScroll,
  useMemoizedFormatters,
  usePerformanceMonitor,
  useIntersectionObserver,
  useResizeObserver,
  useIdleCallback,
  useMemoizedChartTheme,
  useOptimizedEventHandler,
};