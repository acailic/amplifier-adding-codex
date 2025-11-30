import {
  SerbianDataQuality,
  SerbianSpecificityMetric,
  CompletenessMetric,
  AccuracyMetric,
  ConsistencyMetric,
  TimelinessMetric,
  RelevanceMetric,
  ComplianceCategory,
  ComplianceRequirement,
  Recommendation,
  ValidationError,
  SerbianComplianceCategory
} from './models';
import { ValidationContext, ComplianceValidator } from './core';
import { SerbianCSVParser } from './data-parsers';

/**
 * Serbian Government Data Quality Analyzer
 *
 * Comprehensive quality assessment system for Serbian open data including:
 * - Serbian-specific quality metrics (JMBG, PIB, script consistency)
 * - Government data standards compliance
 * - EU data quality framework alignment
 * - Performance benchmarking
 * - Automated quality improvement recommendations
 */
export class SerbianQualityAnalyzer implements ComplianceValidator {
  private readonly csvParser: SerbianCSVParser;
  private readonly serbianInstitutionPatterns: RegExp[];
  private readonly serbianAddressPatterns: RegExp[];
  private readonly serbianNamePatterns: RegExp[];

  constructor() {
    this.csvParser = new SerbianCSVParser();
    this.serbianInstitutionPatterns = [
      /\b(министарство|агенција|завод|управа|инспекција|фонд|банка|компанија|предузеће)\b/gi,
      /\b(vlada|republike|srpske|srbije|beograd|novi sad|niš)\b/gi,
      /\b(javn[ao]|državn[ao]|republičk[ao])\b/gi
    ];
    this.serbianAddressPatterns = [
      /^\s*(ул\.|улица|бул\.|булевар|трг|семафор)\s+[а-жА-Ж\s\d\-\.,\/]+,\s*\d{5,6}\s*[а-жА-Ж\s]+$/,
      /^\s*[а-жА-Ж\s\d\-\.,\/]+,\s*(ул\.|улица|бул\.|булевар)\s*[а-жА-Ж\s\d\-\.,\/]+,\s*\d{5,6}\s*[а-жА-Ж\s]+$/
    ];
    this.serbianNamePatterns = [
      /^[А-Ш][а-ш]+(\s+[А-Ш][а-ш]+)+$/, // Cyrillic
      /^[A-ZČĆŽŠĐ][a-zčćžšđ]+(\s+[A-ZČĆŽŠĐ][a-zčćžšđ]+)+$/ // Latin
    ];
  }

  async validate(context: ValidationContext): Promise<{
    category: ComplianceCategory;
    recommendations: Recommendation[];
    errors: ValidationError[];
  }> {
    const { data, metadata } = context;
    const requirements: ComplianceRequirement[] = [];
    const recommendations: Recommendation[] = [];
    const errors: ValidationError[] = [];

    // Calculate comprehensive quality metrics
    const qualityMetrics = await this.calculateSerbianDataQuality(data, metadata);

    // Validate completeness
    this.validateCompleteness(qualityMetrics.completeness, requirements, recommendations);

    // Validate accuracy
    this.validateAccuracy(qualityMetrics.accuracy, requirements, recommendations, errors);

    // Validate consistency
    this.validateConsistency(qualityMetrics.consistency, requirements, recommendations, errors);

    // Validate timeliness
    this.validateTimeliness(qualityMetrics.timeliness, requirements, recommendations);

    // Validate relevance
    this.validateRelevance(qualityMetrics.relevance, requirements, recommendations);

    // Validate Serbian specificity
    this.validateSerbianSpecificity(qualityMetrics.serbianSpecificity, requirements, recommendations, errors);

    const score = this.calculateQualityScore(qualityMetrics);
    const status = this.getQualityStatus(score);

    const category: ComplianceCategory = {
      name: 'quality-assurance',
      score,
      weight: 0.12,
      requirements,
      status
    };

    return { category, recommendations, errors };
  }

  /**
   * Calculate comprehensive Serbian data quality metrics
   */
  async calculateSerbianDataQuality(
    data: unknown[],
    metadata?: any
  ): Promise<SerbianDataQuality> {
    const completeness = await this.calculateCompleteness(data);
    const accuracy = await this.calculateAccuracy(data);
    const consistency = await this.calculateConsistency(data);
    const timeliness = await this.calculateTimeliness(data, metadata);
    const relevance = await this.calculateRelevance(data, metadata);
    const serbianSpecificity = await this.calculateSerbianSpecificity(data);

    const overallScore = (
      completeness.score * 0.25 +
      accuracy.score * 0.20 +
      consistency.score * 0.20 +
      timeliness.score * 0.15 +
      relevance.score * 0.10 +
      serbianSpecificity.score * 0.10
    );

    return {
      overallScore,
      completeness,
      accuracy,
      consistency,
      timeliness,
      relevance,
      serbianSpecificity
    };
  }

  /**
   * Generate quality improvement recommendations
   */
  generateQualityRecommendations(qualityMetrics: SerbianDataQuality): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Completeness recommendations
    if (qualityMetrics.completeness.score < 80) {
      recommendations.push({
        id: 'rec_improve_completeness',
        type: qualityMetrics.completeness.score < 50 ? 'critical' : 'major',
        category: 'quality-assurance',
        title: 'Improve Data Completeness',
        description: `Dataset completeness is ${qualityMetrics.completeness.score}%. Missing data should be filled or documented.`,
        actionSteps: [
          'Identify patterns in missing data',
          'Implement data collection procedures for missing fields',
          'Add default values where appropriate',
          'Document reasons for missing data'
        ],
        estimatedImpact: 25,
        implementationComplexity: 'medium'
      });
    }

    // Accuracy recommendations
    if (qualityMetrics.accuracy.score < 85) {
      recommendations.push({
        id: 'rec_improve_accuracy',
        type: 'major',
        category: 'quality-assurance',
        title: 'Improve Data Accuracy',
        description: `Data accuracy is ${qualityMetrics.accuracy.score}%. Validation errors should be corrected.`,
        actionSteps: [
          'Review and correct JMBG validation errors',
          'Fix PIB checksum errors',
          'Correct invalid date formats',
          'Standardize number formatting'
        ],
        estimatedImpact: 30,
        implementationComplexity: 'high'
      });
    }

    // Serbian specificity recommendations
    if (qualityMetrics.serbianSpecificity.score < 70) {
      recommendations.push({
        id: 'rec_improve_serbian_specificity',
        type: 'major',
        category: 'quality-assurance',
        title: 'Enhance Serbian Data Specificity',
        description: `Serbian specificity score is ${qualityMetrics.serbianSpecificity.score}%. Data should better reflect Serbian context.`,
        actionSteps: [
          'Ensure consistent script usage (Cyrillic or Latin)',
          'Validate Serbian institutional names',
          'Standardize Serbian address formats',
          'Add Serbian language support where missing'
        ],
        estimatedImpact: 20,
        implementationComplexity: 'medium'
      });
    }

    // Consistency recommendations
    if (qualityMetrics.consistency.score < 75) {
      recommendations.push({
        id: 'rec_improve_consistency',
        type: 'major',
        category: 'quality-assurance',
        title: 'Improve Data Consistency',
        description: `Data consistency is ${qualityMetrics.consistency.score}%. Format inconsistencies should be resolved.`,
        actionSteps: [
          'Standardize date formats across all records',
          'Ensure consistent number formatting',
          'Normalize text case and formatting',
          'Implement format validation rules'
        ],
        estimatedImpact: 15,
        implementationComplexity: 'low'
      });
    }

    return recommendations;
  }

  private async calculateCompleteness(data: unknown[]): Promise<CompletenessMetric> {
    if (data.length === 0) {
      return {
        score: 0,
        totalFields: 0,
        completeFields: 0,
        missingFields: 0,
        completenessByField: {}
      };
    }

    const firstRecord = data[0] as Record<string, any>;
    const fields = Object.keys(firstRecord);
    const totalFields = fields.length * data.length;
    let completeFields = 0;
    const completenessByField: Record<string, number> = {};

    // Initialize field counters
    fields.forEach(field => {
      completenessByField[field] = 0;
    });

    // Count non-null values for each field
    data.forEach(record => {
      const recordData = record as Record<string, any>;
      fields.forEach(field => {
        const value = recordData[field];
        if (value !== null && value !== undefined && value !== '') {
          completeFields++;
          completenessByField[field]++;
        }
      });
    });

    // Calculate percentages
    Object.keys(completenessByField).forEach(field => {
      completenessByField[field] = (completenessByField[field] / data.length) * 100;
    });

    const score = (completeFields / totalFields) * 100;

    return {
      score,
      totalFields,
      completeFields,
      missingFields: totalFields - completeFields,
      completenessByField
    };
  }

  private async calculateAccuracy(data: unknown[]): Promise<AccuracyMetric> {
    if (data.length === 0) {
      return {
        score: 0,
        validJMBG: 0,
        invalidJMBG: 0,
        validPIB: 0,
        invalidPIB: 0,
        validDates: 0,
        invalidDates: 0,
        validNumbers: 0,
        invalidNumbers: 0,
        validationErrors: []
      };
    }

    let validJMBG = 0, invalidJMBG = 0;
    let validPIB = 0, invalidPIB = 0;
    let validDates = 0, invalidDates = 0;
    let validNumbers = 0, invalidNumbers = 0;
    const validationErrors: ValidationError[] = [];

    data.forEach((record, index) => {
      const recordData = record as Record<string, any>;

      Object.entries(recordData).forEach(([field, value]) => {
        const stringValue = String(value).trim();

        if (stringValue === '' || stringValue === 'null') return;

        // Validate JMBG
        if (/^\d{13}$/.test(stringValue)) {
          if (this.validateJMBG(stringValue)) {
            validJMBG++;
          } else {
            invalidJMBG++;
            validationErrors.push({
              code: 'INVALID_JMBG',
              message: 'Invalid JMBG format or checksum',
              severity: 'warning',
              field,
              rowIndex: index,
              columnIndex: field,
              category: 'quality-assurance'
            });
          }
        }

        // Validate PIB
        if (/^\d{9}$/.test(stringValue)) {
          if (this.validatePIB(stringValue)) {
            validPIB++;
          } else {
            invalidPIB++;
            validationErrors.push({
              code: 'INVALID_PIB',
              message: 'Invalid PIB checksum',
              severity: 'warning',
              field,
              rowIndex: index,
              columnIndex: field,
              category: 'quality-assurance'
            });
          }
        }

        // Validate dates
        if (this.isSerbianDate(stringValue)) {
          try {
            this.parseSerbianDate(stringValue);
            validDates++;
          } catch {
            invalidDates++;
            validationErrors.push({
              code: 'INVALID_DATE',
              message: 'Invalid Serbian date format',
              severity: 'warning',
              field,
              rowIndex: index,
              columnIndex: field,
              category: 'quality-assurance'
            });
          }
        }

        // Validate Serbian numbers
        if (/^-?\d{1,3}(?:\.\d{3})*(?:,\d+)?$/.test(stringValue)) {
          try {
            this.parseSerbianNumber(stringValue);
            validNumbers++;
          } catch {
            invalidNumbers++;
            validationErrors.push({
              code: 'INVALID_NUMBER',
              message: 'Invalid Serbian number format',
              severity: 'warning',
              field,
              rowIndex: index,
              columnIndex: field,
              category: 'quality-assurance'
            });
          }
        }
      });
    });

    const totalValidations = validJMBG + invalidJMBG + validPIB + invalidPIB + validDates + invalidDates + validNumbers + invalidNumbers;
    const score = totalValidations > 0 ? ((validJMBG + validPIB + validDates + validNumbers) / totalValidations) * 100 : 100;

    return {
      score,
      validJMBG,
      invalidJMBG,
      validPIB,
      invalidPIB,
      validDates,
      invalidDates,
      validNumbers,
      invalidNumbers,
      validationErrors
    };
  }

  private async calculateConsistency(data: unknown[]): Promise<ConsistencyMetric> {
    if (data.length === 0) {
      return {
        score: 0,
        formatConsistency: 0,
        scriptConsistency: 0,
        categoricalConsistency: 0,
        temporalConsistency: 0,
        inconsistencyErrors: []
      };
    }

    const formatConsistency = this.calculateFormatConsistency(data);
    const scriptConsistency = this.calculateScriptConsistency(data);
    const categoricalConsistency = this.calculateCategoricalConsistency(data);
    const temporalConsistency = this.calculateTemporalConsistency(data);

    const score = (formatConsistency + scriptConsistency + categoricalConsistency + temporalConsistency) / 4;

    return {
      score,
      formatConsistency,
      scriptConsistency,
      categoricalConsistency,
      temporalConsistency,
      inconsistencyErrors: []
    };
  }

  private async calculateTimeliness(data: unknown[], metadata?: any): Promise<TimelinessMetric> {
    let dataAge = 0;
    let updateFrequency = 0;
    let recencyScore = 0;

    // Check publication date
    if (metadata?.publicationDate) {
      const publicationDate = new Date(metadata.publicationDate);
      dataAge = (Date.now() - publicationDate.getTime()) / (1000 * 60 * 60 * 24); // days
    }

    // Check modification date
    if (metadata?.modificationDate) {
      const modificationDate = new Date(metadata.modificationDate);
      const modificationAge = (Date.now() - modificationDate.getTime()) / (1000 * 60 * 60 * 24);
      recencyScore = Math.max(0, 100 - (modificationAge / 365 * 100)); // Deduct 100% per year
    } else if (metadata?.publicationDate) {
      const publicationDate = new Date(metadata.publicationDate);
      const publicationAge = (Date.now() - publicationDate.getTime()) / (1000 * 60 * 60 * 24);
      recencyScore = Math.max(0, 100 - (publicationAge / 365 * 100));
    }

    // Estimate update frequency based on data patterns
    updateFrequency = this.estimateUpdateFrequency(data);

    // Calculate overall timeliness score
    const recencyWeight = 0.5;
    const frequencyWeight = 0.3;
    const currencyWeight = 0.2;

    const currencyScore = Math.max(0, 100 - (dataAge / 730 * 100)); // 100% for < 2 years, then decline
    const frequencyScore = Math.min(100, updateFrequency * 10); // Scale frequency

    const score = (recencyScore * recencyWeight) + (frequencyScore * frequencyWeight) + (currencyScore * currencyWeight);

    return {
      score,
      dataAge,
      updateFrequency,
      recencyScore,
      lastUpdated: metadata?.modificationDate || metadata?.publicationDate || null
    };
  }

  private async calculateRelevance(data: unknown[], metadata?: any): Promise<RelevanceMetric> {
    let titleRelevance = 0;
    let descriptionRelevance = 0;
    let keywordRelevance = 0;
    let thematicRelevance = 0;

    // Analyze title relevance
    if (metadata?.title) {
      titleRelevance = this.analyzeTextRelevance(metadata.title, data);
    }

    // Analyze description relevance
    if (metadata?.description) {
      descriptionRelevance = this.analyzeTextRelevance(metadata.description, data);
    }

    // Analyze keyword relevance
    if (metadata?.keywords && metadata.keywords.length > 0) {
      keywordRelevance = Math.min(100, metadata.keywords.length * 20); // Up to 5 keywords = 100%
    }

    // Analyze thematic relevance
    if (metadata?.theme && metadata.theme.length > 0) {
      thematicRelevance = 100; // Having themes is good
    }

    const score = (titleRelevance * 0.3) + (descriptionRelevance * 0.3) + (keywordRelevance * 0.2) + (thematicRelevance * 0.2);

    return {
      score,
      titleRelevance,
      descriptionRelevance,
      keywordRelevance,
      thematicRelevance,
      dataUtility: this.assessDataUtility(data)
    };
  }

  private async calculateSerbianSpecificity(data: unknown[]): Promise<SerbianSpecificityMetric> {
    if (data.length === 0) {
      return {
        scriptConsistency: 0,
        languageAccuracy: 0,
        territorialCoverage: 0,
        institutionalAccuracy: 0,
        dateFormatting: 0,
        numberFormatting: 0,
        addressStandardization: 0,
        jmbgValidation: 0,
        pibValidation: 0,
        score: 0
      };
    }

    const scriptConsistency = this.calculateScriptConsistency(data);
    const languageAccuracy = this.calculateLanguageAccuracy(data);
    const territorialCoverage = this.calculateTerritorialCoverage(data);
    const institutionalAccuracy = this.calculateInstitutionalAccuracy(data);
    const dateFormatting = this.calculateDateFormattingAccuracy(data);
    const numberFormatting = this.calculateNumberFormattingAccuracy(data);
    const addressStandardization = this.calculateAddressStandardization(data);

    // Calculate JMBG and PIB validation scores
    const { validJMBG, invalidJMBG, validPIB, invalidPIB } = await this.calculateAccuracy(data);
    const totalJMBG = validJMBG + invalidJMBG;
    const totalPIB = validPIB + invalidPIB;
    const jmbgValidation = totalJMBG > 0 ? (validJMBG / totalJMBG) * 100 : 100;
    const pibValidation = totalPIB > 0 ? (validPIB / totalPIB) * 100 : 100;

    const score = (
      scriptConsistency * 0.15 +
      languageAccuracy * 0.10 +
      territorialCoverage * 0.15 +
      institutionalAccuracy * 0.15 +
      dateFormatting * 0.10 +
      numberFormatting * 0.10 +
      addressStandardization * 0.10 +
      jmbgValidation * 0.075 +
      pibValidation * 0.075
    );

    return {
      scriptConsistency,
      languageAccuracy,
      territorialCoverage,
      institutionalAccuracy,
      dateFormatting,
      numberFormatting,
      addressStandardization,
      jmbgValidation,
      pibValidation,
      score
    };
  }

  private validateCompleteness(
    completeness: CompletenessMetric,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    requirements.push({
      id: 'quality_completeness',
      name: 'Data Completeness',
      description: 'Dataset should have minimal missing values',
      required: true,
      status: completeness.score >= 80 ? 'pass' : completeness.score >= 50 ? 'warning' : 'fail',
      score: completeness.score,
      evidence: `${completeness.completeFields}/${completeness.totalFields} fields complete (${completeness.score}%)`
    });
  }

  private validateAccuracy(
    accuracy: AccuracyMetric,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[],
    errors: ValidationError[]
  ): void {
    const totalValidations = accuracy.validJMBG + accuracy.invalidJMBG + accuracy.validPIB + accuracy.invalidPIB + accuracy.validDates + accuracy.invalidDates + accuracy.validNumbers + accuracy.invalidNumbers;
    const accuracyScore = totalValidations > 0 ? ((accuracy.validJMBG + accuracy.validPIB + accuracy.validDates + accuracy.validNumbers) / totalValidations) * 100 : 100;

    requirements.push({
      id: 'quality_accuracy',
      name: 'Data Accuracy',
      description: 'Data should be accurate and properly validated',
      required: true,
      status: accuracyScore >= 90 ? 'pass' : accuracyScore >= 70 ? 'warning' : 'fail',
      score: accuracyScore,
      evidence: `JMBG: ${accuracy.validJMBG}/${accuracy.validJMBG + accuracy.invalidJMBG}, PIB: ${accuracy.validPIB}/${accuracy.validPIB + accuracy.invalidPIB}`
    });

    // Add validation errors to main error list
    errors.push(...accuracy.validationErrors);
  }

  private validateConsistency(
    consistency: ConsistencyMetric,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[],
    errors: ValidationError[]
  ): void {
    requirements.push({
      id: 'quality_consistency',
      name: 'Data Consistency',
      description: 'Data should be consistent in format and structure',
      required: true,
      status: consistency.score >= 80 ? 'pass' : consistency.score >= 60 ? 'warning' : 'fail',
      score: consistency.score,
      evidence: `Format: ${consistency.formatConsistency}%, Script: ${consistency.scriptConsistency}%`
    });
  }

  private validateTimeliness(
    timeliness: TimelinessMetric,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    requirements.push({
      id: 'quality_timeliness',
      name: 'Data Timeliness',
      description: 'Data should be current and regularly updated',
      required: true,
      status: timeliness.score >= 70 ? 'pass' : timeliness.score >= 50 ? 'warning' : 'fail',
      score: timeliness.score,
      evidence: `Recency: ${timeliness.recencyScore}%, Frequency: ${timeliness.updateFrequency}`
    });
  }

  private validateRelevance(
    relevance: RelevanceMetric,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[]
  ): void {
    requirements.push({
      id: 'quality_relevance',
      name: 'Data Relevance',
      description: 'Data should be relevant and useful for Serbian context',
      required: false,
      status: relevance.score >= 60 ? 'pass' : 'warning',
      score: relevance.score,
      evidence: `Title: ${relevance.titleRelevance}, Description: ${relevance.descriptionRelevance}`
    });
  }

  private validateSerbianSpecificity(
    serbianSpecificity: SerbianSpecificityMetric,
    requirements: ComplianceRequirement[],
    recommendations: Recommendation[],
    errors: ValidationError[]
  ): void {
    requirements.push({
      id: 'quality_serbian_specificity',
      name: 'Serbian Specificity',
      description: 'Data should reflect Serbian context and standards',
      required: true,
      status: serbianSpecificity.score >= 70 ? 'pass' : serbianSpecificity.score >= 50 ? 'warning' : 'fail',
      score: serbianSpecificity.score,
      evidence: `Script: ${serbianSpecificity.scriptConsistency}%, JMBG: ${serbianSpecificity.jmbgValidation}%`
    });
  }

  private calculateQualityScore(qualityMetrics: SerbianDataQuality): number {
    return Math.round(qualityMetrics.overallScore);
  }

  private getQualityStatus(score: number): 'compliant' | 'partial' | 'non-compliant' {
    if (score >= 85) return 'compliant';
    if (score >= 65) return 'partial';
    return 'non-compliant';
  }

  // Helper methods for metric calculations
  private validateJMBG(jmbg: string): boolean {
    if (!/^\d{13}$/.test(jmbg)) return false;

    const day = parseInt(jmbg.substring(0, 2));
    const month = parseInt(jmbg.substring(2, 4));
    const year = parseInt(jmbg.substring(4, 7));
    const control = parseInt(jmbg.substring(12, 13));

    if (day < 1 || day > 31 || month < 1 || month > 12) return false;

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
    if (!/^\d{9}$/.test(pib)) return false;

    const weights = [8, 7, 6, 5, 4, 3, 2, 1];
    let sum = 0;

    for (let i = 0; i < 8; i++) {
      sum += parseInt(pib.substring(i, i + 1)) * weights[i];
    }

    const remainder = sum % 11;
    const calculatedControl = remainder === 0 ? 0 : 11 - remainder;

    return calculatedControl === parseInt(pib.substring(8, 9));
  }

  private isSerbianDate(value: string): boolean {
    const patterns = [
      /^\d{1,2}\.\d{1,2}\.\d{4}\.$/,
      /^\d{1,2}\. \d{1,2}\. \d{4}\. године$/,
      /^\d{1,2}\.\d{1,2}\.\d{4}$/,
      /^\d{4}-\d{2}-\d{2}$/
    ];

    return patterns.some(pattern => pattern.test(value.trim()));
  }

  private parseSerbianDate(value: string): Date {
    const cleanValue = value.trim().replace('године', '').trim();

    const ddmmyyyy = cleanValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    throw new Error(`Unable to parse Serbian date: ${value}`);
  }

  private parseSerbianNumber(value: string): number {
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue);
  }

  private calculateScriptConsistency(data: unknown[]): number {
    const scripts = data.map(row => {
      const text = Object.values(row as Record<string, any>).join(' ');
      return this.detectScript(text);
    });

    const cyrillicCount = scripts.filter(s => s === 'cyrillic').length;
    const latinCount = scripts.filter(s => s === 'latin').length;
    const totalCount = scripts.filter(s => s !== 'unknown').length;

    if (totalCount === 0) return 0;
    return (Math.max(cyrillicCount, latinCount) / totalCount) * 100;
  }

  private detectScript(text: string): 'cyrillic' | 'latin' | 'mixed' | 'unknown' {
    const cyrillicChars = /[аАбБвВгГдДђЂеЕжЖзЗиИјЈкКлЛљЉмМнНњЊоОпПрРсСтТћЋуУфФхХцЦчЧџШшШ]/g;
    const latinChars = /[čČćĆžŽšŠđĐ]/g;

    const cyrillicMatches = (text.match(cyrillicChars) || []).length;
    const latinMatches = (text.match(latinChars) || []).length;

    if (cyrillicMatches === 0 && latinMatches === 0) return 'unknown';
    if (cyrillicMatches > latinMatches * 2) return 'cyrillic';
    if (latinMatches > cyrillicMatches * 2) return 'latin';
    return 'mixed';
  }

  private calculateLanguageAccuracy(data: unknown[]): number {
    // Simplified check for Serbian language patterns
    const serbianWords = /\b(и|у|на|са|за|по|од|до|када|где|шта|који|какав)\b/gi;
    const totalText = data.map(row => Object.values(row as Record<string, any>).join(' ')).join(' ');
    const matches = (totalText.match(serbianWords) || []).length;
    const totalWords = totalText.split(/\s+/).length;

    return totalWords > 0 ? Math.min(100, (matches / totalWords) * 500) : 0; // Scale up
  }

  private calculateTerritorialCoverage(data: unknown[]): number {
    // Check for Serbian locations, municipalities, regions
    const serbianLocations = /\b(Београд|Нови Сад|Ниш|Крагујевац|Суботица|Приштина|Врање|Лесковац|Земун)\b/gi;
    const totalText = data.map(row => Object.values(row as Record<string, any>).join(' ')).join(' ');
    const matches = (totalText.match(serbianLocations) || []).length;
    const totalRecords = data.length;

    return totalRecords > 0 ? Math.min(100, (matches / totalRecords) * 20) : 0; // Scale based on records
  }

  private calculateInstitutionalAccuracy(data: unknown[]): number {
    // Check for Serbian government institution patterns
    const totalText = data.map(row => Object.values(row as Record<string, any>).join(' ')).join(' ');
    let matches = 0;

    this.serbianInstitutionPatterns.forEach(pattern => {
      matches += (totalText.match(pattern) || []).length;
    });

    const totalRecords = data.length;
    return totalRecords > 0 ? Math.min(100, (matches / totalRecords) * 15) : 0;
  }

  private calculateDateFormattingAccuracy(data: unknown[]): number {
    let validDates = 0;
    let totalDates = 0;

    data.forEach(record => {
      Object.values(record as Record<string, any>).forEach(value => {
        const stringValue = String(value).trim();
        if (this.isSerbianDate(stringValue)) {
          totalDates++;
          try {
            this.parseSerbianDate(stringValue);
            validDates++;
          } catch {
            // Invalid date
          }
        }
      });
    });

    return totalDates > 0 ? (validDates / totalDates) * 100 : 100;
  }

  private calculateNumberFormattingAccuracy(data: unknown[]): number {
    let validNumbers = 0;
    let totalNumbers = 0;

    data.forEach(record => {
      Object.values(record as Record<string, any>).forEach(value => {
        const stringValue = String(value).trim();
        if (/^-?\d{1,3}(?:\.\d{3})*(?:,\d+)?$/.test(stringValue)) {
          totalNumbers++;
          try {
            this.parseSerbianNumber(stringValue);
            validNumbers++;
          } catch {
            // Invalid number
          }
        }
      });
    });

    return totalNumbers > 0 ? (validNumbers / totalNumbers) * 100 : 100;
  }

  private calculateAddressStandardization(data: unknown[]): number {
    let validAddresses = 0;
    let totalAddresses = 0;

    data.forEach(record => {
      Object.values(record as Record<string, any>).forEach(value => {
        const stringValue = String(value).trim();
        if (this.isAddress(stringValue)) {
          totalAddresses++;
          if (this.isValidSerbianAddress(stringValue)) {
            validAddresses++;
          }
        }
      });
    });

    return totalAddresses > 0 ? (validAddresses / totalAddresses) * 100 : 100;
  }

  private isAddress(value: string): boolean {
    const addressKeywords = /\b(улица|булевар|трг|бр\.|број|апартаман|стан)\b/gi;
    return addressKeywords.test(value);
  }

  private isValidSerbianAddress(address: string): boolean {
    return this.serbianAddressPatterns.some(pattern => pattern.test(address.trim()));
  }

  private calculateFormatConsistency(data: unknown[]): number {
    // Check format consistency across rows
    if (data.length < 2) return 100;

    const firstRecord = data[0] as Record<string, any>;
    const fields = Object.keys(firstRecord);
    let consistentFields = 0;

    fields.forEach(field => {
      const firstValue = String(firstRecord[field] || '');
      const firstType = this.detectDataType(firstValue);
      let isConsistent = true;

      for (let i = 1; i < Math.min(data.length, 100); i++) {
        const record = data[i] as Record<string, any>;
        const value = String(record[field] || '');
        const currentType = this.detectDataType(value);

        if (currentType !== firstType && firstType !== 'empty' && currentType !== 'empty') {
          isConsistent = false;
          break;
        }
      }

      if (isConsistent) consistentFields++;
    });

    return fields.length > 0 ? (consistentFields / fields.length) * 100 : 100;
  }

  private detectDataType(value: string): string {
    if (!value || value.trim() === '') return 'empty';
    if (/^\d{13}$/.test(value)) return 'jmbg';
    if (/^\d{9}$/.test(value)) return 'pib';
    if (this.isSerbianDate(value)) return 'date';
    if (/^-?\d{1,3}(?:\.\d{3})*(?:,\d+)?$/.test(value)) return 'number';
    if (/^\d+$/.test(value)) return 'integer';
    return 'string';
  }

  private calculateCategoricalConsistency(data: unknown[]): number {
    // Check categorical data consistency
    if (data.length === 0) return 100;

    const firstRecord = data[0] as Record<string, any>;
    const fields = Object.keys(firstRecord);
    let categoricalConsistency = 0;
    let categoricalFields = 0;

    fields.forEach(field => {
      const firstValue = String(firstRecord[field] || '').trim();
      const uniqueValues = new Set<string>();

      data.forEach(record => {
        const value = String((record as Record<string, any>)[field] || '').trim();
        if (value) uniqueValues.add(value);
      });

      // If there are relatively few unique values (< 10% of records), consider it categorical
      const uniqueRatio = uniqueValues.size / data.length;
      if (uniqueRatio < 0.1 && uniqueValues.size > 1) {
        categoricalFields++;
        // Check if values are consistent (no typos)
        const hasInconsistencies = this.hasCategoricalInconsistencies(Array.from(uniqueValues));
        if (!hasInconsistencies) {
          categoricalConsistency++;
        }
      }
    });

    return categoricalFields > 0 ? (categoricalConsistency / categoricalFields) * 100 : 100;
  }

  private hasCategoricalInconsistencies(values: string[]): boolean {
    // Simple check for similar values that might be typos
    const sortedValues = values.sort();
    for (let i = 0; i < sortedValues.length - 1; i++) {
      const current = sortedValues[i].toLowerCase();
      const next = sortedValues[i + 1].toLowerCase();

      // Check for very similar values
      const similarity = this.calculateSimilarity(current, next);
      if (similarity > 0.8 && similarity < 1) {
        return true; // Likely inconsistent categorical values
      }
    }

    return false;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private calculateTemporalConsistency(data: unknown[]): number {
    // Check temporal consistency of date fields
    const dates: Date[] = [];

    data.forEach(record => {
      Object.values(record as Record<string, any>).forEach(value => {
        const stringValue = String(value).trim();
        if (this.isSerbianDate(stringValue)) {
          try {
            dates.push(this.parseSerbianDate(stringValue));
          } catch {
            // Invalid date
          }
        }
      });
    });

    if (dates.length === 0) return 100;

    // Check if dates are in reasonable chronological order
    dates.sort((a, b) => a.getTime() - b.getTime());
    let consistentDates = 0;

    for (let i = 1; i < dates.length; i++) {
      // Allow some flexibility for data entry errors
      if (dates[i].getTime() >= dates[i - 1].getTime() - (24 * 60 * 60 * 1000)) { // Allow 1 day backward
        consistentDates++;
      }
    }

    return dates.length > 1 ? (consistentDates / (dates.length - 1)) * 100 : 100;
  }

  private estimateUpdateFrequency(data: unknown[]): number {
    // Simple heuristic based on data patterns
    if (data.length === 0) return 0;

    // Look for date patterns that might indicate update frequency
    const dates: Date[] = [];

    data.forEach(record => {
      Object.values(record as Record<string, any>).forEach(value => {
        const stringValue = String(value).trim();
        if (this.isSerbianDate(stringValue)) {
          try {
            dates.push(this.parseSerbianDate(stringValue));
          } catch {
            // Invalid date
          }
        }
      });
    });

    if (dates.length < 2) return 1; // Assume annual updates

    dates.sort((a, b) => a.getTime() - b.getTime());
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const timeSpan = lastDate.getTime() - firstDate.getTime();
    const daysSpan = timeSpan / (1000 * 60 * 60 * 24);

    return Math.max(1, Math.round(365 / daysSpan)); // Updates per year
  }

  private analyzeTextRelevance(text: any, data: unknown[]): number {
    const textString = typeof text === 'string' ? text : JSON.stringify(text);
    const dataString = data.map(record => Object.values(record as Record<string, any>).join(' ')).join(' ');

    // Simple keyword overlap analysis
    const textWords = textString.toLowerCase().split(/\s+/);
    const dataWords = dataString.toLowerCase().split(/\s+/);

    const overlap = textWords.filter(word => dataWords.includes(word)).length;
    return textWords.length > 0 ? (overlap / textWords.length) * 100 : 0;
  }

  private assessDataUtility(data: unknown[]): number {
    if (data.length === 0) return 0;

    // Assess data utility based on various factors
    const recordCount = data.length;
    const fieldCount = Object.keys(data[0] as Record<string, any>).length;
    const nonEmptyRatio = this.calculateNonEmptyRatio(data);
    const uniqueness = this.calculateUniqueness(data);

    // Calculate utility score
    const sizeScore = Math.min(100, recordCount / 100); // More records is better, up to 100
    const fieldScore = Math.min(100, fieldCount * 10); // More fields is better, up to 10 fields
    const completenessScore = nonEmptyRatio * 100;
    const uniquenessScore = uniqueness * 100;

    return (sizeScore * 0.3 + fieldScore * 0.2 + completenessScore * 0.3 + uniquenessScore * 0.2);
  }

  private calculateNonEmptyRatio(data: unknown[]): number {
    if (data.length === 0) return 0;

    let totalFields = 0;
    let nonEmptyFields = 0;

    data.forEach(record => {
      Object.values(record as Record<string, any>).forEach(value => {
        totalFields++;
        if (value !== null && value !== undefined && String(value).trim() !== '') {
          nonEmptyFields++;
        }
      });
    });

    return totalFields > 0 ? nonEmptyFields / totalFields : 0;
  }

  private calculateUniqueness(data: unknown[]): number {
    if (data.length === 0) return 0;

    const firstRecord = data[0] as Record<string, any>;
    const fields = Object.keys(firstRecord);
    let totalUniqueness = 0;

    fields.forEach(field => {
      const uniqueValues = new Set();
      data.forEach(record => {
        const value = (record as Record<string, any>)[field];
        if (value !== null && value !== undefined) {
          uniqueValues.add(String(value));
        }
      });

      const uniquenessRatio = uniqueValues.size / data.length;
      totalUniqueness += uniquenessRatio;
    });

    return fields.length > 0 ? totalUniqueness / fields.length : 0;
  }
}