import React from 'react';
import Head from 'next/head';
import DemoNavigation from '@/components/demo/DemoNavigation';
import MainLayout from '@/components/layout/MainLayout';

const DemosPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Demos - Vizualni-Admin</title>
        <meta name="description" content="Explore all demos and components of the Vizualni-Admin system" />
      </Head>

      <MainLayout>
        <div className="animate-fade-in">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient-serbia mb-4">
              Vizualni-Admin Demos
            </h1>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Discover the capabilities of the Vizualni-Admin system through interactive demos.
              Each showcase highlights different components and features with Serbian localization
              and world-class accessibility standards.
            </p>
          </div>

          {/* Demo Navigation */}
          <DemoNavigation />

          {/* Features Overview */}
          <div className="mt-12 bg-white rounded-lg border border-neutral-200 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Key Features Across Demos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="feature-card">
                <div className="text-3xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Serbian Design System</h3>
                <p className="text-sm text-neutral-600">
                  Color scheme inspired by Serbian flag, culturally appropriate design patterns,
                  and localized user experience
                </p>
              </div>

              <div className="feature-card">
                <div className="text-3xl mb-4">♿</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">WCAG AAA Compliance</h3>
                <p className="text-sm text-neutral-600">
                  Full accessibility support with keyboard navigation, screen reader compatibility,
                  and high contrast ratios
                </p>
              </div>

              <div className="feature-card">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Mobile-First Design</h3>
                <p className="text-sm text-neutral-600">
                  Responsive layouts that work seamlessly across all devices with touch-optimized
                  interactions
                </p>
              </div>

              <div className="feature-card">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Performance Optimized</h3>
                <p className="text-sm text-neutral-600">
                  Static generation, code splitting, and optimized loading for lightning-fast
                  user experience
                </p>
              </div>

              <div className="feature-card">
                <div className="text-3xl mb-4">🌍</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Serbian Localization</h3>
                <p className="text-sm text-neutral-600">
                  Numbers, dates, and currency formatted for Serbian locale with appropriate
                  cultural context
                </p>
              </div>

              <div className="feature-card">
                <div className="text-3xl mb-4">🔧</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">TypeScript Safety</h3>
                <p className="text-sm text-neutral-600">
                  Full TypeScript implementation with comprehensive type definitions for
                  better development experience
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center bg-gradient-to-r from-serbia-red-50 to-serbia-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Ready to Explore?</h2>
            <p className="text-neutral-600 mb-6">
              Start with the Button Component demo to see our enhanced interactions, then explore
              the dashboard for real data visualization examples.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/button-demo"
                className="inline-flex items-center px-6 py-3 bg-serbia-red text-white font-semibold rounded-lg hover:bg-serbia-red-600 transition-colors"
              >
                Start with Button Demo
              </a>
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-serbia-blue text-white font-semibold rounded-lg hover:bg-serbia-blue-600 transition-colors"
              >
                View Dashboard
              </a>
            </div>
          </div>
        </div>

        <style jsx>{`
          .text-gradient-serbia {
            background: linear-gradient(135deg, #C6363C 0%, #0C4076 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }

          .feature-card {
            @apply p-6 bg-neutral-50 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow duration-200;
          }
        `}</style>
      </MainLayout>
    </>
  );
};

export default DemosPage;