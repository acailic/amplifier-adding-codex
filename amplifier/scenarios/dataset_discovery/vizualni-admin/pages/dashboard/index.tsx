import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import BudgetChart from '@/components/charts/BudgetChart';
import DemographicsChart from '@/components/charts/DemographicsChart';
import AirQualityChart from '@/components/charts/AirQualityChart';
import EnergyChart from '@/components/charts/EnergyChart';
import {
  generateMockBudgetData,
  generateMockDemographicsData,
  generateMockAirQualityData,
  generateMockEnergyData
} from '@/lib/data/serbianData';

export default function DashboardPage() {
  const { t } = useTranslation('common');

  const budgetData = generateMockBudgetData();
  const demographicsData = generateMockDemographicsData();
  const airQualityData = generateMockAirQualityData();
  const energyData = generateMockEnergyData();

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard:overview')}
          </h1>
          <p className="text-lg text-gray-600">
            Kompletan pregled svih vizualizacija podataka
          </p>
        </div>

        {/* Main Charts Grid */}
        <div className="space-y-8">
          {/* Budget Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BudgetChart data={budgetData} type="bar" height={350} />
            <BudgetChart data={budgetData} type="pie" height={350} />
          </div>

          {/* Demographics Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DemographicsChart data={demographicsData} type="agePyramid" height={400} />
            <DemographicsChart data={demographicsData} type="populationDensity" height={400} />
          </div>

          {/* Air Quality Chart */}
          <AirQualityChart data={airQualityData} type="cityComparison" height={350} />

          {/* Energy Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EnergyChart data={energyData} type="sources" height={350} />
            <EnergyChart data={energyData} type="renewableGrowth" height={350} />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Brzi linkovi
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/budget"
              className="card hover:shadow-md transition-shadow duration-200 text-center"
            >
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-medium text-gray-900">{t('navigation:budget')}</h3>
              <p className="text-sm text-gray-600">Detaljna analiza</p>
            </Link>
            <Link
              href="/dashboard/demographics"
              className="card hover:shadow-md transition-shadow duration-200 text-center"
            >
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-medium text-gray-900">{t('navigation:demographics')}</h3>
              <p className="text-sm text-gray-600">Stanovništvo</p>
            </Link>
            <Link
              href="/dashboard/air-quality"
              className="card hover:shadow-md transition-shadow duration-200 text-center"
            >
              <div className="text-3xl mb-2">🌬️</div>
              <h3 className="font-medium text-gray-900">{t('navigation:airQuality')}</h3>
              <p className="text-sm text-gray-600">Kvalitet vazduha</p>
            </Link>
            <Link
              href="/dashboard/energy"
              className="card hover:shadow-md transition-shadow duration-200 text-center"
            >
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-medium text-gray-900">{t('navigation:energy')}</h3>
              <p className="text-sm text-gray-600">Energetika</p>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}