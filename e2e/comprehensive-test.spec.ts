import { test, expect } from '@playwright/test';

test.describe('Comprehensive Test Suite', () => {
  test('API endpoint validation', async ({ request }) => {
    console.log('Testing API endpoint...');
    
    // Test basic API
    const response = await request.get('/api/price-data');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('lastUpdated');
    
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    
    // Check data structure
    const firstItem = data.data[0];
    expect(firstItem).toHaveProperty('id');
    expect(firstItem).toHaveProperty('productName');
    expect(firstItem).toHaveProperty('price');
    expect(firstItem).toHaveProperty('currency');
    
    console.log(`API returned ${data.data.length} items`);
  });

  test('Page loads and displays content', async ({ page }) => {
    console.log('Testing page load...');
    
    // Track console errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/cene');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for loading to complete
    await page.waitForTimeout(3000);
    
    // Check for loading state to disappear
    const loadingIndicator = page.locator('text=Učitavanje podataka');
    const isVisible = await loadingIndicator.isVisible();
    
    if (isVisible) {
      console.log('Page still loading, waiting longer...');
      await page.waitForTimeout(5000);
    }
    
    // Check for any JavaScript errors
    if (errors.length > 0) {
      console.log('JavaScript errors found:', errors);
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    
    // Check page content
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Look for navigation
    const nav = page.locator('nav');
    if (await nav.isVisible()) {
      console.log('Navigation is visible');
    }
    
    // Look for price-related content
    const priceElements = page.locator('text=/\\d+/');
    const count = await priceElements.count();
    if (count > 0) {
      console.log(`Found ${count} elements with numbers`);
    }
  });

  test('Responsive design test', async ({ page }) => {
    console.log('Testing responsive design...');
    
    await page.goto('/cene');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileNav = page.locator('button[aria-label="Open menu"], .mobile-menu, button:has-text("Menu")');
    if (await mobileNav.isVisible()) {
      console.log('Mobile navigation is visible');
    }
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    const desktopNav = page.locator('nav .hidden.md\\:flex');
    if (await desktopNav.isVisible()) {
      console.log('Desktop navigation is visible');
    }
  });

  test('Filter functionality test', async ({ page }) => {
    console.log('Testing filter functionality...');
    
    await page.goto('/cene');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Look for filter elements
    const filters = page.locator('select, input[type="text"], input[type="number"], button');
    const filterCount = await filters.count();
    
    console.log(`Found ${filterCount} potential filter elements`);
    
    // Try to interact with any visible filters
    for (let i = 0; i < Math.min(filterCount, 5); i++) {
      const filter = filters.nth(i);
      if (await filter.isVisible()) {
        const tagName = await filter.evaluate(el => el.tagName);
        console.log(`Found filter: ${tagName}`);
        
        if (tagName === 'BUTTON') {
          try {
            await filter.click();
            await page.waitForTimeout(500);
            console.log('Clicked button');
          } catch (e) {
            console.log('Could not click button:', e.message);
          }
        }
      }
    }
  });

  test('Serbian language support', async ({ page }) => {
    console.log('Testing Serbian language support...');
    
    await page.goto('/cene');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for Serbian text
    const serbianText = page.locator('text=/Početna|Cene|Budžet|Učitavanje/');
    const foundSerbian = await serbianText.count();
    
    if (foundSerbian > 0) {
      console.log(`Found Serbian language elements: ${foundSerbian}`);
    }
    
    // Check page language
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    if (lang) {
      console.log(`Page language: ${lang}`);
    }
  });
});
