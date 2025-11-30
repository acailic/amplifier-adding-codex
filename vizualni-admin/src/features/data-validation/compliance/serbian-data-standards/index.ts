/**
 * Serbian Government Data Standards Compliance Module
 *
 * Complete implementation for Serbian open data compliance including:
 * - Zakon o slobodnom pristupu informacijama compliance
 * - Pravilnik o otvorenim podacima implementation
 * - data.gov.rs API integration with caching
 * - Serbian metadata standards (Dublin Core adaptation)
 * - Optimized CSV/JSON parsers for Serbian data
 * - Comprehensive quality metrics for Serbian government data
 * - Serbian-compliant export capabilities
 */

// Core exports
export { SerbianDataStandardsCompliance } from './core';
export type {
  ComplianceResult,
  ComplianceCategory,
  SerbianComplianceCategory,
  SerbianMetadataSchema,
  SerbianLocalizedString,
  GovernmentInstitution,
  SerbianGovernmentTheme,
  SerbianDataQuality,
  Recommendation,
  ValidationError,
  ComplianceConfig,
  QuickComplianceResult,
  ComplianceReport
} from './models';

// Metadata adapter exports
export { SerbianMetadataAdapter } from './metadata-adapter';

// Data parsers exports
export {
  SerbianCSVParser,
  SerbianJSONParser
} from './data-parsers';
export type {
  SerbianParseOptions,
  SerbianParseResult,
  ParseError,
  ValidationError as DataParseValidationError,
  ValidationWarning,
  ValidationStats
} from './data-parsers';

// Quality analyzer exports
export { SerbianQualityAnalyzer } from './quality-analyzer';

// Additional validator exports (stubs for completeness)
export { SerbianLegalFrameworkValidator } from './legal-validator';
export { SerbianDataFormatValidator } from './format-validator';
export { SerbianAccessibilityValidator } from './accessibility-validator';
export { SerbianEUHarmonizationValidator } from './eu-harmonization-validator';

// Main convenience exports
export class SerbianComplianceSuite {
  private static instance: SerbianComplianceSuite;
  private complianceEngine: SerbianDataStandardsCompliance;
  private metadataAdapter: SerbianMetadataAdapter;
  private csvParser: SerbianCSVParser;
  private jsonParser: SerbianJSONParser;
  private qualityAnalyzer: SerbianQualityAnalyzer;

  private constructor() {
    this.complianceEngine = new SerbianDataStandardsCompliance();
    this.metadataAdapter = new SerbianMetadataAdapter();
    this.csvParser = new SerbianCSVParser();
    this.jsonParser = new SerbianJSONParser();
    this.qualityAnalyzer = new SerbianQualityAnalyzer();
  }

  public static getInstance(): SerbianComplianceSuite {
    if (!SerbianComplianceSuite.instance) {
      SerbianComplianceSuite.instance = new SerbianComplianceSuite();
    }
    return SerbianComplianceSuite.instance;
  }

  /**
   * Complete Serbian compliance workflow
   */
  async fullComplianceWorkflow(
    data: unknown[],
    metadata?: Partial<SerbianMetadataSchema>,
    options: SerbianParseOptions & ComplianceConfig = {}
  ): Promise<{
    complianceResult: ComplianceResult;
    qualityMetrics: SerbianDataQuality;
    enhancedMetadata: Partial<SerbianMetadataSchema>;
    parseResult?: SerbianParseResult;
    recommendations: Recommendation[];
  }> {
    // Step 1: Parse and validate data if it's raw input
    let parseResult: SerbianParseResult | undefined;
    let processedData = data;

    if (typeof data === 'string' || Buffer.isBuffer(data)) {
      // Determine if it's CSV or JSON
      const dataString = typeof data === 'string' ? data : data.toString();
      const isCSV = dataString.includes(',') || dataString.includes(';');

      if (isCSV) {
        parseResult = await this.csvParser.parse(data, options);
        processedData = parseResult.data;
      } else {
        parseResult = await this.jsonParser.parse(data, options);
        processedData = parseResult.data;
      }
    }

    // Step 2: Enhance metadata with Serbian standards
    const enhancedMetadata = this.metadataAdapter.enhanceSerbianMetadata(metadata || {});

    // Step 3: Calculate quality metrics
    const qualityMetrics = await this.qualityAnalyzer.calculateSerbianDataQuality(
      processedData,
      enhancedMetadata
    );

    // Step 4: Run compliance validation
    const complianceResult = await this.complianceEngine.validateDataset(
      processedData,
      enhancedMetadata,
      options
    );

    // Step 5: Generate comprehensive recommendations
    const qualityRecommendations = this.qualityAnalyzer.generateQualityRecommendations(qualityMetrics);
    const recommendations = [
      ...complianceResult.recommendations,
      ...qualityRecommendations
    ].sort((a, b) => {
      const priorityOrder = { critical: 3, major: 2, minor: 1 };
      return priorityOrder[b.type] - priorityOrder[a.type];
    });

    return {
      complianceResult,
      qualityMetrics,
      enhancedMetadata,
      parseResult,
      recommendations
    };
  }

  /**
   * Quick compliance check for metadata only
   */
  async quickComplianceCheck(
    metadata: Partial<SerbianMetadataSchema>
  ): Promise<QuickComplianceResult> {
    return this.complianceEngine.quickCheck(metadata);
  }

  /**
   * Parse Serbian CSV data
   */
  async parseSerbianCSV<T = any>(
    input: string | Buffer,
    options?: SerbianParseOptions
  ): Promise<SerbianParseResult<T>> {
    return this.csvParser.parse<T>(input, options);
  }

  /**
   * Parse Serbian JSON data
   */
  async parseSerbianJSON<T = any>(
    input: string | Buffer,
    options?: SerbianParseOptions
  ): Promise<SerbianParseResult<T>> {
    return this.jsonParser.parse<T>(input, options);
  }

  /**
   * Export data in Serbian-compliant format
   */
  exportToSerbianFormat(
    data: unknown[],
    format: 'csv' | 'json' | 'dcat' | 'dublin-core',
    metadata?: Partial<SerbianMetadataSchema>,
    options?: SerbianParseOptions
  ): string {
    const enhancedMetadata = this.metadataAdapter.enhanceSerbianMetadata(metadata || {});

    switch (format) {
      case 'csv':
        return this.csvParser.stringify(data, options);
      case 'json':
        return this.jsonParser.stringify(data, options);
      case 'dcat':
        return JSON.stringify(this.metadataAdapter.adaptToDCAT(enhancedMetadata), null, 2);
      case 'dublin-core':
        return JSON.stringify(this.metadataAdapter.adaptToDublinCore(enhancedMetadata), null, 2);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate comprehensive compliance report
   */
  generateComplianceReport(
    complianceResult: ComplianceResult,
    qualityMetrics?: SerbianDataQuality
  ): ComplianceReport {
    const baseReport = this.complianceEngine.generateComplianceReport(complianceResult);

    if (qualityMetrics) {
      return {
        ...baseReport,
        qualityMetrics: {
          overallScore: qualityMetrics.overallScore,
          categories: {
            completeness: qualityMetrics.completeness.score,
            accuracy: qualityMetrics.accuracy.score,
            consistency: qualityMetrics.consistency.score,
            timeliness: qualityMetrics.timeliness.score,
            relevance: qualityMetrics.relevance.score,
            serbianSpecificity: qualityMetrics.serbianSpecificity.score
          },
          serbianSpecificity: qualityMetrics.serbianSpecificity
        }
      };
    }

    return baseReport;
  }

  // Access to individual components
  getComplianceEngine(): SerbianDataStandardsCompliance {
    return this.complianceEngine;
  }

  getMetadataAdapter(): SerbianMetadataAdapter {
    return this.metadataAdapter;
  }

  getCSVParser(): SerbianCSVParser {
    return this.csvParser;
  }

  getJSONParser(): SerbianJSONParser {
    return this.jsonParser;
  }

  getQualityAnalyzer(): SerbianQualityAnalyzer {
    return this.qualityAnalyzer;
  }
}

// Default export for convenience
export default SerbianComplianceSuite;

// Utility functions
export const createSerbianComplianceSuite = (): SerbianComplianceSuite => {
  return SerbianComplianceSuite.getInstance();
};

export const validateSerbianDataset = async (
  data: unknown[],
  metadata?: Partial<SerbianMetadataSchema>,
  options?: SerbianParseOptions & ComplianceConfig
) => {
  const suite = createSerbianComplianceSuite();
  return suite.fullComplianceWorkflow(data, metadata, options);
};

export const parseSerbianData = async (
  input: string | Buffer,
  options?: SerbianParseOptions
) => {
  const suite = createSerbianComplianceSuite();

  // Auto-detect format
  const dataString = typeof input === 'string' ? input : input.toString();
  const isCSV = dataString.includes(',') || dataString.includes(';') || dataString.includes('\t');

  if (isCSV) {
    return suite.parseSerbianCSV(input, options);
  } else {
    return suite.parseSerbianJSON(input, options);
  }
};

export const exportSerbianData = (
  data: unknown[],
  format: 'csv' | 'json' | 'dcat' | 'dublin-core',
  metadata?: Partial<SerbianMetadataSchema>,
  options?: SerbianParseOptions
) => {
  const suite = createSerbianComplianceSuite();
  return suite.exportToSerbianFormat(data, format, metadata, options);
};

// React hooks for integration with React applications
export const useSerbianCompliance = () => {
  const suite = createSerbianComplianceSuite();

  return {
    validateDataset: suite.fullComplianceWorkflow.bind(suite),
    quickCheck: suite.quickComplianceCheck.bind(suite),
    parseCSV: suite.parseSerbianCSV.bind(suite),
    parseJSON: suite.parseSerbianJSON.bind(suite),
    exportData: suite.exportToSerbianFormat.bind(suite),
    generateReport: suite.generateComplianceReport.bind(suite)
  };
};