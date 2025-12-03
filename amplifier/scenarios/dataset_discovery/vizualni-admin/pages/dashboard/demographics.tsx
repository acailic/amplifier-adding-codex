import React from 'react';
import { useTranslation } from 'next-i18next';
import MainLayout from '@/components/layout/MainLayout';
import DemographicsChart from '@/components/charts/DemographicsChart';
import {
  generateMockDemographicsData,
  formatNumber
} from '@/lib/data/serbianData';

export default function DemographicsPage() {
  const { t } = useTranslation('common');

  const demographicsData = generateMockDemographicsData();

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('demographics:title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('demographics:subtitle')}
          </p>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Main Demographics Chart */}
          <DemographicsChart data={demographicsData} type="agePyramid" height={450} />

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DemographicsChart data={demographicsData} type="genderDistribution" height={350} />
            <DemographicsChart data={demographicsData} type="populationDensity" height={350} />
          </div>

          {/* Population by Municipality */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Stanovništvo po opštinama (Top 10)
            </h3>
            <div className="space-y-3">
              {demographicsData.municipalities
                .sort((a, b) => b.population - a.population)
                .slice(0, 10)
                .map((municipality, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900 w-6">
                        {index + 1}.
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {municipality.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-900">
                        {formatNumber(municipality.population)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({municipality.density} stan/km²)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Age Groups Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('demographics:ageDistribution')}
            </h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Starosna grupa</th>
                    <th>Broj stanovnika</th>
                    <th>Procenat</th>
                    <th>Gustoća</th>
                  </tr>
                </thead>
                <tbody>
                  {demographicsData.ageGroups.map((group, index) => (
                    <tr key={index}>
                      <td className="font-medium text-gray-900">{group.ageRange}</td>
                      <td>{formatNumber(group.population)}</td>
                      <td>{group.percentage}%</td>
                      <td>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-serbia-red h-2 rounded-full"
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Static export - getServerSideProps removed for static generation