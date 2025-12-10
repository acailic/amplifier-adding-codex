import React from 'react';
import Head from 'next/head';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for Serbian regions
const budgetData = [
  { region: 'Beograd', budget: 500000, spent: 450000 },
  { region: 'Novi Sad', budget: 300000, spent: 280000 },
  { region: 'Niš', budget: 200000, spent: 180000 },
  { region: 'Kragujevac', budget: 150000, spent: 140000 },
  { region: 'Subotica', budget: 120000, spent: 110000 },
];

const airQualityData = [
  { time: '00:00', pm25: 35, pm10: 45 },
  { time: '04:00', pm25: 30, pm10: 40 },
  { time: '08:00', pm25: 45, pm10: 55 },
  { time: '12:00', pm25: 55, pm10: 65 },
  { time: '16:00', pm25: 50, pm10: 60 },
  { time: '20:00', pm25: 40, pm10: 50 },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Vizualni Admin - Serbian Data Visualization Dashboard</title>
        <meta name="description" content="Serbian data visualization admin dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Vizualni Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Serbian Data Visualization Dashboard
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Budget Chart Section */}
            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Budžet po regijama (RSD)
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString('sr-RS')} RSD`} />
                    <Bar dataKey="budget" fill="#3b82f6" name="Budžet" />
                    <Bar dataKey="spent" fill="#10b981" name="Potrošeno" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Air Quality Chart Section */}
            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Kvalitet vazduha (PM)
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={airQualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pm25" fill="#f59e0b" name="PM2.5" />
                    <Bar dataKey="pm10" fill="#ef4444" name="PM10" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Info Section */}
          <section className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              O Dashboardu
            </h2>
            <div className="prose max-w-none text-gray-600">
              <p>
                Ovaj dashboard prikazuje vizualizacije podataka za Republiku Srbiju.
                Trenutno prikazujemo:
              </p>
              <ul className="list-disc pl-6 mt-4">
                <li>Budžetske alokacije po regijama</li>
                <li>Kvalitet vazduha u realnom vremenu</li>
                <li>Demografske podatke</li>
                <li>Potrošnju energije</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}