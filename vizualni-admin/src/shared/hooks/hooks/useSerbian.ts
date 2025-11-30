/**
 * React hooks for Serbian functionality
 * React куки за српску функционалност
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { i18n } from '@lingui/core';
import { detectScript, convertScript, getBothScriptVariants } from '../utils/utils/serbian-text';
import { formatSerbianDate, formatSerbianNumber, getSerbianDateFormat } from '../utils/utils/serbian-formatting';
import { validateSerbianForm, validateSerbianDataset } from '../utils/utils/serbian-validation';
import { applySerbianTypography } from '../utils/utils/serbian-typography';
import type { SerbianScript, SerbianFormData, SerbianValidationResult } from '../types/types/serbian';

/**
 * Hook for Serbian script management
 */
export function useSerbianScript(initialScript: SerbianScript = 'cyrillic') {
  const [currentScript, setCurrentScript] = useState<SerbianScript>(initialScript);

  const toggleScript = useCallback(() => {
    setCurrentScript(prev => prev === 'cyrillic' ? 'latin' : 'cyrillic');
  }, []);

  const convertText = useCallback((text: string, targetScript?: SerbianScript) => {
    const script = targetScript || currentScript;
    return convertScript(text, script === 'cyrillic' ? 'cyrillic' : 'latin');
  }, [currentScript]);

  const getScriptVariants = useCallback((text: string) => {
    return getBothScriptVariants(text);
  }, []);

  const detectTextScript = useCallback((text: string) => {
    return detectScript(text);
  }, []);

  return {
    currentScript,
    setCurrentScript,
    toggleScript,
    convertText,
    getScriptVariants,
    detectTextScript
  };
}

/**
 * Hook for Serbian date formatting
 */
export function useSerbianDate(
  date: Date | string,
  formatType: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime' = 'medium'
) {
  const formatted = useMemo(() => {
    return formatSerbianDate(date, formatType, i18n.locale === 'sr' ? 'cyrillic' : 'latin');
  }, [date, formatType, i18n.locale]);

  const fullFormat = useMemo(() => {
    return getSerbianDateFormat(date, i18n.locale === 'sr' ? 'cyrillic' : 'latin');
  }, [date, i18n.locale]);

  return {
    formatted,
    fullFormat
  };
}

/**
 * Hook for Serbian number formatting
 */
export function useSerbianNumber(value: number, options: {
  decimals?: number;
  useThousands?: boolean;
  currency?: boolean;
} = {}) {
  const formatted = useMemo(() => {
    return formatSerbianNumber(value, {
      ...options,
      script: i18n.locale === 'sr' ? 'cyrillic' : 'latin'
    });
  }, [value, options, i18n.locale]);

  return {
    formatted
  };
}

/**
 * Hook for Serbian form validation
 */
export function useSerbianForm(initialData: SerbianFormData = {}) {
  const [formData, setFormData] = useState<SerbianFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(true);

  const validateForm = useCallback((data: SerbianFormData) => {
    const validation = validateSerbianForm(data);
    setErrors(validation.errors);
    setWarnings(validation.warnings);
    setIsValid(validation.isValid);
    return validation;
  }, []);

  const updateField = useCallback((field: keyof SerbianFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    validateForm(newData);
  }, [formData, validateForm]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setWarnings({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setWarnings({});
    setIsValid(true);
  }, [initialData]);

  return {
    formData,
    errors,
    warnings,
    isValid,
    validateForm,
    updateField,
    clearErrors,
    resetForm
  };
}

/**
 * Hook for Serbian dataset validation
 */
export function useSerbianDatasetValidation() {
  const [validationResult, setValidationResult] = useState<SerbianValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateDataset = useCallback(async (records: any[], textColumns: string[] = []) => {
    setIsValidating(true);

    try {
      // Run validation in a setTimeout to prevent blocking UI
      const result = await new Promise<SerbianValidationResult>((resolve) => {
        setTimeout(() => {
          const validation = validateSerbianDataset(records, textColumns);
          resolve(validation);
        }, 0);
      });

      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validationResult,
    isValidating,
    validateDataset,
    clearValidation
  };
}

/**
 * Hook for Serbian typography
 */
export function useSerbianTypography(elementRef: React.RefObject<HTMLElement>) {
  const [isApplied, setIsApplied] = useState(false);

  const applyTypography = useCallback((
    type: 'body' | 'heading' | 'caption' | 'code' = 'body',
    script: 'cyrillic' | 'latin' = 'cyrillic'
  ) => {
    if (elementRef.current) {
      applySerbianTypography(elementRef.current, type, script);
      setIsApplied(true);
    }
  }, [elementRef]);

  const removeTypography = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.classList.remove(
        'serbian-text', 'serbian-heading', 'serbian-body',
        'serbian-caption', 'serbian-code', 'serbian-cyrillic', 'serbian-latin'
      );
      setIsApplied(false);
    }
  }, [elementRef]);

  useEffect(() => {
    return () => {
      removeTypography();
    };
  }, [removeTypography]);

  return {
    isApplied,
    applyTypography,
    removeTypography
  };
}

/**
 * Hook for Serbian language detection
 */
export function useSerbianLanguageDetection() {
  const [detectedLanguage, setDetectedLanguage] = useState<{
    isSerbian: boolean;
    confidence: number;
    script: 'cyrillic' | 'latin' | 'mixed';
  } | null>(null);

  const detectLanguage = useCallback((text: string) => {
    const script = detectScript(text);
    const hasSerbianChars = /[А-Ша-шЂђЈјКкЉљЊњЋћЏџČĆŽŠĐčćžšđ]/.test(text);

    let confidence = 0;
    if (hasSerbianChars) confidence += 0.6;
    if (script !== 'none') confidence += 0.3;

    const result = {
      isSerbian: confidence > 0.5,
      confidence: Math.min(confidence, 1.0),
      script: script === 'cyrillic' ? 'cyrillic' : 'latin'
    };

    setDetectedLanguage(result);
    return result;
  }, []);

  return {
    detectedLanguage,
    detectLanguage
  };
}

/**
 * Hook for Serbian text input with script detection
 */
export function useSerbianTextInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [detectedScript, setDetectedScript] = useState<SerbianScript>('none');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    const script = detectScript(newValue);
    setDetectedScript(script);

    // Generate suggestions based on detected script
    if (script !== 'none' && newValue.length > 2) {
      // This could be enhanced with actual spell checking or auto-completion
      const baseSuggestions = generateSerbianSuggestions(newValue);
      setSuggestions(baseSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, []);

  const clearValue = useCallback(() => {
    setValue('');
    setDetectedScript('none');
    setSuggestions([]);
  }, []);

  return {
    value,
    detectedScript,
    suggestions,
    handleChange,
    clearValue
  };
}

/**
 * Hook for Serbian currency formatting
 */
export function useSerbianCurrency() {
  const formatCurrency = useCallback((amount: number, currency: 'RSD' | 'EUR' | 'USD' = 'RSD') => {
    const script = i18n.locale === 'sr' ? 'cyrillic' : 'latin';
    return formatSerbianNumber(amount, {
      currency: true,
      script,
      decimals: currency === 'RSD' ? 0 : 2
    });
  }, [i18n.locale]);

  const formatExchange = useCallback((amount: number, fromCurrency: string, toCurrency: string, rate: number) => {
    const convertedAmount = amount * rate;
    const formattedAmount = formatCurrency(convertedAmount, toCurrency as 'RSD' | 'EUR' | 'USD');

    return {
      amount: convertedAmount,
      formatted: formattedAmount,
      fromCurrency,
      toCurrency,
      rate
    };
  }, [formatCurrency]);

  return {
    formatCurrency,
    formatExchange
  };
}

/**
 * Generate Serbian text suggestions (basic implementation)
 */
function generateSerbianSuggestions(text: string): string[] {
  // This is a basic implementation - could be enhanced with a proper dictionary
  const suggestions: string[] = [];

  if (text.length < 3) return suggestions;

  // Add common Serbian completions
  const commonPrefixes = ['прев', 'корис', 'админ', 'подат', 'систем', 'аплика', 'функци'];
  const commonSuffixes = ['кација', 'нике', 'ник', 'овање', ' података', ' система'];

  for (const prefix of commonPrefixes) {
    if (text.toLowerCase().startsWith(prefix)) {
      for (const suffix of commonSuffixes) {
        suggestions.push(prefix.substring(0, text.length) + suffix);
      }
    }
  }

  return [...new Set(suggestions)];
}

/**
 * Hook for Serbian accessibility features
 */
export function useSerbianAccessibility() {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for user preferences
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const prefersLargeText = window.matchMedia('(prefers-reduced-data: reduce)').matches; // Approximation
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setHighContrast(prefersHighContrast);
    setLargeText(prefersLargeText);
    setReducedMotion(prefersReducedMotion);

    // Listen for changes
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleHighContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    const handleReducedMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    highContrastQuery.addEventListener('change', handleHighContrastChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  const getAccessibilityClasses = useCallback(() => {
    const classes: string[] = [];
    if (highContrast) classes.push('serbian-high-contrast');
    if (largeText) classes.push('serbian-large-text');
    if (reducedMotion) classes.push('serbian-reduced-motion');
    return classes.join(' ');
  }, [highContrast, largeText, reducedMotion]);

  return {
    highContrast,
    largeText,
    reducedMotion,
    getAccessibilityClasses
  };
}