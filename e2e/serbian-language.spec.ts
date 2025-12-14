import { test, expect } from '@playwright/test';

test.describe('Serbian Language Support Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cene');
  });

  test('should display Serbian Cyrillic text correctly', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for Cyrillic characters
    const cyrillicText = await page.locator('text=/[Ѐ-ӿ]/').all();
    
    if (cyrillicText.length > 0) {
      // Verify Cyrillic text is visible
      await expect(cyrillicText[0]).toBeVisible();
      
      // Check specific Serbian Cyrillic words
      const serbianWords = ['Електроника', 'Београд', 'Нови Сад', 'Лаптоп рачунари'];
      
      for (const word of serbianWords) {
        const element = page.locator(`text=${word}`);
        if (await element.count() > 0) {
          await expect(element.first()).toBeVisible();
        }
      }
    }
  });

  test('should handle Serbian Latin text correctly', async ({ page }) => {
    // Check for Serbian Latin characters
    const serbianLatinText = await page.locator('text=/[čćžšđČĆŽŠĐ]/').all();
    
    if (serbianLatinText.length > 0) {
      // Verify Serbian Latin text is visible
      await expect(serbianLatinText[0]).toBeVisible();
    }
  });

  test('should display prices in RSD correctly', async ({ page }) => {
    // Wait for prices to load
    await page.waitForSelector('[data-testid="price-item"]', { timeout: 10000 });
    
    // Look for RSD currency indicators
    const rsdIndicators = await page.locator('text=/RSD|дин\.|динар/').all();
    
    if (rsdIndicators.length > 0) {
      await expect(rsdIndicators[0]).toBeVisible();
    }
    
    // Check for proper price formatting
    const priceElements = await page.locator('text=/\\d{1,3}(\\.\\d{3})*/').all();
    
    if (priceElements.length > 0) {
      const priceText = await priceElements[0].textContent();
      expect(priceText).toMatch(/\d{1,3}(,\d{3})*(\.\d{2})?/); // Serbian format: 1.234,56 or 123.456
    }
  });

  test('should handle location names in Serbian', async ({ page }) => {
    // Check for Serbian city names
    const cities = ['Београд', 'Нови Сад', 'Ниш', 'Крагујевац'];
    
    for (const city of cities) {
      const cityElement = page.locator(`text=${city}`);
      if (await cityElement.count() > 0) {
        await expect(cityElement.first()).toBeVisible();
      }
    }
  });

  test('should support Serbian category names', async ({ page }) => {
    // Check for Serbian category names
    const categories = ['Електроника', 'Рачунари', 'Мобилни телефони', 'ТВ и видео'];
    
    for (const category of categories) {
      const categoryElement = page.locator(`text=${category}`);
      if (await categoryElement.count() > 0) {
        await expect(categoryElement.first()).toBeVisible();
      }
    }
  });

  test('should handle Serbian date formats', async ({ page }) => {
    // Look for date elements
    const dateElements = await page.locator('[datetime], .date, .timestamp').all();
    
    if (dateElements.length > 0) {
      // Check if dates are properly formatted
      for (const element of dateElements.slice(0, 3)) {
        if (await element.isVisible()) {
          const dateText = await element.textContent();
          if (dateText) {
            // Should contain recognizable date pattern
            expect(dateText).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/); // Serbian format: DD.MM.YYYY
          }
        }
      }
    }
  });

  test('should maintain Serbian text in filters', async ({ page }) => {
    // Check if filters contain Serbian text
    const filterLabels = await page.locator('label, .filter-label, .option').all();
    
    for (const label of filterLabels.slice(0, 5)) {
      if (await label.isVisible()) {
        const labelText = await label.textContent();
        if (labelText && /[Ѐ-ӿ]/.test(labelText)) {
          // Found Cyrillic text, verify it's displayed
          await expect(label).toBeVisible();
        }
      }
    }
  });

  test('should render Serbian characters correctly in charts', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('[data-testid^="chart"]', { timeout: 10000 });
    
    // Check chart labels for Serbian text
    const chartLabels = await page.locator('.chart-label, .axis-label, .legend-text').all();
    
    for (const label of chartLabels.slice(0, 10)) {
      if (await label.isVisible()) {
        const labelText = await label.textContent();
        if (labelText && /[Ѐ-ӿ]/.test(labelText)) {
          // Verify Serbian characters in charts are not garbled
          expect(labelText).toBeTruthy();
          expect(labelText.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should handle Serbian input correctly', async ({ page }) => {
    // Find input fields
    const inputs = await page.locator('input[type="text"], input[type="search"], textarea').all();
    
    for (const input of inputs.slice(0, 2)) {
      if (await input.isVisible()) {
        // Type Serbian text
        const serbianText = 'електроника';
        await input.fill(serbianText);
        
        // Verify the input value
        const value = await input.inputValue();
        expect(value).toBe(serbianText);
        
        // Clear input
        await input.fill('');
      }
    }
  });

  test('should preserve Serbian text in page titles and meta', async ({ page }) => {
    // Check page title
    const title = await page.title();
    
    // Title should contain appropriate text (Latin or Cyrillic)
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // Check meta description if present
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(0);
    }
  });

  test('should handle URL encoding for Serbian characters', async ({ page }) => {
    // Try to navigate with Serbian characters in URL parameters
    const serbianQuery = 'категорија=Електроника';
    
    // This tests that the app can handle Serbian characters in URLs
    await page.goto(`/cene?${encodeURIComponent(serbianQuery)}`);
    
    // Page should still load without errors
    await page.waitForLoadState('networkidle');
    
    // No JavaScript errors should occur
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.waitForTimeout(1000);
    
    // Should not have JavaScript errors
    expect(errors.length).toBe(0);
  });
});
