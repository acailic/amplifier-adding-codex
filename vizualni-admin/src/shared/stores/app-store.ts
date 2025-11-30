/**
 * Global App Store (Zustand)
 * Глобално складиште апликације
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { logger } from '../utils/logger';

// App state types
export interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'sr-cyrl' | 'sr-latn' | 'en';

  // User State
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    permissions?: string[];
  } | null;

  // Notifications
  notifications: Notification[];

  // Loading states
  loading: {
    global: boolean;
    [key: string]: boolean;
  };

  // Error states
  errors: {
    [key: string]: string | null;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
  read: boolean;
}

export interface AppActions {
  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'sr-cyrl' | 'sr-latn' | 'en') => void;

  // User Actions
  setUser: (user: AppState['user']) => void;
  clearUser: () => void;

  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Loading Actions
  setLoading: (key: string, loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;

  // Error Actions
  setError: (key: string, error: string | null) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;

  // Utility Actions
  reset: () => void;
}

export type AppStore = AppState & AppActions;

const initialState: AppState = {
  sidebarOpen: true,
  theme: 'system',
  language: 'sr-cyrl',
  user: null,
  notifications: [],
  loading: {
    global: false,
  },
  errors: {},
};

export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // UI Actions
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
        logger.debug('Sidebar state changed', { open });
      },

      toggleSidebar: () => {
        set((state) => {
          const newOpen = !state.sidebarOpen;
          logger.debug('Sidebar toggled', { open: newOpen });
          return { sidebarOpen: newOpen };
        });
      },

      setTheme: (theme) => {
        set({ theme });
        logger.info('Theme changed', { theme });
        // Apply theme to document
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      setLanguage: (language) => {
        set({ language });
        logger.info('Language changed', { language });
        // Store preference
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('app-language', language);
        }
      },

      // User Actions
      setUser: (user) => {
        set({ user });
        logger.info('User state updated', { userId: user?.id });
      },

      clearUser: () => {
        set({ user: null });
        logger.info('User cleared from state');
      },

      // Notification Actions
      addNotification: (notification) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        logger.info('Notification added', {
          id,
          type: notification.type,
          title: notification.title,
        });

        // Auto-remove notification if duration is specified
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration);
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
        logger.debug('Notification removed', { id });
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
        logger.debug('Notification marked as read', { id });
      },

      clearNotifications: () => {
        set({ notifications: [] });
        logger.info('All notifications cleared');
      },

      // Loading Actions
      setLoading: (key, loading) => {
        set((state) => ({
          loading: {
            ...state.loading,
            [key]: loading,
          },
        }));
      },

      setGlobalLoading: (loading) => {
        set((state) => ({
          loading: {
            ...state.loading,
            global: loading,
          },
        }));
        logger.debug('Global loading state changed', { loading });
      },

      // Error Actions
      setError: (key, error) => {
        set((state) => ({
          errors: {
            ...state.errors,
            [key]: error,
          },
        }));
        if (error) {
          logger.error('Error set in state', new Error(error), { key });
        }
      },

      clearError: (key) => {
        set((state) => ({
          errors: {
            ...state.errors,
            [key]: null,
          },
        }));
      },

      clearAllErrors: () => {
        set({ errors: {} });
        logger.info('All errors cleared');
      },

      // Utility Actions
      reset: () => {
        set(initialState);
        logger.info('App store reset to initial state');
      },
    })),
    {
      name: 'app-store',
      partialize: (state) => ({
        // Only persist specific parts of state
        theme: state.theme,
        language: state.language,
        user: state.user,
      }),
    }
  )
);

// Initialize store with persisted values
export const initializeAppStore = () => {
  const state = useAppStore.getState();

  // Restore language from localStorage
  if (typeof localStorage !== 'undefined') {
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage && ['sr-cyrl', 'sr-latn', 'en'].includes(savedLanguage)) {
      state.setLanguage(savedLanguage as any);
    }
  }

  // Initialize theme
  if (typeof document !== 'undefined') {
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | 'system';
    if (savedTheme) {
      state.setTheme(savedTheme);
    }
    document.documentElement.setAttribute('data-theme', state.theme);
  }

  logger.info('App store initialized');
};

// Selectors for commonly used state combinations
export const useUser = () => useAppStore((state) => state.user);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useTheme = () => useAppStore((state) => state.theme);
export const useLanguage = () => useAppStore((state) => state.language);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useGlobalLoading = () => useAppStore((state) => state.loading.global);

// Selector hooks for specific loading states
export const useLoading = (key: string) =>
  useAppStore((state) => state.loading[key] || false);

// Selector hooks for specific errors
export const useError = (key: string) =>
  useAppStore((state) => state.errors[key] || null);

// Unread notifications count
export const useUnreadNotificationsCount = () =>
  useAppStore((state) => state.notifications.filter((n) => !n.read).length);