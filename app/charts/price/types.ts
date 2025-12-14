/**
 * Type definitions for price visualization components
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
  unit?: string;
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

export interface PriceHeatmapData {
  category: string;
  categorySr: string;
  retailer: string;
  retailerName: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceChange: number;
  priceChangePercentage: number;
  productCount: number;
  currency: 'RSD' | 'EUR';
  lastUpdated: string;
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

export interface PriceChartData {
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
  labels: string[];
}

export interface ChartConfig {
  title: string;
  titleSr?: string;
  type: 'line' | 'bar' | 'pie' | 'heatmap' | 'scatter';
  responsive: boolean;
  maintainAspectRatio: boolean;
  showLegend: boolean;
  showGrid: boolean;
  animation: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    grid: string;
  };
}

export interface CurrencyRate {
  from: 'RSD' | 'EUR';
  to: 'RSD' | 'EUR';
  rate: number;
  date: string;
}

export interface PriceAnalytics {
  totalProducts: number;
  totalRetailers: number;
  averagePrice: number;
  averageDiscount: number;
  priceRanges: {
    budget: number;
    midRange: number;
    premium: number;
  };
  topCategories: {
    category: string;
    categorySr: string;
    productCount: number;
    avgPrice: number;
  }[];
  topRetailers: {
    retailer: string;
    retailerName: string;
    productCount: number;
    avgPrice: number;
  }[];
}

export interface LocaleConfig {
  language: 'sr' | 'en';
  currency: 'RSD' | 'EUR';
  dateFormat: 'dd.MM.yyyy' | 'MM/dd/yyyy' | 'dd-MM-yyyy';
  numberFormat: Intl.NumberFormatOptions;
  useCyrillic: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel' | 'pdf';
  includeImages: boolean;
  includeDescriptions: boolean;
  language: 'sr' | 'en' | 'both';
  currency: 'RSD' | 'EUR' | 'both';
}

export interface ComponentProps {
  data: PriceData[] | PriceTrend[] | DiscountData[] | PriceHeatmapData[];
  loading?: boolean;
  error?: string;
  config?: Partial<ChartConfig>;
  locale?: LocaleConfig;
  className?: string;
  onExport?: (options: ExportOptions) => void;
  onFilterChange?: (filter: PriceFilter) => void;
  onPriceClick?: (price: PriceData) => void;
  responsive?: boolean;
}

export interface PriceComparisonChartProps extends ComponentProps {
  selectedProducts?: string[];
  showRetailerComparison?: boolean;
  groupByCategory?: boolean;
}

export interface PriceTrendChartProps extends ComponentProps {
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  showForecast?: boolean;
  compareRetailers?: boolean;
}

export interface DiscountAnalysisChartProps extends ComponentProps {
  groupByCategory?: boolean;
  showTrends?: boolean;
  minDiscountPercentage?: number;
}

export interface PriceHeatmapProps extends ComponentProps {
  colorScale?: 'viridis' | 'plasma' | 'warm' | 'cool';
  showValues?: boolean;
  aggregateBy?: 'category' | 'retailer' | 'both';
}

export interface PriceFilterPanelProps {
  filter: PriceFilter;
  categories: string[];
  retailers: string[];
  priceRange: [number, number];
  onFilterChange: (filter: PriceFilter) => void;
  onReset: () => void;
  className?: string;
}

export interface PriceDashboardProps extends ComponentProps {
  analytics: PriceAnalytics;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}