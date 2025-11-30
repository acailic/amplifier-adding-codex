import { describe, it, expect, beforeEach } from 'vitest';
import { SerbianDataStandardsCompliance } from '../core';
import { SerbianMetadataSchema } from '../models';

describe('SerbianDataStandardsCompliance', () => {
  let compliance: SerbianDataStandardsCompliance;

  beforeEach(() => {
    compliance = new SerbianDataStandardsCompliance();
  });

  describe('validateDataset', () => {
    it('should validate a compliant Serbian dataset', async () => {
      const data = [
        {
          ime: 'Петар Петровић',
          prezime: 'Петровић',
          jmbg: '0101990710006',
          pib: '123456789',
          datum_rodjenja: '01.01.1990.',
          adresa: 'Улица Војводе Мишића 15, 11000 Београд'
        }
      ];

      const metadata: Partial<SerbianMetadataSchema> = {
        identifier: 'test-dataset-001',
        title: {
          sr: 'Тест подаци о грађанима',
          'sr-Latn': 'Test podaci o građanima',
          en: 'Test citizen data'
        },
        description: {
          sr: 'Тест подаци о грађанима Републике Србије',
          'sr-Latn': 'Test podaci o građanima Republike Srbije',
          en: 'Test data about citizens of the Republic of Serbia'
        },
        publisher: {
          name: { sr: 'Републички завод за статистику', en: 'Republic Statistical Office' },
          identifier: '52555234',
          type: 'agency',
          level: 'national',
          contactInfo: {
            email: 'stat@stat.gov.rs',
            phone: '+381 11 2412 876',
            address: 'Милана Ракића 5, Београд'
          }
        },
        publicationDate: new Date('2024-01-01'),
        modificationDate: new Date('2024-01-15'),
        language: ['sr', 'sr-Latn', 'en'],
        theme: [{
          code: 'EDU',
          name: { sr: 'Образовање', 'sr-Latn': 'Obrazovanje', en: 'Education' },
          level: 1
        }],
        format: [{
          format: 'text/csv',
          encoding: 'UTF-8'
        }],
        license: {
          identifier: 'CC-BY-4.0',
          name: { sr: 'Кријејтив комонс - Ауторство 4.0', en: 'Creative Commons Attribution 4.0' },
          url: 'https://creativecommons.org/licenses/by/4.0/',
          attributionRequired: true,
          commercialUseAllowed: true,
          derivativeWorksAllowed: true
        },
        contactPoint: {
          name: 'Департман за податке',
          email: 'data@stat.gov.rs',
          phone: '+381 11 2412 888',
          address: 'Милана Ракића 5, Београд'
        },
        distribution: [{
          accessURL: 'https://data.gov.rs/datasets/test-dataset-001',
          downloadURL: 'https://data.gov.rs/datasets/test-dataset-001.csv',
          format: 'text/csv',
          size: 1024000
        }]
      };

      const result = await compliance.validateDataset(data, metadata);

      expect(result.overallScore).toBeGreaterThan(80);
      expect(result.isCompliant).toBe(true);
      expect(result.categories).toHaveLength(10);
      expect(result.recommendations).toBeDefined();
      expect(result.validationErrors).toBeDefined();
    });

    it('should identify non-compliant datasets', async () => {
      const data = [
        {
          name: 'Invalid Data',
          jmbg: '123456789012', // Invalid JMBG
          date: 'invalid-date'
        }
      ];

      const metadata: Partial<SerbianMetadataSchema> = {
        identifier: 'invalid-dataset',
        title: { en: 'Invalid Dataset' },
        description: { en: 'This dataset is not compliant' },
        publisher: {
          name: { en: 'Unknown Publisher' },
          identifier: '123',
          type: 'agency',
          level: 'national',
          contactInfo: { email: 'test@example.com' }
        },
        publicationDate: new Date(),
        language: ['en']
      };

      const result = await compliance.validateDataset(data, metadata);

      expect(result.overallScore).toBeLessThan(80);
      expect(result.isCompliant).toBe(false);
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });

    it('should handle empty datasets', async () => {
      const data: any[] = [];
      const metadata: Partial<SerbianMetadataSchema> = {
        identifier: 'empty-dataset',
        title: { sr: 'Празан скуп података' },
        description: { sr: 'Овај скуп података је празан' },
        publisher: {
          name: { sr: 'Тест организација' },
          identifier: '123456',
          type: 'agency',
          level: 'national',
          contactInfo: { email: 'test@example.com' }
        },
        publicationDate: new Date(),
        language: ['sr']
      };

      const result = await compliance.validateDataset(data, metadata);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.datasetId).toBe('empty-dataset');
      expect(result.categories).toBeDefined();
    });

    it('should handle datasets with missing metadata', async () => {
      const data = [
        { field1: 'value1', field2: 'value2' }
      ];

      const result = await compliance.validateDataset(data);

      expect(result.overallScore).toBeLessThan(50);
      expect(result.isCompliant).toBe(false);
      expect(result.validationErrors.some(e => e.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
    });
  });

  describe('quickCheck', () => {
    it('should perform quick metadata validation', async () => {
      const metadata: Partial<SerbianMetadataSchema> = {
        identifier: 'quick-test-001',
        title: { sr: 'Брзи тест' },
        description: { sr: 'Ово је брзи тест' },
        publisher: {
          name: { sr: 'Тест организација' },
          identifier: '123456',
          type: 'agency',
          level: 'national',
          contactInfo: { email: 'test@example.com' }
        },
        publicationDate: new Date(),
        language: ['sr', 'en']
      };

      const result = await compliance.quickCheck(metadata);

      expect(result.compliant).toBe(true);
      expect(result.score).toBeGreaterThan(70);
      expect(result.missingFields).toHaveLength(0);
      expect(result.recommendations).toBeDefined();
      expect(result.estimatedFullValidationTime).toBeGreaterThan(0);
    });

    it('should identify missing required fields', async () => {
      const metadata: Partial<SerbianMetadataSchema> = {
        title: { en: 'Incomplete Metadata' }
      };

      const result = await compliance.quickCheck(metadata);

      expect(result.compliant).toBe(false);
      expect(result.score).toBeLessThan(70);
      expect(result.missingFields.length).toBeGreaterThan(0);
      expect(result.recommendations).toContain('Add unique dataset identifier');
    });

    it('should recommend Serbian language support', async () => {
      const metadata: Partial<SerbianMetadataSchema> = {
        identifier: 'english-only',
        title: { en: 'English Only Dataset' },
        description: { en: 'This dataset only has English metadata' },
        publisher: {
          name: { en: 'Test Organization' },
          identifier: '123456',
          type: 'agency',
          level: 'national',
          contactInfo: { email: 'test@example.com' }
        },
        publicationDate: new Date(),
        language: ['en']
      };

      const result = await compliance.quickCheck(metadata);

      expect(result.recommendations).toContain('Include Serbian language (sr or sr-Latn)');
    });
  });

  describe('generateComplianceReport', () => {
    it('should generate comprehensive compliance report', () => {
      const complianceResult = {
        id: 'test-report-001',
        timestamp: new Date(),
        datasetId: 'test-dataset',
        overallScore: 85,
        isCompliant: true,
        categories: [
          {
            name: 'metadata-standards' as const,
            score: 90,
            weight: 0.15,
            status: 'compliant' as const,
            requirements: []
          }
        ],
        recommendations: [
          {
            id: 'test-recommendation',
            type: 'minor' as const,
            category: 'quality-assurance' as const,
            title: 'Test Recommendation',
            description: 'This is a test recommendation',
            actionSteps: ['Step 1', 'Step 2'],
            estimatedImpact: 10,
            implementationComplexity: 'low' as const
          }
        ],
        validationErrors: [],
        metadata: {
          validatorVersion: '1.0.0',
          standardsVersion: '2024.1',
          validationDuration: 1000,
          datasetSize: 100,
          processingMethod: 'full' as const
        }
      };

      const report = compliance.generateComplianceReport(complianceResult);

      expect(report.title).toBeDefined();
      expect(report.title.sr).toBeDefined();
      expect(report.generated).toBeInstanceOf(Date);
      expect(report.dataset).toBeDefined();
      expect(report.dataset.overallScore).toBe(85);
      expect(report.dataset.status).toBe('Compliant');
      expect(report.legalFramework).toBeDefined();
      expect(report.nextSteps).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle malformed data gracefully', async () => {
      const malformedData = [
        { field1: null, field2: undefined, field3: '' },
        { field1: 'test', field2: 123, field3: [1, 2, 3] }
      ];

      const metadata: Partial<SerbianMetadataSchema> = {
        identifier: 'malformed-test',
        title: { sr: 'Тест malformed података' },
        description: { sr: 'Ово је тест са malformed подацима' },
        publisher: {
          name: { sr: 'Тест организација' },
          identifier: '123456',
          type: 'agency',
          level: 'national',
          contactInfo: { email: 'test@example.com' }
        },
        publicationDate: new Date(),
        language: ['sr']
      };

      const result = await compliance.validateDataset(malformedData, metadata);

      expect(result).toBeDefined();
      expect(result.datasetId).toBe('malformed-test');
      expect(result.categories).toBeDefined();
      expect(result.metadata.datasetSize).toBe(2);
    });

    it('should handle circular references in metadata', async () => {
      const circularMetadata: any = {
        identifier: 'circular-test',
        title: { sr: 'Тест кружних референци' }
      };

      // Create circular reference
      circularMetadata.self = circularMetadata;

      const result = await compliance.validateDataset([], circularMetadata);

      expect(result).toBeDefined();
      expect(result.datasetId).toBe('circular-test');
    });
  });

  describe('performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeData = Array.from({ length: 1000 }, (_, index) => ({
        id: index + 1,
        name: `Запис ${index + 1}`,
        value: Math.random() * 100,
        date: new Date(2024, 0, (index % 365) + 1).toISOString()
      }));

      const metadata: Partial<SerbianMetadataSchema> = {
        identifier: 'large-dataset-test',
        title: { sr: 'Велики скуп података' },
        description: { sr: 'Ово је велики скуп података за перформанс тест' },
        publisher: {
          name: { sr: 'Тест организација' },
          identifier: '123456',
          type: 'agency',
          level: 'national',
          contactInfo: { email: 'test@example.com' }
        },
        publicationDate: new Date(),
        language: ['sr']
      };

      const startTime = performance.now();
      const result = await compliance.validateDataset(largeData, metadata);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(result.metadata.datasetSize).toBe(1000);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete in less than 10 seconds
    });
  });
});