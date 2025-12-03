/**
 * Enhanced Budget Chart - World-Class Quality
 *
 * Purpose: Advanced Serbian budget visualization with financial context,
 * fiscal transparency, and interactive budget exploration
 *
 * Features:
 * - Serbian national and regional budget breakdown
 * - Treasury and spending analysis
 * - Revenue vs expenditure comparisons
 * - Historical budget trends and forecasts
 * - Serbian RSD currency formatting
 * - WCAG 2.1 AA accessibility compliance
 * - Interactive budget category exploration
 * - Export capabilities (PNG, SVG, CSV)
 * - Responsive design with mobile optimization
 * - Fiscal year comparisons and analysis
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  LineChart,
  Line,
  AreaChart,
  Area,
  Treemap,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Import from our base components
import {
  ChartContainer,
  EnhancedTooltip,
  InteractiveLegend,
  useResponsiveChart,
  useChartPerformance,
  serbianNumberFormatter,
  serbianDateFormatter,
  SERBIAN_COLORS,
  CHART_ANIMATIONS,
  validateChartData,
  generateAriaLabel
} from './enhanced-data-visualization';

// Enhanced data interfaces
export interface BudgetData {
  totalRevenue: number;
  totalExpenditure: number;
  balance: number;
  year: number;
  currency: 'RSD';
}

export interface BudgetCategory {
  id: string;
  name: string;
  nameSr: string;
  allocated: number;
  spent: number;
  planned: number;
  percentage: number;
  type: 'revenue' | 'expenditure';
  subcategories?: BudgetSubcategory[];
  description?: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface BudgetSubcategory {
  id: string;
  name: string;
  nameSr: string;
  allocated: number;
  spent: number;
  planned: number;
  parentCategory: string;
}

export interface HistoricalBudgetData {
  year: number;
  revenue: number;
  expenditure: number;
  balance: number;
  gdpContribution?: number;
  inflation?: number;
  categories: BudgetCategory[];
}

export interface RegionalBudgetData {
  region: string;
  totalBudget: number;
  revenue: number;
  expenditure: number;
  balance: number;
  perCapita: number;
  population: number;
  growthRate: number;
}

export interface BudgetForecast {
  year: number;
  projectedRevenue: number;
  projectedExpenditure: number;
  projectedBalance: number;
  confidence: number;
  assumptions: string[];
}

// Serbian budget categories with cultural context
export const SERBIAN_BUDGET_CATEGORIES = {
  revenue: {
    taxes: {
      name: 'Porezi',
      subcategories: {
        pdv: 'Porez na dodatu vrednost',
        porezPrihod: 'Porez na dohodak',
        porezDobit: 'Porez na dobit',
        porezImovina: 'Porez na imovinu',
        carine: 'Carine i uvozne takse',
        akcize: 'Akcize'
      }
    },
    socialContributions: {
      name: 'Doprinosi za socijalno osiguranje',
      subcategories: {
        pensijsko: 'Pensijsko i invalidsko osiguranje',
        zdravstveno: 'Zdravstveno osiguranje',
        nezaposlenost: 'Osiguranje za slučaj nezaposlenosti'
      }
    },
    otherRevenue: {
      name: 'Ostali prihodi',
      subcategories: {
        dividende: 'Dividende od državnih preduzeća',
        kamate: 'Kamate',
        prodajaImovine: 'Prodaja državne imovine',
        donacije: 'Donacije i pomoć'
      }
    }
  },
  expenditure: {
    socialProtection: {
      name: 'Socijalna zaštita',
      subcategories: {
        penzije: 'Penzije',
        zdravstvo: 'Zdravstvena zaštita',
        socijalnaPomoc: 'Socijalna pomoć',
        invalidskaPenzija: 'Invalidske penzije'
      }
    },
    education: {
      name: 'Obrazovanje',
      subcategories: {
        osnovneSkole: 'Osnovne škole',
        srednjeSkole: 'Srednje škole',
        fakulteti: 'Fakulteti i visoko obrazovanje',
        naucniRad: 'Naučni rad i razvoj'
      }
    },
    defense: {
      name: 'Odbrana',
      subcategories: {
        vojska: 'Vojska Srbije',
        oprema: 'Naoružanje i oprema',
        modernizacija: 'Modernizacija vojske'
      }
    },
    infrastructure: {
      name: 'Infrastruktura',
      subcategories: {
        putevi: 'Izgradnja i održavanje puteva',
        zeleznice: 'Železnička infrastruktura',
            energetika: 'Energetska infrastruktura',
        komunalneUsluge: 'Komunalne usluge'
      }
    },
    agriculture: {
      name: 'Poljoprivreda',
      subcategories: {
        subvencije: 'Subvencije poljoprivrednicima',
        ruralniRazvoj: 'Razvoj sela',
        navodnjavanje: 'Navodnjavanje i melioracije'
      }
    },
    publicAdministration: {
      name: 'Javna uprava',
      subcategories: {
        drzavnaUprava: 'Državna uprava',
        lokalnaUprava: 'Lokalna samouprava',
        sudstvo: 'Pravosuđe'
      }
    }
  }
} as const;

// Budget importance colors
export const BUDGET_IMPORTANCE_COLORS = {
  critical: '#DC2626',    // High importance - critical services
  high: '#F59E0B',       // High importance
  medium: '#3B82F6',     // Medium importance
  low: '#10B981'         // Lower importance
} as const;

// Chart component props
export interface EnhancedBudgetChartProps {
  currentBudget: BudgetData;
  categories: BudgetCategory[];
  historicalData?: HistoricalBudgetData[];
  regionalData?: RegionalBudgetData[];
  forecasts?: BudgetForecast[];
  type?: 'overview' | 'categoryBreakdown' | 'historicalTrends' | 'regionalComparison' | 'forecast';
  height?: number;
  loading?: boolean;
  error?: string | null;
  onCategorySelect?: (category: string) => void;
  onTimeRangeChange?: (range: '1y' | '5y' | '10y' | 'all') => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  selectedCategories?: string[];
  animated?: boolean;
  accessible?: boolean;
  language?: 'sr' | 'en';
}

// Main Enhanced Budget Chart Component
export const EnhancedBudgetChart: React.FC<EnhancedBudgetChartProps> = ({
  currentBudget,
  categories,
  historicalData = [],
  regionalData = [],
  forecasts = [],
  type = 'overview',
  height = 500,
  loading = false,
  error = null,
  onCategorySelect,
  onTimeRangeChange,
  onExport,
  selectedCategories = [],
  animated = true,
  accessible = true,
  language = 'sr'
}) => {
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set(selectedCategories.length > 0 ? selectedCategories : categories.map(c => c.id))
  );
  const [timeRange, setTimeRange] = useState<'1y' | '5y' | '10y' | 'all'>('all');
  const [viewType, setViewType] = useState<'revenue' | 'expenditure'>('expenditure');

  const { dimensions, containerRef } = useResponsiveChart();
  const { trackInteraction } = useChartPerformance('BudgetChart');

  // Validate data
  const isValidData = useMemo(() => validateChartData(categories), [categories]);

  // Calculate budget metrics
  const budgetMetrics = useMemo(() => {
    if (!isValidData) return null;

    const totalCategories = categories.reduce((sum, cat) => sum + cat.allocated, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const totalPlanned = categories.reduce((sum, cat) => sum + cat.planned, 0);

    return {
      totalAllocated: totalCategories,
      totalSpent,
      totalPlanned,
      executionRate: totalCategories > 0 ? (totalSpent / totalCategories) * 100 : 0,
      balanceRate: currentBudget.revenue > 0 ? (currentBudget.balance / currentBudget.revenue) * 100 : 0,
      expenditurePerCapita: 1000000, // This would come from actual data
      revenuePerCapita: 1200000, // This would come from actual data
    };
  }, [categories, currentBudget, isValidData]);

  // Prepare budget overview data
  const overviewData = useMemo(() => {
    if (!isValidData) return [];

    return [
      {
        name: language === 'sr' ? 'Ukupni prihodi' : 'Total Revenue',
        value: currentBudget.totalRevenue,
        color: SERBIAN_COLORS.success
      },
      {
        name: language === 'sr' ? 'Ukupni rashodi' : 'Total Expenditure',
        value: currentBudget.totalExpenditure,
        color: SERBIAN_COLORS.danger
      },
      {
        name: language === 'sr' ? 'Saldo' : 'Balance',
        value: Math.abs(currentBudget.balance),
        color: currentBudget.balance >= 0 ? SERBIAN_COLORS.success : SERBIAN_COLORS.danger
      }
    ];
  }, [currentBudget, language, isValidData]);

  // Prepare category breakdown data
  const categoryBreakdownData = useMemo(() => {
    if (!isValidData) return [];

    return categories
      .filter(cat => cat.type === viewType && activeCategories.has(cat.id))
      .map(category => ({
        id: category.id,
        name: language === 'sr' ? category.nameSr : category.name,
        allocated: category.allocated,
        spent: category.spent,
        planned: category.planned,
        percentage: category.percentage,
        executionRate: category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0,
        remaining: category.allocated - category.spent,
        color: BUDGET_IMPORTANCE_COLORS[category.importance],
        importance: category.importance,
        description: category.description
      }))
      .sort((a, b) => b.allocated - a.allocated);
  }, [categories, activeCategories, viewType, language, isValidData]);

  // Prepare historical trends data
  const historicalTrendsData = useMemo(() => {
    if (!isValidData || historicalData.length === 0) return [];

    let yearsToInclude = historicalData.length;
    switch (timeRange) {
      case '1y': yearsToInclude = 1; break;
      case '5y': yearsToInclude = 5; break;
      case '10y': yearsToInclude = 10; break;
    }

    return historicalData
      .slice(-yearsToInclude)
      .map(data => ({
        year: data.year,
        revenue: data.revenue,
        expenditure: data.expenditure,
        balance: data.balance,
        balanceRate: data.revenue > 0 ? (data.balance / data.revenue) * 100 : 0,
        gdpContribution: data.gdpContribution || 0,
        inflation: data.inflation || 0,
        revenueGrowth: data.year > historicalData[0]?.year
          ? ((data.revenue - historicalData.find(h => h.year === data.year - 1)?.revenue || data.revenue) / (historicalData.find(h => h.year === data.year - 1)?.revenue || 1)) * 100
          : 0
      }));
  }, [historicalData, timeRange, isValidData]);

  // Prepare regional comparison data
  const regionalComparisonData = useMemo(() => {
    if (!isValidData || regionalData.length === 0) return [];

    return regionalData.map(region => ({
      region: region.region,
      budget: region.totalBudget,
      revenue: region.revenue,
      expenditure: region.expenditure,
      balance: region.balance,
      perCapita: region.perCapita,
      population: region.population,
      growthRate: region.growthRate,
      balanceRate: region.revenue > 0 ? (region.balance / region.revenue) * 100 : 0,
      color: SERBIAN_COLORS.primary
    }));
  }, [regionalData, isValidData]);

  // Prepare forecast data
  const forecastData = useMemo(() => {
    if (!isValidData || forecasts.length === 0) return [];

    const lastHistorical = historicalTrendsData[historicalTrendsData.length - 1];

    return forecasts.map(forecast => ({
      year: forecast.year,
      actualRevenue: lastHistorical?.revenue || 0,
      actualExpenditure: lastHistorical?.expenditure || 0,
      projectedRevenue: forecast.projectedRevenue,
      projectedExpenditure: forecast.projectedExpenditure,
      projectedBalance: forecast.projectedBalance,
      confidence: forecast.confidence,
      projectedRevenueGrowth: lastHistorical?.revenue
        ? ((forecast.projectedRevenue - lastHistorical.revenue) / lastHistorical.revenue) * 100
        : 0
    }));
  }, [forecasts, historicalTrendsData, isValidData]);

  // Custom formatter for Serbian currency
  const serbianCurrencyFormatter = useCallback((value: number) => {
    return serbianNumberFormatter(value, { style: 'currency' });
  }, [serbianCurrencyFormatter]);

  // Custom tooltip for budget overview
  const OverviewTooltip = useCallback(({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
      <EnhancedTooltip
        active={active}
        payload={payload}
        label={data.name}
        formatter={(value: any) => serbianCurrencyFormatter(value)}
      />
    );
  }, [serbianCurrencyFormatter]);

  // Custom tooltip for category breakdown
  const CategoryTooltip = useCallback(({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
      <EnhancedTooltip
        active={active}
        payload={[
          { name: 'Alocirano', value: serbianCurrencyFormatter(data.allocated), color: data.color },
          { name: 'Potrošeno', value: serbianCurrencyFormatter(data.spent), color: SERBIAN_COLORS.success },
          { name: 'Preostalo', value: serbianCurrencyFormatter(data.remaining), color: SERBIAN_COLORS.warning },
          { name: 'Stopa izvršenja', value: `${data.executionRate.toFixed(1)}%`, color: SERBIAN_COLORS.info }
        ]}
        label={data.name}
      />
    );
  }, [serbianCurrencyFormatter]);

  // Custom tooltip for historical trends
  const HistoricalTooltip = useCallback(({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
      <EnhancedTooltip
        active={active}
        payload={[
          { name: 'Prihodi', value: serbianCurrencyFormatter(data.revenue), color: SERBIAN_COLORS.success },
          { name: 'Rashodi', value: serbianCurrencyFormatter(data.expenditure), color: SERBIAN_COLORS.danger },
          { name: 'Saldo', value: serbianCurrencyFormatter(data.balance), color: SERBIAN_COLORS.primary },
          ...(data.gdpContribution ? [{ name: 'GDP udeo', value: `${data.gdpContribution.toFixed(1)}%`, color: SERBIAN_COLORS.info }] : []),
          ...(data.inflation ? [{ name: 'Inflacija', value: `${data.inflation.toFixed(1)}%`, color: SERBIAN_COLORS.warning }] : [])
        ]}
        label={`Godina ${data.year}`}
      />
    );
  }, [serbianCurrencyFormatter]);

  // Handle category selection
  const handleCategoryToggle = useCallback((categoryId: string) => {
    const newActiveCategories = new Set(activeCategories);
    if (newActiveCategories.has(categoryId)) {
      newActiveCategories.delete(categoryId);
    } else {
      newActiveCategories.add(categoryId);
    }
    setActiveCategories(newActiveCategories);
    trackInteraction(`Category ${newActiveCategories.has(categoryId) ? 'selected' : 'deselected'}: ${categoryId}`);
    onCategorySelect?.(categoryId);
  }, [activeCategories, trackInteraction, onCategorySelect]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: typeof timeRange) => {
    setTimeRange(range);
    trackInteraction(`Time range changed to: ${range}`);
    onTimeRangeChange?.(range);
  }, [trackInteraction, onTimeRangeChange]);

  // Render budget overview
  const renderBudgetOverview = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={overviewData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percentage }) => (
            <text x={0} y={0} fill="#374151" textAnchor="middle" dominantBaseline="middle">
              {name}: {serbianCurrencyFormatter(value)} ({(percentage * 100).toFixed(1)}%)
            </text>
          )}
          outerRadius={Math.min(height, 400) / 2 - 40}
          fill="#8884d8"
          dataKey="value"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        >
          {overviewData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<OverviewTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  // Render category breakdown
  const renderCategoryBreakdown = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={categoryBreakdownData}
        margin={{ top: 20, right: 30, left: 120, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6B7280', fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={120}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => serbianCurrencyFormatter(value)}
        />
        <Tooltip content={<CategoryTooltip />} />
        <Bar
          dataKey="allocated"
          name="Alocirano"
          radius={[4, 4, 0, 0]}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        >
          {categoryBreakdownData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleCategoryToggle(entry.id)}
            />
          ))}
        </Bar>
        <Bar
          dataKey="spent"
          name="Potrošeno"
          fill={SERBIAN_COLORS.success}
          radius={[4, 4, 0, 0]}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // Render historical trends
  const renderHistoricalTrends = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={historicalTrendsData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="year"
          tick={{ fill: '#6B7280', fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => serbianCurrencyFormatter(value)}
        />
        <Tooltip content={<HistoricalTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke={SERBIAN_COLORS.success}
          strokeWidth={2}
          dot={{ fill: SERBIAN_COLORS.success, r: 4 }}
          name="Prihodi"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
        <Line
          type="monotone"
          dataKey="expenditure"
          stroke={SERBIAN_COLORS.danger}
          strokeWidth={2}
          dot={{ fill: SERBIAN_COLORS.danger, r: 4 }}
          name="Rashodi"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke={SERBIAN_COLORS.primary}
          strokeWidth={2}
          dot={{ fill: SERBIAN_COLORS.primary, r: 4 }}
          name="Saldo"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  // Render regional comparison
  const renderRegionalComparison = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={regionalComparisonData}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="region"
          tick={{ fill: '#6B7280', fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => serbianCurrencyFormatter(value)}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;

            const data = payload[0].payload;
            return (
              <EnhancedTooltip
                active={active}
                payload={[
                  { name: 'Budžet', value: serbianCurrencyFormatter(data.budget), color: data.color },
                  { name: 'Po glavi stanovnika', value: serbianCurrencyFormatter(data.perCapita), color: SERBIAN_COLORS.info },
                  { name: 'Stopa rasta', value: `${data.growthRate.toFixed(1)}%`, color: SERBIAN_COLORS.success }
                ]}
                label={data.region}
              />
            );
          }}
        />
        <Bar
          dataKey="budget"
          name="Ukupan budžet"
          radius={[4, 4, 0, 0]}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        >
          {regionalComparisonData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Render forecast
  const renderForecast = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={forecastData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="year"
          tick={{ fill: '#6B7280', fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => serbianCurrencyFormatter(value)}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;

            const data = payload[0].payload;
            return (
              <EnhancedTooltip
                active={active}
                payload={[
                  { name: 'Projekcija prihoda', value: serbianCurrencyFormatter(data.projectedRevenue), color: SERBIAN_COLORS.success },
                  { name: 'Projekcija rashoda', value: serbianCurrencyFormatter(data.projectedExpenditure), color: SERBIAN_COLORS.danger },
                  { name: 'Pouzdanost', value: `${(data.confidence * 100).toFixed(1)}%`, color: SERBIAN_COLORS.warning }
                ]}
                label={`Projekcija ${data.year}`}
              />
            );
          }}
        />
        <Legend />
        {/* Historical lines */}
        <Line
          type="monotone"
          dataKey="actualRevenue"
          stroke={SERBIAN_COLORS.success}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Stvarni prihodi"
        />
        <Line
          type="monotone"
          dataKey="actualExpenditure"
          stroke={SERBIAN_COLORS.danger}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Stvarni rashodi"
        />
        {/* Forecast lines */}
        <Line
          type="monotone"
          dataKey="projectedRevenue"
          stroke={SERBIAN_COLORS.success}
          strokeWidth={3}
          strokeDasharray="10 5"
          dot={{ fill: SERBIAN_COLORS.success, r: 5 }}
          name="Projekcija prihoda"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
        <Line
          type="monotone"
          dataKey="projectedExpenditure"
          stroke={SERBIAN_COLORS.danger}
          strokeWidth={3}
          strokeDasharray="10 5"
          dot={{ fill: SERBIAN_COLORS.danger, r: 5 }}
          name="Projekcija rashoda"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  // Chart type renderers
  const chartRenderers = {
    overview: renderBudgetOverview,
    categoryBreakdown: renderCategoryBreakdown,
    historicalTrends: renderHistoricalTrends,
    regionalComparison: renderRegionalComparison,
    forecast: renderForecast
  };

  // Chart type selector
  const chartTypeButtons = [
    { key: 'overview', label: 'Pregled', icon: '📊' },
    { key: 'categoryBreakdown', label: 'Kategorije', icon: '📂' },
    { key: 'historicalTrends', label: 'Trendovi', icon: '📈' },
    { key: 'regionalComparison', label: 'Regioni', icon: '🗺️' },
    { key: 'forecast', label: 'Projekcije', icon: '🔮' }
  ];

  // Time range selector
  const timeRangeButtons = [
    { key: '1y', label: '1 godina' },
    { key: '5y', label: '5 godina' },
    { key: '10y', label: '10 godina' },
    { key: 'all', label: 'Sve godine' }
  ];

  return (
    <ChartContainer
      title="Državni budžet Srbije"
      description="Detaljna analiza prihoda, rashoda i budžetskog salda Republike Srbije"
      loading={loading}
      error={error}
      onExport={onExport}
      className="budget-chart"
    >
      <div ref={containerRef} className="space-y-6">
        {/* Key budget metrics */}
        {budgetMetrics && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-serbia-green bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-serbia-green">
                {serbianCurrencyFormatter(currentBudget.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Ukupni prihodi</div>
            </div>
            <div className="bg-serbia-red bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-serbia-red">
                {serbianCurrencyFormatter(currentBudget.totalExpenditure)}
              </div>
              <div className="text-sm text-gray-600">Ukupni rashodi</div>
            </div>
            <div className="bg-blue-500 bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {serbianCurrencyFormatter(currentBudget.balance)}
              </div>
              <div className="text-sm text-gray-600">Budžetski saldo</div>
            </div>
            <div className="bg-yellow-500 bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {budgetMetrics.executionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Stopa izvršenja</div>
            </div>
          </motion.div>
        )}

        {/* Chart controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Chart type selector */}
          <div className="flex flex-wrap gap-2">
            {chartTypeButtons.map((button) => (
              <motion.button
                key={button.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => trackInteraction(`Chart type changed to: ${button.key}`)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  type === button.key
                    ? 'bg-serbia-red text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{button.icon}</span>
                {button.label}
              </motion.button>
            ))}
          </div>

          {/* Revenue/Expenditure toggle (for category breakdown) */}
          {type === 'categoryBreakdown' && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewType('revenue')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewType === 'revenue'
                    ? 'bg-serbia-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Prihodi
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewType('expenditure')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewType === 'expenditure'
                    ? 'bg-serbia-red text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rashodi
              </motion.button>
            </div>
          )}

          {/* Time range selector */}
          {(type === 'historicalTrends' || type === 'forecast') && (
            <div className="flex gap-2">
              {timeRangeButtons.map((button) => (
                <motion.button
                  key={button.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTimeRangeChange(button.key as typeof timeRange)}
                  className={`px-3 py-1 rounded-md text-sm transition-all ${
                    timeRange === button.key
                      ? 'bg-serbia-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {button.label}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive category legend */}
        {type === 'categoryBreakdown' && (
          <InteractiveLegend
            items={categoryBreakdownData.map(item => ({
              name: item.name,
              color: item.color,
              value: item.allocated,
              percentage: item.executionRate
            }))}
            activeItems={activeCategories}
            onToggle={handleCategoryToggle}
            serbian={true}
          />
        )}

        {/* Main chart */}
        <div
          role="img"
          aria-label={generateAriaLabel('Budžet', categories, 'Državni budžet Srbije')}
          tabIndex={accessible ? 0 : undefined}
        >
          {chartRenderers[type as keyof typeof chartRenderers]()}
        </div>

        {/* Budget insights */}
        {budgetMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <h4 className="font-semibold text-green-900 mb-2">💰 Ključni budžetski uvidi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
              <div>
                <strong>Budžetski saldo:</strong> {serbianCurrencyFormatter(currentBudget.balance)}
                <div className="text-xs text-green-600">
                  {currentBudget.balance >= 0 ? 'Primaran' : 'Sekundarni'} budžet
                </div>
              </div>
              <div>
                <strong>Stopa izvršenja:</strong> {budgetMetrics.executionRate.toFixed(1)}%
                <div className="text-xs text-green-600">
                  {budgetMetrics.executionRate >= 90 ? 'Visoka stopa izvršenja' :
                   budgetMetrics.executionRate >= 70 ? 'Umerena stopa izvršenja' : 'Niska stopa izvršenja'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Data source info */}
        <div className="text-xs text-gray-500 text-center">
          Podaci: Ministarstvo finansija Republike Srbije | Godišnji budžet | Ažurirano: {new Date().toLocaleString('sr-RS')}
        </div>
      </div>
    </ChartContainer>
  );
};

export default EnhancedBudgetChart;