import {
  ComplianceCategory,
  ComplianceRequirement,
  Recommendation,
  ValidationError,
  SerbianComplianceCategory
} from './models';
import { ValidationContext, ComplianceValidator } from './core';

/**
 * Serbian Accessibility Validator
 *
 * Validates compliance with Serbian accessibility standards and WCAG:
 * - Web Content Accessibility Guidelines (WCAG) compliance
 * - Serbian accessibility legislation
 * - Alternative text and descriptions
 * - Multi-language support for accessibility
 */
export class SerbianAccessibilityValidator implements ComplianceValidator {
  async validate(context: ValidationContext): Promise<{
    category: ComplianceCategory;
    recommendations: Recommendation[];
    errors: ValidationError[];
  }> {
    const { metadata } = context;
    const requirements: ComplianceRequirement[] = [];
    const recommendations: Recommendation[] = [];
    const errors: ValidationError[] = [];

    // Validate accessibility metadata
    this.validateAccessibilityMetadata(metadata, requirements, recommendations);

    // Validate multi-language support
    this.validateMultiLanguageSupport(metadata, requirements, recommendations);

    // Validate alternative formats
    this.validateAlternativeFormats(metadata, requirements, recommendations);

    // Validate cognitive accessibility
    this.validateCognitiveAccessibility(metadata, requirements, recommendations);

    // Validate Serbian accessibility requirements
    this.validateSerbianAccessibility(metadata, requirements, recommendations);

    const score = this.calculateAccessibilityScore(requirements);
    const status = this.getComplianceStatus(score);

    const category: ComplianceCategory = {
      name: 'accessibility',
      score,
      weight: 0.10,
      requirements,
      status
    };

    return { category, recommendations, errors };
  }

  private validateAccessibilityMetadata(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasAccessibilityInfo = metadata.accessibility || metadata.conformsTo?.some((c: any) =>
      c.identifier?.includes('WCAG') || c.title?.sr?.includes('приступачност')
    );
    const hasWCAGCompliance = this.hasWCAGCompliance(metadata);
    const hasAccessibleFormat = metadata.format?.some((f: any) =>
      ['CSV', 'JSON', 'text/plain', 'text/csv'].includes(f.format)
    );

    requirements.push({
      id: 'accessibility_metadata',
      name: 'Accessibility Information',
      description: 'Provide accessibility and WCAG compliance information',
      required: true,
      status: (hasAccessibilityInfo || hasWCAGCompliance) ? 'pass' : 'warning',
      score: this.calculateAccessibilityScore(hasAccessibilityInfo, hasWCAGCompliance, hasAccessibleFormat),
      evidence: `Accessibility info: ${hasAccessibilityInfo}, WCAG compliance: ${hasWCAGCompliance}, Accessible formats: ${hasAccessibleFormat}`
    });

    if (!hasAccessibilityInfo && !hasWCAGCompliance) {
      recommendations.push({
        id: 'rec_add_accessibility_info',
        type: 'major',
        category: 'accessibility',
        title: 'Add Accessibility Information',
        description: 'Document accessibility features and WCAG compliance level',
        actionSteps: [
          'Specify WCAG compliance level (AA recommended)',
          'Document accessibility features',
          'Provide accessibility contact information',
          'Include accessibility testing results'
        ],
        estimatedImpact: 25,
        implementationComplexity: 'medium'
      });
    }
  }

  private validateMultiLanguageSupport(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasSerbianLanguage = metadata.language?.includes('sr') || metadata.language?.includes('sr-Latn');
    const hasEnglishLanguage = metadata.language?.includes('en');
    const hasMultiLanguageTitles = metadata.title?.sr && metadata.title.en;
    const hasMultiLanguageDescriptions = metadata.description?.sr && metadata.description.en;

    requirements.push({
      id: 'accessibility_multilanguage',
      name: 'Multi-Language Support',
      description: 'Provide data in multiple languages for accessibility',
      required: true,
      status: (hasSerbianLanguage && hasEnglishLanguage) ? 'pass' : 'warning',
      score: this.calculateMultiLanguageScore(hasSerbianLanguage, hasEnglishLanguage, hasMultiLanguageTitles, hasMultiLanguageDescriptions),
      evidence: `Serbian: ${hasSerbianLanguage}, English: ${hasEnglishLanguage}, Multi titles: ${hasMultiLanguageTitles}, Multi descriptions: ${hasMultiLanguageDescriptions}`
    });

    if (!hasEnglishLanguage) {
      recommendations.push({
        id: 'rec_add_english_support',
        type: 'major',
        category: 'accessibility',
        title: 'Add English Language Support',
        description: 'Provide English translations for broader accessibility',
        actionSteps: [
          'Add English title and description',
          'Translate key field names and values',
          'Provide bilingual metadata',
          'Consider providing data in both languages'
        ],
        estimatedImpact: 20,
        implementationComplexity: 'medium'
      });
    }
  }

  private validateAlternativeFormats(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasMachineReadableFormat = metadata.format?.some((f: any) =>
      ['CSV', 'JSON', 'XML'].includes(f.format.toUpperCase())
    );
    const hasPlainText = metadata.format?.some((f: any) =>
      ['text/plain', 'text/csv'].includes(f.format)
    );
    const hasDocumentation = metadata.distribution?.some((d: any) =>
      d.title?.toLowerCase().includes('documentation') || d.title?.toLowerCase().includes('uputstvo')
    );

    requirements.push({
      id: 'accessibility_alternative_formats',
      name: 'Alternative Formats',
      description: 'Provide data in accessible alternative formats',
      required: true,
      status: (hasMachineReadableFormat && hasPlainText) ? 'pass' : 'warning',
      score: this.calculateAlternativeFormatScore(hasMachineReadableFormat, hasPlainText, hasDocumentation),
      evidence: `Machine readable: ${hasMachineReadableFormat}, Plain text: ${hasPlainText}, Documentation: ${hasDocumentation}`
    });

    if (!hasPlainText) {
      recommendations.push({
        id: 'rec_add_plain_text_format',
        type: 'major',
        category: 'accessibility',
        title: 'Add Plain Text Format',
        description: 'Provide data in plain text format for screen readers',
        actionSteps: [
          'Convert data to CSV or plain text format',
          'Ensure UTF-8 encoding',
          'Provide column headers in accessible format',
          'Add data dictionary in plain text'
        ],
        estimatedImpact: 20,
        implementationComplexity: 'low'
      });
    }
  }

  private validateCognitiveAccessibility(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasClearDescription = metadata.description && metadata.description.sr && metadata.description.sr.length > 100;
    const hasKeywords = metadata.keywords && metadata.keywords.length >= 3;
    const hasThematicClassification = metadata.theme && metadata.theme.length > 0;

    requirements.push({
      id: 'accessibility_cognitive',
      name: 'Cognitive Accessibility',
      description: 'Ensure data is understandable for users with cognitive disabilities',
      required: true,
      status: (hasClearDescription && hasKeywords && hasThematicClassification) ? 'pass' : 'warning',
      score: this.calculateCognitiveAccessibilityScore(hasClearDescription, hasKeywords, hasThematicClassification),
      evidence: `Clear description: ${hasClearDescription}, Keywords: ${hasKeywords}, Themes: ${hasThematicClassification}`
    });

    if (!hasClearDescription || !hasKeywords) {
      recommendations.push({
        id: 'rec_improve_cognitive_accessibility',
        type: 'minor',
        category: 'accessibility',
        title: 'Improve Cognitive Accessibility',
        description: 'Make data easier to understand and navigate',
        actionSteps: [
          'Write clear, simple descriptions',
          'Add relevant keywords and tags',
          'Use consistent terminology',
          'Provide data examples and explanations'
        ],
        estimatedImpact: 15,
        implementationComplexity: 'low'
      });
    }
  }

  private validateSerbianAccessibility(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasSerbianScriptVariety = metadata.title?.sr && metadata.title['sr-Latn'];
    const hasSerbianContact = metadata.contactPoint?.name && this.isSerbianName(metadata.contactPoint.name);
    const hasSerbianInstitution = metadata.publisher?.name?.sr;

    requirements.push({
      id: 'accessibility_serbian',
      name: 'Serbian Accessibility Standards',
      description: 'Comply with Serbian accessibility legislation',
      required: true,
      status: (hasSerbianScriptVariety && hasSerbianContact && hasSerbianInstitution) ? 'pass' : 'warning',
      score: this.calculateSerbianAccessibilityScore(hasSerbianScriptVariety, hasSerbianContact, hasSerbianInstitution),
      evidence: `Script variety: ${hasSerbianScriptVariety}, Serbian contact: ${hasSerbianContact}, Serbian institution: ${hasSerbianInstitution}`
    });

    if (!hasSerbianScriptVariety) {
      recommendations.push({
        id: 'rec_add_script_variety',
        type: 'minor',
        category: 'accessibility',
        title: 'Add Serbian Script Variety',
        description: 'Provide both Cyrillic and Latin scripts for Serbian accessibility',
        actionSteps: [
          'Add Latin script version of titles and descriptions',
          'Consider providing data in both scripts',
          'Include script preference in metadata',
          'Document script conversion process'
        ],
        estimatedImpact: 15,
        implementationComplexity: 'low'
      });
    }
  }

  private hasWCAGCompliance(metadata: any): boolean {
    return metadata.conformsTo?.some((c: any) =>
      c.identifier?.includes('WCAG') ||
      c.title?.sr?.toLowerCase().includes('wcag') ||
      c.title?.en?.toLowerCase().includes('wcag')
    );
  }

  private isSerbianName(name: string): boolean {
    const serbianNamePatterns = [
      /^[А-Ш][а-ш]+(\s+[А-Ш][а-ш]+)+$/, // Cyrillic
      /^[A-ZČĆŽŠĐ][a-zčćžšđ]+(\s+[A-ZČĆŽŠĐ][a-zčćžšđ]+)+$/ // Latin
    ];

    return serbianNamePatterns.some(pattern => pattern.test(name));
  }

  private calculateAccessibilityScore(
    hasAccessibilityInfo: boolean,
    hasWCAGCompliance: boolean,
    hasAccessibleFormat: boolean
  ): number {
    let score = 0;
    if (hasAccessibilityInfo) score += 30;
    if (hasWCAGCompliance) score += 40;
    if (hasAccessibleFormat) score += 30;
    return score;
  }

  private calculateMultiLanguageScore(
    hasSerbianLanguage: boolean,
    hasEnglishLanguage: boolean,
    hasMultiLanguageTitles: boolean,
    hasMultiLanguageDescriptions: boolean
  ): number {
    let score = 0;
    if (hasSerbianLanguage) score += 25;
    if (hasEnglishLanguage) score += 25;
    if (hasMultiLanguageTitles) score += 25;
    if (hasMultiLanguageDescriptions) score += 25;
    return score;
  }

  private calculateAlternativeFormatScore(
    hasMachineReadableFormat: boolean,
    hasPlainText: boolean,
    hasDocumentation: boolean
  ): number {
    let score = 0;
    if (hasMachineReadableFormat) score += 35;
    if (hasPlainText) score += 35;
    if (hasDocumentation) score += 30;
    return score;
  }

  private calculateCognitiveAccessibilityScore(
    hasClearDescription: boolean,
    hasKeywords: boolean,
    hasThematicClassification: boolean
  ): number {
    let score = 0;
    if (hasClearDescription) score += 40;
    if (hasKeywords) score += 30;
    if (hasThematicClassification) score += 30;
    return score;
  }

  private calculateSerbianAccessibilityScore(
    hasSerbianScriptVariety: boolean,
    hasSerbianContact: boolean,
    hasSerbianInstitution: boolean
  ): number {
    let score = 0;
    if (hasSerbianScriptVariety) score += 35;
    if (hasSerbianContact) score += 30;
    if (hasSerbianInstitution) score += 35;
    return score;
  }

  private calculateAccessibilityScore(requirements: ComplianceRequirement[]): number {
    if (requirements.length === 0) return 0;
    const totalScore = requirements.reduce((sum, req) => sum + req.score, 0);
    return Math.round(totalScore / requirements.length);
  }

  private getComplianceStatus(score: number): 'compliant' | 'partial' | 'non-compliant' {
    if (score >= 80) return 'compliant';
    if (score >= 60) return 'partial';
    return 'non-compliant';
  }
}