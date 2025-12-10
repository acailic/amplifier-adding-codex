import { test, expect } from '@playwright/test';

test.describe('Minimal Validation Suite', () => {
  test('should load the price visualization page', async ({ page }) => {
    await page.goto('/cene');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    expect(title).toBeTruthy();
    
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('API endpoint returns valid data', async ({ request }) => {
    const response = await request.get('/api/price-data');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('lastUpdated');
    
    expect(Array.isArray(data.data)).toBe(true);
    expect(typeof data.total).toBe('number');
    expect(typeof data.lastUpdated).toBe('string');
  });

  test('should display content without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.goto('/cene');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    expect(errors.length).toBe(0);
  });
});
