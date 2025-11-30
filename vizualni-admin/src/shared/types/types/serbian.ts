/**
 * Serbian language and culture specific types
 * Типови за српски језик и културу
 */

export type SerbianScript = 'cyrillic' | 'latin' | 'mixed' | 'none';

export interface SerbianTextVariant {
  cyrillic: string;
  latin: string;
}

export interface SerbianFormattingOptions {
  script: SerbianScript;
  locale: 'sr' | 'sr-Latn';
  useSerbianCurrency: boolean;
  useSerbianDateFormats: boolean;
  useSerbianTimezone: boolean;
}

export interface SerbianValidationResult {
  script_detected: SerbianScript | null;
  script_consistency: number; // 0.0-1.0
  has_serbian_chars: boolean;
  place_names_found: string[];
  valid_municipalities: string[];
  invalid_municipalities: string[];
  jmbg_valid: boolean;
  pib_valid: boolean;
  address_format_score: number; // 0.0-1.0
  serbian_language_confidence: number; // 0.0-1.0
}

export interface SerbianNumberFormat {
  value: number;
  formatted: string;
  currency: 'RSD' | 'EUR' | 'USD';
  locale: 'sr' | 'sr-Latn';
}

export interface SerbianDateFormat {
  date: Date;
  formatted: {
    short: string; // 01.01.2024.
    medium: string; // 1. јануар 2024.
    long: string; // 1. јануар 2024. године
    full: string; // понедељак, 1. јануар 2024. године
  };
  script: SerbianScript;
}

export interface SerbianTypographyConfig {
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
    display: string;
  };
  fontFeatures: {
    ligatures: boolean;
    kerning: boolean;
    contextual: boolean;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
}

export interface SerbianKeyboardLayout {
  type: 'cyrillic' | 'latin';
  name: string;
  keys: {
    [key: string]: string; // Mapping of key to character
  };
}

export interface SerbianGovernmentInstitution {
  id: string;
  name: {
    cyrillic: string;
    latin: string;
  };
  acronym: string;
  type: 'ministry' | 'agency' | 'court' | 'bank' | 'municipality' | 'other';
  region?: string;
}

export interface SerbianMunicipality {
  id: string;
  name: {
    cyrillic: string;
    latin: string;
  };
  district: string;
  region: string;
  postalCode: string;
}

export interface SerbianFormData {
  jmbg?: string;
  pib?: string;
  address?: string;
  municipality?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
}

export interface SerbianLocaleData {
  code: string;
  name: string;
  nativeName: string;
  script: SerbianScript;
  rtl: boolean;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    precision: number;
  };
}

export interface SerbianSpellCheckResult {
  word: string;
  suggestions: string[];
  isCorrect: boolean;
  context: string;
}

export interface SerbianAutoCompleteOptions {
  maxSuggestions: number;
  caseSensitive: boolean;
  includePlaceNames: boolean;
  includeInstitutions: boolean;
  scriptAware: boolean;
}

export interface SerbianTranslation {
  id: string;
  key: string;
  cyrillic: string;
  latin: string;
  context?: string;
  plural?: boolean;
  variables?: string[];
}

export interface SerbianChartConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    danger: string;
    warning: string;
    success: string;
    info: string;
  };
  fonts: {
    family: string;
    size: number;
    weight: string;
  };
  legends: {
    position: 'top' | 'bottom' | 'left' | 'right';
    labels: {
      font: {
        family: string;
        size: number;
      };
      padding: number;
    };
  };
  tooltips: {
    enabled: boolean;
    mode: 'index' | 'dataset' | 'point' | 'nearest';
    intersect: boolean;
  };
}