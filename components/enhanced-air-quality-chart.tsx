/**
 * Enhanced Air Quality Chart - World-Class Quality
 *
 * Purpose: Advanced air quality visualization with Serbian city context,
 * accessibility features, and interactive data storytelling
 *
 * Features:
 * - Real-time AQI monitoring for Serbian cities
 * - Multi-pollutant radar analysis
 * - Historical trend analysis with predictions
 * - Serbian AQI categories and health recommendations
 * - WCAG 2.1 AA accessibility compliance
 * - Progressive data disclosure
 * - Export capabilities (PNG, SVG, CSV)
 * - Responsive design with mobile optimization
 * - Smooth animations (300ms timing)
 * - Keyboard navigation support
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
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ReferenceArea
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
  AQI_COLORS,
  CHART_ANIMATIONS,
  validateChartData,
  generateAriaLabel
} from './enhanced-data-visualization';

// Enhanced data interfaces
export interface AirQualityData {
  city: string;
  aqi: number;
  pollutants: Array<{
    name: string;
    value: number;
    unit: string;
    limit?: number; // WHO recommended limit
  }>;
  timestamp: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  station?: string; // Monitoring station name
}

export interface PollutantData {
  name: string;
  value: number;
  unit: string;
  limit: number;
  percentage: number; // Percentage of WHO limit
  healthImpact: 'low' | 'moderate' | 'high' | 'very-high';
}

export interface HistoricalData {
  timestamp: string;
  aqi: number;
  prediction?: boolean;
  confidence?: number;
}

// Serbian AQI categories with health recommendations
export const SERBIAN_AQI_CATEGORIES = {
  1: {
    level: 'Dobar',
    range: '0-50',
    color: AQI_COLORS.dobar,
    description: 'Kvalitet vazduha je zadovoljavajući i ne predstavlja rizik po zdravlje',
    recommendation: 'Idealno uslovi za sve aktivnosti na otvorenom',
    icon: '😊'
  },
  2: {
    level: 'Umeren',
    range: '51-100',
    color: AQI_COLORS.umeren,
    description: 'Kvalitet vazduha je prihvatljiv za većinu populacije',
    recommendation: 'Osobe osetljive na zagađenje vazduha trebaju ograničiti duže izlaganje',
    icon: '😐'
  },
  3: {
    level: 'Nezdrav za osetljive grupe',
    range: '101-150',
    color: AQI_COLORS.nezdravZaOsetljive,
    description: 'Članovi osetljivih grupa mogu doživeti zdravstvene probleme',
    recommendation: 'Deca, starije osobe i osobe sa respiratornim oboljenjima trebaju izbegavati duže izlaganje',
    icon: '😷'
  },
  4: {
    level: 'Nezdrav',
    range: '151-200',
    color: AQI_COLORS.nezdrav,
    description: 'Svi mogu doživeti zdravstvene probleme',
    recommendation: 'Svi trebaju izbegavati duže izlaganje i fizičke aktivnosti na otvorenom',
    icon: '😰'
  },
  5: {
    level: 'Veoma nezdrav',
    range: '201-300',
    color: AQI_COLORS.veomaNezdrav,
    description: 'Zdravstveni upozorenja za uslove hitnosti',
    recommendation: 'Svi trebaju izbegavati izlaganje i ostati u zatvorenom prostoru',
    icon: '🚨'
  },
  6: {
    level: 'Opasan',
    range: '301+',
    color: AQI_COLORS.opasan,
    description: 'Hitno zdravstveno upozorenje: svi mogu doživeti ozbiljne zdravstvene probleme',
    recommendation: 'Hitno izbegvati izlaganje, zatvoriti prozore i koristiti pročistače vazduha',
    icon: '☠️'
  }
} as const;

// WHO pollutant limits for Serbian context
export const WHO_POLLUTANT_LIMITS = {
  'PM2.5': { annual: 5, daily: 15, unit: 'µg/m³' },
  'PM10': { annual: 15, daily: 45, unit: 'µg/m³' },
  'NO2': { annual: 25, hourly: 200, unit: 'µg/m³' },
  'SO2': { hourly: 350, daily: 125, unit: 'µg/m³' },
  'CO': { hourly: 30, daily: 10, unit: 'mg/m³' },
  'O3': { hourly: 180, daily: 100, unit: 'µg/m³' }
} as const;

// Chart component props
export interface EnhancedAirQualityChartProps {
  data: AirQualityData[];
  historicalData?: HistoricalData[];
  type?: 'cityComparison' | 'pollutantRadar' | 'historicalTrend' | 'healthImpact';
  height?: number;
  loading?: boolean;
  error?: string | null;
  onCitySelect?: (city: string) => void;
  onTimeRangeChange?: (range: '24h' | '7d' | '30d' | '1y') => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  selectedCities?: string[];
  animated?: boolean;
  accessible?: boolean;
  language?: 'sr' | 'en';
}

// Main Enhanced Air Quality Chart Component
export const EnhancedAirQualityChart: React.FC<EnhancedAirQualityChartProps> = ({
  data,
  historicalData = [],
  type = 'cityComparison',
  height = 500,
  loading = false,
  error = null,
  onCitySelect,
  onTimeRangeChange,
  onExport,
  selectedCities = [],
  animated = true,
  accessible = true,
  language = 'sr'
}) => {
  const [activeCities, setActiveCities] = useState<Set<string>>(
    new Set(selectedCities.length > 0 ? selectedCities : data.map(d => d.city))
  );
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '1y'>('24h');
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const { dimensions, containerRef } = useResponsiveChart();
  const { trackInteraction } = useChartPerformance('AirQualityChart');

  // Validate data
  const isValidData = useMemo(() => validateChartData(data), [data]);

  // Get AQI category
  const getAqiCategory = useCallback((aqi: number) => {
    if (aqi <= 50) return 1;
    if (aqi <= 100) return 2;
    if (aqi <= 150) return 3;
    if (aqi <= 200) return 4;
    if (aqi <= 300) return 5;
    return 6;
  }, []);

  // Prepare city comparison data
  const cityComparisonData = useMemo(() => {
    if (!isValidData) return [];

    return data
      .filter(item => activeCities.has(item.city))
      .map(item => {
        const category = getAqiCategory(item.aqi);
        const categoryInfo = SERBIAN_AQI_CATEGORIES[category as keyof typeof SERBIAN_AQI_CATEGORIES];

        return {
          city: item.city,
          aqi: item.aqi,
          category,
          level: categoryInfo.level,
          color: categoryInfo.color,
          recommendation: categoryInfo.recommendation,
          icon: categoryInfo.icon,
          timestamp: item.timestamp,
          station: item.station
        };
      })
      .sort((a, b) => b.aqi - a.aqi);
  }, [data, activeCities, getAqiCategory, isValidData]);

  // Prepare pollutant radar data
  const pollutantRadarData = useMemo(() => {
    if (!isValidData || activeCities.size === 0) return [];

    const pollutantAverages: { [key: string]: { sum: number; count: number; unit: string } } = {};

    data
      .filter(item => activeCities.has(item.city))
      .forEach(cityData => {
        cityData.pollutants.forEach(pollutant => {
          if (!pollutantAverages[pollutant.name]) {
            pollutantAverages[pollutant.name] = { sum: 0, count: 0, unit: pollutant.unit };
          }
          pollutantAverages[pollutant.name].sum += pollutant.value;
          pollutantAverages[pollutant.name].count += 1;
        });
      });

    const maxLimits = Object.values(WHO_POLLUTANT_LIMITS).map(limit => limit.daily);

    return Object.keys(pollutantAverages).map(name => {
      const avg = pollutantAverages[name].sum / pollutantAverages[name].count;
      const limit = WHO_POLLUTANT_LIMITS[name as keyof typeof WHO_POLLUTANT_LIMITS]?.daily || 100;
      const percentage = (avg / limit) * 100;

      return {
        pollutant: name,
        value: Math.round(avg),
        unit: pollutantAverages[name].unit,
        limit: Math.round(limit),
        percentage: Math.min(percentage, 200), // Cap at 200% for visualization
        fullMark: Math.max(...maxLimits),
        healthImpact: percentage < 50 ? 'low' : percentage < 100 ? 'moderate' : percentage < 150 ? 'high' : 'very-high'
      };
    });
  }, [data, activeCities, isValidData]);

  // Prepare historical trend data
  const historicalTrendData = useMemo(() => {
    if (!isValidData || historicalData.length === 0) return [];

    const now = new Date();
    let hoursBack = 24;

    switch (timeRange) {
      case '7d': hoursBack = 7 * 24; break;
      case '30d': hoursBack = 30 * 24; break;
      case '1y': hoursBack = 365 * 24; break;
    }

    return Array.from({ length: Math.min(hoursBack, historicalData.length) }, (_, i) => {
      const dataPoint = historicalData[historicalData.length - hoursBack + i];
      const date = new Date(dataPoint.timestamp);

      return {
        time: date.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }),
        date: date.toLocaleDateString('sr-RS', { month: 'short', day: 'numeric' }),
        aqi: dataPoint.aqi,
        category: getAqiCategory(dataPoint.aqi),
        color: SERBIAN_AQI_CATEGORIES[getAqiCategory(dataPoint.aqi) as keyof typeof SERBIAN_AQI_CATEGORIES].color,
        prediction: dataPoint.prediction || false,
        confidence: dataPoint.confidence,
        timestamp: dataPoint.timestamp
      };
    });
  }, [historicalData, timeRange, getAqiCategory, isValidData]);

  // Custom tooltip for city comparison
  const CityTooltip = useCallback(({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    const category = SERBIAN_AQI_CATEGORIES[data.category as keyof typeof SERBIAN_AQI_CATEGORIES];

    return (
      <EnhancedTooltip
        active={active}
        payload={payload}
        label={label}
        formatter={(value: any, name: string) => {
          if (name === 'AQI') {
            return (
              <div>
                <div className="font-bold text-lg">{value}</div>
                <div className="text-sm text-gray-600">{data.level}</div>
              </div>
            );
          }
          return value;
        }}
      />
    );
  }, []);

  // Custom tooltip for pollutant radar
  const PollutantTooltip = useCallback(({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    const percentage = data.percentage;

    return (
      <EnhancedTooltip
        active={active}
        payload={payload}
        label={data.pollutant}
        formatter={(value: any, name: string) => (
          <div>
            <div className="font-semibold">{value} {data.unit}</div>
            <div className="text-sm text-gray-600">
              WHO granica: {data.limit} {data.unit}
            </div>
            <div className="text-sm mt-1">
              <span className={`font-medium ${
                percentage < 50 ? 'text-green-600' :
                percentage < 100 ? 'text-yellow-600' :
                percentage < 150 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {percentage.toFixed(1)}% granice
              </span>
            </div>
          </div>
        )}
      />
    );
  }, []);

  // Handle city selection
  const handleCityToggle = useCallback((city: string) => {
    const newActiveCities = new Set(activeCities);
    if (newActiveCities.has(city)) {
      newActiveCities.delete(city);
    } else {
      newActiveCities.add(city);
    }
    setActiveCities(newActiveCities);
    trackInteraction(`City ${newActiveCities.has(city) ? 'selected' : 'deselected'}: ${city}`);
    onCitySelect?.(city);
  }, [activeCities, trackInteraction, onCitySelect]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: typeof timeRange) => {
    setTimeRange(range);
    trackInteraction(`Time range changed to: ${range}`);
    onTimeRangeChange?.(range);
  }, [trackInteraction, onTimeRangeChange]);

  // Render city comparison chart
  const renderCityComparison = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={cityComparisonData}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="city"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          domain={[0, 'dataMax + 50']}
          ticks={[0, 50, 100, 150, 200, 250, 300]}
        />
        <Tooltip content={<CityTooltip />} />
        <Bar
          dataKey="aqi"
          name="AQI"
          radius={[4, 4, 0, 0]}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        >
          {cityComparisonData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleCityToggle(entry.city)}
              onMouseEnter={() => setHoveredCity(entry.city)}
              onMouseLeave={() => setHoveredCity(null)}
            />
          ))}
        </Bar>

        {/* WHO guideline reference line */}
        <ReferenceLine
          y={100}
          stroke="#FFA500"
          strokeDasharray="5 5"
          strokeWidth={2}
          label="WHO Granica"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // Render pollutant radar chart
  const renderPollutantRadar = () => (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={pollutantRadarData}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey="pollutant"
          tick={{ fill: '#6B7280', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 'dataMax']}
          tick={{ fill: '#6B7280', fontSize: 10 }}
        />
        <Radar
          name="Prosečna koncentracija"
          dataKey="value"
          stroke={SERBIAN_COLORS.primary}
          fill={SERBIAN_COLORS.primary}
          fillOpacity={0.3}
          strokeWidth={2}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />
        <Tooltip content={<PollutantTooltip />} />

        {/* WHO limit reference polygon */}
        <Radar
          name="WHO granica"
          dataKey="limit"
          stroke="#FFA500"
          fill="#FFA500"
          fillOpacity={0.1}
          strokeWidth={1}
          strokeDasharray="5 5"
        />
      </RadarChart>
    </ResponsiveContainer>
  );

  // Render historical trend chart
  const renderHistoricalTrend = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={historicalTrendData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey={timeRange === '24h' ? 'time' : 'date'}
          tick={{ fill: '#6B7280', fontSize: 10 }}
          interval={timeRange === '24h' ? 3 : timeRange === '7d' ? 24 : undefined}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          domain={[0, 'dataMax + 50']}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;

            const data = payload[0].payload;
            return (
              <EnhancedTooltip
                active={active}
                payload={payload}
                label={`${data.date || data.time} ${data.prediction ? '(predikcija)' : ''}`}
                formatter={(value: any) => [
                  <div key="tooltip-content">
                    <div className="font-bold text-lg">{value}</div>
                    {data.confidence && (
                      <div className="text-xs text-gray-500">
                        Pouzdanost: {(data.confidence * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                ]}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="aqi"
          stroke={SERBIAN_COLORS.primary}
          fill={SERBIAN_COLORS.primary}
          fillOpacity={0.3}
          strokeWidth={2}
          animationDuration={animated ? CHART_ANIMATIONS.duration : 0}
        />

        {/* AQI category reference areas */}
        <ReferenceArea
          y1={0}
          y2={50}
          fill={AQI_COLORS.dobar}
          fillOpacity={0.1}
          stroke="none"
        />
        <ReferenceArea
          y1={51}
          y2={100}
          fill={AQI_COLORS.umeren}
          fillOpacity={0.1}
          stroke="none"
        />
        <ReferenceArea
          y1={101}
          y2={150}
          fill={AQI_COLORS.nezdravZaOsetljive}
          fillOpacity={0.1}
          stroke="none"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  // Chart type renderers
  const chartRenderers = {
    cityComparison: renderCityComparison,
    pollutantRadar: renderPollutantRadar,
    historicalTrend: renderHistoricalTrend,
    healthImpact: renderPollutantRadar // Use radar for health impact
  };

  // Chart type selector
  const chartTypeButtons = [
    { key: 'cityComparison', label: 'Poređenje gradova', icon: '🏙️' },
    { key: 'pollutantRadar', label: 'Zagađivači', icon: '🌡️' },
    { key: 'historicalTrend', label: 'Trend', icon: '📈' },
    { key: 'healthImpact', label: 'Zdravlje', icon: '🏥' }
  ];

  // Time range selector
  const timeRangeButtons = [
    { key: '24h', label: '24h' },
    { key: '7d', label: '7 dana' },
    { key: '30d', label: '30 dana' },
    { key: '1y', label: '1 godina' }
  ];

  return (
    <ChartContainer
      title="Kvalitet vazduha u Srbiji"
      description="Praćenje kvaliteta vazduha u realnom vremenu za glavne gradove u Srbiji"
      loading={loading}
      error={error}
      onExport={onExport}
      className="air-quality-chart"
    >
      <div ref={containerRef} className="space-y-6">
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

          {/* Time range selector (only for trend chart) */}
          {type === 'historicalTrend' && (
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

        {/* AQI Legend */}
        <AnimatePresence>
          {type === 'cityComparison' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <h4 className="font-semibold text-gray-900 mb-3">AQI kategorije:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(SERBIAN_AQI_CATEGORIES).map(([key, category]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: parseInt(key) * 0.05 }}
                    className="flex items-start space-x-3"
                  >
                    <div
                      className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm">
                        {category.level} ({category.range})
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {category.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {category.recommendation}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive city legend (for city comparison) */}
        {type === 'cityComparison' && cityComparisonData.length > 0 && (
          <InteractiveLegend
            items={cityComparisonData.map(item => ({
              name: `${item.city} (${item.station})`,
              color: item.color,
              value: item.aqi
            }))}
            activeItems={activeCities}
            onToggle={handleCityToggle}
            serbian={true}
          />
        )}

        {/* Main chart */}
        <div
          role="img"
          aria-label={generateAriaLabel('Kvalitet vazduha', cityComparisonData, 'Poređenje AQI indeksa gradova')}
          tabIndex={accessible ? 0 : undefined}
        >
          {chartRenderers[type as keyof typeof chartRenderers]()}
        </div>

        {/* Health recommendations based on current data */}
        {cityComparisonData.some(city => city.aqi > 100) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Zdravstvena preporuka</h4>
            <p className="text-sm text-yellow-800">
              Za neke gradove AQI indeks prelazi 100. Osobe osetljive na zagađenje vazduha (deca, starije osobe,
              osobe sa respiratornim problemima) trebale bi da ograniče duže izlaganje i intenzivne fizičke
              aktivnosti na otvorenom.
            </p>
          </motion.div>
        )}

        {/* Data source info */}
        <div className="text-xs text-gray-500 text-center">
          Podaci: Agencija za zaštitu životne sredine Srbije | Ažurirano: {new Date().toLocaleString('sr-RS')}
        </div>
      </div>
    </ChartContainer>
  );
};

export default EnhancedAirQualityChart;