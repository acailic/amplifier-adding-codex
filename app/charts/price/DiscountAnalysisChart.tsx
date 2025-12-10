/**
 * Discount Analysis Chart Component
 * Analyzes discount patterns and trends across categories and retailers
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  Area,
  AreaChart,
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
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Grid,
  Paper,
} from '@mui/material';
import {
  Tag as TagIcon,
  Percent as PercentIcon,
  TrendingDown as TrendingDownIcon,
  PieChart as PieChartIcon,
  BarChart3 as BarChart3Icon,
} from 'lucide-react';

import {
  DiscountAnalysisChartProps,
  DiscountData,
  LocaleConfig,
} from './types';
import {
  formatCurrency,
  localizeText,
  formatPercentage,
  groupByCategory,
  generateColorPalette,
  calculateAveragePrice,
  SERBIAN_LOCALE,
} from './utils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`discount-tabpanel-${index}`}
      aria-labelledby={`discount-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const DiscountAnalysisChart: React.FC<DiscountAnalysisChartProps> = ({
  data = [],
  groupByCategory = false,
  showTrends = false,
  minDiscountPercentage = 5,
  loading = false,
  error,
  config,
  locale = SERBIAN_LOCALE,
  className,
  onExport,
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedGrouping, setSelectedGrouping] = useState<'category' | 'retailer' | 'brand'>('category');
  const [minDiscount, setMinDiscount] = useState(minDiscountPercentage);
  const [showTrendsEnabled, setShowTrendsEnabled] = useState(showTrends);

  // Process discount data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return { summary: [], byGroup: [], trends: [], distribution: [] };

    // Filter by minimum discount
    const filteredData = data.filter(item => item.discountPercentage >= minDiscount);

    // Summary statistics
    const summary = [
      {
        name: localizeText('Total Discounts', 'Укупно попуста', locale),
        value: filteredData.length,
        color: '#3b82f6',
      },
      {
        name: localizeText('Average Discount', 'Просечан попуст', locale),
        value: filteredData.length > 0
          ? Math.round(filteredData.reduce((sum, item) => sum + item.discountPercentage, 0) / filteredData.length)
          : 0,
        color: '#10b981',
        suffix: '%',
      },
      {
        name: localizeText('Max Discount', 'Максимални попуст', locale),
        value: filteredData.length > 0
          ? Math.max(...filteredData.map(item => item.discountPercentage))
          : 0,
        color: '#ef4444',
        suffix: '%',
      },
      {
        name: localizeText('Total Savings', 'Укупна уштеда', locale),
        value: filteredData.reduce((sum, item) => sum + item.discountAmount, 0),
        color: '#f59e0b',
        currency: filteredData[0]?.currency || 'RSD',
      },
    ];

    // Group data
    const grouped: Record<string, DiscountData[]> = {};
    filteredData.forEach(item => {
      const key = selectedGrouping === 'category'
        ? item.categorySr || item.category
        : selectedGrouping === 'retailer'
        ? item.retailerName || item.retailer
        : item.brand || 'Unknown';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    const byGroup = Object.entries(grouped).map(([name, items]) => ({
      name,
      count: items.length,
      avgDiscount: Math.round(items.reduce((sum, item) => sum + item.discountPercentage, 0) / items.length),
      maxDiscount: Math.max(...items.map(item => item.discountPercentage)),
      totalSavings: items.reduce((sum, item) => sum + item.discountAmount, 0),
      avgOriginalPrice: calculateAveragePrice(items.map(item => ({
        price: item.originalPrice,
        currency: item.currency,
      }))),
      currency: items[0]?.currency || 'RSD',
    })).sort((a, b) => b.avgDiscount - a.avgDiscount);

    // Discount distribution
    const discountRanges = [
      { name: localizeText('5-10%', '5-10%', locale), range: [5, 10], count: 0 },
      { name: localizeText('10-20%', '10-20%', locale), range: [10, 20], count: 0 },
      { name: localizeText('20-30%', '20-30%', locale), range: [20, 30], count: 0 },
      { name: localizeText('30-50%', '30-50%', locale), range: [30, 50], count: 0 },
      { name: localizeText('50%+', '50%+', locale), range: [50, 100], count: 0 },
    ];

    filteredData.forEach(item => {
      const range = discountRanges.find(r =>
        item.discountPercentage >= r.range[0] && item.discountPercentage < r.range[1]
      );
      if (range) range.count++;
    });

    // Trends over time (if showTrends is enabled)
    const trends = showTrendsEnabled ? calculateDiscountTrends(filteredData) : [];

    return {
      summary,
      byGroup,
      distribution: discountRanges,
      trends,
    };
  }, [data, minDiscount, selectedGrouping, showTrendsEnabled, locale]);

  // Calculate discount trends
  const calculateDiscountTrends = (data: DiscountData[]) => {
    // Group by month
    const monthlyData: Record<string, DiscountData[]> = {};

    data.forEach(item => {
      const date = new Date(item.id.includes('-') ? item.id.split('-')[0] : Date.now().toString());
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM

      if (!monthlyData[monthKey]) monthlyData[monthKey] = [];
      monthlyData[monthKey].push(item);
    });

    return Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, items]) => ({
        month: new Date(month + '-01').toLocaleDateString(locale.language === 'sr' ? 'sr-RS' : 'en-US', { month: 'short', year: 'numeric' }),
        avgDiscount: Math.round(items.reduce((sum, item) => sum + item.discountPercentage, 0) / items.length),
        count: items.length,
        totalSavings: items.reduce((sum, item) => sum + item.discountAmount, 0),
      }));
  };

  // Color palette
  const colors = useMemo(() => generateColorPalette(10), []);

  // Custom tooltip for bar charts
  const BarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2, maxWidth: 250 }}>
          <Typography variant="subtitle2" gutterBottom>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {localizeText('Items', 'Производа', locale)}: {data.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {localizeText('Avg Discount', 'Просечан попуст', locale)}: {data.avgDiscount}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {localizeText('Max Discount', 'Максимални попуст', locale)}: {data.maxDiscount}%
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {localizeText('Total Savings', 'Укупна уштеда', locale)}: {formatCurrency(data.totalSavings, data.currency, locale)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">{data.name}</Typography>
          <Typography variant="body1" fontWeight="bold">
            {data.count} {localizeText('items', 'производа', locale)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatPercentage((data.count / processedData.byGroup.reduce((sum, item) => sum + item.count, 0)) * 100, locale)}
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
              <PercentIcon />
              <Typography variant="h6">
                {localizeText('Discount Analysis', 'Анализа попуста', locale)}
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
              <PercentIcon />
              <Typography variant="h6">
                {localizeText('Discount Analysis', 'Анализа попуста', locale)}
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
            <TagIcon />
            <Typography variant="h6">
              {localizeText('Discount Analysis', 'Анализа попуста', locale)}
            </Typography>
            <Chip
              label={`${data.length} ${localizeText('discounts', 'попуста', locale)}`}
              size="small"
              color="primary"
            />
          </Box>
        }
      />

      <CardContent>
        {/* Filters */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{localizeText('Group By', 'Групиши по', locale)}</InputLabel>
            <Select
              value={selectedGrouping}
              label={localizeText('Group By', 'Групиши по', locale)}
              onChange={(e) => setSelectedGrouping(e.target.value as any)}
            >
              <MenuItem value="category">
                {localizeText('Category', 'Категорија', locale)}
              </MenuItem>
              <MenuItem value="retailer">
                {localizeText('Retailer', 'Продавац', locale)}
              </MenuItem>
              <MenuItem value="brand">
                {localizeText('Brand', 'Бренд', locale)}
              </MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ minWidth: 200, maxWidth: 300 }}>
            <Typography gutterBottom>
              {localizeText('Min Discount', 'Минимални попуст', locale)}: {minDiscount}%
            </Typography>
            <Slider
              value={minDiscount}
              onChange={(_, value) => setMinDiscount(value as number)}
              min={0}
              max={50}
              step={5}
              marks={[
                { value: 0, label: '0%' },
                { value: 10, label: '10%' },
                { value: 20, label: '20%' },
                { value: 30, label: '30%' },
                { value: 50, label: '50%' },
              ]}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={showTrendsEnabled}
                onChange={(e) => setShowTrendsEnabled(e.target.checked)}
              />
            }
            label={localizeText('Show Trends', 'Прикажи трендове', locale)}
          />
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} mb={3}>
          {processedData.summary.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color={stat.color}>
                  {stat.currency
                    ? formatCurrency(stat.value, stat.currency, locale)
                    : stat.suffix
                    ? `${stat.value}${stat.suffix}`
                    : stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab
              icon={<BarChart3Icon size={16} />}
              label={localizeText('By Group', 'По групама', locale)}
            />
            <Tab
              icon={<PieChartIcon size={16} />}
              label={localizeText('Distribution', 'Дистрибуција', locale)}
            />
            {showTrendsEnabled && (
              <Tab
                icon={<TrendingDownIcon size={16} />}
                label={localizeText('Trends', 'Трендови', locale)}
              />
            )}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={processedData.byGroup} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<BarTooltip />} />
              <Legend />
              <Bar
                dataKey="avgDiscount"
                name={localizeText('Average Discount %', 'Просечан попуст %', locale)}
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="maxDiscount"
                name={localizeText('Max Discount %', 'Максимални попуст %', locale)}
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={processedData.byGroup}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {processedData.byGroup.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </TabPanel>

        {showTrendsEnabled && (
          <TabPanel value={currentTab} index={2}>
            {processedData.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={processedData.trends} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="avgDiscount"
                    name={localizeText('Average Discount %', 'Просечан попуст %', locale)}
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name={localizeText('Number of Discounts', 'Број попуста', locale)}
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    yAxisId="right"
                  />
                  <YAxis yAxisId="right" orientation="right" />
                </AreaChart>
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
                <TrendingDownIcon size={48} color="text.secondary" />
                <Typography variant="h6" color="text.secondary">
                  {localizeText(
                    'No trend data available',
                    'Нема података о трендовима',
                    locale
                  )}
                </Typography>
              </Box>
            )}
          </TabPanel>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscountAnalysisChart;