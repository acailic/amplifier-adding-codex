/**
 * Enhanced Energy Chart - World-Class Quality
 *
 * Purpose: Advanced Serbian energy visualization with renewable context,
 * energy transition analysis, and sustainability insights
 *
 * Features:
 * - Energy production and consumption analysis
 * - Renewable energy transition tracking
 * - Carbon footprint and emissions monitoring
 * - Serbian energy infrastructure visualization
 * - EU Green Deal alignment metrics
 * - WCAG 2.1 AA accessibility compliance
 * - Interactive energy source exploration
 * - Export capabilities (PNG, SVG, CSV)
 * - Responsive design with mobile optimization
 * - Energy security and sustainability indicators
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  Treemap
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
export interface EnergyOverview {
  totalProduction: number;
  totalConsumption: number;
  importExport: number; // Positive = export, Negative = import
  renewablePercentage: number;
  carbonIntensity: number; // gCO2/kWh
  energyIndependence: number; // Percentage
}

export interface EnergySourceData {
  id: string;
  name: string;
  nameSr: string;
  category: 'fossil' | 'renewable' | 'nuclear' | 'import';
  production: number;
  capacity: number;
  percentage: number;
  carbonFootprint: number; // gCO2/kWh
  cost: number; // EUR/MWh
  plants?: number;
  description?: string;
}

export interface RegionalEnergyData {
  region: string;
  population: number;
  consumption: number;
  production: number;
  renewablePercentage: number;
  carbonFootprint: number;
  independence: number;
  mainSources: string[];
}

export interface HistoricalEnergyData {
  year: number;
  production: number;
  consumption: number;
  renewablePercentage: number;
  carbonIntensity: number;
  independence: number;
  sources: EnergySourceData[];
}

export interface CarbonFootprintData {
  sector: string;
  sectorSr: string;
  emissions: number; // MtCO2
  percentage: number;
  trend: 'decreasing' | 'stable' | 'increasing';
  euTarget: number;
}

export interface EnergyEfficiencyData {
  building: string;
  buildingSr: string;
  energyConsumption: number;
  energyLabel: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  potentialSavings: number;
  co2Reduction: number;
}

// Serbian energy sources with cultural and technical context
export const SERBIAN_ENERGY_SOURCES = {
  fossil: {
    coal: {
      name: 'Ugalj',
      plants: ['EPS Termoelektrane'],
      description: 'Glavni izvor energije, ublaženo smanjenje',
      carbonFootprint: 950 // gCO2/kWh
    },
    naturalGas: {
      name: 'Prirodni gas',
      plants: ['Srbijagas'],
      description: 'Plin, uvoz iz Rusije',
      carbonFootprint: 400
    },
    oil: {
      name: 'Nafta i derivati',
      plants: ['NIS'],
      description: 'Rafinerijski proizvodi',
      carbonFootprint: 800
    }
  },
  renewable: {
    hydro: {
      name: 'Hidroenergija',
      plants: ['Đerdap', 'Bajina Bašta'],
      description: 'Najveći obnovljivi izvor',
      carbonFootprint: 10
    },
    wind: {
      name: 'Vetar',
      plants: ['Alibunar', 'Kostolac'],
      description: 'Brzo rastući sektor',
      carbonFootprint: 11
    },
    solar: {
      name: 'Sunčana energija',
      plants: ['Debeli Breg'],
      description: 'Potencijal za rast',
      carbonFootprint: 45
    },
    biomass: {
      name: 'Biomasa',
      plants: ['Bioplnene'],
      description: 'Poljoprivredni otpad',
      carbonFootprint: 50
    },
    geothermal: {
      name: 'Geotermalna energija',
      plants: ['Vranjska Banja'],
      description: 'Mali potencijal',
      carbonFootprint: 38
    }
  },
  nuclear: {
    nuclear: {
      name: 'Nuklearna energija',
      plants: [],
      description: 'Razmatra se za budućnost',
      carbonFootprint: 12
    }
  }
} as const;

// Energy source colors
export const ENERGY_SOURCE_COLORS = {
  coal: '#374151',        // Gray
  naturalGas: '#60A5FA',  // Blue
  oil: '#F59E0B',         // Amber
  hydro: '#3B82F6',       // Light blue
  wind: '#10B981',        // Green
  solar: '#FCD34D',       // Yellow
  biomass: '#92400E',     // Brown
  geothermal: '#DC2626',  // Red
  nuclear: '#8B5CF6'      // Purple
} as const;

// Energy efficiency label colors
export const ENERGY_LABEL_COLORS = {
  'A+': '#10B981',  // Green
  'A': '#34D399',   // Light green
  'B': '#6EE7B7',   // Very light green
  'C': '#FCD34D',   // Yellow
  'D': '#FBBF24',   // Amber
  'E': '#F59E0B',   // Orange
  'F': '#EF4444',   // Red
  'G': '#DC2626'    // Dark red
} as const;

// EU Green Deal targets
export const EU_GREEN_DEAL_TARGETS = {
  renewable2030: 32,    // 32% renewable energy by 2030
  renewable2050: 75,    // 75% renewable energy by 2050
  emissions2030: -55,   // 55% reduction in emissions by 2030
  emissions2050: -90,   // 90% reduction in emissions by 2050
  efficiency2030: 32.5  // 32.5% improvement in energy efficiency by 2030
} as const;

// Chart component props
export interface EnhancedEnergyChartProps {
  overview: EnergyOverview;
  energySources: EnergySourceData[];
  regionalData?: RegionalEnergyData[];
  historicalData?: HistoricalEnergyData[];
  carbonData?: CarbonFootprintData[];
  efficiencyData?: EnergyEfficiencyData[];
  type?: 'overview' | 'sources' | 'regional' | 'historical' | 'carbon' | 'efficiency';
  height?: number;
  loading?: boolean;
  error?: string | null;
  onSourceSelect?: (source: string) => void;
  onTimeRangeChange?: (range: '1y' | '5y' | '10y' | 'all') => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  selectedSources?: string[];
  animated?: boolean;
  accessible?: boolean;
  language?: 'sr' | 'en';
}

// Main Enhanced Energy Chart Component
export const EnhancedEnergyChart: React.FC<EnhancedEnergyChartProps> = ({
  overview,
  energySources,
  regionalData = [],
  historicalData = [],
  carbonData = [],
  efficiencyData = [],
  type = 'overview',
  height = 500,
  loading = false,
  error = null,
  onSourceSelect,
  onTimeRangeChange,
  onExport,
  selectedSources = [],
  animated = true,
  accessible = true,
  language = 'sr'
}) => {
  const [activeSources, setActiveSources] = useState<Set<string>>(
    new Set(selectedSources.length > 0 ? selectedSources : energySources.map(s => s.id))
  );
  const [timeRange, setTimeRange] = useState<'1y' | '5y' | '10y' | 'all'>('all');
  const [viewMode, setViewMode] = useState<'production' | 'consumption' | 'comparison'>('production');

  const { dimensions, containerRef } = useResponsiveChart();
  const { trackInteraction } = useChartPerformance('EnergyChart');

  // Validate data
  const isValidData = useMemo(() => validateChartData(energySources), [energySources]);

  // Calculate energy metrics
  const energyMetrics = useMemo(() => {
    if (!isValidData) return null;

    const totalProduction = energySources.reduce((sum, source) => sum + source.production, 0);
    const totalRenewable = energySources
      .filter(s => s.category === 'renewable')
      .reduce((sum, source) => sum + source.production, 0);
    const totalCapacity = energySources.reduce((sum, source) => sum + source.capacity, 0);
    const avgCarbonIntensity = energySources.reduce((sum, source) =>
      sum + (source.carbonFootprint * source.production), 0) / totalProduction;

    return {
      totalProduction,
      totalRenewable,
      renewablePercentage: (totalRenewable / totalProduction) * 100,
      totalCapacity,
      capacityUtilization: (totalProduction / totalCapacity) * 100,
      avgCarbonIntensity,
      euTargetGap: EU_GREEN_DEAL_TARGETS.renewable2030 - overview.renewablePercentage,
      energySecurity: overview.energyIndependence
    };
  }, [energySources, overview, isValidData]);

  // Prepare energy overview data
  const overviewData = useMemo(() => {
    if (!isValidData) return [];

    const renewableSources = energySources.filter(s => s.category === 'renewable');
    const fossilSources = energySources.filter(s => s.category === 'fossil');

    return [
      {
        name: language === 'sr' ? 'Obnovljivi izvori' : 'Renewable Sources',
        value: renewableSources.reduce((sum, s) => sum + s.production, 0),
        color: SERBIAN_COLORS.success,
        percentage: overview.renewablePercentage
      },
      {
        name: language === 'sr' ? 'Fosilni izvori' : 'Fossil Sources',
        value: fossilSources.reduce((sum, s) => sum + s.production, 0),
        color: SERBIAN_COLORS.danger,
        percentage: 100 - overview.renewablePercentage
      }
    ];
  }, [energySources, overview, language, isValidData]);

  // Prepare energy sources breakdown
  const sourcesBreakdownData = useMemo(() => {
    if (!isValidData) return [];

    return energySources
      .filter(source => activeSources.has(source.id))
      .map(source => ({
        id: source.id,
        name: language === 'sr' ? source.nameSr : source.name,
        production: source.production,
        capacity: source.capacity,
        percentage: source.percentage,
        carbonFootprint: source.carbonFootprint,
        cost: source.cost,
        plants: source.plants || 0,
        utilization: source.capacity > 0 ? (source.production / source.capacity) * 100 : 0,
        category: source.category,
        color: ENERGY_SOURCE_COLORS[source.id as keyof typeof ENERGY_SOURCE_COLORS] || SERBIAN_COLORS.neutral,
        description: source.description
      }))
      .sort((a, b) => b.production - a.production);
  }, [energySources, activeSources, language, isValidData]);

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
        production: data.production,
        consumption: data.consumption,
        renewablePercentage: data.renewablePercentage,
        carbonIntensity: data.carbonIntensity,
        independence: data.independence,
        euTarget2030: EU_GREEN_DEAL_TARGETS.renewable2030,
        euTargetGap: EU_GREEN_DEAL_TARGETS.renewable2030 - data.renewablePercentage
      }));
  }, [historicalData, timeRange, isValidData]);

  // Prepare regional comparison data
  const regionalComparisonData = useMemo(() => {
    if (!isValidData || regionalData.length === 0) return [];

    return regionalData.map(region => ({
      region: region.region,
      consumption: region.consumption,
      production: region.production,
      renewablePercentage: region.renewablePercentage,
      carbonFootprint: region.carbonFootprint,
      independence: region.independence,
      perCapita: region.population > 0 ? region.consumption / region.population : 0,
      color: SERBIAN_COLORS.primary
    }));
  }, [regionalData, isValidData]);

  // Prepare carbon footprint data
  const carbonFootprintData = useMemo(() => {
    if (!isValidData || carbonData.length === 0) return [];

    return carbonData.map(sector => ({
      sector: language === 'sr' ? sector.sectorSr : sector.sector,
      emissions: sector.emissions,
      percentage: sector.percentage,
      trend: sector.trend,
      euTarget: sector.euTarget,
      targetGap: sector.euTarget - sector.emissions,
      color: sector.trend === 'decreasing' ? SERBIAN_COLORS.success :
             sector.trend === 'stable' ? SERBIAN_COLORS.warning :
             SERBIAN_COLORS.danger
    }));
  }, [carbonData, language, isValidData]);

  // Custom tooltip for energy sources
  const EnergySourceTooltip = useCallback(({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
      <EnhancedTooltip
        active={active}
        payload={[
          { name: 'Proizvodnja', value: serbianNumberFormatter(data.production), color: data.color },
          { name: 'Kapacitet', value: serbianNumberFormatter(data.capacity), color: SERBIAN_COLORS.info },
          { name: 'Iskorišćenje', value: `${data.utilization.toFixed(1)}%`, color: SERBIAN_COLORS.primary },
          { name: 'Emisije CO₂', value: `${data.carbonFootprint} g/kWh`, color: SERBIAN_COLORS.warning },
          { name: 'Cena', value: `€${data.cost}/MWh`, color: SERBIAN_COLORS.success }
        ]}
        label={data.name}
      />
    );
  }, []);

  // Custom tooltip for historical trends
  const HistoricalTooltip = useCallback(({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
      <EnhancedTooltip
        active={active}
        payload={[
          { name: 'Proizvodnja', value: serbianNumberFormatter(data.production), color: SERBIAN_COLORS.primary },
          { name: 'Potrošnja', value: serbianNumberFormatter(data.consumption), color: SERBIAN_COLORS.warning },
          { name: 'Obnovljivi', value: `${data.renewablePercentage.toFixed(1)}%`, color: SERBIAN_COLORS.success },
          { name: 'Intenzitet CO₂', value: `${data.carbonIntensity.toFixed(0)} g/kWh`, color: SERBIAN_COLORS.danger }
        ]}
        label={`Godina ${data.year}`}
      />
    );
  }, []);

  // Handle source selection
  const handleSourceToggle = useCallback((sourceId: string) => {
    const newActiveSources = new Set(activeSources);
    if (newActiveSources.has(sourceId)) {
      newActiveSources.delete(sourceId);
    } else {
      newActiveSources.add(sourceId);
    }
    setActiveSources(newActiveSources);
    trackInteraction(`Energy source ${newActiveSources.has(sourceId) ? 'selected' : 'deselected'}: ${sourceId}`);
    onSourceSelect?.(sourceId);
  }, [activeSources, trackInteraction, onSourceSelect]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: typeof timeRange) => {
    setTimeRange(range);
    trackInteraction(`Time range changed to: ${range}`);
    onTimeRangeChange?.(range);
  }, [trackInteraction, onTimeRangeChange]);

  // Render energy overview
  const renderEnergyOverview = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={overviewData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percentage }) => (
            <text x={0} y={0} fill="#374151" textAnchor="middle" dominantBaseline="middle">
              {name}: {serbianNumberFormatter(value)} ({(percentage * 100).toFixed(1)}%)
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
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;

            const data = payload[0].payload;
            return (
              <EnhancedTooltip
                active={active}
                payload={[
                  { name: 'Energija', value: serbianNumberFormatter(data.value), color: data.color },
                  { name: 'Udeo', value: `${data.percentage.toFixed(1)}%`, color: SERBIAN_COLORS.info }
                ]}
                label={data.name}
              />
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  // Render energy sources breakdown
  const renderEnergySources = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={sourcesBreakdownData}
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
          tickFormatter={(value) => serbianNumberFormatter(value)}
        />
        <Tooltip content={<EnergySourceTooltip />} />
        <Bar
          dataKey="production"
          name="Proizvodnja (GWh)"
          radius={[4, 4, 0, 0]}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        >
          {sourcesBreakdownData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleSourceToggle(entry.id)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Render historical trends
  const renderHistoricalTrends = () => (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={historicalTrendsData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="year"
          tick={{ fill: '#6B7280', fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          yAxisId="left"
          tickFormatter={(value) => serbianNumberFormatter(value)}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<HistoricalTooltip />} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="production"
          fill={SERBIAN_COLORS.primary}
          name="Proizvodnja (GWh)"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
        <Bar
          yAxisId="left"
          dataKey="consumption"
          fill={SERBIAN_COLORS.warning}
          name="Potrošnja (GWh)"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="renewablePercentage"
          stroke={SERBIAN_COLORS.success}
          strokeWidth={3}
          name="% Obnovljivi"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="euTarget2030"
          stroke={SERBIAN_COLORS.danger}
          strokeWidth={2}
          strokeDasharray="5 5"
          name="EU cilj 2030"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  // Render regional comparison
  const renderRegionalComparison = () => (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart data={regionalComparisonData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="consumption"
          type="number"
          name="Potrošnja"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => serbianNumberFormatter(value)}
        />
        <YAxis
          dataKey="renewablePercentage"
          type="number"
          name="Obnovljivi %"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;

            const data = payload[0].payload;
            return (
              <EnhancedTooltip
                active={active}
                payload={[
                  { name: 'Potrošnja', value: serbianNumberFormatter(data.consumption), color: SERBIAN_COLORS.primary },
                  { name: 'Proizvodnja', value: serbianNumberFormatter(data.production), color: SERBIAN_COLORS.success },
                  { name: 'Obnovljivi', value: `${data.renewablePercentage.toFixed(1)}%`, color: SERBIAN_COLORS.info },
                  { name: 'Intenzitet CO₂', value: `${data.carbonFootprint.toFixed(0)} g/kWh`, color: SERBIAN_COLORS.warning }
                ]}
                label={data.region}
              />
            );
          }}
          cursor={{ strokeDasharray: '3 3' }}
        />
        <Scatter
          data={regionalComparisonData}
          fill={SERBIAN_COLORS.primary}
          fillOpacity={0.6}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );

  // Render carbon footprint
  const renderCarbonFootprint = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={carbonFootprintData}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="sector"
          tick={{ fill: '#6B7280', fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={120}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => serbianNumberFormatter(value)}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;

            const data = payload[0].payload;
            return (
              <EnhancedTooltip
                active={active}
                payload={[
                  { name: 'Emisije', value: `${serbianNumberFormatter(data.emissions)} MtCO₂`, color: data.color },
                  { name: 'EU cilj', value: `${serbianNumberFormatter(data.euTarget)} MtCO₂`, color: SERBIAN_COLORS.info },
                  { name: 'Razlika', value: `${serbianNumberFormatter(data.targetGap)} MtCO₂`, color: SERBIAN_COLORS.warning }
                ]}
                label={data.sector}
              />
            );
          }}
        />
        <Bar
          dataKey="emissions"
          name="Emisije CO₂ (Mt)"
          radius={[4, 4, 0, 0]}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        >
          {carbonFootprintData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Chart type renderers
  const chartRenderers = {
    overview: renderEnergyOverview,
    sources: renderEnergySources,
    regional: renderRegionalComparison,
    historical: renderHistoricalTrends,
    carbon: renderCarbonFootprint,
    efficiency: renderRegionalComparison // Use regional comparison for efficiency data
  };

  // Chart type selector
  const chartTypeButtons = [
    { key: 'overview', label: 'Pregled', icon: '⚡' },
    { key: 'sources', label: 'Izvori', icon: '🔋' },
    { key: 'historical', label: 'Trendovi', icon: '📈' },
    { key: 'regional', label: 'Regioni', icon: '🗺️' },
    { key: 'carbon', label: 'Emisije', icon: '🌍' }
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
      title="Energetska analiza Srbije"
      description="Kompletna analiza energetske proizvodnje, potrošnje i tranzicije ka obnovljivim izvorima"
      loading={loading}
      error={error}
      onExport={onExport}
      className="energy-chart"
    >
      <div ref={containerRef} className="space-y-6">
        {/* Key energy metrics */}
        {energyMetrics && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-green-500 bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {energyMetrics.renewablePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Obnovljivi izvori</div>
              <div className="text-xs text-gray-500">EU cilj 2030: {EU_GREEN_DEAL_TARGETS.renewable2030}%</div>
            </div>
            <div className="bg-blue-500 bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {serbianNumberFormatter(overview.totalProduction)}
              </div>
              <div className="text-sm text-gray-600">Ukupna proizvodnja (GWh)</div>
            </div>
            <div className="bg-yellow-500 bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {energyMetrics.avgCarbonIntensity.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">gCO₂/kWh</div>
            </div>
            <div className="bg-purple-500 bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {overview.energyIndependence.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Energetska nezavisnost</div>
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

          {/* Time range selector */}
          {(type === 'historical' || type === 'carbon') && (
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

        {/* Interactive source legend */}
        {type === 'sources' && (
          <InteractiveLegend
            items={sourcesBreakdownData.map(item => ({
              name: item.name,
              color: item.color,
              value: item.production
            }))}
            activeItems={activeSources}
            onToggle={handleSourceToggle}
            serbian={true}
          />
        )}

        {/* Main chart */}
        <div
          role="img"
          aria-label={generateAriaLabel('Energija', energySources, 'Energetska proizvodnja Srbije')}
          tabIndex={accessible ? 0 : undefined}
        >
          {chartRenderers[type as keyof typeof chartRenderers]()}
        </div>

        {/* Energy transition insights */}
        {energyMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <h4 className="font-semibold text-blue-900 mb-2">⚡ Energetska tranzicija</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <strong>EU ciljevi 2030:</strong> {energyMetrics.euTargetGap.toFixed(1)}% za obnovljive
                <div className="text-xs text-blue-600">
                  Potrebno dodatnih {serbianNumberFormatter(energyMetrics.euTargetGap * overview.totalProduction / 100)} GWh
                </div>
              </div>
              <div>
                <strong>Energetska bezbednost:</strong> {overview.energyIndependence.toFixed(1)}% nezavisnost
                <div className="text-xs text-blue-600">
                  {overview.energyIndependence >= 70 ? 'Dobar nivo bezbednosti' :
                   overview.energyIndependence >= 50 ? 'Umeren nivo bezbednosti' : 'Nizak nivo bezbednosti'}
                </div>
              </div>
              <div>
                <strong>Karbon stopa:</strong> {energyMetrics.avgCarbonIntensity.toFixed(0)} gCO₂/kWh
                <div className="text-xs text-blue-600">
                  {energyMetrics.avgCarbonIntensity <= 100 ? 'Niska emisija' :
                   energyMetrics.avgCarbonIntensity <= 300 ? 'Umerena emisija' : 'Visoka emisija'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Data source info */}
        <div className="text-xs text-gray-500 text-center">
          Podaci: Ministarstvo rudarstva i energetike | EMS | Ažurirano: {new Date().toLocaleString('sr-RS')}
        </div>
      </div>
    </ChartContainer>
  );
};

export default EnhancedEnergyChart;