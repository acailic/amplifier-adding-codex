/**
 * Application Layout
 * Распоред апликације
 */

import React, { ReactNode } from 'react';
import { FeatureErrorBoundary } from '../error-boundaries';
import { useAppStore } from '../../shared/stores/app-store';
import { useUnreadNotificationsCount } from '../../shared/stores/app-store';

interface AppLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  notifications?: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
  notifications,
}) => {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const unreadCount = useUnreadNotificationsCount();

  return (
    <FeatureErrorBoundary feature="layout" enableRetry>
      <div className="app-layout min-h-screen bg-gray-50">
        {/* Header */}
        {header && (
          <header className="app-header fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded hover:bg-gray-100"
                  aria-label="Toggle sidebar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                {header}
              </div>

              {/* Notifications indicator */}
              {notifications && unreadCount > 0 && (
                <div className="relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </header>
        )}

        <div className="flex pt-16">
          {/* Sidebar */}
          {sidebar && (
            <aside
              className={`app-sidebar fixed left-0 top-16 bottom-0 z-20 bg-white shadow-lg border-r transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } w-64`}
            >
              <FeatureErrorBoundary feature="sidebar" enableRetry>
                {sidebar}
              </FeatureErrorBoundary>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 p-6 transition-all duration-300">
            <FeatureErrorBoundary feature="main-content" enableRetry>
              {children}
            </FeatureErrorBoundary>
          </main>
        </div>

        {/* Footer */}
        {footer && (
          <footer className="app-footer bg-white border-t mt-auto">
            <FeatureErrorBoundary feature="footer">
              {footer}
            </FeatureErrorBoundary>
          </footer>
        )}

        {/* Notifications */}
        {notifications && (
          <div className="fixed top-20 right-4 z-40 space-y-2">
            <FeatureErrorBoundary feature="notifications">
              {notifications}
            </FeatureErrorBoundary>
          </div>
        )}
      </div>
    </FeatureErrorBoundary>
  );
};

// Sidebar component
interface SidebarProps {
  children: ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <nav className="h-full overflow-y-auto p-4">
      <div className="space-y-2">
        {children}
      </div>
    </nav>
  );
};

// Sidebar item component
interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  href,
  active = false,
  onClick,
}) => {
  const baseClasses = "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors";
  const activeClasses = active
    ? "bg-blue-100 text-blue-700"
    : "hover:bg-gray-100 text-gray-700";

  const Component = href ? 'a' : 'button';
  const props = href ? { href } : { onClick };

  return (
    <Component
      className={`${baseClasses} ${activeClasses}`}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span className="font-medium">{label}</span>
    </Component>
  );
};

// Content area component
interface ContentProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const Content: React.FC<ContentProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      {(title || subtitle || actions) && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};