/**
 * TypeScript interfaces for cenovnici data pipeline.
 *
 * These interfaces match the vizualni-admin schema and are used
 * for frontend integration.
 */

export interface PriceData {
  id: string;
  productId: string;
  productName: string;
  productNameSr: string;
  retailer: string;
  retailerName: string;
  price: number;
  originalPrice?: number;
  currency: 'RSD' | 'EUR';
  discount?: number;
  category: string;
  categorySr: string;
  subcategory?: string;
  subcategorySr?: string;
  brand?: string;
  unit: string;
  quantity?: number;
  pricePerUnit?: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  location?: string;
  locationSr?: string;
  timestamp: string;
  url?: string;
  imageUrl?: string;
  description?: string;
  descriptionSr?: string;
  barcode?: string;
  vatRate?: string;
  discountStartDate?: string;
  discountEndDate?: string;
}

export interface PriceTrend {
  productId: string;
  productName: string;
  productNameSr: string;
  retailer: string;
  retailerName: string;
  category: string;
  categorySr: string;
  dataPoints: PriceTrendPoint[];
}

export interface PriceTrendPoint {
  date: string;
  price: number;
  currency: 'RSD' | 'EUR';
  discount?: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
}

export interface DiscountData {
  id: string;
  productId: string;
  productName: string;
  productNameSr: string;
  retailer: string;
  retailerName: string;
  originalPrice: number;
  currentPrice: number;
  discountAmount: number;
  discountPercentage: number;
  currency: 'RSD' | 'EUR';
  category: string;
  categorySr: string;
  validUntil?: string;
  discountType: 'percentage' | 'fixed' | 'special_offer';
  tags?: string[];
}

export interface CategoryAnalytics {
  category: string;
  categorySr: string;
  productCount: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceChange24h?: number;
  priceChange7d?: number;
  priceChange30d?: number;
  topBrands: Array<{
    brand: string;
    count: number;
  }>;
  discountRate: number;
}

export interface RetailerAnalytics {
  retailer: string;
  retailerName: string;
  productCount: number;
  categoriesCovered: number;
  avgPrice: number;
  avgDiscount: number;
  priceCompetitiveness: number; // 0-1, lower is more competitive
  updateFrequency: string;
  lastUpdated: string;
}

export interface PriceInsight {
  id: string;
  type: string; // "price_drop", "best_deal", "price_increase", etc.
  title: string;
  titleSr: string;
  description: string;
  descriptionSr: string;
  productIds: string[];
  retailers: string[];
  categories: string[];
  confidence: number; // 0-1
  createdAt: string;
  validUntil?: string;
}

export interface PipelineStats {
  totalRecordsProcessed: number;
  totalRetailers: number;
  totalCategories: number;
  totalProducts: number;
  totalDiscounts: number;
  processingTimeSeconds: number;
  recordsWithErrors: number;
  recordsWithDiscounts: number;
  avgDiscountPercentage: number;
  priceRange: {
    min: number;
    max: number;
  };
  lastUpdated: string;
}

export interface RetailerInfo {
  id: string;
  name: string;
  nameSr?: string;
  website?: string;
  logoUrl?: string;
  storeFormats: StoreFormat[];
  description?: string;
  descriptionSr?: string;
  dataSourceUrl?: string;
  updateFrequency: string;
  totalProducts: number;
}

export type StoreFormat =
  | 'HYPERMARKET'
  | 'SUPERMARKET'
  | 'CONVENIENCE'
  | 'DISCOUNT'
  | 'PHARMACY'
  | 'SPECIALTY'
  | 'ONLINE'
  | 'WHOLESALE';

export interface ProductCategory {
  id: string;
  name: string;
  nameSr: string;
  icon?: string;
  description?: string;
  descriptionSr?: string;
}

export interface PriceFilter {
  categories: string[];
  retailers: string[];
  priceRange: [number, number];
  currency: 'RSD' | 'EUR' | 'both';
  availability: ('in_stock' | 'out_of_stock' | 'limited')[];
  discountOnly: boolean;
  dateRange?: [string, string];
  search?: string;
  sortBy: 'price' | 'discount' | 'name' | 'date';
  sortOrder: 'asc' | 'desc';
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel' | 'pdf';
  includeImages: boolean;
  includeDescriptions: boolean;
  language: 'sr' | 'en' | 'both';
  currency: 'RSD' | 'EUR' | 'both';
}

export interface CenovniciApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  total?: number;
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// API Endpoint interfaces
export interface PriceDataResponse extends CenovniciApiResponse<PriceData[]> {}
export interface TrendDataResponse extends CenovniciApiResponse<PriceTrend[]> {}
export interface DiscountDataResponse extends CenovniciApiResponse<DiscountData[]> {}
export interface CategoryAnalyticsResponse extends CenovniciApiResponse<CategoryAnalytics[]> {}
export interface RetailerAnalyticsResponse extends CenovniciApiResponse<RetailerAnalytics[]> {}
export interface InsightsResponse extends CenovniciApiResponse<PriceInsight[]> {}
export interface PipelineStatsResponse extends CenovniciApiResponse<PipelineStats> {}

// Chart component props interfaces
export interface PriceChartProps {
  data: PriceData[];
  loading?: boolean;
  error?: string;
  height?: number;
  showCurrency?: boolean;
  locale?: 'sr' | 'en';
  onDataPointClick?: (data: PriceData) => void;
}

export interface TrendChartProps extends PriceChartProps {
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  showForecast?: boolean;
}

export interface ComparisonChartProps extends PriceChartProps {
  groupByCategory?: boolean;
  showRetailerComparison?: boolean;
}

export interface HeatmapProps {
  data: PriceData[];
  category?: string;
  retailer?: string;
  colorScale?: 'viridis' | 'plasma' | 'warm' | 'cool';
  showValues?: boolean;
}

// Form and validation interfaces
export interface ProductSearchForm {
  query: string;
  category?: string;
  retailer?: string;
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
}

export interface RetailerComparison {
  retailer1: string;
  retailer2: string;
  category?: string;
  productIds?: string[];
}

// Notification interfaces
export interface PriceAlert {
  id: string;
  productId: string;
  retailer: string;
  type: 'price_drop' | 'price_increase' | 'in_stock';
  threshold?: number;
  isActive: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  priceDropsOnly: boolean;
  categories: string[];
  retailers: string[];
}

// Configuration interfaces
export interface CenovniciConfig {
  apiBaseUrl: string;
  defaultCurrency: 'RSD' | 'EUR';
  refreshInterval: number; // seconds
  maxRetries: number;
  timeout: number; // seconds
  cacheEnabled: boolean;
  debugMode: boolean;
}

// Export all interfaces for easy importing
export type {
  // Data models
  PriceData,
  PriceTrend,
  PriceTrendPoint,
  DiscountData,
  CategoryAnalytics,
  RetailerAnalytics,
  PriceInsight,
  PipelineStats,
  RetailerInfo,

  // Types and enums
  StoreFormat,
  ProductCategory,
  PriceFilter,
  ExportOptions,

  // API responses
  CenovniciApiResponse,
  PriceDataResponse,
  TrendDataResponse,
  DiscountDataResponse,
  CategoryAnalyticsResponse,
  RetailerAnalyticsResponse,
  InsightsResponse,
  PipelineStatsResponse,

  // Component props
  PriceChartProps,
  TrendChartProps,
  ComparisonChartProps,
  HeatmapProps,

  // Forms and utilities
  ProductSearchForm,
  RetailerComparison,
  PriceAlert,
  NotificationPreferences,
  CenovniciConfig
};