import React from 'react';
import { useTranslation } from 'next-i18next';
import MainLayout from '@/components/layout/MainLayout';
import EnergyChart from '@/components/charts/EnergyChart';
import {
  generateMockEnergyData,
  formatNumber
} from '@/lib/data/serbianData';

export default function EnergyPage() {
  const { t } = useTranslation('common');

  const energyData = generateMockEnergyData();

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('energy:title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('energy:subtitle')}
          </p>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Main Energy Chart */}
          <EnergyChart data={energyData} type="sources" height={400} />

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EnergyChart data={energyData} type="sectors" height={350} />
            <EnergyChart data={energyData} type="renewableGrowth" height={350} />
          </div>

          {/* Monthly Trend */}
          <EnergyChart data={energyData} type="trend" height={350} />

          {/* Energy Sources Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('energy:productionBySource')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {energyData.sources.map((source, index) => {
                const isRenewable = ['Hidroenergija', 'Solarna', 'Vetrovitna', 'Biomasa'].includes(source.name);
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{source.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isRenewable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isRenewable ? 'Obnovljiva' : 'Konvencionalna'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Proizvodnja:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(source.production)} MWh
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Učešće:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {source.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            isRenewable ? 'bg-green-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Energy Consumption by Sector */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('energy:consumptionBySector')}
            </h3>
            <div className="space-y-3">
              {energyData.sectors.map((sector, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-32 text-sm font-medium text-gray-900">
                    {sector.name}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-serbia-red h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${sector.percentage}%` }}
                      >
                        {sector.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-32 text-right text-sm text-gray-900">
                    {formatNumber(sector.consumption)} MWh
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Energy Efficiency Metrics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Metrike efikasnosti
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="metric-card">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Energetska efikasnost
                </h4>
                <p className="text-2xl font-bold text-green-600">78%</p>
                <p className="text-xs text-gray-500">+3% od prošle godine</p>
              </div>
              <div className="metric-card">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Gubice u prenosu
                </h4>
                <p className="text-2xl font-bold text-yellow-600">8.2%</p>
                <p className="text-xs text-gray-500">-1.5% od prošle godine</p>
              </div>
              <div className="metric-card">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  CO₂ emisije
                </h4>
                <p className="text-2xl font-bold text-red-600">45.2Mt</p>
                <p className="text-xs text-gray-500">-5% od prošle godine</p>
              </div>
              <div className="metric-card">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {t('energy:efficiency')}
                </h4>
                <p className="text-2xl font-bold text-blue-600">85%</p>
                <p className="text-xs text-gray-500">+2% od prošle godine</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Static export - getServerSideProps removed for static generation