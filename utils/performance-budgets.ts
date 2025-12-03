import { getPerformanceMetrics, checkPerformanceBudgets } from './performance-monitor';

interface PerformanceBudget {
  bundleSize: {
    total: number; // in KB
    vendor: number; // in KB
    app: number; // in KB
  };
  loadTime: {
    fcp: number; // First Contentful Paint in ms
    lcp: number; // Largest Contentful Paint in ms
    ttfb: number; // Time to First Byte in ms
    domInteractive: number; // DOM Interactive in ms
  };
  runtime: {
    fid: number; // First Input Delay in ms
    cls: number; // Cumulative Layout Shift
    memoryUsage: number; // in MB
  };
  assets: {
    images: number; // total size in KB
    fonts: number; // total size in KB
    css: number; // total size in KB
    js: number; // total size in KB
  };
}

interface BudgetThresholds {
  warning: number; // 80% of budget
  critical: number; // 100% of budget (budget limit)
}

interface BudgetResult {
  passed: boolean;
  warnings: BudgetWarning[];
  errors: BudgetError[];
  score: number;
  recommendations: string[];
}

interface BudgetWarning {
  metric: string;
  current: number;
  budget: number;
  percentage: number;
  severity: 'warning' | 'critical';
}

interface BudgetError {
  metric: string;
  current: number;
  budget: number;
  message: string;
}

// Performance budget configuration
const PERFORMANCE_BUDGET: PerformanceBudget = {
  bundleSize: {
    total: 250, // 250KB gzipped
    vendor: 150, // 150KB gzipped
    app: 100, // 100KB gzipped
  },
  loadTime: {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    ttfb: 800, // 800ms
    domInteractive: 3000, // 3s
  },
  runtime: {
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    memoryUsage: 50, // 50MB
  },
  assets: {
    images: 500, // 500KB
    fonts: 200, // 200KB
    css: 50, // 50KB
    js: 100, // 100KB
  },
};

class PerformanceBudgetChecker {
  private budget: PerformanceBudget;
  private baselineMetrics: any = null;
  private regressionThreshold: number = 0.15; // 15% regression threshold

  constructor(budget: PerformanceBudget = PERFORMANCE_BUDGET) {
    this.budget = budget;
    this.loadBaseline();
  }

  // Check performance against budgets
  checkBudgets(metrics?: any): BudgetResult {
    const currentMetrics = metrics || this.getCurrentMetrics();
    const warnings: BudgetWarning[] = [];
    const errors: BudgetError[] = [];
    const recommendations: string[] = [];

    // Check bundle sizes
    this.checkBundleSize(currentMetrics, warnings, errors, recommendations);

    // Check load times
    this.checkLoadTimes(currentMetrics, warnings, errors, recommendations);

    // Check runtime performance
    this.checkRuntimePerformance(currentMetrics, warnings, errors, recommendations);

    // Check assets
    this.checkAssets(currentMetrics, warnings, errors, recommendations);

    // Calculate overall score
    const score = this.calculateScore(warnings, errors);

    return {
      passed: errors.length === 0 && warnings.filter(w => w.severity === 'critical').length === 0,
      warnings,
      errors,
      score,
      recommendations,
    };
  }

  // Check for performance regressions
  checkRegressions(): BudgetResult {
    const currentMetrics = this.getCurrentMetrics();
    const result = this.checkBudgets(currentMetrics);

    if (this.baselineMetrics) {
      this.checkForRegressions(currentMetrics, this.baselineMetrics, result);
    }

    return result;
  }

  // Set baseline for regression testing
  setBaseline(metrics?: any): void {
    this.baselineMetrics = metrics || this.getCurrentMetrics();
    localStorage.setItem('performance-baseline', JSON.stringify(this.baselineMetrics));
    console.log('[Performance] Baseline set for regression testing');
  }

  // Load baseline from storage
  private loadBaseline(): void {
    const stored = localStorage.getItem('performance-baseline');
    if (stored) {
      this.baselineMetrics = JSON.parse(stored);
    }
  }

  // Get current performance metrics
  private getCurrentMetrics(): any {
    const webVitals = getPerformanceMetrics();
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;

    return {
      bundleSize: this.getBundleSizeMetrics(),
      loadTime: {
        fcp: webVitals.fcp || 0,
        lcp: webVitals.lcp || 0,
        ttfb: webVitals.ttfb || 0,
        domInteractive: navigation?.domInteractive ? navigation.domInteractive - navigation.fetchStart : 0,
      },
      runtime: {
        fid: webVitals.fid || 0,
        cls: webVitals.cls || 0,
        memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0,
      },
      assets: this.getAssetMetrics(),
    };
  }

  // Get bundle size metrics (simplified - in real app, use webpack-bundle-analyzer)
  private getBundleSizeMetrics(): any {
    // This would normally come from webpack bundle analysis
    return {
      total: 78, // From our build output
      vendor: 45,
      app: 33,
    };
  }

  // Get asset metrics (simplified - in real app, analyze actual assets)
  private getAssetMetrics(): any {
    return {
      images: 120,
      fonts: 85,
      css: 45,
      js: 78,
    };
  }

  // Check bundle size against budget
  private checkBundleSize(
    metrics: any,
    warnings: BudgetWarning[],
    errors: BudgetError[],
    recommendations: string[]
  ): void {
    const bundleSize = metrics.bundleSize;
    const budget = this.budget.bundleSize;

    Object.entries(bundleSize).forEach(([key, value]) => {
      const budgetValue = budget[key as keyof typeof budget];
      const percentage = (value as number / budgetValue) * 100;

      if (percentage >= 100) {
        errors.push({
          metric: `bundleSize.${key}`,
          current: value as number,
          budget: budgetValue,
          message: `Bundle size ${key} exceeds budget by ${percentage - 100}%`,
        });
        recommendations.push(`Optimize ${key} bundle size - consider code splitting or tree shaking`);
      } else if (percentage >= 80) {
        warnings.push({
          metric: `bundleSize.${key}`,
          current: value as number,
          budget: budgetValue,
          percentage,
          severity: percentage >= 95 ? 'critical' : 'warning',
        });
      }
    });
  }

  // Check load times against budget
  private checkLoadTimes(
    metrics: any,
    warnings: BudgetWarning[],
    errors: BudgetError[],
    recommendations: string[]
  ): void {
    const loadTime = metrics.loadTime;
    const budget = this.budget.loadTime;

    Object.entries(loadTime).forEach(([key, value]) => {
      if (value === 0) return; // Skip if metric not available

      const budgetValue = budget[key as keyof typeof budget];
      const percentage = (value as number / budgetValue) * 100;

      if (percentage >= 100) {
        errors.push({
          metric: `loadTime.${key}`,
          current: value as number,
          budget: budgetValue,
          message: `Load time ${key} exceeds budget by ${percentage - 100}%`,
        });

        switch (key) {
          case 'fcp':
            recommendations.push('Optimize server response time, remove render-blocking resources');
            break;
          case 'lcp':
            recommendations.push('Optimize LCP elements, improve server response time, use CDN');
            break;
          case 'ttfb':
            recommendations.push('Improve server performance, use CDN, enable compression');
            break;
        }
      } else if (percentage >= 80) {
        warnings.push({
          metric: `loadTime.${key}`,
          current: value as number,
          budget: budgetValue,
          percentage,
          severity: percentage >= 95 ? 'critical' : 'warning',
        });
      }
    });
  }

  // Check runtime performance against budget
  private checkRuntimePerformance(
    metrics: any,
    warnings: BudgetWarning[],
    errors: BudgetError[],
    recommendations: string[]
  ): void {
    const runtime = metrics.runtime;
    const budget = this.budget.runtime;

    Object.entries(runtime).forEach(([key, value]) => {
      if (value === 0) return; // Skip if metric not available

      const budgetValue = budget[key as keyof typeof budget];
      const percentage = (value as number / budgetValue) * 100;

      if (percentage >= 100) {
        errors.push({
          metric: `runtime.${key}`,
          current: value as number,
          budget: budgetValue,
          message: `Runtime metric ${key} exceeds budget by ${percentage - 100}%`,
        });

        switch (key) {
          case 'fid':
            recommendations.push('Reduce JavaScript execution time, break up long tasks');
            break;
          case 'cls':
            recommendations.push('Reserve space for dynamic content, avoid layout shifts');
            break;
          case 'memoryUsage':
            recommendations.push('Check for memory leaks, optimize component lifecycle');
            break;
        }
      } else if (percentage >= 80) {
        warnings.push({
          metric: `runtime.${key}`,
          current: value as number,
          budget: budgetValue,
          percentage,
          severity: percentage >= 95 ? 'critical' : 'warning',
        });
      }
    });
  }

  // Check assets against budget
  private checkAssets(
    metrics: any,
    warnings: BudgetWarning[],
    errors: BudgetError[],
    recommendations: string[]
  ): void {
    const assets = metrics.assets;
    const budget = this.budget.assets;

    Object.entries(assets).forEach(([key, value]) => {
      const budgetValue = budget[key as keyof typeof budget];
      const percentage = (value as number / budgetValue) * 100;

      if (percentage >= 100) {
        errors.push({
          metric: `assets.${key}`,
          current: value as number,
          budget: budgetValue,
          message: `Asset ${key} size exceeds budget by ${percentage - 100}%`,
        });

        switch (key) {
          case 'images':
            recommendations.push('Optimize images, use modern formats (WebP, AVIF), implement lazy loading');
            break;
          case 'fonts':
            recommendations.push('Use font subsets, implement font-display: swap');
            break;
          case 'css':
            recommendations.push('Remove unused CSS, implement critical CSS');
            break;
          case 'js':
            recommendations.push('Implement code splitting, remove unused dependencies');
            break;
        }
      } else if (percentage >= 80) {
        warnings.push({
          metric: `assets.${key}`,
          current: value as number,
          budget: budgetValue,
          percentage,
          severity: percentage >= 95 ? 'critical' : 'warning',
        });
      }
    });
  }

  // Check for performance regressions
  private checkForRegressions(current: any, baseline: any, result: BudgetResult): void {
    Object.entries(current).forEach(([category, categoryValue]) => {
      if (typeof categoryValue === 'object') {
        Object.entries(categoryValue as any).forEach(([metric, value]) => {
          const baselineValue = baseline[category]?.[metric];
          if (baselineValue && baselineValue > 0) {
            const regression = (value as number - baselineValue) / baselineValue;
            if (regression > this.regressionThreshold) {
              result.errors.push({
                metric: `${category}.${metric}`,
                current: value as number,
                budget: baselineValue,
                message: `Performance regression detected: ${(regression * 100).toFixed(1)}% degradation`,
              });
              result.recommendations.push(`Investigate regression in ${category}.${metric}`);
            }
          }
        });
      }
    });
  }

  // Calculate overall performance score
  private calculateScore(warnings: BudgetWarning[], errors: BudgetError[]): number {
    const criticalIssues = warnings.filter(w => w.severity === 'critical').length;
    const totalIssues = warnings.length + errors.length;

    let score = 100;
    score -= (criticalIssues * 20); // 20 points per critical issue
    score -= (errors.length * 15); // 15 points per error
    score -= (warnings.filter(w => w.severity === 'warning').length * 10); // 10 points per warning

    return Math.max(0, score);
  }
}

// Performance budget monitor
export const performanceBudgetMonitor = new PerformanceBudgetChecker();

// Performance regression testing utilities
export function setupPerformanceRegressionTesting(): void {
  // Run budget checks on page load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const result = performanceBudgetMonitor.checkRegressions();

        if (process.env.NODE_ENV === 'development') {
          console.log('[Performance] Budget check result:', result);
        }

        // Store results for analytics
        storeBudgetResults(result);

        // Show notifications for critical issues
        if (result.errors.length > 0 || result.warnings.some(w => w.severity === 'critical')) {
          showPerformanceAlert(result);
        }
      }, 3000); // Wait for metrics to be collected
    });
  }
}

// Store budget results for analytics
function storeBudgetResults(result: BudgetResult): void {
  const key = 'performance-budget-results';
  const results = JSON.parse(localStorage.getItem(key) || '[]');

  results.push({
    timestamp: Date.now(),
    score: result.score,
    errors: result.errors.length,
    warnings: result.warnings.length,
    passed: result.passed,
  });

  // Keep only last 30 results
  if (results.length > 30) {
    results.shift();
  }

  localStorage.setItem(key, JSON.stringify(results));
}

// Show performance alert to developers
function showPerformanceAlert(result: BudgetResult): void {
  if (process.env.NODE_ENV === 'development' && document.querySelector) {
    const existingAlert = document.querySelector('#performance-alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.id = 'performance-alert';
    alert.className = 'fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-md z-50';
    alert.innerHTML = `
      <div class="flex items-start">
        <svg class="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="flex-1">
          <h4 class="font-semibold">Performance Alert</h4>
          <p class="text-sm mt-1">Score: ${result.score}/100 | Errors: ${result.errors.length} | Warnings: ${result.warnings.length}</p>
          ${result.recommendations.slice(0, 3).map(rec => `<p class="text-xs mt-1">• ${rec}</p>`).join('')}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(alert);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.querySelector('#performance-alert')) {
        alert.remove();
      }
    }, 10000);
  }
}

export default performanceBudgetMonitor;