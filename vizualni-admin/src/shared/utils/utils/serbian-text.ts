/**
 * Serbian text processing utilities
 * Алатке за обраду српског текста
 */

import type { SerbianScript, SerbianTextVariant } from '../types/serbian';

// Serbian character sets
export const CYRILLIC_CHARS = 'АБВГДЂЕЖЗИЈКЛЉМНЊОПРСТЋУФХЦЧЏШабвгдђежзијкљмњопрстћуфхцчџш';
export const LATIN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const SERBIAN_LATIN_CHARS = 'ČĆŽŠĐčćžšđ';

// Character mapping for Cyrillic to Latin transliteration
export const CYRILLIC_TO_LATIN: Record<string, string> = {
  'А': 'A', 'а': 'a',
  'Б': 'B', 'б': 'b',
  'В': 'V', 'в': 'v',
  'Г': 'G', 'г': 'g',
  'Д': 'D', 'д': 'd',
  'Ђ': 'Đ', 'ђ': 'đ',
  'Е': 'E', 'е': 'e',
  'Ж': 'Ž', 'ж': 'ž',
  'З': 'Z', 'з': 'z',
  'И': 'I', 'и': 'i',
  'Ј': 'J', 'ј': 'j',
  'К': 'K', 'к': 'k',
  'Л': 'L', 'л': 'l',
  'Љ': 'Lj', 'љ': 'lj',
  'М': 'M', 'м': 'm',
  'Н': 'N', 'н': 'n',
  'Њ': 'Nj', 'њ': 'nj',
  'О': 'O', 'о': 'o',
  'П': 'P', 'п': 'p',
  'Р': 'R', 'р': 'r',
  'С': 'S', 'с': 's',
  'Т': 'T', 'т': 't',
  'Ћ': 'Ć', 'ћ': 'ć',
  'У': 'U', 'у': 'u',
  'Ф': 'F', 'ф': 'f',
  'Х': 'H', 'х': 'h',
  'Ц': 'C', 'ц': 'c',
  'Ч': 'Č', 'ч': 'č',
  'Џ': 'Dž', 'џ': 'dž',
  'Ш': 'Š', 'ш': 'š'
};

// Character mapping for Latin to Cyrillic transliteration
export const LATIN_TO_CYRILLIC: Record<string, string> = {
  'A': 'А', 'a': 'а',
  'B': 'Б', 'b': 'б',
  'V': 'В', 'v': 'в',
  'G': 'Г', 'g': 'г',
  'D': 'Д', 'd': 'д',
  'Đ': 'Ђ', 'đ': 'ђ',
  'E': 'Е', 'e': 'е',
  'Ž': 'Ж', 'ž': 'ж',
  'Z': 'З', 'z': 'з',
  'I': 'И', 'i': 'и',
  'J': 'Ј', 'j': 'ј',
  'K': 'К', 'k': 'к',
  'L': 'Л', 'l': 'л',
  'Lj': 'Љ', 'LJ': 'Љ', 'lj': 'љ',
  'M': 'М', 'm': 'м',
  'N': 'Н', 'n': 'н',
  'Nj': 'Њ', 'NJ': 'Њ', 'nj': 'њ',
  'O': 'О', 'o': 'о',
  'P': 'П', 'p': 'п',
  'R': 'Р', 'r': 'р',
  'S': 'С', 's': 'с',
  'T': 'Т', 't': 'т',
  'Ć': 'Ћ', 'ć': 'ћ',
  'U': 'У', 'u': 'у',
  'F': 'Ф', 'f': 'ф',
  'H': 'Х', 'h': 'х',
  'C': 'Ц', 'c': 'ц',
  'Č': 'Ч', 'č': 'ч',
  'Dž': 'Џ', 'DŽ': 'Џ', 'dž': 'џ',
  'Š': 'Ш', 'š': 'ш'
};

/**
 * Detect script in Serbian text
 */
export function detectScript(text: string): SerbianScript {
  if (!text || typeof text !== 'string') {
    return 'none';
  }

  const hasCyrillic = /[А-Ша-шЂђЈјКкЉљЊњЋћЏџ]/.test(text);
  const hasLatin = /[A-Za-zČĆŽŠĐčćžšđ]/.test(text);
  const hasSerbianLatin = /[ČĆŽŠĐčćžšđ]/.test(text);

  if (hasCyrillic && hasLatin) {
    // Check if it's proper Serbian Latin script
    if (hasSerbianLatin) {
      return 'mixed';
    }
    return 'mixed'; // Mixed with non-Serbian Latin
  } else if (hasCyrillic) {
    return 'cyrillic';
  } else if (hasLatin) {
    return hasSerbianLatin ? 'latin' : 'none';
  }

  return 'none';
}

/**
 * Transliterate Cyrillic to Latin
 */
export function cyrillicToLatin(text: string): string {
  if (!text) return text;

  let result = '';
  let i = 0;

  while (i < text.length) {
    // Check for digraphs first (Lj, Nj, Dž)
    const twoChar = text.substr(i, 2);

    if (CYRILLIC_TO_LATIN[twoChar]) {
      result += CYRILLIC_TO_LATIN[twoChar];
      i += 2;
    } else if (CYRILLIC_TO_LATIN[text[i]]) {
      result += CYRILLIC_TO_LATIN[text[i]];
      i += 1;
    } else {
      result += text[i];
      i += 1;
    }
  }

  return result;
}

/**
 * Transliterate Latin to Cyrillic
 */
export function latinToCyrillic(text: string): string {
  if (!text) return text;

  let result = '';
  let i = 0;

  while (i < text.length) {
    // Check for digraphs first (Lj, Nj, Dž)
    const twoChar = text.substr(i, 2).toUpperCase();
    const originalTwo = text.substr(i, 2);

    if (LATIN_TO_CYRILLIC[originalTwo]) {
      result += LATIN_TO_CYRILLIC[originalTwo];
      i += 2;
    } else if (LATIN_TO_CYRILLIC[twoChar]) {
      result += LATIN_TO_CYRILLIC[twoChar];
      i += 2;
    } else if (LATIN_TO_CYRILLIC[text[i]]) {
      result += LATIN_TO_CYRILLIC[text[i]];
      i += 1;
    } else {
      result += text[i];
      i += 1;
    }
  }

  return result;
}

/**
 * Convert between scripts
 */
export function convertScript(text: string, targetScript: 'cyrillic' | 'latin'): string {
  if (!text) return text;

  const currentScript = detectScript(text);

  if (currentScript === targetScript || currentScript === 'none') {
    return text;
  }

  if (targetScript === 'latin') {
    return cyrillicToLatin(text);
  } else {
    return latinToCyrillic(text);
  }
}

/**
 * Get both script variants
 */
export function getBothScriptVariants(text: string): SerbianTextVariant {
  return {
    cyrillic: convertScript(text, 'cyrillic'),
    latin: convertScript(text, 'latin')
  };
}

/**
 * Normalize Serbian text (remove extra spaces, fix case, etc.)
 */
export function normalizeSerbianText(text: string): string {
  if (!text) return text;

  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(['".,;:!?()\[\]{}])/g, ' $1 ') // Add spaces around punctuation
    .replace(/\s+/g, ' ')
    .replace(/\s+(['".,;:!?()\[\]{}])/g, '$1') // Remove extra spaces around punctuation
    .trim();
}

/**
 * Capitalize Serbian text (handles digraphs properly)
 */
export function capitalizeSerbian(text: string): string {
  if (!text) return text;

  const words = text.split(' ');
  const capitalizedWords = words.map(word => {
    if (!word) return word;

    // Handle digraphs at the beginning
    const firstTwo = word.substr(0, 2).toLowerCase();
    const firstTwoUpper = word.substr(0, 2).toUpperCase();

    if (['lj', 'nj', 'dž'].includes(firstTwo)) {
      return firstTwoUpper + word.substr(2);
    } else if (['Lj', 'Nj', 'Dž'].includes(firstTwoUpper)) {
      return firstTwoUpper + word.substr(2);
    }

    return word.charAt(0).toUpperCase() + word.substr(1);
  });

  return capitalizedWords.join(' ');
}

/**
 * Check if text contains Serbian characters
 */
export function containsSerbianChars(text: string): boolean {
  if (!text) return false;

  return /[А-Ша-шЂђЈјКкЉљЊњЋћЏџČĆŽŠĐčćžšđ]/.test(text);
}

/**
 * Extract Serbian words from text
 */
export function extractSerbianWords(text: string): string[] {
  if (!text) return [];

  // Match Serbian words (including digraphs)
  const serbianWordRegex = /[A-Za-zČĆŽŠĐčćžšđ]+|[А-Ша-шЂђЈјКкЉљЊњЋћЏџ]+/g;
  const matches = text.match(serbianWordRegex);

  return matches || [];
}

/**
 * Validate Serbian text structure
 */
export function validateSerbianText(text: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!text || text.trim().length === 0) {
    return {
      isValid: false,
      issues: ['Text is empty'],
      suggestions: ['Enter some text']
    };
  }

  const script = detectScript(text);

  if (script === 'mixed') {
    issues.push('Mixed scripts detected');
    suggestions.push('Consider using either Cyrillic or Latin script consistently');
  }

  if (script === 'none') {
    issues.push('No Serbian characters detected');
    suggestions.push('Include Serbian characters or check if the text is in Serbian');
  }

  // Check for common transliteration errors
  if (script === 'latin') {
    if (text.includes('Dj') || text.includes('dj')) {
      issues.push('Invalid digraph: Dj/dj');
      suggestions.push('Use Đ/đ instead of Dj/dj');
    }
  }

  // Check spacing around punctuation
  if (text.includes(' ,') || text.includes(' .') || text.includes(' ;')) {
    issues.push('Incorrect spacing around punctuation');
    suggestions.push('Use proper spacing: "word, text" instead of "word , text"');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Calculate script consistency score
 */
export function calculateScriptConsistency(texts: string[]): number {
  if (!texts || texts.length === 0) return 1.0;

  const scripts = texts.map(text => detectScript(text))
    .filter(script => script !== 'none');

  if (scripts.length === 0) return 1.0;

  const pureScripts = scripts.filter(script => script === 'cyrillic' || script === 'latin');

  if (pureScripts.length === 0) return 0.5; // Mixed or no readable content

  const cyrillicCount = pureScripts.filter(script => script === 'cyrillic').length;
  const latinCount = pureScripts.filter(script => script === 'latin').length;

  const consistency = Math.max(cyrillicCount, latinCount) / pureScripts.length;

  return consistency;
}