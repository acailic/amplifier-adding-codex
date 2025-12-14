/**
 * Price Heatmap Component
 * Visualizes price changes across categories and retailers as a heatmap
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  Button,
  Chip,
  Slider,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Grid3X3 as GridIcon,
  Thermometer as ThermometerIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from 'lucide-react';

import {
  PriceHeatmapProps,
  PriceHeatmapData,
  LocaleConfig,
} from './types';
import {
  formatCurrency,
  localizeText,
  formatPercentage,
  SERBIAN_LOCALE,
} from './utils';

interface HeatmapCell {
  category: string;
  categorySr: string;
  retailer: string;
  retailerName: string;
  value: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceChange: number;
  priceChangePercentage: number;
  productCount: number;
  currency: string;
  intensity: number; // 0-1 for color intensity
}

const PriceHeatmap: React.FC<PriceHeatmapProps> = ({
  data = [],
  colorScale = 'warm',
  showValues = true,
  aggregateBy = 'both',
  loading = false,
  error,
  config,
  locale = SERBIAN_LOCALE,
  className,
  onExport,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'change'>('price');
  const [colorMode, setColorMode] = useState<'warm' | 'cool' | 'divergent'>('warm');
  const [minProducts, setMinProducts] = useState(5);
  const [showDataLabels, setShowDataLabels] = useState(showValues);

  // Process data for heatmap
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return { heatmapData: [], categories: [], retailers: [] };

    // Filter by minimum product count
    const filteredData = data.filter(item => item.productCount >= minProducts);

    // Get unique categories and retailers
    const categories = Array.from(new Set(filteredData.map(item => item.categorySr || item.category))).sort();
    const retailers = Array.from(new Set(filteredData.map(item => item.retailerName || item.retailer))).sort();

    // Create heatmap cells
    const heatmapCells: HeatmapCell[] = [];

    filteredData.forEach(item => {
      // Calculate intensity based on selected metric
      let intensity = 0;
      let value = item.avgPrice;

      if (selectedMetric === 'change') {
        value = Math.abs(item.priceChangePercentage);
        intensity = Math.min(value / 50, 1); // Normalize to 0-1 (assuming max 50% change)
      } else {
        // For price, normalize relative to the range
        const allPrices = filteredData.map(d => d.avgPrice);
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);
        intensity = (value - minPrice) / (maxPrice - minPrice);
      }

      heatmapCells.push({
        category: item.category,
        categorySr: item.categorySr || item.category,
        retailer: item.retailer,
        retailerName: item.retailerName || item.retailer,
        value,
        avgPrice: item.avgPrice,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        priceChange: item.priceChange,
        priceChangePercentage: item.priceChangePercentage,
        productCount: item.productCount,
        currency: item.currency,
        intensity,
      });
    });

    return {
      heatmapData: heatmapCells,
      categories,
      retailers,
    };
  }, [data, minProducts, selectedMetric]);

  // Color scale functions
  const getHeatmapColor = (intensity: number, changeValue?: number) => {
    const alpha = 0.2 + (intensity * 0.8); // Range from 0.2 to 1.0

    if (colorMode === 'warm') {
      return `rgba(239, 68, 68, ${alpha})`; // Red spectrum
    } else if (colorMode === 'cool') {
      return `rgba(59, 130, 246, ${alpha})`; // Blue spectrum
    } else if (colorMode === 'divergent' && changeValue !== undefined) {
      // Red for positive changes, blue for negative
      if (changeValue > 0) {
        return `rgba(239, 68, 68, ${alpha})`;
      } else {
        return `rgba(59, 130, 246, ${alpha})`;
      }
    }

    return `rgba(156, 163, 175, ${alpha})`; // Gray default
  };

  // Format value for display
  const formatValue = (cell: HeatmapCell) => {
    if (selectedMetric === 'price') {
      return formatCurrency(cell.avgPrice, cell.currency, locale);
    } else {
      const prefix = cell.priceChangePercentage > 0 ? '+' : '';
      return `${prefix}${cell.priceChangePercentage.toFixed(1)}%`;
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            {localizeText(data.category, data.categorySr, locale)}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {data.retailerName}
          </Typography>
          <Box mb={1}>
            <Typography variant="body2">
              {localizeText('Average Price', 'Просечна цена', locale)}: {formatCurrency(data.avgPrice, data.currency, locale)}
            </Typography>
            <Typography variant="body2">
              {localizeText('Price Range', 'Вредносни опсег', locale)}: {formatCurrency(data.minPrice, data.currency, locale)} - {formatCurrency(data.maxPrice, data.currency, locale)}
            </Typography>
            <Typography variant="body2">
              {localizeText('Product Count', 'Број производа', locale)}: {data.productCount}
            </Typography>
          </Box>
          {data.priceChange !== 0 && (
            <Box display="flex" alignItems="center" gap={1}>
              {data.priceChange > 0 ? (
                <TrendingUpIcon size={16} color="error" />
              ) : (
                <TrendingDownIcon size={16} color="primary" />
              )}
              <Typography variant="body2" color={data.priceChange > 0 ? 'error' : 'primary'}>
                {data.priceChange > 0 ? '+' : ''}{data.priceChangePercentage.toFixed(1)}%
              </Typography>
            </Box>
          )}
          <Typography variant="caption" color="text.secondary">
            {localizeText('Last updated', 'Последње ажурирање', locale)}: {new Date(data.lastUpdated).toLocaleDateString()}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <GridIcon />
              <Typography variant="h6">
                {localizeText('Price Heatmap', 'Топлотна мапа цена', locale)}
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
              <GridIcon />
              <Typography variant="h6">
                {localizeText('Price Heatmap', 'Топлотна мапа цена', locale)}
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
            <ThermometerIcon />
            <Typography variant="h6">
              {localizeText('Price Heatmap', 'Топлотна мапа цена', locale)}
            </Typography>
            <Chip
              label={`${processedData.heatmapData.length} ${localizeText('data points', 'тачака података', locale)}`}
              size="small"
              color="primary"
            />
          </Box>
        }
      />

      <CardContent>
        {/* Controls */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{localizeText('Metric', 'Метрика', locale)}</InputLabel>
            <Select
              value={selectedMetric}
              label={localizeText('Metric', 'Метрика', locale)}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
            >
              <MenuItem value="price">
                {localizeText('Average Price', 'Просечна цена', locale)}
              </MenuItem>
              <MenuItem value="change">
                {localizeText('Price Change', 'Промена цене', locale)}
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{localizeText('Color Scale', 'Боја', locale)}</InputLabel>
            <Select
              value={colorMode}
              label={localizeText('Color Scale', 'Боја', locale)}
              onChange={(e) => setColorMode(e.target.value as any)}
            >
              <MenuItem value="warm">
                {localizeText('Warm (Red)', 'Топла (црвена)', locale)}
              </MenuItem>
              <MenuItem value="cool">
                {localizeText('Cool (Blue)', 'Хладна (плава)', locale)}
              </MenuItem>
              <MenuItem value="divergent">
                {localizeText('Divergent', 'Дивергентна', locale)}
              </MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ minWidth: 200, maxWidth: 250 }}>
            <Typography gutterBottom>
              {localizeText('Min Products', 'Минимално производа', locale)}: {minProducts}
            </Typography>
            <Slider
              value={minProducts}
              onChange={(_, value) => setMinProducts(value as number)}
              min={1}
              max={50}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 10, label: '10' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
              ]}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={showDataLabels}
                onChange={(e) => setShowDataLabels(e.target.checked)}
              />
            }
            label={localizeText('Show Values', 'Прикажи вредности', locale)}
          />
        </Box>

        {/* Heatmap Grid */}
        {processedData.heatmapData.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Grid container spacing={0.5} sx={{ minWidth: 800 }}>
              {/* Header row */}
              <Grid item xs={2}>
                <Typography variant="subtitle2" p={1} fontWeight="bold">
                  {localizeText('Category', 'Категорија', locale)} / {localizeText('Retailer', 'Продавац', locale)}
                </Typography>
              </Grid>
              {processedData.retailers.map((retailer) => (
                <Grid item xs key={retailer}>
                  <Typography variant="subtitle2" p={1} textAlign="center" fontWeight="bold">
                    {retailer}
                  </Typography>
                </Grid>
              ))}

              {/* Data rows */}
              {processedData.categories.map((category) => (
                <React.Fragment key={category}>
                  <Grid item xs={2}>
                    <Typography variant="body2" p={1} fontWeight="bold">
                      {localizeText(category, category, locale)}
                    </Typography>
                  </Grid>
                  {processedData.retailers.map((retailer) => {
                    const cellData = processedData.heatmapData.find(
                      (cell) => cell.categorySr === category && cell.retailerName === retailer
                    );

                    return (
                      <Grid item xs key={`${category}-${retailer}`}>
                        {cellData ? (
                          <Paper
                            sx={{
                              p: 1,
                              backgroundColor: getHeatmapColor(cellData.intensity, cellData.priceChange),
                              border: '1px solid rgba(0,0,0,0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: 2,
                              },
                            }}
                            title={`${retailer} - ${category}`}
                          >
                            {showDataLabels && (
                              <Typography
                                variant="caption"
                                textAlign="center"
                                display="block"
                                fontWeight="bold"
                                sx={{ color: cellData.intensity > 0.6 ? 'white' : 'black' }}
                              >
                                {formatValue(cellData)}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              textAlign="center"
                              display="block"
                              sx={{ color: cellData.intensity > 0.6 ? 'white' : 'text.secondary' }}
                            >
                              {cellData.productCount} {localizeText('items', 'ставки', locale)}
                            </Typography>
                          </Paper>
                        ) : (
                          <Paper
                            sx={{
                              p: 1,
                              backgroundColor: 'rgba(229, 231, 235, 0.5)',
                              border: '1px dashed rgba(0,0,0,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 60,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {localizeText('No data', 'Нема података', locale)}
                            </Typography>
                          </Paper>
                        )}
                      </Grid>
                    );
                  })}
                </React.Fragment>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={400}
            flexDirection="column"
            gap={2}
          >
            <GridIcon size={48} color="text.secondary" />
            <Typography variant="h6" color="text.secondary">
              {localizeText(
                'No heatmap data available for the selected filters',
                'Нема података за топлотну мапу за изабране филтере',
                locale
              )}
            </Typography>
          </Box>
        )}

        {/* Legend */}
        {processedData.heatmapData.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              {localizeText('Color Scale', 'Боја нијанса', locale)}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2">
                {selectedMetric === 'price'
                  ? localizeText('Lower prices', 'Ниже цене', locale)
                  : localizeText('Lower change', 'Мања промена', locale)}
              </Typography>
              <Box sx={{ flex: 1, height: 20, background: 'linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 1))' }} />
              <Typography variant="body2">
                {selectedMetric === 'price'
                  ? localizeText('Higher prices', 'Више цене', locale)
                  : localizeText('Higher change', 'Већа промена', locale)}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceHeatmap;