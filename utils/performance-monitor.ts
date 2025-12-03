import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

interface PerformanceThresholds {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: 2500, // Largest Contentful Paint (good)
  fid: 100,  // First Input Delay (good)
  cls: 0.1,  // Cumulative Layout Shift (good)
  fcp: 1800, // First Contentful Paint (good)
  ttfb: 800, // Time to First Byte (good)
};

const PERFORMANCE_THRESHOLDS_POOR: PerformanceThresholds = {
  lcp: 4000,
  fid: 300,
  cls: 0.25,
  fcp: 3000,
  ttfb: 1800,
};

let performanceMetrics: PerformanceMetrics = {};

export function reportWebVitals() {
  const vitals = [
    { name: 'CLS', getMetric: getCLS },
    { name: 'FID', getMetric: getFID },
    { name: 'FCP', getMetric: getFCP },
    { name: 'LCP', getMetric: getLCP },
    { name: 'TTFB', getMetric: getTTFB },
  ];

  vitals.forEach(({ name, getMetric }) => {
    getMetric((metric) => {
      performanceMetrics[name.toLowerCase() as keyof PerformanceMetrics] = metric.value;

      const score = metric.value;
      const threshold = PERFORMANCE_THRESHOLDS[name.toLowerCase() as keyof PerformanceThresholds];
      const thresholdPoor = PERFORMANCE_THRESHOLDS_POOR[name.toLowerCase() as keyof PerformanceThresholds];

      let rating: 'good' | 'needs-improvement' | 'poor';
      if (score <= threshold) {
        rating = 'good';
      } else if (score <= thresholdPoor) {
        rating = 'needs-improvement';
      } else {
        rating = 'poor';
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${name}:`, {
          value: metric.value,
          rating,
          threshold,
          timestamp: new Date().toISOString(),
        });
      }

      // Send to analytics or monitoring service
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: rating,
          non_interaction: true,
        });
      }

      // Custom performance monitoring endpoint
      if (process.env.NODE_ENV === 'production' && typeof fetch !== 'undefined') {
        fetch('/api/web-vitals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metric: name,
            value: metric.value,
            rating,
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Ignore errors in performance monitoring
        });
      }
    });
  });
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return performanceMetrics;
}

export function getPerformanceScore(): number {
  const metrics = performanceMetrics;
  if (!metrics.lcp || !metrics.fid || !metrics.cls || !metrics.fcp || !metrics.ttfb) {
    return 0; // Not all metrics collected yet
  }

  const lcpScore = metrics.lcp <= PERFORMANCE_THRESHOLDS.lcp ? 100 :
                   metrics.lcp <= PERFORMANCE_THRESHOLDS_POOR.lcp ? 50 : 0;
  const fidScore = metrics.fid <= PERFORMANCE_THRESHOLDS.fid ? 100 :
                   metrics.fid <= PERFORMANCE_THRESHOLDS_POOR.fid ? 50 : 0;
  const clsScore = metrics.cls <= PERFORMANCE_THRESHOLDS.cls ? 100 :
                   metrics.cls <= PERFORMANCE_THRESHOLDS_POOR.cls ? 50 : 0;
  const fcpScore = metrics.fcp <= PERFORMANCE_THRESHOLDS.fcp ? 100 :
                   metrics.fcp <= PERFORMANCE_THRESHOLDS_POOR.fcp ? 50 : 0;
  const ttfbScore = metrics.ttfb <= PERFORMANCE_THRESHOLDS.ttfb ? 100 :
                    metrics.ttfb <= PERFORMANCE_THRESHOLDS_POOR.ttfb ? 50 : 0;

  return Math.round((lcpScore + fidScore + clsScore + fcpScore + ttfbScore) / 5);
}

export function isPerformanceHealthy(): boolean {
  const score = getPerformanceScore();
  return score >= 80; // 80% or better is considered healthy
}

// Performance budget checking
export function checkPerformanceBudgets(): {
  healthy: boolean;
  issues: string[];
  recommendations: string[];
} {
  const metrics = performanceMetrics;
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (metrics.lcp && metrics.lcp > PERFORMANCE_THRESHOLDS_POOR.lcp) {
    issues.push(`Largest Contentful Paint is too slow: ${Math.round(metrics.lcp)}ms`);
    recommendations.push('Optimize images, reduce server response time, or remove render-blocking resources');
  }

  if (metrics.fid && metrics.fid > PERFORMANCE_THRESHOLDS_POOR.fid) {
    issues.push(`First Input Delay is too high: ${Math.round(metrics.fid)}ms`);
    recommendations.push('Reduce JavaScript execution time, break up long tasks');
  }

  if (metrics.cls && metrics.cls > PERFORMANCE_THRESHOLDS_POOR.cls) {
    issues.push(`Cumulative Layout Shift is too high: ${metrics.cls.toFixed(3)}`);
    recommendations.push('Include size attributes for images and videos, avoid inserting content above existing content');
  }

  if (metrics.fcp && metrics.fcp > PERFORMANCE_THRESHOLDS_POOR.fcp) {
    issues.push(`First Contentful Paint is too slow: ${Math.round(metrics.fcp)}ms`);
    recommendations.push('Optimize server response time, remove render-blocking resources');
  }

  if (metrics.ttfb && metrics.ttfb > PERFORMANCE_THRESHOLDS_POOR.ttfb) {
    issues.push(`Time to First Byte is too slow: ${Math.round(metrics.ttfb)}ms`);
    recommendations.push('Improve server response time, use CDN, enable compression');
  }

  return {
    healthy: issues.length === 0,
    issues,
    recommendations,
  };
}

// Performance monitoring for React components
export function measureComponentRender(componentName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName}.${propertyKey}: ${end - start}ms`);
      }

      return result;
    };

    return descriptor;
  };
}

// Performance monitoring for API calls
export function measureAPICall(apiName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] API ${apiName}: ${end - start}ms`);
      }

      return result;
    };

    return descriptor;
  };
}

export default {
  reportWebVitals,
  getPerformanceMetrics,
  getPerformanceScore,
  isPerformanceHealthy,
  checkPerformanceBudgets,
  measureComponentRender,
  measureAPICall,
};