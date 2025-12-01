import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import MainLayout from '@/components/layout/MainLayout';
import BudgetChart from '@/components/charts/BudgetChart';
import {
  generateMockBudgetData,
  formatCurrency
} from '@/lib/data/serbianData';

export default function BudgetPage() {
  const { t } = useTranslation('common');

  const budgetData = generateMockBudgetData();

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('budget:title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('budget:subtitle')}
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="metric-card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {t('budget:totalBudget')}
            </h3>
            <p className="text-3xl font-bold text-serbia-red">
              {formatCurrency(budgetData.reduce((sum, item) => sum + item.budget, 0))}
            </p>
          </div>
          <div className="metric-card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {t('budget:revenue')}
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(Math.floor(budgetData.reduce((sum, item) => sum + item.budget, 0) * 0.85))}
            </p>
          </div>
          <div className="metric-card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {t('budget:expenses')}
            </h3>
            <p className="text-3xl font-bold text-serbia-blue">
              {formatCurrency(budgetData.reduce((sum, item) => sum + item.spent, 0))}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Main Budget Overview */}
          <BudgetChart data={budgetData} type="bar" height={400} />

          {/* Budget Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BudgetChart data={budgetData} type="pie" height={350} />
            <BudgetChart data={budgetData} type="treemap" height={350} />
          </div>

          {/* Category Breakdown Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('budget:byCategory')}
            </h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kategorija</th>
                    <th>Budžet</th>
                    <th>Potrošeno</th>
                    <th>Ostalo (%)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.map((item, index) => (
                    <tr key={index}>
                      <td className="font-medium text-gray-900">{item.category}</td>
                      <td>{formatCurrency(item.budget)}</td>
                      <td>{formatCurrency(item.spent)}</td>
                      <td>{item.percentage}%</td>
                      <td>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.percentage >= 90
                              ? 'bg-red-100 text-red-800'
                              : item.percentage >= 70
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {item.percentage >= 90
                            ? 'Kritično'
                            : item.percentage >= 70
                            ? 'Upozorenje'
                            : 'Normalno'}
                        </span>
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

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}