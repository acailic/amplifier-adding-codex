/**
 * Example usage of Data.gov.rs API Client
 * Primer korišćenja Data.gov.rs API klijenta
 */

import { 
  createDataGovRsClient, 
  DataGovRsError,
  RateLimitError 
} from './client';

// Create client with default configuration
const client = createDataGovRsClient({
  apiKey: process.env.DATA_GOV_RS_API_KEY,
  baseURL: 'https://data.gov.rs/api/v1'
});

// ============================================================================
// BASIC USAGE / OSNOVNA KORIŠĆENJA
// ============================================================================

async function basicExample() {
  console.log('=== Basic Example ===');
  
  try {
    // Get first page of datasets
    const datasets = await client.getDatasets(1, 20);
    console.log('Found datasets:', datasets.meta?.total);
    
    // Search for datasets
    const searchResults = await client.search({
      query: 'population',
      filters: {
        theme: ['demography'],
        language: ['sr']
      }
    });
    
    console.log('Search results:', searchResults.total.datasets);
    
  } catch (error) {
    console.error('Basic example failed:', error);
  }
}

// ============================================================================
// SERBIAN DATA VALIDATION / VALIDACIJA SRPSKIH PODATAKA
// ============================================================================

async function serbianValidationExample() {
  console.log('\n=== Serbian Data Validation ===');
  
  // Test valid Serbian data
  console.log('JMBG Validation:', client.validateSerbianData('jmbg', '0101990710006'));
  console.log('PIB Validation:', client.validateSerbianData('pib', '12345678'));
  console.log('Phone Validation:', client.validateSerbianData('phoneNumber', '+38111234567'));
  console.log('Plate Validation:', client.validateSerbianData('licensePlate', 'BG 123-AB'));
  console.log('Postal Code Validation:', client.validateSerbianData('postalCode', '11000'));
}

// ============================================================================
// ADVANCED CONFIGURATION / NAPREDNA KONFIGURACIJA
// ============================================================================

async function advancedConfigExample() {
  console.log('\n=== Advanced Configuration ===');
  
  const advancedClient = createDataGovRsClient({
    apiKey: process.env.DATA_GOV_RS_API_KEY,
    cache: {
      enabled: true,
      defaultTTL: 600000,
      maxSize: 2000
    },
    rateLimit: {
      enabled: true,
      requestsPerMinute: 100
    },
    localization: {
      defaultLanguage: 'sr',
      fallbackLanguage: 'en'
    }
  });
  
  try {
    const health = await advancedClient.getHealthStatus();
    console.log('System Health:', health.data.status);
    console.log('Cache Hit Rate:', health.data.cache.hitRate + '%');
    
  } catch (error) {
    console.error('Advanced config example failed:', error);
  }
}

// ============================================================================
// DATASET MANAGEMENT / UPRAVLjANJE SKUPOVIMA PODATAKA
// ============================================================================

async function datasetManagementExample() {
  console.log('\n=== Dataset Management ===');
  
  try {
    // Validate dataset before creation
    const validation = await client.validateDataset({
      name: 'Test Dataset',
      description: 'A test dataset for validation',
      keywords: ['test', 'validation'],
      theme: 'test'
    });
    
    console.log('Validation score:', validation.score);
    console.log('Valid:', validation.valid);
    
    if (validation.errors.length > 0) {
      console.log('Errors:', validation.errors.map(e => e.message));
    }
    
  } catch (error) {
    console.error('Dataset management failed:', error);
  }
}

// ============================================================================
// SERBIAN INSTITUTIONS / SRPSKE INSTITUCIJE
// ============================================================================

async function serbianInstitutionsExample() {
  console.log('\n=== Serbian Institutions ===');
  
  try {
    // Get ministries
    const ministries = await client.getSerbianInstitutions('ministry');
    console.log('Ministries found:', ministries.data?.length);
    
    // Get municipalities
    const municipalities = await client.getSerbianMunicipalities();
    console.log('Municipalities found:', municipalities.data?.length);
    
  } catch (error) {
    console.error('Serbian institutions example failed:', error);
  }
}

// ============================================================================
// ERROR HANDLING / UPRAVLjANJE GREŠKAMA
// ============================================================================

async function errorHandlingExample() {
  console.log('\n=== Error Handling ===');
  
  try {
    await client.getDataset('non-existent-id');
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.log('Rate limited. Retry after:', error.retryAfter);
    } else if (error instanceof DataGovRsError) {
      console.log('API Error:', error.code, error.message);
    } else {
      console.log('Unexpected error:', error);
    }
  }
}

// ============================================================================
// CACHE PERFORMANCE / KEŠ PERFORMANSE
// ============================================================================

async function cachePerformanceExample() {
  console.log('\n=== Cache Performance ===');
  
  try {
    // First request
    console.time('First request');
    await client.getDatasets(1, 10);
    console.timeEnd('First request');
    
    // Second request (should be cached)
    console.time('Cached request');
    await client.getDatasets(1, 10);
    console.timeEnd('Cached request');
    
    const health = await client.getHealthStatus();
    console.log('Cache hit rate:', health.data.cache.hitRate + '%');
    
  } catch (error) {
    console.error('Cache performance test failed:', error);
  }
}

// ============================================================================
// MAIN EXECUTION / GLAVNO IZVRŠAVANJE
// ============================================================================

async function main() {
  console.log('Data.gov.rs API Client Examples');
  console.log('================================\n');
  
  if (!process.env.DATA_GOV_RS_API_KEY) {
    console.log('Warning: No API key provided. Some examples may fail.\n');
  }
  
  try {
    await basicExample();
    await serbianValidationExample();
    await advancedConfigExample();
    await datasetManagementExample();
    await serbianInstitutionsExample();
    await errorHandlingExample();
    await cachePerformanceExample();
    
    console.log('\n=== All examples completed ===');
    
  } catch (error) {
    console.error('Example execution failed:', error);
  } finally {
    client.destroy();
    console.log('Client resources cleaned up');
  }
}

// Run examples
if (require.main === module) {
  main().catch(console.error);
}

export {
  basicExample,
  serbianValidationExample,
  advancedConfigExample,
  datasetManagementExample,
  serbianInstitutionsExample,
  errorHandlingExample,
  cachePerformanceExample
};
