# @acailic/vizualni-admin

Serbian data visualization admin dashboard components with price analytics. Built with React, TypeScript, and Recharts.

## 🚀 Features

- **Price Analytics Dashboard**: Comprehensive price monitoring and analysis
- **Interactive Charts**: Various chart types powered by Recharts
- **Serbian Language Support**: Full localization for Serbian market
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **TypeScript Support**: Fully typed components
- **Customizable Themes**: Easy to style and customize

## 📦 Installation

```bash
npm install @acailic/vizualni-admin
# or
yarn add @acailic/vizualni-admin
# or
pnpm add @acailic/vizualni-admin
```

## 🔧 Dependencies

This package has the following peer dependencies:

```json
{
  "react": ">=16.8.0",
  "react-dom": ">=16.8.0"
}
```

## 📚 Usage

### Basic Price Dashboard

```tsx
import React from 'react';
import { PriceDashboardWrapper } from '@acailic/vizualni-admin';
import { PriceData } from '@acailic/vizualni-admin';

const sampleData: PriceData[] = [
  {
    id: '1',
    productId: 'prod-1',
    productName: 'Laptop Pro',
    productNameSr: 'Laptop Pro',
    retailer: 'techshop',
    retailerName: 'TechShop',
    price: 120000,
    originalPrice: 140000,
    currency: 'RSD',
    discount: 14.3,
    category: 'electronics',
    categorySr: 'elektronika',
    brand: 'BrandName',
    availability: 'in_stock',
    timestamp: '2024-01-15T10:00:00Z'
  },
  // ... more data
];

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Price Dashboard</h1>
      <PriceDashboardWrapper data={sampleData} />
    </div>
  );
}

export default App;
```

### Individual Chart Components

```tsx
import {
  SimplePriceTrendChart,
  EnhancedPriceTrendChart,
  CategoryDistributionChart,
  SimplePriceFilter
} from '@acailic/vizualni-admin';

function ChartsExample() {
  const [filters, setFilters] = React.useState({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 100000 }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Price Trends</h3>
        <SimplePriceTrendChart data={sampleData} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Enhanced Trends</h3>
        <EnhancedPriceTrendChart
          data={sampleData}
          showForecast={true}
          timeRange="30d"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <CategoryDistributionChart data={sampleData} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <SimplePriceFilter
          data={sampleData}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
    </div>
  );
}
```

### Analytics Dashboard

```tsx
import { PriceAnalyticsDashboard } from '@acailic/vizualni-admin';

function AnalyticsExample() {
  return (
    <PriceAnalyticsDashboard
      data={sampleData}
      className="max-w-7xl mx-auto"
    />
  );
}
```

## 🎨 Available Components

### Core Components

- **`PriceDashboardWrapper`**: Complete dashboard with stats and charts
- **`PriceAnalyticsDashboard`**: Advanced analytics with real-time alerts
- **`SimplePriceFilter`**: Filter panel for price data

### Chart Components

#### Simple Charts
- **`SimplePriceTrendChart`**: Basic price trend line chart
- **`SimplePriceComparisonChart`**: Price comparison bar chart
- **`SimpleDiscountAnalysisChart`**: Discount distribution pie chart
- **`SimplePriceHeatmap`**: Category/brand price heatmap

#### Enhanced Charts
- **`EnhancedPriceTrendChart`**: Advanced trend with forecasting
- **`CategoryDistributionChart`**: Category distribution pie chart
- **`PriceVolatilityChart`**: Price volatility analysis
- **`RetailerComparisonRadar`**: Multi-dimensional retailer comparison
- **`PriceScatterPlot`**: Price vs discount scatter plot
- **`MarketShareTreemap`**: Market share treemap visualization

## 📝 Type Definitions

The package exports comprehensive TypeScript types:

```tsx
import type {
  PriceData,
  PriceAnalytics,
  PriceFilter,
  ChartConfig,
  LocaleConfig
} from '@acailic/vizualni-admin';

// Example: Using types
const myData: PriceData[] = [
  {
    id: '1',
    productId: 'prod-1',
    productName: 'Product Name',
    productNameSr: 'Naziv Proizvoda',
    retailer: 'retailer-code',
    retailerName: 'Retailer Name',
    price: 10000,
    originalPrice: 12000,
    currency: 'RSD',
    category: 'category',
    categorySr: 'kategorija',
    availability: 'in_stock',
    timestamp: '2024-01-15T10:00:00Z'
  }
];
```

## 🌍 Localization

All components support Serbian language out of the box:

```tsx
import { LocaleConfig } from '@acailic/vizualni-admin';

const serbianConfig: LocaleConfig = {
  language: 'sr',
  currency: 'RSD',
  dateFormat: 'dd.MM.yyyy',
  numberFormat: {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  },
  useCyrillic: false
};

// Use with components
<PriceDashboardWrapper
  data={data}
  locale={serbianConfig}
/>
```

## 🎯 Customization

### Custom Colors

```tsx
import { ChartConfig } from '@acailic/vizualni-admin';

const customTheme: ChartConfig = {
  title: 'Custom Chart',
  type: 'line',
  responsive: true,
  maintainAspectRatio: false,
  showLegend: true,
  showGrid: true,
  animation: true,
  colors: {
    primary: '#3b82f6',
    secondary: '#ef4444',
    accent: '#10b981',
    background: '#ffffff',
    text: '#1f2937',
    grid: '#e5e7eb'
  }
};
```

### Custom Styling

All components accept a `className` prop for custom styling:

```tsx
<PriceDashboardWrapper
  data={data}
  className="custom-dashboard bg-gray-50 rounded-xl"
/>
```

## 🔄 Data Format

The components expect data in the `PriceData` format:

```tsx
interface PriceData {
  id: string;                    // Unique identifier
  productId: string;             // Product identifier
  productName: string;           // Product name (English)
  productNameSr: string;         // Product name (Serbian)
  retailer: string;              // Retailer code
  retailerName: string;          // Retailer display name
  price: number;                 // Current price
  originalPrice?: number;        // Original price before discount
  currency: 'RSD' | 'EUR';       // Currency code
  discount?: number;             // Discount percentage
  category: string;              // Category (English)
  categorySr: string;            // Category (Serbian)
  subcategory?: string;          // Subcategory (English)
  subcategorySr?: string;        // Subcategory (Serbian)
  brand?: string;                // Brand name
  unit?: string;                 // Unit of measurement
  quantity?: number;             // Quantity
  pricePerUnit?: number;         // Price per unit
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  location?: string;             // Location (English)
  locationSr?: string;           // Location (Serbian)
  timestamp: string;             // ISO timestamp
  url?: string;                  // Product URL
  imageUrl?: string;             // Product image URL
  description?: string;          // Description (English)
  descriptionSr?: string;        // Description (Serbian)
}
```

## 📖 Examples

For complete examples, check the `/examples` directory in the package or visit the GitHub repository.

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build the package
pnpm build

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## 📄 License

MIT © [Aleksandar Ilic](https://github.com/acailic)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📞 Support

- 📧 Email: aleksandar.ilic.dev@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/acailic/improvements-ampl/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/acailic/improvements-ampl/wiki)

## 🔗 Related Packages

- [@acailic/vizualni-core](https://www.npmjs.com/package/@acailic/vizualni-core) - Core visualization utilities
- [@acailic/vizualni-themes](https://www.npmjs.com/package/@acailic/vizualni-themes) - Pre-built themes

---

Made with ❤️ for the Serbian developer community