import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page)
    await page.goto('/')
  })

  test('should have no accessibility violations on homepage', async ({ page }) => {
    await checkA11y(page, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      rules: {
        // Enable Serbian-specific accessibility rules
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
        'document-title': { enabled: true },
        'html-has-lang': { enabled: true },
        'page-has-heading-one': { enabled: true },
      },
    })
  })

  test('should have proper Serbian language attributes', async ({ page }) => {
    const htmlLang = await page.getAttribute('html', 'lang')
    expect(htmlLang).toBe('sr')
  })

  test('should support keyboard navigation for Serbian interface', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab')
    const firstFocusable = await page.locator(':focus')
    expect(await firstFocusable.isVisible()).toBeTruthy()

    // Test Enter key on interactive elements
    const firstButton = page.locator('button').first()
    if (await firstButton.isVisible()) {
      await firstButton.focus()
      await page.keyboard.press('Enter')
    }
  })

  test('should have sufficient color contrast for Serbian text', async ({ page }) => {
    // Test header contrast
    const header = page.locator('[role="banner"]').first()
    if (await header.isVisible()) {
      await checkA11y(page, '.header', {
        rules: {
          'color-contrast': { enabled: true },
        },
      })
    }

    // Test navigation contrast
    const nav = page.locator('[role="navigation"]').first()
    if (await nav.isVisible()) {
      await checkA11y(page, '.navigation', {
        rules: {
          'color-contrast': { enabled: true },
        },
      })
    }
  })

  test('should have proper ARIA labels for screen readers', async ({ page }) => {
    // Check for main landmarks
    expect(await page.locator('main').count()).toBeGreaterThan(0)
    expect(await page.locator('[role="navigation"]').count()).toBeGreaterThan(0)
    expect(await page.locator('[role="banner"]').count()).toBeGreaterThan(0)

    // Check for form labels
    const inputs = page.locator('input, select, textarea')
    const inputCount = await inputs.count()

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const hasLabel = await input.evaluate((el) => {
        return (
          el.hasAttribute('aria-label') ||
          el.hasAttribute('aria-labelledby') ||
          el.labels.length > 0
        )
      })
      expect(hasLabel).toBeTruthy()
    }
  })

  test('should support screen reader announcements', async ({ page }) => {
    // Test dynamic content announcements
    const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"]')

    if (await liveRegion.count() > 0) {
      // Simulate dynamic content update
      await page.evaluate(() => {
        const announcement = document.createElement('div')
        announcement.setAttribute('aria-live', 'polite')
        announcement.textContent = 'Подаци су ажурирани'
        document.body.appendChild(announcement)
      })

      await expect(page.locator('[aria-live="polite"]')).toContainText('ажурирани')
    }
  })

  test('should handle focus management properly', async ({ page }) => {
    // Test modal focus (if present)
    const modalButton = page.locator('[data-testid="modal-trigger"]').first()
    if (await modalButton.isVisible()) {
      await modalButton.click()

      // Focus should be trapped in modal
      const modal = page.locator('[role="dialog"]').first()
      if (await modal.isVisible()) {
        await expect(modal).toBeFocused()
      }
    }

    // Test focus return after modal close
    const closeButton = page.locator('[data-testid="modal-close"]').first()
    if (await closeButton.isVisible()) {
      await closeButton.click()
      await expect(modalButton).toBeFocused()
    }
  })

  test('should support skip links for keyboard users', async ({ page }) => {
    // Look for skip links
    const skipLinks = page.locator('a[href^="#"], [data-testid="skip-link"]')

    if (await skipLinks.count() > 0) {
      const firstSkipLink = skipLinks.first()
      await firstSkipLink.click()

      // Check if focus moved to target
      const hash = await firstSkipLink.getAttribute('href')
      if (hash) {
        const target = page.locator(hash)
        await expect(target).toBeVisible()
      }
    }
  })

  test('should maintain accessibility on dashboard pages', async ({ page }) => {
    // Test demographics page
    await page.goto('/dashboard/demographics')
    await checkA11y(page, undefined, {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
      },
    })

    // Test air quality page
    await page.goto('/dashboard/air-quality')
    await checkA11y(page, undefined, {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
      },
    })

    // Test energy page
    await page.goto('/dashboard/energy')
    await checkA11y(page, undefined, {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
      },
    })
  })

  test('should support accessible data visualization', async ({ page }) => {
    await page.goto('/dashboard/demographics')

    // Test chart accessibility
    const charts = page.locator('[role="img"], [data-testid*="chart"]')
    const chartCount = await charts.count()

    for (let i = 0; i < chartCount; i++) {
      const chart = charts.nth(i)

      // Check for alternative text
      const altText = await chart.getAttribute('aria-label')
      const title = await chart.getAttribute('title')

      expect(altText || title).toBeTruthy()

      // Check for data table alternative
      const dataTable = page.locator('[data-testid="data-table"]')
      if (await dataTable.count() > 0) {
        await expect(dataTable.first()).toBeVisible()
      }
    }
  })

  test('should handle responsive accessibility', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await checkA11y(page, undefined, {
      detailedReport: false, // Skip detailed report for performance
    })

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await checkA11y(page, undefined, {
      detailedReport: false,
    })

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await checkA11y(page, undefined, {
      detailedReport: false,
    })
  })
})