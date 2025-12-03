import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ConfigProvider } from 'next-i18next'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from 'react-query'
import { axe, toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock i18n for testing
const createMockI18n = () => ({
  language: 'sr',
  languages: ['sr', 'en'],
  resources: {
    sr: {
      common: {
        'dashboard': 'Контролна табла',
        'budget': 'Буџет',
        'demographics': 'Демографија',
        'airQuality': 'Квалитет ваздуха',
        'energy': 'Енергија',
        'loading': 'Учитавање...',
        'error': 'Грешка',
        'save': 'Сачувај',
        'cancel': 'Откажи',
        'edit': 'Измени',
        'delete': 'Обриши',
        'search': 'Претражи',
        'filter': 'Филтер',
        'export': 'Извоз',
      },
    },
  },
  t: (key: string) => key,
  changeLanguage: () => Promise.resolve(),
})

// Test wrapper component
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })

  const mockI18n = createMockI18n()

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={mockI18n}>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const { container, ...rest } = render(ui, { wrapper: AllTheProviders, ...options })

  return {
    container,
    ...rest,
    // Axe testing helper
    checkA11y: () => axe(container),
  }
}

// Mock handlers for common interactions
export const mockHandlers = {
  onClick: jest.fn(),
  onChange: jest.fn(),
  onSubmit: jest.fn(),
  onFocus: jest.fn(),
  onBlur: jest.fn(),
}

// Serbian-specific test data
export const serbianTestData = {
  regions: [
    { id: 1, name: 'Београд', population: 1680000, budget: 1500000000 },
    { id: 2, name: 'Војводина', population: 1950000, budget: 1200000000 },
    { id: 3, name: 'Шумадија и Западна Србија', population: 2100000, budget: 900000000 },
    { id: 4, name: 'Јужна и Источна Србија', population: 1650000, budget: 700000000 },
  ],
  airQuality: [
    { city: 'Београд', aqi: 85, pm25: 25.3, pm10: 42.1, status: 'умерено' },
    { city: 'Нови Сад', aqi: 62, pm25: 18.7, pm10: 31.2, status: 'добро' },
    { city: 'Ниш', aqi: 95, pm25: 28.9, pm10: 47.3, status: 'умерено' },
    { city: 'Крагујевац', aqi: 58, pm25: 16.2, pm10: 28.9, status: 'добро' },
  ],
  energyData: [
    { source: 'угљен', percentage: 68.4, trend: 'падајући' },
    { source: 'хидро', percentage: 24.1, trend: 'стабилан' },
    { source: 'ветар', percentage: 3.2, trend: 'растући' },
    { source: 'сунце', percentage: 2.1, trend: 'растући' },
    { source: 'гас', percentage: 1.8, trend: 'стабилан' },
    { source: 'биомаса', percentage: 0.4, trend: 'растући' },
  ],
}

// Accessibility test helpers
export const a11yTestConfig = {
  // Rules specific to Serbian language requirements
  rules: {
    // Ensure proper language attribute is set
    'html-has-lang': { enabled: true },
    'lang-valid': { enabled: true },
    // Color contrast requirements for Serbian Cyrillic
    'color-contrast': { enabled: true },
    // Focus management for keyboard navigation
    'focus-order-semantics': { enabled: true },
    'tabindex': { enabled: true },
  },
}

// Test helpers for responsive design
export const mockScreenSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  largeDesktop: { width: 2560, height: 1440 },
}

// Helper to test responsive behavior
export const testResponsive = async (
  component: ReactElement,
  sizes: keyof typeof mockScreenSizes[],
) => {
  const results = []

  for (const size of sizes) {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: mockScreenSizes[size].width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: mockScreenSizes[size].height,
    })

    window.dispatchEvent(new Event('resize'))

    const { container, checkA11y } = customRender(component)
    const a11yResults = await checkA11y()

    results.push({
      size,
      container,
      a11yResults,
    })
  }

  return results
}

// Mock for fetch API
export const mockFetch = jest.fn()

// Setup fetch mock before tests
beforeEach(() => {
  global.fetch = mockFetch
})

// Cleanup after tests
afterEach(() => {
  jest.clearAllMocks()
  mockFetch.mockReset()
})

// Re-export everything from RTL for convenience
export * from '@testing-library/react'
export { customRender as render }
export { serbianTestData, mockHandlers, a11yTestConfig, mockScreenSizes }