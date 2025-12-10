import React from 'react';
import {
  PriceDashboardWrapper,
  SimplePriceTrendChart,
  SimplePriceComparisonChart,
  type PriceData
} from '@acailic/vizualni-admin';
import 'tailwindcss/tailwind.css';

// Sample data for demonstration
const sampleData: PriceData[] = [
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
    subcategory: 'computers',
    subcategorySr: 'računari',
    brand: 'TechBrand',
    availability: 'in_stock',
    location: 'Belgrade',
    locationSr: 'Beograd',
    timestamp: '2024-01-15T10:00:00Z',
    url: 'https://example.com/product/laptop-001',
    description: 'High-performance gaming laptop',
    descriptionSr: 'Performansni gejming laptop'
  },
  {
    id: '2',
    productId: 'phone-002',
    productName: 'Smartphone X',
    productNameSr: 'Smartfon X',
    retailer: 'mobilestore',
    retailerName: 'Mobile Store',
    price: 85000,
    originalPrice: 95000,
    currency: 'RSD',
    discount: 10.5,
    category: 'electronics',
    categorySr: 'elektronika',
    subcategory: 'phones',
    subcategorySr: 'telefoni',
    brand: 'MobileBrand',
    availability: 'in_stock',
    location: 'Novi Sad',
    locationSr: 'Novi Sad',
    timestamp: '2024-01-15T11:00:00Z',
    url: 'https://example.com/product/phone-002',
    description: 'Latest smartphone with great camera',
    descriptionSr: 'Najnovi smartfon sa odličnom kamerom'
  },
  {
    id: '3',
    productId: 'headphones-003',
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
    subcategory: 'audio',
    subcategorySr: 'audio',
    brand: 'SoundBrand',
    availability: 'limited',
    location: 'Niš',
    locationSr: 'Niš',
    timestamp: '2024-01-15T12:00:00Z',
    url: 'https://example.com/product/headphones-003',
    description: 'Noise-cancelling wireless headphones',
    descriptionSr: 'Bežične slušalice sa smanjenjem buke'
  }
];

export function BasicDashboardExample() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Basic Price Dashboard Example
        </h1>

        {/* Full Dashboard Wrapper */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Complete Dashboard
          </h2>
          <PriceDashboardWrapper data={sampleData} />
        </div>

        {/* Individual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Price Trend Chart
            </h2>
            <div className="h-80">
              <SimplePriceTrendChart data={sampleData} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Price Comparison Chart
            </h2>
            <div className="h-80">
              <SimplePriceComparisonChart data={sampleData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasicDashboardExample;