import {
  SerbianMetadataSchema,
  SerbianLocalizedString,
  GovernmentInstitution,
  SerbianGovernmentTheme,
  DataFormat,
  OpenLicense,
  ContactPoint,
  Distribution
} from './models';

/**
 * Serbian Government Metadata Standards Adapter
 *
 * Provides adaptation between different metadata formats and Serbian government standards.
 * Supports Dublin Core, DCAT, and Serbian-specific metadata schemas.
 */
export class SerbianMetadataAdapter {
  private readonly serbianInstitutions: Map<string, GovernmentInstitution>;
  private readonly serbianThemes: SerbianGovernmentTheme[];
  private readonly serbianLicenses: Map<string, OpenLicense>;

  constructor() {
    this.serbianInstitutions = this.initializeSerbianInstitutions();
    this.serbianThemes = this.initializeSerbianThemes();
    this.serbianLicenses = this.initializeSerbianLicenses();
  }

  /**
   * Adapt Dublin Core metadata to Serbian government standards
   */
  adaptFromDublinCore(dublinCore: any): Partial<SerbianMetadataSchema> {
    return {
      identifier: dublinCore.identifier || dublinCore['dc:identifier'],
      title: this.adaptLocalizedString(dublinCore.title || dublinCore['dc:title']),
      description: this.adaptLocalizedString(dublinCore.description || dublinCore['dc:description']),
      keywords: this.adaptKeywords(dublinCore.subject || dublinCore['dc:subject']),
      publisher: this.adaptPublisher(dublinCore.publisher || dublinCore['dc:publisher']),
      publicationDate: this.adaptDate(dublinCore.date || dublinCore['dc:date']),
      modificationDate: this.adaptDate(dublinCore.modified || dublinCore['dcterms:modified']),
      language: this.adaptLanguage(dublinCore.language || dublinCore['dc:language']),
      theme: this.adaptTheme(dublinCore.type || dublinCore['dc:type']),
      format: this.adaptFormat(dublinCore.format || dublinCore['dc:format']),
      license: this.adaptLicense(dublinCore.rights || dublinCore['dc:rights']),
      contactPoint: this.adaptContactPoint(dublinCore.creator || dublinCore['dc:creator']),
      distribution: this.adaptDistributionFromDC(dublinCore)
    };
  }

  /**
   * Adapt DCAT metadata to Serbian government standards
   */
  adaptFromDCAT(dcat: any): Partial<SerbianMetadataSchema> {
    const dataset = dcat.dataset || dcat['dcat:Dataset'] || dcat;

    return {
      identifier: dataset.identifier || dataset['dct:identifier'],
      title: this.adaptLocalizedString(dataset.title || dataset['dct:title']),
      description: this.adaptLocalizedString(dataset.description || dataset['dct:description']),
      keywords: this.adaptKeywords(dataset.keyword || dataset['dcat:keyword']),
      publisher: this.adaptPublisher(dataset.publisher || dataset['dct:publisher']),
      publicationDate: this.adaptDate(dataset.issued || dataset['dct:issued']),
      modificationDate: this.adaptDate(dataset.modified || dataset['dct:modified']),
      language: this.adaptLanguage(dataset.language || dataset['dct:language']),
      theme: this.adaptThemeFromDCAT(dataset.theme || dataset['dct:theme']),
      spatial: this.adaptSpatial(dataset.spatial || dataset['dct:spatial']),
      temporal: this.adaptTemporal(dataset.temporal || dataset['dct:temporal']),
      format: this.adaptFormatFromDCAT(dataset.distribution || dataset['dcat:distribution']),
      license: this.adaptLicenseFromDCAT(dataset.license || dataset['dct:license']),
      rights: this.adaptRights(dataset.rights || dataset['dct:rights']),
      conformsTo: this.adaptConformsTo(dataset.conformsTo || dataset['dct:conformsTo']),
      contactPoint: this.adaptContactPoint(dataset.contactPoint || dataset['dcat:contactPoint']),
      distribution: this.adaptDistributionFromDCAT(dataset.distribution || dataset['dcat:distribution'])
    };
  }

  /**
   * Adapt Serbian metadata to Dublin Core format
   */
  adaptToDublinCore(serbianMetadata: Partial<SerbianMetadataSchema>): any {
    return {
      'dc:identifier': serbianMetadata.identifier,
      'dc:title': this.getStringValue(serbianMetadata.title, 'sr'),
      'dc:description': this.getStringValue(serbianMetadata.description, 'sr'),
      'dc:subject': serbianMetadata.keywords?.map(k => this.getStringValue(k, 'sr')).join('; '),
      'dc:publisher': serbianMetadata.publisher?.name?.sr,
      'dc:date': this.formatDate(serbianMetadata.publicationDate),
      'dcterms:modified': this.formatDate(serbianMetadata.modificationDate),
      'dc:language': serbianMetadata.language?.join(', '),
      'dc:type': serbianMetadata.theme?.map(t => t.code).join(', '),
      'dc:format': serbianMetadata.format?.map(f => f.format).join(', '),
      'dc:rights': serbianMetadata.license?.name?.sr,
      'dc:creator': serbianMetadata.contactPoint?.name
    };
  }

  /**
   * Adapt Serbian metadata to DCAT format
   */
  adaptToDCAT(serbianMetadata: Partial<SerbianMetadataSchema>): any {
    return {
      '@context': 'https://www.w3.org/ns/dcat',
      '@type': 'dcat:Dataset',
      'dct:identifier': serbianMetadata.identifier,
      'dct:title': serbianMetadata.title,
      'dct:description': serbianMetadata.description,
      'dcat:keyword': serbianMetadata.keywords?.map(k => this.getStringValue(k, 'sr')),
      'dct:publisher': {
        '@type': 'foaf:Organization',
        'foaf:name': serbianMetadata.publisher?.name
      },
      'dct:issued': this.formatDateISO(serbianMetadata.publicationDate),
      'dct:modified': this.formatDateISO(serbianMetadata.modificationDate),
      'dct:language': serbianMetadata.language?.map(lang => ({ '@id': `http://publications.europa.eu/resource/authority/language/${lang.toUpperCase()}` })),
      'dct:theme': serbianMetadata.theme?.map(theme => ({
        '@type': 'skos:Concept',
        'skos:prefLabel': theme.name,
        'skos:inScheme': { '@id': 'http://data.gov.rs/voc/themes' }
      })),
      'dct:spatial': serbianMetadata.spatial ? {
        '@type': 'dct:Location',
        'skos:prefLabel': serbianMetadata.spatial
      } : undefined,
      'dct:temporal': serbianMetadata.temporal ? {
        '@type': 'dct:PeriodOfTime',
        'schema:startDate': serbianMetadata.temporal.startDate,
        'schema:endDate': serbianMetadata.temporal.endDate
      } : undefined,
      'dcat:distribution': serbianMetadata.distribution?.map(dist => ({
        '@type': 'dcat:Distribution',
        'dct:title': dist.title,
        'dcat:accessURL': dist.accessURL,
        'dcat:downloadURL': dist.downloadURL,
        'dct:format': { '@id': `http://publications.europa.eu/resource/authority/file-type/${dist.format}` },
        'dcat:byteSize': dist.size
      })),
      'dct:license': {
        '@type': 'dct:LicenseDocument',
        'dct:identifier': serbianMetadata.license?.identifier,
        'dct:title': serbianMetadata.license?.name
      },
      'dcat:contactPoint': {
        '@type': 'vcard:Kind',
        'vcard:fn': serbianMetadata.contactPoint?.name,
        'vcard:hasEmail': serbianMetadata.contactPoint?.email
      }
    };
  }

  /**
   * Validate and enhance Serbian metadata
   */
  enhanceSerbianMetadata(metadata: Partial<SerbianMetadataSchema>): Partial<SerbianMetadataSchema> {
    const enhanced = { ...metadata };

    // Ensure Serbian language support
    if (!enhanced.language?.includes('sr') && !enhanced.language?.includes('sr-Latn')) {
      enhanced.language = [...(enhanced.language || []), 'sr'];
    }

    // Auto-detect government institution if missing
    if (!enhanced.publisher && enhanced.identifier) {
      enhanced.publisher = this.detectInstitution(enhanced.identifier);
    }

    // Suggest themes based on content analysis
    if (!enhanced.theme || enhanced.theme.length === 0) {
      enhanced.theme = this.suggestThemes(enhanced.title, enhanced.description);
    }

    // Recommend open license if missing
    if (!enhanced.license) {
      enhanced.license = this.recommendLicense();
    }

    // Ensure standard formats
    if (enhanced.format) {
      enhanced.format = this.standardizeFormats(enhanced.format);
    }

    return enhanced;
  }

  private adaptLocalizedString(input: any): SerbianLocalizedString {
    if (typeof input === 'string') {
      return { sr: input };
    }
    if (typeof input === 'object' && input !== null) {
      const result: SerbianLocalizedString = {};
      if (input['@value']) {
        result.sr = input['@value'];
      } else if (input['#text']) {
        result.sr = input['#text'];
      } else {
        Object.keys(input).forEach(key => {
          if (['sr', 'sr-Latn', 'en'].includes(key)) {
            result[key as keyof SerbianLocalizedString] = input[key];
          }
        });
      }
      return result;
    }
    return { sr: String(input) };
  }

  private adaptKeywords(input: any): SerbianLocalizedString[] {
    if (typeof input === 'string') {
      return input.split(';').map(k => ({ sr: k.trim() })).filter(k => k.sr);
    }
    if (Array.isArray(input)) {
      return input.map(item =>
        typeof item === 'string' ? { sr: item } : this.adaptLocalizedString(item)
      );
    }
    return [];
  }

  private adaptPublisher(input: any): GovernmentInstitution | undefined {
    if (!input) return undefined;

    const name = typeof input === 'string' ? input :
                input.name || input['foaf:name'] || input['vcard:fn'] || '';

    const identifier = input.identifier || input['dct:identifier'] || '';

    // Try to match with known Serbian institutions
    const matchedInstitution = this.findInstitutionByName(name);
    if (matchedInstitution) {
      return matchedInstitution;
    }

    // Create basic institution object
    return {
      name: { sr: name },
      identifier,
      type: 'agency' as const,
      level: 'national' as const,
      contactInfo: {
        email: input.email || input['vcard:hasEmail'] || '',
        phone: input.phone || input['vcard:hasTelephone'] || '',
        address: input.address || input['vcard:adr'] || ''
      }
    };
  }

  private adaptDate(input: any): Date | undefined {
    if (!input) return undefined;

    if (input instanceof Date) return input;
    if (typeof input === 'string') {
      const date = new Date(input);
      return isNaN(date.getTime()) ? undefined : date;
    }
    if (input['@value']) {
      return new Date(input['@value']);
    }
    return undefined;
  }

  private adaptLanguage(input: any): ('sr' | 'sr-Latn' | 'en')[] {
    if (!input) return [];

    if (typeof input === 'string') {
      const lang = input.toLowerCase();
      if (['sr', 'sr-cyrl', 'serbian'].includes(lang)) return ['sr'];
      if (['sr-latn', 'serbian-latin'].includes(lang)) return ['sr-Latn'];
      if (['en', 'english'].includes(lang)) return ['en'];
      return [];
    }

    if (Array.isArray(input)) {
      return input.map(item => this.adaptLanguage(item)).flat();
    }

    return [];
  }

  private adaptTheme(input: any): SerbianGovernmentTheme[] {
    if (!input) return [];

    const types = Array.isArray(input) ? input : [input];

    return types.map(type => {
      const code = typeof type === 'string' ? type : type.code || type['@id'];
      const theme = this.serbianThemes.find(t =>
        t.code === code || t.name.sr === code || t.name['sr-Latn'] === code
      );

      return theme || {
        code,
        name: { sr: code },
        level: 1
      };
    });
  }

  private adaptThemeFromDCAT(input: any): SerbianGovernmentTheme[] {
    if (!input) return [];

    const themes = Array.isArray(input) ? input : [input];

    return themes.map(theme => {
      const code = theme['skos:notation'] || theme.code || theme['@id'];
      const name = theme['skos:prefLabel'] || theme.name;

      return {
        code,
        name: this.adaptLocalizedString(name),
        level: 1
      };
    });
  }

  private adaptFormat(input: any): DataFormat[] {
    if (!input) return [];

    const formats = Array.isArray(input) ? input : [input];

    return formats.map(format => ({
      format: typeof format === 'string' ? format : format.format || format['@id'],
      compression: undefined,
      packaging: undefined,
      encoding: undefined,
      schema: undefined
    }));
  }

  private adaptFormatFromDCAT(input: any): DataFormat[] {
    if (!input) return [];

    const distributions = Array.isArray(input) ? input : [input];

    return distributions.map(dist => ({
      format: dist['dct:format']?.['@id'] || dist.format || 'application/octet-stream',
      compression: dist.dcatcompress || undefined,
      packaging: dist.dcatpackage || undefined,
      encoding: dist.dcatencoding || 'UTF-8',
      schema: dist.dctconformsTo?.['@id'] || undefined
    }));
  }

  private adaptLicense(input: any): OpenLicense | undefined {
    if (!input) return undefined;

    const licenseId = typeof input === 'string' ? input :
                      input.identifier || input['dct:identifier'] || '';

    return this.serbianLicenses.get(licenseId) || {
      identifier: licenseId,
      name: { sr: input.name || input['dct:title'] || licenseId },
      url: input.url || input['@id'] || '',
      attributionRequired: true,
      commercialUseAllowed: true,
      derivativeWorksAllowed: true
    };
  }

  private adaptLicenseFromDCAT(input: any): OpenLicense | undefined {
    if (!input) return undefined;

    return {
      identifier: input['dct:identifier'] || input['@id'] || '',
      name: this.adaptLocalizedString(input['dct:title'] || input.name),
      url: input['@id'] || '',
      attributionRequired: true,
      commercialUseAllowed: true,
      derivativeWorksAllowed: true
    };
  }

  private adaptContactPoint(input: any): ContactPoint | undefined {
    if (!input) return undefined;

    return {
      name: typeof input === 'string' ? input : input.name || input['vcard:fn'] || '',
      email: input.email || input['vcard:hasEmail'] || '',
      phone: input.phone || input['vcard:hasTelephone'] || '',
      address: input.address || input['vcard:adr'] || ''
    };
  }

  private adaptDistributionFromDC(input: any): Distribution[] {
    return [];
  }

  private adaptDistributionFromDCAT(input: any): Distribution[] {
    if (!input) return [];

    const distributions = Array.isArray(input) ? input : [input];

    return distributions.map(dist => ({
      accessURL: dist['dcat:accessURL'] || dist.accessURL || '',
      downloadURL: dist['dcat:downloadURL'] || dist.downloadURL,
      format: dist['dct:format']?.['@id'] || dist.format || 'application/octet-stream',
      size: dist['dcat:byteSize'] || dist.size || undefined,
      title: dist['dct:title'] || dist.title || ''
    }));
  }

  private adaptSpatial(input: any): any {
    if (!input) return undefined;
    return typeof input === 'string' ? input : input['skos:prefLabel'] || input.name;
  }

  private adaptTemporal(input: any): any {
    if (!input) return undefined;

    return {
      startDate: input['schema:startDate'] || input.startDate,
      endDate: input['schema:endDate'] || input.endDate
    };
  }

  private adaptRights(input: any): any {
    if (!input) return undefined;
    return this.adaptLocalizedString(input);
  }

  private adaptConformsTo(input: any): any[] {
    if (!input) return [];

    const standards = Array.isArray(input) ? input : [input];
    return standards.map(std => ({
      identifier: std['dct:identifier'] || std['@id'] || '',
      title: this.adaptLocalizedString(std['dct:title'] || std.name),
      description: this.adaptLocalizedString(std['dct:description'] || std.description)
    }));
  }

  private getStringValue(localizedString: SerbianLocalizedString | undefined, language: string): string {
    if (!localizedString) return '';
    return localizedString[language as keyof SerbianLocalizedString] ||
           localizedString.sr ||
           localizedString['sr-Latn'] ||
           localizedString.en ||
           '';
  }

  private formatDate(date: Date | undefined): string {
    if (!date) return '';
    return date.toLocaleDateString('sr-RS');
  }

  private formatDateISO(date: Date | undefined): string {
    if (!date) return '';
    return date.toISOString();
  }

  private detectInstitution(identifier: string): GovernmentInstitution | undefined {
    // Simple detection based on identifier patterns
    if (identifier.startsWith('RS-')) {
      return this.serbianInstitutions.get('RS-VLADA') || this.serbianInstitutions.values().next().value;
    }
    return undefined;
  }

  private findInstitutionByName(name: string): GovernmentInstitution | undefined {
    const searchName = name.toLowerCase();

    for (const institution of this.serbianInstitutions.values()) {
      const institutionNames = [
        institution.name.sr,
        institution.name['sr-Latn'],
        institution.name.en
      ].filter(Boolean).map(n => n?.toLowerCase());

      if (institutionNames.some(instName => instName && instName.includes(searchName))) {
        return institution;
      }
    }

    return undefined;
  }

  private suggestThemes(title: SerbianLocalizedString | undefined, description: SerbianLocalizedString | undefined): SerbianGovernmentTheme[] {
    const text = [
      this.getStringValue(title, 'sr'),
      this.getStringValue(title, 'en'),
      this.getStringValue(description, 'sr'),
      this.getStringValue(description, 'en')
    ].join(' ').toLowerCase();

    const suggestedThemes: SerbianGovernmentTheme[] = [];

    // Simple keyword-based theme suggestion
    if (text.includes('образов') || text.includes('educat') || text.includes('школ') || text.includes('univerzit')) {
      suggestedThemes.push(this.serbianThemes.find(t => t.code === 'EDU')!);
    }
    if (text.includes('здрав') || text.includes('health') || text.includes('медицин') || text.includes('болниц')) {
      suggestedThemes.push(this.serbianThemes.find(t => t.code === 'HEALTH')!);
    }
    if (text.includes('економ') || text.includes('econ') || text.includes('финанс') || text.includes('бизнис')) {
      suggestedThemes.push(this.serbianThemes.find(t => t.code === 'ECON')!);
    }
    if (text.includes('животна') || text.includes('env') || text.includes('еколошк') || text.includes('природ')) {
      suggestedThemes.push(this.serbianThemes.find(t => t.code === 'ENV')!);
    }

    return suggestedThemes.length > 0 ? suggestedThemes : [this.serbianThemes[0]]; // Default to first theme
  }

  private recommendLicense(): OpenLicense {
    return this.serbianLicenses.get('CC-BY-4.0') || {
      identifier: 'CC-BY-4.0',
      name: { sr: 'Кријејтив комонс - Ауторство 4.0', en: 'Creative Commons Attribution 4.0' },
      url: 'https://creativecommons.org/licenses/by/4.0/',
      attributionRequired: true,
      commercialUseAllowed: true,
      derivativeWorksAllowed: true
    };
  }

  private standardizeFormats(formats: DataFormat[]): DataFormat[] {
    return formats.map(format => ({
      ...format,
      format: this.standardizeMimeType(format.format)
    }));
  }

  private standardizeMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'csv': 'text/csv',
      'json': 'application/json',
      'xml': 'application/xml',
      'pdf': 'application/pdf',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    const extension = format.toLowerCase().split('.').pop() || format.toLowerCase();
    return mimeTypes[extension] || format;
  }

  private initializeSerbianInstitutions(): Map<string, GovernmentInstitution> {
    const institutions = new Map<string, GovernmentInstitution>();

    institutions.set('RS-VLADA', {
      name: { sr: 'Влада Републике Србије', 'sr-Latn': 'Vlada Republike Srbije', en: 'Government of the Republic of Serbia' },
      identifier: 'RS-VLADA',
      type: 'ministry',
      level: 'national',
      contactInfo: {
        email: 'office@vlada.gov.rs',
        phone: '+381 11 361 9375',
        address: 'Немањина 11, Београд'
      }
    });

    institutions.set('RS-STATISTIKA', {
      name: { sr: 'Републички завод за статистику', 'sr-Latn': 'Republički zavod za statistiku', en: 'Republic Statistical Office' },
      identifier: '52555234',
      type: 'agency',
      level: 'national',
      contactInfo: {
        email: 'stat@stat.gov.rs',
        phone: '+381 11 2412 876',
        address: 'Милана Ракића 5, Београд'
      }
    });

    return institutions;
  }

  private initializeSerbianThemes(): SerbianGovernmentTheme[] {
    return [
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
      }
    ];
  }

  private initializeSerbianLicenses(): Map<string, OpenLicense> {
    const licenses = new Map<string, OpenLicense>();

    licenses.set('CC0-1.0', {
      identifier: 'CC0-1.0',
      name: { sr: 'Кријејтив комонс Нулта 1.0', en: 'Creative Commons Zero 1.0' },
      url: 'https://creativecommons.org/publicdomain/zero/1.0/',
      attributionRequired: false,
      commercialUseAllowed: true,
      derivativeWorksAllowed: true
    });

    licenses.set('CC-BY-4.0', {
      identifier: 'CC-BY-4.0',
      name: { sr: 'Кријејтив комонс - Ауторство 4.0', en: 'Creative Commons Attribution 4.0' },
      url: 'https://creativecommons.org/licenses/by/4.0/',
      attributionRequired: true,
      commercialUseAllowed: true,
      derivativeWorksAllowed: true
    });

    licenses.set('CC-BY-SA-4.0', {
      identifier: 'CC-BY-SA-4.0',
      name: { sr: 'Кријејтив комонс - Ауторство-Делити под истим условима 4.0', en: 'Creative Commons Attribution-ShareAlike 4.0' },
      url: 'https://creativecommons.org/licenses/by-sa/4.0/',
      attributionRequired: true,
      commercialUseAllowed: true,
      derivativeWorksAllowed: true
    });

    licenses.set('OGL-RS-1.0', {
      identifier: 'OGL-RS-1.0',
      name: { sr: 'Отворена владина лиценца Републике Србије 1.0', en: 'Open Government License Republic of Serbia 1.0' },
      url: 'https://data.gov.rs/licenses/ogl-rs-1.0',
      attributionRequired: true,
      commercialUseAllowed: true,
      derivativeWorksAllowed: true
    });

    return licenses;
  }
}