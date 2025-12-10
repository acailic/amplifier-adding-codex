import React, { useState } from 'react';
import {
  PriceAnalyticsDashboard,
  SimplePriceFilter,
  EnhancedPriceTrendChart,
  CategoryDistributionChart,
  PriceVolatilityChart,
  type PriceData,
  type PriceFilters
} from '@acailic/vizualni-admin';
import 'tailwindcss/tailwind.css';

// Extended sample data for advanced analytics
const extendedData: PriceData[] = [
  {
    id: '1',
    productId: 'laptop-001',
    productName: 'Gaming Laptop Pro',
    productNameSr: 'Gejming Laptop Pro',
    retailer: 'techshop',
    retailerName: 'TechShop',
    price: 120000,
    originalPrice: 140000,
    currency: 'RSD',
    discount: 14.3,
    category: 'electronics',
    categorySr: 'elektronika',
    brand: 'TechBrand',
    availability: 'in_stock',
    timestamp: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    productId: 'laptop-002',
    productName: 'Business Laptop',
    productNameSr: 'Poslovni Laptop',
    retailer: 'techshop',
    retailerName: 'TechShop',
    price: 95000,
    originalPrice: 110000,
    currency: 'RSD',
    discount: 13.6,
    category: 'electronics',
    categorySr: 'elektronika',
    brand: 'WorkBrand',
    availability: 'in_stock',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: '3',
    productId: 'phone-001',
    productName: 'Flagship Phone',
    productNameSr: 'Premium Telefon',
    retailer: 'mobilestore',
    retailerName: 'Mobile Store',
    price: 125000,
    currency: 'RSD',
    category: 'electronics',
    categorySr: 'elektronika',
    brand: 'PremiumBrand',
    availability: 'limited',
    timestamp: '2024-01-15T11:00:00Z'
  },
  {
    id: '4',
    productId: 'phone-002',
    productName: 'Budget Phone',
    productNameSr: 'Povoljan Telefon',
    retailer: 'mobilestore',
    retailerName: 'Mobile Store',
    price: 35000,
    originalPrice: 40000,
    currency: 'RSD',
    discount: 12.5,
    category: 'electronics',
    categorySr: 'elektronika',
    brand: 'BudgetBrand',
    availability: 'in_stock',
    timestamp: '2024-01-15T11:30:00Z'
  },
  {
    id: '5',
    productId: 'tablet-001',
    productName: 'Pro Tablet',
    productNameSr: 'Pro Tablet',
    retailer: 'techshop',
    retailerName: 'TechShop',
    price: 75000,
    originalPrice: 85000,
    currency: 'RSD',
    discount: 11.8,
    category: 'electronics',
    categorySr: 'elektronika',
    brand: 'TechBrand',
    availability: 'out_of_stock',
    timestamp: '2024-01-15T12:00:00Z'
  },
  {
    id: '6',
    productId: 'headphones-001',
    productName: 'Wireless Headphones',
    productNameSr: 'Bežične Slušalice',
    retailer: 'audioworld',
    retailerName: 'Audio World',
    price: 15000,
    originalPrice: 18000,
    currency: 'RSD',
    discount: 16.7,
    category: 'electronics',
    categorySr: 'elektronika',
    brand: 'SoundBrand',
    availability: 'in_stock',
    timestamp: '2024-01-15T12:30:00Z'
  },
  {
    id: '7',
    productId: 'tv-001',
    productName: 'Smart TV 55"',
    productNameSr: 'Smart TV 55"',
    retailer: 'megastore',
    retailerName: 'Mega Store',
    price: 85000,
    currency: 'RSD',
    category: 'electronics',
    categorySr: 'elektronika',
    brand: 'ViewBrand',
    availability: 'in_stock',
    timestamp: '2024-01-15T13:00:00Z'
  },
  {
    id: '8',
    productId: 'camera-001',
    productName: 'DSLR Camera',
    productNameSr: 'DSLR Kamera',
    retailer: 'photostore',
    retailerName: 'Photo Store',
    price: 110000,
    originalPrice: 130000,
    currency: 'RSD',
    discount: 15.4,
    category: 'electronics',
    categorySr: 'elektronika',
    brand: 'PhotoBrand',
    availability: 'limited',
    timestamp: '2024-01-15T13:30:00Z'
  }
];

export function AdvancedAnalyticsExample() {
  const [filters, setFilters] = useState<PriceFilters>({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 200000 },
    discountRange: { min: 0, max: 100 },
    dateRange: { start: '', end: '' }
  });

  // Filter data based on active filters
  const filteredData = React.useMemo(() => {
    return extendedData.filter(item => {
      // Category filter
      if (filters.categories.length > 0) {
        const categoryMatch = filters.categories.includes(
          item.categorySr || item.category
        );
        if (!categoryMatch) return false;
      }

      // Brand filter
      if (filters.brands.length > 0) {
        const brandMatch = filters.brands.includes(item.brand || '');
        if (!brandMatch) return false;
      }

      // Price range filter
      if (item.price < filters.priceRange.min || item.price > filters.priceRange.max) {
        return false;
      }

      return true;
    });
  }, [extendedData, filters]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Advanced Analytics Example
        </h1>

        {/* Filter Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Filters
          </h2>
          <SimplePriceFilter
            data={extendedData}
            filters={filters}
            onFilterChange={setFilters}
          />
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredData.length} of {extendedData.length} products
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Analytics Dashboard
          </h2>
          <PriceAnalyticsDashboard data={filteredData} />
        </div>

        {/* Individual Advanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Enhanced Price Trends (with Forecast)
            </h2>
            <div className="h-80">
              <EnhancedPriceTrendChart
                data={filteredData}
                timeRange="30d"
                showForecast={true}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Category Distribution
            </h2>
            <div className="h-80">
              <CategoryDistributionChart data={filteredData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Price Volatility Analysis
            </h2>
            <div className="h-80">
              <PriceVolatilityChart data={filteredData} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Filter Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Total Products</span>
                <span className="text-lg font-semibold text-gray-900">
                  {filteredData.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Average Price</span>
                <span className="text-lg font-semibold text-gray-900">
                  {filteredData.length > 0
                    ? Math.round(
                        filteredData.reduce((sum, item) => sum + item.price, 0) /
                        filteredData.length
                      ).toLocaleString('sr-RS')
                    : '0'} RSD
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Products with Discount</span>
                <span className="text-lg font-semibold text-gray-900">
                  {filteredData.filter(item => item.originalPrice && item.price < item.originalPrice).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">In Stock</span>
                <span className="text-lg font-semibold text-gray-900">
                  {filteredData.filter(item => item.availability === 'in_stock').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedAnalyticsExample;