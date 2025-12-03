import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function for merging CSS classes
 *
 * This combines clsx with Tailwind's class merging capabilities.
 * It's optimized for performance and handles conditional classes efficiently.
 *
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Utility function for formatting Serbian numbers
 * @param value - Number to format
 * @param locale - Locale to use (defaults to sr-RS)
 * @returns Formatted number string
 */
export function formatSerbianNumber(value: number, locale: string = 'sr-RS'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Utility function for formatting Serbian currency
 * @param value - Number to format
 * @param currency - Currency code (defaults to RSD)
 * @returns Formatted currency string
 */
export function formatSerbianCurrency(value: number, currency: string = 'RSD'): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Utility function for formatting Serbian dates
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatSerbianDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
): string {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('sr-RS', options).format(dateObj);
}

/**
 * Utility function for debouncing function calls
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Utility function for throttling function calls
 * @param func - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Utility function for checking if a color is light or dark
 * @param hexColor - Hex color code
 * @returns True if color is light, false if dark
 */
export function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

/**
 * Utility function for generating contrast ratios for WCAG compliance
 * @param foreground - Foreground color
 * @param background - Background color
 * @returns Contrast ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Utility function for validating WCAG compliance
 * @param foreground - Foreground color
 * @param background - Background color
 * @param level - WCAG level ('AA' | 'AAA')
 * @param size - Text size ('normal' | 'large')
 * @returns WCAG compliance object
 */
export function checkWCAGCompliance(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passes: boolean;
} {
  const ratio = getContrastRatio(foreground, background);

  const thresholds = {
    AA: size === 'large' ? 3.0 : 4.5,
    AAA: size === 'large' ? 4.5 : 7.0,
  };

  const passesAA = ratio >= thresholds.AA;
  const passesAAA = ratio >= thresholds.AAA;
  const passes = level === 'AA' ? passesAA : passesAAA;

  return {
    ratio,
    passesAA,
    passesAAA,
    passes,
  };
}