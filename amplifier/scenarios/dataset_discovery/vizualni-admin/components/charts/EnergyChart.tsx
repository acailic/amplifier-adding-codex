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
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { useTranslation } from 'next-i18next';
import { formatNumber } from '@/lib/data/serbianData';

interface EnergyData {
  totalConsumption: number;
  renewablePercentage: number;
  sources: Array<{
    name: string;
    production: number;
    percentage: number;
  }>;
  sectors: Array<{
    name: string;
    consumption: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    consumption: number;
  }>;
}

interface EnergyChartProps {
  data: EnergyData;
  type?: 'sources' | 'sectors' | 'trend' | 'renewableGrowth';
  height?: number;
}

const COLORS = ['#C6363C', '#0C4076', '#115740', '#FFA500', '#9B59B6', '#3498DB'];

const RENEWABLE_SOURCES = ['Hidroenergija', 'Solarna', 'Vetrovitna', 'Biomasa'];

export const EnergyChart: React.FC<EnergyChartProps> = ({
  data,
  type = 'sources',
  height = 400
}) => {
  const { t } = useTranslation('common');

  const prepareSourcesData = () => {
    return data.sources.map(source => ({
      ...source,
      isRenewable: RENEWABLE_SOURCES.includes(source.name),
      color: RENEWABLE_SOURCES.includes(source.name) ? '#115740' : '#C6363C'
    }));
  };

  const prepareSectorsData = () => {
    return data.sectors.map(sector => ({
      ...sector,
      color: COLORS[data.sectors.indexOf(sector) % COLORS.length]
    }));
  };

  const prepareRenewableData = () => {
    // Mock data showing renewable growth over years
    const years = Array.from({ length: 10 }, (_, i) => {
      const year = new Date().getFullYear() - (9 - i);
      const renewablePercentage = Math.min(15 + i * 2.5, 40); // Gradually increase
      const totalConsumption = Math.floor(35000 + Math.random() * 10000);

      return {
        year,
        totalConsumption,
        renewableConsumption: Math.floor(totalConsumption * renewablePercentage / 100),
        renewablePercentage,
        conventionalConsumption: totalConsumption - Math.floor(totalConsumption * renewablePercentage / 100)
      };
    });

    return years;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
              {entry.dataKey === 'renewablePercentage' && '%'}
              {(entry.dataKey === 'production' || entry.dataKey === 'consumption') && ' MWh'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderSourcesChart = () => {
    const sourcesData = prepareSourcesData();

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={sourcesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="production" name="Proizvodnja">
            {sourcesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderSectorsChart = () => {
    const sectorsData = prepareSectorsData();

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={sectorsData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={Math.min(height, 400) / 2 - 40}
            fill="#8884d8"
            dataKey="consumption"
          >
            {sectorsData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatNumber(value) + ' MWh', 'Potrošnja']}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderTrendChart = () => {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data.monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="consumption"
            stroke="#C6363C"
            fill="#C6363C"
            fillOpacity={0.3}
            name="Potrošnja (MWh)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderRenewableGrowth = () => {
    const renewableData = prepareRenewableData();

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={renewableData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Potrošnja (MWh)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Obnovljiva (%)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="conventionalConsumption"
            stackId="a"
            fill="#C6363C"
            name="Konvencionalna energija"
          />
          <Bar
            yAxisId="left"
            dataKey="renewableConsumption"
            stackId="a"
            fill="#115740"
            name="Obnovljiva energija"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="renewablePercentage"
            stroke="#0C4076"
            strokeWidth={3}
            name="% Obnovljiva"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const chartTypes = {
    sources: renderSourcesChart,
    sectors: renderSectorsChart,
    trend: renderTrendChart,
    renewableGrowth: renderRenewableGrowth,
  };

  return (
    <div className="chart-container">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('energy:title')}
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
              {chartType === 'sources' && 'Izvori'}
              {chartType === 'sectors' && 'Sektori'}
              {chartType === 'trend' && 'Trend'}
              {chartType === 'renewableGrowth' && 'Rast obnovljive'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="metric-card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            {t('energy:totalConsumption')}
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(data.totalConsumption)}
          </p>
          <p className="text-sm text-gray-600">MWh</p>
        </div>
        <div className="metric-card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            {t('energy:renewableEnergy')}
          </h4>
          <p className="text-2xl font-bold text-green-600">
            {data.renewablePercentage.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            {formatNumber(Math.floor(data.totalConsumption * data.renewablePercentage / 100))} MWh
          </p>
        </div>
        <div className="metric-card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Konvencionalna energija
          </h4>
          <p className="text-2xl font-bold text-red-600">
            {(100 - data.renewablePercentage).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            {formatNumber(Math.floor(data.totalConsumption * (100 - data.renewablePercentage) / 100))} MWh
          </p>
        </div>
      </div>

      {/* Energy Mix Legend */}
      {type === 'sources' && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tip energije:</h4>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: '#115740' }} />
              <span className="text-xs text-gray-600">Obnovljiva</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: '#C6363C' }} />
              <span className="text-xs text-gray-600">Konvencionalna</span>
            </div>
          </div>
        </div>
      )}

      {chartTypes[type as keyof typeof chartTypes]()}
    </div>
  );
};

export default EnergyChart;