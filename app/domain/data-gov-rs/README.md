# Data.gov.rs API Client

Production-ready TypeScript client for Serbian government open data portal (data.gov.rs) with comprehensive performance optimizations, Serbian-specific data validation, and real-time capabilities.

## Features / Mogućnosti

- **Performance Optimizations** - Caching, rate limiting, batch requests
- **Serbian Data Validation** - JMBG, PIB, matični broj, postal codes, phone numbers
- **Real-time Updates** - Webhook support for data changes
- **Bilingual Support** - Full English/Serbian language support
- **Error Handling** - Serbian-specific error messages and fallback strategies
- **Quality Metrics** - Data quality assessment and monitoring
- **Security** - API key management, SSL validation, data masking
- **Monitoring** - Health checks, performance metrics, alerting

## Quick Start / Brzo početak

```typescript
import { createDataGovRsClient } from './client';

// Create client with default configuration
const client = createDataGovRsClient({
  apiKey: 'your-api-key-here',
  baseURL: 'https://data.gov.rs/api/v1'
});

// Search for datasets
const datasets = await client.getDatasets(1, 20, {
  theme: 'economy',
  language: 'sr'
});

// Get specific dataset
const dataset = await client.getDataset('dataset-id');

// Search with advanced filters
const searchResults = await client.search({
  query: 'population',
  filters: {
    theme: ['demography'],
    publisher: ['republic-institute-of-statistics'],
    quality: { min: 85 }
  }
});
```

## Serbian Data Validation / Srpska validacija podataka

```typescript
// Validate JMBG (Unique Master Citizen Number)
const jmbgResult = client.validateSerbianData('jmbg', '0101990710006');
console.log(jmbgResult.valid); // true/false
console.log(jmbgResult.errors); // Array of validation errors

// Validate PIB (Tax Identification Number)
const pibResult = client.validateSerbianData('pib', '12345678');

// Validate Serbian phone number
const phoneResult = client.validateSerbianData('phoneNumber', '+38111234567');

// Validate license plate
const plateResult = client.validateSerbianData('licensePlate', 'BG 123-AB');

// Validate postal code
const postalResult = client.validateSerbianData('postalCode', '11000');
```

## Advanced Configuration / Napredna konfiguracija

```typescript
const client = createDataGovRsClient({
  baseURL: 'https://data.gov.rs/api/v1',
  apiKey: process.env.DATA_GOV_RS_API_KEY,
  
  // Cache configuration
  cache: {
    enabled: true,
    defaultTTL: 300000, // 5 minutes
    maxSize: 1000,
    strategy: 'lru',
    storage: 'memory'
  },
  
  // Rate limiting
  rateLimit: {
    enabled: true,
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000
  },
  
  // Localization
  localization: {
    defaultLanguage: 'sr',
    fallbackLanguage: 'en',
    dateFormat: 'DD.MM.YYYY.',
    timezone: 'Europe/Belgrade'
  },
  
  // Quality thresholds
  quality: {
    enabled: true,
    thresholds: {
      completeness: 80,
      accuracy: 90,
      consistency: 85,
      overall: 85
    }
  },
  
  // Monitoring
  monitoring: {
    enabled: true,
    healthCheckInterval: 300000, // 5 minutes
    alertThresholds: {
      responseTime: 5000,
      cacheHitRate: 80,
      memoryUsage: 500 * 1024 * 1024 // 500MB
    }
  }
});
```

## Webhooks / Vebhukovi

```typescript
// Create webhook for real-time updates
const webhook = await client.createWebhook({
  url: 'https://your-app.com/webhooks/data-gov-rs',
  events: ['dataset.created', 'dataset.updated', 'resource.created'],
  secret: 'your-webhook-secret',
  active: true,
  retryPolicy: {
    maxRetries: 3,
    backoffStrategy: 'exponential',
    initialDelay: 1000
  }
});
```

## Data Quality Assessment / Procena kvaliteta podataka

```typescript
// Assess dataset quality
const qualityMetrics = await client.assessDatasetQuality('dataset-id');
console.log('Overall quality:', qualityMetrics.overall); // 0-100
console.log('Completeness:', qualityMetrics.completeness);
console.log('Accuracy:', qualityMetrics.accuracy);

// Get quality report
const report = await client.getQualityReport('dataset-id', 'pdf');
```

## Monitoring and Health Monitoring / Monitoriranje i zdravlje

```typescript
// Get system health status
const health = await client.getHealthStatus();
console.log('Status:', health.data.status);
console.log('Cache hit rate:', health.data.cache.hitRate);
console.log('Memory usage:', health.data.memory.heapUsed);

// Get detailed metrics
const metrics = await client.getMetrics();
```

## Error Handling / Upravljanje greškama

```typescript
import { 
  DataGovRsError, 
  RateLimitError, 
  ValidationError,
  AuthenticationError 
} from './client';

try {
  const dataset = await client.getDataset('invalid-id');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limited. Retry after:', error.retryAfter);
  } else if (error instanceof AuthenticationError) {
    console.log('Authentication failed. Check API key.');
  } else if (error instanceof ValidationError) {
    console.log('Validation error:', error.field, error.message);
  } else if (error instanceof DataGovRsError) {
    console.log('API error:', error.code, error.message);
  }
}
```

## Serbian Institutions and Documents / Srpske institucije i dokumenti

```typescript
// Get Serbian institutions
const institutions = await client.getSerbianInstitutions(
  'ministry', // type
  'Beograd'   // municipality
);

// Get Serbian documents
const documents = await client.getSerbianDocuments(
  'zakon',   // type
  2023,      // year
  'Skupština' // issuer
);

// Get Serbian regulations
const regulations = await client.getSerbianRegulations(
  'uredba', // type
  'active', // status
  2023       // year
);

// Get municipalities
const municipalities = await client.getSerbianMunicipalities();
```

## Dataset Operations / Operacije sa skupovima podataka

```typescript
// Create new dataset
const newDataset = await client.createDataset({
  name: 'Population Statistics 2023',
  nameSr: 'Statistika stanovništva 2023',
  description: 'Annual population data for Serbian municipalities',
  descriptionSr: 'Godišnji podaci o stanovništvu za srpske opštine',
  keywords: ['population', 'demographics', 'statistics'],
  keywordsSr: ['stanovništvo', 'demografija', 'statistika'],
  theme: 'demography',
  themeSr: 'demografija',
  publisher: 'Republic Institute of Statistics',
  publisherSr: 'Republički zavod za statistiku',
  language: ['sr', 'en'],
  quality: {
    completeness: 95,
    accuracy: 98,
    consistency: 92,
    timeliness: 88,
    validity: 99,
    uniqueness: 96,
    accessibility: 100,
    relevance: 85,
    overall: 93
  }
});

// Update dataset
const updatedDataset = await client.updateDataset('dataset-id', {
  description: 'Updated description'
});

// Delete dataset
await client.deleteDataset('dataset-id');
```

## Cache Management / Upravljanje kešom

```typescript
// Get cache statistics
const cacheStats = client.getCacheStats();
console.log('Hit rate:', cacheStats.hitRate);
console.log('Cache size:', cacheStats.size);

// Invalidate specific cache entries
client.invalidateCache('dataset:specific-id');

// Clear all cache
client.clearCache();
```

## Environment Variables / Promenljive okruženja

```bash
# Required for production use
DATA_GOV_RS_API_KEY=your-api-key-here
DATA_GOV_RS_BASE_URL=https://data.gov.rs/api/v1

# Optional configuration
DATA_GOV_RS_CACHE_TTL=300000
DATA_GOV_RS_RATE_LIMIT_PER_MINUTE=60
DATA_GOV_RS_DEFAULT_LANGUAGE=sr
DATA_GOV_RS_WEBHOOK_SECRET=your-webhook-secret
```

## TypeScript Support / TypeScript podrška

The client is fully typed with comprehensive TypeScript definitions. All methods return properly typed responses and include detailed error types.

```typescript
import type { 
  DatasetMetadata, 
  SearchResponse, 
  QualityMetrics,
  ValidationResult 
} from './types';

const dataset: DatasetMetadata = (await client.getDataset('id')).data!;
const searchResults: SearchResponse = await client.search({ query: 'test' });
const quality: QualityMetrics = (await client.assessDatasetQuality('id')).data!;
const validation: ValidationResult = client.validateSerbianData('jmbg', '0101990710006');
```

## Production Considerations / Razmisljanja za produkciju

1. **API Key Security** - Store API keys in environment variables, use rotation
2. **Rate Limiting** - Monitor API usage and adjust limits accordingly
3. **Cache Strategy** - Configure appropriate TTL values based on data freshness requirements
4. **Error Handling** - Implement proper retry logic and error reporting
5. **Monitoring** - Set up alerts for cache hit rates, response times, and error rates
6. **Webhook Security** - Validate webhook signatures and implement proper authentication

## License / Licenca

MIT License

## Support / Podrška

For issues and questions, please refer to the official data.gov.rs documentation or create an issue in this repository.

---

*Ova biblioteka je optimizovana za srpsko tržište i uključuje specifične validatore za srpske državne podatke.*
*This library is optimized for the Serbian market and includes specific validators for Serbian government data.*
