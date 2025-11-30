import {
  ComplianceCategory,
  ComplianceRequirement,
  Recommendation,
  ValidationError,
  SerbianComplianceCategory
} from './models';
import { ValidationContext, ComplianceValidator } from './core';

/**
 * Serbian Data Format Validator
 *
 * Validates compliance with data.gov.rs technical specifications:
 * - Open, machine-readable formats
 * - Standard encoding and compression
 * - File size and structure requirements
 * - Technical specifications compliance
 */
export class SerbianDataFormatValidator implements ComplianceValidator {
  private readonly supportedFormats = [
    'CSV', 'JSON', 'XML', 'RDF', 'TTL', 'N3',
    'application/csv', 'application/json', 'application/xml',
    'text/csv', 'text/plain', 'application/rdf+xml',
    'text/turtle', 'text/n3'
  ];

  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly recommendedFormats = ['CSV', 'JSON', 'XML'];

  async validate(context: ValidationContext): Promise<{
    category: ComplianceCategory;
    recommendations: Recommendation[];
    errors: ValidationError[];
  }> {
    const { metadata } = context;
    const requirements: ComplianceRequirement[] = [];
    const recommendations: Recommendation[] = [];
    const errors: ValidationError[] = [];

    // Validate data formats
    this.validateFormats(metadata, requirements, recommendations, errors);

    // Validate encoding
    this.validateEncoding(metadata, requirements, recommendations);

    // Validate compression
    this.validateCompression(metadata, requirements, recommendations);

    // Validate file size
    this.validateFileSize(metadata, requirements, recommendations);

    // Validate technical specifications
    this.validateTechnicalSpecs(metadata, requirements, recommendations);

    const score = this.calculateFormatScore(requirements);
    const status = this.getComplianceStatus(score);

    const category: ComplianceCategory = {
      name: context.config.category === 'technical-specs' ? 'technical-specs' : 'data-format',
      score,
      weight: context.config.category === 'technical-specs' ? 0.08 : 0.15,
      requirements,
      status
    };

    return { category, recommendations, errors };
  }

  private validateFormats(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[],
    errors: ValidationError[]
  ): void {
    if (!metadata.format || metadata.format.length === 0) {
      requirements.push({
        id: 'format_missing',
        name: 'Data Format Specification',
        description: 'Dataset must specify data formats',
        required: true,
        status: 'fail',
        score: 0,
        errorMessage: 'No data formats specified'
      });

      errors.push({
        code: 'MISSING_FORMAT',
        message: 'Data formats must be specified',
        severity: 'error',
        field: 'format',
        category: 'data-format'
      });
      return;
    }

    const hasOpenFormat = metadata.format.some((f: any) =>
      this.supportedFormats.includes(f.format) || this.supportedFormats.includes(f.format?.toLowerCase())
    );
    const hasRecommendedFormat = metadata.format.some((f: any) =>
      this.recommendedFormats.includes(f.format?.toUpperCase())
    );
    const hasMachineReadableFormat = metadata.format.some((f: any) =>
      !['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'].includes(f.format?.toUpperCase())
    );

    requirements.push({
      id: 'format_open',
      name: 'Open Data Formats',
      description: 'Dataset must use open, machine-readable formats',
      required: true,
      status: (hasOpenFormat && hasMachineReadableFormat) ? 'pass' : 'warning',
      score: this.calculateFormatScore(hasOpenFormat, hasRecommendedFormat, hasMachineReadableFormat),
      evidence: `Open format: ${hasOpenFormat}, Recommended: ${hasRecommendedFormat}, Machine readable: ${hasMachineReadableFormat}`
    });

    if (!hasOpenFormat) {
      recommendations.push({
        id: 'rec_use_open_formats',
        type: 'critical',
        category: 'data-format',
        title: 'Use Open Data Formats',
        description: 'Convert dataset to open, machine-readable formats',
        actionSteps: [
          'Convert Excel files to CSV format',
          'Convert PDF documents to structured data',
          'Use JSON or XML for complex data structures',
          'Provide data in multiple formats for accessibility'
        ],
        estimatedImpact: 35,
        implementationComplexity: 'medium'
      });
    }

    if (!hasRecommendedFormat) {
      recommendations.push({
        id: 'rec_use_recommended_formats',
        type: 'major',
        category: 'data-format',
        title: 'Use Recommended Formats',
        description: 'Use CSV, JSON, or XML for better compatibility',
        actionSteps: [
          'Prioritize CSV for tabular data',
          'Use JSON for structured/hierarchical data',
          'Use XML for document-based data',
          'Ensure UTF-8 encoding for all formats'
        ],
        estimatedImpact: 20,
        implementationComplexity: 'low'
      });
    }
  }

  private validateEncoding(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasUTF8Encoding = metadata.format?.every((f: any) =>
      !f.encoding || f.encoding.toLowerCase() === 'utf-8'
    );

    requirements.push({
      id: 'format_encoding',
      name: 'Character Encoding',
      description: 'Data must use UTF-8 encoding',
      required: true,
      status: hasUTF8Encoding ? 'pass' : 'warning',
      score: hasUTF8Encoding ? 100 : 60,
      evidence: `UTF-8 encoding: ${hasUTF8Encoding}`
    });

    if (!hasUTF8Encoding) {
      recommendations.push({
        id: 'rec_use_utf8_encoding',
        type: 'major',
        category: 'data-format',
        title: 'Use UTF-8 Encoding',
        description: 'Convert all data files to UTF-8 encoding',
        actionSteps: [
          'Check current encoding of data files',
          'Convert to UTF-8 if needed',
          'Update metadata encoding information',
          'Test Serbian character display'
        ],
        estimatedImpact: 25,
        implementationComplexity: 'low'
      });
    }
  }

  private validateCompression(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasCompression = metadata.format?.some((f: any) => f.compression);
    const usesStandardCompression = metadata.format?.every((f: any) =>
      !f.compression || ['gzip', 'zip', 'bz2'].includes(f.compression.toLowerCase())
    );

    requirements.push({
      id: 'format_compression',
      name: 'File Compression',
      description: 'Use standard compression formats',
      required: false,
      status: (!hasCompression || usesStandardCompression) ? 'pass' : 'warning',
      score: (!hasCompression || usesStandardCompression) ? 100 : 70,
      evidence: `Has compression: ${hasCompression}, Standard formats: ${usesStandardCompression}`
    });

    if (hasCompression && !usesStandardCompression) {
      recommendations.push({
        id: 'rec_use_standard_compression',
        type: 'minor',
        category: 'data-format',
        title: 'Use Standard Compression',
        description: 'Use gzip, zip, or bz2 for better compatibility',
        actionSteps: [
          'Replace proprietary compression with gzip',
          'Use zip for multiple file archives',
          'Update compression metadata',
          'Test file extraction'
        ],
        estimatedImpact: 15,
        implementationComplexity: 'low'
      });
    }
  }

  private validateFileSize(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    // Check distribution sizes
    const distributions = metadata.distribution || [];
    const hasLargeFiles = distributions.some((d: any) => d.size && d.size > this.maxFileSize);
    const totalSize = distributions.reduce((sum: number, d: any) => sum + (d.size || 0), 0);

    requirements.push({
      id: 'format_file_size',
      name: 'File Size Limits',
      description: 'Files should be reasonably sized for download',
      required: true,
      status: !hasLargeFiles ? 'pass' : 'warning',
      score: !hasLargeFiles ? 100 : 70,
      evidence: `Large files detected: ${hasLargeFiles}, Total size: ${this.formatFileSize(totalSize)}`
    });

    if (hasLargeFiles) {
      recommendations.push({
        id: 'rec_optimize_file_sizes',
        type: 'major',
        category: 'data-format',
        title: 'Optimize File Sizes',
        description: 'Reduce file sizes or provide data in chunks',
        actionSteps: [
          'Compress files where appropriate',
          'Consider providing data in chunks',
          'Use more efficient data formats',
          'Provide data samples for large datasets'
        ],
        estimatedImpact: 20,
        implementationComplexity: 'medium'
      });
    }
  }

  private validateTechnicalSpecs(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasSchema = metadata.format?.some((f: any) => f.schema);
    const hasStructureDocumentation = metadata.description && metadata.description.length > 100;
    const hasFieldDescriptions = metadata.keywords && metadata.keywords.length >= 3;

    requirements.push({
      id: 'format_technical_specs',
      name: 'Technical Documentation',
      description: 'Provide schema and documentation for data formats',
      required: true,
      status: (hasSchema || hasStructureDocumentation) ? 'pass' : 'warning',
      score: this.calculateTechnicalSpecsScore(hasSchema, hasStructureDocumentation, hasFieldDescriptions),
      evidence: `Has schema: ${hasSchema}, Has documentation: ${hasStructureDocumentation}, Has keywords: ${hasFieldDescriptions}`
    });

    if (!hasSchema && !hasStructureDocumentation) {
      recommendations.push({
        id: 'rec_add_technical_documentation',
        type: 'major',
        category: 'data-format',
        title: 'Add Technical Documentation',
        description: 'Provide schema and field descriptions',
        actionSteps: [
          'Create data schema documentation',
          'Describe each field and its format',
          'Provide examples of expected values',
          'Document any special formatting rules'
        ],
        estimatedImpact: 20,
        implementationComplexity: 'medium'
      });
    }
  }

  private calculateFormatScore(
    hasOpenFormat: boolean,
    hasRecommendedFormat: boolean,
    hasMachineReadableFormat: boolean
  ): number {
    let score = 0;
    if (hasOpenFormat) score += 40;
    if (hasRecommendedFormat) score += 30;
    if (hasMachineReadableFormat) score += 30;
    return score;
  }

  private calculateTechnicalSpecsScore(
    hasSchema: boolean,
    hasStructureDocumentation: boolean,
    hasFieldDescriptions: boolean
  ): number {
    let score = 0;
    if (hasSchema) score += 50;
    if (hasStructureDocumentation) score += 30;
    if (hasFieldDescriptions) score += 20;
    return score;
  }

  private calculateFormatScore(requirements: ComplianceRequirement[]): number {
    if (requirements.length === 0) return 0;
    const totalScore = requirements.reduce((sum, req) => sum + req.score, 0);
    return Math.round(totalScore / requirements.length);
  }

  private getComplianceStatus(score: number): 'compliant' | 'partial' | 'non-compliant' {
    if (score >= 85) return 'compliant';
    if (score >= 60) return 'partial';
    return 'non-compliant';
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}