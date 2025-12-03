import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...')

  // Add any cleanup tasks here
  // For example: clear test data, close database connections, etc.

  console.log('✅ E2E teardown complete')
}

export default globalTeardown