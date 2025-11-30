/**
 * Vizualni Admin - Modern Architecture with Serbian Support
 * Визуелни Админ - Модерна архитектура са подршком за српски
 */

// App Infrastructure
export { AppProviders, withAppProviders } from './app/providers/AppProviders';
export { AppLayout, Sidebar, SidebarItem, Content } from './app/layout/AppLayout';
export { GlobalErrorBoundary, FeatureErrorBoundary, withFeatureErrorBoundary } from './app/error-boundaries';

// Shared Services
export { apiClient, api, type ApiResponse, type ApiError } from './shared/services/api-client';

// Shared State Management
export {
  useAppStore,
  useUser,
  useNotifications,
  useTheme,
  useLanguage,
  useSidebarOpen,
  useGlobalLoading,
  useLoading,
  useError,
  useUnreadNotificationsCount,
  type AppState,
  type AppActions,
  type Notification,
  initializeAppStore,
} from './shared/stores/app-store';

// Shared Hooks
export { useApiQuery, useApiMutation } from './shared/hooks/useApiQuery';
export * from './shared/hooks/useSerbian';

// Features - Updated paths
export { default as SerbianTextInput } from './features/forms/SerbianTextInput';
export { default as SerbianDataValidator } from './features/data-validation/SerbianDataValidator';

// Feature Wrappers
export { FormFeatureWrapper } from './features/forms/FormFeatureWrapper';
export { DataValidationFeatureWrapper } from './features/data-validation/DataValidationFeatureWrapper';

// Shared Utilities
export * from './shared/utils';

// Types
export * from './shared/types/serbian';

// I18n setup
export * from './i18n';

// Compliance Module
export * from './features/data-validation/compliance/serbian-data-standards';

// Version
export const VERSION = '1.0.0';

// Default export for easy importing
export default {
  // Utilities
  detectScript: () => import('./shared/utils/utils/serbian-text').then(m => m.detectScript),
  convertScript: () => import('./shared/utils/utils/serbian-text').then(m => m.convertScript),
  formatSerbianDate: () => import('./shared/utils/utils/serbian-formatting').then(m => m.formatSerbianDate),
  formatSerbianNumber: () => import('./shared/utils/utils/serbian-formatting').then(m => m.formatSerbianNumber),
  validateSerbianForm: () => import('./shared/utils/utils/serbian-validation').then(m => m.validateSerbianForm),

  // Hooks
  useSerbianScript: () => import('./shared/hooks/hooks/useSerbian').then(m => m.useSerbianScript),
  useSerbianDate: () => import('./shared/hooks/hooks/useSerbian').then(m => m.useSerbianDate),
  useSerbianForm: () => import('./shared/hooks/hooks/useSerbian').then(m => m.useSerbianForm),

  // Components
  SerbianTextInput: () => import('./features/forms/SerbianTextInput'),
  SerbianDataValidator: () => import('./features/data-validation/SerbianDataValidator'),

  // I18n
  i18n: () => import('./i18n').then(m => m.i18n),
  loadAndActivateLocale: () => import('./i18n').then(m => m.loadAndActivateLocale),
  initializeI18n: () => import('./i18n').then(m => m.initializeI18n),

  VERSION
};