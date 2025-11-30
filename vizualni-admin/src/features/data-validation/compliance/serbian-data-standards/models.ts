import { z } from 'zod';

/**
 * Serbian Government Data Standards Compliance Models
 * Compliant with Zakon o slobodnom pristupu informacijama and Pravilnik o otvorenim podacima
 */

// Base compliance types
export interface ComplianceResult {
  readonly id: string;
  readonly timestamp: Date;
  readonly datasetId: string;
  readonly overallScore: number; // 0-100
  readonly isCompliant: boolean;
  readonly categories: ComplianceCategory[];
  readonly recommendations: Recommendation[];
  readonly validationErrors: ValidationError[];
  readonly metadata: ComplianceMetadata;
}

export interface ComplianceCategory {
  readonly name: SerbianComplianceCategory;
  readonly score: number;
  readonly weight: number;
  readonly requirements: ComplianceRequirement[];
  readonly status: 'compliant' | 'partial' | 'non-compliant';
}

export interface ComplianceRequirement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
  readonly status: 'pass' | 'fail' | 'warning';
  readonly score: number;
  readonly evidence?: string;
  readonly errorMessage?: string;
}

export interface Recommendation {
  readonly id: string;
  readonly type: 'critical' | 'major' | 'minor';
  readonly category: SerbianComplianceCategory;
  readonly title: string;
  readonly description: string;
  readonly actionSteps: string[];
  readonly estimatedImpact: number;
  readonly implementationComplexity: 'low' | 'medium' | 'high';
}

export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly field?: string;
  readonly rowIndex?: number;
  readonly columnIndex?: string;
  readonly category: SerbianComplianceCategory;
}

export interface ComplianceMetadata {
  readonly validatorVersion: string;
  readonly standardsVersion: string;
  readonly validationDuration: number;
  readonly datasetSize: number;
  readonly processingMethod: 'full' | 'sample' | 'streaming';
}

// Serbian compliance categories
export type SerbianComplianceCategory =
  | 'legal-framework'      // Zakon o slobodnom pristupu informacijama
  | 'data-format'          // Pravilnik o otvorenim podacima
  | 'metadata-standards'   // Serbian government metadata schemas
  | 'quality-assurance'    // Data quality requirements
  | 'accessibility'        // WCAG and Serbian accessibility standards
  | 'technical-specs'      // data.gov.rs technical requirements
  | 'eu-harmonization'     // EU data standards alignment
  | 'privacy-security'     // GDPR and Serbian data protection laws
  | 'open-license'         // Open data licensing requirements
  | 'documentation';       // Documentation and transparency

// Serbian-specific data schemas
export interface SerbianMetadataSchema {
  readonly identifier: string;
  readonly title: SerbianLocalizedString;
  readonly description: SerbianLocalizedString;
  readonly keywords: SerbianLocalizedString[];
  readonly publisher: GovernmentInstitution;
  readonly publicationDate: Date;
  readonly modificationDate?: Date;
  readonly language: ('sr' | 'sr-Latn' | 'en')[];
  readonly theme: SerbianGovernmentTheme[];
  readonly spatial?: GeographicCoverage;
  readonly temporal?: TemporalCoverage;
  readonly format: DataFormat[];
  readonly license: OpenLicense;
  readonly rights: RightsStatement;
  readonly conformsTo: Standard[];
  readonly contactPoint: ContactPoint;
  readonly distribution: Distribution[];
}

export interface SerbianLocalizedString {
  readonly sr?: string;      // Cyrillic
  readonly 'sr-Latn'?: string; // Latin
  readonly en?: string;      // English
}

export interface GovernmentInstitution {
  readonly name: SerbianLocalizedString;
  readonly identifier: string; // PIB or registry number
  readonly type: InstitutionType;
  readonly level: 'national' | 'regional' | 'local';
  readonly contactInfo: ContactInfo;
}

export type InstitutionType =
  | 'ministry'
  | 'agency'
  | 'public-enterprise'
  | 'local-government'
  | 'independent-institution'
  | 'court'
  | 'public-prosecutor';

export interface SerbianGovernmentTheme {
  readonly code: string; // Standardized theme code
  readonly name: SerbianLocalizedString;
  readonly parentTheme?: string;
  readonly level: number;
}

export interface DataFormat {
  readonly format: string; // IANA MIME type
  readonly compression?: string;
  readonly packaging?: string;
  readonly encoding?: string;
  readonly schema?: string;
}

export interface OpenLicense {
  readonly identifier: string;
  readonly name: SerbianLocalizedString;
  readonly url: string;
  readonly attributionRequired: boolean;
  readonly commercialUseAllowed: boolean;
  readonly derivativeWorksAllowed: boolean;
}

// Quality metrics specific to Serbian data
export interface SerbianDataQuality {
  readonly overallScore: number;
  readonly completeness: CompletenessMetric;
  readonly accuracy: AccuracyMetric;
  readonly consistency: ConsistencyMetric;
  readonly timeliness: TimelinessMetric;
  readonly relevance: RelevanceMetric;
  readonly serbianSpecificity: SerbianSpecificityMetric;
}

export interface SerbianSpecificityMetric {
  readonly scriptConsistency: number; // Cyrillic/Latin consistency
  readonly languageAccuracy: number; // Serbian language correctness
  readonly territorialCoverage: number; // Serbian territory coverage
  readonly institutionalAccuracy: number; // Government institution accuracy
  readonly dateFormatting: number; // Serbian date format compliance
  readonly numberFormatting: number; // Serbian number format compliance
  readonly addressStandardization: number; // Serbian address standards
  readonly jmbgValidation: number; // JMBG validation score
  readonly pibValidation: number; // PIB validation score
}

// Data.gov.rs specific types
export interface DataGovRsConfig {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly cacheEnabled: boolean;
  readonly cacheTtl: number;
  readonly rateLimiting: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  readonly format: {
    preferredFormats: string[];
    encoding: string;
    compression: string[];
  };
}

export interface DataGovRsDataset {
  readonly id: string;
  readonly name: SerbianLocalizedString;
  readonly description: SerbianLocalizedString;
  readonly url: string;
  readonly organization: GovernmentInstitution;
  readonly theme: SerbianGovernmentTheme[];
  readonly modified: Date;
  readonly format: DataFormat[];
  readonly license: OpenLicense;
  readonly bytes?: number;
  readonly downloads?: number;
  readonly views?: number;
  readonly rating?: number;
}

// Validation schemas
export const DatasetMetadataSchema = z.object({
  identifier: z.string().min(1),
  title: z.record(z.enum(['sr', 'sr-Latn', 'en']), z.string().min(1)).min(1),
  description: z.record(z.enum(['sr', 'sr-Latn', 'en']), z.string().min(1)).min(1),
  keywords: z.array(z.record(z.enum(['sr', 'sr-Latn', 'en']), z.string())).min(1),
  publisher: z.object({
    name: z.record(z.enum(['sr', 'sr-Latn', 'en']), z.string()).min(1),
    identifier: z.string().min(1),
    type: z.enum(['ministry', 'agency', 'public-enterprise', 'local-government', 'independent-institution', 'court', 'public-prosecutor']),
    level: z.enum(['national', 'regional', 'local']),
    contactInfo: z.object({
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.string().optional()
    })
  }),
  publicationDate: z.date(),
  modificationDate: z.date().optional(),
  language: z.array(z.enum(['sr', 'sr-Latn', 'en'])).min(1),
  theme: z.array(z.object({
    code: z.string(),
    name: z.record(z.enum(['sr', 'sr-Latn', 'en']), z.string()),
    parentTheme: z.string().optional(),
    level: z.number().min(0)
  })).min(1),
  format: z.array(z.object({
    format: z.string(),
    compression: z.string().optional(),
    packaging: z.string().optional(),
    encoding: z.string().optional(),
    schema: z.string().optional()
  })).min(1),
  license: z.object({
    identifier: z.string(),
    name: z.record(z.enum(['sr', 'sr-Latn', 'en']), z.string()),
    url: z.string().url(),
    attributionRequired: z.boolean(),
    commercialUseAllowed: z.boolean(),
    derivativeWorksAllowed: z.boolean()
  }),
  contactPoint: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional()
  }),
  distribution: z.array(z.object({
    accessURL: z.string().url(),
    downloadURL: z.string().url().optional(),
    format: z.string(),
    size: z.number().optional()
  })).min(1)
});

export const ComplianceResultSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  datasetId: z.string(),
  overallScore: z.number().min(0).max(100),
  isCompliant: z.boolean(),
  categories: z.array(z.object({
    name: z.enum(['legal-framework', 'data-format', 'metadata-standards', 'quality-assurance', 'accessibility', 'technical-specs', 'eu-harmonization', 'privacy-security', 'open-license', 'documentation']),
    score: z.number().min(0).max(100),
    weight: z.number().min(0).max(1),
    requirements: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      required: z.boolean(),
      status: z.enum(['pass', 'fail', 'warning']),
      score: z.number().min(0).max(100),
      evidence: z.string().optional(),
      errorMessage: z.string().optional()
    })),
    status: z.enum(['compliant', 'partial', 'non-compliant'])
  })),
  recommendations: z.array(z.object({
    id: z.string(),
    type: z.enum(['critical', 'major', 'minor']),
    category: z.enum(['legal-framework', 'data-format', 'metadata-standards', 'quality-assurance', 'accessibility', 'technical-specs', 'eu-harmonization', 'privacy-security', 'open-license', 'documentation']),
    title: z.string(),
    description: z.string(),
    actionSteps: z.array(z.string()),
    estimatedImpact: z.number().min(0).max(100),
    implementationComplexity: z.enum(['low', 'medium', 'high'])
  })),
  validationErrors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
    field: z.string().optional(),
    rowIndex: z.number().optional(),
    columnIndex: z.string().optional(),
    category: z.enum(['legal-framework', 'data-format', 'metadata-standards', 'quality-assurance', 'accessibility', 'technical-specs', 'eu-harmonization', 'privacy-security', 'open-license', 'documentation'])
  })),
  metadata: z.object({
    validatorVersion: z.string(),
    standardsVersion: z.string(),
    validationDuration: number,
    datasetSize: number,
    processingMethod: z.enum(['full', 'sample', 'streaming'])
  })
});

// Helper types for better inference
export type DatasetMetadata = z.infer<typeof DatasetMetadataSchema>;
export type ComplianceResultType = z.infer<typeof ComplianceResultSchema>;