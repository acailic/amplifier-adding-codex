import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';

interface DemoItem {
  title: string;
  description: string;
  path: string;
  icon: string;
  badge?: string;
}

const DemoNavigation: React.FC = () => {
  const router = useRouter();

  const demos: DemoItem[] = [
    {
      title: 'Button Component',
      description: 'Interactive button showcase with magnetic effects and WCAG AAA compliance',
      path: '/button-demo',
      icon: '🔘',
      badge: 'Popular'
    },
    {
      title: 'Dashboard Overview',
      description: 'Main dashboard with Serbian data visualizations',
      path: '/',
      icon: '📊'
    },
    {
      title: 'Dataset Browser',
      description: 'Browse and explore available datasets',
      path: '/datasets',
      icon: '🗂️'
    },
    {
      title: 'Interactive Dataset Demo',
      description: 'Advanced dataset browsing with filters',
      path: '/demo/dataset-browser',
      icon: '🔍'
    },
    {
      title: 'Budget Visualization',
      description: 'Serbian municipal budget breakdowns',
      path: '/dashboard/budget',
      icon: '💰'
    },
    {
      title: 'Demographics',
      description: 'Population statistics and demographics',
      path: '/dashboard/demographics',
      icon: '👥'
    },
    {
      title: 'Air Quality',
      description: 'Real-time air quality monitoring',
      path: '/dashboard/air-quality',
      icon: '🌤️'
    },
    {
      title: 'Energy Dashboard',
      description: 'Energy consumption and production analytics',
      path: '/dashboard/energy',
      icon: '⚡'
    }
  ];

  const handleDemoClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="demo-navigation">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Available Demos</h2>
        <p className="text-neutral-600">Explore different components and features of the Vizualni-Admin system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {demos.map((demo) => (
          <div
            key={demo.path}
            className="demo-card group relative bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300"
          >
            {demo.badge && (
              <span className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold text-white bg-serbia-red rounded-full">
                {demo.badge}
              </span>
            )}

            <div className="flex items-start mb-4">
              <span className="text-3xl mr-4">{demo.icon}</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{demo.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{demo.description}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={demo.path} passHref legacyBehavior>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="group-hover:bg-serbia-red-600"
                >
                  View Demo
                </Button>
              </Link>

              {router.pathname !== demo.path && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoClick(demo.path)}
                  className="shrink-0"
                >
                  Quick View
                </Button>
              )}
            </div>

            {/* Current page indicator */}
            {router.pathname === demo.path && (
              <div className="absolute inset-0 border-2 border-serbia-red rounded-lg pointer-events-none">
                <div className="absolute -top-3 -right-3 bg-serbia-red text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Current
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick navigation */}
      <div className="quick-nav bg-serbia-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Navigation</h3>
        <div className="flex flex-wrap gap-2">
          {demos.map((demo) => (
            <Link
              key={demo.path}
              href={demo.path}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                router.pathname === demo.path
                  ? 'bg-serbia-blue text-white'
                  : 'bg-white text-neutral-700 hover:bg-serbia-blue-100'
              }`}
            >
              <span className="mr-2">{demo.icon}</span>
              {demo.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoNavigation;