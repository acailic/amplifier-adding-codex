# Component Architecture Design for Cenovnici Visualization System

## 1. Component Hierarchy

```typescript
// Root Provider Components
├── CenovniciApp
│   └── CenovniciProvider
│       ├── DataProvider
│       ├── LocalizationProvider
│       ├── ThemeProvider
│       └── AccessibilityProvider
│
// Main Dashboard
└── VisualizationDashboard
    ├── HeaderSection
    │   ├── TitleSection
    │   ├── LanguageToggle
    │   └── UserActions
    ├── OverviewMetrics
    │   ├── MetricCard
    │   ├── TrendIndicator
    │   └── ProgressIndicator
    ├── FilterSection
    │   ├── FilterPanel
    │   ├── QuickFilters
    │   └── AdvancedFilters
    ├── ChartSection
    │   ├── ChartContainer
    │   │   ├── TimeSeriesChart
    │   │   ├── ComparisonChart
    │   │   ├── GeographicMap
    │   │   └── DiscountAnalysis
    │   └── ChartControls
    ├── DataSection
    │   ├── DataTable
    │   ├── DataExport
    │   └── DataActions
    └── FooterSection
        ├── DataSourceInfo
        ├── LastUpdated
        └── HelpSection
```

## 2. Core Component Specifications

### 2.1 Data Provider Component

```typescript
// app/providers/DataProvider.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PriceData, PriceFilters } from '../types/price';

interface DataContextType {
  data: PriceData[];
  filteredData: PriceData[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  filters: PriceFilters;
  updateFilters: (filters: Partial<PriceFilters>) => void;
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'json') => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        data: action.payload,
        lastUpdated: new Date().toISOString()
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'APPLY_FILTERS':
      return {
        ...state,
        filteredData: applyFilters(state.data, { ...state.filters, ...action.payload })
      };
    default:
      return state;
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const updateFilters = useCallback((filters: Partial<PriceFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  }, []);

  const refreshData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const response = await fetch('/api/price-data');
      const data = await response.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <DataContext.Provider value={{
      ...state,
      updateFilters,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
```

### 2.2 Visualization Provider

```typescript
// app/providers/VisualizationProvider.tsx
import React, { createContext, useContext, useState } from 'react';
import { ChartConfig, LocaleConfig } from '../types/visualization';

interface VisualizationContextType {
  config: VisualizationConfig;
  updateConfig: (config: Partial<VisualizationConfig>) => void;
  charts: ChartConfig[];
  addChart: (chart: ChartConfig) => void;
  removeChart: (chartId: string) => void;
  layout: LayoutConfig;
  updateLayout: (layout: Partial<LayoutConfig>) => void;
}

const VisualizationContext = createContext<VisualizationContextType | null>(null);

export function VisualizationProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<VisualizationConfig>({
    theme: 'light',
    animation: true,
    responsive: true,
    language: 'sr',
    currency: 'RSD'
  });

  const [charts, setCharts] = useState<ChartConfig[]>([
    {
      id: 'price-trend',
      type: 'line',
      title: 'Ценовни трендови',
      titleSr: 'Ценовни трендови',
      dataSource: 'prices',
      config: {
        timeRange: '30d',
        showForecast: false,
        showGrid: true
      }
    },
    {
      id: 'retailer-comparison',
      type: 'bar',
      title: 'Poređenje prodavaca',
      titleSr: 'Поређење продаваца',
      dataSource: 'prices',
      config: {
        groupBy: 'retailer',
        metric: 'average',
        topN: 10
      }
    }
  ]);

  const updateConfig = useCallback((newConfig: Partial<VisualizationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return (
    <VisualizationContext.Provider value={{
      config,
      updateConfig,
      charts,
      addChart: (chart) => setCharts(prev => [...prev, chart]),
      removeChart: (chartId) => setCharts(prev => prev.filter(c => c.id !== chartId)),
      layout: { columns: 2, gap: '1rem' },
      updateLayout: (layout) => setConfig(prev => ({
        ...prev,
        layout: { ...prev.layout, ...layout }
      }))
    }}>
      {children}
    </VisualizationContext.Provider>
  );
}
```

### 2.3 Localization Provider

```typescript
// app/providers/LocalizationProvider.tsx
import React, { createContext, useContext, useState } from 'react';

type Locale = 'sr-Latn' | 'sr-Cyrl' | 'en';

interface LocalizationContextType {
  locale: Locale;
  script: 'latin' | 'cyrillic';
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, any>) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatNumber: (number: number) => string;
}

const translations = {
  'sr-Latn': {
    'dashboard.title': 'Cenovnik vizuelizacija',
    'filters.categories': 'Kategorije',
    'filters.retailers': 'Prodavci',
    'filters.priceRange': 'Opseg cena',
    'charts.priceTrend': 'Cenovni trend',
    'charts.comparison': 'Poređenje',
    'actions.export': 'Izvezi',
    'actions.refresh': 'Osveži'
  },
  'sr-Cyrl': {
    'dashboard.title': 'Ценовник визуелизација',
    'filters.categories': 'Категорије',
    'filters.retailers': 'Продавци',
    'filters.priceRange': 'Опсег цена',
    'charts.priceTrend': 'Ценовни тренд',
    'charts.comparison': 'Поређење',
    'actions.export': 'Извези',
    'actions.refresh': 'Освежи'
  },
  'en': {
    'dashboard.title': 'Price Visualization',
    'filters.categories': 'Categories',
    'filters.retailers': 'Retailers',
    'filters.priceRange': 'Price Range',
    'charts.priceTrend': 'Price Trend',
    'charts.comparison': 'Comparison',
    'actions.export': 'Export',
    'actions.refresh': 'Refresh'
  }
};

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('sr-Latn');
  const script = locale.includes('Cyrl') ? 'cyrillic' : 'latin';

  const t = (key: string, params?: Record<string, any>) => {
    let translation = translations[locale]?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, String(value));
      });
    }
    return translation;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'RSD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat(locale).format(number);
  };

  return (
    <LocalizationContext.Provider value={{
      locale,
      script,
      setLocale,
      t,
      formatCurrency,
      formatDate,
      formatNumber
    }}>
      {children}
    </LocalizationContext.Provider>
  );
}
```

## 3. Chart Component Library

### 3.1 Base Chart Component

```typescript
// app/components/charts/BaseChart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';
import { useLocalization } from '../providers/LocalizationProvider';

interface BaseChartProps {
  title?: string;
  titleKey?: string;
  subtitle?: string;
  data: any[];
  loading?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number | string;
}

export function BaseChart({
  title,
  titleKey,
  subtitle,
  data,
  loading,
  error,
  className = '',
  children,
  showLegend = true,
  showTooltip = true,
  height = 400
}: BaseChartProps) {
  const { t } = useLocalization();

  if (loading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return <ChartError error={error} />;
  }

  const displayTitle = title || (titleKey ? t(titleKey) : '');

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {displayTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{displayTitle}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

// Chart Skeleton Component
function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

// Chart Error Component
function ChartError({ error }: { error: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Greška pri učitavanju grafikona
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Time Series Chart

```typescript
// app/components/charts/TimeSeriesChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from 'recharts';
import { BaseChart } from './BaseChart';
import { PriceTrend } from '../../types/price';
import { useLocalization } from '../providers/LocalizationProvider';

interface TimeSeriesChartProps {
  data: PriceTrend[];
  timeRange?: '7d' | '30d' | '90d' | '1y';
  showForecast?: boolean;
  comparisonMode?: boolean;
  height?: number;
}

export function TimeSeriesChart({
  data,
  timeRange = '30d',
  showForecast = false,
  comparisonMode = false,
  height = 400
}: TimeSeriesChartProps) {
  const { t, formatDate, formatCurrency } = useLocalization();

  // Transform data for Recharts
  const transformedData = React.useMemo(() => {
    if (!data.length) return [];

    // Group data points by date
    const grouped = data.reduce((acc, trend) => {
      trend.dataPoints.forEach(point => {
        if (!acc[point.date]) {
          acc[point.date] = { date: point.date };
        }
        acc[point.date][trend.productName] = point.price;
        acc[point.date][`${trend.productName}_discount`] = point.discount;
      });
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">
            {formatDate(new Date(label))}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <BaseChart
      titleKey="charts.priceTrend"
      data={transformedData}
      height={height}
    >
      {comparisonMode ? (
        <LineChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatDate(new Date(date))}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {data.map((trend, index) => (
            <Line
              key={trend.productId}
              type="monotone"
              dataKey={trend.productName}
              stroke={`hsl(${index * 60}, 70%, 50%)`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      ) : (
        <ComposedChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatDate(new Date(date))}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="original_price"
            fill="#3b82f6"
            fillOpacity={0.3}
            stroke="#3b82f6"
            strokeWidth={2}
            name="Originalna cena"
          />
          <Line
            type="monotone"
            dataKey="discount_price"
            stroke="#ef4444"
            strokeWidth={2}
            name="Cena sa popustom"
          />
        </ComposedChart>
      )}
    </BaseChart>
  );
}
```

### 3.3 Geographic Heatmap

```typescript
// app/components/charts/GeographicHeatmap.tsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { BaseChart } from './BaseChart';
import { PriceHeatmapData } from '../../types/price';
import { useLocalization } from '../providers/LocalizationProvider';

interface GeographicHeatmapProps {
  data: PriceHeatmapData[];
  selectedCategory?: string;
  showRetailerLocations?: boolean;
  height?: number;
}

const serbiaBounds: [[number, number], [number, number]] = [
  [42.23, 18.81], // Southwest
  [46.19, 23.01]  // Northeast
];

const serbiaCenter: LatLngExpression = [44.21, 20.91];

export function GeographicHeatmap({
  data,
  selectedCategory,
  showRetailerLocations = false,
  height = 500
}: GeographicHeatmapProps) {
  const { t, formatCurrency } = useLocalization();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Group data by region/city
  const regionData = React.useMemo(() => {
    return data.reduce((acc, item) => {
      const region = item.location || 'Unknown';
      if (!acc[region]) {
        acc[region] = {
          region,
          retailers: [],
          avgPrice: 0,
          minPrice: Infinity,
          maxPrice: -Infinity,
          productCount: 0
        };
      }

      acc[region].retailers.push(item);
      acc[region].avgPrice = (acc[region].avgPrice * acc[region].productCount + item.avgPrice) / (acc[region].productCount + 1);
      acc[region].minPrice = Math.min(acc[region].minPrice, item.minPrice);
      acc[region].maxPrice = Math.max(acc[region].maxPrice, item.maxPrice);
      acc[region].productCount += 1;

      return acc;
    }, {} as Record<string, any>);
  }, [data]);

  // Get color based on price
  const getHeatColor = (avgPrice: number, minPrice: number, maxPrice: number) => {
    const intensity = (avgPrice - minPrice) / (maxPrice - minPrice);
    const hue = (1 - intensity) * 120; // Green to red
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Custom region style
  const getRegionStyle = (feature: any) => {
    const region = feature.properties.name;
    const data = regionData[region];

    if (!data) {
      return {
        fillColor: '#e5e7eb',
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    }

    const minPrice = Math.min(...Object.values(regionData).map((d: any) => d.avgPrice));
    const maxPrice = Math.max(...Object.values(regionData).map((d: any) => d.avgPrice));

    return {
      fillColor: getHeatColor(data.avgPrice, minPrice, maxPrice),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  return (
    <BaseChart
      title="Geografska toplotna mapa cena"
      data={data}
      height={height}
      className="p-0"
    >
      <div className="h-full">
        <MapContainer
          bounds={serbiaBounds}
          style={{ height: '100%', width: '100%' }}
          zoom={7}
          center={serbiaCenter}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Region heatmaps */}
          {/* Would need GeoJSON data for Serbian regions */}

          {/* Retailer location markers */}
          {showRetailerLocations && data.map((retailer, index) => (
            <Marker
              key={`${retailer.retailer}-${index}`}
              position={[45, 20]} // Would need actual coordinates
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold">{retailer.retailerName}</h4>
                  <p className="text-sm">
                    Prosečna cena: {formatCurrency(retailer.avgPrice)}
                  </p>
                  <p className="text-sm">
                    Broj proizvoda: {retailer.productCount}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg">
            <h4 className="font-semibold text-sm mb-2">Legenda</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Niže cene</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">Srednje cene</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Više cene</span>
              </div>
            </div>
          </div>
        </MapContainer>
      </div>
    </BaseChart>
  );
}
```

## 4. Filter Components

### 4.1 Filter Panel

```typescript
// app/components/filters/FilterPanel.tsx
import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { PriceFilters } from '../../types/price';
import { useLocalization } from '../providers/LocalizationProvider';
import { CategoryFilter } from './CategoryFilter';
import { RetailerFilter } from './RetailerFilter';
import { PriceRangeFilter } from './PriceRangeFilter';
import { DateRangeFilter } from './DateRangeFilter';

interface FilterPanelProps {
  filters: PriceFilters;
  onFiltersChange: (filters: PriceFilters) => void;
  categories: string[];
  retailers: string[];
  className?: string;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  categories,
  retailers,
  className = ''
}: FilterPanelProps) {
  const { t } = useLocalization();
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = [
    filters.categories.length,
    filters.retailers.length,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100000,
    filters.discountOnly
  ].filter(Boolean).length;

  const handleFiltersChange = (newFilters: Partial<PriceFilters>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      retailers: [],
      priceRange: [0, 100000],
      discountOnly: false,
      dateRange: undefined,
      search: undefined
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">
            {t('filters.title')}
          </h3>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFiltersCount} aktivno
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>{t('filters.clearAll')}</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          <CategoryFilter
            categories={categories}
            selectedCategories={filters.categories}
            onCategoryChange={(categories) =>
              handleFiltersChange({ categories })
            }
          />

          <RetailerFilter
            retailers={retailers}
            selectedRetailers={filters.retailers}
            onRetailerChange={(retailers) =>
              handleFiltersChange({ retailers })
            }
          />

          <PriceRangeFilter
            value={filters.priceRange}
            onChange={(priceRange) =>
              handleFiltersChange({ priceRange })
            }
          />

          <DateRangeFilter
            value={filters.dateRange}
            onChange={(dateRange) =>
              handleFiltersChange({ dateRange })
            }
          />
        </div>
      )}
    </div>
  );
}
```

### 4.2 Category Filter

```typescript
// app/components/filters/CategoryFilter.tsx
import React, { useMemo } from 'react';
import { useLocalization } from '../providers/LocalizationProvider';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onCategoryChange,
  className = ''
}: CategoryFilterProps) {
  const { t } = useLocalization();

  // Group categories by hierarchy
  const categoryGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};

    categories.forEach(category => {
      const isMainCategory = !category.includes(' > ');
      if (isMainCategory) {
        groups[category] = [category];
      }
    });

    categories.forEach(category => {
      const isSubCategory = category.includes(' > ');
      if (isSubCategory) {
        const [mainCat] = category.split(' > ');
        if (groups[mainCat]) {
          groups[mainCat].push(category);
        }
      }
    });

    return groups;
  }, [categories]);

  const handleCategoryToggle = (category: string) => {
    const isSelected = selectedCategories.includes(category);

    if (isSelected) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const handleGroupToggle = (groupName: string, groupCategories: string[]) => {
    const allSelected = groupCategories.every(cat => selectedCategories.includes(cat));

    if (allSelected) {
      onCategoryChange(
        selectedCategories.filter(cat => !groupCategories.includes(cat))
      );
    } else {
      onCategoryChange([
        ...selectedCategories,
        ...groupCategories.filter(cat => !selectedCategories.includes(cat))
      ]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900">
        {t('filters.categories')}
      </h4>

      {Object.entries(categoryGroups).map(([groupName, groupCategories]) => (
        <div key={groupName} className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={groupCategories.every(cat => selectedCategories.includes(cat))}
              onChange={() => handleGroupToggle(groupName, groupCategories)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-label={`Toggle ${groupName} group`}
            />
            <span className="text-sm font-medium text-gray-700">
              {groupName}
            </span>
          </label>

          {groupCategories.length > 1 && (
            <div className="ml-6 space-y-1">
              {groupCategories.slice(1).map(category => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {category.split(' > ')[1] || category}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 5. Export Components

### 5.1 Export Manager

```typescript
// app/components/export/ExportManager.tsx
import React, { useState } from 'react';
import { Download, FileText, Share2 } from 'lucide-react';
import { PriceData, ExportOptions } from '../../types/price';
import { useLocalization } from '../providers/LocalizationProvider';

interface ExportManagerProps {
  data: PriceData[];
  filters?: any;
  className?: string;
}

export function ExportManager({
  data,
  filters,
  className = ''
}: ExportManagerProps) {
  const { t, locale } = useLocalization();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');

  const exportOptions: ExportOptions = {
    format: exportFormat,
    includeImages: false,
    includeDescriptions: true,
    language: locale.startsWith('sr') ? 'sr' : 'en',
    currency: 'RSD'
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'csv':
          content = exportToCSV(data, exportOptions);
          filename = `cenovnici-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv;charset=utf-8;';
          break;

        case 'json':
          content = exportToJSON(data, exportOptions);
          filename = `cenovnici-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json;charset=utf-8;';
          break;

        case 'excel':
          // Would use a library like xlsx
          content = exportToExcel(data, exportOptions);
          filename = `cenovnici-${new Date().toISOString().split('T')[0]}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;

        default:
          throw new Error('Unsupported export format');
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Izvoz nije uspeo. Pokušajte ponovo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">
            {t('export.title')}
          </span>
        </div>

        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as any)}
          className="block w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="excel">Excel</option>
        </select>

        <button
          onClick={handleExport}
          disabled={isExporting || data.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('export.exporting')}</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>{t('export.export')}</span>
            </>
          )}
        </button>

        <div className="flex items-center text-sm text-gray-500">
          {t('export.recordCount', { count: data.length })}
        </div>
      </div>
    </div>
  );
}

// Export utility functions
function exportToCSV(data: PriceData[], options: ExportOptions): string {
  const headers = [
    'Produkt',
    'Brend',
    'Kategorija',
    'Prodavac',
    'Regularna cena',
    'Cena sa popustom',
    'Popust (%)',
    'Valuta',
    'Dostupnost',
    'Datum ažuriranja'
  ];

  const rows = data.map(item => [
    options.language === 'sr' ? item.productNameSr : item.productName,
    item.brand || '',
    options.language === 'sr' ? item.categorySr : item.category,
    item.retailerName,
    item.originalPrice || item.price,
    item.price,
    item.discount || 0,
    item.currency,
    item.availability,
    new Date(item.timestamp).toLocaleDateString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return '\uFEFF' + csvContent; // Add BOM for UTF-8
}

function exportToJSON(data: PriceData[], options: ExportOptions): string {
  const exportData = {
    exported_at: new Date().toISOString(),
    total_records: data.length,
    options,
    data: data.map(item => ({
      ...item,
      productName: options.language === 'sr' ? item.productNameSr : item.productName,
      category: options.language === 'sr' ? item.categorySr : item.category
    }))
  };

  return JSON.stringify(exportData, null, 2);
}

function exportToExcel(data: PriceData[], options: ExportOptions): string {
  // This would require a library like xlsx
  // For now, return CSV as placeholder
  return exportToCSV(data, options);
}
```

## 6. Dashboard Integration

```typescript
// app/components/Dashboard.tsx
import React from 'react';
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { GeographicHeatmap } from './charts/GeographicHeatmap';
import { ComparisonChart } from './charts/ComparisonChart';
import { DiscountAnalysisChart } from './charts/DiscountAnalysisChart';
import { FilterPanel } from './filters/FilterPanel';
import { ExportManager } from './export/ExportManager';
import { useData } from '../providers/DataProvider';
import { useVisualization } from '../providers/VisualizationProvider';
import { MetricsOverview } from './MetricsOverview';

export function VisualizationDashboard() {
  const { filteredData, filters, updateFilters } = useData();
  const { charts, layout } = useVisualization();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Cenovnik Vizuelizacija
            </h1>
            <ExportManager data={filteredData} filters={filters} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Overview */}
        <MetricsOverview data={filteredData} />

        {/* Filters and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={updateFilters}
              categories={['Electronics', 'Groceries', 'Fashion', 'Home & Garden']}
              retailers={['Gigatron', 'Maxi', 'Idea', 'WinWin', 'T-Mobile']}
              className="lg:sticky lg:top-6"
            />
          </div>

          {/* Charts Grid */}
          <div className="lg:col-span-3">
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
                gap: layout.gap
              }}
            >
              {charts.map(chartConfig => {
                switch (chartConfig.type) {
                  case 'line':
                    return (
                      <TimeSeriesChart
                        key={chartConfig.id}
                        data={filteredData}
                        timeRange={chartConfig.config?.timeRange}
                        showForecast={chartConfig.config?.showForecast}
                      />
                    );

                  case 'bar':
                    return (
                      <ComparisonChart
                        key={chartConfig.id}
                        data={filteredData}
                        groupBy={chartConfig.config?.groupBy}
                      />
                    );

                  case 'heatmap':
                    return (
                      <GeographicHeatmap
                        key={chartConfig.id}
                        data={filteredData}
                      />
                    );

                  case 'discount':
                    return (
                      <DiscountAnalysisChart
                        key={chartConfig.id}
                        data={filteredData}
                      />
                    );

                  default:
                    return null;
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 7. Performance Optimizations

### 7.1 Virtual Scrolling for Data Tables

```typescript
// app/components/VirtualTable.tsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { PriceData } from '../../types/price';

interface VirtualTableProps {
  data: PriceData[];
  height: number;
  itemHeight: number;
  columns: Array<{
    key: keyof PriceData;
    label: string;
    width: number;
    render?: (value: any) => React.ReactNode;
  }>;
}

export function VirtualTable({ data, height, itemHeight, columns }: VirtualTableProps) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];

    return (
      <div style={style} className="flex items-center border-b border-gray-200">
        {columns.map((column) => (
          <div
            key={column.key}
            style={{ width: column.width }}
            className="px-4 py-2 text-sm text-gray-900 truncate"
          >
            {column.render ? column.render(item[column.key]) : item[column.key]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50">
        {columns.map((column) => (
          <div
            key={column.key}
            style={{ width: column.width }}
            className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {column.label}
          </div>
        ))}
      </div>

      {/* Virtual List */}
      <List
        height={height}
        itemCount={data.length}
        itemSize={itemHeight}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}
```

### 7.2 Chart Memoization

```typescript
// app/components/charts/MemoizedChart.tsx
import React, { memo, useMemo } from 'react';
import { isEqual } from 'lodash';

// Generic memoized chart wrapper
export function createMemoizedChart<T extends Record<string, any>>(
  ChartComponent: React.ComponentType<T>,
  areEqual: (prevProps: T, nextProps: T) => boolean = isEqual
) {
  return memo(ChartComponent, areEqual);
}

// Usage example
export const MemoizedTimeSeriesChart = createMemoizedChart(TimeSeriesChart,
  (prevProps, nextProps) => {
    return (
      prevProps.data.length === nextProps.data.length &&
      prevProps.timeRange === nextProps.timeRange &&
      prevProps.showForecast === nextProps.showForecast
    );
  }
);
```

This component architecture provides a comprehensive, accessible, and performant foundation for the cenovnici visualization system, with full Serbian language support and adherence to WCAG accessibility standards.