import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ColumnChart,
  Column,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ComposedChart
} from 'recharts';
import { generateMockBudgetData, generateMockDemographicsData, generateMockAirQualityData, generateMockEnergyData, formatCurrency, formatNumber } from '@/lib/data/serbianData';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';

const ChartsDemo: React.FC = () => {
  // State management
  const [selectedChart, setSelectedChart] = useState<string>('line');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'en' | 'sr-latn' | 'sr-cyr'>('en');
  const [animateCharts, setAnimateCharts] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState('budget');

  // Generate mock data
  const [budgetData, setBudgetData] = useState(generateMockBudgetData());
  const [demographicsData, setDemographicsData] = useState(generateMockDemographicsData());
  const [airQualityData, setAirQualityData] = useState(generateMockAirQualityData());
  const [energyData, setEnergyData] = useState(generateMockEnergyData());

  // Serbian color palette
  const serbianColors = {
    primary: ['#C6363C', '#0C4076', '#115740', '#FFA500', '#9B59B6', '#3498DB'],
    gradients: [
      { start: '#C6363C', end: '#0C4076' },
      { start: '#115740', end: '#3498DB' },
      { start: '#FFA500', end: '#C6363C' }
    ]
  };

  // Translations
  const translations = {
    'en': {
      title: 'Interactive Charts Showcase',
      subtitle: 'Explore various chart types with Serbian data',
      chartTypes: {
        line: 'Line Chart',
        bar: 'Bar Chart',
        column: 'Column Chart',
        pie: 'Pie Chart',
        area: 'Area Chart',
        scatter: 'Scatter Plot',
        radar: 'Radar Chart',
        treemap: 'Treemap',
        composed: 'Composed Chart'
      },
      datasets: {
        budget: 'Municipal Budget',
        demographics: 'Population Data',
        airQuality: 'Air Quality',
        energy: 'Energy Consumption'
      },
      controls: {
        theme: 'Theme',
        language: 'Language',
        animation: 'Animation',
        grid: 'Grid',
        legend: 'Legend',
        refreshData: 'Refresh Data'
      }
    },
    'sr-latn': {
      title: 'Interaktivni Prikazi Grafikona',
      subtitle: 'Istražite različite vrste grafikona sa srpskim podacima',
      chartTypes: {
        line: 'Linijski Grafikon',
        bar: 'Trakasti Grafikon',
        column: 'Kolonski Grafikon',
        pie: 'Pita Grafikon',
        area: 'Oblastni Grafikon',
        scatter: 'Raspršeni Grafikon',
        radar: 'Radarski Grafikon',
        treemap: 'Drvo Mapa',
        composed: 'Kombinovani Grafikon'
      },
      datasets: {
        budget: 'Opštinski Budžet',
        demographics: 'Podaci o Stanovništvu',
        airQuality: 'Kvalitet Vazduha',
        energy: 'Potrošnja Energije'
      },
      controls: {
        theme: 'Tema',
        language: 'Jezik',
        animation: 'Animacija',
        grid: 'Mreža',
        legend: 'Legenda',
        refreshData: 'Osveži Podatke'
      }
    },
    'sr-cyr': {
      title: 'Интерактивни Прикази Графикона',
      subtitle: 'Истражите различите врсте графикона са српским подацима',
      chartTypes: {
        line: 'Линијски Графикон',
        bar: 'Тракасти Графикон',
        column: 'Колонски Графикон',
        pie: 'Пита Графикон',
        area: 'Областни Графикон',
        scatter: 'Распршени Графикон',
        radar: 'Радарски Графикон',
        treemap: 'Дрво Мапа',
        composed: 'Комбиновани Графикон'
      },
      datasets: {
        budget: 'Општински Буџет',
        demographics: 'Подаци о Становништву',
        airQuality: 'Квалитет Ваздуха',
        energy: 'Потрошња Енергије'
      },
      controls: {
        theme: 'Тема',
        language: 'Језик',
        animation: 'Анимација',
        grid: 'Мрежа',
        legend: 'Легенда',
        refreshData: 'Освежи Податке'
      }
    }
  };

  const t = translations[language];

  // Prepare data for different chart types
  const prepareLineData = () => {
    return budgetData.map(item => ({
      category: item.category,
      budget: item.budget / 1000000,
      spent: item.spent / 1000000,
      percentage: item.percentage
    }));
  };

  const prepareBarData = () => {
    return demographicsData.municipalities.slice(0, 10).map(item => ({
      name: item.name,
      population: item.population,
      density: item.density
    }));
  };

  const preparePieData = () => {
    return energyData.sources.map(source => ({
      name: source.name,
      value: source.production,
      percentage: source.percentage
    }));
  };

  const prepareScatterData = () => {
    return airQualityData.map(city => ({
      city: city.city,
      aqi: city.aqi,
      pollutants: city.pollutants.reduce((sum, p) => sum + p.value, 0) / city.pollutants.length,
      pm25: city.pollutants.find(p => p.name === 'PM2.5')?.value || 0,
      pm10: city.pollutants.find(p => p.name === 'PM10')?.value || 0
    }));
  };

  const prepareRadarData = () => {
    const avgPollutants = airQualityData.reduce((acc, city) => {
      city.pollutants.forEach(pollutant => {
        if (!acc[pollutant.name]) {
          acc[pollutant.name] = { total: 0, count: 0 };
        }
        acc[pollutant.name].total += pollutant.value;
        acc[pollutant.name].count++;
      });
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(avgPollutants).map(([name, data]) => ({
      pollutant: name,
      value: Math.round(data.total / data.count),
      fullMark: 150
    }));
  };

  const prepareTreemapData = () => {
    return budgetData.map(item => ({
      name: item.category,
      size: item.budget,
      children: item.municipalities.slice(0, 3).map(m => ({
        name: m.name,
        size: m.amount
      }))
    }));
  };

  const prepareComposedData = () => {
    return energyData.monthlyTrend.map((month, index) => ({
      month: month.month,
      consumption: month.consumption,
      production: energyData.sources[index % energyData.sources.length].production,
      efficiency: Math.round((month.consumption / 100) * (80 + Math.random() * 20))
    }));
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('budget') || entry.name.includes('spent')
                ? formatCurrency(entry.value * 1000000)
                : entry.name.includes('percentage')
                ? `${entry.value}%`
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render functions for different chart types
  const renderChart = () => {
    const chartProps = {
      width: '100%',
      height: 400,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (selectedChart) {
      case 'line':
        return (
          <ResponsiveContainer {...chartProps}>
            <LineChart data={prepareLineData()}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis dataKey="category" tick={{ fill: '#6b7280' }} />
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey="budget"
                stroke="#C6363C"
                strokeWidth={3}
                animationDuration={animateCharts ? 2000 : 0}
                dot={{ fill: '#C6363C', r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="#0C4076"
                strokeWidth={3}
                animationDuration={animateCharts ? 2000 : 0}
                dot={{ fill: '#0C4076', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={prepareBarData()}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis dataKey="name" tick={{ fill: '#6b7280' }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Bar dataKey="population" fill="#C6363C" animationDuration={animateCharts ? 2000 : 0} />
              <Bar dataKey="density" fill="#0C4076" animationDuration={animateCharts ? 2000 : 0} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'column':
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={prepareLineData()} layout="horizontal">
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis type="number" tick={{ fill: '#6b7280' }} />
              <YAxis dataKey="category" type="category" tick={{ fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Bar dataKey="budget" fill="#115740" animationDuration={animateCharts ? 2000 : 0} />
              <Bar dataKey="spent" fill="#FFA500" animationDuration={animateCharts ? 2000 : 0} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = preparePieData();
        return (
          <ResponsiveContainer {...chartProps}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                animationDuration={animateCharts ? 2000 : 0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={serbianColors.primary[index % serbianColors.primary.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...chartProps}>
            <AreaChart data={energyData.monthlyTrend}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey="consumption"
                stackId="1"
                stroke="#C6363C"
                fill="#C6363C"
                fillOpacity={0.6}
                animationDuration={animateCharts ? 2000 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer {...chartProps}>
            <ScatterChart data={prepareScatterData()}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis dataKey="pm25" name="PM2.5" tick={{ fill: '#6b7280' }} />
              <YAxis dataKey="aqi" name="AQI" tick={{ fill: '#6b7280' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Scatter name="Gradovi" data={prepareScatterData()} fill="#0C4076">
                {prepareScatterData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={serbianColors.primary[index % serbianColors.primary.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer {...chartProps}>
            <RadarChart data={prepareRadarData()}>
              {showGrid && <PolarGrid stroke="#e5e7eb" />}
              <PolarAngleAxis dataKey="pollutant" tick={{ fill: '#6b7280' }} />
              <PolarRadiusAxis angle={90} domain={[0, 150]} tick={{ fill: '#6b7280' }} />
              <Radar
                name="Prosečna vrednost"
                dataKey="value"
                stroke="#C6363C"
                fill="#C6363C"
                fillOpacity={0.3}
                animationDuration={animateCharts ? 2000 : 0}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'treemap':
        return (
          <ResponsiveContainer {...chartProps}>
            <Treemap
              data={prepareTreemapData()}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#C6363C"
              animationDuration={animateCharts ? 2000 : 0}
            />
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer {...chartProps}>
            <ComposedChart data={prepareComposedData()}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
              <YAxis yAxisId="left" tick={{ fill: '#6b7280' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Bar yAxisId="left" dataKey="consumption" fill="#C6363C" animationDuration={animateCharts ? 2000 : 0} />
              <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#0C4076" strokeWidth={3} animationDuration={animateCharts ? 2000 : 0} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Refresh data
  const refreshData = () => {
    setBudgetData(generateMockBudgetData());
    setDemographicsData(generateMockDemographicsData());
    setAirQualityData(generateMockAirQualityData());
    setEnergyData(generateMockEnergyData());
  };

  return (
    <>
      <Head>
        <title>Charts Demo - Vizualni-Admin</title>
        <meta name="description" content="Interactive charts showcase with Serbian data visualization" />
      </Head>

      <MainLayout>
        <div className="animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient-serbia mb-4">
              {t.title}
            </h1>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Controls Panel */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">{t.controls.theme}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Chart Type Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Chart Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(t.chartTypes).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedChart(key)}
                      className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                        selectedChart === key
                          ? 'bg-serbia-red text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t.controls.language}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      language === 'en'
                        ? 'bg-serbia-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('sr-latn')}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      language === 'sr-latn'
                        ? 'bg-serbia-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    LAT
                  </button>
                  <button
                    onClick={() => setLanguage('sr-cyr')}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      language === 'sr-cyr'
                        ? 'bg-serbia-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ЋИР
                  </button>
                </div>
              </div>

              {/* Toggle Options */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={animateCharts}
                      onChange={(e) => setAnimateCharts(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-700">{t.controls.animation}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-700">{t.controls.grid}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showLegend}
                      onChange={(e) => setShowLegend(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-700">{t.controls.legend}</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Actions
                </label>
                <Button
                  onClick={refreshData}
                  variant="primary"
                  className="w-full"
                >
                  {t.controls.refreshData}
                </Button>
              </div>
            </div>
          </div>

          {/* Chart Display */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                {t.chartTypes[selectedChart as keyof typeof t.chartTypes]}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-600">Theme:</span>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
              </div>
            </div>

            <div className={theme === 'dark' ? 'bg-gray-900 rounded-lg p-4' : ''}>
              {renderChart()}
            </div>

            {/* Chart Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-serbia-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-serbia-red-900 mb-1">Data Points</h4>
                <p className="text-2xl font-bold text-serbia-red-600">
                  {selectedChart === 'pie' ? preparePieData().length :
                   selectedChart === 'radar' ? prepareRadarData().length :
                   selectedChart === 'treemap' ? prepareTreemapData().length :
                   selectedChart === 'scatter' ? prepareScatterData().length :
                   selectedChart === 'composed' ? prepareComposedData().length :
                   selectedChart === 'area' ? energyData.monthlyTrend.length :
                   selectedChart === 'bar' ? prepareBarData().length :
                   prepareLineData().length}
                </p>
              </div>
              <div className="bg-serbia-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-serbia-blue-900 mb-1">Chart Type</h4>
                <p className="text-lg font-bold text-serbia-blue-600 capitalize">
                  {selectedChart}
                </p>
              </div>
              <div className="bg-serbia-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-serbia-green-900 mb-1">Language</h4>
                <p className="text-lg font-bold text-serbia-green-600 uppercase">
                  {language}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-serbia-red-50 to-serbia-red-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-serbia-red-900 mb-2">Interactive Charts</h3>
              <p className="text-sm text-serbia-red-700">
                Hover over data points for detailed information. Click legends to toggle series.
              </p>
            </div>
            <div className="bg-gradient-to-br from-serbia-blue-50 to-serbia-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-serbia-blue-900 mb-2">Responsive Design</h3>
              <p className="text-sm text-serbia-blue-700">
                Charts automatically adapt to different screen sizes and orientations.
              </p>
            </div>
            <div className="bg-gradient-to-br from-serbia-green-50 to-serbia-green-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-serbia-green-900 mb-2">Serbian Data</h3>
              <p className="text-sm text-serbia-green-700">
                Real-world examples using Serbian municipal and demographic data.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .text-gradient-serbia {
          background: linear-gradient(135deg, #C6363C 0%, #0C4076 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </>
  );
};

export default ChartsDemo;