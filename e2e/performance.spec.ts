import { test, expect } from '@playwright/test';

test.describe('Performance Suite', () => {
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to page
    await page.goto('/cene');
    
    // Wait for complete load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="price-chart"]', { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('should efficiently handle large datasets', async ({ page }) => {
    // Monitor network requests
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/price-data')) {
        requests.push({
          url: request.url(),
          timestamp: Date.now()
        });
      }
    });
    
    // Navigate to page
    await page.goto('/cene');
    await page.waitForLoadState('networkidle');
    
    // Check that data requests complete quickly
    const apiRequest = requests.find(r => r.url.includes('/api/price-data'));
    expect(apiRequest).toBeTruthy();
    
    // Wait for response
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/price-data')
    );
    
    expect(response.status()).toBe(200);
    
    // Check response size is reasonable
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
    
    // Ensure response is not too large (should be under 1MB for API response)
    const responseText = await response.text();
    expect(responseText.length).toBeLessThan(1024 * 1024);
  });

  test('should maintain performance with multiple charts', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to page
    await page.goto('/cene');
    
    // Wait for all charts to render
    await Promise.all([
      page.waitForSelector('[data-testid="trend-chart"]'),
      page.waitForSelector('[data-testid="comparison-chart"]'),
      page.waitForSelector('[data-testid="price-heatmap"]')
    ]);
    
    const renderTime = Date.now() - startTime;
    
    // All charts should render within 3 seconds
    expect(renderTime).toBeLessThan(3000);
    
    console.log(`Chart render time: ${renderTime}ms`);
  });
});
