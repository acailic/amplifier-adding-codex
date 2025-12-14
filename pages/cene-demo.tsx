import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Download, Filter, TrendingUp, ShoppingCart, Store, MapPin, Calendar, RefreshCw, ChevronDown, ChevronUp, BarChart3, PieChart, Activity } from 'lucide-react';
import {
  PriceData,
  PriceFilters,
  PriceAnalytics,
  PriceTrend,
  DiscountData,
  PriceHeatmapData
} from '../app/charts/price/types';
import {
  SimplePriceTrendChart,
  SimplePriceComparisonChart,
  SimpleDiscountAnalysisChart,
  SimplePriceHeatmap
} from '../components/price-charts-simple';
import { samplePriceData } from '../app/charts/price/sample-data';

interface ExtendedPriceData extends PriceData {
  currentPrice: number;
  lastUpdated: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

const CATEGORIES_SR = {
  'electronics': 'Elektronika',
  'clothing': 'Odeća',
  'food': 'Hrana',
  'home': 'Kuća',
  'sports': 'Sport',
  'beauty': 'Lepota',
  'books': 'Knjige',
  'toys': 'Igračke'
};

const RETAILERS_SR = {
  'gadget': 'Gadget',
  'techshop': 'TechShop',
  'fashion': 'Fashion Store',
  'mega': 'Mega Market',
  'sportzone': 'Sport Zone'
};

const COLORS = {
  primary: '#3b82f6',
  secondary: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6'
};

export default function CenovniciDemoPage() {
  const [priceData, setPriceData] = useState<ExtendedPriceData[]>([]);
  const [filteredData, setFilteredData] = useState<ExtendedPriceData[]>([]);
  const [filters, setFilters] = useState<PriceFilters>({
    categories: [],
    retailers: [],
    priceRange: { min: 0, max: 100000 },
    discountRange: { min: 0, max: 100 },
    dateRange: { start: '', end: '' }
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'comparison' | 'discounts' | 'heatmap' | 'retailers'>('overview');
  const [showFilters, setShowFilters] = useState(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Transform sample data to match our extended interface
      const transformedData: ExtendedPriceData[] = samplePriceData.map((item, index) => ({
        ...item,
        currentPrice: item.price,
        lastUpdated: item.timestamp,
        region: ['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica'][Math.floor(Math.random() * 5)],
        city: ['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica'][Math.floor(Math.random() * 5)],
        latitude: 44.8 + (Math.random() - 0.5) * 2,
        longitude: 20.5 + (Math.random() - 0.5) * 2
      }));

      setPriceData(transformedData);
      setFilteredData(transformedData);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleFilterChange = useCallback((newFilters: PriceFilters) => {
    setFilters(newFilters);

    let filtered = priceData.filter(item => {
      if (newFilters.categories.length > 0 && !newFilters.categories.includes(item.category)) {
        return false;
      }

      if (newFilters.retailers && newFilters.retailers.length > 0 && !newFilters.retailers.includes(item.retailer)) {
        return false;
      }

      if (item.currentPrice < newFilters.priceRange.min || item.currentPrice > newFilters.priceRange.max) {
        return false;
      }

      if (item.originalPrice) {
        const discountPercentage = ((item.originalPrice - item.currentPrice) / item.originalPrice) * 100;
        if (discountPercentage < newFilters.discountRange.min || discountPercentage > newFilters.discountRange.max) {
          return false;
        }
      }

      if (newFilters.dateRange.start && item.lastUpdated < newFilters.dateRange.start) {
        return false;
      }
      if (newFilters.dateRange.end && item.lastUpdated > newFilters.dateRange.end) {
        return false;
      }

      return true;
    });

    setFilteredData(filtered);
  }, [priceData]);

  const analytics = useMemo((): PriceAnalytics => {
    const totalProducts = filteredData.length;
    const uniqueRetailers = new Set(filteredData.map(item => item.retailer)).size;
    const averagePrice = totalProducts > 0
      ? filteredData.reduce((sum, item) => sum + item.currentPrice, 0) / totalProducts
      : 0;
    const averageDiscount = totalProducts > 0
      ? filteredData.reduce((sum, item) => {
          if (item.originalPrice) {
            return sum + ((item.originalPrice - item.currentPrice) / item.originalPrice) * 100;
          }
          return sum;
        }, 0) / totalProducts
      : 0;

    const categoryStats = filteredData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, total: 0 };
      }
      acc[item.category].count++;
      acc[item.category].total += item.currentPrice;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        categorySr: CATEGORIES_SR[category as keyof typeof CATEGORIES_SR] || category,
        productCount: stats.count,
        avgPrice: stats.total / stats.count
      }))
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5);

    const retailerStats = filteredData.reduce((acc, item) => {
      if (!acc[item.retailer]) {
        acc[item.retailer] = { count: 0, total: 0 };
      }
      acc[item.retailer].count++;
      acc[item.retailer].total += item.currentPrice;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const topRetailers = Object.entries(retailerStats)
      .map(([retailer, stats]) => ({
        retailer,
        retailerName: RETAILERS_SR[retailer as keyof typeof RETAILERS_SR] || retailer,
        productCount: stats.count,
        avgPrice: stats.total / stats.count
      }))
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5);

    return {
      totalProducts,
      totalRetailers: uniqueRetailers,
      averagePrice,
      averageDiscount,
      priceRanges: {
        budget: filteredData.filter(item => item.currentPrice < 5000).length,
        midRange: filteredData.filter(item => item.currentPrice >= 5000 && item.currentPrice < 20000).length,
        premium: filteredData.filter(item => item.currentPrice >= 20000).length
      },
      topCategories,
      topRetailers
    };
  }, [filteredData]);

  const exportData = useCallback(() => {
    let content = '';
    let filename = `cene-${new Date().toISOString().split('T')[0]}`;

    switch (exportFormat) {
      case 'csv':
        content = [
          'Naziv,Kategorija,Prodavac,Trenutna Cena,Originalna Cena,Popust (%),Valuta,Datum',
          ...filteredData.map(item =>
            `"${item.productNameSr}","${item.categorySr}","${item.retailerName}",${item.currentPrice},${item.originalPrice || ''},${item.originalPrice ? ((item.originalPrice - item.currentPrice) / item.originalPrice * 100).toFixed(2) : ''},${item.currency},${item.lastUpdated}`
          )
        ].join('\n');
        filename += '.csv';
        break;

      case 'json':
        content = JSON.stringify(filteredData, null, 2);
        filename += '.json';
        break;

      case 'excel':
        // Simple CSV format for Excel
        content = [
          'NAZIV\tKATEGORIJA\tPRODAVAC\tTRENUTNA CENA\tORIGINALNA CENA\tPOPUST (%)\tVALUTA\tDATUM',
          ...filteredData.map(item =>
            `${item.productNameSr}\t${item.categorySr}\t${item.retailerName}\t${item.currentPrice}\t${item.originalPrice || ''}\t${item.originalPrice ? ((item.originalPrice - item.currentPrice) / item.originalPrice * 100).toFixed(2) : ''}\t${item.currency}\t${item.lastUpdated}`
          )
        ].join('\n');
        filename += '.xls';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredData, exportFormat]);

  const tabs = [
    { id: 'overview', label: 'Pregled', icon: BarChart3 },
    { id: 'trends', label: 'Trendovi', icon: TrendingUp },
    { id: 'comparison', label: 'Poređenje', icon: Activity },
    { id: 'discounts', label: 'Popusti', icon: PieChart },
    { id: 'heatmap', label: 'Toplotna Mapa', icon: MapPin },
    { id: 'retailers', label: 'Prodavci', icon: Store }
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return <OverviewTab analytics={analytics} data={filteredData} />;
      case 'trends':
        return <TrendsTab data={filteredData} />;
      case 'comparison':
        return <ComparisonTab data={filteredData} />;
      case 'discounts':
        return <DiscountsTab data={filteredData} />;
      case 'heatmap':
        return <HeatmapTab data={filteredData} />;
      case 'retailers':
        return <RetailersTab data={filteredData} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Učitavanje podataka...</h2>
          <p className="text-gray-600">Priprema sveobuhvatne analize cena</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Cenovnici Demo - Kompletna Vizualizacija Cena</title>
        <meta name="description" content="Napredna vizuelna analiza cena proizvoda u Srbiji" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cenovnici Demo</h1>
                <p className="text-gray-600 mt-1">Napredna analiza i vizuelizacija cena</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Izvoz:</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="excel">Excel</option>
                  </select>
                  <button
                    onClick={exportData}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Izvezi</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filteri</span>
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Panel */}
            {showFilters && (
              <div className="lg:col-span-1">
                <FiltersPanel
                  filters={filters}
                  data={priceData}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}

            {/* Main Content Area */}
            <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Overview Tab Component
function OverviewTab({ analytics, data }: { analytics: PriceAnalytics; data: ExtendedPriceData[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ukupno proizvoda</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalProducts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Prosečna cena</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {Math.round(analytics.averagePrice).toLocaleString('sr-RS')} RSD
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Prosečni popust</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {analytics.averageDiscount.toFixed(1)}%
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Store className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Prodavci</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalRetailers}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Store className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Kategorije</h3>
          <div className="space-y-3">
            {analytics.topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: COLORS[Object.keys(COLORS)[index] as keyof typeof COLORS] }}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{category.categorySr}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{category.productCount} proizvoda</div>
                  <div className="text-sm text-gray-600">
                    {Math.round(category.avgPrice).toLocaleString('sr-RS')} RSD
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Prodavci</h3>
          <div className="space-y-3">
            {analytics.topRetailers.map((retailer, index) => (
              <div key={retailer.retailer} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: COLORS[Object.keys(COLORS)[index + 3] as keyof typeof COLORS] }}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{retailer.retailerName}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{retailer.productCount} proizvoda</div>
                  <div className="text-sm text-gray-600">
                    {Math.round(retailer.avgPrice).toLocaleString('sr-RS')} RSD
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribucija Cena</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{analytics.priceRanges.budget}</div>
            <div className="text-gray-600">Budžet (do 5.000 RSD)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{analytics.priceRanges.midRange}</div>
            <div className="text-gray-600">Srednja klasa (5.000-20.000 RSD)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{analytics.priceRanges.premium}</div>
            <div className="text-gray-600">Premium (preko 20.000 RSD)</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Trends Tab Component
function TrendsTab({ data }: { data: ExtendedPriceData[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Trendovi Cena</h3>
        <div className="h-96">
          <SimplePriceTrendChart data={data} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Vremenska Analiza</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {data.length > 0
                ? Math.min(...data.map(d => d.currentPrice)).toLocaleString('sr-RS')
                : '0'} RSD
            </div>
            <div className="text-gray-600 mt-1">Najniža cena</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {data.length > 0
                ? Math.max(...data.map(d => d.currentPrice)).toLocaleString('sr-RS')
                : '0'} RSD
            </div>
            <div className="text-gray-600 mt-1">Najviša cena</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {data.length > 0
                ? Math.round(data.reduce((sum, d) => sum + d.currentPrice, 0) / data.length).toLocaleString('sr-RS')
                : '0'} RSD
            </div>
            <div className="text-gray-600 mt-1">Prosečna cena</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Comparison Tab Component
function ComparisonTab({ data }: { data: ExtendedPriceData[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Poređenje Cena</h3>
        <div className="h-96">
          <SimplePriceComparisonChart data={data} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Analiza po Kategorijama</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proizvod</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorija</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prodavac</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trenutna cena</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Originalna cena</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popust</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(0, 10).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.productNameSr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.categorySr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.retailerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.currentPrice.toLocaleString('sr-RS')} RSD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.originalPrice ? `${item.originalPrice.toLocaleString('sr-RS')} RSD` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.originalPrice && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {((item.originalPrice - item.currentPrice) / item.originalPrice * 100).toFixed(1)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Discounts Tab Component
function DiscountsTab({ data }: { data: ExtendedPriceData[] }) {
  const discountData = data.filter(item => item.originalPrice && item.originalPrice > item.currentPrice);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Analiza Popusta</h3>
        <div className="h-96">
          <SimpleDiscountAnalysisChart data={data} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistike Popusta</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Proizvodi na popustu:</span>
              <span className="font-semibold">{discountData.length} od {data.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Prosečni popust:</span>
              <span className="font-semibold">
                {discountData.length > 0
                  ? (discountData.reduce((sum, item) => sum + ((item.originalPrice! - item.currentPrice) / item.originalPrice!) * 100, 0) / discountData.length).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Najveći popust:</span>
              <span className="font-semibold">
                {discountData.length > 0
                  ? Math.max(...discountData.map(item => ((item.originalPrice! - item.currentPrice) / item.originalPrice!) * 100)).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ušteda:</span>
              <span className="font-semibold text-green-600">
                {discountData.reduce((sum, item) => sum + (item.originalPrice! - item.currentPrice), 0).toLocaleString('sr-RS')} RSD
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Najbolji Popusti</h3>
          <div className="space-y-3">
            {discountData
              .sort((a, b) => {
                const discountA = ((a.originalPrice! - a.currentPrice) / a.originalPrice!) * 100;
                const discountB = ((b.originalPrice! - b.currentPrice) / b.originalPrice!) * 100;
                return discountB - discountA;
              })
              .slice(0, 5)
              .map((item) => {
                const discount = ((item.originalPrice! - item.currentPrice) / item.originalPrice!) * 100;
                return (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{item.productNameSr}</div>
                      <div className="text-sm text-gray-600">{item.retailerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">-{discount.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">
                        {item.currentPrice.toLocaleString('sr-RS')} RSD
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Heatmap Tab Component
function HeatmapTab({ data }: { data: ExtendedPriceData[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Toplotna Mapa Cena</h3>
        <div className="h-96">
          <SimplePriceHeatmap data={data} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Geografska Distribucija</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set(data.map(item => item.city).filter(Boolean))).map((city) => {
            const cityData = data.filter(item => item.city === city);
            const avgPrice = cityData.reduce((sum, item) => sum + item.currentPrice, 0) / cityData.length;
            return (
              <div key={city} className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-900 mb-2">{city}</div>
                <div className="text-sm text-gray-600">
                  <div>Proizvoda: {cityData.length}</div>
                  <div>Prosečna cena: {Math.round(avgPrice).toLocaleString('sr-RS')} RSD</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Retailers Tab Component
function RetailersTab({ data }: { data: ExtendedPriceData[] }) {
  const retailerStats = data.reduce((acc, item) => {
    if (!acc[item.retailer]) {
      acc[item.retailer] = {
        name: item.retailerName,
        count: 0,
        total: 0,
        min: Infinity,
        max: 0,
        discountCount: 0
      };
    }
    const stats = acc[item.retailer];
    stats.count++;
    stats.total += item.currentPrice;
    stats.min = Math.min(stats.min, item.currentPrice);
    stats.max = Math.max(stats.max, item.currentPrice);
    if (item.originalPrice && item.originalPrice > item.currentPrice) {
      stats.discountCount++;
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Analiza Prodavaca</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prodavac</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proizvoda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prosečna cena</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena opseg</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popusti</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(retailerStats)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([retailer, stats]) => (
                  <tr key={retailer} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stats.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {Math.round(stats.total / stats.count).toLocaleString('sr-RS')} RSD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.min.toLocaleString('sr-RS')} - {stats.max.toLocaleString('sr-RS')} RSD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="text-gray-900">{stats.discountCount}</div>
                        <div className="ml-2 text-gray-500">({((stats.discountCount / stats.count) * 100).toFixed(0)}%)</div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Filters Panel Component
function FiltersPanel({ filters, data, onFilterChange }: {
  filters: PriceFilters;
  data: ExtendedPriceData[];
  onFilterChange: (filters: PriceFilters) => void;
}) {
  const categories = Array.from(new Set(data.map(item => item.category)));
  const retailers = Array.from(new Set(data.map(item => item.retailer)));

  const priceRange = data.length > 0
    ? [Math.min(...data.map(d => d.currentPrice)), Math.max(...data.map(d => d.currentPrice))] as [number, number]
    : [0, 100000];

  const updateFilters = (updates: Partial<PriceFilters>) => {
    onFilterChange({ ...filters, ...updates });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filteri</h3>

      <div className="space-y-6">
        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kategorije</label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {categories.map(category => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(category) || false}
                  onChange={(e) => {
                    const currentCategories = filters.categories || [];
                    const updated = e.target.checked
                      ? [...currentCategories, category]
                      : currentCategories.filter(c => c !== category);
                    updateFilters({ categories: updated });
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {CATEGORIES_SR[category as keyof typeof CATEGORIES_SR] || category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Retailers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prodavci</label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {retailers.map(retailer => (
              <label key={retailer} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.retailers?.includes(retailer) || false}
                  onChange={(e) => {
                    const currentRetailers = filters.retailers || [];
                    const updated = e.target.checked
                      ? [...currentRetailers, retailer]
                      : currentRetailers.filter(r => r !== retailer);
                    updateFilters({ retailers: updated });
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {RETAILERS_SR[retailer as keyof typeof RETAILERS_SR] || retailer}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opseg cena: {filters.priceRange.min.toLocaleString('sr-RS')} - {filters.priceRange.max.toLocaleString('sr-RS')} RSD
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={priceRange[0]}
              max={priceRange[1]}
              value={filters.priceRange.max}
              onChange={(e) => updateFilters({
                priceRange: { ...filters.priceRange, max: parseInt(e.target.value) }
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{priceRange[0].toLocaleString('sr-RS')}</span>
              <span>{priceRange[1].toLocaleString('sr-RS')}</span>
            </div>
          </div>
        </div>

        {/* Discount Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opseg popusta: {filters.discountRange.min}% - {filters.discountRange.max}%
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={filters.discountRange.max}
              onChange={(e) => updateFilters({
                discountRange: { ...filters.discountRange, max: parseInt(e.target.value) }
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => onFilterChange({
            categories: [],
            retailers: [],
            priceRange: { min: 0, max: priceRange[1] },
            discountRange: { min: 0, max: 100 },
            dateRange: { start: '', end: '' }
          })}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Resetuj filtere
        </button>
      </div>
    </div>
  );
}