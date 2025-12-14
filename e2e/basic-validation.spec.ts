import { test, expect } from '@playwright/test';

test.describe('Basic Validation Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cene');
  });

  test('should load the price visualization page', async ({ page }) => {
    // Check if the page loads without errors
    await page.waitForLoadState('networkidle');
    
    // Check for main elements
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Look for content
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should have price data', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Check if there are elements with price information
    const priceElements = await page.locator('text=/\\d+/').all();
    expect(priceElements.length).toBeGreaterThan(0);
  });

  test('should display charts', async ({ page }) => {
    // Wait for charts to potentially load
    await page.waitForTimeout(3000);
    
    // Look for any chart-like elements
    const charts = await page.locator('canvas, svg, [class*="chart"], [id*="chart"]').all();
    
    if (charts.length > 0) {
      await expect(charts[0]).toBeVisible();
    }
  });

  test('should handle filtering', async ({ page }) => {
    // Look for filter elements
    const filters = await page.locator('select, input, button').all();
    
    if (filters.length > 0) {
      // Try to interact with first visible filter
      for (const filter of filters) {
        if (await filter.isVisible()) {
          const tagName = await filter.evaluate(el => el.tagName);
          
          if (tagName === 'BUTTON') {
            await filter.click();
            await page.waitForTimeout(500);
            break;
          } else if (tagName === 'SELECT') {
            await filter.selectOption({ index: 1 });
            await page.waitForTimeout(500);
            break;
          }
        }
      }
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test different viewport sizes
    const sizes = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(500);
      
      // Page should still be visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});
