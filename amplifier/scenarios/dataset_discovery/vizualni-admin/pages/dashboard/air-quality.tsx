import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import MainLayout from '@/components/layout/MainLayout';
import AirQualityChart from '@/components/charts/AirQualityChart';
import {
  generateMockAirQualityData,
  getAirQualityLevel
} from '@/lib/data/serbianData';

export default function AirQualityPage() {
  const { t } = useTranslation('common');

  const airQualityData = generateMockAirQualityData();

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('airQuality:title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('airQuality:subtitle')}
          </p>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Main Air Quality Chart */}
          <AirQualityChart data={airQualityData} type="cityComparison" height={400} />

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AirQualityChart data={airQualityData} type="pollutantRadar" height={350} />
            <AirQualityChart data={airQualityData} type="aqiTrend" height={350} />
          </div>

          {/* City Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalji po gradovima
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {airQualityData.map((city, index) => {
                const aqiInfo = getAirQualityLevel(city.aqi);
                const getAQIColor = (aqi: number) => {
                  if (aqi <= 50) return 'text-green-600 bg-green-100';
                  if (aqi <= 100) return 'text-yellow-600 bg-yellow-100';
                  if (aqi <= 150) return 'text-orange-600 bg-orange-100';
                  if (aqi <= 200) return 'text-red-600 bg-red-100';
                  if (aqi <= 300) return 'text-purple-600 bg-purple-100';
                  return 'text-red-800 bg-red-200';
                };

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{city.city}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAQIColor(city.aqi)}`}>
                        AQI {city.aqi}
                      </span>
                    </div>
                    <p className={`text-sm font-medium mb-3 ${aqiInfo.color}`}>
                      {aqiInfo.level}
                    </p>
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-gray-600">Zagađivači:</h5>
                      {city.pollutants.map((pollutant, pIndex) => (
                        <div key={pIndex} className="flex justify-between text-xs">
                          <span className="text-gray-600">{pollutant.name}</span>
                          <span className="font-medium text-gray-900">
                            {pollutant.value} {pollutant.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pollutant Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informacije o zagađivačima
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'PM2.5', desc: 'Finne čestice, manje od 2.5 mikrona', risk: 'Uglavnom iz saobraćaja i industrije' },
                { name: 'PM10', desc: 'Uglavnom čestice, manje od 10 mikrona', risk: 'Prašina, polen, spore' },
                { name: 'NO2', desc: 'Dioksid azota', risk: 'Izduvni gasovi iz vozila' },
                { name: 'SO2', desc: 'Dioksid sumpora', risk: 'Garantište i industrijska proizvodnja' },
                { name: 'CO', desc: 'Ugljen monoksid', risk: 'Nepotpuno sagorevanje goriva' },
                { name: 'O3', desc: 'Ozon', risk: 'Fotohemijske reakcije u atmosferi' }
              ].map((pollutant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{pollutant.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{pollutant.desc}</p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Rizik:</span> {pollutant.risk}
                  </p>
                </div>
              ))}
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