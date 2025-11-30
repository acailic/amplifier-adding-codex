import { describe, it, expect, beforeEach } from 'vitest';
import { SerbianMetadataAdapter } from '../metadata-adapter';
import { SerbianMetadataSchema } from '../models';

describe('SerbianMetadataAdapter', () => {
  let adapter: SerbianMetadataAdapter;

  beforeEach(() => {
    adapter = new SerbianMetadataAdapter();
  });

  describe('adaptFromDublinCore', () => {
    it('should adapt Dublin Core metadata to Serbian standards', () => {
      const dublinCore = {
        identifier: 'test-001',
        title: 'Test Dataset',
        description: 'This is a test dataset',
        publisher: 'Test Organization',
        date: '2024-01-01',
        language: 'sr',
        rights: 'CC-BY-4.0'
      };

      const result = adapter.adaptFromDublinCore(dublinCore);

      expect(result.identifier).toBe('test-001');
      expect(result.title).toEqual({ sr: 'Test Dataset' });
      expect(result.description).toEqual({ sr: 'This is a test dataset' });
      expect(result.language).toEqual(['sr']);
      expect(result.license?.identifier).toBe('CC-BY-4.0');
    });

    it('should handle complex Dublin Core metadata', () => {
      const dublinCore = {
        identifier: 'complex-dataset',
        'dc:title': {
          'sr': 'Комплексан скуп података',
          'en': 'Complex Dataset'
        },
        'dc:description': {
          'sr': 'Ово је комплексан скуп података српске владе',
          'en': 'This is a complex dataset of Serbian government'
        },
        'dc:publisher': {
          'foaf:name': {
            'sr': 'Министарство просвете',
            'en': 'Ministry of Education'
          },
          'dct:identifier': '123456789'
        },
        'dct:issued': '2024-01-01',
        'dct:modified': '2024-06-01',
        'dc:language': ['sr', 'en'],
        'dc:subject': 'education;schools;students'
      };

      const result = adapter.adaptFromDublinCore(dublinCore);

      expect(result.identifier).toBe('complex-dataset');
      expect(result.title).toEqual({
        sr: 'Комплексан скуп података',
        en: 'Complex Dataset'
      });
      expect(result.description).toEqual({
        sr: 'Ово је комплексан скуп података српске владе',
        en: 'This is a complex dataset of Serbian government'
      });
      expect(result.publisher?.name).toEqual({
        sr: 'Министарство просвете',
        en: 'Ministry of Education'
      });
      expect(result.language).toEqual(['sr', 'en']);
      expect(result.keywords).toHaveLength(3);
    });
  });

  describe('adaptFromDCAT', () => {
    it('should adapt DCAT metadata to Serbian standards', () => {
      const dcat = {
        '@context': 'https://www.w3.org/ns/dcat',
        'dct:identifier': 'dcat-test',
        'dct:title': {
          'sr': 'DCAT тест подаци',
          'en': 'DCAT Test Data'
        },
        'dct:description': {
          'sr': 'Тест подаци у DCAT формату',
          'en': 'Test data in DCAT format'
        },
        'dct:publisher': {
          '@type': 'foaf:Organization',
          'foaf:name': {
            'sr': 'Тест агенција',
            'en': 'Test Agency'
          }
        },
        'dct:issued': '2024-01-01',
        'dct:modified': '2024-06-01',
        'dct:language': ['sr', 'en'],
        'dcat:keyword': ['test', 'sample', 'демонстрација'],
        'dct:theme': [{
          'skos:notation': 'EDU',
          'skos:prefLabel': {
            'sr': 'Образовање',
            'en': 'Education'
          }
        }],
        'dcat:distribution': [{
          'dcat:accessURL': 'https://example.com/data.csv',
          'dcat:downloadURL': 'https://example.com/download/data.csv',
          'dct:format': { '@id': 'http://publications.europa.eu/resource/authority/file-type/CSV' },
          'dcat:byteSize': 1024000
        }],
        'dct:license': {
          'dct:identifier': 'CC-BY-4.0',
          'dct:title': {
            'sr': 'Кријејтив комонс - Ауторство 4.0',
            'en': 'Creative Commons Attribution 4.0'
          }
        }
      };

      const result = adapter.adaptFromDCAT(dcat);

      expect(result.identifier).toBe('dcat-test');
      expect(result.title).toEqual({
        sr: 'DCAT тест подаци',
        en: 'DCAT Test Data'
      });
      expect(result.language).toEqual(['sr', 'en']);
      expect(result.keywords).toHaveLength(3);
      expect(result.theme).toHaveLength(1);
      expect(result.theme[0].code).toBe('EDU');
      expect(result.distribution).toHaveLength(1);
      expect(result.license?.identifier).toBe('CC-BY-4.0');
    });

    it('should handle DCAT with spatial and temporal coverage', () => {
      const dcat = {
        'dct:identifier': 'spatial-temporal-test',
        'dct:title': {
          'sr': 'Просторно-временски тест',
          'en': 'Spatial-Temporal Test'
        },
        'dct:spatial': {
          'skos:prefLabel': {
            'sr': 'Република Србија',
            'en': 'Republic of Serbia'
          }
        },
        'dct:temporal': {
          'schema:startDate': '2020-01-01',
          'schema:endDate': '2024-12-31'
        }
      };

      const result = adapter.adaptFromDCAT(dcat);

      expect(result.identifier).toBe('spatial-temporal-test');
      expect(result.spatial).toEqual({
        sr: 'Република Србија',
        en: 'Republic of Serbia'
      });
      expect(result.temporal).toEqual({
        startDate: '2020-01-01',
        endDate: '2024-12-31'
      });
    });
  });

  describe('adaptToDublinCore', () => {
    it('should convert Serbian metadata to Dublin Core', () => {
      const serbianMetadata: Partial<SerbianMetadataSchema> = {
        identifier: 'serbian-test',
        title: {
          sr: 'Српски тест подаци',
          'sr-Latn': 'Srpski test podaci',
          en: 'Serbian Test Data'
        },
        description: {
          sr: 'Ово су српски тест подаци',
          'sr-Latn': 'Ovo su srpski test podaci',
          en: 'This is Serbian test data'
        },
        publisher: {
          name: {
            sr: 'Српска организација',
            en: 'Serbian Organization'
          },
          identifier: '123456789'
        },
        publicationDate: new Date('2024-01-01'),
        modificationDate: new Date('2024-06-01'),
        language: ['sr', 'sr-Latn', 'en'],
        theme: [{
          code: 'GOV',
          name: {
            sr: 'Влада',
            'sr-Latn': 'Vlada',
            en: 'Government'
          },
          level: 1
        }],
        format: [{
          format: 'text/csv',
          encoding: 'UTF-8'
        }],
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
        contactPoint: {
          name: 'Контакт особа',
          email: 'contact@example.com'
        }
      };

      const result = adapter.adaptToDublinCore(serbianMetadata);

      expect(result['dc:identifier']).toBe('serbian-test');
      expect(result['dc:title']).toBe('Српски тест подаци');
      expect(result['dc:description']).toBe('Ово су српски тест подаци');
      expect(result['dc:publisher']).toBe('Српска организација');
      expect(result['dc:date']).toBe('01.01.2024');
      expect(result['dc:language']).toBe('sr, sr-Latn, en');
      expect(result['dc:type']).toBe('GOV');
      expect(result['dc:format']).toBe('text/csv');
      expect(result['dc:rights']).toBe('Кријејтив комонс - Ауторство 4.0');
      expect(result['dc:creator']).toBe('Контакт особа');
    });
  });

  describe('adaptToDCAT', () => {
    it('should convert Serbian metadata to DCAT format', () => {
      const serbianMetadata: Partial<SerbianMetadataSchema> = {
        identifier: 'dcat-conversion-test',
        title: {
          sr: 'Тест DCAT конверзије',
          en: 'DCAT Conversion Test'
        },
        description: {
          sr: 'Тест подаци за DCAT конверзију',
          en: 'Test data for DCAT conversion'
        },
        publisher: {
          name: {
            sr: 'Тест организација',
            en: 'Test Organization'
          },
          identifier: 'TEST-001'
        },
        publicationDate: new Date('2024-01-01'),
        modificationDate: new Date('2024-06-01'),
        language: ['sr', 'en'],
        theme: [{
          code: 'ECON',
          name: {
            sr: 'Економија',
            en: 'Economy'
          },
          level: 1
        }],
        distribution: [{
          accessURL: 'https://example.com/data.csv',
          downloadURL: 'https://example.com/download/data.csv',
          format: 'text/csv',
          size: 1024000
        }],
        license: {
          identifier: 'CC0-1.0',
          name: {
            sr: 'Кријејтив комонс Нулта 1.0',
            en: 'Creative Commons Zero 1.0'
          },
          url: 'https://creativecommons.org/publicdomain/zero/1.0/',
          attributionRequired: false,
          commercialUseAllowed: true,
          derivativeWorksAllowed: true
        },
        contactPoint: {
          name: 'Департмент за податке',
          email: 'data@example.com'
        }
      };

      const result = adapter.adaptToDCAT(serbianMetadata);

      expect(result['@type']).toBe('dcat:Dataset');
      expect(result['dct:identifier']).toBe('dcat-conversion-test');
      expect(result['dct:title']).toEqual({
        sr: 'Тест DCAT конверзије',
        en: 'DCAT Conversion Test'
      });
      expect(result['dct:issued']).toBe('2024-01-01T00:00:00.000Z');
      expect(result['dct:language']).toHaveLength(2);
      expect(result['dcat:distribution']).toHaveLength(1);
      expect(result['dct:license']['dct:identifier']).toBe('CC0-1.0');
      expect(result['dcat:contactPoint']['vcard:fn']).toBe('Департмент за податке');
    });
  });

  describe('enhanceSerbianMetadata', () => {
    it('should enhance metadata with Serbian standards', () => {
      const basicMetadata = {
        identifier: 'basic-metadata',
        title: {
          en: 'Basic Metadata Only'
        },
        description: {
          en: 'This metadata only has English titles'
        },
        publisher: {
          name: {
            en: 'Unknown Publisher'
          },
          identifier: '123456'
        }
      };

      const enhanced = adapter.enhanceSerbianMetadata(basicMetadata);

      expect(enhanced.language).toContain('sr'); // Should add Serbian language
      expect(enhanced.license).toBeDefined(); // Should recommend a license
      expect(enhanced.theme).toBeDefined(); // Should suggest themes
    });

    it('should not modify already compliant metadata', () => {
      const compliantMetadata = {
        identifier: 'compliant-metadata',
        title: {
          sr: 'Потпуно усаглашени метаподаци',
          'sr-Latn': 'Potpuno usaglašeni metapodaci',
          en: 'Fully Compliant Metadata'
        },
        description: {
          sr: 'Ови метаподаци су већ у потпуној усаглашености',
          'sr-Latn': 'Ovi metapodaci su već u potpunom usaglašenosti',
          en: 'This metadata is already fully compliant'
        },
        language: ['sr', 'sr-Latn', 'en'],
        theme: [{
          code: 'GOV',
          name: {
            sr: 'Влада',
            'sr-Latn': 'Vlada',
            en: 'Government'
          },
          level: 1
        }],
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
        }
      };

      const enhanced = adapter.enhanceSerbianMetadata(compliantMetadata);

      expect(enhanced).toEqual(compliantMetadata); // Should be unchanged
    });

    it('should auto-detect government institutions', () => {
      const metadata = {
        identifier: 'RS-VLADA-2024-001',
        title: {
          en: 'Government Dataset'
        }
      };

      const enhanced = adapter.enhanceSerbianMetadata(metadata);

      expect(enhanced.publisher).toBeDefined();
      expect(enhanced.publisher?.name).toBeDefined();
    });

    it('should suggest themes based on content analysis', () => {
      const metadata = {
        identifier: 'education-dataset',
        title: {
          en: 'School Student Performance Data',
          sr: 'Подаци о успеху ученика у школи'
        },
        description: {
          en: 'Academic performance data for primary schools',
          sr: 'Подаци о академском успеху основних школа'
        }
      };

      const enhanced = adapter.enhanceSerbianMetadata(metadata);

      expect(enhanced.theme).toBeDefined();
      expect(enhanced.theme!.length).toBeGreaterThan(0);
      expect(enhanced.theme![0].code).toBe('EDU'); // Should detect education theme
    });

    it('should standardize formats', () => {
      const metadata = {
        identifier: 'format-test',
        title: {
          en: 'Format Test'
        },
        format: [
          { format: 'csv' },
          { format: 'xlsx' },
          { format: 'application/pdf' }
        ]
      };

      const enhanced = adapter.enhanceSerbianMetadata(metadata);

      expect(enhanced.format).toBeDefined();
      expect(enhanced.format![0].format).toBe('text/csv');
      expect(enhanced.format![1].format).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });

  describe('integration tests', () => {
    it('should handle complex real-world scenarios', () => {
      // Simulate a real dataset from data.gov.rs
      const dcatInput = {
        '@context': 'https://www.w3.org/ns/dcat',
        'dct:identifier': 'RS-ZRS-2024-001',
        'dct:title': {
          'sr': 'Популација Републике Србије 2023',
          'sr-Latn': 'Populacija Republike Srbije 2023',
          'en': 'Population of the Republic of Serbia 2023'
        },
        'dct:description': {
          'sr': 'Подаци о популацији по општинама и регионима за 2023. годину',
          'sr-Latn': 'Podaci o populaciji po opštinama i regionima za 2023. godinu',
          'en': 'Population data by municipalities and regions for 2023'
        },
        'dct:publisher': {
          '@type': 'foaf:Organization',
          'foaf:name': {
            'sr': 'Републички завод за статистику',
            'sr-Latn': 'Republički zavod za statistiku',
            'en': 'Republic Statistical Office'
          },
          'dct:identifier': '52555234'
        },
        'dct:issued': '2024-06-01',
        'dct:language': ['sr', 'sr-Latn', 'en'],
        'dcat:keyword': [
          'популација',
          'становништво',
          'демографија',
          'општине',
          'региони',
          'population',
          'demographics',
          'municipalities',
          'regions'
        ],
        'dct:theme': [{
          'skos:notation': 'SOC',
          'skos:prefLabel': {
            'sr': 'Социјална заштита',
            'sr-Latn': 'Socijalna zaštita',
            'en': 'Social Protection'
          }
        }],
        'dct:spatial': {
          'skos:prefLabel': {
            'sr': 'Република Србија',
            'sr-Latn': 'Republika Srbija',
            'en': 'Republic of Serbia'
          }
        },
        'dct:temporal': {
          'schema:startDate': '2023-01-01',
          'schema:endDate': '2023-12-31'
        },
        'dcat:distribution': [{
          'dcat:accessURL': 'https://data.gov.rs/datasets/RS-ZRS-2024-001',
          'dcat:downloadURL': 'https://data.gov.rs/datasets/RS-ZRS-2024-001.csv',
          'dct:format': { '@id': 'http://publications.europa.eu/resource/authority/file-type/CSV' },
          'dcat:byteSize': 5242880,
          'dct:title': {
            'sr': 'Подаци у CSV формату',
            'en': 'Data in CSV format'
          }
        }, {
          'dcat:accessURL': 'https://data.gov.rs/datasets/RS-ZRS-2024-001/json',
          'dcat:downloadURL': 'https://data.gov.rs/datasets/RS-ZRS-2024-001.json',
          'dct:format': { '@id': 'http://publications.europa.eu/resource/authority/file-type/JSON' },
          'dcat:byteSize': 3145728,
          'dct:title': {
            'sr': 'Подаци у JSON формату',
            'en': 'Data in JSON format'
          }
        }],
        'dct:license': {
          'dct:identifier': 'CC-BY-4.0',
          'dct:title': {
            'sr': 'Кријејтив комонс - Ауторство 4.0',
            'en': 'Creative Commons Attribution 4.0'
          }
        },
        'dcat:contactPoint': {
          '@type': 'vcard:Kind',
          'vcard:fn': 'Сектор за демографску статистику',
          'vcard:hasEmail': 'demografija@stat.gov.rs'
        }
      };

      // Convert from DCAT to Serbian metadata
      const serbianMetadata = adapter.adaptFromDCAT(dcatInput);

      expect(serbianMetadata.identifier).toBe('RS-ZRS-2024-001');
      expect(serbianMetadata.title).toEqual({
        sr: 'Популација Републике Србије 2023',
        'sr-Latn': 'Populacija Republike Srbije 2023',
        en: 'Population of the Republic of Serbia 2023'
      });
      expect(serbianMetadata.publisher?.identifier).toBe('52555234');
      expect(serbianMetadata.language).toEqual(['sr', 'sr-Latn', 'en']);
      expect(serbianMetadata.theme?.[0].code).toBe('SOC');
      expect(serbianMetadata.distribution).toHaveLength(2);

      // Enhance the metadata
      const enhanced = adapter.enhanceSerbianMetadata(serbianMetadata);

      // Should already be compliant, so no major changes expected
      expect(enhanced.title).toEqual(serbianMetadata.title);
      expect(enhanced.license?.identifier).toBe('CC-BY-4.0');

      // Convert back to DCAT
      const backToDCAT = adapter.adaptToDCAT(enhanced);

      expect(backToDCAT['dct:identifier']).toBe('RS-ZRS-2024-001');
      expect(backToDCAT['@type']).toBe('dcat:Dataset');
      expect(backToDCAT['dcat:distribution']).toHaveLength(2);
    });
  });
});