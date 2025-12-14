/**
 * Utility functions for price data processing and formatting
 */

import { PriceData, PriceTrend, DiscountData, PriceHeatmapData, LocaleConfig, CurrencyRate } from './types';

// Currency conversion rates (example - should be fetched from API)
const CURRENCY_RATES: Record<string, CurrencyRate> = {
  'RSD_TO_EUR': { from: 'RSD', to: 'EUR', rate: 0.0085, date: new Date().toISOString() },
  'EUR_TO_RSD': { from: 'EUR', to: 'RSD', rate: 117.6, date: new Date().toISOString() },
};

// Serbian number and currency formatting
export const SERBIAN_LOCALE: LocaleConfig = {
  language: 'sr',
  currency: 'RSD',
  dateFormat: 'dd.MM.yyyy',
  numberFormat: {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  useCyrillic: false,
};

export const SERBIAN_LOCALE_CYRILLIC: LocaleConfig = {
  ...SERBIAN_LOCALE,
  useCyrillic: true,
};

export const ENGLISH_LOCALE: LocaleConfig = {
  language: 'en',
  currency: 'EUR',
  dateFormat: 'MM/dd/yyyy',
  numberFormat: {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  useCyrillic: false,
};

/**
 * Format currency according to locale settings
 */
export const formatCurrency = (
  amount: number,
  currency: 'RSD' | 'EUR',
  locale: LocaleConfig = SERBIAN_LOCALE
): string => {
  try {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'EUR' ? 2 : 0,
      maximumFractionDigits: currency === 'EUR' ? 2 : 0,
    };

    if (locale.language === 'sr') {
      return new Intl.NumberFormat('sr-RS', options).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', options).format(amount);
    }
  } catch (error) {
    // Fallback formatting
    return `${amount.toFixed(currency === 'EUR' ? 2 : 0)} ${currency}`;
  }
};

/**
 * Convert currency amount
 */
export const convertCurrency = (
  amount: number,
  from: 'RSD' | 'EUR',
  to: 'RSD' | 'EUR'
): number => {
  if (from === to) return amount;

  const rateKey = `${from}_TO_${to}`.toUpperCase();
  const rate = CURRENCY_RATES[rateKey]?.rate || 1;
  return amount * rate;
};

/**
 * Format date according to locale settings
 */
export const formatDate = (
  date: string | Date,
  locale: LocaleConfig = SERBIAN_LOCALE
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (locale.language === 'sr') {
    return new Intl.DateTimeFormat('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  }
};

/**
 * Translate or transliterate text based on locale
 */
export const localizeText = (
  text: string,
  serbianText?: string,
  locale: LocaleConfig = SERBIAN_LOCALE
): string => {
  if (locale.language === 'sr' && serbianText) {
    if (locale.useCyrillic) {
      // Simple transliteration to Cyrillic (basic implementation)
      return latinToCyrillic(serbianText);
    }
    return serbianText;
  }
  return text;
};

/**
 * Basic Latin to Cyrillic transliteration
 */
export const latinToCyrillic = (text: string): string => {
  const transliterationMap: Record<string, string> = {
    'A': 'А', 'B': 'Б', 'C': 'Ц', 'Č': 'Ч', 'Ć': 'Ћ', 'D': 'Д',
    'Đ': 'Ђ', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х', 'I': 'И',
    'J': 'Ј', 'K': 'К', 'L': 'Л', 'LJ': 'Љ', 'M': 'М', 'N': 'Н',
    'NJ': 'Њ', 'O': 'О', 'P': 'П', 'R': 'Р', 'S': 'С', 'Š': 'Ш',
    'T': 'Т', 'U': 'У', 'V': 'В', 'Z': 'З', 'Ž': 'Ж',
    'a': 'а', 'b': 'б', 'c': 'ц', 'č': 'ч', 'ć': 'ћ', 'd': 'д',
    'đ': 'ђ', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и',
    'j': 'ј', 'k': 'к', 'l': 'л', 'lj': 'љ', 'm': 'м', 'n': 'н',
    'nj': 'њ', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 'š': 'ш',
    't': 'т', 'u': 'у', 'v': 'в', 'z': 'з', 'ž': 'ж'
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    // Check for two-character combinations first
    const twoChar = text.substring(i, i + 2).toLowerCase();
    const oneChar = text[i];

    if (transliterationMap[twoChar] && text[i + 1] === text[i + 1].toLowerCase()) {
      result += transliterationMap[twoChar];
      i += 1;
    } else if (transliterationMap[oneChar]) {
      result += transliterationMap[oneChar];
    } else {
      result += oneChar;
    }
  }
  return result;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (
  originalPrice: number,
  currentPrice: number
): number => {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Group price data by category
 */
export const groupByCategory = (data: PriceData[]): Record<string, PriceData[]> => {
  return data.reduce((groups, item) => {
    const category = item.categorySr || item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, PriceData[]>);
};

/**
 * Group price data by retailer
 */
export const groupByRetailer = (data: PriceData[]): Record<string, PriceData[]> => {
  return data.reduce((groups, item) => {
    const retailer = item.retailerName || item.retailer;
    if (!groups[retailer]) {
      groups[retailer] = [];
    }
    groups[retailer].push(item);
    return groups;
  }, {} as Record<string, PriceData[]>);
};

/**
 * Calculate average price from data array
 */
export const calculateAveragePrice = (
  data: PriceData[],
  targetCurrency?: 'RSD' | 'EUR'
): number => {
  if (data.length === 0) return 0;

  const sum = data.reduce((total, item) => {
    let price = item.price;
    if (targetCurrency && item.currency !== targetCurrency) {
      price = convertCurrency(price, item.currency, targetCurrency);
    }
    return total + price;
  }, 0);

  return sum / data.length;
};

/**
 * Find minimum and maximum prices
 */
export const getPriceRange = (
  data: PriceData[],
  targetCurrency?: 'RSD' | 'EUR'
): { min: number; max: number } => {
  if (data.length === 0) return { min: 0, max: 0 };

  const convertedPrices = data.map(item => {
    if (targetCurrency && item.currency !== targetCurrency) {
      return convertCurrency(item.price, item.currency, targetCurrency);
    }
    return item.price;
  });

  return {
    min: Math.min(...convertedPrices),
    max: Math.max(...convertedPrices),
  };
};

/**
 * Generate color palette for charts
 */
export const generateColorPalette = (count: number): string[] => {
  const baseColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6366f1', // indigo
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  locale: LocaleConfig = SERBIAN_LOCALE
): string => {
  const options: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  };

  const decimalValue = value / 100;
  if (locale.language === 'sr') {
    return new Intl.NumberFormat('sr-RS', options).format(decimalValue);
  } else {
    return new Intl.NumberFormat('en-US', options).format(decimalValue);
  }
};

/**
 * Process price trend data for charts
 */
export const processPriceTrendData = (
  trends: PriceTrend[],
  locale: LocaleConfig = SERBIAN_LOCALE
) => {
  return trends.map(trend => ({
    id: trend.productId,
    name: localizeText(trend.productName, trend.productNameSr, locale),
    retailer: trend.retailerName,
    data: trend.dataPoints.map(point => ({
      date: formatDate(point.date, locale),
      price: point.price,
      currency: point.currency,
      formattedPrice: formatCurrency(point.price, point.currency, locale),
    })),
  }));
};

/**
 * Filter data based on search query
 */
export const filterDataBySearch = (
  data: PriceData[],
  searchQuery: string
): PriceData[] => {
  if (!searchQuery || searchQuery.trim() === '') return data;

  const query = searchQuery.toLowerCase();

  return data.filter(item =>
    item.productName.toLowerCase().includes(query) ||
    item.productNameSr?.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.categorySr?.toLowerCase().includes(query) ||
    item.brand?.toLowerCase().includes(query) ||
    item.retailerName?.toLowerCase().includes(query)
  );
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      // Handle values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  const csvContent = [csvHeaders, ...csvRows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Create safe class name for CSS
 */
export const createSafeClassName = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Debounce function for search and filter inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};