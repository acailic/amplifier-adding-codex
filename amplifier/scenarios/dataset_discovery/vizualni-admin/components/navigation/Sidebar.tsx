import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Wind,
  Zap,
  Database,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  {
    name: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'datasets',
    href: '/datasets',
    icon: Database,
  },
  {
    name: 'budget',
    href: '/dashboard/budget',
    icon: TrendingUp,
  },
  {
    name: 'demographics',
    href: '/dashboard/demographics',
    icon: Users,
  },
  {
    name: 'airQuality',
    href: '/dashboard/air-quality',
    icon: Wind,
  },
  {
    name: 'energy',
    href: '/dashboard/energy',
    icon: Zap,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return router.pathname === href;
    }
    return router.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-serbia rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VA</span>
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-900">
              {t('dashboard:title')}
            </h1>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    sidebar-item flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${active
                      ? 'bg-serbia-red text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {t(`navigation.${item.name}`)}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-1">
              <Link
                href="/settings"
                className="sidebar-item sidebar-item-inactive mb-2"
              >
                <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                {t('navigation.settings')}
              </Link>

              <button className="sidebar-item sidebar-item-inactive w-full text-left">
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                {t('navigation.logout')}
              </button>
            </div>
          </div>
        </nav>

        {/* Language Switcher */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Language:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => router.push(router.asPath, router.asPath, { locale: 'sr' })}
                className={`px-2 py-1 text-xs rounded ${
                  router.locale === 'sr'
                    ? 'bg-serbia-red text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                SR
              </button>
              <button
                onClick={() => router.push(router.asPath, router.asPath, { locale: 'en' })}
                className={`px-2 py-1 text-xs rounded ${
                  router.locale === 'en'
                    ? 'bg-serbia-red text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;