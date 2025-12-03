/**
 * Enhanced Demographics Chart - World-Class Quality
 *
 * Purpose: Advanced Serbian population visualization with demographic insights,
 * cultural context, and interactive data exploration
 *
 * Features:
 * - Population pyramid with Serbian age groups
 * - Regional demographic comparison
 * - Migration and urbanization trends
 * - Serbian municipality and regional data
 * - WCAG 2.1 AA accessibility compliance
 * - Progressive data disclosure
 * - Interactive filtering and exploration
 * - Export capabilities (PNG, SVG, CSV)
 * - Responsive design with mobile optimization
 * - Smooth animations (300ms timing)
 * - Serbian language and formatting
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
  ScatterChart,
  Scatter,
  Treemap,
  AreaChart,
  Area
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
export interface PopulationData {
  totalPopulation: number;
  male: number;
  female: number;
  households: number;
  averageHouseholdSize: number;
}

export interface AgeGroupData {
  ageRange: string;
  minAge: number;
  maxAge: number;
  population: number;
  male: number;
  female: number;
  percentage: number;
  dependencyRatio?: number;
}

export interface RegionData {
  name: string;
  code: string;
  population: number;
  area: number;
  density: number;
  urban: number;
  rural: number;
  male: number;
  female: number;
  medianAge: number;
  growthRate: number;
  municipalities: MunicipalityData[];
}

export interface MunicipalityData {
  name: string;
  population: number;
  area: number;
  density: number;
  isUrban: boolean;
  region: string;
}

export interface MigrationData {
  year: number;
  emigration: number;
  immigration: number;
  netMigration: number;
  mainDestinations?: Array<{
    country: string;
    count: number;
  }>;
}

export interface EducationData {
  level: string;
  population: number;
  percentage: number;
  male: number;
  female: number;
}

// Serbian age groups with cultural context
export const SERBIAN_AGE_GROUPS = [
  { range: '0-4', min: 0, max: 4, category: 'Predškolska deca', color: '#E8F5E8' },
  { range: '5-9', min: 5, max: 9, category: 'Školska deca', color: '#C8E6C9' },
  { range: '10-14', min: 10, max: 14, category: 'Mlađi adolescenti', color: '#A5D6A7' },
  { range: '15-19', min: 15, max: 19, category: 'Stariji adolescenti', color: '#81C784' },
  { range: '20-24', min: 20, max: 24, category: 'Mladi odrasli', color: '#66BB6A' },
  { range: '25-34', min: 25, max: 34, category: 'Radno aktivni', color: '#4CAF50' },
  { range: '35-44', min: 35, max: 44, category: 'Radno aktivni', color: '#43A047' },
  { range: '45-54', min: 45, max: 54, category: 'Radno aktivni', color: '#388E3C' },
  { range: '55-64', min: 55, max: 64, category: 'Starija radna snaga', color: '#2E7D32' },
  { range: '65-74', min: 65, max: 74, category: 'Penzioneri', color: '#1B5E20' },
  { range: '75-84', min: 75, max: 84, category: 'Stara populacija', color: '#1B5E20' },
  { range: '85+', min: 85, max: 120, category: 'Veoma stara populacija', color: '#0D47A1' }
] as const;

// Serbian regions
export const SERBIAN_REGIONS = [
  { code: 'RS00', name: 'Srbija', color: SERBIAN_COLORS.primary },
  { code: 'RS01', name: 'Beogradski region', color: SERBIAN_COLORS.secondary },
  { code: 'RS02', name: 'Vojvodina', color: SERBIAN_COLORS.success },
  { code: 'RS03', name: 'Šumadija i Zapadna Srbija', color: SERBIAN_COLORS.warning },
  { code: 'RS04', name: 'Južna i Istočna Srbija', color: SERBIAN_COLORS.danger },
  { code: 'RS05', name: 'Kosovo i Metohija', color: SERBIAN_COLORS.neutral }
] as const;

// Chart component props
export interface EnhancedDemographicsChartProps {
  populationData: PopulationData;
  ageGroupData: AgeGroupData[];
  regionData: RegionData[];
  migrationData?: MigrationData[];
  educationData?: EducationData[];
  type?: 'populationPyramid' | 'regionalComparison' | 'migrationTrends' | 'education' | 'urbanization';
  height?: number;
  loading?: boolean;
  error?: string | null;
  onRegionSelect?: (region: string) => void;
  onTimeRangeChange?: (range: '1y' | '5y' | '10y' | 'all') => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  selectedRegions?: string[];
  animated?: boolean;
  accessible?: boolean;
  language?: 'sr' | 'en';
}

// Main Enhanced Demographics Chart Component
export const EnhancedDemographicsChart: React.FC<EnhancedDemographicsChartProps> = ({
  populationData,
  ageGroupData,
  regionData,
  migrationData = [],
  educationData = [],
  type = 'populationPyramid',
  height = 500,
  loading = false,
  error = null,
  onRegionSelect,
  onTimeRangeChange,
  onExport,
  selectedRegions = [],
  animated = true,
  accessible = true,
  language = 'sr'
}) => {
  const [activeRegions, setActiveRegions] = useState<Set<string>>(
    new Set(selectedRegions.length > 0 ? selectedRegions : regionData.map(r => r.name))
  );
  const [timeRange, setTimeRange] = useState<'1y' | '5y' | '10y' | 'all'>('all');
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<Set<string>>(
    new Set(ageGroupData.map(g => g.ageRange))
  );

  const { dimensions, containerRef } = useResponsiveChart();
  const { trackInteraction } = useChartPerformance('DemographicsChart');

  // Validate data
  const isValidData = useMemo(() =>
    validateChartData(ageGroupData) && validateChartData(regionData),
    [ageGroupData, regionData]
  );

  // Calculate demographic metrics
  const demographicMetrics = useMemo(() => {
    if (!isValidData) return null;

    const totalPopulation = populationData.totalPopulation;
    const workingAge = ageGroupData
      .filter(g => g.minAge >= 15 && g.maxAge <= 64)
      .reduce((sum, g) => sum + g.population, 0);
    const youngPopulation = ageGroupData
      .filter(g => g.maxAge <= 14)
      .reduce((sum, g) => sum + g.population, 0);
    const elderlyPopulation = ageGroupData
      .filter(g => g.minAge >= 65)
      .reduce((sum, g) => sum + g.population, 0);

    return {
      workingAge,
      youngPopulation,
      elderlyPopulation,
      dependencyRatio: ((youngPopulation + elderlyPopulation) / workingAge) * 100,
      agingIndex: (elderlyPopulation / youngPopulation) * 100,
      medianAge: Math.round(
        ageGroupData.reduce((sum, g, i) => {
          const midPoint = (g.minAge + g.maxAge) / 2;
          return sum + (midPoint * g.population);
        }, 0) / totalPopulation
      )
    };
  }, [ageGroupData, populationData.totalPopulation, isValidData]);

  // Prepare population pyramid data
  const pyramidData = useMemo(() => {
    if (!isValidData) return [];

    return ageGroupData
      .filter(g => selectedAgeGroups.has(g.ageRange))
      .map(group => ({
        ageGroup: group.ageRange,
        male: -group.male, // Negative for left side visualization
        female: group.female,
        totalMale: group.male,
        totalFemale: group.female,
        total: group.population,
        percentage: group.percentage,
        category: SERBIAN_AGE_GROUPS.find(serbGroup => serbGroup.range === group.ageRange)?.category || ''
      }))
      .reverse(); // Oldest at top
  }, [ageGroupData, selectedAgeGroups, isValidData]);

  // Prepare regional comparison data
  const regionalComparisonData = useMemo(() => {
    if (!isValidData) return [];

    return regionData
      .filter(region => activeRegions.has(region.name))
      .map(region => ({
        name: region.name,
        population: region.population,
        density: region.density,
        urbanization: (region.urban / region.population) * 100,
        growthRate: region.growthRate,
        medianAge: region.medianAge,
        color: SERBIAN_REGIONS.find(r => r.name === region.name)?.color || SERBIAN_COLORS.primary
      }))
      .sort((a, b) => b.population - a.population);
  }, [regionData, activeRegions, isValidData]);

  // Prepare migration trends data
  const migrationTrendsData = useMemo(() => {
    if (!isValidData || migrationData.length === 0) return [];

    let yearsToInclude = migrationData.length;
    switch (timeRange) {
      case '1y': yearsToInclude = 1; break;
      case '5y': yearsToInclude = 5; break;
      case '10y': yearsToInclude = 10; break;
    }

    return migrationData
      .slice(-yearsToInclude)
      .map(data => ({
        year: data.year,
        emigration: data.emigration,
        immigration: data.immigration,
        netMigration: data.netMigration,
        emigrationRate: (data.emigration / populationData.totalPopulation) * 1000,
        immigrationRate: (data.immigration / populationData.totalPopulation) * 1000
      }));
  }, [migrationData, timeRange, populationData.totalPopulation, isValidData]);

  // Prepare education data
  const educationComparisonData = useMemo(() => {
    if (!isValidData || educationData.length === 0) return [];

    return educationData.map(data => ({
      level: data.level,
      population: data.population,
      percentage: data.percentage,
      male: data.male,
      female: data.female,
      color: educationData.indexOf(data) % 2 === 0 ? SERBIAN_COLORS.secondary : SERBIAN_COLORS.primary
    }));
  }, [educationData, isValidData]);

  // Custom tooltip for population pyramid
  const PyramidTooltip = useCallback(({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
      <EnhancedTooltip
        active={active}
        payload={[
          { name: 'Muškarci', value: serbianNumberFormatter(data.totalMale), color: SERBIAN_COLORS.secondary },
          { name: 'Žene', value: serbianNumberFormatter(data.totalFemale), color: SERBIAN_COLORS.primary },
          { name: 'Ukupno', value: serbianNumberFormatter(data.total), color: SERBIAN_COLORS.neutral }
        ]}
        label={`${label} godina (${data.category})`}
        formatter={(value: any) => (
          <div>
            <div className="font-semibold">{value}</div>
            <div className="text-xs text-gray-500">
              {data.percentage.toFixed(1)}% ukupne populacije
            </div>
          </div>
        )}
      />
    );
  }, []);

  // Custom tooltip for regional comparison
  const RegionalTooltip = useCallback(({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
      <EnhancedTooltip
        active={active}
        payload={payload}
        label={data.name}
        formatter={(value: any, name: string) => {
          switch (name) {
            case 'Populacija':
              return serbianNumberFormatter(value);
            case 'Gustina':
              return `${serbianNumberFormatter(value)} stan/km²`;
            case 'Urbanizacija':
              return `${value.toFixed(1)}%`;
            case 'Stopa rasta':
              return `${value.toFixed(2)}%`;
            case 'Median starost':
              return `${value} godina`;
            default:
              return value;
          }
        }}
      />
    );
  }, []);

  // Handle region selection
  const handleRegionToggle = useCallback((region: string) => {
    const newActiveRegions = new Set(activeRegions);
    if (newActiveRegions.has(region)) {
      newActiveRegions.delete(region);
    } else {
      newActiveRegions.add(region);
    }
    setActiveRegions(newActiveRegions);
    trackInteraction(`Region ${newActiveRegions.has(region) ? 'selected' : 'deselected'}: ${region}`);
    onRegionSelect?.(region);
  }, [activeRegions, trackInteraction, onRegionSelect]);

  // Handle age group selection
  const handleAgeGroupToggle = useCallback((ageGroup: string) => {
    const newSelectedAgeGroups = new Set(selectedAgeGroups);
    if (newSelectedAgeGroups.has(ageGroup)) {
      newSelectedAgeGroups.delete(ageGroup);
    } else {
      newSelectedAgeGroups.add(ageGroup);
    }
    setSelectedAgeGroups(newSelectedAgeGroups);
    trackInteraction(`Age group ${newSelectedAgeGroups.has(ageGroup) ? 'selected' : 'deselected'}: ${ageGroup}`);
  }, [selectedAgeGroups, trackInteraction]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: typeof timeRange) => {
    setTimeRange(range);
    trackInteraction(`Time range changed to: ${range}`);
    onTimeRangeChange?.(range);
  }, [trackInteraction, onTimeRangeChange]);

  // Render population pyramid
  const renderPopulationPyramid = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={pyramidData}
        margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
        layout="horizontal"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          type="number"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          domain={[-800000, 800000]}
          ticks={[-600000, -400000, -200000, 0, 200000, 400000, 600000]}
          tickFormatter={(value) => Math.abs(value).toString()}
        />
        <YAxis
          type="category"
          dataKey="ageGroup"
          tick={{ fill: '#6B7280', fontSize: 11 }}
          width={70}
        />
        <Tooltip content={<PyramidTooltip />} />
        <Legend />
        <Bar
          dataKey="male"
          fill={SERBIAN_COLORS.secondary}
          name="Muškarci"
          radius={[0, 4, 4, 0]}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
        <Bar
          dataKey="female"
          fill={SERBIAN_COLORS.primary}
          name="Žene"
          radius={[0, 4, 4, 0]}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
      </BarChart>
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
          dataKey="name"
          tick={{ fill: '#6B7280', fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => serbianNumberFormatter(value)}
        />
        <Tooltip content={<RegionalTooltip />} />
        <Bar
          dataKey="population"
          name="Populacija"
          radius={[4, 4, 0, 0]}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        >
          {regionalComparisonData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleRegionToggle(entry.name)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Render migration trends
  const renderMigrationTrends = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={migrationTrendsData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="year"
          tick={{ fill: '#6B7280', fontSize: 12 }}
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
                payload={payload}
                label={`Godina ${data.year}`}
                formatter={(value: any, name: string) => serbianNumberFormatter(value)}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="emigration"
          stackId="1"
          stroke={SERBIAN_COLORS.danger}
          fill={SERBIAN_COLORS.danger}
          fillOpacity={0.6}
          name="Emigracija"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
        <Area
          type="monotone"
          dataKey="immigration"
          stackId="1"
          stroke={SERBIAN_COLORS.success}
          fill={SERBIAN_COLORS.success}
          fillOpacity={0.6}
          name="Imigracija"
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  // Render education comparison
  const renderEducationComparison = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={educationComparisonData}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="level"
          tick={{ fill: '#6B7280', fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis
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
                  { name: 'Ukupno', value: serbianNumberFormatter(data.population), color: data.color },
                  { name: 'Muškarci', value: serbianNumberFormatter(data.male), color: SERBIAN_COLORS.secondary },
                  { name: 'Žene', value: serbianNumberFormatter(data.female), color: SERBIAN_COLORS.primary }
                ]}
                label={data.level}
              />
            );
          }}
        />
        <Bar
          dataKey="percentage"
          name="Procenat populacije"
          radius={[4, 4, 0, 0]}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        >
          {educationComparisonData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Chart type renderers
  const chartRenderers = {
    populationPyramid: renderPopulationPyramid,
    regionalComparison: renderRegionalComparison,
    migrationTrends: renderMigrationTrends,
    education: renderEducationComparison,
    urbanization: renderRegionalComparison // Use regional comparison for urbanization
  };

  // Chart type selector
  const chartTypeButtons = [
    { key: 'populationPyramid', label: 'Starosna piramida', icon: '👥' },
    { key: 'regionalComparison', label: 'Regionalna poređenja', icon: '🗺️' },
    { key: 'migrationTrends', label: 'Migracije', icon: '✈️' },
    { key: 'education', label: 'Obrazovanje', icon: '🎓' }
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
      title="Demografski podaci Srbije"
      description="Detaljna analiza populacije, migracija i demografskih trendova u Srbiji"
      loading={loading}
      error={error}
      onExport={onExport}
      className="demographics-chart"
    >
      <div ref={containerRef} className="space-y-6">
        {/* Key demographic metrics */}
        {demographicMetrics && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-serbia-blue bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-serbia-blue">
                {serbianNumberFormatter(populationData.totalPopulation)}
              </div>
              <div className="text-sm text-gray-600">Ukupna populacija</div>
            </div>
            <div className="bg-serbia-red bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-serbia-red">
                {demographicMetrics.medianAge}
              </div>
              <div className="text-sm text-gray-600">Median starost</div>
            </div>
            <div className="bg-serbia-green bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-serbia-green">
                {demographicMetrics.dependencyRatio.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Odnos zavisnosti</div>
            </div>
            <div className="bg-yellow-500 bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {demographicMetrics.agingIndex.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Indeks starenja</div>
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

          {/* Time range selector (only for migration chart) */}
          {type === 'migrationTrends' && (
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

        {/* Interactive age group legend (for population pyramid) */}
        {type === 'populationPyramid' && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Selektuj starosne grupe:</h4>
            <div className="flex flex-wrap gap-2">
              {SERBIAN_AGE_GROUPS.map((group) => (
                <motion.button
                  key={group.range}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: SERBIAN_AGE_GROUPS.indexOf(group) * 0.02 }}
                  onClick={() => handleAgeGroupToggle(group.range)}
                  className={`px-3 py-1 rounded-md text-sm transition-all ${
                    selectedAgeGroups.has(group.range)
                      ? 'bg-white border border-gray-300 shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {group.range} god
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive region legend */}
        {type === 'regionalComparison' && (
          <InteractiveLegend
            items={regionalComparisonData.map(item => ({
              name: item.name,
              color: item.color,
              value: item.population
            }))}
            activeItems={activeRegions}
            onToggle={handleRegionToggle}
            serbian={true}
          />
        )}

        {/* Main chart */}
        <div
          role="img"
          aria-label={generateAriaLabel('Demografija', ageGroupData, 'Starosna piramida populacije Srbije')}
          tabIndex={accessible ? 0 : undefined}
        >
          {chartRenderers[type as keyof typeof chartRenderers]()}
        </div>

        {/* Demographic insights */}
        {demographicMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <h4 className="font-semibold text-blue-900 mb-2">📊 Ključni demografski uvidi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <strong>Odnos zavisnosti:</strong> {demographicMetrics.dependencyRatio.toFixed(1)}%
                <div className="text-xs text-blue-600">
                  Broj osoba u zavisnosti (deca i stariji) na 100 radno aktivnih
                </div>
              </div>
              <div>
                <strong>Indeks starenja:</strong> {demographicMetrics.agingIndex.toFixed(1)}%
                <div className="text-xs text-blue-600">
                  Odnos broja starijih (65+) prema mladima (0-14)
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Data source info */}
        <div className="text-xs text-gray-500 text-center">
          Podaci: Republički zavod za statistiku | Popis stanovništva 2022 | Ažurirano: {new Date().toLocaleString('sr-RS')}
        </div>
      </div>
    </ChartContainer>
  );
};

export default EnhancedDemographicsChart;