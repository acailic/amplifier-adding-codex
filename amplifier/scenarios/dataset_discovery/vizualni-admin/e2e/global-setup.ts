import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...')

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Wait for the application to be ready
    await page.goto(config.webServer?.url || 'http://localhost:3000')
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 30000 })

    console.log('✅ Application is ready for E2E testing')
  } catch (error) {
    console.log('⚠️  Application might still be starting, E2E tests will wait...')
  } finally {
    await browser.close()
  }
}

export default globalSetup