/**
 * Serbian formatting utilities
 * Алатке за српско форматирање
 */

import { format, parseISO, isValid } from 'date-fns';
import { sr, srLatn } from 'date-fns/locale';
import type { SerbianScript, SerbianNumberFormat, SerbianDateFormat } from '../types/serbian';

// Serbian locale configurations
const SERBIAN_LOCALES = {
  cyrillic: sr,
  latin: srLatn
};

// Serbian date format patterns
const SERBIAN_DATE_FORMATS = {
  cyrillic: {
    short: 'dd.MM.yyyy.',
    medium: 'd. MMMM yyyy.',
    long: 'd. MMMM yyyy. године',
    full: 'EEEE, d. MMMM yyyy. године',
    time: 'HH:mm',
    datetime: 'dd.MM.yyyy. HH:mm'
  },
  latin: {
    short: 'dd.MM.yyyy.',
    medium: 'd. MMMM yyyy.',
    long: 'd. MMMM yyyy. godine',
    full: 'EEEE, d. MMMM yyyy. godine',
    time: 'HH:mm',
    datetime: 'dd.MM.yyyy. HH:mm'
  }
};

// Serbian number formatting options
const SERBIAN_NUMBER_OPTIONS = {
  cyrillic: {
    decimal: ',',
    thousands: '.',
    currency: 'RSD',
    currencySymbol: 'дин.'
  },
  latin: {
    decimal: ',',
    thousands: '.',
    currency: 'RSD',
    currencySymbol: 'din.'
  }
};

// Serbian months in Cyrillic
export const SERBIAN_MONTHS_CYRILLIC = [
  'јануар', 'фебруар', 'март', 'април', 'мај', 'јун',
  'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'
];

// Serbian months in Latin
export const SERBIAN_MONTHS_LATIN = [
  'januar', 'februar', 'mart', 'april', 'maj', 'jun',
  'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
];

// Serbian days of the week in Cyrillic
export const SERBIAN_DAYS_CYRILLIC = [
  'недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'
];

// Serbian days of the week in Latin
export const SERBIAN_DAYS_LATIN = [
  'nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'
];

/**
 * Format Serbian date
 */
export function formatSerbianDate(
  date: Date | string,
  formatType: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime' = 'medium',
  script: SerbianScript = 'cyrillic'
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return 'Неважећи датум';
    }

    const locale = SERBIAN_LOCALES[script];
    const formatString = SERBIAN_DATE_FORMATS[script][formatType];

    return format(dateObj, formatString, { locale });
  } catch (error) {
    return script === 'cyrillic' ? 'Грешка у формату датума' : 'Greška u formatu datuma';
  }
}

/**
 * Get complete Serbian date formatting with all variants
 */
export function getSerbianDateFormat(date: Date | string, script: SerbianScript = 'cyrillic'): SerbianDateFormat {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return {
      date: dateObj,
      formatted: {
        short: script === 'cyrillic' ? 'Неважећи датум' : 'Nevažeći datum',
        medium: script === 'cyrillic' ? 'Неважећи датум' : 'Nevažeći datum',
        long: script === 'cyrillic' ? 'Неважећи датум' : 'Nevažeći datum',
        full: script === 'cyrillic' ? 'Неважећи датум' : 'Nevažeći datum'
      },
      script
    };
  }

  return {
    date: dateObj,
    formatted: {
      short: formatSerbianDate(dateObj, 'short', script),
      medium: formatSerbianDate(dateObj, 'medium', script),
      long: formatSerbianDate(dateObj, 'long', script),
      full: formatSerbianDate(dateObj, 'full', script)
    },
    script
  };
}

/**
 * Format Serbian number
 */
export function formatSerbianNumber(
  value: number,
  options: {
    decimals?: number;
    useThousands?: boolean;
    currency?: boolean;
    script?: SerbianScript;
  } = {}
): string {
  const {
    decimals = 2,
    useThousands = true,
    currency = false,
    script = 'cyrillic'
  } = options;

  const { decimal, thousands, currencySymbol } = SERBIAN_NUMBER_OPTIONS[script];

  // Format the number
  let formatted = value.toFixed(decimals);

  // Replace decimal separator
  formatted = formatted.replace('.', decimal);

  // Add thousands separator
  if (useThousands) {
    const parts = formatted.split(decimal);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
    formatted = parts.join(decimal);
  }

  // Add currency if requested
  if (currency) {
    formatted = `${formatted} ${currencySymbol}`;
  }

  return formatted;
}

/**
 * Get complete Serbian number format
 */
export function getSerbianNumberFormat(
  value: number,
  currency: 'RSD' | 'EUR' | 'USD' = 'RSD',
  script: SerbianScript = 'cyrillic'
): SerbianNumberFormat {
  const currencySymbols = {
    cyrillic: { RSD: 'дин.', EUR: '€', USD: '$' },
    latin: { RSD: 'din.', EUR: '€', USD: '$' }
  };

  const formatted = formatSerbianNumber(value, {
    currency: true,
    script
  });

  // Replace the currency symbol with the requested one
  const correctSymbol = currencySymbols[script][currency];
  const finalFormatted = formatted.replace(/дин\.|din\./g, correctSymbol);

  return {
    value,
    formatted: finalFormatted,
    currency,
    locale: script === 'cyrillic' ? 'sr' : 'sr-Latn'
  };
}

/**
 * Format Serbian phone number
 */
export function formatSerbianPhoneNumber(phone: string): {
  formatted: string;
  isValid: boolean;
  type: 'mobile' | 'landline' | 'invalid';
} {
  if (!phone) {
    return { formatted: '', isValid: false, type: 'invalid' };
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check if it's a valid Serbian number
  if (!digits.startsWith('381') && !digits.startsWith('0')) {
    return { formatted: phone, isValid: false, type: 'invalid' };
  }

  // Normalize to international format
  let normalized = digits;
  if (digits.startsWith('0')) {
    normalized = '381' + digits.substring(1);
  }

  // Determine if mobile or landline
  const isMobile = normalized.startsWith('3816') || normalized.startsWith('38160') ||
                   normalized.startsWith('38161') || normalized.startsWith('38162') ||
                   normalized.startsWith('38163') || normalized.startsWith('38164') ||
                   normalized.startsWith('38165') || normalized.startsWith('38166') ||
                   normalized.startsWith('38167') || normalized.startsWith('38168') ||
                   normalized.startsWith('38169');

  const type = isMobile ? 'mobile' : 'landline';

  // Format the number
  let formatted: string;
  if (normalized.length === 12) {
    formatted = `+${normalized.substring(0, 3)} ${normalized.substring(3, 5)} ${normalized.substring(5, 8)} ${normalized.substring(8)}`;
  } else {
    formatted = phone; // Return original if formatting fails
  }

  return {
    formatted,
    isValid: true,
    type
  };
}

/**
 * Format Serbian address
 */
export function formatSerbianAddress(
  street: string,
  number: string,
  municipality?: string,
  postalCode?: string,
  script: SerbianScript = 'cyrillic'
): string {
  const parts: string[] = [];

  // Street and number
  if (street && number) {
    parts.push(`${street} ${number}`);
  } else if (street) {
    parts.push(street);
  }

  // Municipality and postal code
  if (municipality && postalCode) {
    parts.push(`${postalCode} ${municipality}`);
  } else if (municipality) {
    parts.push(municipality);
  } else if (postalCode) {
    parts.push(postalCode);
  }

  return parts.join(', ');
}

/**
 * Format Serbian JMBG (Unique Master Citizen Number)
 */
export function formatSerbianJMBG(jmbg: string): {
  formatted: string;
  isValid: boolean;
  birthDate?: Date;
  gender?: 'male' | 'female';
  region?: string;
} {
  if (!jmbg) {
    return { formatted: '', isValid: false };
  }

  // Remove all non-digit characters
  const digits = jmbg.replace(/\D/g, '');

  if (digits.length !== 13) {
    return { formatted: jmbg, isValid: false };
  }

  // Extract date components
  const day = parseInt(digits.substring(0, 2));
  const month = parseInt(digits.substring(2, 4));
  let year = parseInt(digits.substring(4, 7));

  // Determine century based on the 9th digit (political region)
  const regionDigit = parseInt(digits.substring(7, 9));

  if (regionDigit >= 0 && regionDigit <= 9) {
    // Born before 2000
    if (year <= 99) {
      year += 1900;
    } else if (year <= 999) {
      year += 1000;
    }
  } else {
    // Born after 2000
    year += 2000;
  }

  // Validate date
  const birthDate = new Date(year, month - 1, day);
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return { formatted: jmbg, isValid: false };
  }

  // Validate checksum
  const weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let checksum = 0;
  for (let i = 0; i < 12; i++) {
    checksum += parseInt(digits[i]) * weights[i];
  }
  const remainder = checksum % 11;
  const controlDigit = (11 - remainder) % 10;

  if (controlDigit !== parseInt(digits[12])) {
    return { formatted: jmbg, isValid: false };
  }

  // Format as XX.XX.XXXXX-XXX
  const formatted = `${digits.substring(0, 2)}.${digits.substring(2, 4)}.${digits.substring(4, 9)}-${digits.substring(9)}`;

  // Extract gender from 12th digit (odd = male, even = female)
  const genderDigit = parseInt(digits.substring(11, 12));
  const gender = genderDigit % 2 === 1 ? 'male' : 'female';

  // Get region from 8th and 9th digits
  const regions: Record<string, string> = {
    '71': 'Београд',
    '72': 'Шумадија и Западна Србија',
    '73': 'Ниш',
    '74': 'Јужна Србија',
    '75': 'Зрењанин',
    '76': 'Суботица',
    '77': 'Крагујевац',
    '78': 'Нови Сад',
    '79': 'Подунавски',
    '80': 'Подриње и Колубара',
    '81': 'Краљево',
    '82': 'Ужице',
    '83': 'Врање',
    '84': 'Зајечар',
    '85': 'Пожаревац',
    '86': 'Сомбор',
    '87': 'Краљево',
    '88': 'Панчево',
    '89': 'Крушевац',
    '90': 'Лесковац',
    '91': 'Врање',
    '92': 'Сремска Митровица',
    '93': 'Суботица',
    '94': 'Бор',
    '95': 'Приштина',
    '96': 'Косовска Митровица'
  };

  const regionCode = digits.substring(7, 9);
  const region = regions[regionCode];

  return {
    formatted,
    isValid: true,
    birthDate,
    gender,
    region
  };
}

/**
 * Format Serbian PIB (Tax Identification Number)
 */
export function formatSerbianPIB(pib: string): {
  formatted: string;
  isValid: boolean;
} {
  if (!pib) {
    return { formatted: '', isValid: false };
  }

  // Remove all non-digit characters
  const digits = pib.replace(/\D/g, '');

  if (digits.length !== 9) {
    return { formatted: pib, isValid: false };
  }

  // Validate PIB using mod 11 algorithm
  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }

  const remainder = sum % 11;
  const controlDigit = remainder === 0 ? 0 : 11 - remainder;

  if (controlDigit !== parseInt(digits[8])) {
    return { formatted: pib, isValid: false };
  }

  // Format as XXX-XXXXXX
  const formatted = `${digits.substring(0, 3)}-${digits.substring(3)}`;

  return {
    formatted,
    isValid: true
  };
}

/**
 * Get Serbian percentage format
 */
export function formatSerbianPercentage(
  value: number,
  decimals: number = 1,
  script: SerbianScript = 'cyrillic'
): string {
  const symbol = script === 'cyrillic' ? '%' : '%';
  return `${formatSerbianNumber(value, { decimals, script })}${symbol}`;
}

/**
 * Format file size in Serbian
 */
export function formatSerbianFileSize(bytes: number, script: SerbianScript = 'cyrillic'): string {
  const units = script === 'cyrillic'
    ? ['B', 'KB', 'MB', 'GB', 'TB']
    : ['B', 'KB', 'MB', 'GB', 'TB'];

  if (bytes === 0) return `0 ${units[0]}`;

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${units[i]}`;
}