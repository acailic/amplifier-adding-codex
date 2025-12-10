import React, { useState, useEffect } from 'react';
import { PriceData } from '../types';
import {
  SimplePriceTrendChart,
  SimplePriceComparisonChart,
  SimpleDiscountAnalysisChart,
  SimplePriceHeatmap
} from './price-charts-simple';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Percent,
  Package,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface PriceDashboardWrapperProps {
  data?: PriceData[];
  className?: string;
}

export default function PriceDashboardWrapper({
  data = [],
  className = ''
}: PriceDashboardWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const stats = React.useMemo(() => {
    if (data.length === 0) {
      return {
        totalProducts: 0,
        averagePrice: 0,
        totalDiscount: 0,
        topCategory: '',
        brandCount: 0
      };
    }

    const totalProducts = data.length;
    const averagePrice = data.reduce((sum, item) => sum + (item.price || 0), 0) / totalProducts;
    const totalDiscount = data.reduce((sum, item) => {
      const discount = (item.originalPrice || 0) - (item.price || 0);
      return sum + discount;
    }, 0);
    const topCategory = data.reduce((acc, item) => {
      acc[item.categorySr || item.category || ''] = (acc[item.categorySr || item.category || ''] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostPopularCategory = Object.entries(topCategory)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';
    const brandCount = new Set(data.map(item => item.brand || '')).size;

    return {
      totalProducts,
      averagePrice,
      totalDiscount,
      topCategory: mostPopularCategory,
      brandCount
    };
  }, [data]);

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Greška</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ukupno Proizvoda</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prosečna Cena</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(stats.averagePrice)} RSD
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ukupan Popust</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(stats.totalDiscount)} RSD
              </p>
            </div>
            <Percent className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Kategorija</p>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {stats.topCategory || 'N/A'}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Brendova</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.brandCount}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Cena</h3>
            <div className="h-80">
              <SimplePriceTrendChart data={data.slice(0, 20)} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Poređenje Cena</h3>
            <div className="h-80">
              <SimplePriceComparisonChart data={data.slice(0, 20)} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analiza Popusta</h3>
            <div className="h-80">
              <SimpleDiscountAnalysisChart data={data.slice(0, 20)} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Toplotna Mapa Cena</h3>
            <div className="h-80">
              <SimplePriceHeatmap data={data.slice(0, 20)} />
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 1000);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Osveži podatke</span>
        </button>
      </div>
    </div>
  );
}