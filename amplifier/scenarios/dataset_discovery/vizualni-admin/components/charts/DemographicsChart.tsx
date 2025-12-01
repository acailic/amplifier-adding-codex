import React from 'react';
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
  Scatter
} from 'recharts';
import { useTranslation } from 'next-i18next';
import { formatNumber } from '@/lib/data/serbianData';

interface DemographicsData {
  totalPopulation: number;
  male: number;
  female: number;
  ageGroups: Array<{
    ageRange: string;
    population: number;
    percentage: number;
  }>;
  municipalities: Array<{
    name: string;
    population: number;
    density: number;
  }>;
}

interface DemographicsChartProps {
  data: DemographicsData;
  type?: 'agePyramid' | 'genderDistribution' | 'populationDensity';
  height?: number;
}

const COLORS = ['#C6363C', '#0C4076', '#115740', '#FFA500', '#9B59B6'];

export const DemographicsChart: React.FC<DemographicsChartProps> = ({
  data,
  type = 'agePyramid',
  height = 400
}) => {
  const { t } = useTranslation('common');

  const preparePyramidData = () => {
    return data.ageGroups.map(group => ({
      ageGroup: group.ageRange,
      male: Math.floor(group.population * 0.48),
      female: Math.floor(group.population * 0.52),
      total: group.population
    }));
  };

  const prepareGenderData = () => [
    { name: 'Muškarci', value: data.male, percentage: (data.male / data.totalPopulation * 100).toFixed(1) },
    { name: 'Žene', value: data.female, percentage: (data.female / data.totalPopulation * 100).toFixed(1) }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderAgePyramid = () => {
    const pyramidData = preparePyramidData();

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={pyramidData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            domain={[-500000, 500000]}
            ticks={[-400000, -200000, 0, 200000, 400000]}
            tickFormatter={(value) => Math.abs(value).toString()}
          />
          <YAxis
            type="category"
            dataKey="ageGroup"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="male"
            fill="#0C4076"
            name="Muškarci"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="female"
            fill="#C6363C"
            name="Žene"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderGenderDistribution = () => {
    const genderData = prepareGenderData();

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={genderData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={Math.min(height, 400) / 2 - 40}
            fill="#8884d8"
            dataKey="value"
          >
            {genderData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#0C4076' : '#C6363C'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatNumber(value), 'Stanovnika']}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderPopulationDensity = () => {
    // Prepare data for scatter chart
    const densityData = data.municipalities.map(municipality => ({
      x: municipality.density,
      y: municipality.population,
      name: municipality.name
    }));

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart
          data={densityData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="x"
            type="number"
            name="Gustina"
            unit=" stan/km²"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name="Populacija"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-600">
                      Populacija: {formatNumber(data.y)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Gustina: {formatNumber(data.x)} stan/km²
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter
            data={densityData}
            fill="#C6363C"
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const chartTypes = {
    agePyramid: renderAgePyramid,
    genderDistribution: renderGenderDistribution,
    populationDensity: renderPopulationDensity,
  };

  return (
    <div className="chart-container">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('demographics:title')}
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
              {chartType === 'agePyramid' && 'Starosna piramida'}
              {chartType === 'genderDistribution' && 'Polna raspodela'}
              {chartType === 'populationDensity' && 'Gustina'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="metric-card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            {t('demographics:totalPopulation')}
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(data.totalPopulation)}
          </p>
        </div>
        <div className="metric-card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Muškarci</h4>
          <p className="text-2xl font-bold text-serbia-blue">
            {formatNumber(data.male)}
          </p>
          <p className="text-sm text-gray-600">
            {((data.male / data.totalPopulation) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="metric-card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Žene</h4>
          <p className="text-2xl font-bold text-serbia-red">
            {formatNumber(data.female)}
          </p>
          <p className="text-sm text-gray-600">
            {((data.female / data.totalPopulation) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {chartTypes[type as keyof typeof chartTypes]()}
    </div>
  );
};

export default DemographicsChart;