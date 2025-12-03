import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js i18n
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'sr',
      changeLanguage: jest.fn(),
    },
  }),
  serverSideTranslations: jest.fn(() => ({
    _nextI18Next: {
      initialLocale: 'sr',
      userConfig: {
        i18n: {
          defaultLocale: 'sr',
          locales: ['sr', 'en'],
        },
      },
    },
  })),
}))

// Mock Recharts for testing
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar"></div>,
  XAxis: () => <div data-testid="x-axis"></div>,
  YAxis: () => <div data-testid="y-axis"></div>,
  CartesianGrid: () => <div data-testid="cartesian-grid"></div>,
  Tooltip: () => <div data-testid="tooltip"></div>,
  Legend: () => <div data-testid="legend"></div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line"></div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie"></div>,
  Cell: () => <div data-testid="cell"></div>,
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  BarChart3: () => <div data-testid="bar-chart-icon"></div>,
  Users: () => <div data-testid="users-icon"></div>,
  Wind: () => <div data-testid="wind-icon"></div>,
  Zap: () => <div data-testid="zap-icon"></div>,
  DollarSign: () => <div data-testid="dollar-sign-icon"></div>,
  TrendingUp: () => <div data-testid="trending-up-icon"></div>,
  Menu: () => <div data-testid="menu-icon"></div>,
  X: () => <div data-testid="x-icon"></div>,
  Home: () => <div data-testid="home-icon"></div>,
  Settings: () => <div data-testid="settings-icon"></div>,
  LogOut: () => <div data-testid="logout-icon"></div>,
  ChevronDown: () => <div data-testid="chevron-down-icon"></div>,
  ChevronUp: () => <div data-testid="chevron-up-icon"></div>,
  Download: () => <div data-testid="download-icon"></div>,
  Filter: () => <div data-testid="filter-icon"></div>,
  Search: () => <div data-testid="search-icon"></div>,
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console warnings in tests unless debugging
if (!process.env.DEBUG_TESTS) {
  console.warn = jest.fn()
  console.error = jest.fn()
}