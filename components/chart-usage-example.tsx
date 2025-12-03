/**
 * Enhanced Chart Components - Usage Examples and Documentation
 *
 * This file demonstrates how to use the world-class enhanced chart components
 * with Serbian context and accessibility features
 */

import React, { useState, useCallback } from 'react';

// Import all enhanced chart components
import EnhancedAirQualityChart from './enhanced-air-quality-chart';
import EnhancedDemographicsChart from './enhanced-demographics-chart';
import EnhancedBudgetChart from './enhanced-budget-chart';
import EnhancedEnergyChart from './enhanced-energy-chart';

// Import utilities
import { serbianNumberFormatter, SERBIAN_COLORS } from './enhanced-data-visualization';

// ====== SAMPLE DATA ======

// Sample Air Quality Data
const sampleAirQualityData = [
  {
    city: 'Beograd',
    aqi: 85,
    pollutants: [
      { name: 'PM2.5', value: 25, unit: 'µg/m³', limit: 15 },
      { name: 'PM10', value: 45, unit: 'µg/m³', limit: 45 },
      { name: 'NO2', value: 30, unit: 'µg/m³', limit: 40 },
      { name: 'SO2', value: 10, unit: 'µg/m³', limit: 20 },
      { name: 'CO', value: 0.5, unit: 'mg/m³', limit: 4 },
      { name: 'O3', value: 60, unit: 'µg/m³', limit: 100 }
    ],
    timestamp: '2024-01-15T12:00:00Z',
    station: 'Novi Beograd',
    coordinates: { lat: 44.8125, lng: 20.4612 }
  },
  {
    city: 'Niš',
    aqi: 125,
    pollutants: [
      { name: 'PM2.5', value: 45, unit: 'µg/m³', limit: 15 },
      { name: 'PM10', value: 75, unit: 'µg/m³', limit: 45 },
      { name: 'NO2', value: 40, unit: 'µg/m³', limit: 40 },
      { name: 'SO2', value: 25, unit: 'µg/m³', limit: 20 },
      { name: 'CO', value: 0.8, unit: 'mg/m³', limit: 4 },
      { name: 'O3', value: 50, unit: 'µg/m³', limit: 100 }
    ],
    timestamp: '2024-01-15T12:00:00Z',
    station: 'Nišava',
    coordinates: { lat: 43.3247, lng: 21.9033 }
  },
  {
    city: 'Novi Sad',
    aqi: 65,
    pollutants: [
      { name: 'PM2.5', value: 18, unit: 'µg/m³', limit: 15 },
      { name: 'PM10', value: 35, unit: 'µg/m³', limit: 45 },
      { name: 'NO2', value: 25, unit: 'µg/m³', limit: 40 },
      { name: 'SO2', value: 8, unit: 'µg/m³', limit: 20 },
      { name: 'CO', value: 0.4, unit: 'mg/m³', limit: 4 },
      { name: 'O3', value: 55, unit: 'µg/m³', limit: 100 }
    ],
    timestamp: '2024-01-15T12:00:00Z',
    station: 'Liman',
    coordinates: { lat: 45.2671, lng: 19.8335 }
  }
];

const sampleHistoricalAirQuality = Array.from({ length: 24 }, (_, i) => ({
  year: 2024,
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  aqi: Math.floor(Math.random() * 100) + 50,
  prediction: i > 20,
  confidence: i > 20 ? 0.75 : 1.0
}));

// Sample Demographics Data
const samplePopulationData = {
  totalPopulation: 6900000,
  male: 3350000,
  female: 3550000,
  households: 2500000,
  averageHouseholdSize: 2.8
};

const sampleAgeGroups = [
  { ageRange: '0-4', minAge: 0, maxAge: 4, population: 280000, male: 145000, female: 135000, percentage: 4.1 },
  { ageRange: '5-14', minAge: 5, maxAge: 14, population: 620000, male: 320000, female: 300000, percentage: 9.0 },
  { ageRange: '15-24', minAge: 15, maxAge: 24, population: 690000, male: 350000, female: 340000, percentage: 10.0 },
  { ageRange: '25-34', minAge: 25, maxAge: 34, population: 860000, male: 430000, female: 430000, percentage: 12.5 },
  { ageRange: '35-44', minAge: 35, maxAge: 44, population: 970000, male: 480000, female: 490000, percentage: 14.1 },
  { ageRange: '45-54', minAge: 45, maxAge: 54, population: 930000, male: 460000, female: 470000, percentage: 13.5 },
  { ageRange: '55-64', minAge: 55, maxAge: 64, population: 830000, male: 400000, female: 430000, percentage: 12.0 },
  { ageRange: '65-74', minAge: 65, maxAge: 74, population: 970000, male: 440000, female: 530000, percentage: 14.1 },
  { ageRange: '75-84', minAge: 75, maxAge: 84, population: 550000, male: 240000, female: 310000, percentage: 8.0 },
  { ageRange: '85+', minAge: 85, maxAge: 120, population: 240000, male: 90000, female: 150000, percentage: 3.5 }
];

const sampleRegionalData = [
  {
    name: 'Beogradski region',
    code: 'RS01',
    population: 1700000,
    area: 3222,
    density: 528,
    urban: 1500000,
    rural: 200000,
    male: 820000,
    female: 880000,
    medianAge: 42,
    growthRate: 0.5,
    municipalities: []
  },
  {
    name: 'Vojvodina',
    code: 'RS02',
    population: 1900000,
    area: 21506,
    density: 88,
    urban: 800000,
    rural: 1100000,
    male: 920000,
    female: 980000,
    medianAge: 44,
    growthRate: -0.8,
    municipalities: []
  },
  {
    name: 'Šumadija i Zapadna Srbija',
    code: 'RS03',
    population: 2100000,
    area: 31090,
    density: 68,
    urban: 700000,
    rural: 1400000,
    male: 1030000,
    female: 1070000,
    medianAge: 45,
    growthRate: -1.2,
    municipalities: []
  },
  {
    name: 'Južna i Istočna Srbija',
    code: 'RS04',
    population: 1200000,
    area: 26235,
    density: 46,
    urban: 400000,
    rural: 800000,
    male: 580000,
    female: 620000,
    medianAge: 46,
    growthRate: -1.8,
    municipalities: []
  }
];

// Sample Budget Data
const sampleBudgetData = {
  totalRevenue: 3200000000, // 3.2 billion RSD
  totalExpenditure: 3500000000, // 3.5 billion RSD
  balance: -300000000, // 300 million deficit
  year: 2024,
  currency: 'RSD' as const
};

const sampleBudgetCategories = [
  {
    id: 'socialProtection',
    name: 'Social Protection',
    nameSr: 'Socijalna zaštita',
    allocated: 1200000000,
    spent: 900000000,
    planned: 1100000000,
    percentage: 34.3,
    type: 'expenditure' as const,
    importance: 'critical' as const,
    description: 'Penzije, socijalna pomoć, zdravstvo'
  },
  {
    id: 'education',
    name: 'Education',
    nameSr: 'Obrazovanje',
    allocated: 800000000,
    spent: 650000000,
    planned: 780000000,
    percentage: 22.9,
    type: 'expenditure' as const,
    importance: 'high' as const,
    description: 'Škole, fakulteti, nauka'
  },
  {
    id: 'defense',
    name: 'Defense',
    nameSr: 'Odbrana',
    allocated: 600000000,
    spent: 580000000,
    planned: 620000000,
    percentage: 17.1,
    type: 'expenditure' as const,
    importance: 'high' as const,
    description: 'Vojska, naoružanje'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    nameSr: 'Infrastruktura',
    allocated: 500000000,
    spent: 380000000,
    planned: 480000000,
    percentage: 14.3,
    type: 'expenditure' as const,
    importance: 'medium' as const,
    description: 'Putevi, mostovi, energetika'
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    nameSr: 'Poljoprivreda',
    allocated: 200000000,
    spent: 150000000,
    planned: 190000000,
    percentage: 5.7,
    type: 'expenditure' as const,
    importance: 'medium' as const,
    description: 'Subvencije, ruralni razvoj'
  }
];

// Sample Energy Data
const sampleEnergyOverview = {
  totalProduction: 35000, // GWh
  totalConsumption: 38000, // GWh
  importExport: -3000, // Import
  renewablePercentage: 25.5,
  carbonIntensity: 450, // gCO2/kWh
  energyIndependence: 78.5 // Percentage
};

const sampleEnergySources = [
  {
    id: 'coal',
    name: 'Coal',
    nameSr: 'Ugalj',
    category: 'fossil' as const,
    production: 20000,
    capacity: 25000,
    percentage: 57.1,
    carbonFootprint: 950,
    cost: 45,
    plants: 12,
    description: 'Glavni izvor, termoelektrane'
  },
  {
    id: 'hydro',
    name: 'Hydro',
    nameSr: 'Hidroenergija',
    category: 'renewable' as const,
    production: 8000,
    capacity: 12000,
    percentage: 22.9,
    carbonFootprint: 10,
    cost: 25,
    plants: 45,
    description: 'Đerdap, Bajina Bašta'
  },
  {
    id: 'wind',
    name: 'Wind',
    nameSr: 'Vetar',
    category: 'renewable' as const,
    production: 3000,
    capacity: 4000,
    percentage: 8.6,
    carbonFootprint: 11,
    cost: 35,
    plants: 8,
    description: 'Alibunar, Kostolac'
  },
  {
    id: 'gas',
    name: 'Natural Gas',
    nameSr: 'Prirodni gas',
    category: 'fossil' as const,
    production: 2000,
    capacity: 3000,
    percentage: 5.7,
    carbonFootprint: 400,
    cost: 65,
    plants: 3,
    description: 'Uvoz iz Rusije'
  },
  {
    id: 'solar',
    name: 'Solar',
    nameSr: 'Sunčana energija',
    category: 'renewable' as const,
    production: 1500,
    capacity: 2000,
    percentage: 4.3,
    carbonFootprint: 45,
    cost: 50,
    plants: 15,
    description: 'Debeli Breg, distribuirani sistemi'
  },
  {
    id: 'biomass',
    name: 'Biomass',
    nameSr: 'Biomasa',
    category: 'renewable' as const,
    production: 500,
    capacity: 800,
    percentage: 1.4,
    carbonFootprint: 50,
    cost: 40,
    plants: 20,
    description: 'Poljoprivredni otpad'
  }
];

// ====== DEMONSTRATION COMPONENT ======

const ChartDemo: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'air' | 'demographics' | 'budget' | 'energy'>('air');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Export handler
  const handleExport = useCallback(async (format: 'png' | 'svg' | 'csv') => {
    console.log(`Exporting chart as ${format}`);
    // Implement export logic here
    // This would use html2canvas, svg-to-png, or csv generation
    alert(`Export functionality for ${format} would be implemented here`);
  }, []);

  // City selection handler
  const handleCitySelect = useCallback((city: string) => {
    console.log(`City selected: ${city}`);
  }, []);

  // Region selection handler
  const handleRegionSelect = useCallback((region: string) => {
    console.log(`Region selected: ${region}`);
  }, []);

  // Category selection handler
  const handleCategorySelect = useCallback((category: string) => {
    console.log(`Category selected: ${category}`);
  }, []);

  // Source selection handler
  const handleSourceSelect = useCallback((source: string) => {
    console.log(`Energy source selected: ${source}`);
  }, []);

  // Time range change handler
  const handleTimeRangeChange = useCallback((range: '1y' | '5y' | '10y' | 'all' | '24h' | '7d' | '30d') => {
    console.log(`Time range changed to: ${range}`);
    setLoading(true);
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Simulate loading and error states
  const simulateError = () => {
    setError('Simulated error: Unable to load chart data');
    setLoading(false);
  };

  const simulateLoading = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced Data Visualization Components
          </h1>
          <p className="text-lg text-gray-600">
            World-class chart components with Serbian context, accessibility, and interactive features
          </p>
        </header>

        {/* Chart type selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Chart Type:</h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setActiveChart('air')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeChart === 'air'
                  ? 'bg-serbia-red text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🌫️ Air Quality
            </button>
            <button
              onClick={() => setActiveChart('demographics')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeChart === 'demographics'
                  ? 'bg-serbia-red text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👥 Demographics
            </button>
            <button
              onClick={() => setActiveChart('budget')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeChart === 'budget'
                  ? 'bg-serbia-red text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💰 Budget
            </button>
            <button
              onClick={() => setActiveChart('energy')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeChart === 'energy'
                  ? 'bg-serbia-red text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚡ Energy
            </button>
          </div>

          {/* Demo controls */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={simulateLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Simulate Loading
            </button>
            <button
              onClick={simulateError}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Simulate Error
            </button>
            <button
              onClick={() => { setLoading(false); setError(null); }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Reset State
            </button>
          </div>
        </div>

        {/* Render selected chart */}
        <div className="space-y-8">
          {activeChart === 'air' && (
            <EnhancedAirQualityChart
              data={sampleAirQualityData}
              historicalData={sampleHistoricalAirQuality}
              type="cityComparison"
              loading={loading}
              error={error}
              onCitySelect={handleCitySelect}
              onTimeRangeChange={handleTimeRangeChange}
              onExport={handleExport}
              animated={true}
              accessible={true}
              language="sr"
            />
          )}

          {activeChart === 'demographics' && (
            <EnhancedDemographicsChart
              populationData={samplePopulationData}
              ageGroupData={sampleAgeGroups}
              regionData={sampleRegionalData}
              type="populationPyramid"
              loading={loading}
              error={error}
              onRegionSelect={handleRegionSelect}
              onTimeRangeChange={handleTimeRangeChange}
              onExport={handleExport}
              animated={true}
              accessible={true}
              language="sr"
            />
          )}

          {activeChart === 'budget' && (
            <EnhancedBudgetChart
              currentBudget={sampleBudgetData}
              categories={sampleBudgetCategories}
              type="overview"
              loading={loading}
              error={error}
              onCategorySelect={handleCategorySelect}
              onTimeRangeChange={handleTimeRangeChange}
              onExport={handleExport}
              animated={true}
              accessible={true}
              language="sr"
            />
          )}

          {activeChart === 'energy' && (
            <EnhancedEnergyChart
              overview={sampleEnergyOverview}
              energySources={sampleEnergySources}
              type="overview"
              loading={loading}
              error={error}
              onSourceSelect={handleSourceSelect}
              onTimeRangeChange={handleTimeRangeChange}
              onExport={handleExport}
              animated={true}
              accessible={true}
              language="sr"
            />
          )}
        </div>

        {/* Features documentation */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Component Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-600 mb-2">✅ Accessibility</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• WCAG 2.1 AA compliance</li>
                <li>• Screen reader support</li>
                <li>• Keyboard navigation</li>
                <li>• High contrast colors</li>
                <li>• ARIA labels</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-600 mb-2">🇷🇸 Serbian Context</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Serbian language support</li>
                <li>• RSD currency formatting</li>
                <li>• Serbian color palette</li>
                <li>• Local data sources</li>
                <li>• Cultural relevance</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-600 mb-2">⚡ Performance</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Lazy loading support</li>
                <li>• Responsive design</li>
                <li>• 300ms animations</li>
                <li>• Virtualization ready</li>
                <li>• Optimized rendering</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-600 mb-2">🎯 Interactivity</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Hover effects</li>
                <li>• Click interactions</li>
                <li>• Data filtering</li>
                <li>• Time range selection</li>
                <li>• Tooltips</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-600 mb-2">📊 Data Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time updates</li>
                <li>• Historical trends</li>
                <li>• Predictions</li>
                <li>• Comparisons</li>
                <li>• Data validation</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-600 mb-2">🔧 Development</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• TypeScript support</li>
                <li>• Customizable props</li>
                <li>• Event callbacks</li>
                <li>• Export functions</li>
                <li>• Error boundaries</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage example code */}
        <div className="mt-8 bg-gray-900 text-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Usage Example:</h3>
          <pre className="text-sm overflow-x-auto">
{`import React from 'react';
import { EnhancedAirQualityChart } from './components/enhanced-air-quality-chart';

function App() {
  const handleExport = async (format) => {
    // Export logic here
  };

  const handleCitySelect = (city) => {
    // City selection logic here
  };

  return (
    <EnhancedAirQualityChart
      data={airQualityData}
      type="cityComparison"
      loading={false}
      onCitySelect={handleCitySelect}
      onExport={handleExport}
      animated={true}
      accessible={true}
      language="sr"
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ChartDemo;