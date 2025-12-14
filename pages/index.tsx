import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

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

          {/* Quick Links Section */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/cene">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analiza Cena</h3>
                <p className="text-gray-600 text-sm">
                  Kompletna vizualizacija i analiza cena proizvoda, trendova i popusta
                </p>
              </motion.div>
            </Link>

            <Link href="/budget">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Budžet</h3>
                <p className="text-gray-600 text-sm">
                  Budžetske alokacije i potrošnja po regijama Srbije
                </p>
              </motion.div>
            </Link>

            <Link href="/air-quality">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Kvalitet Vazduha</h3>
                <p className="text-gray-600 text-sm">
                  Praćenje kvaliteta vazduha i PM čestica u realnom vremenu
                </p>
              </motion.div>
            </Link>
          </section>

          {/* Info Section */}
          <section className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              O Dashboardu
            </h2>
            <div className="prose max-w-none text-gray-600">
              <p>
                Vizualni Admin dashboard pruža sveobuhvatnu vizualizaciju podataka za Republiku Srbiju.
                Trenutno prikazujemo:
              </p>
              <ul className="list-disc pl-6 mt-4">
                <li>Budžetske alokacije po regijama</li>
                <li>Kvalitet vazduha u realnom vremenu</li>
                <li>Analizu cena proizvoda i trendova</li>
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