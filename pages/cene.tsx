import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  PriceData,
  PriceFilters
} from '../app/charts/price';
import SimplePriceFilter from '../components/simple-price-filter';
import {
  SimplePriceTrendChart,
  SimplePriceComparisonChart,
  SimpleDiscountAnalysisChart,
  SimplePriceHeatmap
} from '../components/price-charts-simple';
import PriceDashboardWrapper from '../components/price-dashboard-wrapper';
import { samplePriceData } from '../app/charts/price/sample-data';

export default function PriceVisualizationPage() {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [filteredData, setFilteredData] = useState<PriceData[]>([]);
  const [filters, setFilters] = useState<PriceFilters>({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 100000 },
    discountRange: { min: 0, max: 100 },
    dateRange: { start: '', end: '' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setLoading(true);

      // In a real app, this would fetch from your API
      // For now, use sample data
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPriceData(samplePriceData);
      setFilteredData(samplePriceData);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleFilterChange = useCallback((newFilters: PriceFilters) => {
    setFilters(newFilters);

    // Apply filters to data
    let filtered = priceData.filter(item => {
      // Category filter
      if (newFilters.categories.length > 0 && !newFilters.categories.includes(item.category)) {
        return false;
      }

      // Brand filter
      if (newFilters.brands.length > 0 && !newFilters.brands.includes(item.brand)) {
        return false;
      }

      // Price range filter
      if (item.currentPrice < newFilters.priceRange.min || item.currentPrice > newFilters.priceRange.max) {
        return false;
      }

      // Discount range filter
      const discountPercentage = ((item.originalPrice - item.currentPrice) / item.originalPrice) * 100;
      if (discountPercentage < newFilters.discountRange.min || discountPercentage > newFilters.discountRange.max) {
        return false;
      }

      // Date range filter
      if (newFilters.dateRange.start && item.lastUpdated < newFilters.dateRange.start) {
        return false;
      }
      if (newFilters.dateRange.end && item.lastUpdated > newFilters.dateRange.end) {
        return false;
      }

      return true;
    });

    setFilteredData(filtered);
  }, [priceData]);  // Add priceData as dependency

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Učitavanje podataka o cenama...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Cene - Vizualni Admin Dashboard</title>
        <meta name="description" content="Cena vizualizacija i analiza" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gray-50"
      >
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Analiza Cena
            </h1>
            <p className="text-lg text-gray-600">
              Kompletna vizualizacija i analiza cena proizvoda
            </p>
          </motion.div>

          {/* Filter Panel */}
          <motion.div variants={itemVariants} className="mb-8">
            <SimplePriceFilter
              data={priceData}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </motion.div>

          {/* Main Dashboard */}
          <motion.div variants={itemVariants} className="mb-8">
            <PriceDashboardWrapper data={filteredData} />
          </motion.div>

          {/* Charts Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Price Trend Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Trend Cena
              </h2>
              <div className="h-80">
                <SimplePriceTrendChart data={filteredData} />
              </div>
            </motion.div>

            {/* Price Comparison Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Poređenje Cena
              </h2>
              <div className="h-80">
                <SimplePriceComparisonChart data={filteredData} />
              </div>
            </motion.div>

            {/* Discount Analysis Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Analiza Popusta
              </h2>
              <div className="h-80">
                <SimpleDiscountAnalysisChart data={filteredData} />
              </div>
            </motion.div>

            {/* Price Heatmap */}
            <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Toplotna Mapa Cena
              </h2>
              <div className="h-80">
                <SimplePriceHeatmap data={filteredData} />
              </div>
            </motion.div>
          </motion.div>

          {/* Summary Statistics */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Statistički Pregled
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {filteredData.length}
                </div>
                <div className="text-gray-600">Ukupno Proizvoda</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {filteredData.length > 0
                    ? Math.round(filteredData.reduce((sum, item) => sum + item.currentPrice, 0) / filteredData.length)
                    : 0} RSD
                </div>
                <div className="text-gray-600">Prosečna Cena</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {filteredData.length > 0
                    ? Math.round(filteredData.reduce((sum, item) => {
                        const discount = ((item.originalPrice - item.currentPrice) / item.originalPrice) * 100;
                        return sum + discount;
                      }, 0) / filteredData.length)
                    : 0}%
                </div>
                <div className="text-gray-600">Prosečni Popust</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(filteredData.map(item => item.brand)).size}
                </div>
                <div className="text-gray-600">Ukupno Brendova</div>
              </div>
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div variants={itemVariants} className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              O Vizualizaciji Cena
            </h2>
            <div className="prose max-w-none text-gray-600">
              <p>
                Ova vizualizacija pruža sveobuhvatan pregled cena proizvoda u Srbiji, uključujući:
              </p>
              <ul className="list-disc pl-6 mt-4">
                <li>Trendove cena kroz vreme</li>
                <li>Poređenje cena između brendova i kategorija</li>
                <li>Analizu popusta i akcija</li>
                <li>Toplotnu mapu distribucije cena</li>
                <li>Interaktivne filtere za detaljnu analizu</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}