import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Store,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  BarChart3
} from 'lucide-react';
import { PriceData } from '../types';
import {
  EnhancedPriceTrendChart,
  CategoryDistributionChart,
  PriceVolatilityChart,
  RetailerComparisonRadar,
  PriceScatterPlot,
  MarketShareTreemap
} from './enhanced-price-charts';

interface AnalyticsDashboardProps {
  data: PriceData[];
  className?: string;
}

interface PriceAlert {
  id: string;
  type: 'price_drop' | 'low_stock' | 'new_high' | 'out_of_stock';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export function PriceAnalyticsDashboard({ data, className = '' }: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const analytics = useMemo(() => {
    const totalProducts = data.length;
    const totalValue = data.reduce((sum, item) => sum + (item.price || 0), 0);
    const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;

    const productsWithDiscount = data.filter(item => item.originalPrice && item.originalPrice > item.price);
    const discountRate = (productsWithDiscount.length / totalProducts) * 100;
    const averageDiscount = productsWithDiscount.length > 0
      ? productsWithDiscount.reduce((sum, item) => {
          const discount = ((item.originalPrice! - item.price) / item.originalPrice!) * 100;
          return sum + discount;
        }, 0) / productsWithDiscount.length
      : 0;

    // Price trends
    const priceChanges = data.slice(0, 10).map(item => ({
      name: item.productNameSr?.substring(0, 20) || 'Proizvod',
      change: (Math.random() - 0.5) * 20, // Simulated price change
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));

    // Top performing categories
    const categoryPerformance = data.reduce((acc, item) => {
      const category = item.categorySr || 'Ostalo';
      if (!acc[category]) {
        acc[category] = { count: 0, totalValue: 0, avgPrice: 0 };
      }
      acc[category].count++;
      acc[category].totalValue += item.price || 0;
      acc[category].avgPrice = acc[category].totalValue / acc[category].count;
      return acc;
    }, {} as Record<string, { count: number; totalValue: number; avgPrice: number }>);

    // Retailer performance
    const retailerStats = data.reduce((acc, item) => {
      const retailer = item.retailerName || 'Ostalo';
      if (!acc[retailer]) {
        acc[retailer] = {
          count: 0,
          avgPrice: 0,
          totalValue: 0,
          discountRate: 0,
          availability: 0
        };
      }
      acc[retailer].count++;
      acc[retailer].totalValue += item.price || 0;
      acc[retailer].avgPrice = acc[retailer].totalValue / acc[retailer].count;

      if (item.originalPrice && item.price < item.originalPrice) {
        acc[retailer].discountRate++;
      }

      if (item.availability === 'in_stock') {
        acc[retailer].availability++;
      }

      return acc;
    }, {} as Record<string, any>);

    Object.keys(retailerStats).forEach(retailer => {
      const stats = retailerStats[retailer];
      stats.discountRate = (stats.discountRate / stats.count) * 100;
      stats.availability = (stats.availability / stats.count) * 100;
    });

    return {
      totalProducts,
      totalValue,
      averagePrice,
      discountRate,
      averageDiscount,
      priceChanges,
      categoryPerformance,
      retailerStats,
      priceRanges: {
        budget: data.filter(item => (item.price || 0) < 5000).length,
        midRange: data.filter(item => (item.price || 0) >= 5000 && (item.price || 0) < 20000).length,
        premium: data.filter(item => (item.price || 0) >= 20000).length
      }
    };
  }, [data]);

  // Simulate real-time alerts
  useEffect(() => {
    const generateAlert = (): PriceAlert => {
      const alertTypes: PriceAlert['type'][] = ['price_drop', 'low_stock', 'new_high', 'out_of_stock'];
      const severities: PriceAlert['severity'][] = ['low', 'medium', 'high'];
      const messages = [
        'Cena je pala za 15% na popularnom proizvodu',
        'Zalihe su niske u TechShop prodavnici',
        'Novi rekord cene u kategoriji Elektronika',
        'Proizvod više nije dostupan na lageru',
        'Veliki popust dostupan samo danas',
        'Cene su porasle za 8% u poslednjih 7 dana'
      ];

      return {
        id: Date.now().toString(),
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        timestamp: new Date().toISOString()
      };
    };

    if (autoRefresh) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance of new alert
          setAlerts(prev => [generateAlert(), ...prev.slice(0, 4)]);
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getSeverityColor = (severity: PriceAlert['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAlertIcon = (type: PriceAlert['type']) => {
    switch (type) {
      case 'price_drop': return <TrendingDown className="h-4 w-4" />;
      case 'new_high': return <TrendingUp className="h-4 w-4" />;
      case 'low_stock': return <AlertCircle className="h-4 w-4" />;
      case 'out_of_stock': return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analitički Dashboard</h2>
            <p className="text-gray-600 mt-1">Sveobuhvatna analiza tržišta i cena</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Vremenski period:</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Poslednjih 7 dana</option>
                <option value="30d">Poslednjih 30 dana</option>
                <option value="90d">Poslednjih 90 dana</option>
                <option value="1y">Poslednjih godinu</option>
              </select>
            </div>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>Auto-refresh</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">Ukupno proizvoda</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{analytics.totalProducts}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Ukupna vrednost</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {(analytics.totalValue / 1000000).toFixed(1)}M RSD
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Prosečna cena</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {Math.round(analytics.averagePrice).toLocaleString('sr-RS')}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-medium">Stopa popusta</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {analytics.discountRate.toFixed(1)}%
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-700 text-sm font-medium">Prosečan popust</p>
                <p className="text-2xl font-bold text-pink-900 mt-1">
                  {analytics.averageDiscount.toFixed(1)}%
                </p>
              </div>
              <Star className="h-8 w-8 text-pink-500" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Obaveštenja</h3>
              {autoRefresh && (
                <div className="flex items-center text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Aktivan
                </div>
              )}
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Trenutno nema aktivnih obaveštenja</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(alert.timestamp).toLocaleTimeString('sr-RS')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Price Trend */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Cena sa Prognozom</h3>
            <div className="h-80">
              <EnhancedPriceTrendChart
                data={data}
                timeRange={selectedTimeRange}
                showForecast={true}
              />
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribucija po Kategorijama</h3>
            <div className="h-64">
              <CategoryDistributionChart data={data} />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Volatilnost Cena</h3>
          <div className="h-64">
            <PriceVolatilityChart data={data} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Poređenje Prodavaca</h3>
          <div className="h-64">
            <RetailerComparisonRadar data={data} />
          </div>
        </div>
      </div>

      {/* Scatter Plot and Treemap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cena vs Popust</h3>
          <div className="h-64">
            <PriceScatterPlot data={data} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tržišni Udeo</h3>
          <div className="h-64">
            <MarketShareTreemap data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}