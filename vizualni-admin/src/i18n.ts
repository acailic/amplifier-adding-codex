/**
 * Serbian Internationalization Setup
 * Поставке српске интернационализације
 */

import { i18n } from '@lingui/core';
import { en, sr, srLatn } from 'make-plural/plurals';

// Import locale data
import srMessages from '../locales/sr/messages.po';
import srLatnMessages from '../locales/sr-Latn/messages.po';
import enMessages from '../locales/en/messages.po';

// Define plural rules for Serbian (Cyrillic and Latin)
const pluralRules = {
  'sr': sr,
  'sr-Latn': srLatn,
  'en': en,
};

// Initialize i18n with Serbian as default locale
i18n.load({
  'sr': srMessages,
  'sr-Latn': srLatnMessages,
  'en': enMessages,
}, pluralRules);

// Set default locale to Serbian Cyrillic
i18n.activate('sr');

/**
 * Load and activate a locale
 */
export async function loadAndActivateLocale(locale: 'sr' | 'sr-Latn' | 'en'): Promise<void> {
  try {
    // In a real application, you might load translations from a server
    // For now, we're using the imported messages

    // Load locale-specific data if needed
    if (locale === 'sr' || locale === 'sr-Latn') {
      // Load Serbian-specific number/date formatters
      await loadSerbianLocaleData(locale);
    }

    // Activate the locale
    i18n.activate(locale);

    // Update document direction and language
    updateDocumentAttributes(locale);

    // Store preference in localStorage
    localStorage.setItem('preferred-locale', locale);

  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error);
    // Fallback to Serbian Cyrillic
    i18n.activate('sr');
  }
}

/**
 * Load Serbian-specific locale data
 */
async function loadSerbianLocaleData(locale: 'sr' | 'sr-Latn'): Promise<void> {
  // This could load additional locale-specific data
  // such as number formats, date formats, etc.

  // Set locale-specific configurations
  if (locale === 'sr') {
    // Configure for Serbian Cyrillic
    document.documentElement.lang = 'sr';
    document.documentElement.dir = 'ltr';
  } else if (locale === 'sr-Latn') {
    // Configure for Serbian Latin
    document.documentElement.lang = 'sr-Latn';
    document.documentElement.dir = 'ltr';
  }
}

/**
 * Update document attributes for accessibility
 */
function updateDocumentAttributes(locale: string): void {
  // Set language attribute
  document.documentElement.lang = locale;

  // Set direction (Serbian uses left-to-right)
  document.documentElement.dir = 'ltr';

  // Add locale class for CSS targeting
  document.documentElement.className = document.documentElement.className
    .replace(/locale-\w+/g, '')
    + ` locale-${locale}`;
}

/**
 * Get the current locale
 */
export function getCurrentLocale(): string {
  return i18n.locale;
}

/**
 * Check if current locale is Serbian (Cyrillic or Latin)
 */
export function isSerbianLocale(): boolean {
  const locale = i18n.locale;
  return locale === 'sr' || locale === 'sr-Latn';
}

/**
 * Get script for current locale
 */
export function getCurrentScript(): 'cyrillic' | 'latin' {
  return i18n.locale === 'sr-Latn' ? 'latin' : 'cyrillic';
}

/**
 * Get display name for locale
 */
export function getLocaleDisplayName(locale: string, displayLocale?: string): string {
  const names = {
    'sr': 'Српски (ћирилица)',
    'sr-Latn': 'Srpski (latinica)',
    'en': 'English'
  };

  return names[locale as keyof typeof names] || locale;
}

/**
 * Initialize i18n from stored preferences or browser settings
 */
export function initializeI18n(): void {
  // Try to get saved preference
  const savedLocale = localStorage.getItem('preferred-locale');

  if (savedLocale && ['sr', 'sr-Latn', 'en'].includes(savedLocale)) {
    i18n.activate(savedLocale);
    updateDocumentAttributes(savedLocale);
    return;
  }

  // Detect browser language
  const browserLanguage = navigator.language;

  if (browserLanguage.startsWith('sr')) {
    // Check if user prefers Latin or Cyrillic
    if (browserLanguage.includes('Latn')) {
      i18n.activate('sr-Latn');
    } else {
      i18n.activate('sr');
    }
  } else if (browserLanguage.startsWith('en')) {
    i18n.activate('en');
  } else {
    // Default to Serbian Cyrillic
    i18n.activate('sr');
  }

  updateDocumentAttributes(i18n.locale);
}

/**
 * Format number according to Serbian locale rules
 */
export function formatSerbianNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
  const locale = i18n.locale === 'sr' ? 'sr-RS' : (i18n.locale === 'sr-Latn' ? 'sr-Latn-RS' : 'en-US');

  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  }).format(value);
}

/**
 * Format currency according to Serbian locale
 */
export function formatSerbianCurrency(
  value: number,
  currency: 'RSD' | 'EUR' | 'USD' = 'RSD'
): string {
  const locale = i18n.locale === 'sr' ? 'sr-RS' : (i18n.locale === 'sr-Latn' ? 'sr-Latn-RS' : 'en-US');

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'RSD' ? 0 : 2,
    maximumFractionDigits: currency === 'RSD' ? 0 : 2
  }).format(value);
}

/**
 * Format date according to Serbian locale
 */
export function formatSerbianDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const locale = i18n.locale === 'sr' ? 'sr-RS' : (i18n.locale === 'sr-Latn' ? 'sr-Latn-RS' : 'en-US');

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(dateObj);
}

/**
 * Get Serbian date formats for different uses
 */
export function getSerbianDateFormats() {
  const isLatin = i18n.locale === 'sr-Latn';

  return {
    short: 'dd.MM.yyyy.',
    medium: isLatin ? 'd. MMMM yyyy.' : 'd. MMMM yyyy. године',
    long: isLatin ? 'd. MMMM yyyy. godine' : 'd. MMMM yyyy. године',
    full: isLatin ? 'EEEE, d. MMMM yyyy. godine' : 'EEEE, d. MMMM yyyy. године',
    time: 'HH:mm',
    datetime: 'dd.MM.yyyy. HH:mm'
  };
}

// Export i18n instance
export { i18n };