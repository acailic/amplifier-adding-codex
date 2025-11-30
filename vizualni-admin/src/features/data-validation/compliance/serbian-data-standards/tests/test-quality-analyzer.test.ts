import { describe, it, expect, beforeEach } from 'vitest';
import { SerbianQualityAnalyzer } from '../quality-analyzer';
import { SerbianMetadataSchema } from '../models';
import { ValidationContext } from '../core';

describe('SerbianQualityAnalyzer', () => {
  let analyzer: SerbianQualityAnalyzer;

  beforeEach(() => {
    analyzer = new SerbianQualityAnalyzer();
  });

  describe('validate', () => {
    it('should validate high-quality Serbian dataset', async () => {
      const data = [
        {
          ид: 1,
          име: 'Петар',
          презиме: 'Петровић',
          јмбг: '0101990710006',
          пиб: '101883300',
          датум_рођења: '01.01.1990.',
          адреса: 'Улица Војводе Мишића 15, 11000 Београд',
          телефон: '011123456',
          општина: 'Београд',
          iznos: 12345.67,
          datum: new Date('2024-01-01')
        },
        {
          ид: 2,
          име: 'Марина',
          презиме: 'Јовановић',
          јмбг: '1505985710006',
          пиб: '40106636',
          датум_рођења: '15.05.1985.',
          адреса: 'Булевар ослобођења 20, 21000 Нови Сад',
          телефон: '021123456',
          општина: 'Нови Сад',
          iznos: 98765.43,
          datum: new Date('2024-01-02')
        }
      ];

      const metadata: Partial<SerbianMetadataSchema> = {
        identifier: 'quality-test-001',
        title: {
          sr: 'Квалитетни тест подаци',
          'sr-Latn': 'Kvalitetni test podaci',
          en: 'Quality Test Data'
        },
        description: {
          sr: 'Ово је висококвалитетан скуп података српске владе',
          'sr-Latn': 'Ovo je visoko-kvalitetan skup podataka srpske vlade',
          en: 'This is a high-quality dataset of Serbian government'
        },
        keywords: [
          { sr: 'подаци', en: 'data' },
          { sr: 'влада', en: 'government' },
          { sr: 'квалитет', en: 'quality' },
          { sr: 'тест', en: 'test' }
        ],
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
        modificationDate: new Date('2024-06-01'),
        language: ['sr', 'sr-Latn', 'en'],
        theme: [{
          code: 'SOC',
          name: { sr: 'Социјална заштита', 'sr-Latn': 'Socijalna zaštita', en: 'Social Protection' },
          level: 1
        }]
      };

      const context: ValidationContext = {
        data,
        metadata,
        config: {},
        datasetId: 'quality-test-001'
      };

      const result = await analyzer.validate(context);

      expect(result.category.score).toBeGreaterThan(80);
      expect(result.category.status).toBe('compliant');
      expect(result.category.requirements.length).toBeGreaterThan(0);
    });

    it('should identify quality issues in problematic dataset', async () => {
      const data = [
        {
          // Missing required fields
          name: 'Invalid',
          jmbg: '123456789012', // Invalid JMBG
          pib: '123456789', // Invalid PIB
          date: 'invalid-date', // Invalid date
          amount: 'invalid-number' // Invalid number format
        },
        {
          // Empty record
        },
        {
          id: 3,
          firstName: 'Mixed',
          lastName: 'Script',
          jmbg: '2012995710005',
          address: '123 Street' // Not Serbian address format
        }
      ];

      const metadata: Partial<SerbianMetadataSchema> = {
        identifier: 'low-quality-test',
        title: { en: 'Low Quality Dataset' },
        description: { en: 'This dataset has quality issues' },
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

      const context: ValidationContext = {
        data,
        metadata,
        config: {},
        datasetId: 'low-quality-test'
      };

      const result = await analyzer.validate(context);

      expect(result.category.score).toBeLessThan(70);
      expect(result.category.status).toBe('non-compliant');
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle empty dataset', async () => {
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

      const context: ValidationContext = {
        data,
        metadata,
        config: {},
        datasetId: 'empty-dataset'
      };

      const result = await analyzer.validate(context);

      expect(result.category.score).toBe(0);
      expect(result.category.status).toBe('non-compliant');
    });
  });

  describe('calculateSerbianDataQuality', () => {
    it('should calculate comprehensive quality metrics', async () => {
      const data = [
        {
          ид: 1,
          име: 'Петар',
          презиме: 'Петровић',
          јмбг: '0101990710006',
          пиб: '101883300',
          датум_рођења: '01.01.1990.',
          адреса: 'Улица Војводе Мишића 15, Београд',
          износ: '1.234,56'
        },
        {
          ид: 2,
          име: 'Марина',
          презиме: 'Јовановић',
          јмбг: '1505985710006',
          пиб: '40106636',
          датум_рођења: '15.05.1985.',
          адреса: 'Булевар ослобођења, Нови Сад',
          износ: '98.765,43'
        },
        {
          ид: 3,
          име: 'Милош',
          презиме: 'Милановић',
          јмбг: '2012995710005',
          пиб: null, // Missing PIB
          датум_рођења: '20.12.1975.',
          адреса: null, // Missing address
          износ: '543.210,78'
        }
      ];

      const metadata: Partial<SerbianMetadataSchema> = {
        identifier: 'quality-metrics-test',
        title: {
          sr: 'Тест квалитетних метрика',
          en: 'Quality Metrics Test'
        },
        description: {
          sr: 'Тест за израчунавање квалитетних метрика',
          en: 'Test for calculating quality metrics'
        },
        keywords: [
          { sr: 'квалитет', en: 'quality' },
          { sr: 'метрике', en: 'metrics' }
        ],
        publicationDate: new Date('2024-01-01'),
        modificationDate: new Date('2024-06-01'),
        language: ['sr', 'en']
      };

      const qualityMetrics = await analyzer.calculateSerbianDataQuality(data, metadata);

      expect(qualityMetrics.overallScore).toBeGreaterThan(0);
      expect(qualityMetrics.completeness).toBeDefined();
      expect(qualityMetrics.accuracy).toBeDefined();
      expect(qualityMetrics.consistency).toBeDefined();
      expect(qualityMetrics.timeliness).toBeDefined();
      expect(qualityMetrics.relevance).toBeDefined();
      expect(qualityMetrics.serbianSpecificity).toBeDefined();

      // Check specific metrics
      expect(qualityMetrics.completeness.score).toBeLessThan(100); // Has missing values
      expect(qualityMetrics.accuracy.validJMBG).toBe(3); // All JMBGs should be valid
      expect(qualityMetrics.accuracy.validPIB).toBe(2); // 2 out of 3 PIBs valid
      expect(qualityMetrics.serbianSpecificity.scriptConsistency).toBeGreaterThan(0.8); // High script consistency
      expect(qualityMetrics.serbianSpecificity.jmbgValidation).toBe(100); // All JMBGs valid
    });

    it('should handle mixed script data', async () => {
      const data = [
        {
          // Cyrillic
          име: 'Петар',
          град: 'Београд'
        },
        {
          // Latin
          ime: 'Marina',
          grad: 'Novi Sad'
        },
        {
          // Mixed
          ime: 'Милош Milosevic',
          grad: 'Kragujevac'
        }
      ];

      const qualityMetrics = await analyzer.calculateSerbianDataQuality(data);

      expect(qualityMetrics.serbianSpecificity.scriptConsistency).toBeLessThan(0.9); // Mixed script
      expect(qualityMetrics.serbianSpecificity.languageAccuracy).toBeGreaterThan(0);
    });

    it('should analyze Serbian institutional accuracy', async () => {
      const data = [
        {
          institucija: 'Републички завод за статистику',
          ministarstvo: 'Министарство просвете'
        },
        {
          institucija: 'Poreska uprava',
          agencija: 'Agencija za zaštitu životne sredine'
        }
      ];

      const qualityMetrics = await analyzer.calculateSerbianDataQuality(data);

      expect(qualityMetrics.serbianSpecificity.institutionalAccuracy).toBeGreaterThan(0.5);
    });

    it('should validate Serbian address patterns', async () => {
      const data = [
        {
          adresa: 'Улица Војводе Мишића 15, 11000 Београд' // Valid Serbian address
        },
        {
          adresa: 'Булевар револуције 20, 21000 Нови Сад' // Valid Serbian address
        },
        {
          adresa: '123 Main Street, City' // Invalid Serbian address
        }
      ];

      const qualityMetrics = await analyzer.calculateSerbianDataQuality(data);

      expect(qualityMetrics.serbianSpecificity.addressStandardization).toBeGreaterThan(0.3);
      expect(qualityMetrics.serbianSpecificity.addressStandardization).toBeLessThan(1.0);
    });
  });

  describe('generateQualityRecommendations', () => {
    it('should generate recommendations for low completeness', async () => {
      const qualityMetrics = {
        overallScore: 60,
        completeness: {
          score: 40,
          totalFields: 10,
          completeFields: 4,
          missingFields: 6,
          completenessByField: {
            field1: 100,
            field2: 0,
            field3: 50
          }
        },
        accuracy: { score: 90, validJMBG: 5, invalidJMBG: 0, validPIB: 3, invalidPIB: 0, validDates: 8, invalidDates: 0, validNumbers: 10, invalidNumbers: 0, validationErrors: [] },
        consistency: { score: 85, formatConsistency: 90, scriptConsistency: 80, categoricalConsistency: 85, temporalConsistency: 85, inconsistencyErrors: [] },
        timeliness: { score: 75, dataAge: 365, updateFrequency: 1, recencyScore: 75, lastUpdated: new Date('2023-01-01') },
        relevance: { score: 70, titleRelevance: 80, descriptionRelevance: 60, keywordRelevance: 80, thematicRelevance: 60, dataUtility: 70 },
        serbianSpecificity: {
          scriptConsistency: 80,
          languageAccuracy: 85,
          territorialCoverage: 90,
          institutionalAccuracy: 75,
          dateFormatting: 95,
          numberFormatting: 100,
          addressStandardization: 60,
          jmbgValidation: 100,
          pibValidation: 95,
          score: 80
        }
      };

      const recommendations = analyzer.generateQualityRecommendations(qualityMetrics);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('major');
      expect(recommendations[0].category).toBe('quality-assurance');
      expect(recommendations[0].title).toBe('Improve Data Completeness');
    });

    it('should generate Serbian specificity recommendations', async () => {
      const qualityMetrics = {
        overallScore: 65,
        completeness: { score: 80, totalFields: 5, completeFields: 4, missingFields: 1, completenessByField: {} },
        accuracy: { score: 90, validJMBG: 5, invalidJMBG: 0, validPIB: 3, invalidPIB: 0, validDates: 8, invalidDates: 0, validNumbers: 10, invalidNumbers: 0, validationErrors: [] },
        consistency: { score: 85, formatConsistency: 90, scriptConsistency: 80, categoricalConsistency: 85, temporalConsistency: 85, inconsistencyErrors: [] },
        timeliness: { score: 75, dataAge: 365, updateFrequency: 1, recencyScore: 75, lastUpdated: new Date('2023-01-01') },
        relevance: { score: 70, titleRelevance: 80, descriptionRelevance: 60, keywordRelevance: 80, thematicRelevance: 60, dataUtility: 70 },
        serbianSpecificity: {
          scriptConsistency: 40, // Low script consistency
          languageAccuracy: 60,
          territorialCoverage: 50,
          institutionalAccuracy: 45,
          dateFormatting: 95,
          numberFormatting: 100,
          addressStandardization: 30,
          jmbgValidation: 100,
          pibValidation: 95,
          score: 60
        }
      };

      const recommendations = analyzer.generateQualityRecommendations(qualityMetrics);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('major');
      expect(recommendations[0].category).toBe('quality-assurance');
      expect(recommendations[0].title).toBe('Enhance Serbian Data Specificity');
    });

    it('should generate accuracy recommendations', async () => {
      const qualityMetrics = {
        overallScore: 70,
        completeness: { score: 80, totalFields: 5, completeFields: 4, missingFields: 1, completenessByField: {} },
        accuracy: { score: 60, validJMBG: 3, invalidJMBG: 2, validPIB: 2, invalidPIB: 1, validDates: 6, invalidDates: 2, validNumbers: 8, invalidNumbers: 2, validationErrors: [] },
        consistency: { score: 85, formatConsistency: 90, scriptConsistency: 80, categoricalConsistency: 85, temporalConsistency: 85, inconsistencyErrors: [] },
        timeliness: { score: 75, dataAge: 365, updateFrequency: 1, recencyScore: 75, lastUpdated: new Date('2023-01-01') },
        relevance: { score: 70, titleRelevance: 80, descriptionRelevance: 60, keywordRelevance: 80, thematicRelevance: 60, dataUtility: 70 },
        serbianSpecificity: {
          scriptConsistency: 80,
          languageAccuracy: 85,
          territorialCoverage: 90,
          institutionalAccuracy: 75,
          dateFormatting: 60,
          numberFormatting: 40,
          addressStandardization: 70,
          jmbgValidation: 60,
          pibValidation: 66,
          score: 70
        }
      };

      const recommendations = analyzer.generateQualityRecommendations(qualityMetrics);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('major');
      expect(recommendations[0].title).toBe('Improve Data Accuracy');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed data gracefully', async () => {
      const malformedData = [
        { field1: null, field2: undefined, field3: '' },
        { field1: 123, field2: 'text', field3: [1, 2, 3] },
        { field1: true, field2: false, field3: {} }
      ];

      const qualityMetrics = await analyzer.calculateSerbianDataQuality(malformedData);

      expect(qualityMetrics.overallScore).toBeDefined();
      expect(qualityMetrics.overallScore).toBeGreaterThanOrEqual(0);
      expect(qualityMetrics.completeness).toBeDefined();
    });

    it('should handle very large datasets efficiently', async () => {
      const largeData = Array.from({ length: 1000 }, (_, index) => ({
        ид: index + 1,
        име: `Име${index + 1}`,
        презиме: `Презиме${index + 1}`,
        јмбг: `0101${String(index + 1).padStart(9, '0')}6`, // Some will be invalid
        износ: Math.random() * 100000
      }));

      const startTime = performance.now();
      const qualityMetrics = await analyzer.calculateSerbianDataQuality(largeData);
      const endTime = performance.now();

      expect(qualityMetrics.overallScore).toBeDefined();
      expect(qualityMetrics.completeness.totalFields).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in less than 5 seconds
    });

    it('should handle datasets with mixed data types', async () => {
      const mixedData = [
        {
          текст: 'Текст податак',
          број: 123,
          датум: '01.01.2024.',
          булеан: true,
          нулл: null,
          недефинисано: undefined,
          низ: [1, 2, 3],
          објекат: { кључ: 'вредност' }
        }
      ];

      const qualityMetrics = await analyzer.calculateSerbianDataQuality(mixedData);

      expect(qualityMetrics.overallScore).toBeDefined();
      expect(qualityMetrics.completeness).toBeDefined();
    });
  });
});