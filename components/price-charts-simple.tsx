import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { PriceData } from '../app/charts/price/types';

interface SimplePriceTrendChartProps {
  data: PriceData[];
  className?: string;
}

export function SimplePriceTrendChart({ data, className = '' }: SimplePriceTrendChartProps) {
  const trendData = data.slice(0, 10).map((item, index) => ({
    name: (item.name || '').substring(0, 15),
    cena: item.currentPrice || 0,
    original: item.originalPrice || 0,
    index: index + 1
  }));

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString('sr-RS')} RSD`, 'Cena']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="cena"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Trenutna cena"
          />
          <Line
            type="monotone"
            dataKey="original"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            name="Originalna cena"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SimplePriceComparisonChartProps {
  data: PriceData[];
  className?: string;
}

export function SimplePriceComparisonChart({ data, className = '' }: SimplePriceComparisonChartProps) {
  const comparisonData = data.slice(0, 8).map(item => ({
    name: (item.name || '').substring(0, 20),
    trenutna: item.currentPrice || 0,
    originalna: item.originalPrice || 0,
    popust: item.originalPrice && item.currentPrice
      ? ((item.originalPrice - item.currentPrice) / item.originalPrice * 100).toFixed(1)
      : '0'
  }));

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={comparisonData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={80}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString('sr-RS')} RSD`, 'Cena']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar dataKey="trenutna" fill="#3b82f6" name="Trenutna cena" />
          <Bar dataKey="originalna" fill="#ef4444" name="Originalna cena" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SimpleDiscountAnalysisChartProps {
  data: PriceData[];
  className?: string;
}

export function SimpleDiscountAnalysisChart({ data, className = '' }: SimpleDiscountAnalysisChartProps) {
  const discountRanges = [
    { range: '0-10%', count: 0, color: '#ef4444' },
    { range: '10-20%', count: 0, color: '#f59e0b' },
    { range: '20-30%', count: 0, color: '#10b981' },
    { range: '30-50%', count: 0, color: '#3b82f6' },
    { range: '50%+', count: 0, color: '#8b5cf6' }
  ];

  data.forEach(item => {
    const discount = ((item.originalPrice - item.currentPrice) / item.originalPrice) * 100;
    if (discount < 10) discountRanges[0].count++;
    else if (discount < 20) discountRanges[1].count++;
    else if (discount < 30) discountRanges[2].count++;
    else if (discount < 50) discountRanges[3].count++;
    else discountRanges[4].count++;
  });

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={discountRanges.filter(d => d.count > 0)}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ range, percent }) => `${range} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {discountRanges.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, 'Proizvoda']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SimplePriceHeatmapProps {
  data: PriceData[];
  className?: string;
}

export function SimplePriceHeatmap({ data, className = '' }: SimplePriceHeatmapProps) {
  const categoryBrandData = React.useMemo(() => {
    const categories = Array.from(new Set(data.map(item => item.category || ''))).slice(0, 5);
    const brands = Array.from(new Set(data.map(item => item.brand || ''))).slice(0, 5);

    return categories.map(category => {
      const categoryData: any = { category };
      brands.forEach(brand => {
        const items = data.filter(d => d.category === category && d.brand === brand);
        if (items.length > 0) {
          const avgPrice = items.reduce((sum, item) => sum + (item.currentPrice || 0), 0) / items.length;
          categoryData[brand] = Math.round(avgPrice);
        } else {
          categoryData[brand] = null;
        }
      });
      return categoryData;
    });
  }, [data]);

  const getHeatColor = (value: number | null, maxValue: number) => {
    if (value === null) return '#f3f4f6';
    const intensity = value / maxValue;
    if (intensity > 0.8) return '#dc2626';
    if (intensity > 0.6) return '#ea580c';
    if (intensity > 0.4) return '#f59e0b';
    if (intensity > 0.2) return '#84cc16';
    return '#10b981';
  };

  const allValues = categoryBrandData.flatMap(obj => Object.values(obj).filter(v => typeof v === 'number') as number[]);
  const maxValue = Math.max(...allValues);

  return (
    <div className={`w-full h-full overflow-auto ${className}`}>
      <div className="min-w-full">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left font-medium text-gray-900">Kategorija / Brend</th>
              {Object.keys(categoryBrandData[0] || {}).filter(key => key !== 'category').map(brand => (
                <th key={brand} className="p-2 text-center font-medium text-gray-900 min-w-[80px]">
                  {brand.substring(0, 10)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryBrandData.map((row, i) => (
              <tr key={i} className="border-t border-gray-200">
                <td className="p-2 font-medium text-gray-700 whitespace-nowrap">
                  {(row.category || '').substring(0, 15)}
                </td>
                {Object.entries(row).filter(([key]) => key !== 'category').map(([brand, value]) => (
                  <td
                    key={brand}
                    className="p-2 text-center"
                    style={{
                      backgroundColor: getHeatColor(value as number | null, maxValue),
                      color: (value as number) > maxValue / 2 ? 'white' : 'black'
                    }}
                  >
                    {value ? `${(value as number / 1000).toFixed(0)}k` : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}