import {
  ComplianceCategory,
  ComplianceRequirement,
  Recommendation,
  ValidationError,
  SerbianComplianceCategory
} from './models';
import { ValidationContext, ComplianceValidator } from './core';

/**
 * Serbian Legal Framework Validator
 *
 * Validates compliance with Serbian laws and regulations:
 * - Zakon o slobodnom pristupu informacijama od javnog značaja
 * - Pravilnik o otvorenim podacima
 * - Privacy and data protection laws
 * - Open data licensing requirements
 */
export class SerbianLegalFrameworkValidator implements ComplianceValidator {
  async validate(context: ValidationContext): Promise<{
    category: ComplianceCategory;
    recommendations: Recommendation[];
    errors: ValidationError[];
  }> {
    const requirements: ComplianceRequirement[] = [];
    const recommendations: Recommendation[] = [];
    const errors: ValidationError[] = [];

    // Validate legal framework compliance
    this.validateFreeAccessToInformation(context, requirements, recommendations);
    this.validateOpenDataRegulation(context, requirements, recommendations);
    this.validatePrivacyCompliance(context, requirements, errors);
    this.validateLicensingCompliance(context, requirements, recommendations);
    this.validateDocumentationRequirements(context, requirements, recommendations);

    const score = this.calculateLegalComplianceScore(requirements);
    const status = this.getComplianceStatus(score);

    const category: ComplianceCategory = {
      name: 'legal-framework',
      score,
      weight: 0.20,
      requirements,
      status
    };

    return { category, recommendations, errors };
  }

  private validateFreeAccessToInformation(
    context: ValidationContext,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const { metadata } = context;

    const hasContactInfo = !!(metadata.contactPoint?.email);
    const hasPublicationDate = !!metadata.publicationDate;
    const hasInstitution = !!metadata.publisher;
    const hasIdentifier = !!metadata.identifier;

    requirements.push({
      id: 'legal_free_access_info',
      name: 'Free Access to Information Compliance',
      description: 'Dataset must comply with Zakon o slobodnom pristupu informacijama',
      required: true,
      status: (hasContactInfo && hasPublicationDate && hasInstitution && hasIdentifier) ? 'pass' : 'warning',
      score: this.calculateAccessInfoScore(hasContactInfo, hasPublicationDate, hasInstitution, hasIdentifier),
      evidence: `Contact: ${hasContactInfo}, Date: ${hasPublicationDate}, Institution: ${hasInstitution}, ID: ${hasIdentifier}`
    });

    if (!hasContactInfo) {
      recommendations.push({
        id: 'rec_add_contact_info',
        type: 'critical',
        category: 'legal-framework',
        title: 'Add Contact Information',
        description: 'Free access to information law requires contact details',
        actionSteps: [
          'Add contact point with email and phone',
          'Include responsible person or department',
          'Ensure contact information is current'
        ],
        estimatedImpact: 25,
        implementationComplexity: 'low'
      });
    }
  }

  private validateOpenDataRegulation(
    context: ValidationContext,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const { metadata } = context;

    const hasMachineReadableFormat = metadata.format?.some(f =>
      ['CSV', 'JSON', 'XML', 'application/csv', 'application/json', 'application/xml'].includes(f.format)
    );
    const hasOpenLicense = metadata.license?.identifier && ['CC0', 'CC-BY', 'CC-BY-SA', 'OGL'].some(license =>
      metadata.license?.identifier.toUpperCase().includes(license)
    );
    const hasMetadata = metadata.title && metadata.description && metadata.keywords;

    requirements.push({
      id: 'legal_open_data_regulation',
      name: 'Open Data Regulation Compliance',
      description: 'Must comply with Pravilnik o otvorenim podacima',
      required: true,
      status: (hasMachineReadableFormat && hasOpenLicense && hasMetadata) ? 'pass' : 'warning',
      score: this.calculateOpenDataScore(hasMachineReadableFormat, hasOpenLicense, hasMetadata),
      evidence: `Machine readable: ${hasMachineReadableFormat}, Open license: ${hasOpenLicense}, Metadata: ${hasMetadata}`
    });
  }

  private validatePrivacyCompliance(
    context: ValidationContext,
    requirements: ComplianceRequirement[],
    errors: ValidationError[]
  ): void {
    const { data, metadata } = context;

    // Check for potential personal data
    const hasPersonalData = this.detectPersonalData(data);
    const hasPrivacyStatement = metadata.rights?.privacy || metadata.description?.toLowerCase().includes('privat');

    requirements.push({
      id: 'legal_privacy_compliance',
      name: 'Privacy and Data Protection',
      description: 'Must comply with Serbian data protection laws',
      required: true,
      status: hasPersonalData ? (hasPrivacyStatement ? 'pass' : 'warning') : 'pass',
      score: hasPersonalData ? (hasPrivacyStatement ? 100 : 60) : 100,
      evidence: `Personal data detected: ${hasPersonalData}, Privacy statement: ${hasPrivacyStatement}`
    });

    if (hasPersonalData && !hasPrivacyStatement) {
      errors.push({
        code: 'MISSING_PRIVACY_STATEMENT',
        message: 'Dataset contains personal data but lacks privacy compliance information',
        severity: 'warning',
        category: 'privacy-security'
      });
    }
  }

  private validateLicensingCompliance(
    context: ValidationContext,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const { metadata } = context;

    const hasLicense = !!metadata.license?.identifier;
    const isCompatibleLicense = this.isOpenDataLicense(metadata.license?.identifier);
    const hasAttributionInfo = metadata.license?.name;

    requirements.push({
      id: 'legal_licensing_compliance',
      name: 'Open Data Licensing',
      description: 'Must have appropriate open data license',
      required: true,
      status: (hasLicense && isCompatibleLicense) ? 'pass' : 'warning',
      score: this.calculateLicensingScore(hasLicense, isCompatibleLicense, hasAttributionInfo),
      evidence: `License: ${hasLicense}, Compatible: ${isCompatibleLicense}, Attribution: ${hasAttributionInfo}`
    });

    if (!hasLicense || !isCompatibleLicense) {
      recommendations.push({
        id: 'rec_add_open_license',
        type: 'critical',
        category: 'open-license',
        title: 'Add Open Data License',
        description: 'Specify an open data license compliant with Serbian regulations',
        actionSteps: [
          'Choose CC0, CC-BY, CC-BY-SA, or OGL-RS license',
          'Update license metadata',
          'Include attribution requirements'
        ],
        estimatedImpact: 30,
        implementationComplexity: 'low'
      });
    }
  }

  private validateDocumentationRequirements(
    context: ValidationContext,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const { metadata } = context;

    const hasTitle = !!metadata.title;
    const hasDescription = !!metadata.description;
    const hasKeywords = metadata.keywords && metadata.keywords.length > 0;
    const hasThemes = metadata.theme && metadata.theme.length > 0;

    requirements.push({
      id: 'legal_documentation',
      name: 'Documentation Requirements',
      description: 'Must provide adequate documentation and metadata',
      required: true,
      status: (hasTitle && hasDescription && hasKeywords) ? 'pass' : 'warning',
      score: this.calculateDocumentationScore(hasTitle, hasDescription, hasKeywords, hasThemes),
      evidence: `Title: ${hasTitle}, Description: ${hasDescription}, Keywords: ${hasKeywords}, Themes: ${hasThemes}`
    });
  }

  private detectPersonalData(data: unknown[]): boolean {
    const personalDataPatterns = [
      /\b\d{13}\b/, // JMBG
      /\b\d{9}\b/,  // PIB
      /\b\d{3}-\d{2}-\d{2}\b/, // Phone number
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email
    ];

    const dataString = JSON.stringify(data).toLowerCase();
    return personalDataPatterns.some(pattern => pattern.test(dataString));
  }

  private isOpenDataLicense(licenseIdentifier?: string): boolean {
    if (!licenseIdentifier) return false;
    const openLicenses = ['CC0', 'CC-BY', 'CC-BY-SA', 'ODC-BY', 'ODL', 'OGL'];
    return openLicenses.some(license =>
      licenseIdentifier.toUpperCase().includes(license.toUpperCase())
    );
  }

  private calculateAccessInfoScore(
    hasContactInfo: boolean,
    hasPublicationDate: boolean,
    hasInstitution: boolean,
    hasIdentifier: boolean
  ): number {
    let score = 0;
    if (hasContactInfo) score += 25;
    if (hasPublicationDate) score += 25;
    if (hasInstitution) score += 25;
    if (hasIdentifier) score += 25;
    return score;
  }

  private calculateOpenDataScore(
    hasMachineReadableFormat: boolean,
    hasOpenLicense: boolean,
    hasMetadata: boolean
  ): number {
    let score = 0;
    if (hasMachineReadableFormat) score += 35;
    if (hasOpenLicense) score += 35;
    if (hasMetadata) score += 30;
    return score;
  }

  private calculateLicensingScore(
    hasLicense: boolean,
    isCompatibleLicense: boolean,
    hasAttributionInfo: boolean
  ): number {
    if (!hasLicense) return 0;
    if (!isCompatibleLicense) return 50;
    return hasAttributionInfo ? 100 : 80;
  }

  private calculateDocumentationScore(
    hasTitle: boolean,
    hasDescription: boolean,
    hasKeywords: boolean,
    hasThemes: boolean
  ): number {
    let score = 0;
    if (hasTitle) score += 30;
    if (hasDescription) score += 35;
    if (hasKeywords) score += 20;
    if (hasThemes) score += 15;
    return score;
  }

  private calculateLegalComplianceScore(requirements: ComplianceRequirement[]): number {
    if (requirements.length === 0) return 0;
    const totalScore = requirements.reduce((sum, req) => sum + req.score, 0);
    return Math.round(totalScore / requirements.length);
  }

  private getComplianceStatus(score: number): 'compliant' | 'partial' | 'non-compliant' {
    if (score >= 90) return 'compliant';
    if (score >= 60) return 'partial';
    return 'non-compliant';
  }
}