/**
 * Demo page showcasing all price visualization components
 */

import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  PriceComparisonChart,
  PriceTrendChart,
  DiscountAnalysisChart,
  PriceHeatmap,
  PriceFilterPanel,
  PriceDashboard,
  PriceFilter,
  LocaleConfig,
  SERBIAN_LOCALE,
  SERBIAN_LOCALE_CYRILLIC,
} from './index';
import {
  samplePriceData,
  sampleTrendData,
  sampleDiscountData,
  sampleHeatmapData,
  sampleAnalytics,
  sampleCategories,
  sampleRetailers,
  generateLargeDataset,
} from './sample-data';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      marginBottom: '1rem',
    },
  },
});

const PriceVisualizationDemo: React.FC = () => {
  const [selectedLocale, setSelectedLocale] = useState<LocaleConfig>(SERBIAN_LOCALE);
  const [activeFilter, setActiveFilter] = useState<PriceFilter>({
    categories: [],
    retailers: [],
    priceRange: [0, 100000],
    currency: 'both',
    availability: ['in_stock', 'out_of_stock', 'limited'],
    discountOnly: false,
    sortBy: 'price',
    sortOrder: 'asc',
  });

  // Generate large dataset for testing
  const largeDataset = generateLargeDataset(1000);

  // Handle locale change
  const handleLocaleChange = (locale: LocaleConfig) => {
    setSelectedLocale(locale);
  };

  // Handle filter changes
  const handleFilterChange = (filter: PriceFilter) => {
    setActiveFilter(filter);
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setActiveFilter({
      categories: [],
      retailers: [],
      priceRange: [0, 100000],
      currency: 'both',
      availability: ['in_stock', 'out_of_stock', 'limited'],
      discountOnly: false,
      sortBy: 'price',
      sortOrder: 'asc',
    });
  };

  // Handle export
  const handleExport = (options: any) => {
    console.log('Exporting with options:', options);
    alert(`Exporting data in ${options.format} format`);
  };

  // Handle refresh
  const handleRefresh = () => {
    console.log('Refreshing data...');
    alert('Data refreshed!');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl">
        <Box py={4}>
          {/* Header */}
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Serbian Price Data Visualization
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            Comprehensive dashboard for analyzing price trends, discounts, and market patterns
          </Typography>

          {/* Language Toggle */}
          <Box display="flex" justifyContent="center" gap={2} mb={4}>
            <Paper>
              <Stack direction="row" p={1}>
                <Typography
                  component="button"
                  variant="body2"
                  onClick={() => handleLocaleChange(SERBIAN_LOCALE)}
                  sx={{
                    px: 2,
                    py: 1,
                    border: 'none',
                    background: selectedLocale === SERBIAN_LOCALE ? 'primary.main' : 'transparent',
                    color: selectedLocale === SERBIAN_LOCALE ? 'white' : 'text.primary',
                    cursor: 'pointer',
                    borderRadius: 1,
                  }}
                >
                  Srpski (Latinica)
                </Typography>
                <Typography
                  component="button"
                  variant="body2"
                  onClick={() => handleLocaleChange(SERBIAN_LOCALE_CYRILLIC)}
                  sx={{
                    px: 2,
                    py: 1,
                    border: 'none',
                    background: selectedLocale === SERBIAN_LOCALE_CYRILLIC ? 'primary.main' : 'transparent',
                    color: selectedLocale === SERBIAN_LOCALE_CYRILLIC ? 'white' : 'text.primary',
                    cursor: 'pointer',
                    borderRadius: 1,
                  }}
                >
                  Српски (Ћирилица)
                </Typography>
                <Typography
                  component="button"
                  variant="body2"
                  onClick={() => handleLocaleChange({ ...SERBIAN_LOCALE, language: 'en' })}
                  sx={{
                    px: 2,
                    py: 1,
                    border: 'none',
                    background: selectedLocale.language === 'en' ? 'primary.main' : 'transparent',
                    color: selectedLocale.language === 'en' ? 'white' : 'text.primary',
                    cursor: 'pointer',
                    borderRadius: 1,
                  }}
                >
                  English
                </Typography>
              </Stack>
            </Paper>
          </Box>

          {/* Main Dashboard */}
          <Box mb={4}>
            <Typography variant="h4" gutterBottom>
              Complete Dashboard
            </Typography>
            <PriceDashboard
              data={largeDataset}
              analytics={sampleAnalytics}
              onRefresh={handleRefresh}
              autoRefresh={false}
              locale={selectedLocale}
              onExport={handleExport}
            />
          </Box>

          {/* Price Comparison Chart */}
          <Box mb={4}>
            <Typography variant="h4" gutterBottom>
              Price Comparison
            </Typography>
            <PriceComparisonChart
              data={samplePriceData}
              showRetailerComparison={true}
              groupByCategory={false}
              locale={selectedLocale}
              onExport={handleExport}
            />
          </Box>

          {/* Price Trend Chart */}
          <Box mb={4}>
            <Typography variant="h4" gutterBottom>
              Price Trends
            </Typography>
            <PriceTrendChart
              data={sampleTrendData}
              timeRange="30d"
              showForecast={true}
              compareRetailers={false}
              locale={selectedLocale}
              onExport={handleExport}
            />
          </Box>

          {/* Discount Analysis */}
          <Box mb={4}>
            <Typography variant="h4" gutterBottom>
              Discount Analysis
            </Typography>
            <DiscountAnalysisChart
              data={sampleDiscountData}
              groupByCategory={true}
              showTrends={true}
              minDiscountPercentage={5}
              locale={selectedLocale}
              onExport={handleExport}
            />
          </Box>

          {/* Price Heatmap */}
          <Box mb={4}>
            <Typography variant="h4" gutterBottom>
              Price Heatmap
            </Typography>
            <PriceHeatmap
              data={sampleHeatmapData}
              colorScale="warm"
              showValues={true}
              aggregateBy="both"
              locale={selectedLocale}
              onExport={handleExport}
            />
          </Box>

          {/* Filter Panel */}
          <Box mb={4}>
            <Typography variant="h4" gutterBottom>
              Filter Panel
            </Typography>
            <PriceFilterPanel
              filter={activeFilter}
              categories={sampleCategories}
              retailers={sampleRetailers}
              priceRange={[0, 100000]}
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </Box>

          {/* Component Features Overview */}
          <Box mt={6}>
            <Typography variant="h4" gutterBottom>
              Component Features
            </Typography>
            <Stack spacing={2}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🚀 Key Features
                </Typography>
                <ul>
                  <li>Full Serbian language support (Latin and Cyrillic)</li>
                  <li>RSD/EUR currency handling with conversion</li>
                  <li>Responsive design for all screen sizes</li>
                  <li>Interactive charts with tooltips and legends</li>
                  <li>Advanced filtering and search capabilities</li>
                  <li>Export to CSV, JSON, Excel formats</li>
                  <li>Loading states and error handling</li>
                  <li>Accessibility compliance (WCAG)</li>
                </ul>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Visualization Types
                </Typography>
                <ul>
                  <li>Bar charts for price comparisons</li>
                  <li>Line/area charts for trend analysis</li>
                  <li>Pie charts for distribution analysis</li>
                  <li>Heatmaps for price intensity visualization</li>
                  <li>Scatter plots for correlation analysis</li>
                </ul>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  ⚡ Performance
                </Typography>
                <ul>
                  <li>Efficient data processing with useMemo</li>
                  <li>Debounced search and filtering</li>
                  <li>Lazy loading for large datasets</li>
                  <li>Optimized re-rendering with React.memo</li>
                  <li>Pagination for performance with large data</li>
                </ul>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default PriceVisualizationDemo;