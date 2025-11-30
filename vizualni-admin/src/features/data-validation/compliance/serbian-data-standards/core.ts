import {
  ComplianceResult,
  ComplianceCategory,
  SerbianComplianceCategory,
  SerbianMetadataSchema,
  DatasetMetadata,
  SerbianDataQuality,
  ValidationError,
  Recommendation,
  ComplianceMetadata
} from './models';
import { SerbianQualityAnalyzer } from './quality-analyzer';
import { SerbianMetadataValidator } from './metadata-validator';
import { SerbianDataFormatValidator } from './format-validator';
import { SerbianLegalFrameworkValidator } from './legal-validator';
import { SerbianAccessibilityValidator } from './accessibility-validator';
import { SerbianEUHarmonizationValidator } from './eu-harmonization-validator';
import { v4 as uuidv4 } from 'uuid';

/**
 * Core Serbian Data Standards Compliance Engine
 *
 * Implements comprehensive compliance checking against:
 * - Zakon o slobodnom pristupu informacijama od javnog značaja
 * - Pravilnik o otvorenim podacima
 * - data.gov.rs technical standards
 * - Open Data Strategy of the Republic of Serbia 2023-2027
 * - EU Data Standards Harmonization requirements
 */
export class SerbianDataStandardsCompliance {
  private readonly validators: Map<SerbianComplianceCategory, ComplianceValidator>;
  private readonly version = '1.0.0';
  private readonly standardsVersion = '2024.1';

  constructor() {
    this.validators = new Map([
      ['legal-framework', new SerbianLegalFrameworkValidator()],
      ['data-format', new SerbianDataFormatValidator()],
      ['metadata-standards', new SerbianMetadataValidator()],
      ['quality-assurance', new SerbianQualityAnalyzer()],
      ['accessibility', new SerbianAccessibilityValidator()],
      ['technical-specs', new SerbianDataFormatValidator()], // Reuse for data.gov.rs specs
      ['eu-harmonization', new SerbianEUHarmonizationValidator()],
      ['privacy-security', new SerbianLegalFrameworkValidator()], // Reuse for privacy
      ['open-license', new SerbianLegalFrameworkValidator()], // Reuse for licensing
      ['documentation', new SerbianMetadataValidator()], // Reuse for documentation
    ]);
  }

  /**
   * Comprehensive dataset compliance validation
   *
   * @param dataset Raw data requiring compliance validation
   * @param metadata Dataset metadata for standards verification
   * @param config Optional configuration for validation
   * @returns Detailed compliance assessment with recommendations
   */
  async validateDataset(
    dataset: unknown[],
    metadata?: Partial<SerbianMetadataSchema>,
    config: ComplianceConfig = {}
  ): Promise<ComplianceResult> {
    const startTime = Date.now();
    const datasetId = metadata?.identifier || uuidv4();

    const categories: ComplianceCategory[] = [];
    const allRecommendations: Recommendation[] = [];
    const allValidationErrors: ValidationError[] = [];

    // Validate each compliance category
    for (const [categoryName, validator] of this.validators) {
      try {
        const categoryResult = await validator.validate({
          data: dataset,
          metadata: metadata || {},
          config,
          datasetId
        });

        categories.push(categoryResult.category);
        allRecommendations.push(...categoryResult.recommendations);
        allValidationErrors.push(...categoryResult.errors);
      } catch (error) {
        const errorCategory: ComplianceCategory = {
          name: categoryName,
          score: 0,
          weight: this.getCategoryWeight(categoryName),
          requirements: [],
          status: 'non-compliant'
        };
        categories.push(errorCategory);

        allValidationErrors.push({
          code: 'VALIDATION_ERROR',
          message: `Validation failed for ${categoryName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
          category: categoryName
        });
      }
    }

    // Calculate overall compliance score
    const overallScore = this.calculateOverallScore(categories);
    const isCompliant = overallScore >= 80; // Serbian compliance threshold

    const duration = Date.now() - startTime;

    const complianceMetadata: ComplianceMetadata = {
      validatorVersion: this.version,
      standardsVersion: this.standardsVersion,
      validationDuration: duration,
      datasetSize: dataset?.length || 0,
      processingMethod: this.determineProcessingMethod(dataset)
    };

    return {
      id: uuidv4(),
      timestamp: new Date(),
      datasetId,
      overallScore,
      isCompliant,
      categories,
      recommendations: this.prioritizeRecommendations(allRecommendations),
      validationErrors: allValidationErrors,
      metadata: complianceMetadata
    };
  }

  /**
   * Quick compliance check without full validation
   *
   * @param metadata Dataset metadata for quick verification
   * @returns Basic compliance assessment
   */
  async quickCheck(metadata: Partial<SerbianMetadataSchema>): Promise<QuickComplianceResult> {
    const requiredFields = [
      'identifier',
      'title',
      'description',
      'publisher',
      'publicationDate',
      'language',
      'license'
    ];

    const missingFields = requiredFields.filter(field => !(field in metadata));
    const hasSerbianLanguage = metadata.language?.includes('sr') || metadata.language?.includes('sr-Latn');
    const hasValidLicense = metadata.license?.identifier !== undefined;

    const quickScore = Math.max(0, 100 - (missingFields.length * 10) - (!hasSerbianLanguage ? 20 : 0) - (!hasValidLicense ? 15 : 0));

    return {
      compliant: quickScore >= 70,
      score: quickScore,
      missingFields,
      recommendations: this.generateQuickRecommendations(missingFields, hasSerbianLanguage, hasValidLicense),
      estimatedFullValidationTime: this.estimateValidationTime(metadata)
    };
  }

  /**
   * Generate comprehensive compliance report
   *
   * @param complianceResult Full compliance validation result
   * @returns Formatted compliance report with Serbian government standards
   */
  generateComplianceReport(complianceResult: ComplianceResult): ComplianceReport {
    const reportDate = new Date().toLocaleDateString('sr-RS');

    return {
      title: {
        sr: `Извештај о усаглашености са српским стандардима отворених података`,
        'sr-Latn': 'Izveštaj o usaglašenosti sa srpskim standardima otvorenih podataka',
        en: 'Serbian Open Data Standards Compliance Report'
      },
      generated: complianceResult.timestamp,
      dataset: {
        id: complianceResult.datasetId,
        overallScore: complianceResult.overallScore,
        status: complianceResult.isCompliant ? 'Compliant' : 'Non-Compliant',
        categories: complianceResult.categories.map(cat => ({
          name: cat.name,
          score: cat.score,
          status: cat.status,
          requirements: cat.requirements.length,
          passed: cat.requirements.filter(req => req.status === 'pass').length
        }))
      },
      recommendations: complianceResult.recommendations,
      legalFramework: {
        zakonPristupInformacijama: this.getLegalFrameworkStatus('legal-framework', complianceResult),
        pravilnikOtvoreniPodaci: this.getLegalFrameworkStatus('data-format', complianceResult),
        dataGovRsStandards: this.getLegalFrameworkStatus('technical-specs', complianceResult),
        euHarmonization: this.getLegalFrameworkStatus('eu-harmonization', complianceResult)
      },
      nextSteps: this.generateNextSteps(complianceResult)
    };
  }

  private getCategoryWeight(category: SerbianComplianceCategory): number {
    const weights: Record<SerbianComplianceCategory, number> = {
      'legal-framework': 0.20,      // Highest weight - legal compliance
      'data-format': 0.15,          // Technical requirements
      'metadata-standards': 0.15,    // Serbian metadata schemas
      'quality-assurance': 0.12,     // Data quality
      'accessibility': 0.10,         // WCAG compliance
      'technical-specs': 0.08,       // data.gov.rs specs
      'eu-harmonization': 0.08,      // EU alignment
      'privacy-security': 0.05,      // Data protection
      'open-license': 0.04,          // Licensing requirements
      'documentation': 0.03          // Documentation
    };
    return weights[category] || 0.05;
  }

  private calculateOverallScore(categories: ComplianceCategory[]): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const category of categories) {
      totalScore += category.score * category.weight;
      totalWeight += category.weight;
    }

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) / 100 : 0;
  }

  private prioritizeRecommendations(recommendations: Recommendation[]): Recommendation[] {
    return recommendations.sort((a, b) => {
      // Priority order: critical > major > minor, then by impact
      const priorityOrder = { critical: 3, major: 2, minor: 1 };
      const priorityDiff = priorityOrder[b.type] - priorityOrder[a.type];
      if (priorityDiff !== 0) return priorityDiff;
      return b.estimatedImpact - a.estimatedImpact;
    });
  }

  private determineProcessingMethod(dataset: unknown[]): 'full' | 'sample' | 'streaming' {
    const size = dataset?.length || 0;
    if (size < 1000) return 'full';
    if (size < 10000) return 'sample';
    return 'streaming';
  }

  private generateQuickRecommendations(
    missingFields: string[],
    hasSerbianLanguage: boolean,
    hasValidLicense: boolean
  ): string[] {
    const recommendations: string[] = [];

    if (missingFields.includes('identifier')) {
      recommendations.push('Add unique dataset identifier');
    }
    if (missingFields.includes('title')) {
      recommendations.push('Add dataset title in Serbian and English');
    }
    if (missingFields.includes('description')) {
      recommendations.push('Add comprehensive dataset description');
    }
    if (!hasSerbianLanguage) {
      recommendations.push('Include Serbian language (sr or sr-Latn)');
    }
    if (!hasValidLicense) {
      recommendations.push('Specify open data license');
    }

    return recommendations;
  }

  private estimateValidationTime(metadata: Partial<SerbianMetadataSchema>): number {
    // Simple heuristic for validation time estimation in milliseconds
    const baseTime = 2000; // 2 seconds
    const complexityMultiplier = metadata?.distribution?.length || 1;
    return baseTime * complexityMultiplier;
  }

  private getLegalFrameworkStatus(
    category: SerbianComplianceCategory,
    result: ComplianceResult
  ): LegalFrameworkStatus {
    const categoryResult = result.categories.find(cat => cat.name === category);
    if (!categoryResult) {
      return { status: 'unknown', score: 0, requirements: [] };
    }

    return {
      status: categoryResult.status === 'compliant' ? 'compliant' : 'needs-improvement',
      score: categoryResult.score,
      requirements: categoryResult.requirements.map(req => ({
        name: req.name,
        status: req.status,
        required: req.required
      }))
    };
  }

  private generateNextSteps(result: ComplianceResult): NextStep[] {
    const steps: NextStep[] = [];

    if (result.overallScore < 80) {
      steps.push({
        priority: 'high',
        action: 'Address critical compliance issues',
        description: 'Focus on requirements marked as critical and required by Serbian law',
        estimatedTime: '2-4 weeks'
      });
    }

    const criticalRecommendations = result.recommendations.filter(r => r.type === 'critical');
    if (criticalRecommendations.length > 0) {
      steps.push({
        priority: 'high',
        action: 'Implement critical recommendations',
        description: `Address ${criticalRecommendations.length} critical issues for legal compliance`,
        estimatedTime: '1-2 weeks'
      });
    }

    const euHarmonization = result.categories.find(cat => cat.name === 'eu-harmonization');
    if (euHarmonization && euHarmonization.score < 70) {
      steps.push({
        priority: 'medium',
        action: 'Improve EU harmonization',
        description: 'Align dataset with EU open data standards for better interoperability',
        estimatedTime: '3-4 weeks'
      });
    }

    if (result.validationErrors.filter(e => e.severity === 'error').length > 0) {
      steps.push({
        priority: 'high',
        action: 'Fix validation errors',
        description: 'Resolve technical validation errors before publication',
        estimatedTime: '1 week'
      });
    }

    return steps;
  }
}

// Supporting interfaces
export interface ComplianceConfig {
  strictMode?: boolean;
  includeRecommendations?: boolean;
  validateSampleSize?: number;
  enableCaching?: boolean;
  customThresholds?: Partial<Record<SerbianComplianceCategory, number>>;
}

export interface QuickComplianceResult {
  compliant: boolean;
  score: number;
  missingFields: string[];
  recommendations: string[];
  estimatedFullValidationTime: number;
}

export interface ComplianceReport {
  title: SerbianLocalizedString;
  generated: Date;
  dataset: {
    id: string;
    overallScore: number;
    status: string;
    categories: Array<{
      name: string;
      score: number;
      status: string;
      requirements: number;
      passed: number;
    }>;
  };
  recommendations: Recommendation[];
  legalFramework: {
    zakonPristupInformacijama: LegalFrameworkStatus;
    pravilnikOtvoreniPodaci: LegalFrameworkStatus;
    dataGovRsStandards: LegalFrameworkStatus;
    euHarmonization: LegalFrameworkStatus;
  };
  nextSteps: NextStep[];
}

export interface LegalFrameworkStatus {
  status: 'compliant' | 'needs-improvement' | 'unknown';
  score: number;
  requirements: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    required: boolean;
  }>;
}

export interface NextStep {
  priority: 'high' | 'medium' | 'low';
  action: string;
  description: string;
  estimatedTime: string;
}

// Base validator interface
interface ComplianceValidator {
  validate(context: ValidationContext): Promise<{
    category: ComplianceCategory;
    recommendations: Recommendation[];
    errors: ValidationError[];
  }>;
}

interface ValidationContext {
  data: unknown[];
  metadata: Partial<SerbianMetadataSchema>;
  config: ComplianceConfig;
  datasetId: string;
}

// Serbian-specific string support
interface SerbianLocalizedString {
  sr?: string;
  'sr-Latn'?: string;
  en?: string;
}