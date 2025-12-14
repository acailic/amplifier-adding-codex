# Price Visualization Components

A comprehensive set of React/TypeScript components for visualizing Serbian price data, built with Material-UI and Recharts.

## Overview

This module provides a complete solution for displaying price comparisons, trends, discount analysis, and heatmaps for Serbian market data. All components support Serbian language (both Latin and Cyrillic scripts), RSD/EUR currencies, and are fully responsive.

## Components

### PriceComparisonChart
Compares prices across different retailers for selected products with grouping and filtering capabilities.

**Features:**
- Bar chart visualization
- Group by category, retailer, or individual products
- Discount filtering
- Interactive tooltips
- Serbian language support

```tsx
import { PriceComparisonChart } from '@/app/charts/price';

<PriceComparisonChart
  data={priceData}
  showRetailerComparison={true}
  groupByCategory={true}
  locale={serbianLocale}
/>
```

### PriceTrendChart
Shows price trends over time with forecasting capabilities.

**Features:**
- Line and area chart modes
- Time range selection (7d, 30d, 90d, 1y, all)
- Price forecasting
- Multiple product comparison
- Export functionality

```tsx
import { PriceTrendChart } from '@/app/charts/price';

<PriceTrendChart
  data={trendData}
  timeRange="30d"
  showForecast={true}
  compareRetailers={true}
/>
```

### DiscountAnalysisChart
Analyzes discount patterns and trends across categories and retailers.

**Features:**
- Multiple visualization types (bar, pie, trend)
- Group by category, retailer, or brand
- Discount distribution analysis
- Minimum discount filtering
- Summary statistics

```tsx
import { DiscountAnalysisChart } from '@/app/charts/price';

<DiscountAnalysisChart
  data={discountData}
  groupByCategory={true}
  showTrends={true}
  minDiscountPercentage={10}
/>
```

### PriceHeatmap
Visualizes price changes across categories and retailers as a heatmap.

**Features:**
- Grid-based heatmap visualization
- Color scale options (warm, cool, divergent)
- Price and price change metrics
- Interactive cells with detailed information
- Configurable data labels

```tsx
import { PriceHeatmap } from '@/app/charts/price';

<PriceHeatmap
  data={heatmapData}
  colorScale="warm"
  showValues={true}
  aggregateBy="both"
/>
```

### PriceFilterPanel
Comprehensive filtering component for price data.

**Features:**
- Search functionality
- Category and retailer filtering
- Price range slider
- Availability status
- Sort options
- Currency selection

```tsx
import { PriceFilterPanel } from '@/app/charts/price';

<PriceFilterPanel
  filter={activeFilter}
  categories={categories}
  retailers={retailers}
  priceRange={priceRange}
  onFilterChange={handleFilterChange}
  onReset={handleReset}
/>
```

### PriceDashboard
Main dashboard integrating all price visualization components.

**Features:**
- KPI cards with key metrics
- Integrated chart display
- Auto-refresh capability
- Export functionality
- Responsive layout
- Filter integration

```tsx
import { PriceDashboard } from '@/app/charts/price';

<PriceDashboard
  data={priceData}
  analytics={analytics}
  onRefresh={handleRefresh}
  autoRefresh={true}
  locale={serbianLocale}
/>
```

## Data Types

### PriceData
```typescript
interface PriceData {
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
```

### Locale Configuration
```typescript
interface LocaleConfig {
  language: 'sr' | 'en';
  currency: 'RSD' | 'EUR';
  dateFormat: 'dd.MM.yyyy' | 'MM/dd/yyyy' | 'dd-MM-yyyy';
  numberFormat: Intl.NumberFormatOptions;
  useCyrillic: boolean;
}
```

## Utilities

### Currency Formatting
```typescript
import { formatCurrency, convertCurrency } from '@/app/charts/price';

// Format currency with locale
formatCurrency(89999, 'RSD', serbianLocale); // "89.999 RSD"

// Convert between currencies
convertCurrency(1000, 'EUR', 'RSD'); // 117600
```

### Date Formatting
```typescript
import { formatDate } from '@/app/charts/price';

formatDate('2024-01-15', serbianLocale); // "15.01.2024"
```

### Text Localization
```typescript
import { localizeText, latinToCyrillic } from '@/app/charts/price';

// Get localized text
localizeText('Price', 'Цена', serbianLocale); // "Цена"

// Convert to Cyrillic
latinToCyrillic('Cena'); // "Цена"
```

## Serbian Language Support

All components support Serbian language with both Latin and Cyrillic scripts:

```typescript
const serbianLocale = {
  language: 'sr',
  currency: 'RSD',
  dateFormat: 'dd.MM.yyyy',
  numberFormat: { style: 'currency', currency: 'RSD' },
  useCyrillic: false, // Set to true for Cyrillic
};

<PriceComparisonChart
  data={priceData}
  locale={serbianLocale}
/>
```

## Data Processing

### Importing Processed Data
```typescript
// Import from amplifier output
import processedData from '../../amplifier/output/price-analysis.json';

// Transform to component format
const priceData: PriceData[] = processedData.map(item => ({
  id: item.id,
  productId: item.product_id,
  productName: item.name,
  productNameSr: item.name_sr,
  // ... map other fields
}));
```

### Data Transformation
```typescript
import { groupByCategory, calculateAveragePrice, getPriceRange } from '@/app/charts/price';

// Group data by category
const categoryGroups = groupByCategory(priceData);

// Calculate statistics
const avgPrice = calculateAveragePrice(priceData, 'RSD');
const { min, max } = getPriceRange(priceData, 'RSD');
```

## Styling and Theming

Components use Material-UI's theming system. You can customize colors, typography, and spacing:

```typescript
import { createTheme } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

<ThemeProvider theme={customTheme}>
  <PriceDashboard data={priceData} />
</ThemeProvider>
```

## Testing

All components include comprehensive test coverage:

```bash
# Run tests
npm test app/charts/price

# Run with coverage
npm test -- --coverage app/charts/price
```

## Performance Considerations

- Components use React.memo for optimization
- Large datasets are automatically paginated
- Debounced search and filtering
- Lazy loading for chart components
- Efficient data processing with useMemo

## Accessibility

All components follow WCAG guidelines:
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus indicators

## Export Options

Components support multiple export formats:
- CSV (Comma Separated Values)
- JSON (JavaScript Object Notation)
- Excel (XLSX format)
- PNG (Chart image)

```typescript
const handleExport = (options: ExportOptions) => {
  // Handle export logic
};

<PriceDashboard onExport={handleExport} />
```

## Error Handling

Components include comprehensive error handling:
- Loading states
- Error boundaries
- Fallback displays
- Retry mechanisms
- Error reporting

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- TypeScript 5+
- Material-UI 5+
- Recharts 2+
- Lucide React (icons)

## Contributing

When adding new features:
1. Update TypeScript types
2. Add comprehensive tests
3. Include Serbian translations
4. Update documentation
5. Follow existing code patterns

## License

MIT License - see LICENSE file for details.