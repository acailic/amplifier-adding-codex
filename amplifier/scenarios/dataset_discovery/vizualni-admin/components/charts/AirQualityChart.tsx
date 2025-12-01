import React from 'react';
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTranslation } from 'next-i18next';
import { getAirQualityLevel } from '@/lib/data/serbianData';

interface AirQualityData {
  city: string;
  aqi: number;
  pollutants: Array<{
    name: string;
    value: number;
    unit: string;
  }>;
  timestamp: string;
}

interface AirQualityChartProps {
  data: AirQualityData[];
  type?: 'cityComparison' | 'pollutantRadar' | 'aqiTrend';
  height?: number;
}

const POLLUTANT_COLORS = {
  'PM2.5': '#C6363C',
  'PM10': '#0C4076',
  'NO2': '#115740',
  'SO2': '#FFA500',
  'CO': '#9B59B6',
  'O3': '#3498DB'
};

const AQI_COLORS = {
  1: '#00E400', // Good
  2: '#FFFF00', // Moderate
  3: '#FF7E00', // Unhealthy for Sensitive Groups
  4: '#FF0000', // Unhealthy
  5: '#8F3F97', // Very Unhealthy
  6: '#7E0023'  // Hazardous
};

export const AirQualityChart: React.FC<AirQualityChartProps> = ({
  data,
  type = 'cityComparison',
  height = 400
}) => {
  const { t } = useTranslation('common');

  const getAqiCategory = (aqi: number): number => {
    if (aqi <= 50) return 1;
    if (aqi <= 100) return 2;
    if (aqi <= 150) return 3;
    if (aqi <= 200) return 4;
    if (aqi <= 300) return 5;
    return 6;
  };

  const prepareCityComparisonData = () => {
    return data.map(item => ({
      city: item.city,
      AQI: item.aqi,
      category: getAqiCategory(item.aqi),
      level: getAirQualityLevel(item.aqi).level,
      color: AQI_COLORS[getAqiCategory(item.aqi) as keyof typeof AQI_COLORS]
    }));
  };

  const prepareRadarData = () => {
    // Average pollutants across all cities
    const pollutantAverages: { [key: string]: number } = {};
    const pollutantUnits: { [key: string]: string } = {};

    data.forEach(cityData => {
      cityData.pollutants.forEach(pollutant => {
        if (!pollutantAverages[pollutant.name]) {
          pollutantAverages[pollutant.name] = 0;
          pollutantUnits[pollutant.name] = pollutant.unit;
        }
        pollutantAverages[pollutant.name] += pollutant.value;
      });
    });

    // Normalize average values (divide by number of cities)
    Object.keys(pollutantAverages).forEach(key => {
      pollutantAverages[key] = Math.round(pollutantAverages[key] / data.length);
    });

    return Object.keys(pollutantAverages).map(name => ({
      pollutant: name,
      value: pollutantAverages[name],
      unit: pollutantUnits[name],
      fullMark: 150 // Max value for radar chart
    }));
  };

  const prepareTrendData = () => {
    // Generate mock trend data for the last 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => {
      const date = new Date();
      date.setHours(date.getHours() - (23 - i));
      return {
        hour: date.getHours().toString().padStart(2, '0') + ':00',
        AQI: Math.floor(Math.random() * 100) + 50
      };
    });

    return hours;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label || data.city}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'AQI' && ` (${data.level || ''})`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCityComparison = () => {
    const comparisonData = prepareCityComparisonData();

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="city"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            domain={[0, 300]}
            ticks={[0, 50, 100, 150, 200, 250, 300]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="AQI" name="AQI">
            {comparisonData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPollutantRadar = () => {
    const radarData = prepareRadarData();

    return (
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="pollutant"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 150]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
          />
          <Radar
            name="Prosečna vrednost"
            dataKey="value"
            stroke="#C6363C"
            fill="#C6363C"
            fillOpacity={0.3}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{data.pollutant}</p>
                    <p className="text-sm text-gray-600">
                      Prosečna vrednost: {data.value} {data.unit}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const renderAqiTrend = () => {
    const trendData = prepareTrendData();

    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            interval={3}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            domain={[0, 300]}
            ticks={[0, 50, 100, 150, 200, 250, 300]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="AQI"
            stroke="#C6363C"
            strokeWidth={2}
            dot={{ fill: '#C6363C', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const chartTypes = {
    cityComparison: renderCityComparison,
    pollutantRadar: renderPollutantRadar,
    aqiTrend: renderAqiTrend,
  };

  // AQI Legend
  const aqiLegend = [
    { category: 1, level: 'Dobar (0-50)', color: AQI_COLORS[1] },
    { category: 2, level: 'Umeren (51-100)', color: AQI_COLORS[2] },
    { category: 3, level: 'Nezdrav za osetljive (101-150)', color: AQI_COLORS[3] },
    { category: 4, level: 'Nezdrav (151-200)', color: AQI_COLORS[4] },
    { category: 5, level: 'Veoma nezdrav (201-300)', color: AQI_COLORS[5] },
    { category: 6, level: 'Opasan (300+)', color: AQI_COLORS[6] },
  ];

  return (
    <div className="chart-container">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('airQuality:title')}
        </h3>
        <div className="flex space-x-2">
          {Object.keys(chartTypes).map((chartType) => (
            <button
              key={chartType}
              onClick={() => null} // In a real app, this would change the chart type
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                type === chartType
                  ? 'bg-serbia-red text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {chartType === 'cityComparison' && 'Poređenje gradova'}
              {chartType === 'pollutantRadar' && 'Zagađivači'}
              {chartType === 'aqiTrend' && 'AQI trend'}
            </button>
          ))}
        </div>
      </div>

      {type === 'cityComparison' && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">AQI kategorije:</h4>
          <div className="flex flex-wrap gap-2">
            {aqiLegend.map((item) => (
              <div key={item.category} className="flex items-center">
                <div
                  className="w-4 h-4 rounded mr-1"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {chartTypes[type as keyof typeof chartTypes]()}
    </div>
  );
};

export default AirQualityChart;