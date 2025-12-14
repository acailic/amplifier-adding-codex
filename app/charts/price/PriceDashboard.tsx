/**
 * Price Dashboard Component
 * Main dashboard integrating all price visualization components
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Fab,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  DollarSign as DollarSignIcon,
  ShoppingCart as ShoppingCartIcon,
  Percent as PercentIcon,
  Store as StoreIcon,
  BarChart2 as BarChart2Icon,
  Activity as ActivityIcon,
  Calendar as CalendarIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  Minus as MinusIcon,
} from 'lucide-react';

import {
  PriceDashboardProps,
  PriceData,
  PriceAnalytics,
  LocaleConfig,
  ExportOptions,
  PriceFilter,
} from './types';
import {
  formatCurrency,
  localizeText,
  formatDate,
  formatPercentage,
  exportToCSV,
  SERBIAN_LOCALE,
  createSafeClassName,
} from './utils';

// Import components
import PriceComparisonChart from './PriceComparisonChart';
import PriceTrendChart from './PriceTrendChart';
import DiscountAnalysisChart from './DiscountAnalysisChart';
import PriceHeatmap from './PriceHeatmap';
import PriceFilterPanel from './PriceFilterPanel';

interface DashboardStats {
  totalProducts: number;
  totalRetailers: number;
  averagePrice: number;
  averageDiscount: number;
  priceChange: number;
  topCategory: { name: string; productCount: number; avgPrice: number };
  topRetailer: { name: string; productCount: number; avgPrice: number };
}

const PriceDashboard: React.FC<PriceDashboardProps> = ({
  data = [],
  analytics,
  onRefresh,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  loading = false,
  error,
  config,
  locale = SERBIAN_LOCALE,
  className,
  onExport,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showFilters, setShowFilters] = useState(false);
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

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && onRefresh) {
      const interval = setInterval(() => {
        onRefresh();
        setLastRefresh(new Date());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, onRefresh]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate dashboard statistics
  const dashboardStats = useMemo((): DashboardStats => {
    if (!data || data.length === 0) {
      return {
        totalProducts: 0,
        totalRetailers: 0,
        averagePrice: 0,
        averageDiscount: 0,
        priceChange: 0,
        topCategory: { name: '', productCount: 0, avgPrice: 0 },
        topRetailer: { name: '', productCount: 0 },
      };
    }

    const uniqueProducts = new Set(data.map(item => item.productId)).size;
    const uniqueRetailers = new Set(data.map(item => item.retailer)).size;

    const averagePrice = data.reduce((sum, item) => sum + item.price, 0) / data.length;
    const discountItems = data.filter(item => item.discount && item.discount > 0);
    const averageDiscount = discountItems.length > 0
      ? discountItems.reduce((sum, item) => sum + item.discount, 0) / discountItems.length
      : 0;

    // Calculate price change (simplified - would need historical data in real implementation)
    const priceChange = Math.random() * 10 - 5; // Placeholder

    // Find top category
    const categoryGroups: Record<string, PriceData[]> = {};
    data.forEach(item => {
      const category = item.categorySr || item.category;
      if (!categoryGroups[category]) categoryGroups[category] = [];
      categoryGroups[category].push(item);
    });

    const topCategoryEntry = Object.entries(categoryGroups)
      .sort((a, b) => b[1].length - a[1].length)[0];
    const topCategory = topCategoryEntry
      ? {
          name: topCategoryEntry[0],
          productCount: topCategoryEntry[1].length,
          avgPrice: topCategoryEntry[1].reduce((sum, item) => sum + item.price, 0) / topCategoryEntry[1].length,
        }
      : { name: '', productCount: 0, avgPrice: 0 };

    // Find top retailer
    const retailerGroups: Record<string, PriceData[]> = {};
    data.forEach(item => {
      const retailer = item.retailerName || item.retailer;
      if (!retailerGroups[retailer]) retailerGroups[retailer] = [];
      retailerGroups[retailer].push(item);
    });

    const topRetailerEntry = Object.entries(retailerGroups)
      .sort((a, b) => b[1].length - a[1].length)[0];
    const topRetailer = topRetailerEntry
      ? {
          name: topRetailerEntry[0],
          productCount: topRetailerEntry[1].length,
          avgPrice: topRetailerEntry[1].reduce((sum, item) => sum + item.price, 0) / topRetailerEntry[1].length,
        }
      : { name: '', productCount: 0, avgPrice: 0 };

    return {
      totalProducts: uniqueProducts,
      totalRetailers: uniqueRetailers,
      averagePrice,
      averageDiscount,
      priceChange,
      topCategory,
      topRetailer,
    };
  }, [data]);

  // Handle export
  const handleExport = (options: ExportOptions) => {
    if (onExport) {
      onExport(options);
    } else {
      // Default CSV export
      exportToCSV(data, 'price-data');
    }
  };

  // Handle menu
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle filter changes
  const handleFilterChange = (filter: PriceFilter) => {
    setActiveFilter(filter);
  };

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

  // Render loading skeleton
  if (loading && !data.length) {
    return (
      <Box className={className}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <DashboardIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {localizeText('Price Dashboard', 'Табла цена', locale)}
            </Typography>
            <Skeleton variant="rectangular" width={120} height={32} />
          </Toolbar>
        </AppBar>

        <Box p={3}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" height={24} width="60%" />
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" height={16} width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={400} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={className}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {localizeText('Price Dashboard', 'Табла цена', locale)}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            {autoRefresh && (
              <Chip
                icon={<ActivityIcon size={16} />}
                label={`${localizeText('Auto-refresh', 'Ауто-освежавање', locale)} (${Math.round(refreshInterval / 1000)}s)`}
                size="small"
                color="success"
              />
            )}

            <Tooltip title={localizeText('Last refresh', 'Последње освежавање', locale)}>
              <Typography variant="caption" color="text.secondary">
                {formatDate(lastRefresh, locale)}
              </Typography>
            </Tooltip>

            <Tooltip title={localizeText('Filters', 'Филтери', locale)}>
              <IconButton
                color={activeFilter.categories.length > 0 || activeFilter.retailers.length > 0 ? 'primary' : 'default'}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>

            <IconButton onClick={onRefresh} disabled={loading}>
              <RefreshIcon className={loading ? 'animate-spin' : ''} />
            </IconButton>

            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleExport({ format: 'csv', includeImages: false, includeDescriptions: true, language: locale.language, currency: 'RSD' })}>
                <DownloadIcon size={16} style={{ marginRight: 8 }} />
                Export CSV
              </MenuItem>
              <MenuItem onClick={() => handleExport({ format: 'json', includeImages: false, includeDescriptions: true, language: locale.language, currency: 'RSD' })}>
                <DownloadIcon size={16} style={{ marginRight: 8 }} />
                Export JSON
              </MenuItem>
              <MenuItem onClick={() => handleExport({ format: 'excel', includeImages: false, includeDescriptions: true, language: locale.language, currency: 'RSD' })}>
                <DownloadIcon size={16} style={{ marginRight: 8 }} />
                Export Excel
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box p={3}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <MuiLink color="inherit" href="/">
            {localizeText('Home', 'Почетна', locale)}
          </MuiLink>
          <MuiLink color="inherit" href="/dashboard">
            {localizeText('Dashboard', 'Табла', locale)}
          </MuiLink>
          <Typography color="text.primary">
            {localizeText('Price Analysis', 'Анализа цена', locale)}
          </Typography>
        </Breadcrumbs>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* KPI Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <ShoppingCartIcon color="primary" />
                  <Typography variant="h6" component="div">
                    {dashboardStats.totalProducts.toLocaleString()}
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  {localizeText('Total Products', 'Укупно производа', locale)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <StoreIcon color="success" />
                  <Typography variant="h6" component="div">
                    {dashboardStats.totalRetailers}
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  {localizeText('Retailers', 'Продаваца', locale)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <DollarSignIcon color="warning" />
                  <Typography variant="h6" component="div">
                    {formatCurrency(dashboardStats.averagePrice, 'RSD', locale)}
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  {localizeText('Average Price', 'Просечна цена', locale)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <PercentIcon color="info" />
                  <Typography variant="h6" component="div">
                    {formatPercentage(dashboardStats.averageDiscount, locale)}
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  {localizeText('Average Discount', 'Просечан попуст', locale)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Filter Panel */}
          {showFilters && (
            <Grid item xs={12} md={3}>
              <PriceFilterPanel
                filter={activeFilter}
                categories={Array.from(new Set(data.map(item => item.categorySr || item.category)))}
                retailers={Array.from(new Set(data.map(item => item.retailerName || item.retailer)))}
                priceRange={[0, 100000]}
                onFilterChange={handleFilterChange}
                onReset={handleFilterReset}
              />
            </Grid>
          )}

          {/* Main Charts */}
          <Grid item xs={12} md={showFilters ? 9 : 12}>
            <Grid container spacing={3}>
              {/* Price Comparison Chart */}
              <Grid item xs={12}>
                <PriceComparisonChart
                  data={data}
                  locale={locale}
                  onExport={handleExport}
                />
              </Grid>

              {/* Price Trend Chart */}
              <Grid item xs={12} lg={8}>
                <PriceTrendChart
                  data={data}
                  timeRange="30d"
                  showForecast={true}
                  locale={locale}
                  onExport={handleExport}
                />
              </Grid>

              {/* Discount Analysis */}
              <Grid item xs={12} lg={4}>
                <DiscountAnalysisChart
                  data={data
                    .filter(item => item.discount && item.discount > 0)
                    .map(item => ({
                      id: item.id,
                      productId: item.productId,
                      productName: item.productName,
                      productNameSr: item.productNameSr,
                      retailer: item.retailer,
                      retailerName: item.retailerName,
                      originalPrice: item.originalPrice || item.price * 1.2,
                      currentPrice: item.price,
                      discountAmount: item.discount ? (item.price * item.discount / 100) : 0,
                      discountPercentage: item.discount || 0,
                      currency: item.currency,
                      category: item.category,
                      categorySr: item.categorySr,
                      discountType: 'percentage' as const,
                    }))}
                  locale={locale}
                  onExport={handleExport}
                />
              </Grid>

              {/* Price Heatmap */}
              <Grid item xs={12}>
                <PriceHeatmap
                  data={
                    Array.from(new Set(data.map(item => item.categorySr || item.category)))
                      .slice(0, 5)
                      .map(category => {
                        const categoryData = data.filter(item => (item.categorySr || item.category) === category);
                        const retailers = Array.from(new Set(categoryData.map(item => item.retailerName || item.retailer)));

                        return retailers.map(retailer => {
                          const retailerData = categoryData.filter(item => (item.retailerName || item.retailer) === retailer);
                          const avgPrice = retailerData.reduce((sum, item) => sum + item.price, 0) / retailerData.length;
                          const minPrice = Math.min(...retailerData.map(item => item.price));
                          const maxPrice = Math.max(...retailerData.map(item => item.price));

                          return {
                            category,
                            categorySr: category,
                            retailer,
                            retailerName: retailer,
                            avgPrice,
                            minPrice,
                            maxPrice,
                            priceChange: (Math.random() - 0.5) * avgPrice * 0.1,
                            priceChangePercentage: (Math.random() - 0.5) * 10,
                            productCount: retailerData.length,
                            currency: retailerData[0]?.currency || 'RSD',
                            lastUpdated: new Date().toISOString(),
                          };
                        });
                      })
                      .flat()
                  }
                  locale={locale}
                  onExport={handleExport}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="refresh"
        onClick={onRefresh}
        disabled={loading}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <RefreshIcon className={loading ? 'animate-spin' : ''} />
      </Fab>
    </Box>
  );
};

export default PriceDashboard;