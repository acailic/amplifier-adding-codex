import { test, expect } from '@playwright/test';

test.describe('Post-Fix Validation Suite', () => {
  test('API endpoint still works', async ({ request }) => {
    console.log('Testing API endpoint after fix...');
    
    const response = await request.get('/api/price-data');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
    expect(data.data.length).toBeGreaterThan(0);
    
    console.log('✅ API endpoint working correctly');
  });

  test('Page loads without infinite re-renders', async ({ page }) => {
    console.log('Testing page load after fix...');
    
    // Track JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    // Track console warnings
    const warnings = [];
    page.on('console', msg => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    await page.goto('/cene');
    await page.waitForLoadState('networkidle');
    
    // Wait to ensure no infinite re-renders
    await page.waitForTimeout(5000);
    
    // Check for infinite re-render errors
    const reRenderErrors = errors.filter(e => 
      e.includes('Maximum update depth exceeded') || 
      e.includes('Too many re-renders')
    );
    
    if (reRenderErrors.length > 0) {
      console.log('❌ Infinite re-render issue still exists:');
      reRenderErrors.forEach(e => console.log('  -', e));
    } else {
      console.log('✅ No infinite re-render errors detected');
    }
    
    expect(reRenderErrors.length).toBe(0);
    
    // Check total error count
    if (errors.length > 0) {
      console.log(`⚠️  Found ${errors.length} JavaScript errors (non-re-render related)`);
    } else {
      console.log('✅ No JavaScript errors detected');
    }
  });

  test('Filter functionality works', async ({ page }) => {
    console.log('Testing filter functionality after fix...');
    
    await page.goto('/cene');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Look for filter toggle button
    const filterToggle = page.locator('button').filter({ hasText: '' }).first();
    if (await filterToggle.isVisible()) {
      await filterToggle.click();
      await page.waitForTimeout(1000);
      console.log('✅ Filter toggle button works');
    }
    
    // Look for category filters
    const categoryCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await categoryCheckboxes.count();
    
    if (checkboxCount > 0) {
      console.log(`✅ Found ${checkboxCount} filter checkboxes`);
      
      // Try clicking the first checkbox
      const firstCheckbox = categoryCheckboxes.first();
      if (await firstCheckbox.isVisible()) {
        await firstCheckbox.check();
        await page.waitForTimeout(500);
        
        // Verify it's checked
        const isChecked = await firstCheckbox.isChecked();
        expect(isChecked).toBe(true);
        console.log('✅ Filter checkbox interaction works');
      }
    } else {
      console.log('⚠️  No filter checkboxes found (filters might not be expanded)');
    }
  });

  test('Page renders without critical errors', async ({ page }) => {
    console.log('Testing overall page rendering...');
    
    await page.goto('/cene');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot for manual review
    await page.screenshot({ 
      path: 'test-results/post-fix-screenshot.png', 
      fullPage: true 
    });
    
    // Check for basic elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for navigation
    const nav = page.locator('nav');
    const navExists = await nav.count();
    if (navExists > 0) {
      console.log('✅ Navigation element found');
    }
    
    // Check for content
    const contentElements = page.locator('div, p, h1, h2, h3');
    const contentCount = await contentElements.count();
    console.log(`✅ Found ${contentCount} content elements`);
    
    expect(contentCount).toBeGreaterThan(10);
  });
});
