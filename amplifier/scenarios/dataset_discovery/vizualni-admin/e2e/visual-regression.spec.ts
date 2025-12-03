import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('should match homepage screenshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for dynamic content to load
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 10000 })

    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })
  })

  test('should match dashboard screenshots across different viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' },
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Wait for charts to load
      await page.waitForTimeout(2000)

      await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      })
    }
  })

  test('should match demographics chart visual appearance', async ({ page }) => {
    await page.goto('/dashboard/demographics')
    await page.waitForLoadState('networkidle')

    // Wait for chart to render
    await page.waitForSelector('[data-testid="demographics-chart"]', { timeout: 10000 })
    await page.waitForTimeout(1000) // Allow animations to complete

    // Screenshot the chart area specifically
    const chartElement = page.locator('[data-testid="demographics-chart"]')
    await expect(chartElement).toHaveScreenshot('demographics-chart.png', {
      animations: 'disabled',
      caret: 'hide',
    })
  })

  test('should match air quality visualization', async ({ page }) => {
    await page.goto('/dashboard/air-quality')
    await page.waitForLoadState('networkidle')

    // Wait for air quality data to load
    await page.waitForSelector('[data-testid="air-quality-chart"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    const chartElement = page.locator('[data-testid="air-quality-chart"]')
    await expect(chartElement).toHaveScreenshot('air-quality-chart.png', {
      animations: 'disabled',
      caret: 'hide',
    })
  })

  test('should match budget visualization', async ({ page }) => {
    await page.goto('/dashboard/budget')
    await page.waitForLoadState('networkidle')

    await page.waitForSelector('[data-testid="budget-chart"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    const chartElement = page.locator('[data-testid="budget-chart"]')
    await expect(chartElement).toHaveScreenshot('budget-chart.png', {
      animations: 'disabled',
      caret: 'hide',
    })
  })

  test('should match energy visualization', async ({ page }) => {
    await page.goto('/dashboard/energy')
    await page.waitForLoadState('networkidle')

    await page.waitForSelector('[data-testid="energy-chart"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    const chartElement = page.locator('[data-testid="energy-chart"]')
    await expect(chartElement).toHaveScreenshot('energy-chart.png', {
      animations: 'disabled',
      caret: 'hide',
    })
  })

  test('should match header navigation appearance', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Screenshot header specifically
    const headerElement = page.locator('[data-testid="header"]')
    await expect(headerElement).toHaveScreenshot('header-navigation.png', {
      animations: 'disabled',
      caret: 'hide',
    })
  })

  test('should match sidebar navigation appearance', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const sidebarElement = page.locator('[data-testid="sidebar"]')
    await expect(sidebarElement).toHaveScreenshot('sidebar-navigation.png', {
      animations: 'disabled',
      caret: 'hide',
    })
  })

  test('should match responsive mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Open mobile menu
    const menuButton = page.locator('[data-testid="mobile-menu-button"]')
    if (await menuButton.isVisible()) {
      await menuButton.click()
      await page.waitForTimeout(500)

      await expect(page.locator('[data-testid="mobile-menu"]')).toHaveScreenshot('mobile-menu-open.png', {
        animations: 'disabled',
        caret: 'hide',
      })
    }
  })

  test('should match interactive states', async ({ page }) => {
    await page.goto('/dashboard/demographics')
    await page.waitForLoadState('networkidle')

    // Test hover states
    const chartBars = page.locator('[data-testid="chart-bar"]').first()
    if (await chartBars.isVisible()) {
      await chartBars.hover()
      await page.waitForTimeout(300)

      await expect(chartBars).toHaveScreenshot('chart-bar-hover.png', {
        animations: 'disabled',
        caret: 'hide',
      })
    }

    // Test button states
    const exportButton = page.locator('[data-testid="export-button"]').first()
    if (await exportButton.isVisible()) {
      await exportButton.hover()
      await page.waitForTimeout(300)

      await expect(exportButton).toHaveScreenshot('export-button-hover.png', {
        animations: 'disabled',
        caret: 'hide',
      })
    }
  })

  test('should match Serbian text rendering', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Focus on Serbian text elements
    const serbianTextElements = page.locator(':text-matches(/[А-Ша-ш]/)')
    const elementCount = await serbianTextElements.count()

    if (elementCount > 0) {
      // Screenshot first few Serbian text elements
      for (let i = 0; i < Math.min(elementCount, 3); i++) {
        const element = serbianTextElements.nth(i)
        if (await element.isVisible()) {
          await expect(element).toHaveScreenshot(`serbian-text-${i}.png`, {
            animations: 'disabled',
            caret: 'hide',
          })
        }
      }
    }
  })

  test('should match loading states', async ({ page }) => {
    // Intercept network requests to simulate loading
    await page.route('**/api/**', (route) => {
      // Delay the response to trigger loading state
      setTimeout(() => route.continue(), 1000)
    })

    await page.goto('/dashboard/demographics')

    // Take screenshot during loading
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="loading-spinner"]')).toHaveScreenshot('loading-state.png', {
      animations: 'disabled',
      caret: 'hide',
    })

    // Wait for loading to complete
    await page.waitForLoadState('networkidle')
  })

  test('should match error states', async ({ page }) => {
    // Mock error response
    await page.route('**/api/demographics', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    await page.goto('/dashboard/demographics')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await expect(page.locator('[data-testid="error-message"]')).toHaveScreenshot('error-state.png', {
      animations: 'disabled',
      caret: 'hide',
    })
  })

  test('should match dark mode appearance', async ({ page }) => {
    // Enable dark mode if supported
    await page.emulateMedia({ colorScheme: 'dark' })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })
  })

  test('should match print styles', async ({ page }) => {
    await page.goto('/dashboard/demographics')
    await page.waitForLoadState('networkidle')

    // Emulate print media
    await page.emulateMedia({ media: 'print' })

    await expect(page).toHaveScreenshot('dashboard-print.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })
  })
})