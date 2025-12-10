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
  Legend,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';
import { PriceData } from '../app/charts/price/types';

interface EnhancedPriceTrendChartProps {
  data: PriceData[];
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
  showForecast?: boolean;
  className?: string;
}

export function EnhancedPriceTrendChart({
  data,
  timeRange = '30d',
  showForecast = false,
  className = ''
}: EnhancedPriceTrendChartProps) {
  // Simulate time series data with more points
  const generateTimeSeriesData = () => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;

    return Array.from({ length: Math.min(days, 20) }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i));

      const basePrice = data.length > 0 ? data[0].price || 5000 : 5000;
      const variation = Math.sin(i / 5) * 1000 + Math.random() * 500;

      return {
        date: date.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' }),
        cena: Math.round(basePrice + variation),
        original: Math.round(basePrice + variation + 1000),
        predvidjanje: showForecast && i > 15 ? Math.round(basePrice + variation + 200) : null
      };
    });
  };

  const trendData = generateTimeSeriesData();

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toLocaleString('sr-RS')} RSD`,
              name === 'cena' ? 'Trenutna cena' : name === 'original' ? 'Originalna cena' : 'Predviđanje'
            ]}
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
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Trenutna cena"
          />
          <Line
            type="monotone"
            dataKey="original"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            name="Originalna cena"
          />
          {showForecast && (
            <Line
              type="monotone"
              dataKey="predvidjanje"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="10 5"
              dot={false}
              name="Prognoza"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CategoryDistributionChartProps {
  data: PriceData[];
  className?: string;
}

export function CategoryDistributionChart({ data, className = '' }: CategoryDistributionChartProps) {
  const categoryData = React.useMemo(() => {
    const categories = data.reduce((acc, item) => {
      const category = item.categorySr || 'Ostalo';
      if (!acc[category]) {
        acc[category] = { count: 0, totalPrice: 0 };
      }
      acc[category].count++;
      acc[category].totalPrice += item.price || 0;
      return acc;
    }, {} as Record<string, { count: number; totalPrice: number }>);

    return Object.entries(categories)
      .map(([category, stats]) => ({
        category,
        proizvoda: stats.count,
        vrednost: stats.totalPrice,
        prosečnaCena: Math.round(stats.totalPrice / stats.count)
      }))
      .sort((a, b) => b.proizvoda - a.proizvoda);
  }, [data]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="proizvoda"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              value,
              name === 'proizvoda' ? 'Proizvoda' : name === 'vrednost' ? 'Vrednost (RSD)' : 'Prosečna cena (RSD)'
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PriceVolatilityChartProps {
  data: PriceData[];
  className?: string;
}

export function PriceVolatilityChart({ data, className = '' }: PriceVolatilityChartProps) {
  const volatilityData = React.useMemo(() => {
    // Simulate price changes over time for different products
    return data.slice(0, 8).map((item, index) => {
      const basePrice = item.price || 5000;
      const volatility = 0.1 + Math.random() * 0.3; // 10-40% volatility

      const changes = Array.from({ length: 12 }, (_, i) => ({
        mesec: new Date(2024, i, 1).toLocaleDateString('sr-RS', { month: 'short' }),
        cena: Math.round(basePrice * (1 + (Math.random() - 0.5) * volatility))
      }));

      return {
        naziv: (item.productNameSr || '').substring(0, 15),
        volatilnost: Math.round(volatility * 100),
        prosečnaCena: Math.round(basePrice),
        minimalnaCena: Math.round(basePrice * (1 - volatility)),
        maksimalnaCena: Math.round(basePrice * (1 + volatility))
      };
    });
  }, [data]);

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={volatilityData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            label={{ value: 'Volatilnost (%)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="category"
            dataKey="naziv"
            tick={{ fontSize: 12 }}
            width={80}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value}%`,
              'Volatilnost'
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="volatilnost" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface RetailerComparisonRadarProps {
  data: PriceData[];
  className?: string;
}

export function RetailerComparisonRadar({ data, className = '' }: RetailerComparisonRadarProps) {
  const radarData = React.useMemo(() => {
    const retailers = Array.from(new Set(data.map(item => item.retailer)));

    return retailers.slice(0, 5).map(retailer => {
      const retailerData = data.filter(item => item.retailer === retailer);
      const avgPrice = retailerData.reduce((sum, item) => sum + (item.price || 0), 0) / retailerData.length;
      const discountRate = retailerData.filter(item => item.originalPrice && item.originalPrice > item.price).length / retailerData.length * 100;
      const productRange = retailerData.length;

      return {
        prodavac: retailer,
        cena: Math.min(100, Math.round((avgPrice / 100) * 20)), // Normalized to 0-100
        popusti: Math.round(discountRate),
        izbor: Math.min(100, Math.round((productRange / 20) * 100)),
        dostupnost: Math.round(70 + Math.random() * 30) // Simulated availability
      };
    });
  }, [data]);

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="prodavac" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="Cena (niže je bolje)"
            dataKey="cena"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Popusti (%)"
            dataKey="popusti"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Izbor proizvoda"
            dataKey="izbor"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Dostupnost"
            dataKey="dostupnost"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PriceScatterPlotProps {
  data: PriceData[];
  className?: string;
}

export function PriceScatterPlot({ data, className = '' }: PriceScatterPlotProps) {
  const scatterData = React.useMemo(() => {
    return data.map((item, index) => ({
      id: item.id,
      naziv: (item.productNameSr || '').substring(0, 20),
      cena: item.price || Math.random() * 50000,
      popust: item.originalPrice && item.price
        ? ((item.originalPrice - item.price) / item.originalPrice) * 100
        : Math.random() * 50,
      kategorija: item.categorySr || 'Ostalo',
      ocena: 3 + Math.random() * 2 // Simulated rating 3-5
    }));
  }, [data]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="cena"
            name="Cena"
            unit=" RSD"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="number"
            dataKey="popust"
            name="Popust"
            unit="%"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{data.naziv}</p>
                    <p className="text-sm text-gray-600">Cena: {data.cena.toLocaleString('sr-RS')} RSD</p>
                    <p className="text-sm text-gray-600">Popust: {data.popust.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Kategorija: {data.kategorija}</p>
                    <p className="text-sm text-gray-600">Ocena: {data.ocena.toFixed(1)} ⭐</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter name="Proizvodi" data={scatterData} fill="#3b82f6">
            {scatterData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MarketShareTreemapProps {
  data: PriceData[];
  className?: string;
}

export function MarketShareTreemap({ data, className = '' }: MarketShareTreemapProps) {
  const treemapData = React.useMemo(() => {
    const categories = data.reduce((acc, item) => {
      const category = item.categorySr || 'Ostalo';
      const retailer = item.retailerName || 'Ostalo';

      if (!acc[category]) {
        acc[category] = { name: category, children: [] };
      }

      const retailerValue = data.filter(d => d.categorySr === category && d.retailerName === retailer)
        .reduce((sum, d) => sum + (d.price || 0), 0);

      if (retailerValue > 0) {
        acc[category].children.push({
          name: retailer,
          size: retailerValue
        });
      }

      return acc;
    }, {} as Record<string, { name: string; children: Array<{ name: string; size: number }> }>);

    return Object.values(categories);
  }, [data]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#3b82f6"
          content={({ x, y, width, height, name, value }: any) => (
            <g>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                  fill: COLORS[Math.floor(Math.random() * COLORS.length)],
                  stroke: '#fff',
                  strokeWidth: 2,
                  strokeOpacity: 1
                }}
              />
              {width > 50 && height > 30 && (
                <>
                  <text
                    x={x + width / 2}
                    y={y + height / 2 - 8}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={14}
                    fontWeight="bold"
                  >
                    {name}
                  </text>
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + 8}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                  >
                    {value ? `${(value / 1000).toFixed(0)}k RSD` : ''}
                  </text>
                </>
              )}
            </g>
          )}
        />
      </ResponsiveContainer>
    </div>
  );
}