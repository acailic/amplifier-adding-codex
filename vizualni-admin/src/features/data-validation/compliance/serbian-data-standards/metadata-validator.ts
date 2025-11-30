import {
  SerbianMetadataSchema,
  SerbianLocalizedString,
  GovernmentInstitution,
  SerbianGovernmentTheme,
  ComplianceCategory,
  ComplianceRequirement,
  Recommendation,
  ValidationError,
  SerbianComplianceCategory,
  SerbianGovernmentTheme as GovernmentTheme
} from './models';
import { ValidationContext, ComplianceValidator } from './core';

/**
 * Serbian Government Metadata Standards Validator
 *
 * Validates compliance with Serbian government metadata schemas
 * based on Pravilnik o otvorenim podacima and data.gov.rs standards
 */
export class SerbianMetadataValidator implements ComplianceValidator {
  private readonly requiredMetadataFields = [
    'identifier',
    'title',
    'description',
    'publisher',
    'publicationDate',
    'language',
    'license',
    'contactPoint',
    'distribution'
  ];

  private readonly validLanguages = ['sr', 'sr-Latn', 'en'];
  private readonly validLicenseIdentifiers = [
    'CC0-1.0',
    'CC-BY-4.0',
    'CC-BY-SA-4.0',
    'ODC-BY-1.0',
    'ODL-1.0',
    'OGL-RS-1.0' // Open Government License - Republic of Serbia
  ];

  private readonly serbianGovernmentThemes: GovernmentTheme[] = [
    {
      code: 'ADM',
      name: { sr: 'Администрација', 'sr-Latn': 'Administracija', en: 'Administration' },
      level: 1
    },
    {
      code: 'ECON',
      name: { sr: 'Економија', 'sr-Latn': 'Ekonomija', en: 'Economy' },
      level: 1
    },
    {
      code: 'EDU',
      name: { sr: 'Образовање', 'sr-Latn': 'Obrazovanje', en: 'Education' },
      level: 1
    },
    {
      code: 'HEALTH',
      name: { sr: 'Здравство', 'sr-Latn': 'Zdravstvo', en: 'Health' },
      level: 1
    },
    {
      code: 'ENV',
      name: { sr: 'Животна средина', 'sr-Latn': 'Životna sredina', en: 'Environment' },
      level: 1
    },
    {
      code: 'JUST',
      name: { sr: 'Правосуђе', 'sr-Latn': 'Pravosuđe', en: 'Justice' },
      level: 1
    },
    {
      code: 'SOC',
      name: { sr: 'Социјална заштита', 'sr-Latn': 'Socijalna zaštita', en: 'Social Protection' },
      level: 1
    },
    {
      code: 'SCI',
      name: { sr: 'Наука и технологија', 'sr-Latn': 'Nauka i tehnologija', en: 'Science and Technology' },
      level: 1
    },
    {
      code: 'TRANS',
      name: { sr: 'Саобраћај', 'sr-Latn': 'Saobraćaj', en: 'Transport' },
      level: 1
    },
    {
      code: 'AGR',
      name: { sr: 'Пољопривреда', 'sr-Latn': 'Poljoprivreda', en: 'Agriculture' },
      level: 1
    },
    {
      code: 'TOUR',
      name: { sr: 'Туризам', 'sr-Latn': 'Turizam', en: 'Tourism' },
      level: 1
    },
    {
      code: 'CULT',
      name: { sr: 'Култура', 'sr-Latn': 'Kultura', en: 'Culture' },
      level: 1
    },
    {
      code: 'SPORT',
      name: { sr: 'Спорт', 'sr-Latn': 'Sport', en: 'Sport' },
      level: 1
    }
  ];

  async validate(context: ValidationContext): Promise<{
    category: ComplianceCategory;
    recommendations: Recommendation[];
    errors: ValidationError[];
  }> {
    const { metadata } = context;
    const requirements: ComplianceRequirement[] = [];
    const recommendations: Recommendation[] = [];
    const errors: ValidationError[] = [];

    // Validate required fields
    this.validateRequiredFields(metadata, requirements, errors);

    // Validate Serbian language support
    this.validateSerbianLanguage(metadata, requirements, recommendations);

    // Validate government institution
    this.validateGovernmentInstitution(metadata.publisher, requirements, errors);

    // Validate themes
    this.validateThemes(metadata.theme, requirements, recommendations);

    // Validate license
    this.validateLicense(metadata.license, requirements, errors, recommendations);

    // Validate contact information
    this.validateContactPoint(metadata.contactPoint, requirements, errors);

    // Validate distribution
    this.validateDistribution(metadata.distribution, requirements, errors);

    // Validate quality of metadata
    this.validateMetadataQuality(metadata, requirements, recommendations);

    const score = this.calculateScore(requirements);
    const status = this.getStatus(score);

    const category: ComplianceCategory = {
      name: 'metadata-standards',
      score,
      weight: 0.15,
      requirements,
      status
    };

    return { category, recommendations, errors };
  }

  private validateRequiredFields(
    metadata: Partial<SerbianMetadataSchema>,
    requirements: ComplianceRequirement[],
    errors: ValidationError[]
  ): void {
    for (const field of this.requiredMetadataFields) {
      const hasField = field in metadata && metadata[field] !== undefined;

      requirements.push({
        id: `metadata_${field}`,
        name: `Required Field: ${field}`,
        description: `Serbian metadata standards require ${field} to be present`,
        required: true,
        status: hasField ? 'pass' : 'fail',
        score: hasField ? 100 : 0,
        evidence: hasField ? 'Field is present' : 'Field is missing'
      });

      if (!hasField) {
        errors.push({
          code: 'MISSING_REQUIRED_FIELD',
          message: `Required metadata field '${field}' is missing`,
          severity: 'error',
          field,
          category: 'metadata-standards'
        });
      }
    }
  }

  private validateSerbianLanguage(
    metadata: Partial<SerbianMetadataSchema>,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasSerbian = metadata.language?.includes('sr') || metadata.language?.includes('sr-Latn');
    const titleHasSerbian = this.hasSerbianContent(metadata.title);
    const descriptionHasSerbian = this.hasSerbianContent(metadata.description);

    requirements.push({
      id: 'metadata_serbian_language',
      name: 'Serbian Language Support',
      description: 'Metadata must include Serbian language (Cyrillic or Latin)',
      required: true,
      status: hasSerbian ? 'pass' : 'fail',
      score: hasSerbian ? 100 : 0,
      evidence: hasSerbian ? 'Serbian language included' : 'No Serbian language specified'
    });

    if (!hasSerbian) {
      recommendations.push({
        id: 'rec_add_serbian_language',
        type: 'critical',
        category: 'metadata-standards',
        title: 'Add Serbian Language Support',
        description: 'Serbian government datasets must include Serbian language metadata',
        actionSteps: [
          'Add "sr" or "sr-Latn" to language array',
          'Translate title and description to Serbian',
          'Consider providing both Cyrillic and Latin versions'
        ],
        estimatedImpact: 25,
        implementationComplexity: 'medium'
      });
    }

    if (!titleHasSerbian || !descriptionHasSerbian) {
      recommendations.push({
        id: 'rec_translate_content',
        type: 'major',
        category: 'metadata-standards',
        title: 'Translate Title and Description to Serbian',
        description: 'Provide Serbian translations for better accessibility',
        actionSteps: [
          'Add Serbian title (sr/sr-Latn)',
          'Add Serbian description',
          'Ensure translations are accurate and culturally appropriate'
        ],
        estimatedImpact: 20,
        implementationComplexity: 'medium'
      });
    }
  }

  private validateGovernmentInstitution(
    publisher: GovernmentInstitution | undefined,
    requirements: ComplianceRequirement[],
    errors: ValidationError[]
  ): void {
    if (!publisher) {
      requirements.push({
        id: 'metadata_publisher_missing',
        name: 'Government Institution',
        description: 'Publisher must be a valid Serbian government institution',
        required: true,
        status: 'fail',
        score: 0,
        errorMessage: 'Publisher information is missing'
      });

      errors.push({
        code: 'MISSING_PUBLISHER',
        message: 'Publisher (government institution) is required',
        severity: 'error',
        field: 'publisher',
        category: 'metadata-standards'
      });
      return;
    }

    const hasSerbianName = this.hasSerbianContent(publisher.name);
    const hasValidIdentifier = this.isValidInstitutionIdentifier(publisher.identifier);
    const hasValidType = ['ministry', 'agency', 'public-enterprise', 'local-government', 'independent-institution', 'court', 'public-prosecutor'].includes(publisher.type);

    requirements.push({
      id: 'metadata_publisher_valid',
      name: 'Valid Government Institution',
      description: 'Publisher must be a valid Serbian government entity',
      required: true,
      status: (hasSerbianName && hasValidIdentifier && hasValidType) ? 'pass' : 'fail',
      score: (hasSerbianName && hasValidIdentifier && hasValidType) ? 100 : 50,
      evidence: `Serbian name: ${hasSerbianName}, Valid ID: ${hasValidIdentifier}, Valid type: ${hasValidType}`
    });

    if (!hasSerbianName || !hasValidIdentifier || !hasValidType) {
      errors.push({
        code: 'INVALID_PUBLISHER',
        message: 'Publisher information is incomplete or invalid',
        severity: 'error',
        field: 'publisher',
        category: 'metadata-standards'
      });
    }
  }

  private validateThemes(
    themes: SerbianGovernmentTheme[] | undefined,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    if (!themes || themes.length === 0) {
      requirements.push({
        id: 'metadata_themes_missing',
        name: 'Government Themes',
        description: 'Dataset must be categorized with Serbian government themes',
        required: true,
        status: 'fail',
        score: 0,
        errorMessage: 'No government themes specified'
      });
      return;
    }

    const validThemes = themes.filter(theme =>
      this.serbianGovernmentThemes.some(officialTheme => officialTheme.code === theme.code)
    );

    const allValid = validThemes.length === themes.length;

    requirements.push({
      id: 'metadata_themes_valid',
      name: 'Valid Government Themes',
      description: 'Themes must be from official Serbian government classification',
      required: true,
      status: allValid ? 'pass' : 'warning',
      score: allValid ? 100 : 75,
      evidence: `${validThemes.length}/${themes.length} themes are valid`
    });

    if (!allValid) {
      recommendations.push({
        id: 'rec_use_official_themes',
        type: 'major',
        category: 'metadata-standards',
        title: 'Use Official Serbian Government Themes',
        description: 'Use standardized government theme codes for better discoverability',
        actionSteps: [
          'Review current theme assignments',
          'Map to official Serbian government themes',
          'Use theme codes from the official classification'
        ],
        estimatedImpact: 15,
        implementationComplexity: 'low'
      });
    }
  }

  private validateLicense(
    license: any,
    requirements: ComplianceRequirement[],
    errors: ValidationError[],
    recommendations: Recommendation[]
  ): void {
    if (!license) {
      requirements.push({
        id: 'metadata_license_missing',
        name: 'Open Data License',
        description: 'Dataset must have an open data license',
        required: true,
        status: 'fail',
        score: 0,
        errorMessage: 'License information is missing'
      });

      errors.push({
        code: 'MISSING_LICENSE',
        message: 'Open data license is required',
        severity: 'error',
        field: 'license',
        category: 'metadata-standards'
      });
      return;
    }

    const isValidLicense = this.validLicenseIdentifiers.includes(license.identifier);
    const isOpenLicense = this.isOpenLicense(license);

    requirements.push({
      id: 'metadata_license_valid',
      name: 'Valid Open Data License',
      description: 'License must be compatible with Serbian open data requirements',
      required: true,
      status: (isValidLicense && isOpenLicense) ? 'pass' : 'warning',
      score: (isValidLicense && isOpenLicense) ? 100 : 60,
      evidence: `Valid license: ${isValidLicense}, Open license: ${isOpenLicense}`
    });

    if (!isValidLicense || !isOpenLicense) {
      recommendations.push({
        id: 'rec_use_open_license',
        type: 'critical',
        category: 'metadata-standards',
        title: 'Use Open Data License',
        description: 'Apply a standard open data license compatible with Serbian regulations',
        actionSteps: [
          'Choose from recommended licenses: CC0, CC-BY, CC-BY-SA, OGL-RS-1.0',
          'Update license information in metadata',
          'Document any usage restrictions clearly'
        ],
        estimatedImpact: 30,
        implementationComplexity: 'low'
      });
    }
  }

  private validateContactPoint(
    contactPoint: any,
    requirements: ComplianceRequirement[],
    errors: ValidationError[]
  ): void {
    if (!contactPoint || !contactPoint.email) {
      requirements.push({
        id: 'metadata_contact_missing',
        name: 'Contact Information',
        description: 'Valid contact information must be provided',
        required: true,
        status: 'fail',
        score: 0,
        errorMessage: 'Contact point or email is missing'
      });

      errors.push({
        code: 'MISSING_CONTACT',
        message: 'Contact point information is required',
        severity: 'error',
        field: 'contactPoint',
        category: 'metadata-standards'
      });
      return;
    }

    const hasValidEmail = this.isValidEmail(contactPoint.email);
    const hasSerbianContact = this.hasSerbianContent(contactPoint.name);

    requirements.push({
      id: 'metadata_contact_valid',
      name: 'Valid Contact Information',
      description: 'Contact point must have valid email and Serbian name',
      required: true,
      status: (hasValidEmail && hasSerbianContact) ? 'pass' : 'warning',
      score: (hasValidEmail && hasSerbianContact) ? 100 : 70,
      evidence: `Valid email: ${hasValidEmail}, Serbian name: ${hasSerbianContact}`
    });
  }

  private validateDistribution(
    distribution: any,
    requirements: ComplianceRequirement[],
    errors: ValidationError[]
  ): void {
    if (!distribution || distribution.length === 0) {
      requirements.push({
        id: 'metadata_distribution_missing',
        name: 'Distribution Information',
        description: 'Dataset must have at least one distribution format',
        required: true,
        status: 'fail',
        score: 0,
        errorMessage: 'No distribution formats specified'
      });

      errors.push({
        code: 'MISSING_DISTRIBUTION',
        message: 'At least one distribution format is required',
        severity: 'error',
        field: 'distribution',
        category: 'metadata-standards'
      });
      return;
    }

    const hasValidFormats = distribution.every((dist: any) => dist.format && dist.accessURL);
    const hasOpenFormats = distribution.some((dist: any) => this.isOpenFormat(dist.format));

    requirements.push({
      id: 'metadata_distribution_valid',
      name: 'Valid Distribution Formats',
      description: 'Distributions must use open, machine-readable formats',
      required: true,
      status: (hasValidFormats && hasOpenFormats) ? 'pass' : 'warning',
      score: (hasValidFormats && hasOpenFormats) ? 100 : 60,
      evidence: `Valid formats: ${hasValidFormats}, Open formats: ${hasOpenFormats}`
    });
  }

  private validateMetadataQuality(
    metadata: Partial<SerbianMetadataSchema>,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const titleLength = this.getStringLength(metadata.title);
    const descriptionLength = this.getStringLength(metadata.description);
    const hasKeywords = metadata.keywords && metadata.keywords.length > 0;
    const hasModificationDate = !!metadata.modificationDate;

    requirements.push({
      id: 'metadata_quality',
      name: 'Metadata Quality',
      description: 'Metadata should be complete and well-described',
      required: false,
      status: 'pass',
      score: this.calculateQualityScore(titleLength, descriptionLength, hasKeywords, hasModificationDate),
      evidence: `Title: ${titleLength} chars, Description: ${descriptionLength} chars, Keywords: ${hasKeywords}, Modified: ${hasModificationDate}`
    });

    if (titleLength < 10 || titleLength > 200) {
      recommendations.push({
        id: 'rec_improve_title_length',
        type: 'minor',
        category: 'metadata-standards',
        title: 'Improve Title Length',
        description: 'Title should be between 10-200 characters for optimal readability',
        actionSteps: [
          'Make title more descriptive if too short',
          'Make title more concise if too long',
          'Include both Serbian and English if possible'
        ],
        estimatedImpact: 10,
        implementationComplexity: 'low'
      });
    }

    if (!hasKeywords) {
      recommendations.push({
        id: 'rec_add_keywords',
        type: 'minor',
        category: 'metadata-standards',
        title: 'Add Keywords',
        description: 'Add relevant keywords to improve discoverability',
        actionSteps: [
          'Add 3-10 relevant keywords',
          'Include both Serbian and English terms',
          'Consider domain-specific terminology'
        ],
        estimatedImpact: 15,
        implementationComplexity: 'low'
      });
    }
  }

  private hasSerbianContent(textObj: SerbianLocalizedString | undefined): boolean {
    if (!textObj) return false;
    return !!(textObj.sr || textObj['sr-Latn']);
  }

  private getStringLength(textObj: SerbianLocalizedString | undefined): number {
    if (!textObj) return 0;
    return Math.max(
      textObj.sr?.length || 0,
      textObj['sr-Latn']?.length || 0,
      textObj.en?.length || 0
    );
  }

  private isValidInstitutionIdentifier(identifier: string): boolean {
    // PIB format: 9 digits
    const pibRegex = /^\d{9}$/;
    // MB format (for companies): 8 digits
    const mbRegex = /^\d{8}$/;

    return pibRegex.test(identifier) || mbRegex.test(identifier);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isOpenLicense(license: any): boolean {
    return license.commercialUseAllowed && license.derivativeWorksAllowed;
  }

  private isOpenFormat(format: string): boolean {
    const openFormats = [
      'CSV', 'JSON', 'XML', 'RDF', 'TTL', 'N3',
      'application/csv', 'application/json', 'application/xml',
      'text/csv', 'text/plain', 'application/rdf+xml',
      'text/turtle', 'text/n3'
    ];
    return openFormats.some(openFormat =>
      format.toUpperCase().includes(openFormat.toUpperCase())
    );
  }

  private calculateScore(requirements: ComplianceRequirement[]): number {
    if (requirements.length === 0) return 0;

    const totalScore = requirements.reduce((sum, req) => sum + req.score, 0);
    return Math.round(totalScore / requirements.length);
  }

  private getStatus(score: number): 'compliant' | 'partial' | 'non-compliant' {
    if (score >= 90) return 'compliant';
    if (score >= 60) return 'partial';
    return 'non-compliant';
  }

  private calculateQualityScore(
    titleLength: number,
    descriptionLength: number,
    hasKeywords: boolean,
    hasModificationDate: boolean
  ): number {
    let score = 0;

    // Title quality (25% of score)
    if (titleLength >= 10 && titleLength <= 200) score += 25;
    else if (titleLength > 0) score += 15;

    // Description quality (35% of score)
    if (descriptionLength >= 50 && descriptionLength <= 1000) score += 35;
    else if (descriptionLength > 0) score += 20;

    // Keywords (25% of score)
    if (hasKeywords) score += 25;

    // Modification date (15% of score)
    if (hasModificationDate) score += 15;

    return score;
  }
}