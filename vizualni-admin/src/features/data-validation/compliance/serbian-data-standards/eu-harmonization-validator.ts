import {
  ComplianceCategory,
  ComplianceRequirement,
  Recommendation,
  ValidationError,
  SerbianComplianceCategory
} from './models';
import { ValidationContext, ComplianceValidator } from './core';

/**
 * Serbian EU Harmonization Validator
 *
 * Validates alignment with European Union data standards:
 * - EU Open Data Portal compatibility
 * - INSPIRE directive compliance
 * - PSI directive implementation
 * - European data format standards
 * - Multilingual metadata requirements
 */
export class SerbianEUHarmonizationValidator implements ComplianceValidator {
  private readonly euThemes = [
    'AGRI', 'ECON', 'EDUC', 'ENER', 'ENVI', 'GOVE',
    'HEAL', 'INTR', 'JURI', 'JUST', 'NACE', 'OP_DATPRO',
    'PROD', 'PUBL', 'REGI', 'RESO', 'SOCI', 'TECH',
    'TRAN', 'YOUTH'
  ];

  private readonly euLanguages = ['bg', 'cs', 'da', 'de', 'et', 'el', 'en', 'es', 'fr', 'ga', 'hr', 'it', 'lv', 'lt', 'hu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'sl', 'fi', 'sv'];

  async validate(context: ValidationContext): Promise<{
    category: ComplianceCategory;
    recommendations: Recommendation[];
    errors: ValidationError[];
  }> {
    const { metadata } = context;
    const requirements: ComplianceRequirement[] = [];
    const recommendations: Recommendation[] = [];
    const errors: ValidationError[] = [];

    // Validate EU theme alignment
    this.validateEUThemes(metadata, requirements, recommendations);

    // Validate multilingual metadata
    this.validateMultilingualMetadata(metadata, requirements, recommendations);

    // Validate EU format standards
    this.validateEUFormats(metadata, requirements, recommendations);

    // Validate PSI directive compliance
    this.validatePSIDirective(metadata, requirements, recommendations);

    // Validate European data portal compatibility
    this.validateEuropeanDataPortal(metadata, requirements, recommendations);

    const score = this.calculateEUHarmonizationScore(requirements);
    const status = this.getComplianceStatus(score);

    const category: ComplianceCategory = {
      name: 'eu-harmonization',
      score,
      weight: 0.08,
      requirements,
      status
    };

    return { category, recommendations, errors };
  }

  private validateEUThemes(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const serbianThemes = metadata.theme || [];
    const hasEUThemeMapping = serbianThemes.some((theme: any) =>
      this.euThemes.includes(theme.code) || theme.code?.startsWith('EUROSTAT')
    );
    const hasThemeDescriptions = serbianThemes.every((theme: any) =>
      theme.name?.sr && theme.name?.en
    );

    requirements.push({
      id: 'eu_themes',
      name: 'EU Theme Alignment',
      description: 'Align Serbian themes with European Data Portal classifications',
      required: true,
      status: (hasEUThemeMapping && hasThemeDescriptions) ? 'pass' : 'warning',
      score: this.calculateEUThemeScore(hasEUThemeMapping, hasThemeDescriptions),
      evidence: `EU theme mapping: ${hasEUThemeMapping}, Theme descriptions: ${hasThemeDescriptions}`
    });

    if (!hasEUThemeMapping) {
      recommendations.push({
        id: 'rec_map_eu_themes',
        type: 'major',
        category: 'eu-harmonization',
        title: 'Map to EU Themes',
        description: 'Align Serbian government themes with European Data Portal themes',
        actionSteps: [
          'Map Serbian themes to EU Data Portal themes',
          'Add EU theme codes to metadata',
          'Maintain Serbian theme names alongside EU codes',
          'Document theme mapping relationships'
        ],
        estimatedImpact: 20,
        implementationComplexity: 'medium'
      });
    }
  }

  private validateMultilingualMetadata(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasEnglishMetadata = metadata.title?.en && metadata.description?.en;
    const hasEUOtherLanguages = metadata.language?.some((lang: string) =>
      this.euLanguages.includes(lang) && !['en', 'sr', 'sr-Latn'].includes(lang)
    );
    const hasCompleteTranslations = this.hasCompleteMetadataTranslations(metadata);

    requirements.push({
      id: 'eu_multilingual',
      name: 'EU Multilingual Requirements',
      description: 'Provide metadata in EU languages for European Data Portal',
      required: true,
      status: (hasEnglishMetadata && hasCompleteTranslations) ? 'pass' : 'warning',
      score: this.calculateMultilingualScore(hasEnglishMetadata, hasEUOtherLanguages, hasCompleteTranslations),
      evidence: `English metadata: ${hasEnglishMetadata}, Other EU languages: ${hasEUOtherLanguages}, Complete translations: ${hasCompleteTranslations}`
    });

    if (!hasEnglishMetadata) {
      recommendations.push({
        id: 'rec_add_english_metadata',
        type: 'critical',
        category: 'eu-harmonization',
        title: 'Add English Metadata',
        description: 'Provide complete English translations for European Data Portal',
        actionSteps: [
          'Translate title to English',
          'Translate description to English',
          'Translate keywords to English',
          'Translate institutional names to English'
        ],
        estimatedImpact: 30,
        implementationComplexity: 'medium'
      });
    }
  }

  private validateEUFormats(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasEUCompliantFormat = metadata.format?.some((f: any) =>
      ['CSV', 'JSON', 'XML', 'RDF', 'TTL', 'N3'].includes(f.format?.toUpperCase())
    );
    const hasRDFFormat = metadata.format?.some((f: any) =>
      ['RDF', 'TTL', 'N3', 'application/rdf+xml', 'text/turtle', 'text/n3'].includes(f.format?.toLowerCase())
    );
    const hasSchemaOrg = metadata.conformsTo?.some((c: any) =>
      c.identifier?.includes('schema.org') || c.title?.en?.toLowerCase().includes('schema.org')
    );

    requirements.push({
      id: 'eu_formats',
      name: 'EU Format Standards',
      description: 'Use formats compatible with European data standards',
      required: true,
      status: (hasEUCompliantFormat && hasSchemaOrg) ? 'pass' : 'warning',
      score: this.calculateEUFormatScore(hasEUCompliantFormat, hasRDFFormat, hasSchemaOrg),
      evidence: `EU compliant formats: ${hasEUCompliantFormat}, RDF format: ${hasRDFFormat}, Schema.org: ${hasSchemaOrg}`
    });

    if (!hasRDFFormat) {
      recommendations.push({
        id: 'rec_add_rdf_format',
        type: 'major',
        category: 'eu-harmonization',
        title: 'Add RDF Format',
        description: 'Provide data in RDF format for semantic web compatibility',
        actionSteps: [
          'Convert data to RDF/Turtle format',
          'Map data to common vocabularies (DCAT, schema.org)',
          'Provide RDF metadata descriptions',
          'Include vocabulary definitions'
        ],
        estimatedImpact: 25,
        implementationComplexity: 'high'
      });
    }
  }

  private validatePSIDirective(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasOpenLicense = metadata.license?.identifier && this.isOpenDataLicense(metadata.license.identifier);
    const hasMachineReadableFormat = metadata.format?.some((f: any) =>
      !['PDF', 'DOC', 'DOCX'].includes(f.format?.toUpperCase())
    );
    const hasNoUsageRestrictions = !metadata.license?.attributionRequired || metadata.license?.commercialUseAllowed;
    const hasAvailabilityInfo = metadata.distribution?.some((d: any) => d.accessURL || d.downloadURL);

    requirements.push({
      id: 'eu_psi_directive',
      name: 'PSI Directive Compliance',
      description: 'Comply with Public Sector Information directive requirements',
      required: true,
      status: (hasOpenLicense && hasMachineReadableFormat && hasAvailabilityInfo) ? 'pass' : 'warning',
      score: this.calculatePSIScore(hasOpenLicense, hasMachineReadableFormat, hasNoUsageRestrictions, hasAvailabilityInfo),
      evidence: `Open license: ${hasOpenLicense}, Machine readable: ${hasMachineReadableFormat}, No restrictions: ${hasNoUsageRestrictions}, Available: ${hasAvailabilityInfo}`
    });

    if (!hasOpenLicense || !hasNoUsageRestrictions) {
      recommendations.push({
        id: 'rec_improve_psi_compliance',
        type: 'critical',
        category: 'eu-harmonization',
        title: 'Improve PSI Directive Compliance',
        description: 'Ensure full compliance with EU Public Sector Information directive',
        actionSteps: [
          'Use open data license (CC0, CC-BY, OGL)',
          'Allow commercial use and derivative works',
          'Provide machine-readable formats',
          'Ensure data availability without restrictions'
        ],
        estimatedImpact: 35,
        implementationComplexity: 'medium'
      });
    }
  }

  private validateEuropeanDataPortal(
    metadata: any,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    const hasDCATMetadata = this.hasDCATCompliance(metadata);
    const hasContactPoint = !!metadata.contactPoint?.email;
    const hasSpatialCoverage = !!metadata.spatial || this.detectEuropeanCoverage(metadata);
    const hasTemporalCoverage = !!metadata.temporal;

    requirements.push({
      id: 'eu_data_portal',
      name: 'European Data Portal Compatibility',
      description: 'Ensure compatibility with European Data Portal requirements',
      required: true,
      status: (hasDCATMetadata && hasContactPoint) ? 'pass' : 'warning',
      score: this.calculateDataPortalScore(hasDCATMetadata, hasContactPoint, hasSpatialCoverage, hasTemporalCoverage),
      evidence: `DCAT metadata: ${hasDCATMetadata}, Contact point: ${hasContactPoint}, Spatial: ${hasSpatialCoverage}, Temporal: ${hasTemporalCoverage}`
    });

    if (!hasDCATMetadata) {
      recommendations.push({
        id: 'rec_improve_dcat_metadata',
        type: 'major',
        category: 'eu-harmonization',
        title: 'Improve DCAT Metadata',
        description: 'Enhance metadata for European Data Portal compatibility',
        actionSteps: [
          'Add DCAT-compatible metadata structure',
          'Include required DCAT properties',
          'Use standardized vocabularies',
          'Validate DCAT compliance'
        ],
        estimatedImpact: 25,
        implementationComplexity: 'medium'
      });
    }
  }

  private hasCompleteMetadataTranslations(metadata: any): boolean {
    const fields = ['title', 'description'];
    const languages = ['en']; // At minimum, English is required

    return fields.every(field =>
      languages.every(lang =>
        metadata[field] && metadata[field][lang] && metadata[field][lang].trim().length > 0
      )
    );
  }

  private isOpenDataLicense(licenseIdentifier: string): boolean {
    const openLicenses = ['CC0', 'CC-BY', 'CC-BY-SA', 'ODC-BY', 'ODL', 'OGL'];
    return openLicenses.some(license =>
      licenseIdentifier.toUpperCase().includes(license.toUpperCase())
    );
  }

  private hasDCATCompliance(metadata: any): boolean {
    const requiredDCATFields = ['title', 'description', 'publisher', 'modificationDate'];
    return requiredDCATFields.every(field => metadata[field]);
  }

  private detectEuropeanCoverage(metadata: any): boolean {
    const text = JSON.stringify(metadata).toLowerCase();
    const europeanTerms = ['europe', 'european union', 'eu', 'eurostat'];
    return europeanTerms.some(term => text.includes(term));
  }

  private calculateEUThemeScore(hasMapping: boolean, hasDescriptions: boolean): number {
    let score = 0;
    if (hasMapping) score += 50;
    if (hasDescriptions) score += 50;
    return score;
  }

  private calculateMultilingualScore(hasEnglish: boolean, hasOtherEU: boolean, hasComplete: boolean): number {
    let score = 0;
    if (hasEnglish) score += 40;
    if (hasOtherEU) score += 20;
    if (hasComplete) score += 40;
    return score;
  }

  private calculateEUFormatScore(hasCompliant: boolean, hasRDF: boolean, hasSchema: boolean): number {
    let score = 0;
    if (hasCompliant) score += 35;
    if (hasRDF) score += 35;
    if (hasSchema) score += 30;
    return score;
  }

  private calculatePSIScore(hasLicense: boolean, hasMachineReadable: boolean, hasNoRestrictions: boolean, hasAvailability: boolean): number {
    let score = 0;
    if (hasLicense) score += 30;
    if (hasMachineReadable) score += 25;
    if (hasNoRestrictions) score += 25;
    if (hasAvailability) score += 20;
    return score;
  }

  private calculateDataPortalScore(hasDCAT: boolean, hasContact: boolean, hasSpatial: boolean, hasTemporal: boolean): number {
    let score = 0;
    if (hasDCAT) score += 40;
    if (hasContact) score += 25;
    if (hasSpatial) score += 20;
    if (hasTemporal) score += 15;
    return score;
  }

  private calculateEUHarmonizationScore(requirements: ComplianceRequirement[]): number {
    if (requirements.length === 0) return 0;
    const totalScore = requirements.reduce((sum, req) => sum + req.score, 0);
    return Math.round(totalScore / requirements.length);
  }

  private getComplianceStatus(score: number): 'compliant' | 'partial' | 'non-compliant' {
    if (score >= 75) return 'compliant';
    if (score >= 50) return 'partial';
    return 'non-compliant';
  }
}