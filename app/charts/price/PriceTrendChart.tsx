/**
 * Price Trend Chart Component
 * Shows price trends over time with forecasting capabilities
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Dot,
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
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Menu,
  MenuItem as MenuItemComponent,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Calendar as CalendarIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
} from 'lucide-react';

import {
  PriceTrendChartProps,
  PriceData,
  PriceTrend,
  LocaleConfig,
} from './types';
import {
  formatCurrency,
  localizeText,
  formatDate,
  processPriceTrendData,
  SERBIAN_LOCALE,
} from './utils';

const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  data = [],
  timeRange = '30d',
  showForecast = false,
  compareRetailers = false,
  loading = false,
  error,
  config,
  locale = SERBIAN_LOCALE,
  className,
  onExport,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [showForecasting, setShowForecasting] = useState(showForecast);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Process trend data
  const { processedData, statistics } = useMemo(() => {
    if (!data || data.length === 0) {
      return { processedData: [], statistics: null };
    }

    const trends = processPriceTrendData(data as PriceTrend[], locale);

    // Filter by time range
    const now = new Date();
    let startDate: Date;

    switch (selectedTimeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All data
    }

    // Combine all data points and filter by date
    const allDataPoints: any[] = [];
    trends.forEach(trend => {
      trend.data.forEach(point => {
        const pointDate = new Date(point.date);
        if (pointDate >= startDate) {
          allDataPoints.push({
            date: point.date,
            formattedDate: point.date,
            [trend.name]: point.price,
            [`${trend.name}_original`]: point.price,
            retailer: trend.retailer,
            productId: trend.id,
          });
        }
      });
    });

    // Sort by date
    allDataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Add forecast data if enabled (simple linear extrapolation)
    if (showForecasting && allDataPoints.length > 1) {
      const lastDate = new Date(allDataPoints[allDataPoints.length - 1].date);
      const forecastDays = 30;

      for (let i = 1; i <= forecastDays; i++) {
        const forecastDate = new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000);
        const forecastPoint: any = {
          date: forecastDate.toISOString(),
          formattedDate: formatDate(forecastDate, locale),
          isForecast: true,
        };

        // Simple linear forecast for each trend
        trends.forEach(trend => {
          const recentData = trend.data.slice(-7); // Last 7 points
          if (recentData.length >= 2) {
            const priceChange = recentData[recentData.length - 1].price - recentData[0].price;
            const avgChangePerDay = priceChange / (recentData.length - 1);
            const forecastPrice = recentData[recentData.length - 1].price + (avgChangePerDay * i);
            forecastPoint[trend.name] = Math.max(0, forecastPrice);
            forecastPoint[`${trend.name}_forecast`] = true;
          }
        });

        allDataPoints.push(forecastPoint);
      }
    }

    // Calculate statistics
    const stats = calculateStatistics(trends);

    return { processedData: allDataPoints, statistics: stats };
  }, [data, selectedTimeRange, showForecasting, locale]);

  // Calculate trend statistics
  const calculateStatistics = (trends: any[]) => {
    const stats = {
      totalTrends: trends.length,
      increasingTrends: 0,
      decreasingTrends: 0,
      stableTrends: 0,
      averageChange: 0,
    };

    let totalChange = 0;

    trends.forEach(trend => {
      if (trend.data.length >= 2) {
        const firstPrice = trend.data[0].price;
        const lastPrice = trend.data[trend.data.length - 1].price;
        const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;

        totalChange += changePercent;

        if (changePercent > 2) {
          stats.increasingTrends++;
        } else if (changePercent < -2) {
          stats.decreasingTrends++;
        } else {
          stats.stableTrends++;
        }
      }
    });

    stats.averageChange = stats.totalTrends > 0 ? totalChange / stats.totalTrends : 0;

    return stats;
  };

  // Get trend lines for the chart
  const trendLines = useMemo(() => {
    if (!processedData.length) return [];

    const lines: any[] = [];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    // Get unique product names
    const productNames = Array.from(new Set(
      Object.keys(processedData[0] || {})
        .filter(key => !key.includes('_') && key !== 'date' && key !== 'formattedDate' && key !== 'isForecast')
    ));

    productNames.slice(0, 5).forEach((productName, index) => {
      const hasData = processedData.some(point => point[productName] !== undefined);
      if (hasData) {
        lines.push({
          dataKey: productName,
          color: colors[index % colors.length],
          strokeWidth: 2,
        });
      }
    });

    return lines;
  }, [processedData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            {formatDate(label, locale)}
            {payload[0]?.payload?.isForecast && (
              <Chip
                label={localizeText('Forecast', 'Прогноза', locale)}
                size="small"
                color="info"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          {payload.map((entry: any, index: number) => {
            if (entry.value !== undefined) {
              return (
                <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    {entry.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(entry.value, 'RSD', locale)}
                  </Typography>
                </Box>
              );
            }
            return null;
          })}
        </Card>
      );
    }
    return null;
  };

  // Handle menu
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format: 'csv' | 'json' | 'png') => {
    if (onExport) {
      onExport({ format, includeImages: false, includeDescriptions: true, language: locale.language, currency: 'RSD' });
    }
    handleMenuClose();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon />
              <Typography variant="h6">
                {localizeText('Price Trends', 'Трендови цена', locale)}
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
              <TrendingUpIcon />
              <Typography variant="h6">
                {localizeText('Price Trends', 'Трендови цена', locale)}
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
            <TrendingUpIcon />
            <Typography variant="h6">
              {localizeText('Price Trends', 'Трендови цена', locale)}
            </Typography>
            {statistics && (
              <Chip
                icon={statistics.averageChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${statistics.averageChange >= 0 ? '+' : ''}${statistics.averageChange.toFixed(1)}%`}
                color={statistics.averageChange >= 0 ? 'success' : 'error'}
                size="small"
              />
            )}
          </Box>
        }
        action={
          <Box display="flex" gap={1}>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItemComponent onClick={() => handleExport('csv')}>
                <DownloadIcon size={16} style={{ marginRight: 8 }} />
                Export CSV
              </MenuItemComponent>
              <MenuItemComponent onClick={() => handleExport('json')}>
                <DownloadIcon size={16} style={{ marginRight: 8 }} />
                Export JSON
              </MenuItemComponent>
              <MenuItemComponent onClick={() => handleExport('png')}>
                <DownloadIcon size={16} style={{ marginRight: 8 }} />
                Export as Image
              </MenuItemComponent>
            </Menu>
          </Box>
        }
      />

      <CardContent>
        {/* Controls */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{localizeText('Time Range', 'Временски период', locale)}</InputLabel>
            <Select
              value={selectedTimeRange}
              label={localizeText('Time Range', 'Временски период', locale)}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <MenuItem value="7d">7 {localizeText('days', 'дана', locale)}</MenuItem>
              <MenuItem value="30d">30 {localizeText('days', 'дана', locale)}</MenuItem>
              <MenuItem value="90d">90 {localizeText('days', 'дана', locale)}</MenuItem>
              <MenuItem value="1y">1 {localizeText('year', 'година', locale)}</MenuItem>
              <MenuItem value="all">{localizeText('All time', 'Све време', locale)}</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(_, value) => value && setChartType(value)}
            size="small"
          >
            <ToggleButton value="line">{localizeText('Line', 'Линија', locale)}</ToggleButton>
            <ToggleButton value="area">{localizeText('Area', 'Област', locale)}</ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant={showForecasting ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setShowForecasting(!showForecasting)}
            startIcon={<CalendarIcon />}
          >
            {localizeText('Show Forecast', 'Прикажи прогнозу', locale)}
          </Button>
        </Box>

        {/* Statistics */}
        {statistics && (
          <Box display="flex" gap={2} mb={3}>
            <Chip
              label={`${statistics.increasingTrends} ${localizeText('increasing', 'растућих', locale)}`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`${statistics.decreasingTrends} ${localizeText('decreasing', 'опадајућих', locale)}`}
              color="error"
              variant="outlined"
            />
            <Chip
              label={`${statistics.stableTrends} ${localizeText('stable', 'стабилних', locale)}`}
              color="info"
              variant="outlined"
            />
          </Box>
        )}

        {/* Chart */}
        {processedData.length > 0 && trendLines.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="formattedDate"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, 'RSD', locale)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {trendLines.map((line) => (
                  <Line
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.color}
                    strokeWidth={line.strokeWidth}
                    dot={false}
                    connectNulls
                    strokeDasharray={(entry: any) => entry?.isForecast ? '5 5' : '0'}
                  />
                ))}

                {showForecasting && (
                  <ReferenceLine
                    x={processedData.find((point, index) =>
                      processedData.slice(0, index + 1).some(p => p.isForecast)
                    )?.formattedDate}
                    stroke="#666"
                    strokeDasharray="5 5"
                    label={localizeText('Forecast Start', 'Почетак прогнозе', locale)}
                  />
                )}
              </LineChart>
            ) : (
              <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="formattedDate"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, 'RSD', locale)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {trendLines.map((line) => (
                  <Area
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.color}
                    strokeWidth={line.strokeWidth}
                    fill={line.color}
                    fillOpacity={0.3}
                    connectNulls
                  />
                ))}

                {showForecasting && (
                  <ReferenceLine
                    x={processedData.find((point, index) =>
                      processedData.slice(0, index + 1).some(p => p.isForecast)
                    )?.formattedDate}
                    stroke="#666"
                    strokeDasharray="5 5"
                    label={localizeText('Forecast Start', 'Почетак прогнозе', locale)}
                  />
                )}
              </AreaChart>
            )}
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
            <TrendingUpIcon size={48} color="text.secondary" />
            <Typography variant="h6" color="text.secondary">
              {localizeText(
                'No trend data available',
                'Нема података о трендовима',
                locale
              )}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceTrendChart;