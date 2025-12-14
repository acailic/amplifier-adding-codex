// Type exports
export * from './types';

// Core Components
export { default as PriceDashboardWrapper } from './components/price-dashboard-wrapper';
export {
  SimplePriceTrendChart,
  SimplePriceComparisonChart,
  SimpleDiscountAnalysisChart,
  SimplePriceHeatmap
} from './components/price-charts-simple';

// Enhanced Chart Components
export {
  EnhancedPriceTrendChart,
  CategoryDistributionChart,
  PriceVolatilityChart,
  RetailerComparisonRadar,
  PriceScatterPlot,
  MarketShareTreemap
} from './components/enhanced-price-charts';

// Filter Component
export { default as SimplePriceFilter } from './components/simple-price-filter';

// Analytics Dashboard
export { PriceAnalyticsDashboard } from './components/price-analytics-dashboard';

// Export all types for TypeScript users
export type {
  PriceData,
  PriceTrend,
  PriceTrendPoint,
  DiscountData,
  PriceHeatmapData,
  PriceFilter,
  PriceChartData,
  ChartConfig,
  CurrencyRate,
  PriceAnalytics,
  LocaleConfig,
  ExportOptions,
  ComponentProps,
  PriceComparisonChartProps,
  PriceTrendChartProps,
  DiscountAnalysisChartProps,
  PriceHeatmapProps,
  PriceFilterPanelProps,
  PriceDashboardProps
} from './types';