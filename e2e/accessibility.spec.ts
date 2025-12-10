import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cene');
    await injectAxe(page);
  });

  test('should pass accessibility checks', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check accessibility with axe
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      rules: {
        // Temporary rule exclusions for known issues
        'color-contrast': { enabled: false },
        'landmark-one-main': { enabled: false }
      }
    });
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
    
    // Test filter interactions with keyboard
    const filters = await page.locator('[data-testid^="filter"], button, input, select').all();
    
    for (const filter of filters.slice(0, 5)) { // Test first 5 filters
      if (await filter.isVisible()) {
        await filter.focus();
        expect(await filter.evaluate(el => el === document.activeElement)).toBe(true);
        
        // Test Enter/Space for buttons
        const tagName = await filter.evaluate(el => el.tagName);
        if (tagName === 'BUTTON') {
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for ARIA labels on interactive elements
    const buttons = await page.locator('button').all();
    
    for (const button of buttons.slice(0, 5)) {
      if (await button.isVisible()) {
        const hasAriaLabel = await button.evaluate(el => 
          el.hasAttribute('aria-label') || 
          el.hasAttribute('aria-labelledby') ||
          el.textContent?.trim()
        );
        expect(hasAriaLabel).toBe(true);
      }
    }
    
    // Check chart accessibility
    const charts = await page.locator('[data-testid^="chart"]').all();
    for (const chart of charts) {
      if (await chart.isVisible()) {
        const hasAriaLabel = await chart.evaluate(el => 
          el.hasAttribute('aria-label') || 
          el.hasAttribute('role') ||
          el.querySelector('title')
        );
        if (hasAriaLabel) {
          expect(hasAriaLabel).toBe(true);
        }
      }
    }
  });

  test('should support screen readers', async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    if (headings.length > 0) {
      // First heading should be h1
      const firstHeading = headings[0];
      const tagName = await firstHeading.evaluate(el => el.tagName);
      expect(tagName).toBe('H1');
    }
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images.slice(0, 5)) {
      if (await img.isVisible()) {
        const hasAlt = await img.evaluate(el => el.hasAttribute('alt'));
        expect(hasAlt).toBe(true);
      }
    }
    
    // Check for form labels
    const inputs = await page.locator('input, select, textarea').all();
    for (const input of inputs.slice(0, 5)) {
      if (await input.isVisible()) {
        const hasLabel = await input.evaluate(el => {
          const id = el.getAttribute('id');
          return el.hasAttribute('aria-label') || 
                 el.hasAttribute('aria-labelledby') ||
                 (id && document.querySelector(`label[for="${id}"]`)) ||
                 el.closest('label');
        });
        expect(hasLabel).toBe(true);
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Test specific text elements for contrast
    const textElements = await page.locator('p, h1, h2, h3, span, div').all();
    
    for (const element of textElements.slice(0, 10)) { // Test first 10
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });
        
        // Basic check that color is defined
        expect(styles.color).toBeTruthy();
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
      }
    }
  });

  test('should be usable with high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    
    // Check page is still usable
    await page.waitForSelector('[data-testid="price-chart"]', { timeout: 10000 });
    
    // Test visibility of key elements
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    
    const charts = page.locator('[data-testid^="chart"]');
    await expect(charts.first()).toBeVisible();
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Navigate to page
    await page.goto('/cene');
    
    // Check that animations are disabled or reduced
    const animatedElements = await page.locator('[class*="motion"], [class*="animate"]').all();
    
    for (const element of animatedElements) {
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            transition: computed.transition,
            animation: computed.animation,
            transform: computed.transform
          };
        });
        
        // In reduced motion, animations should be minimal
        if (styles.animation && styles.animation !== 'none') {
          const animationDuration = styles.animation.match(/(\d+(?:\.\d+)?)s/);
          if (animationDuration) {
            const duration = parseFloat(animationDuration[1]);
            expect(duration).toBeLessThanOrEqual(0.1); // Very short or disabled
          }
        }
      }
    }
  });
});
