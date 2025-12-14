/**
 * Price Comparison Chart Component
 * Compares prices across different retailers for selected products
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import { BarChart as BarChartIcon, Compare as CompareIcon } from 'lucide-react';

import {
  PriceComparisonChartProps,
  PriceData,
  LocaleConfig,
} from './types';
import {
  formatCurrency,
  localizeText,
  groupByCategory,
  groupByRetailer,
  generateColorPalette,
  SERBIAN_LOCALE,
} from './utils';

const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({
  data = [],
  selectedProducts = [],
  showRetailerComparison = true,
  groupByCategory = false,
  loading = false,
  error,
  config,
  locale = SERBIAN_LOCALE,
  className,
  onPriceClick,
}) => {
  const theme = useTheme();
  const [groupBy, setGroupBy] = useState<'category' | 'retailer' | 'none'>('none');
  const [showOnlyDiscounted, setShowOnlyDiscounted] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Process data for visualization
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filteredData = [...data];

    // Filter by selected products
    if (selectedProducts.length > 0) {
      filteredData = filteredData.filter(item =>
        selectedProducts.includes(item.productId)
      );
    }

    // Filter by discounted items
    if (showOnlyDiscounted) {
      filteredData = filteredData.filter(item => item.discount && item.discount > 0);
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filteredData = filteredData.filter(item =>
        selectedCategories.includes(item.categorySr || item.category)
      );
    }

    // Group data based on selection
    if (groupBy === 'category') {
      const categoryGroups = groupByCategory(filteredData);
      return Object.entries(categoryGroups).map(([category, items]) => {
        const avgPrice = items.reduce((sum, item) => sum + item.price, 0) / items.length;
        return {
          name: category,
          avgPrice,
          minPrice: Math.min(...items.map(item => item.price)),
          maxPrice: Math.max(...items.map(item => item.price)),
          count: items.length,
          currency: items[0]?.currency || 'RSD',
        };
      });
    } else if (groupBy === 'retailer') {
      const retailerGroups = groupByRetailer(filteredData);
      return Object.entries(retailerGroups).map(([retailer, items]) => {
        const avgPrice = items.reduce((sum, item) => sum + item.price, 0) / items.length;
        return {
          name: retailer,
          avgPrice,
          minPrice: Math.min(...items.map(item => item.price)),
          maxPrice: Math.max(...items.map(item => item.price)),
          count: items.length,
          currency: items[0]?.currency || 'RSD',
        };
      });
    } else {
      // Individual products
      return filteredData.slice(0, 20).map(item => ({
        id: item.id,
        name: localizeText(item.productName, item.productNameSr, locale),
        retailer: item.retailerName,
        price: item.price,
        originalPrice: item.originalPrice,
        discount: item.discount,
        currency: item.currency,
        category: item.categorySr || item.category,
      }));
    }
  }, [data, selectedProducts, showOnlyDiscounted, selectedCategories, groupBy, locale]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    data.forEach(item => {
      const category = item.categorySr || item.category;
      if (category) categories.add(category);
    });
    return Array.from(categories).sort();
  }, [data]);

  // Color palette
  const colors = useMemo(() => generateColorPalette(10), []);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Card
          sx={{
            p: 2,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {data.name}
          </Typography>
          {data.retailer && (
            <Typography variant="body2" color="text.secondary">
              {data.retailer}
            </Typography>
          )}
          <Typography variant="body1" fontWeight="bold">
            {formatCurrency(data.price || data.avgPrice, data.currency, locale)}
          </Typography>
          {data.originalPrice && (
            <Typography variant="body2" color="error">
              Original: {formatCurrency(data.originalPrice, data.currency, locale)}
            </Typography>
          )}
          {data.discount && (
            <Typography variant="body2" color="success.main">
              Discount: {data.discount}%
            </Typography>
          )}
          {data.minPrice !== undefined && data.maxPrice !== undefined && (
            <Box mt={1}>
              <Typography variant="body2">
                Range: {formatCurrency(data.minPrice, data.currency, locale)} -{' '}
                {formatCurrency(data.maxPrice, data.currency, locale)}
              </Typography>
            </Box>
          )}
          {data.count && (
            <Typography variant="caption" color="text.secondary">
              {data.count} items
            </Typography>
          )}
        </Card>
      );
    }
    return null;
  };

  // Handle bar click
  const handleBarClick = (data: any) => {
    if (onPriceClick && data?.id) {
      const priceData = (data as any[]).find(item => item.id === data.id);
      if (priceData) onPriceClick(priceData);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <CompareIcon />
              <Typography variant="h6">
                {localizeText('Price Comparison', 'Поређење цена', locale)}
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Box display="flex" justifyContent="center" p={4}>
            <Typography>{localizeText('Loading...', 'Учитавање...', locale)}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <CompareIcon />
              <Typography variant="h6">
                {localizeText('Price Comparison', 'Поређење цена', locale)}
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <BarChartIcon />
            <Typography variant="h6">
              {localizeText('Price Comparison', 'Поређење цена', locale)}
            </Typography>
            <Chip
              label={`${processedData.length} ${localizeText('items', 'ставки', locale)}`}
              size="small"
              color="primary"
            />
          </Box>
        }
        action={
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setGroupBy('none');
              setShowOnlyDiscounted(false);
              setSelectedCategories([]);
            }}
          >
            {localizeText('Reset', 'Ресетуј', locale)}
          </Button>
        }
      />

      <CardContent>
        {/* Filters */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>
              {localizeText('Group By', 'Групиши по', locale)}
            </InputLabel>
            <Select
              value={groupBy}
              label={localizeText('Group By', 'Групиши по', locale)}
              onChange={(e) => setGroupBy(e.target.value as any)}
            >
              <MenuItem value="none">
                {localizeText('None', 'Без групирања', locale)}
              </MenuItem>
              <MenuItem value="category">
                {localizeText('Category', 'Категорија', locale)}
              </MenuItem>
              <MenuItem value="retailer">
                {localizeText('Retailer', 'Продавац', locale)}
              </MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={showOnlyDiscounted}
                onChange={(e) => setShowOnlyDiscounted(e.target.checked)}
              />
            }
            label={localizeText('Discounted only', 'Само са попустом', locale)}
          />

          {uniqueCategories.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>
                {localizeText('Categories', 'Категорије', locale)}
              </InputLabel>
              <Select
                multiple
                value={selectedCategories}
                label={localizeText('Categories', 'Категорије', locale)}
                onChange={(e) => setSelectedCategories(e.target.value as string[])}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {uniqueCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    <Checkbox checked={selectedCategories.indexOf(category) > -1} />
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* Chart */}
        {processedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  formatCurrency(value, processedData[0]?.currency || 'RSD', locale)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {groupBy === 'none' ? (
                <Bar
                  dataKey="price"
                  name={localizeText('Price', 'Цена', locale)}
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                >
                  {processedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              ) : (
                <>
                  <Bar
                    dataKey="minPrice"
                    name={localizeText('Min Price', 'Минимална цена', locale)}
                    fill={alpha(theme.palette.success.main, 0.7)}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="avgPrice"
                    name={localizeText('Avg Price', 'Просечна цена', locale)}
                    fill={alpha(theme.palette.primary.main, 0.7)}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="maxPrice"
                    name={localizeText('Max Price', 'Максимална цена', locale)}
                    fill={alpha(theme.palette.error.main, 0.7)}
                    radius={[4, 4, 0, 0]}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={400}
            flexDirection="column"
            gap={2}
          >
            <CompareIcon size={48} color={theme.palette.text.secondary} />
            <Typography variant="h6" color="text.secondary">
              {localizeText(
                'No data available for the selected filters',
                'Нема података за изабране филтере',
                locale
              )}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceComparisonChart;