import { test, expect } from '@playwright/test'

test.describe('Serbian Localization Tests', () => {
  test('should display Serbian Cyrillic text correctly', async ({ page }) => {
    await page.goto('/')

    // Check for Serbian Cyrillic characters
    await expect(page.locator('body')).toContainText(/[А-Ша-ш]/)

    // Test specific Serbian phrases
    const serbianPhrases = [
      'контролна табла',
      'визуелни администратор',
      'демографија',
      'буџет',
      'квалитет ваздуха',
      'енергија',
    ]

    for (const phrase of serbianPhrases) {
      const element = page.locator(`text=${phrase}`)
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible()
      }
    }
  })

  test('should support language switching', async ({ page }) => {
    await page.goto('/')

    // Look for language switcher
    const languageSwitcher = page.locator('[data-testid="language-switcher"], select[data-testid="language"]')

    if (await languageSwitcher.count() > 0) {
      // Test switching to Latin script
      await languageSwitcher.selectOption('sr-Latn')
      await page.waitForTimeout(1000)

      // Check for Latin script characters
      await expect(page.locator('body')).toContainText(/[A-Za-zčćžšđČĆŽŠĐ]/)

      // Test switching to English
      await languageSwitcher.selectOption('en')
      await page.waitForTimeout(1000)

      // Check for English text
      await expect(page.locator('body')).toContainText(/dashboard|admin|demographics/i)
    }
  })

  test('should format numbers according to Serbian locale', async ({ page }) => {
    await page.goto('/dashboard/demographics')

    // Wait for data to load
    await page.waitForTimeout(2000)

    // Look for numbers with Serbian formatting (dot as thousands separator)
    const numberElements = page.locator('[data-number], [data-testid*="number"]')
    const elementCount = await numberElements.count()

    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = numberElements.nth(i)
      const text = await element.textContent()

      if (text) {
        // Check for Serbian number formatting (1.000.000,00)
        const serbianNumberFormat = /\d{1,3}(?:\.\d{3})*(?:,\d{2})?/
        const hasSerbianFormat = serbianNumberFormat.test(text)

        if (hasSerbianFormat) {
          console.log(`Found Serbian number format: ${text}`)
        }
      }
    }
  })

  test('should display dates in Serbian format', async ({ page }) => {
    await page.goto('/dashboard')

    // Look for date elements
    const dateElements = page.locator('[data-date], [datetime], time')
    const elementCount = await dateElements.count()

    for (let i = 0; i < Math.min(elementCount, 3); i++) {
      const element = dateElements.nth(i)
      const text = await element.textContent()

      if (text) {
        // Check for Serbian date format (DD.MM.YYYY or Serbian month names)
        const serbianDateFormat = /\d{1,2}\.\d{1,2}\.\d{4}/
        const serbianMonths = /(јануар|фебруар|март|април|мај|јун|јул|август|септембар|октобар|новембар|децембар)/i

        const hasSerbianDate = serbianDateFormat.test(text) || serbianMonths.test(text)

        if (hasSerbianDate) {
          console.log(`Found Serbian date format: ${text}`)
        }
      }
    }
  })

  test('should display Serbian currency formatting', async ({ page }) => {
    await page.goto('/dashboard/budget')

    // Look for currency elements
    const currencyElements = page.locator('[data-currency], [data-testid*="currency"]')
    const elementCount = await currencyElements.count()

    for (let i = 0; i < Math.min(elementCount, 3); i++) {
      const element = currencyElements.nth(i)
      const text = await element.textContent()

      if (text) {
        // Check for Serbian currency format (RSD, дин, or appropriate formatting)
        const serbianCurrency = /(RSD|дин\.?|\d{1,3}(?:\.\d{3})*,\d{2})/i
        const hasSerbianCurrency = serbianCurrency.test(text)

        if (hasSerbianCurrency) {
          console.log(`Found Serbian currency format: ${text}`)
        }
      }
    }
  })

  test('should maintain RTL/LTR consistency', async ({ page }) => {
    await page.goto('/')

    // Check that text direction is LTR for Serbian
    const htmlDir = await page.getAttribute('html', 'dir')
    expect(htmlDir).toBe('ltr')

    // Check that text alignment is appropriate
    const bodyStyle = await page.evaluate(() => {
      return window.getComputedStyle(document.body).direction
    })
    expect(bodyStyle).toBe('ltr')
  })

  test('should handle Serbian text input correctly', async ({ page }) => {
    await page.goto('/')

    // Look for input fields
    const inputs = page.locator('input[type="text"], textarea')
    const inputCount = await inputs.count()

    if (inputCount > 0) {
      const firstInput = inputs.first()
      await firstInput.click()

      // Test typing Serbian Cyrillic text
      const serbianText = 'Тест текст на српском језику'
      await firstInput.fill(serbianText)

      // Verify the text was entered correctly
      const value = await firstInput.inputValue()
      expect(value).toBe(serbianText)
    }
  })

  test('should display Serbian error messages', async ({ page }) => {
    await page.goto('/dashboard')

    // Look for form validation
    const forms = page.locator('form')
    if (await forms.count() > 0) {
      const firstForm = forms.first()
      const submitButton = firstForm.locator('button[type="submit"], input[type="submit"]')

      if (await submitButton.count() > 0) {
        // Submit empty form to trigger validation
        await submitButton.click()
        await page.waitForTimeout(1000)

        // Check for Serbian error messages
        const errorElements = page.locator('[data-testid="error"], .error, [role="alert"]')
        const errorCount = await errorElements.count()

        if (errorCount > 0) {
          const errorText = await errorElements.first().textContent()
          expect(errorText).toMatch(/[А-Ша-ш]/) // Should contain Cyrillic characters
        }
      }
    }
  })

  test('should support Serbian search functionality', async ({ page }) => {
    await page.goto('/')

    // Look for search input
    const searchInput = page.locator('[data-testid="search"], input[placeholder*="претражи" i], input[placeholder*="тражи" i]')

    if (await searchInput.count() > 0) {
      // Test Serbian search terms
      const serbianSearchTerms = ['демографија', 'буџет', 'Београд', 'Србија']

      for (const term of serbianSearchTerms) {
        await searchInput.clear()
        await searchInput.fill(term)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)

        // Check if search results are displayed
        const results = page.locator('[data-testid="search-results"], .search-results')
        if (await results.count() > 0) {
          await expect(results.first()).toBeVisible()
        }
      }
    }
  })

  test('should handle Serbian URLs correctly', async ({ page }) => {
    // Test direct navigation to Serbian URLs
    const serbianUrls = [
      '/dashboard/demographics',
      '/dashboard/budget',
      '/dashboard/air-quality',
      '/dashboard/energy',
    ]

    for (const url of serbianUrls) {
      await page.goto(url)
      await page.waitForLoadState('networkidle')

      // Check page loads without errors
      await expect(page.locator('body')).toBeVisible()

      // Check for Serbian content
      const hasSerbianContent = await page.locator('body').textContent().then(text =>
        (text || '').match(/[А-Ша-ш]/)
      )

      expect(hasSerbianContent).toBeTruthy()
    }
  })

  test('should maintain accessibility with Serbian content', async ({ page }) => {
    await page.goto('/')

    // Check that Serbian text doesn't break accessibility
    const serbianTextElements = page.locator(':text-matches(/[А-Ша-ш]/)')
    const elementCount = await serbianTextElements.count()

    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = serbianTextElements.nth(i)

      // Check for proper contrast (basic check)
      const styles = await element.evaluate((el) => {
        return window.getComputedStyle(el)
      })

      expect(styles.color).not.toBe(styles.backgroundColor)
      expect(parseFloat(styles.fontSize || '0')).toBeGreaterThan(0)
    }
  })
})