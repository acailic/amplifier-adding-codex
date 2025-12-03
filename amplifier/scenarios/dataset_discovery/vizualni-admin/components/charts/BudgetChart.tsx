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
  Treemap
} from 'recharts';
import { useTranslation } from 'next-i18next';
import { formatCurrency } from '@/lib/data/serbianData';

interface BudgetData {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
  municipalities?: Array<{
    name: string;
    amount: number;
  }>;
}

interface BudgetChartProps {
  data: BudgetData[];
  type?: 'bar' | 'pie' | 'treemap';
  height?: number;
}

const COLORS = ['#C6363C', '#0C4076', '#115740', '#FFA500', '#9B59B6', '#3498DB'];

export const BudgetChart: React.FC<BudgetChartProps> = ({
  data,
  type = 'bar',
  height = 400
}) => {
  const { t } = useTranslation('common');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label || payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Budžet: {formatCurrency(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-sm text-gray-600">
              Potrošeno: {formatCurrency(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="category"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => `${value / 1000000}M`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="budget"
          fill="#C6363C"
          name="Budžet"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="spent"
          fill="#0C4076"
          name="Potrošeno"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    const pieData = data.map(item => ({
      name: item.category,
      value: item.budget
    }));

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={Math.min(height, 400) / 2 - 40}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Budžet']}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderTreemap = () => {
    const treemapData = data.map((item, index) => ({
      name: item.category,
      size: item.budget
    }));

    return (
      <ResponsiveContainer width="100%" height={height}>
        <Treemap
          data={[{ name: 'Budžet', children: treemapData }]}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#C6363C"
        />
      </ResponsiveContainer>
    );
  };

  const chartTypes = {
    bar: renderBarChart,
    pie: renderPieChart,
    treemap: renderTreemap,
  };

  return (
    <div className="chart-container">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('budget:title')}
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
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {chartTypes[type as keyof typeof chartTypes]()}
    </div>
  );
};

export default BudgetChart;