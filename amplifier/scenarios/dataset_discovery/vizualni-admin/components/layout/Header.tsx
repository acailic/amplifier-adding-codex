import React from 'react';
import { Menu } from 'lucide-react';
import { useTranslation } from 'next-i18next';

interface HeaderProps {
  onSidebarToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const { t } = useTranslation('common');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page title and breadcrumbs */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold leading-6 text-gray-900">
            {t('dashboard:title')}
          </h1>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-700">
              <p className="font-medium">Admin User</p>
              <p className="text-xs text-gray-500">admin@vizualni.rs</p>
            </div>
            <div className="w-8 h-8 bg-serbia-blue rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;