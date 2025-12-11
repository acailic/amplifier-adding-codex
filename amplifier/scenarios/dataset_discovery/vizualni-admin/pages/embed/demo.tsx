import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { generateMockBudgetData, generateMockDemographicsData, generateMockAirQualityData, generateMockEnergyData } from '@/lib/data/serbianData';
import BudgetChart from '@/components/charts/BudgetChart';
import DemographicsChart from '@/components/charts/DemographicsChart';
import AirQualityChart from '@/components/charts/AirQualityChart';
import EnergyChart from '@/components/charts/EnergyChart';

interface EmbedDemoProps {
  theme?: 'light' | 'dark';
  lang?: 'en' | 'sr';
  chartType?: 'budget' | 'demographics' | 'airQuality' | 'energy';
  chartVariant?: string;
  width?: number;
  height?: number;
  interactive?: boolean;
}

const EmbedDemo: React.FC<EmbedDemoProps> = () => {
  const router = useRouter();
  const [config, setConfig] = useState<EmbedDemoProps>({
    theme: 'light',
    lang: 'en',
    chartType: 'budget',
    chartVariant: 'bar',
    width: 800,
    height: 400,
    interactive: true,
  });

  // Parse query parameters
  useEffect(() => {
    if (router.isReady) {
      const {
        theme = 'light',
        lang = 'en',
        chartType = 'budget',
        chartVariant = 'bar',
        width = '800',
        height = '400',
        interactive = 'true',
      } = router.query;

      setConfig({
        theme: theme as 'light' | 'dark',
        lang: lang as 'en' | 'sr',
        chartType: chartType as 'budget' | 'demographics' | 'airQuality' | 'energy',
        chartVariant: chartVariant as string,
        width: parseInt(width as string, 10) || 800,
        height: parseInt(height as string, 10) || 400,
        interactive: interactive === 'true',
      });
    }
  }, [router.isReady, router.query]);

  // Generate mock data
  const budgetData = generateMockBudgetData();
  const demographicsData = generateMockDemographicsData();
  const airQualityData = generateMockAirQualityData();
  const energyData = generateMockEnergyData();

  // Theme styles
  const themeStyles = config.theme === 'dark' ? {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
  } : {
    backgroundColor: '#ffffff',
    color: '#000000',
  };

  const renderChart = () => {
    const commonProps = {
      width: config.width,
      height: config.height,
      interactive: config.interactive,
    };

    switch (config.chartType) {
      case 'budget':
        return <BudgetChart data={budgetData} type={config.chartVariant as any} {...commonProps} />;
      case 'demographics':
        return <DemographicsChart data={demographicsData} type={config.chartVariant as any} {...commonProps} />;
      case 'airQuality':
        return <AirQualityChart data={airQualityData} type={config.chartVariant as any} {...commonProps} />;
      case 'energy':
        return <EnergyChart data={energyData} type={config.chartVariant as any} {...commonProps} />;
      default:
        return <div>Invalid chart type</div>;
    }
  };

  // Get localized texts
  const getTexts = () => {
    const isSerbian = config.lang === 'sr';
    return {
      title: isSerbian ? 'Интерактивна Визуализација Података' : 'Interactive Data Visualization',
      poweredBy: isSerbian ? 'Погонано од стране Vizualni' : 'Powered by Vizualni',
      embedCode: isSerbian ? 'Уградња Код' : 'Embed Code',
      copyCode: isSerbian ? 'Копирај Код' : 'Copy Code',
      configuration: isSerbian ? 'Конфигурација' : 'Configuration',
      shareChart: isSerbian ? 'Подели Графикон' : 'Share Chart',
      customizeChart: isSerbian ? 'Прилагоди Графикон' : 'Customize Chart',
    };
  };

  const texts = getTexts();

  // Generate embed code
  const generateEmbedCode = () => {
    const params = new URLSearchParams({
      theme: config.theme,
      lang: config.lang,
      chartType: config.chartType,
      chartVariant: config.chartVariant,
      width: config.width.toString(),
      height: config.height.toString(),
      interactive: config.interactive.toString(),
    });

    return `<iframe
  src="${window.location.origin}/embed/demo?${params.toString()}"
  width="${config.width}"
  height="${config.height + 100}"
  frameborder="0"
  allowtransparency="true">
</iframe>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ url, title: texts.title });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      <Head>
        <title>{texts.title} | Vizualni Embed Demo</title>
        <meta name="description" content="Interactive embeddable data visualization demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={themeStyles} className="min-h-screen transition-colors duration-300">
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: config.theme === 'dark' ? '#333' : '#e5e5e5' }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">{texts.title}</h1>
            <div className="flex items-center gap-4 text-sm opacity-75">
              <span>Chart: {config.chartType}</span>
              <span>•</span>
              <span>Theme: {config.theme}</span>
              <span>•</span>
              <span>Size: {config.width}×{config.height}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Display */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-center items-center" style={{ minHeight: config.height }}>
                  {renderChart()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {texts.shareChart}
                </button>
              </div>
            </div>

            {/* Configuration Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4">{texts.configuration}</h2>

                {/* Chart Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Chart Type</label>
                  <select
                    value={config.chartType}
                    onChange={(e) => router.push({ query: { ...router.query, chartType: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="budget">Budget</option>
                    <option value="demographics">Demographics</option>
                    <option value="airQuality">Air Quality</option>
                    <option value="energy">Energy</option>
                  </select>
                </div>

                {/* Theme */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push({ query: { ...router.query, theme: 'light' } })}
                      className={`flex-1 px-3 py-2 rounded-md transition-colors ${
                        config.theme === 'light'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => router.push({ query: { ...router.query, theme: 'dark' } })}
                      className={`flex-1 px-3 py-2 rounded-md transition-colors ${
                        config.theme === 'dark'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push({ query: { ...router.query, lang: 'en' } })}
                      className={`flex-1 px-3 py-2 rounded-md transition-colors ${
                        config.lang === 'en'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => router.push({ query: { ...router.query, lang: 'sr' } })}
                      className={`flex-1 px-3 py-2 rounded-md transition-colors ${
                        config.lang === 'sr'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      Српски
                    </button>
                  </div>
                </div>

                {/* Size */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Dimensions</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs opacity-75">Width</label>
                      <input
                        type="number"
                        value={config.width}
                        onChange={(e) => router.push({ query: { ...router.query, width: e.target.value } })}
                        className="w-full px-3 py-2 border rounded-md"
                        min="300"
                        max="1200"
                      />
                    </div>
                    <div>
                      <label className="text-xs opacity-75">Height</label>
                      <input
                        type="number"
                        value={config.height}
                        onChange={(e) => router.push({ query: { ...router.query, height: e.target.value } })}
                        className="w-full px-3 py-2 border rounded-md"
                        min="200"
                        max="800"
                      />
                    </div>
                  </div>
                </div>

                {/* Interactive Toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.interactive}
                      onChange={(e) => router.push({ query: { ...router.query, interactive: e.target.checked.toString() } })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Interactive</span>
                  </label>
                </div>

                {/* Embed Code */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">{texts.embedCode}</h3>
                  <div className="relative">
                    <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                      {generateEmbedCode()}
                    </pre>
                    <button
                      onClick={handleCopyCode}
                      className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                    >
                      {texts.copyCode}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 p-4 text-center text-sm opacity-75" style={{ borderTop: `1px solid ${config.theme === 'dark' ? '#333' : '#e5e5e5'}` }}>
          <p>{texts.poweredBy} - Open Source Data Visualization Library</p>
        </div>
      </div>
    </>
  );
};

export default EmbedDemo;