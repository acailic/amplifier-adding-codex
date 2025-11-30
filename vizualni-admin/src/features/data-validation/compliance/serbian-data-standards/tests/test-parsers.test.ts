import { describe, it, expect, beforeEach } from 'vitest';
import { SerbianCSVParser, SerbianJSONParser } from '../data-parsers';
import { SerbianParseOptions } from '../data-parsers';

describe('SerbianCSVParser', () => {
  let parser: SerbianCSVParser;

  beforeEach(() => {
    parser = new SerbianCSVParser();
  });

  describe('parse', () => {
    it('should parse Serbian CSV with Cyrillic data', async () => {
      const csvData = `име;презиме;датум_рођења;јмбг
Петар;Петровић;01.01.1990.;0101990710006
Марина;Јовановић;15.05.1985.;1505985710006`;

      const options: SerbianParseOptions = {
        delimiter: ';',
        validateJMBG: true,
        parseDates: true,
        parseNumbers: true
      };

      const result = await parser.parse(csvData, options);

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        име: 'Петар',
        презиме: 'Петровић',
        датум_рођења: expect.any(Date),
        јмбг: '0101990710006'
      });
      expect(result.metadata.columns).toEqual(['име', 'презиме', 'датум_рођења', 'јмбг']);
      expect(result.metadata.script).toBe('cyrillic');
      expect(result.metadata.totalRows).toBe(2);
      expect(result.metadata.parsedRows).toBe(2);
    });

    it('should parse Serbian CSV with Latin script data', async () => {
      const csvData = `ime;prezime;datum_rodjenja;jmbg
Petar;Petrovic;01.01.1990.;0101990710006
Marina;Jovanovic;15.05.1985.;1505985710006`;

      const options: SerbianParseOptions = {
        delimiter: ';',
        detectScript: true
      };

      const result = await parser.parse(csvData, options);

      expect(result.data).toHaveLength(2);
      expect(result.metadata.script).toBe('latin');
      expect(result.data[0].ime).toBe('Petar');
    });

    it('should parse Serbian CSV with numbers in Serbian format', async () => {
      const csvData = `iznos;procenat
1.234,56;12,5%
98.765,43;87,2%
0;0%`;

      const options: SerbianParseOptions = {
        delimiter: ';',
        parseNumbers: true
      };

      const result = await parser.parse(csvData, options);

      expect(result.data[0]).toEqual({
        iznos: 1234.56,
        procenat: 0.125 // 12,5% parsed as number
      });
    });

    it('should handle Serbian date formats', async () => {
      const csvData = `datum;format
01.01.2024.;dd.mm.yyyy.
1. 1. 2024. године;full format
2024-01-01;ISO format
01/01/2024;slash format`;

      const options: SerbianParseOptions = {
        delimiter: ';',
        parseDates: true
      };

      const result = await parser.parse(csvData, options);

      expect(result.data[0].datum).toBeInstanceOf(Date);
      expect(result.data[1].datum).toBeInstanceOf(Date);
      expect(result.data[2].datum).toBeInstanceOf(Date);
      expect(result.data[3].datum).toBeInstanceOf(Date);
    });

    it('should validate JMBG checksums', async () => {
      const csvData = `jmbg;valid
0101990710006;valid
123456789012;invalid`;

      const options: SerbianParseOptions = {
        delimiter: ';',
        validateJMBG: true
      };

      const result = await parser.parse(csvData, options);

      expect(result.data[0].jmbg).toBe('0101990710006');
      expect(result.data[1].jmbg).toBe('123456789012');
      expect(result.parseErrors).toHaveLength(1);
      expect(result.parseErrors[0].code).toBe('INVALID_JMBG');
    });

    it('should validate PIB checksums', async () => {
      const csvData = `pib;valid
123456789;invalid
101883300;valid`;

      const options: SerbianParseOptions = {
        delimiter: ';',
        validatePIB: true
      };

      const result = await parser.parse(csvData, options);

      expect(result.data[0].pib).toBe('123456789');
      expect(result.data[1].pib).toBe('101883300');
      expect(result.parseErrors).toHaveLength(1);
      expect(result.parseErrors[0].code).toBe('INVALID_PIB');
    });

    it('should handle mixed script data', async () => {
      const csvData = `ime;prezime;opština
Петар;Petrović;Београд
Марина;Jovanović;Novi Sad`;

      const options: SerbianParseOptions = {
        delimiter: ';',
        detectScript: true
      };

      const result = await parser.parse(csvData, options);

      expect(result.data).toHaveLength(2);
      expect(result.metadata.script).toBe('mixed');
    });

    it('should handle empty rows and missing values', async () => {
      const csvData = `ime;prezime;jmbg
Петар;Петровић;0101990710006
;;;
Марина;Јовановић;1505985710006`;

      const options: SerbianParseOptions = {
        delimiter: ';',
        skipEmptyLines: false
      };

      const result = await parser.parse(csvData, options);

      expect(result.data).toHaveLength(3);
      expect(result.data[1].ime).toBeNull();
      expect(result.data[1].prezime).toBeNull();
      expect(result.data[1].jmbg).toBeNull();
    });

    it('should detect encoding automatically', async () => {
      const csvData = `ime;prezime
Milan;Novakovic`;

      const options: SerbianParseOptions = {
        delimiter: ';'
      };

      const result = await parser.parse(csvData, options);

      expect(result.metadata.encoding).toBe('utf-8');
    });

    it('should respect maxRows limit', async () => {
      const csvData = `id;name
1;Row 1
2;Row 2
3;Row 3
4;Row 4
5;Row 5`;

      const options: SerbianParseOptions = {
        delimiter: ';',
        maxRows: 3
      };

      const result = await parser.parse(csvData, options);

      expect(result.data).toHaveLength(2); // Header is excluded, so max 3 rows = 2 data rows
    });
  });

  describe('stringify', () => {
    it('should convert data to Serbian CSV format', () => {
      const data = [
        {
          име: 'Петар',
          презиме: 'Петровић',
          износ: 1234.56,
          датум: new Date('2024-01-01')
        }
      ];

      const options: SerbianParseOptions = {
        delimiter: ';'
      };

      const csvString = parser.stringify(data, options);

      expect(csvString).toContain('Петар');
      expect(csvString).toContain('Петровић');
      expect(csvString).toContain('1.234,56');
      expect(csvString).toContain('01.01.2024.');
    });
  });

  describe('validateCSV', () => {
    it('should validate Serbian CSV data', () => {
      const data = [
        {
          jmbg: '0101990710006', // Valid JMBG
          pib: '101883300', // Valid PIB
          datum: '01.01.2024.', // Valid Serbian date
          broj: '1.234,56' // Valid Serbian number
        },
        {
          jmbg: '123456789012', // Invalid JMBG
          pib: '123456789', // Invalid PIB
          datum: 'invalid-date', // Invalid date
          broj: 'invalid-number' // Invalid number
        }
      ];

      const options = {
        validateJMBG: true,
        validatePIB: true
      };

      const result = parser.validateCSV(data, options);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2); // JMBG and PIB errors
      expect(result.warnings).toHaveLength(2); // Date and number errors
      expect(result.stats.validJMBG).toBe(1);
      expect(result.stats.invalidJMBG).toBe(1);
      expect(result.stats.validPIB).toBe(1);
      expect(result.stats.invalidPIB).toBe(1);
    });

    it('should calculate script consistency', () => {
      const data = [
        { name: 'Петар' }, // Cyrillic
        { name: 'Марина' }, // Cyrillic
        { name: 'Мирослав' } // Cyrillic
      ];

      const result = parser.validateCSV(data);

      expect(result.stats.scriptConsistency).toBe(1); // 100% Cyrillic
    });
  });
});

describe('SerbianJSONParser', () => {
  let parser: SerbianJSONParser;

  beforeEach(() => {
    parser = new SerbianJSONParser();
  });

  describe('parse', () => {
    it('should parse JSON with Serbian data', async () => {
      const jsonData = [
        {
          "име": "Петар",
          "презиме": "Петровић",
          "јмбг": "0101990710006",
          "адреса": "Улица Војводе Мишића 15, Београд"
        },
        {
          "име": "Марина",
          "презиме": "Јовановић",
          "јмбг": "1505985710006",
          "адреса": "Булевар револуције 20, Нови Сад"
        }
      ];

      const options: SerbianParseOptions = {
        validateJMBG: true
      };

      const result = await parser.parse(jsonData, options);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].име).toBe('Петар');
      expect(result.data[0].презиме).toBe('Петровић');
      expect(result.metadata.totalRows).toBe(2);
      expect(result.metadata.parsedRows).toBe(2);
      expect(result.metadata.script).toBe('cyrillic');
    });

    it('should parse JSON wrapped in metadata', async () => {
      const jsonData = {
        "identifier": "test-dataset",
        "title": {
          "sr": "Тест подаци"
        },
        "data": [
          { "id": 1, "name": "Запис 1" },
          { "id": 2, "name": "Запис 2" }
        ]
      };

      const result = await parser.parse(jsonData);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].name).toBe('Запис 1');
    });

    it('should handle invalid JSON', async () => {
      const invalidJson = `{ "invalid": json }`;

      const result = await parser.parse(invalidJson);

      expect(result.data).toHaveLength(0);
      expect(result.metadata.parsedRows).toBe(0);
      expect(result.metadata.errorRows).toBe(1);
      expect(result.parseErrors).toHaveLength(1);
      expect(result.parseErrors[0].code).toBe('Invalid JSON');
    });

    it('should handle single object JSON', async () => {
      const jsonData = {
        "id": 1,
        "name": "Један запис",
        "value": 100
      };

      const result = await parser.parse(jsonData);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].name).toBe('Један запис');
    });

    it('should respect maxRows limit', async () => {
      const jsonData = Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        name: `Запис ${index + 1}`
      }));

      const options: SerbianParseOptions = {
        maxRows: 5
      };

      const result = await parser.parse(jsonData, options);

      expect(result.data).toHaveLength(5);
      expect(result.metadata.totalRows).toBe(5);
    });
  });

  describe('stringify', () => {
    it('should convert data to JSON with Serbian characters', () => {
      const data = [
        {
          "име": "Петар",
          "презиме": "Петровић",
          "град": "Београд"
        }
      ];

      const jsonString = parser.stringify(data);

      const parsed = JSON.parse(jsonString);
      expect(parsed[0].име).toBe('Петар');
      expect(parsed[0].презиме).toBe('Петровић');
      expect(parsed[0].град).toBe('Београд');
    });
  });
});

describe('Integration Tests', () => {
  it('should handle complex Serbian datasets', async () => {
    const csvParser = new SerbianCSVParser();
    const csvData = `имe;презиме;датум_родђења;јмбг;пиб;износ;адреса;град
Петар;Петровић;01.01.1990.;0101990710006;101883300;1.234,56;Улица Војводе Мишића 15;Београд
Марина;Јовановић;15.05.1985.;1505985710006;123456789;98.765,43;Булевар ослобођења 20;Нови Сад
Милош;Милановић;20.12.1975.;2012995710005;40106636;543.210,78;Краља Милана 1;Београд`;

    const options: SerbianParseOptions = {
      delimiter: ';',
      validateJMBG: true,
      validatePIB: true,
      parseDates: true,
      parseNumbers: true,
      detectScript: true,
      normalizeText: true
    };

    const result = await csvParser.parse(csvData, options);

    expect(result.data).toHaveLength(3);
    expect(result.metadata.script).toBe('cyrillic');
    expect(result.metadata.detectedFormats.име).toBe('string');
    expect(result.metadata.detectedFormats.износ).toBe('number');
    expect(result.metadata.detectedFormats.датум_родђења).toBe('date');
    expect(result.metadata.performance.rowsPerSecond).toBeGreaterThan(0);

    // Verify specific data parsing
    expect(result.data[0].износ).toBe(1234.56);
    expect(result.data[0].датум_родђења).toBeInstanceOf(Date);
    expect(result.data[0].град).toBe('Београд');

    // Check for validation errors (invalid PIB)
    expect(result.parseErrors.some(e => e.code === 'INVALID_PIB')).toBe(true);
  });
});