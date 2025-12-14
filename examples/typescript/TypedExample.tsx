import React, { useState, useEffect } from 'react';
import {
  PriceDashboardWrapper,
  type PriceData,
  type PriceFilter,
  type LocaleConfig,
  type ChartConfig,
  PriceAnalyticsDashboard,
  EnhancedPriceTrendChart
} from '@acailic/vizualni-admin';
import 'tailwindcss/tailwind.css';

// Define custom type extending PriceData
interface ExtendedPriceData extends PriceData {
  warranty?: number; // Warranty in months
  rating?: number; // Product rating 1-5
  reviews?: number; // Number of reviews
  tags?: string[]; // Product tags
}

// Custom locale configuration
const serbianLocale: LocaleConfig = {
  language: 'sr',
  currency: 'RSD',
  dateFormat: 'dd.MM.yyyy',
  numberFormat: {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  useCyrillic: false
};

// Custom chart configuration
const customChartConfig: ChartConfig = {
  title: 'Custom Chart Configuration',
  titleSr: 'Prilagođena Konfiguracija Grafikona',
  type: 'line',
  responsive: true,
  maintainAspectRatio: false,
  showLegend: true,
  showGrid: true,
  animation: true,
  colors: {
    primary: '#2563eb',    // Custom blue
    secondary: '#dc2626',  // Custom red
    accent: '#16a34a',     // Custom green
    background: '#ffffff',
    text: '#1f2937',
    grid: '#e5e7eb'
  }
};

// Extended typed data
const typedData: ExtendedPriceData[] = [
  {
    id: '1',
    productId: 'laptop-pro-001',
    productName: 'Professional Laptop',
    productNameSr: 'Profesionalni Laptop',
    retailer: 'techstore',
    retailerName: 'TechStore Serbia',
    price: 145000,
    originalPrice: 165000,
    currency: 'RSD',
    discount: 12.12,
    category: 'computers',
    categorySr: 'računari',
    subcategory: 'laptops',
    subcategorySr: 'laptop računari',
    brand: 'TechPro',
    unit: 'komad',
    quantity: 1,
    pricePerUnit: 145000,
    availability: 'in_stock',
    location: 'Beograd',
    locationSr: 'Београд',
    timestamp: '2024-01-15T10:00:00.000Z',
    url: 'https://techstore.rs/laptop-pro-001',
    imageUrl: 'https://example.com/images/laptop-pro-001.jpg',
    description: 'High-performance laptop for professionals',
    descriptionSr: 'Performansni laptop za profesionalce',
    warranty: 24,
    rating: 4.5,
    reviews: 128,
    tags: ['gaming', 'work', 'portable', 'high-performance']
  },
  {
    id: '2',
    productId: 'monitor-ultra-002',
    productName: 'Ultra Wide Monitor',
    productNameSr: 'Ultra Široki Monitor',
    retailer: 'techstore',
    retailerName: 'TechStore Serbia',
    price: 55000,
    originalPrice: 65000,
    currency: 'RSD',
    discount: 15.38,
    category: 'computers',
    categorySr: 'računari',
    subcategory: 'monitors',
    subcategorySr: 'monitori',
    brand: 'ViewMax',
    unit: 'komad',
    quantity: 1,
    pricePerUnit: 55000,
    availability: 'in_stock',
    location: 'Novi Sad',
    locationSr: 'Нови Сад',
    timestamp: '2024-01-15T10:30:00.000Z',
    url: 'https://techstore.rs/monitor-ultra-002',
    imageUrl: 'https://example.com/images/monitor-ultra-002.jpg',
    description: '34-inch ultra-wide curved monitor',
    descriptionSr: '34-inčni ultra-široki zakrivljeni monitor',
    warranty: 36,
    rating: 4.7,
    reviews: 89,
    tags: ['ultra-wide', 'curved', 'gaming', 'productivity']
  },
  {
    id: '3',
    productId: 'keyboard-mech-003',
    productName: 'Mechanical Keyboard',
    productNameSr: 'Mehanička Tastatura',
    retailer: 'gperipherials',
    retailerName: 'Gaming Peripherals',
    price: 12000,
    originalPrice: 15000,
    currency: 'RSD',
    discount: 20.0,
    category: 'accessories',
    categorySr: 'prateći pribor',
    subcategory: 'keyboards',
    subcategorySr: 'tastature',
    brand: 'KeyMaster',
    unit: 'komad',
    quantity: 1,
    pricePerUnit: 12000,
    availability: 'limited',
    location: 'Niš',
    locationSr: 'Ниш',
    timestamp: '2024-01-15T11:00:00.000Z',
    url: 'https://gperipherals.rs/keyboard-mech-003',
    imageUrl: 'https://example.com/images/keyboard-mech-003.jpg',
    description: 'RGB mechanical keyboard with blue switches',
    descriptionSr: 'RGB mehanička tastatura sa plavim prekidačima',
    warranty: 24,
    rating: 4.3,
    reviews: 256,
    tags: ['mechanical', 'rgb', 'gaming', 'blue-switches']
  }
];

// Custom hook for managing price filters
function usePriceFilters(initialData: ExtendedPriceData[]) {
  const [filters, setFilters] = useState<PriceFilter>({
    categories: [],
    retailers: [],
    priceRange: [0, 200000],
    currency: 'RSD',
    availability: ['in_stock', 'limited'],
    discountOnly: false,
    dateRange: ['2024-01-01', '2024-12-31'],
    search: '',
    sortBy: 'price',
    sortOrder: 'asc'
  });

  const [filteredData, setFilteredData] = useState<ExtendedPriceData[]>(initialData);

  useEffect(() => {
    let filtered = [...initialData];

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(item =>
        filters.categories.includes(item.categorySr || item.category)
      );
    }

    // Retailer filter
    if (filters.retailers.length > 0) {
      filtered = filtered.filter(item =>
        filters.retailers.includes(item.retailerName || item.retailer)
      );
    }

    // Price range filter
    filtered = filtered.filter(item =>
      item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]
    );

    // Availability filter
    filtered = filtered.filter(item =>
      filters.availability.includes(item.availability)
    );

    // Discount only filter
    if (filters.discountOnly) {
      filtered = filtered.filter(item =>
        item.originalPrice && item.price < item.originalPrice
      );
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.productNameSr?.toLowerCase().includes(searchLower) ||
        item.productName?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (filters.sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'discount':
          aValue = a.originalPrice && a.price < a.originalPrice
            ? ((a.originalPrice - a.price) / a.originalPrice) * 100
            : 0;
          bValue = b.originalPrice && b.price < b.originalPrice
            ? ((b.originalPrice - b.price) / b.originalPrice) * 100
            : 0;
          break;
        case 'name':
          aValue = a.productNameSr || a.productName;
          bValue = b.productNameSr || b.productName;
          break;
        default:
          aValue = a.price;
          bValue = b.price;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'desc' ? -result : result;
    });

    setFilteredData(filtered);
  }, [initialData, filters]);

  return { filters, setFilters, filteredData };
}

export function TypedExample() {
  const { filters, setFilters, filteredData } = usePriceFilters(typedData);

  // Calculate analytics
  const analytics = React.useMemo(() => {
    const totalProducts = filteredData.length;
    const totalValue = filteredData.reduce((sum, item) => sum + item.price, 0);
    const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;

    const productsWithDiscount = filteredData.filter(
      item => item.originalPrice && item.price < item.originalPrice
    );
    const discountRate = (productsWithDiscount.length / totalProducts) * 100;

    const averageRating = filteredData.reduce(
      (sum, item) => sum + (item.rating || 0),
      0
    ) / totalProducts;

    const totalReviews = filteredData.reduce(
      (sum, item) => sum + (item.reviews || 0),
      0
    );

    return {
      totalProducts,
      totalValue,
      averagePrice,
      discountRate,
      averageRating,
      totalReviews,
      inStockCount: filteredData.filter(item => item.availability === 'in_stock').length
    };
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          TypeScript Example with Custom Types
        </h1>

        {/* Analytics Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Analytics Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Total Products</p>
              <p className="text-2xl font-bold text-blue-900">{analytics.totalProducts}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Avg Price</p>
              <p className="text-2xl font-bold text-green-900">
                {Math.round(analytics.averagePrice).toLocaleString('sr-RS')} RSD
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Total Value</p>
              <p className="text-2xl font-bold text-purple-900">
                {(analytics.totalValue / 1000).toFixed(0)}k RSD
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-700 font-medium">Discount Rate</p>
              <p className="text-2xl font-bold text-orange-900">
                {analytics.discountRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="text-sm text-pink-700 font-medium">Avg Rating</p>
              <p className="text-2xl font-bold text-pink-900">
                {analytics.averageRating.toFixed(1)} ⭐
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-700 font-medium">In Stock</p>
              <p className="text-2xl font-bold text-indigo-900">
                {analytics.inStockCount}
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Dashboard with Serbian Locale
          </h2>
          <PriceDashboardWrapper
            data={filteredData}
            locale={serbianLocale}
          />
        </div>

        {/* Enhanced Chart with Custom Config */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Enhanced Chart with Custom Configuration
          </h2>
          <div className="h-80">
            <EnhancedPriceTrendChart
              data={filteredData}
              timeRange="30d"
              showForecast={true}
              config={customChartConfig}
            />
          </div>
        </div>

        {/* Type Information */}
        <div className="mt-8 bg-gray-800 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Type Information</h3>
          <p className="text-sm text-gray-300 mb-2">
            This example demonstrates TypeScript usage with:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            <li>Extended PriceData interface with custom properties</li>
            <li>Type-safe filter management with custom hook</li>
            <li>Configurable locale settings for Serbian language</li>
            <li>Custom chart configurations</li>
            <li>Full TypeScript IntelliSense support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TypedExample;