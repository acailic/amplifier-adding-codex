import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import {
  generateMockBudgetData,
  generateMockDemographicsData,
  generateMockAirQualityData,
  generateMockEnergyData,
  formatNumber,
  formatCurrency
} from '@/lib/data/serbianData';

export default function HomePage() {
  const { t } = useTranslation('common');

  // Generate mock data for overview
  const budgetData = generateMockBudgetData();
  const demographicsData = generateMockDemographicsData();
  const airQualityData = generateMockAirQualityData();
  const energyData = generateMockEnergyData();

  const metrics = [
    {
      title: t('dashboard:totalDatasets'),
      value: '24',
      change: '+3',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: '📊'
    },
    {
      title: t('dashboard:lastUpdated'),
      value: new Date().toLocaleDateString('sr-RS'),
      change: '',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      icon: '🔄'
    },
    {
      title: 'Ukupno opština',
      value: '145',
      change: '+2',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: '🏛️'
    },
    {
      title: 'Aktivnih izvora',
      value: '8',
      change: '',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      icon: '🔌'
    }
  ];

  const quickActions = [
    {
      title: t('dashboard:viewAllData'),
      description: 'Pregledajte sve dostupne podatke',
      href: '/dashboard',
      icon: '📈',
      color: 'bg-serbia-red'
    },
    {
      title: t('dashboard:exportData'),
      description: 'Izvezite podatke u različite formate',
      href: '/dashboard',
      icon: '📥',
      color: 'bg-serbia-blue'
    }
  ];

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard:title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('dashboard:subtitle')}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className="text-2xl">{metric.icon}</div>
              </div>
              {metric.change && (
                <div className="mt-2">
                  <span
                    className={`text-sm font-medium ${
                      metric.changeType === 'positive'
                        ? 'text-green-600'
                        : metric.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('dashboard:quickActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className={`${action.color} rounded-lg p-6 text-white hover:opacity-90 transition-opacity duration-200`}
              >
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{action.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Overview Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Budget Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('budget:title')}
              </h3>
              <p className="text-sm text-gray-600">
                Ukupan budžet: {formatCurrency(budgetData.reduce((sum, item) => sum + item.budget, 0))}
              </p>
            </div>
            <div className="space-y-3">
              {budgetData.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm text-gray-600">{formatCurrency(item.budget)}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/budget"
              className="mt-4 inline-flex items-center text-serbia-red hover:text-serbia-red/80 text-sm font-medium"
            >
              Pogledaj detalje →
            </Link>
          </div>

          {/* Demographics Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('demographics:title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('demographics:totalPopulation')}: {formatNumber(demographicsData.totalPopulation)}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Muškarci</span>
                <span className="text-sm text-gray-600">{formatNumber(demographicsData.male)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Žene</span>
                <span className="text-sm text-gray-600">{formatNumber(demographicsData.female)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Gustina naseljenosti</span>
                <span className="text-sm text-gray-600">94.9 stan/km²</span>
              </div>
            </div>
            <Link
              href="/dashboard/demographics"
              className="mt-4 inline-flex items-center text-serbia-red hover:text-serbia-red/80 text-sm font-medium"
            >
              Pogledaj detalje →
            </Link>
          </div>

          {/* Air Quality Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('airQuality:title')}
              </h3>
              <p className="text-sm text-gray-600">Prosečan AQI po gradovima</p>
            </div>
            <div className="space-y-3">
              {airQualityData.slice(0, 3).map((city, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{city.city}</span>
                  <span className="text-sm text-gray-600">AQI: {city.aqi}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/air-quality"
              className="mt-4 inline-flex items-center text-serbia-red hover:text-serbia-red/80 text-sm font-medium"
            >
              Pogledaj detalje →
            </Link>
          </div>

          {/* Energy Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('energy:title')}
              </h3>
              <p className="text-sm text-gray-600">
                Ukupna potrošnja: {formatNumber(energyData.totalConsumption)} MWh
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{t('energy:renewableEnergy')}</span>
                <span className="text-sm text-gray-600">{energyData.renewablePercentage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Glavni izvor</span>
                <span className="text-sm text-gray-600">Ugalj</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Glavni sektor</span>
                <span className="text-sm text-gray-600">Industrija</span>
              </div>
            </div>
            <Link
              href="/dashboard/energy"
              className="mt-4 inline-flex items-center text-serbia-red hover:text-serbia-red/80 text-sm font-medium"
            >
              Pogledaj detalje →
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Static export - no server-side props needed
// Using client-side translations with next-i18next