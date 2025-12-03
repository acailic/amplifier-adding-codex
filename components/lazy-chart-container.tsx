import React, { Suspense, lazy, ComponentType } from 'react';
import { ChartSkeleton } from './enhanced-data-visualization';

interface LazyChartContainerProps {
  chartComponent: ComponentType<any>;
  chartProps?: any;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

const LazyChartContainer: React.FC<LazyChartContainerProps> = ({
  chartComponent,
  chartProps = {},
  fallback,
  rootMargin = '50px',
  threshold = 0.1,
}) => {
  const LazyChart = lazy(() => {
    return new Promise<{ default: ComponentType<any> }>((resolve) => {
      // Add a small delay to simulate network latency
      setTimeout(() => {
        resolve({ default: chartComponent });
      }, 100);
    });
  });

  return (
    <Suspense
      fallback={
        fallback || (
          <ChartSkeleton
            height={chartProps.height || 400}
            showGrid={true}
            animate={true}
          />
        )
      }
    >
      <div style={{ minHeight: `${chartProps.height || 400}px` }}>
        <LazyChart {...chartProps} />
      </div>
    </Suspense>
  );
};

// Higher-order component for lazy loading charts
export function withLazyLoading<P extends object>(
  ChartComponent: ComponentType<P>,
  options: {
    fallback?: React.ReactNode;
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const LazyWrappedChart: React.FC<P> = (props) => (
    <LazyChartContainer
      chartComponent={ChartComponent}
      chartProps={props}
      {...options}
    />
  );

  LazyWrappedChart.displayName = `LazyChart(${ChartComponent.displayName || ChartComponent.name})`;

  return LazyWrappedChart;
}

// Intersection Observer wrapper for advanced lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  React.useEffect(() => {
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

// Advanced lazy loading with intersection observer
export function AdvancedLazyChartContainer({
  chartComponent,
  chartProps = {},
  fallback,
  ...intersectionOptions
}: LazyChartContainerProps & IntersectionObserverInit) {
  const LazyChart = lazy(() => {
    return new Promise<{ default: ComponentType<any> }>((resolve) => {
      setTimeout(() => {
        resolve({ default: chartComponent });
      }, 100);
    });
  });

  const ref = React.useRef<HTMLDivElement>(null);
  const { isIntersecting } = useIntersectionObserver(ref, intersectionOptions);

  return (
    <div ref={ref} style={{ minHeight: `${chartProps.height || 400}px` }}>
      {isIntersecting ? (
        <Suspense
          fallback={
            fallback || (
              <ChartSkeleton
                height={chartProps.height || 400}
                showGrid={true}
                animate={true}
              />
            )
          }
        >
          <LazyChart {...chartProps} />
        </Suspense>
      ) : (
        fallback || (
          <ChartSkeleton
            height={chartProps.height || 400}
            showGrid={true}
            animate={false}
          />
        )
      )}
    </div>
  );
}

export default LazyChartContainer;