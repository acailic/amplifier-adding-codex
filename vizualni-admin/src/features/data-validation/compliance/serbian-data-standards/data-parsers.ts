import { parse as parseCSV, stringify as stringifyCSV } from 'csv-parse/sync';
import { format, parse, isValid } from 'date-fns';
import { sr } from 'date-fns/locale';

/**
 * Optimized Serbian Data Parsers
 *
 * Specialized parsers for Serbian data patterns including:
 * - Serbian date formats (DD.MM.YYYY., DD. MM YYYY. године)
 * - Serbian number formats (1.234.567,89)
 * - Cyrillic/Latin script handling
 * - JMBG validation and parsing
 * - PIB validation
 * - Serbian address patterns
 * - Performance optimizations for large datasets
 */

export interface SerbianParseOptions {
  encoding?: 'utf-8' | 'windows-1250' | 'iso-8859-2';
  delimiter?: string;
  quote?: string;
  escape?: string;
  detectScript?: boolean;
  normalizeText?: boolean;
  validateJMBG?: boolean;
  validatePIB?: boolean;
  parseDates?: boolean;
  parseNumbers?: boolean;
  skipEmptyLines?: boolean;
  maxRows?: number;
  chunkSize?: number;
}

export interface SerbianParseResult<T = any> {
  data: T[];
  metadata: {
    totalRows: number;
    parsedRows: number;
    errorRows: number;
    encoding: string;
    script: 'cyrillic' | 'latin' | 'mixed' | 'unknown';
    columns: string[];
    detectedFormats: Record<string, string>;
    parseErrors: ParseError[];
    performance: {
      startTime: number;
      endTime: number;
      duration: number;
      rowsPerSecond: number;
    };
  };
}

export interface ParseError {
  row: number;
  column: string;
  value: any;
  error: string;
  type: 'script' | 'format' | 'validation' | 'parsing';
}

/**
 * High-performance Serbian CSV parser
 */
export class SerbianCSVParser {
  private readonly serbianDatePatterns = [
    /^\d{1,2}\.\d{1,2}\.\d{4}\.$/, // 01.01.2024.
    /^\d{1,2}\. \d{1,2}\. \d{4}\. године$/, // 1. 1. 2024. године
    /^\d{1,2}\.\d{1,2}\.\d{4}$/, // 01.01.2024 (without trailing dot)
    /^\d{4}-\d{2}-\d{2}$/, // ISO format
    /^\d{1,2}\/\d{1,2}\/\d{4}$/ // 01/01/2024
  ];

  private readonly serbianNumberPattern = /^-?\d{1,3}(?:\.\d{3})*(?:,\d+)?$/;
  private readonly jmbgPattern = /^\d{13}$/;
  private readonly pibPattern = /^\d{9}$/;

  /**
   * Parse Serbian CSV with optimizations for government data
   */
  async parse<T = any>(
    input: string | Buffer,
    options: SerbianParseOptions = {}
  ): Promise<SerbianParseResult<T>> {
    const startTime = performance.now();
    const parseOptions = this.normalizeOptions(options);

    let buffer: Buffer;
    if (typeof input === 'string') {
      buffer = Buffer.from(input, parseOptions.encoding);
    } else {
      buffer = input;
    }

    // Detect encoding if not specified
    if (!parseOptions.encoding) {
      parseOptions.encoding = this.detectEncoding(buffer);
    }

    // Convert to string
    let csvString = buffer.toString(parseOptions.encoding);

    // Detect script if enabled
    const detectedScript = parseOptions.detectScript ?
      this.detectScript(csvString) : 'unknown';

    // Normalize text if enabled
    if (parseOptions.normalizeText) {
      csvString = this.normalizeSerbianText(csvString);
    }

    // Parse CSV
    const csvOptions = {
      delimiter: parseOptions.delimiter,
      quote: parseOptions.quote,
      escape: parseOptions.escape,
      skip_empty_lines: parseOptions.skipEmptyLines,
      relax_quotes: true,
      relax_column_count: true
    };

    let records: any[] = [];
    let parseErrors: ParseError[] = [];

    try {
      if (parseOptions.chunkSize && parseOptions.maxRows) {
        // Chunked processing for large files
        records = await this.parseInChunks(csvString, csvOptions, parseOptions, parseErrors);
      } else {
        // Standard parsing
        records = parseCSV(csvString, csvOptions) as any[];
        if (parseOptions.maxRows && records.length > parseOptions.maxRows) {
          records = records.slice(0, parseOptions.maxRows);
        }
      }

      // Process and validate data
      const processedData = await this.processRecords(records, parseOptions, parseErrors);

      const endTime = performance.now();
      const duration = endTime - startTime;

      return {
        data: processedData,
        metadata: {
          totalRows: records.length,
          parsedRows: processedData.length,
          errorRows: parseErrors.length,
          encoding: parseOptions.encoding,
          script: detectedScript,
          columns: this.extractColumns(records),
          detectedFormats: this.analyzeDataFormats(processedData),
          parseErrors,
          performance: {
            startTime,
            endTime,
            duration,
            rowsPerSecond: Math.round((processedData.length / duration) * 1000)
          }
        }
      };
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      return {
        data: [],
        metadata: {
          totalRows: 0,
          parsedRows: 0,
          errorRows: 1,
          encoding: parseOptions.encoding,
          script: detectedScript,
          columns: [],
          detectedFormats: {},
          parseErrors: [{
            row: 0,
            column: '',
            value: input,
            error: error instanceof Error ? error.message : 'Unknown error',
            type: 'parsing'
          }],
          performance: {
            startTime,
            endTime,
            duration,
            rowsPerSecond: 0
          }
        }
      };
    }
  }

  /**
   * Convert data to Serbian CSV format
   */
  stringify(data: any[], options: SerbianParseOptions = {}): string {
    const processedData = data.map(row => this.processRowForOutput(row, options));

    const csvOptions = {
      delimiter: options.delimiter || ';',
      quote: options.quote || '"',
      escape: options.escape || '"',
      header: true
    };

    return stringifyCSV(processedData, csvOptions);
  }

  /**
   * Validate Serbian data patterns in CSV
   */
  validateCSV(data: any[], options: SerbianParseOptions = {}): {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    stats: ValidationStats;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const stats: ValidationStats = {
      totalRows: data.length,
      validJMBG: 0,
      invalidJMBG: 0,
      validPIB: 0,
      invalidPIB: 0,
      validDates: 0,
      invalidDates: 0,
      scriptConsistency: 0,
      encodingIssues: 0
    };

    data.forEach((row, rowIndex) => {
      Object.entries(row).forEach(([column, value]) => {
        const stringValue = String(value).trim();

        // Validate JMBG
        if (options.validateJMBG && this.jmbgPattern.test(stringValue)) {
          if (this.validateJMBG(stringValue)) {
            stats.validJMBG++;
          } else {
            stats.invalidJMBG++;
            errors.push({
              type: 'validation',
              row: rowIndex,
              column,
              value: stringValue,
              message: 'Invalid JMBG checksum or format'
            });
          }
        }

        // Validate PIB
        if (options.validatePIB && this.pibPattern.test(stringValue)) {
          if (this.validatePIB(stringValue)) {
            stats.validPIB++;
          } else {
            stats.invalidPIB++;
            errors.push({
              type: 'validation',
              row: rowIndex,
              column,
              value: stringValue,
              message: 'Invalid PIB checksum'
            });
          }
        }

        // Validate dates
        if (options.parseDates && this.isSerbianDate(stringValue)) {
          try {
            this.parseSerbianDate(stringValue);
            stats.validDates++;
          } catch {
            stats.invalidDates++;
            warnings.push({
              type: 'format',
              row: rowIndex,
              column,
              value: stringValue,
              message: 'Date format could not be parsed'
            });
          }
        }
      });
    });

    // Calculate script consistency
    stats.scriptConsistency = this.calculateScriptConsistency(data);

    const isValid = errors.length === 0 && stats.invalidJMBG === 0 && stats.invalidPIB === 0;

    return { isValid, errors, warnings, stats };
  }

  private normalizeOptions(options: SerbianParseOptions): Required<SerbianParseOptions> {
    return {
      encoding: options.encoding || 'utf-8',
      delimiter: options.delimiter || ';',
      quote: options.quote || '"',
      escape: options.escape || '"',
      detectScript: options.detectScript ?? true,
      normalizeText: options.normalizeText ?? true,
      validateJMBG: options.validateJMBG ?? false,
      validatePIB: options.validatePIB ?? false,
      parseDates: options.parseDates ?? true,
      parseNumbers: options.parseNumbers ?? true,
      skipEmptyLines: options.skipEmptyLines ?? true,
      maxRows: options.maxRows || Number.MAX_SAFE_INTEGER,
      chunkSize: options.chunkSize || 10000
    };
  }

  private detectEncoding(buffer: Buffer): 'utf-8' | 'windows-1250' | 'iso-8859-2' {
    // Try UTF-8 first
    try {
      const text = buffer.toString('utf-8');
      if (this.containsSerbianCharacters(text)) {
        return 'utf-8';
      }
    } catch {}

    // Try Windows-1250
    try {
      const text = buffer.toString('windows-1250');
      if (this.containsSerbianCharacters(text)) {
        return 'windows-1250';
      }
    } catch {}

    // Default to UTF-8
    return 'utf-8';
  }

  private containsSerbianCharacters(text: string): boolean {
    const serbianChars = /[čćžšđČĆŽŠĐљњејрљњертЉЊЕРТ]/;
    return serbianChars.test(text);
  }

  private detectScript(text: string): 'cyrillic' | 'latin' | 'mixed' | 'unknown' {
    const cyrillicChars = /[аАбБвВгГдДђЂеЕжЖзЗиИјЈкКлЛљЉмМнНњЊоОпПрРсСтТћЋуУфФхХцЦчЧџШшШ]/g;
    const latinChars = /[čČćĆžŽšŠđĐ]/g;

    const cyrillicMatches = (text.match(cyrillicChars) || []).length;
    const latinMatches = (text.match(latinChars) || []).length;

    if (cyrillicMatches === 0 && latinMatches === 0) {
      return 'unknown';
    }
    if (cyrillicMatches > latinMatches * 2) {
      return 'cyrillic';
    }
    if (latinMatches > cyrillicMatches * 2) {
      return 'latin';
    }
    return 'mixed';
  }

  private normalizeSerbianText(text: string): string {
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Normalize quotes
    text = text.replace(/['']/g, '"');

    // Normalize dash
    text = text.replace(/[-–—]/g, '-');

    return text;
  }

  private async parseInChunks(
    csvString: string,
    csvOptions: any,
    parseOptions: Required<SerbianParseOptions>,
    parseErrors: ParseError[]
  ): Promise<any[]> {
    const lines = csvString.split('\n');
    const header = lines[0];
    const allRecords: any[] = [];

    // Process header separately
    const headerRecord = parseCSV(header, csvOptions)[0];
    const columns = Object.keys(headerRecord);

    for (let i = 1; i < lines.length && allRecords.length < parseOptions.maxRows; i += parseOptions.chunkSize) {
      const chunk = lines.slice(i, Math.min(i + parseOptions.chunkSize, lines.length));
      const chunkString = [header, ...chunk].join('\n');

      try {
        const chunkRecords = parseCSV(chunkString, csvOptions) as any[];
        const processedRecords = await this.processRecords(chunkRecords.slice(1), parseOptions, parseErrors);
        allRecords.push(...processedRecords);
      } catch (error) {
        // Add error for this chunk
        parseErrors.push({
          row: i,
          column: '',
          value: chunk.join('\n'),
          error: error instanceof Error ? error.message : 'Unknown error',
          type: 'parsing'
        });
      }
    }

    return allRecords;
  }

  private async processRecords(
    records: any[],
    options: Required<SerbianParseOptions>,
    parseErrors: ParseError[]
  ): Promise<any[]> {
    return records.map((record, index) => {
      const processedRecord: any = {};

      Object.entries(record).forEach(([column, value]) => {
        const stringValue = String(value).trim();

        try {
          // Skip empty values
          if (stringValue === '' || stringValue === '""' || stringValue === "''") {
            processedRecord[column] = null;
            return;
          }

          // Parse dates
          if (options.parseDates && this.isSerbianDate(stringValue)) {
            processedRecord[column] = this.parseSerbianDate(stringValue);
            return;
          }

          // Parse numbers
          if (options.parseNumbers && this.serbianNumberPattern.test(stringValue)) {
            processedRecord[column] = this.parseSerbianNumber(stringValue);
            return;
          }

          // Validate JMBG
          if (options.validateJMBG && this.jmbgPattern.test(stringValue)) {
            if (this.validateJMBG(stringValue)) {
              processedRecord[column] = stringValue;
            } else {
              parseErrors.push({
                row: index,
                column,
                value: stringValue,
                error: 'Invalid JMBG',
                type: 'validation'
              });
              processedRecord[column] = stringValue;
            }
            return;
          }

          // Validate PIB
          if (options.validatePIB && this.pibPattern.test(stringValue)) {
            if (this.validatePIB(stringValue)) {
              processedRecord[column] = stringValue;
            } else {
              parseErrors.push({
                row: index,
                column,
                value: stringValue,
                error: 'Invalid PIB',
                type: 'validation'
              });
              processedRecord[column] = stringValue;
            }
            return;
          }

          // Default: keep as string
          processedRecord[column] = stringValue;
        } catch (error) {
          parseErrors.push({
            row: index,
            column,
            value: stringValue,
            error: error instanceof Error ? error.message : 'Processing error',
            type: 'parsing'
          });
          processedRecord[column] = stringValue;
        }
      });

      return processedRecord;
    });
  }

  private isSerbianDate(value: string): boolean {
    return this.serbianDatePatterns.some(pattern => pattern.test(value.trim()));
  }

  private parseSerbianDate(value: string): Date {
    const cleanValue = value.trim().replace('године', '').trim();

    // DD.MM.YYYY. format
    const ddmmyyyy = cleanValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // ISO format
    const isoMatch = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // MM/DD/YYYY format
    const mmddyyyy = cleanValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const [, month, day, year] = mmddyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    throw new Error(`Unable to parse Serbian date: ${value}`);
  }

  private parseSerbianNumber(value: string): number {
    // Remove thousands separators and replace decimal separator
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleanValue);

    if (isNaN(parsed)) {
      throw new Error(`Unable to parse Serbian number: ${value}`);
    }

    return parsed;
  }

  private validateJMBG(jmbg: string): boolean {
    if (!this.jmbgPattern.test(jmbg)) {
      return false;
    }

    // Extract components
    const day = parseInt(jmbg.substring(0, 2));
    const month = parseInt(jmbg.substring(2, 4));
    const year = parseInt(jmbg.substring(4, 7));
    const region = parseInt(jmbg.substring(7, 9));
    const control = parseInt(jmbg.substring(12, 13));

    // Basic validation
    if (day < 1 || day > 31 || month < 1 || month > 12) {
      return false;
    }

    // Validate control digit
    const weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      sum += parseInt(jmbg.substring(i, i + 1)) * weights[i];
    }

    const remainder = sum % 11;
    const calculatedControl = remainder === 0 ? 0 : 11 - remainder;

    return calculatedControl === control;
  }

  private validatePIB(pib: string): boolean {
    if (!this.pibPattern.test(pib)) {
      return false;
    }

    // Validate control digit
    const weights = [8, 7, 6, 5, 4, 3, 2, 1];
    let sum = 0;

    for (let i = 0; i < 8; i++) {
      sum += parseInt(pib.substring(i, i + 1)) * weights[i];
    }

    const remainder = sum % 11;
    const calculatedControl = remainder === 0 ? 0 : 11 - remainder;

    return calculatedControl === parseInt(pib.substring(8, 9));
  }

  private processRowForOutput(row: any, options: SerbianParseOptions): any {
    const processedRow: any = {};

    Object.entries(row).forEach(([key, value]) => {
      if (value instanceof Date) {
        processedRow[key] = format(value, 'dd.MM.yyyy.', { locale: sr });
      } else if (typeof value === 'number') {
        processedRow[key] = this.formatSerbianNumber(value);
      } else {
        processedRow[key] = String(value || '');
      }
    });

    return processedRow;
  }

  private formatSerbianNumber(value: number): string {
    // Format with thousands separator and decimal comma
    const parts = value.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',').replace(',00', '');
  }

  private extractColumns(records: any[]): string[] {
    if (records.length === 0) return [];
    return Object.keys(records[0]);
  }

  private analyzeDataFormats(data: any[]): Record<string, string> {
    const formats: Record<string, string> = {};

    if (data.length === 0) return formats;

    const firstRow = data[0];

    Object.entries(firstRow).forEach(([column, value]) => {
      if (value instanceof Date) {
        formats[column] = 'date';
      } else if (typeof value === 'number') {
        formats[column] = 'number';
      } else if (typeof value === 'boolean') {
        formats[column] = 'boolean';
      } else {
        formats[column] = 'string';
      }
    });

    return formats;
  }

  private calculateScriptConsistency(data: any[]): number {
    if (data.length === 0) return 0;

    const scripts = data.map(row => {
      const text = Object.values(row).join(' ');
      return this.detectScript(text);
    });

    const cyrillicCount = scripts.filter(s => s === 'cyrillic').length;
    const latinCount = scripts.filter(s => s === 'latin').length;
    const totalCount = scripts.filter(s => s !== 'unknown').length;

    if (totalCount === 0) return 0;

    return Math.max(cyrillicCount, latinCount) / totalCount;
  }
}

/**
 * Serbian JSON parser with optimizations for government data
 */
export class SerbianJSONParser {
  private readonly csvParser: SerbianCSVParser;

  constructor() {
    this.csvParser = new SerbianCSVParser();
  }

  /**
   * Parse JSON with Serbian character support and validation
   */
  async parse<T = any>(
    input: string | Buffer,
    options: SerbianParseOptions = {}
  ): Promise<SerbianParseResult<T>> {
    const startTime = performance.now();

    let jsonString: string;
    if (typeof input === 'string') {
      jsonString = input;
    } else {
      jsonString = input.toString(options.encoding || 'utf-8');
    }

    try {
      const data = JSON.parse(jsonString);
      let records: any[] = [];

      if (Array.isArray(data)) {
        records = data;
      } else if (data.data && Array.isArray(data.data)) {
        records = data.data;
      } else if (data.records && Array.isArray(data.records)) {
        records = data.records;
      } else {
        records = [data];
      }

      if (options.maxRows && records.length > options.maxRows) {
        records = records.slice(0, options.maxRows);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      return {
        data: records,
        metadata: {
          totalRows: records.length,
          parsedRows: records.length,
          errorRows: 0,
          encoding: options.encoding || 'utf-8',
          script: this.csvParser['detectScript'](jsonString),
          columns: this.extractColumnsFromJSON(records),
          detectedFormats: this.analyzeJSONDataFormats(records),
          parseErrors: [],
          performance: {
            startTime,
            endTime,
            duration,
            rowsPerSecond: Math.round((records.length / duration) * 1000)
          }
        }
      };
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      return {
        data: [],
        metadata: {
          totalRows: 0,
          parsedRows: 0,
          errorRows: 1,
          encoding: options.encoding || 'utf-8',
          script: 'unknown',
          columns: [],
          detectedFormats: {},
          parseErrors: [{
            row: 0,
            column: '',
            value: input,
            error: error instanceof Error ? error.message : 'Invalid JSON',
            type: 'parsing'
          }],
          performance: {
            startTime,
            endTime,
            duration,
            rowsPerSecond: 0
          }
        }
      };
    }
  }

  /**
   * Stringify data to JSON with Serbian character preservation
   */
  stringify(data: any[], options: SerbianParseOptions = {}): string {
    return JSON.stringify(data, null, 2);
  }

  private extractColumnsFromJSON(records: any[]): string[] {
    if (records.length === 0) return [];
    return Object.keys(records[0]);
  }

  private analyzeJSONDataFormats(data: any[]): Record<string, string> {
    return this.csvParser['analyzeDataFormats'](data);
  }
}

// Supporting interfaces
export interface ValidationError {
  type: 'validation' | 'format' | 'parsing' | 'encoding';
  row: number;
  column: string;
  value: string;
  message: string;
}

export interface ValidationWarning {
  type: 'format' | 'consistency' | 'quality';
  row: number;
  column: string;
  value: string;
  message: string;
}

export interface ValidationStats {
  totalRows: number;
  validJMBG: number;
  invalidJMBG: number;
  validPIB: number;
  invalidPIB: number;
  validDates: number;
  invalidDates: number;
  scriptConsistency: number;
  encodingIssues: number;
}