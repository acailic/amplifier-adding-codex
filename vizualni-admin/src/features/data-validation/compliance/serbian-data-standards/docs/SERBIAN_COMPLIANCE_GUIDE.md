# Serbian Government Data Standards Compliance Guide

## Overview

The vizualni-admin Serbian Data Standards Compliance module provides comprehensive support for Serbian government open data requirements, including compliance with **Zakon o slobodnom pristupu informacijama od javnog značaja** (Law on Free Access to Information of Public Importance) and **Pravilnik o otvorenim podacima** (Regulation on Open Data).

This guide covers implementation, usage, and best practices for Serbian government data compliance.

---

## Table of Contents

1. [Legal Framework](#legal-framework)
2. [Core Concepts](#core-concepts)
3. [Installation and Setup](#installation-and-setup)
4. [Basic Usage](#basic-usage)
5. [Advanced Features](#advanced-features)
6. [Serbian-Specific Features](#serbian-specific-features)
7. [Compliance Validation](#compliance-validation)
8. [Data Format Support](#data-format-support)
9. [Quality Metrics](#quality-metrics)
10. [Integration with data.gov.rs](#integration-with-datagovrs)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Legal Framework

### Serbian Laws and Regulations

#### 1. Zakon o slobodnom pristupu informacijama od javnog značaja
- **Purpose**: Ensures public access to government information
- **Key Requirements**:
  - Contact information must be provided
  - Publication dates must be documented
  - Responsible institutions must be identified
  - Response times must be respected

#### 2. Pravilnik o otvorenim podacima
- **Purpose**: Technical regulations for open data publication
- **Key Requirements**:
  - Data must be in open, machine-readable formats
  - Metadata must follow Serbian standards
  - Regular publication schedules
  - Technical specifications compliance

#### 3. data.gov.rs Standards
- **Purpose**: Official Serbian open data portal requirements
- **Key Requirements**:
  - DCAT-compatible metadata
  - Standardized theme classification
  - Format specifications
  - API integration requirements

#### 4. Open Data Strategy 2023-2027
- **Purpose**: Strategic framework for Serbian open data
- **Key Goals**:
  - Increase open data quantity and quality
  - Improve data accessibility
  - Align with EU standards
  - Promote data reuse

### EU Integration Requirements

#### PSI Directive Compliance
- **Public Sector Information Directive** requirements
- Open licensing requirements
- Machine-readable format requirements
- No discrimination in access

#### INSPIRE Directive
- Spatial data infrastructure requirements
- Interoperability standards
- Metadata specifications
- Service requirements

---

## Core Concepts

### Serbian Metadata Schema

The Serbian metadata schema extends international standards with Serbian-specific elements:

```typescript
interface SerbianMetadataSchema {
  identifier: string;
  title: SerbianLocalizedString;    // Supports sr, sr-Latn, en
  description: SerbianLocalizedString;
  publisher: GovernmentInstitution;  // Serbian government entity
  language: ('sr' | 'sr-Latn' | 'en')[];
  theme: SerbianGovernmentTheme[];   // Serbian classification
  license: OpenLicense;              // Open data license
  // ... additional fields
}
```

### Serbian Localization

#### Script Support
- **Cyrillic (sr)**: Ћирилица - Official Serbian script
- **Latin (sr-Latn)**: Latinica - Official Serbian script
- **Auto-detection**: Intelligent script identification
- **Conversion**: Bidirectional script conversion

#### Date Formatting
- **Short**: `01.01.2024.`
- **Long**: `1. јануар 2024. године`
- **ISO**: `2024-01-01`
- **Custom**: Configurable formats

#### Number Formatting
- **Decimal separator**: Comma (,) instead of period (.)
- **Thousands separator**: Period (.) instead of comma (,)
- **Currency**: RSD, EUR with Serbian symbols

### Serbian Data Validation

#### JMBG (Јединствени матични број грађана)
- **Format**: 13 digits
- **Checksum validation**: Algorithmic validation
- **Date extraction**: Birth date from JMBG
- **Region validation**: Serbian region codes

#### PIB (Порески идентификациони број)
- **Format**: 9 digits
- **Checksum validation**: Algorithmic validation
- **Institution validation**: Serbian tax authorities

#### Address Standards
- **Format**: Street, number, postal code, city
- **Serbian terminology**: Standardized address terms
- **Validation**: Pattern-based validation
- **Normalization**: Standardized format conversion

---

## Installation and Setup

### Basic Installation

```bash
npm install vizualni-admin
```

### TypeScript Configuration

Ensure your `tsconfig.json` includes Serbian locale support:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["node", "vitest/globals"]
  }
}
```

### Import Statements

```typescript
// Main compliance suite
import {
  SerbianComplianceSuite,
  createSerbianComplianceSuite,
  validateSerbianDataset,
  parseSerbianData,
  exportSerbianData
} from 'vizualni-admin/compliance/serbian-data-standards';

// Individual components
import { SerbianDataStandardsCompliance } from 'vizualni-admin/compliance/serbian-data-standards';
import { SerbianMetadataAdapter } from 'vizualni-admin/compliance/serbian-data-standards';
import { SerbianCSVParser } from 'vizualni-admin/compliance/serbian-data-standards';
import { SerbianQualityAnalyzer } from 'vizualni-admin/compliance/serbian-data-standards';
```

---

## Basic Usage

### Quick Compliance Check

```typescript
import { createSerbianComplianceSuite } from 'vizualni-admin/compliance/serbian-data-standards';

const suite = createSerbianComplianceSuite();

// Quick metadata validation
const metadata = {
  identifier: 'test-dataset-001',
  title: {
    sr: 'Тест подаци',
    'sr-Latn': 'Test podaci',
    en: 'Test Data'
  },
  publisher: {
    name: { sr: 'Тест организација', en: 'Test Organization' },
    identifier: '123456789',
    type: 'agency' as const,
    level: 'national' as const,
    contactInfo: { email: 'test@example.com' }
  },
  publicationDate: new Date(),
  language: ['sr', 'en']
};

const quickResult = await suite.quickCheck(metadata);
console.log('Compliant:', quickResult.compliant);
console.log('Score:', quickResult.score);
console.log('Missing fields:', quickResult.missingFields);
```

### Full Compliance Validation

```typescript
import { validateSerbianDataset } from 'vizualni-admin/compliance/serbian-data-standards';

const data = [
  {
    ид: 1,
    име: 'Петар',
    презиме: 'Петровић',
    јмбг: '0101990710006',
    пиб: '101883300',
    датум_рођења: '01.01.1990.',
    адреса: 'Улица Војводе Мишића 15, 11000 Београд'
  }
];

const result = await validateSerbianDataset(data, metadata);

console.log('Overall Score:', result.complianceResult.overallScore);
console.log('Is Compliant:', result.complianceResult.isCompliant);
console.log('Quality Score:', result.qualityMetrics.overallScore);

// Generate recommendations
result.recommendations.forEach(rec => {
  console.log(`${rec.type.toUpperCase()}: ${rec.title}`);
  console.log(`  ${rec.description}`);
  rec.actionSteps.forEach(step => console.log(`  - ${step}`));
});
```

### Data Parsing with Serbian Support

```typescript
import { parseSerbianData } from 'vizualni-admin/compliance/serbian-data-standards';

const csvData = `име;презиме;датум_рођења;јмбг
Петар;Петровић;01.01.1990.;0101990710006
Марина;Јовановић;15.05.1985.;1505985710006`;

const options = {
  delimiter: ';',
  validateJMBG: true,
  parseDates: true,
  parseNumbers: true,
  detectScript: true,
  normalizeText: true
};

const result = await parseSerbianData(csvData, options);

console.log('Parsed data:', result.data);
console.log('Script detected:', result.metadata.script);
console.log('Validation errors:', result.parseErrors);
console.log('Performance:', result.metadata.performance);
```

### Data Export in Serbian Formats

```typescript
import { exportSerbianData } from 'vizualni-admin/compliance/serbian-data-standards';

const data = [
  { name: 'Петар', city: 'Београд', population: 1500000 }
];

const csvOutput = exportSerbianData(data, 'csv', metadata);
const jsonOutput = exportSerbianData(data, 'json', metadata);
const dcatOutput = exportSerbianData(data, 'dcat', metadata);

console.log('CSV:', csvOutput);
console.log('DCAT:', dcatOutput);
```

---

## Advanced Features

### Custom Compliance Configuration

```typescript
import { SerbianComplianceSuite } from 'vizualni-admin/compliance/serbian-data-standards';

const suite = SerbianComplianceSuite.getInstance();

const customConfig = {
  strictMode: true,
  includeRecommendations: true,
  validateSampleSize: 1000,
  enableCaching: true,
  customThresholds: {
    'metadata-standards': 95, // Higher threshold for metadata
    'quality-assurance': 85,   // Standard threshold
    'legal-framework': 100     // Full compliance required
  }
};

const result = await suite.getComplianceEngine()
  .validateDataset(data, metadata, customConfig);
```

### Metadata Format Conversion

```typescript
import { SerbianMetadataAdapter } from 'vizualni-admin/compliance/serbian-data-standards';

const adapter = new SerbianMetadataAdapter();

// From Dublin Core to Serbian standards
const dublinCore = {
  identifier: 'dublin-core-example',
  title: 'Dataset Title',
  description: 'Dataset description',
  publisher: 'Publisher Name',
  date: '2024-01-01',
  language: 'en'
};

const serbianMetadata = adapter.adaptFromDublinCore(dublinCore);

// From DCAT to Serbian standards
const dcat = {
  '@context': 'https://www.w3.org/ns/dcat',
  'dct:identifier': 'dcat-example',
  'dct:title': { 'sr': 'Наслов', 'en': 'Title' },
  // ... other DCAT properties
};

const serbianFromDCAT = adapter.adaptFromDCAT(dcat);

// Back to international formats
const backToDublin = adapter.adaptToDublinCore(serbianMetadata);
const backToDCAT = adapter.adaptToDCAT(serbianMetadata);
```

### Quality Metrics Analysis

```typescript
import { SerbianQualityAnalyzer } from 'vizualni-admin/compliance/serbian-data-standards';

const analyzer = new SerbianQualityAnalyzer();

const qualityMetrics = await analyzer.calculateSerbianDataQuality(data, metadata);

console.log('Overall Score:', qualityMetrics.overallScore);
console.log('Completeness:', qualityMetrics.completeness.score);
console.log('Accuracy:', qualityMetrics.accuracy.score);
console.log('Serbian Specificity:', qualityMetrics.serbianSpecificity.score);

// Detailed Serbian specificity metrics
const serbianSpecific = qualityMetrics.serbianSpecificity;
console.log('Script Consistency:', serbianSpecific.scriptConsistency);
console.log('JMBG Validation:', serbianSpecific.jmbgValidation);
console.log('PIB Validation:', serbianSpecific.pibValidation);
console.log('Address Standardization:', serbianSpecific.addressStandardization);
```

### Script Conversion and Normalization

```typescript
import { SerbianCSVParser } from 'vizualni-admin/compliance/serbian-data-standards';

const parser = new SerbianCSVParser();

// Script detection
const text = 'Здраво свете Hello world';
const detectedScript = parser['detectScript'](text);
console.log('Detected script:', detectedScript); // 'mixed'

// Text normalization
const options = {
  normalizeText: true,
  detectScript: true
};

const result = await parser.parse(csvData, options);
console.log('Normalized script:', result.metadata.script);
```

---

## Serbian-Specific Features

### JMBG (ЈМБГ) Validation

The module provides comprehensive JMBG validation:

```typescript
// Built-in validation
const options = { validateJMBG: true };
const result = await parser.parse(data, options);

// Manual validation
const parser = new SerbianCSVParser();
const isValid = parser['validateJMBG']('0101990710006');
console.log('JMBG valid:', isValid); // true

// Extract information from JMBG
const jmbgInfo = parser['extractJMBGInfo']('0101990710006');
console.log('Birth date:', jmbgInfo.birthDate);
console.log('Gender:', jmbgInfo.gender);
console.log('Region:', jmbgInfo.region);
```

### PIB Validation

Tax Identification Number validation:

```typescript
// Built-in validation
const options = { validatePIB: true };
const result = await parser.parse(data, options);

// Manual validation
const isValid = parser['validatePIB']('101883300');
console.log('PIB valid:', isValid); // true
```

### Serbian Address Processing

```typescript
// Address validation
const address1 = 'Улица Војводе Мишића 15, 11000 Београд';
const address2 = 'Булевар ослобођења 20, 21000 Нови Сад';
const address3 = '123 Main Street, City'; // Invalid

const isValid1 = parser['isValidSerbianAddress'](address1); // true
const isValid2 = parser['isValidSerbianAddress'](address2); // true
const isValid3 = parser['isValidSerbianAddress'](address3); // false

// Address normalization
const normalized = parser['normalizeSerbianAddress']('vojvode misica 15,bgd');
console.log('Normalized:', normalized); // 'Улица Војводе Мишића 15, Београд'
```

### Serbian Institution Detection

```typescript
const adapter = new SerbianMetadataAdapter();

// Auto-detect government institutions
const metadata = adapter.enhanceSerbianMetadata(basicMetadata);

// Known institution matching
const institution = adapter['findInstitutionByName']('Републички завод за статистику');
console.log('Institution:', institution);

// Institution validation
const isValidInstitution = adapter['isValidInstitutionIdentifier']('52555234');
console.log('Valid institution ID:', isValidInstitution);
```

### Serbian Theme Classification

```typescript
// Get Serbian government themes
const serbianThemes = adapter['getSerbianThemes']();
console.log('Available themes:', serbianThemes.map(t => ({
  code: t.code,
  name: t.name.sr,
  level: t.level
})));

// Theme suggestion
const suggestions = adapter['suggestThemes']({
  title: { sr: 'Подаци о школама' },
  description: { sr: 'Академски успех ученика' }
});
console.log('Suggested themes:', suggestions.map(t => t.code));
```

---

## Compliance Validation

### Complete Compliance Workflow

```typescript
import { createSerbianComplianceSuite } from 'vizualni-admin/compliance/serbian-data-standards';

const suite = createSerbianComplianceSuite();

const result = await suite.fullComplianceWorkflow(data, metadata, {
  // Validation options
  strictMode: false,
  includeRecommendations: true,
  validateSampleSize: 100,

  // Parsing options
  validateJMBG: true,
  validatePIB: true,
  parseDates: true,
  parseNumbers: true,
  detectScript: true,
  normalizeText: true
});

// Analyze results
console.log('=== COMPLIANCE ANALYSIS ===');
console.log('Overall Score:', result.complianceResult.overallScore);
console.log('Compliance Status:', result.complianceResult.isCompliant);

console.log('\n=== CATEGORY BREAKDOWN ===');
result.complianceResult.categories.forEach(category => {
  console.log(`${category.name}: ${category.score} (${category.status})`);
});

console.log('\n=== QUALITY METRICS ===');
console.log('Quality Score:', result.qualityMetrics.overallScore);
console.log('Completeness:', result.qualityMetrics.completeness.score);
console.log('Accuracy:', result.qualityMetrics.accuracy.score);
console.log('Serbian Specificity:', result.qualityMetrics.serbianSpecificity.score);

console.log('\n=== RECOMMENDATIONS ===');
result.recommendations.forEach((rec, index) => {
  console.log(`${index + 1}. [${rec.type.toUpperCase()}] ${rec.title}`);
  console.log(`   ${rec.description}`);
  console.log(`   Impact: ${rec.estimatedImpact}%, Complexity: ${rec.implementationComplexity}`);
  console.log(`   Steps: ${rec.actionSteps.length}`);
});
```

### Targeted Validation

```typescript
// Metadata-only validation
const metadataValidation = await suite.quickCheck(metadata);

// Legal framework validation
const legalValidator = new SerbianLegalFrameworkValidator();
const legalResult = await legalValidator.validate({
  data,
  metadata,
  config: {},
  datasetId: 'test-dataset'
});

// Quality metrics only
const qualityAnalyzer = new SerbianQualityAnalyzer();
const qualityOnly = await qualityAnalyzer.calculateSerbianDataQuality(data, metadata);
```

### Compliance Reporting

```typescript
// Generate comprehensive report
const report = suite.generateComplianceReport(result.complianceResult, result.qualityMetrics);

// Export report (JSON format)
const reportJson = JSON.stringify(report, null, 2);

// Export report to different formats
const csvReport = suite.exportToSerbianFormat([report], 'csv');
const dcatReport = suite.exportToSerbianFormat([report], 'dcat');
```

---

## Data Format Support

### Supported Formats

#### Primary Formats
- **CSV**: Comma-separated values with Serbian number formatting
- **JSON**: JavaScript Object Notation with UTF-8 encoding
- **XML**: eXtensible Markup Language
- **RDF**: Resource Description Framework

#### Serbian-Specific Formats
- **JMBG**: Serbian personal identification numbers
- **PIB**: Serbian tax identification numbers
- **Serbian Dates**: dd.mm.yyyy. format support
- **Serbian Numbers**: 1.234.567,89 format support

### Format Conversion

```typescript
// Convert between formats
const adapter = new SerbianMetadataAdapter();

// CSV to JSON
const csvData = 'name,age\n"Петар",30\n"Марина",25';
const parsedCSV = await parser.parse(csvData);
const jsonData = suite.exportToSerbianFormat(parsedCSV.data, 'json');

// JSON to CSV
const jsonData = [{ name: 'Петар', age: 30 }];
const csvOutput = suite.exportToSerbianFormat(jsonData, 'csv');

// Format-specific options
const options = {
  encoding: 'utf-8',
  delimiter: ';',
  quote: '"',
  normalizeText: true,
  detectScript: true
};
```

### Encoding Support

```typescript
// Auto-detect encoding
const result = await parser.parse(buffer); // Auto-detects UTF-8, Windows-1250, ISO-8859-2

// Specify encoding
const options = { encoding: 'utf-8' };
const result = await parser.parse(buffer, options);

// Handle mixed encoding
const result = await parser.parse(buffer, {
  detectEncoding: true,
  fallbackEncoding: 'utf-8'
});
```

### Performance Optimization

```typescript
// Large dataset handling
const largeOptions = {
  chunkSize: 10000,
  maxRows: 50000,
  processingMethod: 'streaming'
};

const result = await parser.parse(largeCsvData, largeOptions);

// Parallel processing
const batchSize = 1000;
const batches = [];
for (let i = 0; i < largeData.length; i += batchSize) {
  const batch = largeData.slice(i, i + batchSize);
  batches.push(suite.getQualityAnalyzer().calculateSerbianDataQuality(batch));
}

const results = await Promise.all(batches);
```

---

## Quality Metrics

### Serbian-Specific Metrics

#### Script Consistency
```typescript
const serbianSpecific = qualityMetrics.serbianSpecificity;

console.log('Script Consistency:', serbianSpecific.scriptConsistency);
// 0-100: Percentage of records with consistent script usage

console.log('Language Accuracy:', serbianSpecific.languageAccuracy);
// 0-100: Correct Serbian language patterns
```

#### Institutional Accuracy
```typescript
console.log('Institutional Accuracy:', serbianSpecific.institutionalAccuracy);
// 0-100: Correct Serbian government institution names and identifiers

console.log('Territorial Coverage:', serbianSpecific.territorialCoverage);
// 0-100: Serbian geographic location coverage
```

#### Format Accuracy
```typescript
console.log('Date Formatting:', serbianSpecific.dateFormatting);
// 0-100: Correct Serbian date format usage

console.log('Number Formatting:', serbianSpecific.numberFormatting);
// 0-100: Correct Serbian number format usage

console.log('Address Standardization:', serbianSpecific.addressStandardization);
// 0-100: Standardized Serbian address formats
```

#### Validation Metrics
```typescript
console.log('JMBG Validation:', serbianSpecific.jmbgValidation);
// 0-100: Valid JMBG checksums

console.log('PIB Validation:', serbianSpecific.pibValidation);
// 0-100: Valid PIB checksums
```

### General Quality Metrics

#### Completeness
```typescript
const completeness = qualityMetrics.completeness;

console.log('Overall Completeness:', completeness.score);
console.log('Complete Fields:', completeness.completeFields);
console.log('Missing Fields:', completeness.missingFields);
console.log('Field Completeness:', completeness.completenessByField);
```

#### Accuracy
```typescript
const accuracy = qualityMetrics.accuracy;

console.log('Overall Accuracy:', accuracy.score);
console.log('Valid JMBGs:', accuracy.validJMBG);
console.log('Invalid JMBGs:', accuracy.invalidJMBG);
console.log('Validation Errors:', accuracy.validationErrors.length);
```

#### Consistency
```typescript
const consistency = qualityMetrics.consistency;

console.log('Format Consistency:', consistency.formatConsistency);
console.log('Script Consistency:', consistency.scriptConsistency);
console.log('Categorical Consistency:', consistency.categoricalConsistency);
console.log('Temporal Consistency:', consistency.temporalConsistency);
```

#### Timeliness
```typescript
const timeliness = qualityMetrics.timeliness;

console.log('Timeliness Score:', timeliness.score);
console.log('Data Age (days):', timeliness.dataAge);
console.log('Update Frequency:', timeliness.updateFrequency);
console.log('Recency Score:', timeliness.recencyScore);
```

#### Relevance
```typescript
const relevance = qualityMetrics.relevance;

console.log('Relevance Score:', relevance.score);
console.log('Title Relevance:', relevance.titleRelevance);
console.log('Description Relevance:', relevance.descriptionRelevance);
console.log('Keyword Relevance:', relevance.keywordRelevance);
console.log('Thematic Relevance:', relevance.thematicRelevance);
```

---

## Integration with data.gov.rs

### data.gov.rs API Integration

```typescript
// Configure data.gov.rs integration
const dataGovRsConfig = {
  baseUrl: 'https://data.gov.rs/api/3',
  apiKey: 'your-api-key',
  cacheEnabled: true,
  cacheTtl: 3600, // 1 hour
  rateLimiting: {
    requestsPerMinute: 60,
    burstLimit: 10
  }
};

// API client setup
const client = new DataGovRsClient(dataGovRsConfig);
```

### Dataset Publishing

```typescript
// Publish dataset to data.gov.rs
const publishResult = await client.publishDataset({
  metadata: enhancedMetadata,
  data: csvData,
  formats: ['csv', 'json'],
  themes: ['SOC', 'GOV'],
  license: 'CC-BY-4.0'
});

console.log('Published:', publishResult.datasetId);
console.log('URL:', publishResult.datasetUrl);
```

### Data Retrieval

```typescript
// Retrieve datasets
const datasets = await client.searchDatasets({
  query: 'population',
  themes: ['SOC'],
  formats: ['csv'],
  language: 'sr'
});

// Get specific dataset
const dataset = await client.getDataset('RS-ZRS-2024-001');
const data = await client.downloadDataset(dataset, 'csv');
```

### Metadata Synchronization

```typescript
// Sync metadata with data.gov.rs
const syncResult = await client.syncMetadata({
  localMetadata: metadata,
  datasetId: 'local-dataset-001',
  forceUpdate: false
});

if (syncResult.updated) {
  console.log('Metadata synchronized successfully');
}

// Batch synchronization
const batchSync = await client.batchSync(metadataArray);
console.log('Synced:', batchSync.syncedCount, 'datasets');
```

### Caching Strategy

```typescript
// Redis caching configuration
const cacheConfig = {
  host: 'localhost',
  port: 6379,
  keyPrefix: 'datagovrs:',
  ttl: 3600
};

const cacheManager = new DataGovRsCacheManager(cacheConfig);

// Cache dataset metadata
await cacheManager.setDataset('RS-ZRS-2024-001', metadata);

// Retrieve from cache
const cachedMetadata = await cacheManager.getDataset('RS-ZRS-2024-001');
if (cachedMetadata) {
  console.log('Loaded from cache');
} else {
  console.log('Cache miss, fetching from API');
}
```

---

## Best Practices

### Metadata Best Practices

#### Complete Metadata Structure
```typescript
const bestPracticeMetadata = {
  // Required fields
  identifier: 'unique-dataset-id',
  title: {
    sr: 'Српски наслов',
    'sr-Latn': 'Srpski naslov',
    en: 'English title'
  },
  description: {
    sr: 'Детаљан опис на српском',
    'sr-Latn': 'Detaljan opis na srpskom',
    en: 'Detailed description in English'
  },

  // Publisher information
  publisher: {
    name: {
      sr: 'Пуно име институције',
      en: 'Full institution name'
    },
    identifier: '123456789', // Valid PIB or registry number
    type: 'agency', // ministry, public-enterprise, etc.
    level: 'national', // national, regional, local
    contactInfo: {
      email: 'contact@institution.gov.rs',
      phone: '+381 11 123 456',
      address: 'Street 123, 11000 City'
    }
  },

  // Dates
  publicationDate: new Date('2024-01-01'),
  modificationDate: new Date('2024-06-01'),

  // Language support
  language: ['sr', 'sr-Latn', 'en'],

  // Classification
  theme: [{
    code: 'SOC', // Standard Serbian theme code
    name: {
      sr: 'Социјална заштита',
      'sr-Latn': 'Socijalna zaštita',
      en: 'Social Protection'
    },
    level: 1
  }],

  // Data formats
  format: [{
    format: 'text/csv',
    encoding: 'UTF-8',
    compression: 'gzip'
  }],

  // License
  license: {
    identifier: 'CC-BY-4.0',
    name: {
      sr: 'Кријејтив комонс - Ауторство 4.0',
      en: 'Creative Commons Attribution 4.0'
    },
    url: 'https://creativecommons.org/licenses/by/4.0/',
    attributionRequired: true,
    commercialUseAllowed: true,
    derivativeWorksAllowed: true
  },

  // Contact point
  contactPoint: {
    name: 'Data Department',
    email: 'data@institution.gov.rs',
    phone: '+381 11 987 654',
    address: 'Data Department, Institution, City'
  },

  // Distribution
  distribution: [{
    accessURL: 'https://data.institution.gov.rs/datasets/dataset-id',
    downloadURL: 'https://data.institution.gov.rs/files/dataset-id.csv',
    format: 'text/csv',
    size: 1024000,
    title: {
      sr: 'CSV формат',
      en: 'CSV format'
    }
  }]
};
```

#### Serbian Language Guidelines

1. **Always include Serbian** (either Cyrillic or Latin)
2. **Provide both scripts** when possible (sr and sr-Latn)
3. **Include English** for EU compatibility
4. **Use consistent terminology** across all metadata
5. **Translate institutional names** properly

```typescript
const goodExample = {
  title: {
    sr: 'Становништво Републике Србије 2023',
    'sr-Latn': 'Stanovništvo Republike Srbije 2023',
    en: 'Population of the Republic of Serbia 2023'
  },
  description: {
    sr: 'Подаци о броју становника по општинама за 2023. годину',
    'sr-Latn': 'Podaci o broju stanovnika po opštinama za 2023. godinu',
    en: 'Data on the number of inhabitants by municipalities for 2023'
  }
};
```

### Data Quality Best Practices

#### Data Structure
```typescript
const qualityBestPractices = {
  // Use Serbian field names when appropriate
  поля: {
    'имесни_подаци': 'personal_data',
    'јмбг': 'jmbg',
    'пиб': 'pib',
    'адреса': 'address',
    'општина': 'municipality'
  },

  // Data validation
  validation: {
    jmbg: '0101990710006', // Valid JMBG
    пиб: '101883300',     // Valid PIB
    датум: '01.01.1990.',  // Serbian date format
    број: '1.234,56'      // Serbian number format
  },

  // Consistency
  консистентност: {
    script: 'consistent_cyrillic_or_latin',
    terminology: 'standard_serbian_terms',
    format: 'uniform_date_and_number_formats'
  }
};
```

#### Performance Optimization
```typescript
const performanceBestPractices = {
  // Use chunking for large datasets
  chunking: {
    enabled: true,
    size: 10000,
    parallel: true
  },

  // Cache validation results
  caching: {
    enabled: true,
    ttl: 3600,
    strategy: 'redis'
  },

  // Lazy loading
  lazyLoading: {
    metadata: true,
    validation: false,
    recommendations: true
  }
};
```

### Integration Best Practices

#### Error Handling
```typescript
const errorHandlingBestPractices = {
  try {
    const result = await validateSerbianDataset(data, metadata);

    if (!result.complianceResult.isCompliant) {
      // Handle compliance failures
      logComplianceIssues(result.complianceResult);
      generateComplianceReport(result.complianceResult);
    }

    return result;
  } catch (error) {
    // Centralized error handling
    logError(error, {
      datasetId: metadata.identifier,
      timestamp: new Date(),
      context: 'serbian_compliance_validation'
    });

    throw new SerbianComplianceError('Validation failed', error);
  }
};
```

#### Monitoring and Logging
```typescript
const monitoringBestPractices = {
  // Log compliance metrics
  metrics: {
    overallScore: result.complianceResult.overallScore,
    categoryScores: result.complianceResult.categories.map(c => ({
      category: c.name,
      score: c.score
    })),
    qualityMetrics: result.qualityMetrics,
    processingTime: result.complianceResult.metadata.validationDuration
  },

  // Alert on critical issues
  alerts: {
    enabled: true,
    thresholds: {
      scoreBelow: 70,
      criticalErrors: 1,
      dataQualityBelow: 60
    }
  }
};
```

---

## Troubleshooting

### Common Issues and Solutions

#### Script Detection Issues

**Problem**: Mixed script detection returns incorrect results
```typescript
// Solution: Use explicit script specification
const options = {
  detectScript: true,
  defaultScript: 'cyrillic', // or 'latin'
  normalizeText: true
};
```

#### Date Parsing Issues

**Problem**: Serbian date formats not parsed correctly
```typescript
// Solution: Specify supported date patterns
const datePatterns = [
  /^\d{1,2}\.\d{1,2}\.\d{4}\.$/,     // 01.01.2024.
  /^\d{1,2}\. \d{1,2}\. \d{4}\. године$/, // 1. 1. 2024. године
  /^\d{4}-\d{2}-\d{2}$/                 // 2024-01-01
];

const options = {
  parseDates: true,
  datePatterns: datePatterns
};
```

#### JMBG Validation Issues

**Problem**: Valid JMBG marked as invalid
```typescript
// Solution: Check JMBG format and checksum
const jmbg = '0101990710006';

// Manual validation
const isValid = validateJMBG(jmbg);
console.log('Manual validation:', isValid);

// Debug JMBG components
const info = extractJMBGInfo(jmbg);
console.log('JMBG Info:', info);
```

#### Memory Issues with Large Datasets

**Problem**: Out of memory with large CSV files
```typescript
// Solution: Use streaming or chunked processing
const options = {
  chunkSize: 5000,
  maxRows: 100000,
  processingMethod: 'streaming',
  enableMemoryOptimization: true
};

// Process in chunks
for await (const chunk of streamCSV(largeFile, options)) {
  const result = await validateChunk(chunk);
  // Process chunk results
}
```

#### Performance Issues

**Problem**: Slow validation for complex datasets
```typescript
// Solution: Optimize configuration
const optimizedOptions = {
  validateSampleSize: 1000,      // Validate sample instead of full dataset
  enableCaching: true,             // Cache validation results
  parallelProcessing: true,       // Parallel category validation
  skipExpensiveChecks: false       // Don't skip critical validations
};
```

#### Encoding Issues

**Problem**: Serbian characters not displayed correctly
```typescript
// Solution: Specify encoding explicitly
const options = {
  encoding: 'utf-8',        // or 'windows-1250', 'iso-8859-2'
  detectEncoding: true,
  normalizeText: true,
  fixEncodingErrors: true
};

// Verify encoding
const detectedEncoding = detectEncoding(buffer);
console.log('Detected encoding:', detectedEncoding);
```

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
const debugOptions = {
  debugMode: true,
  logLevel: 'verbose', // 'error', 'warn', 'info', 'debug', 'verbose'
  logToFile: true,
  logFilePath: './serbian-compliance-debug.log'
};

const result = await validateSerbianDataset(data, metadata, debugOptions);
```

### Validation Error Reference

#### Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `MISSING_REQUIRED_FIELD` | Required metadata field missing | Add missing field to metadata |
| `INVALID_JMBG` | Invalid JMBG checksum or format | Verify JMBG format and checksum |
| `INVALID_PIB` | Invalid PIB checksum | Verify PIB format and checksum |
| `INVALID_DATE` | Invalid Serbian date format | Use dd.mm.yyyy. format |
| `SCRIPT_INCONSISTENCY` | Mixed script usage | Use consistent script (cyrillic or latin) |
| `ENCODING_ISSUE` | Character encoding problem | Ensure UTF-8 encoding |
| `FORMAT_INCOMPATIBLE` | Non-open data format | Use CSV, JSON, XML, or RDF |

#### Warning Codes

| Warning Code | Description | Recommendation |
|-------------|-------------|-------------|
| `MISSING_SERBIAN_LANGUAGE` | No Serbian language support | Add Serbian metadata |
| `INCOMPLETE_METADATA` | Incomplete metadata description | Enhance title and description |
| `LOW_QUALITY_SCORE` | Data quality below threshold | Improve data completeness and accuracy |
| `EU_HARMONIZATION_NEEDED` | Not EU-compliant | Add English metadata and EU themes |

---

## API Reference

### Core Classes

#### SerbianComplianceSuite
Main entry point for Serbian compliance functionality.

```typescript
class SerbianComplianceSuite {
  // Get singleton instance
  static getInstance(): SerbianComplianceSuite;

  // Full compliance workflow
  async fullComplianceWorkflow(data, metadata?, options?): Promise<ComplianceWorkflowResult>;

  // Quick compliance check
  async quickCheck(metadata): Promise<QuickComplianceResult>;

  // Data parsing
  async parseSerbianCSV(input, options?): Promise<SerbianParseResult>;
  async parseSerbianJSON(input, options?): Promise<SerbianParseResult>;

  // Data export
  exportToSerbianFormat(data, format, metadata?, options?): string;

  // Compliance reporting
  generateComplianceReport(result, qualityMetrics?): ComplianceReport;
}
```

#### SerbianDataStandardsCompliance
Core compliance validation engine.

```typescript
class SerbianDataStandardsCompliance {
  // Validate dataset compliance
  async validateDataset(data, metadata?, options?): Promise<ComplianceResult>;

  // Quick validation
  async quickCheck(metadata): Promise<QuickComplianceResult>;

  // Generate report
  generateComplianceReport(result): ComplianceReport;
}
```

### Parser Classes

#### SerbianCSVParser
High-performance Serbian CSV parser.

```typescript
class SerbianCSVParser {
  // Parse CSV data
  async parse<T>(input, options?): Promise<SerbianParseResult<T>>;

  // Convert to CSV
  stringify(data, options?): string;

  // Validate CSV
  validateCSV(data, options?): ValidationResult;

  // Utility methods
  detectEncoding(buffer): string;
  detectScript(text): ScriptType;
  validateJMBG(jmbg): boolean;
  validatePIB(pib): boolean;
  parseSerbianDate(dateString): Date;
  parseSerbianNumber(numberString): number;
}
```

### Utility Functions

```typescript
// Convenience functions
export const createSerbianComplianceSuite = (): SerbianComplianceSuite;
export const validateSerbianDataset = (data, metadata?, options?) => Promise<ComplianceWorkflowResult>;
export const parseSerbianData = (input, options?) => Promise<SerbianParseResult>;
export const exportSerbianData = (data, format, metadata?, options?) => string;
```

### Type Definitions

#### Key Interfaces

```typescript
interface SerbianMetadataSchema {
  identifier: string;
  title: SerbianLocalizedString;
  description: SerbianLocalizedString;
  publisher: GovernmentInstitution;
  // ... other fields
}

interface SerbianLocalizedString {
  sr?: string;        // Cyrillic
  'sr-Latn'?: string;  // Latin
  en?: string;         // English
}

interface ComplianceResult {
  id: string;
  timestamp: Date;
  datasetId: string;
  overallScore: number;
  isCompliant: boolean;
  categories: ComplianceCategory[];
  recommendations: Recommendation[];
  validationErrors: ValidationError[];
  metadata: ComplianceMetadata;
}

interface SerbianDataQuality {
  overallScore: number;
  completeness: CompletenessMetric;
  accuracy: AccuracyMetric;
  consistency: ConsistencyMetric;
  timeliness: TimelinessMetric;
  relevance: RelevanceMetric;
  serbianSpecificity: SerbianSpecificityMetric;
}
```

---

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/vizualni-admin.git
cd vizualni-admin

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Adding New Serbian Features

1. **Implement Serbian Validation**
   - Add Serbian-specific validation logic
   - Include comprehensive tests
   - Document use cases

2. **Extend Metadata Schema**
   - Add new Serbian-specific fields
   - Update adapters
   - Maintain backward compatibility

3. **Quality Metrics**
   - Add Serbian quality metrics
   - Implement scoring algorithms
   - Provide recommendations

### Testing Serbian Features

```typescript
// Test Serbian-specific functionality
describe('Serbian JMBG Validation', () => {
  it('should validate correct JMBG', () => {
    const validJMBG = '0101990710006';
    expect(validateJMBG(validJMBG)).toBe(true);
  });

  it('should reject invalid JMBG', () => {
    const invalidJMBG = '123456789012';
    expect(validateJMBG(invalidJMBG)).toBe(false);
  });
});
```

---

## Version History

### Version 1.0.0 (Current)
- Initial release
- Full Serbian government compliance support
- JMBG and PIB validation
- Serbian metadata schemas
- data.gov.rs integration
- Comprehensive quality metrics

### Planned Features
- Enhanced data.gov.rs API client
- Real-time compliance monitoring
- Advanced analytics dashboard
- Serbian localization improvements
- Performance optimizations

---

## Support and Resources

### Documentation
- [API Reference](./API_REFERENCE.md)
- [Examples](./examples/)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [FAQ](./FAQ.md)

### Contact
- **Email**: compliance@vizualni-admin.com
- **Issues**: [GitHub Issues](https://github.com/your-org/vizualni-admin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/vizualni-admin/discussions)

### Serbian Government Resources
- [data.gov.rs](https://data.gov.rs/) - Official Serbian Open Data Portal
- [Uprava za elektronsko upravljanje](https://euprava.gov.rs/) - e-Government Office
- [Republički zavod za statistiku](https://www.stat.gov.rs/) - Republic Statistical Office
- [Zakon o slobodnom pristupu informacijama](https://www.parlament.gov.rs/acts) - Official legislation

---

**Note**: This implementation follows Serbian government regulations and EU open data directives to ensure full compliance with Serbian open data requirements.