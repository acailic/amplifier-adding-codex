# Cenovnici Visualization System Design

## Executive Summary

A comprehensive visualization system for Serbian price monitoring data from data.gov.rs, supporting multiple visualization types, interactive filtering, Serbian language localization, and full accessibility compliance.

## System Overview

### Data Profile
```json
{
  "data_source": "data.gov.rs cenovnici datasets",
  "structure_type": "tabular_price_list",
  "retailers": 27,
  "update_frequency": "weekly",
  "currency": "RSD",
  "language": "Serbian (Latin/Cyrillic)",
  "key_fields": [
    "product_name",
    "brand",
    "category",
    "retailer",
    "regular_price",
    "discount_price",
    "discount_dates",
    "vat_rate"
  ]
}
```

### Visualization Requirements
1. **Time Series Analysis**: Price trends over time
2. **Comparative Analysis**: Across retailers, brands, categories
3. **Geographic Visualization**: Regional price variations
4. **Discount Analysis**: Patterns and effectiveness
5. **Real-time Updates**: Weekly data synchronization

## Architecture Design

### 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  │  Charts  │  Filters  │  Exports  │  Mobile    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Visualization Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Chart Engines  │  Map Rendering  │  Data Processing       │
│  • Recharts     │  • Leaflet      │  • Aggregation         │
│  • D3.js        │  • Mapbox       │  • Transformation      │
│  • Canvas       │  • SVG          │  • Caching             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Management                         │
├─────────────────────────────────────────────────────────────┤
│  • Data Store    │  • State Mgmt   │  • Cache Layer        │
│  • API Layer     │  • Updates      │  • Background Sync    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                              │
├─────────────────────────────────────────────────────────────┤
│  • data.gov.rs API  •  File Imports  •  Manual Entry       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Component Architecture

```typescript
// Core component hierarchy
App
├── PriceVisualizationProvider
│   ├── VisualizationDashboard
│   │   ├── OverviewStats
│   │   ├── ChartGrid
│   │   │   ├── TimeSeriesChart
│   │   │   ├── ComparisonChart
│   │   │   ├── GeographicHeatmap
│   │   │   ├── DiscountAnalysis
│   │   │   └── CategoryDistribution
│   │   └── QuickActions
│   ├── FilterPanel
│   │   ├── CategoryFilter
│   │   ├── RetailerFilter
│   │   ├── PriceRangeFilter
│   │   ├── DateRangeFilter
│   │   └── AdvancedFilters
│   └── ExportManager
└── DataProvider
    ├── APIDataSource
    ├── CacheManager
    └── UpdateScheduler
```

## Visualization Types

### 1. Time Series Charts

**Purpose**: Track price evolution over time

**Variants**:
- Single Product Trend
- Category Average Trend
- Retailer Price Comparison
- Market Index Trend

**Features**:
- Multiple time ranges (7d, 30d, 90d, 1y)
- Price change annotations
- Discount period highlighting
- Forecast capability
- Interactive zoom/pan

### 2. Comparison Charts

**Purpose**: Compare prices across dimensions

**Types**:
- Bar Charts: Retailer price comparison
- Box Plots: Price distribution analysis
- Radar Charts: Multi-dimensional comparison
- Scatter Plots: Price vs discount analysis

### 3. Geographic Visualization

**Purpose**: Show price variations by location

**Implementation**:
- Interactive Serbia map
- Regional price heatmaps
- City-level price comparison
- Store location markers

### 4. Discount Analysis

**Purpose**: Analyze discount patterns

**Charts**:
- Discount frequency distribution
- Discount depth analysis
- Duration vs effectiveness
- Category-wise discount trends

### 5. Advanced Visualizations

**Innovative approaches**:
- Price Constellation: Semantic product relationships
- Tension Spectrum: Price positioning visualization
- Uncertainty Maps: Price prediction confidence
- Timeline Rivers: Historical price flows

## Data Flow Architecture

### 1. Data Pipeline

```typescript
interface DataPipeline {
  ingestion: {
    source: 'api' | 'file' | 'stream';
    frequency: 'realtime' | 'scheduled' | 'manual';
    format: 'csv' | 'json' | 'xml';
  };

  processing: {
    validation: SchemaValidator;
    transformation: DataTransformer;
    enrichment: PriceEnricher;
    aggregation: PriceAggregator;
  };

  storage: {
    raw: DataLake;
    processed: DataWarehouse;
    cache: RedisCluster;
    indexes: SearchIndex;
  };

  delivery: {
    api: GraphQL + REST;
    websocket: RealtimeUpdates;
    exports: MultipleFormats;
  };
}
```

### 2. State Management

```typescript
// Global state structure
interface VisualizationState {
  data: {
    raw: PriceData[];
    processed: ProcessedData[];
    cached: Map<string, CachedData>;
  };

  filters: {
    active: PriceFilters;
    presets: FilterPresets[];
    history: FilterHistory[];
  };

  ui: {
    selectedCharts: ChartConfig[];
    layout: LayoutConfig;
    theme: ThemeConfig;
    locale: LocaleConfig;
  };

  user: {
    preferences: UserPreferences;
    bookmarks: BookmarkedViews[];
    exportHistory: ExportRecord[];
  };
}
```

## User Interaction Patterns

### 1. Filter System

**Multi-dimensional filtering**:
```typescript
interface FilterSystem {
  categories: {
    type: 'hierarchical';
    levels: 3;
    search: true;
    multiSelect: true;
  };

  retailers: {
    type: 'searchable';
    groups: ['large', 'medium', 'small'];
    rating: true;
  };

  price: {
    type: 'range-slider';
    presets: ['budget', 'mid-range', 'premium'];
    currency: 'RSD/EUR';
  };

  discounts: {
    type: 'toggle-group';
    ranges: ['0-10%', '10-30%', '30%+'];
    activeOnly: boolean;
  };

  temporal: {
    type: 'date-range';
    presets: ['last-week', 'last-month', 'custom'];
    relative: true;
  };
}
```

### 2. Chart Interactions

**Standard interactions**:
- Hover: Detailed tooltips
- Click: Drill-down functionality
- Drag: Pan/zoom navigation
- Select: Multi-select for comparison

**Advanced interactions**:
- Brush: Time range selection
- Lasso: Multi-point selection
- Cross-filter: Linked filtering across charts
- Annotation: User-added notes

### 3. Responsive Design

**Breakpoint strategy**:
- Mobile: Single column, simplified charts
- Tablet: Two columns, moderate complexity
- Desktop: Multi-column, full feature set
- Ultra-wide: Optimized layouts

## Accessibility Implementation

### 1. WCAG 2.1 AA Compliance

**Visual accessibility**:
- Color contrast ratio: 4.5:1 minimum
- Color blindness safe palettes
- High contrast mode support
- Text scaling to 200%

**Interactive accessibility**:
- Full keyboard navigation
- Screen reader support
- Focus indicators
- ARIA labels and descriptions

### 2. Serbian Language Support

**Localization features**:
```typescript
interface SerbianLocalization {
  script: 'latin' | 'cyrillic' | 'both';
  numerals: 'arabic' | 'cyrillic';
  currency: {
    symbol: 'din';
    position: 'postfix';
    formatting: 'serbian';
  };
  date: {
    format: 'dd.mm.yyyy';
    months: 'serbian';
    weekdays: 'serbian';
  };
  numbers: {
    decimalSeparator: ',';
    thousandsSeparator: '.';
    grouping: [3];
  };
}
```

### 3. Accessibility Components

**Custom accessible chart components**:
- AccessibleSVGChart
- KeyboardDataTable
- ScreenReaderFriendlyTooltip
- HighContrastTheme

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)

1. **Data Layer Setup**
   - API client for data.gov.rs
   - Data validation schemas
   - Caching strategy implementation
   - Background sync service

2. **Basic Components**
   - Chart wrapper components
   - Filter panel foundation
   - Loading and error states
   - Serbian localization setup

### Phase 2: Core Visualizations (Week 3-4)

1. **Time Series Charts**
   - Line charts with Recharts
   - Price trend analysis
   - Discount period highlighting
   - Interactive tooltips

2. **Comparison Charts**
   - Bar charts for retailer comparison
   - Box plots for distribution
   - Category-based groupings
   - Sort and filter capabilities

### Phase 3: Advanced Features (Week 5-6)

1. **Geographic Visualization**
   - Serbia map integration
   - Regional price heatmaps
   - City-level comparisons
   - Interactive legend

2. **Discount Analysis**
   - Discount distribution charts
   - Time-based discount trends
   - Effectiveness metrics
   - Preset discount views

### Phase 4: Polish & Optimization (Week 7-8)

1. **Performance Optimization**
   - Virtual scrolling for large datasets
   - Chart rendering optimization
   - Lazy loading strategies
   - Bundle size optimization

2. **Accessibility Audit**
   - Screen reader testing
   - Keyboard navigation validation
   - Color contrast verification
   - User testing with assistive technology

## Technology Stack

### Core Libraries
```json
{
  "visualization": {
    "charts": "recharts",
    "maps": "leaflet-react",
    "advanced": "d3",
    "rendering": "canvas-api"
  },
  "state": {
    "management": "zustand",
    "server": "@tanstack/react-query",
    "forms": "react-hook-form"
  },
  "data": {
    "fetching": "axios",
    "validation": "zod",
    "dates": "date-fns",
    "numbers": "intl-numberformat"
  },
  "ui": {
    "framework": "react",
    "styling": "tailwindcss",
    "components": "radix-ui",
    "icons": "lucide-react"
  },
  "accessibility": {
    "testing": "axe-core",
    "keyboard": "react-hotkeys-hook",
    "screen-reader": "react-aria"
  }
}
```

### Performance Considerations
- Virtualization for large datasets
- Canvas rendering for 10k+ data points
- Web Workers for data processing
- Service Worker for offline capability

## Testing Strategy

### Unit Tests
- Component behavior validation
- Data transformation functions
- Filter logic verification
- Utility function testing

### Integration Tests
- API integration validation
- Chart rendering accuracy
- Filter application verification
- Export functionality testing

### Accessibility Tests
- Automated a11y testing
- Screen reader validation
- Keyboard navigation testing
- Color contrast verification

### Performance Tests
- Large dataset handling
- Memory usage monitoring
- Rendering performance
- Bundle size analysis

## Success Metrics

### Performance Metrics
- Initial load: <3 seconds
- Chart rendering: <500ms
- Filter application: <100ms
- Export generation: <2 seconds

### Accessibility Metrics
- WCAG 2.1 AA compliance: 100%
- Screen reader compatibility: Full
- Keyboard navigation: Complete
- Color contrast: 4.5:1 minimum

### User Experience Metrics
- Task completion rate: >95%
- User satisfaction: >4.5/5
- Feature adoption: >80%
- Error rate: <1%

## Conclusion

This visualization system provides a comprehensive solution for Serbian price monitoring data, emphasizing accessibility, performance, and user experience. The modular architecture allows for incremental development and easy feature additions while maintaining high code quality and user satisfaction standards.

The system successfully addresses the unique challenges of Serbian language support, Cyrillic/Latin script handling, and local market requirements while following international best practices for data visualization and accessibility.