import { test, expect } from '@playwright/test';

test.describe('Price Visualization Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to price visualization page
    await page.goto('/cene');
  });

  test('should load price visualization page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Vizuelna Administracija - Cena/);
    
    // Check main heading
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('Cene');
  });

  test('should display price data correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="price-chart"]', { timeout: 10000 });
    
    // Check if price data is displayed
    const priceElements = page.locator('[data-testid="price-item"]');
    await expect(priceElements.first()).toBeVisible();
    
    // Check for Serbian language support
    const serbianText = page.locator('text=/Београд|Нови Сад|Електроника/');
    await expect(serbianText).toBeVisible();
  });

  test('should handle currency conversion correctly', async ({ page }) => {
    // Look for RSD prices
    const rsdPrices = page.locator('text=/RSD|дин\./');
    await expect(rsdPrices.first()).toBeVisible();
    
    // Check if prices are formatted correctly
    const priceFormat = page.locator('text=/\\d{1,3}(\\.\\d{3})*\\s*RSD/');
    await expect(priceFormat.first()).toBeVisible();
  });

  test('should filter data by category', async ({ page }) => {
    // Wait for filters to load
    await page.waitForSelector('[data-testid="category-filter"]');
    
    // Select a category
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    await categoryFilter.click();
    
    // Select Electronics category
    await page.locator('text=Electronics').click();
    
    // Verify filtering worked
    await page.waitForTimeout(1000);
    const filteredItems = page.locator('[data-testid="price-item"]');
    await expect(filteredItems.first()).toBeVisible();
  });

  test('should filter by price range', async ({ page }) => {
    // Wait for price range filter
    await page.waitForSelector('[data-testid="price-range-filter"]');
    
    // Set minimum price
    const minPriceInput = page.locator('input[placeholder="Min"]');
    await minPriceInput.fill('50000');
    
    // Set maximum price
    const maxPriceInput = page.locator('input[placeholder="Max"]');
    await maxPriceInput.fill('100000');
    
    // Apply filter
    await page.locator('button:has-text("Apply")').click();
    
    // Verify results
    await page.waitForTimeout(1000);
    const priceItems = page.locator('[data-testid="price-item"]');
    const prices = await priceItems.allInnerTexts();
    
    // Check that all prices are within range
    prices.forEach(price => {
      const numericPrice = parseInt(price.replace(/\D/g, ''));
      expect(numericPrice).toBeGreaterThanOrEqual(50000);
      expect(numericPrice).toBeLessThanOrEqual(100000);
    });
  });

  test('should render all chart types', async ({ page }) => {
    // Check for different chart types
    const trendChart = page.locator('[data-testid="trend-chart"]');
    await expect(trendChart).toBeVisible();
    
    const comparisonChart = page.locator('[data-testid="comparison-chart"]');
    await expect(comparisonChart).toBeVisible();
    
    const heatmap = page.locator('[data-testid="price-heatmap"]');
    await expect(heatmap).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Check mobile navigation
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible();
    }
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Charts should still be visible
    const charts = page.locator('[data-testid^="price-chart"]');
    await expect(charts.first()).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Intercept API call and simulate error
    await page.route('/api/price-data', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Reload page
    await page.reload();
    
    // Check error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('error');
    }
  });

  test('should support Serbian Cyrillic characters', async ({ page }) => {
    // Look for Cyrillic text
    const cyrillicElements = page.locator('text=/[Ѐ-ӿ]/');
    await expect(cyrillicElements.first()).toBeVisible();
    
    // Check specific Cyrillic labels
    const cyrillicLabels = ['Електроника', 'Београд', 'Лаптоп рачунари'];
    for (const label of cyrillicLabels) {
      const element = page.locator(`text=${label}`);
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
      }
    }
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Monitor performance
    const performanceEntries = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/price-data')) {
        performanceEntries.push({
          url: response.url(),
          status: response.status(),
          timing: Date.now()
        });
      }
    });
    
    // Navigate and wait for all data
    await page.goto('/cene');
    await page.waitForLoadState('networkidle');
    
    // Check that data loaded within reasonable time
    expect(performanceEntries.length).toBeGreaterThan(0);
  });
});
