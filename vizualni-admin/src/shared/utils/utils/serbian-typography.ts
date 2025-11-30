/**
 * Serbian typography and font utilities
 * Алатке за српску типографију и фонтове
 */

import type { SerbianTypographyConfig } from '../types/serbian';

// Serbian font families optimized for both Cyrillic and Latin scripts
export const SERBIAN_FONTS = {
  // Primary font families
  primary: [
    'Inter Variable', // Variable font with excellent Cyrillic support
    'Inter', // Fallback
    '-apple-system',
    'BlinkMacSystemFont',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ],

  // Display font families
  display: [
    'Inter Display Variable',
    'Inter Display',
    'Inter Variable',
    'Inter',
    'Georgia',
    'Times New Roman',
    'serif'
  ],

  // Monospace font families
  monospace: [
    'JetBrains Mono Variable',
    'JetBrains Mono',
    'Fira Code Variable',
    'Fira Code',
    'SF Mono',
    'Monaco',
    'Cascadia Code',
    'Consolas',
    'monospace'
  ],

  // Secondary font families (for specific use cases)
  secondary: [
    'Inter',
    'Roboto Slab',
    'Merriweather',
    'Georgia',
    'serif'
  ]
};

// Font feature settings for optimal Serbian text rendering
export const SERBIAN_FONT_FEATURES = {
  // Kerning for better character spacing
  kerning: '"kern" 1, "kern" on',

  // Ligatures for common combinations
  ligatures: '"liga" 1, "dlig" 1',

  // Contextual alternates for better readability
  contextual: '"calt" 1',

  // Number spacing and figures
  numbers: '"tnum" 1, "onum" 1, "pnum" 1',

  // Localized forms for Serbian characters
  localized: '"locl" (SRB, SRB_Latn)',

  // Stylistic sets for better appearance
  stylistic: '"ss01" 1, "ss02" 1'
};

// Serbian font sizes (using modular scale)
export const SERBIAN_FONT_SIZES = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem',  // 72px
};

// Line heights optimized for Serbian text
export const SERBIAN_LINE_HEIGHTS = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

// Letter spacing for Serbian text
export const SERBIAN_LETTER_SPACING = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

// Font weights for Serbian typography
export const SERBIAN_FONT_WEIGHTS = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

/**
 * Default Serbian typography configuration
 */
export const DEFAULT_SERBIAN_TYPOGRAPHY: SerbianTypographyConfig = {
  fontFamily: {
    primary: SERBIAN_FONTS.primary.join(', '),
    secondary: SERBIAN_FONTS.secondary.join(', '),
    monospace: SERBIAN_FONTS.monospace.join(', '),
    display: SERBIAN_FONTS.display.join(', ')
  },
  fontFeatures: {
    ligatures: true,
    kerning: true,
    contextual: true
  },
  fontSizes: SERBIAN_FONT_SIZES
};

/**
 * Generate CSS for Serbian fonts
 */
export function generateSerbianFontCSS(): string {
  return `
/* Serbian Font Imports */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter+Display:slnt,wght@-10..0,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');

/* Serbian Font Variables */
:root {
  --font-serif-primary: 'Georgia', 'Times New Roman', serif;
  --font-sans-primary: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --font-mono-primary: 'JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
  --font-display-primary: 'Inter Display Variable', 'Inter Display', 'Inter Variable', 'Inter', 'Georgia', 'Times New Roman', serif;

  /* Serbian Font Sizes */
  --text-xs: ${SERBIAN_FONT_SIZES.xs};
  --text-sm: ${SERBIAN_FONT_SIZES.sm};
  --text-base: ${SERBIAN_FONT_SIZES.base};
  --text-lg: ${SERBIAN_FONT_SIZES.lg};
  --text-xl: ${SERBIAN_FONT_SIZES.xl};
  --text-2xl: ${SERBIAN_FONT_SIZES['2xl']};
  --text-3xl: ${SERBIAN_FONT_SIZES['3xl']};
  --text-4xl: ${SERBIAN_FONT_SIZES['4xl']};

  /* Serbian Line Heights */
  --leading-none: ${SERBIAN_LINE_HEIGHTS.none};
  --leading-tight: ${SERBIAN_LINE_HEIGHTS.tight};
  --leading-normal: ${SERBIAN_LINE_HEIGHTS.normal};
  --leading-relaxed: ${SERBIAN_LINE_HEIGHTS.relaxed};

  /* Serbian Letter Spacing */
  --tracking-tight: ${SERBIAN_LETTER_SPACING.tight};
  --tracking-normal: ${SERBIAN_LETTER_SPACING.normal};
  --tracking-wide: ${SERBIAN_LETTER_SPACING.wide};

  /* Serbian Font Weights */
  --font-light: ${SERBIAN_FONT_WEIGHTS.light};
  --font-normal: ${SERBIAN_FONT_WEIGHTS.normal};
  --font-medium: ${SERBIAN_FONT_WEIGHTS.medium};
  --font-semibold: ${SERBIAN_FONT_WEIGHTS.semibold};
  --font-bold: ${SERBIAN_FONT_WEIGHTS.bold};
}

/* Serbian Typography Base Styles */
.serbian-text {
  font-family: var(--font-sans-primary);
  font-feature-settings: ${SERBIAN_FONT_FEATURES.kerning}, ${SERBIAN_FONT_FEATURES.ligatures}, ${SERBIAN_FONT_FEATURES.contextual};
  font-variant-ligatures: common-ligatures discretionary-ligatures;
  font-kerning: normal;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.serbian-heading {
  font-family: var(--font-display-primary);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.serbian-body {
  font-family: var(--font-sans-primary);
  line-height: var(--leading-relaxed);
  font-size: var(--text-base);
}

.serbian-caption {
  font-family: var(--font-sans-primary);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  font-weight: var(--font-normal);
}

.serbian-code {
  font-family: var(--font-mono-primary);
  font-feature-settings: ${SERBIAN_FONT_FEATURES.numbers};
  font-variant-numeric: tabular-nums;
}

/* Cyrillic-specific optimizations */
.serbian-cyrillic {
  font-family: var(--font-sans-primary);
  letter-spacing: var(--tracking-normal);
  line-height: var(--leading-relaxed);
}

/* Latin-specific optimizations */
.serbian-latin {
  font-family: var(--font-sans-primary);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-normal);
}

/* Print styles for Serbian text */
@media print {
  .serbian-text {
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #000;
    background: transparent;
  }

  .serbian-heading {
    page-break-after: avoid;
    page-break-inside: avoid;
  }
}

/* High contrast mode for accessibility */
@media (prefers-contrast: high) {
  .serbian-text {
    font-weight: var(--font-medium);
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .serbian-text {
    transition: none;
  }
}
`;
}

/**
 * Apply Serbian typography to an element
 */
export function applySerbianTypography(
  element: HTMLElement,
  type: 'body' | 'heading' | 'caption' | 'code' | 'custom' = 'body',
  script: 'cyrillic' | 'latin' = 'cyrillic'
): void {
  // Remove existing typography classes
  element.classList.remove(
    'serbian-text', 'serbian-heading', 'serbian-body',
    'serbian-caption', 'serbian-code', 'serbian-cyrillic', 'serbian-latin'
  );

  // Add base Serbian text class
  element.classList.add('serbian-text');

  // Add type-specific class
  switch (type) {
    case 'heading':
      element.classList.add('serbian-heading');
      break;
    case 'caption':
      element.classList.add('serbian-caption');
      break;
    case 'code':
      element.classList.add('serbian-code');
      break;
    case 'body':
    default:
      element.classList.add('serbian-body');
      break;
  }

  // Add script-specific class
  element.classList.add(script === 'cyrillic' ? 'serbian-cyrillic' : 'serbian-latin');

  // Set font-feature-settings for optimal Serbian text rendering
  element.style.fontFeatureSettings = SERBIAN_FONT_FEATURES.kerning + ', ' +
    SERBIAN_FONT_FEATURES.ligatures + ', ' + SERBIAN_FONT_FEATURES.contextual;

  // Enable text rendering optimizations
  element.style.textRendering = 'optimizeLegibility';
  element.style.webkitFontSmoothing = 'antialiased';
  element.style.mozOsxFontSmoothing = 'grayscale';
}

/**
 * Get optimal font family for Serbian text
 */
export function getSerbianFontFamily(
  type: 'primary' | 'secondary' | 'monospace' | 'display' = 'primary'
): string {
  return SERBIAN_FONTS[type].join(', ');
}

/**
 * Check if font supports Serbian characters
 */
export function fontSupportsSerbian(fontFamily: string): boolean {
  // Create a test element
  const testElement = document.createElement('span');
  testElement.style.position = 'absolute';
  testElement.style.visibility = 'hidden';
  testElement.style.fontSize = '100px';
  testElement.style.fontFamily = fontFamily;
  testElement.textContent = 'АаБбВвГгЂђЈјКкЉљЊњЋћЏџČĆŽŠĐčćžšđ';

  document.body.appendChild(testElement);

  // Measure the text
  const width = testElement.offsetWidth;

  // Clean up
  document.body.removeChild(testElement);

  // If the width is very small, the font likely doesn't support Serbian characters
  return width > 100;
}

/**
 * Get fallback fonts for Serbian text
 */
export function getSerbianFontFallbacks(
  primaryFont: string,
  type: 'primary' | 'secondary' | 'monospace' | 'display' = 'primary'
): string[] {
  const baseFallbacks = SERBIAN_FONTS[type].slice(1); // Remove the first element (variable font)

  // Add common system fonts that support Serbian well
  const systemFallbacks = [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial'
  ];

  // Combine all fallbacks and remove duplicates
  const allFallbacks = [...new Set([...baseFallbacks, ...systemFallbacks])];

  return [primaryFont, ...allFallbacks];
}

/**
 * Calculate optimal line height for Serbian text
 */
export function getSerbianLineHeight(
  fontSize: number,
  script: 'cyrillic' | 'latin' = 'cyrillic'
): number {
  // Cyrillic text typically needs more line height due to character height
  const baseHeight = script === 'cyrillic' ? 1.6 : 1.5;

  // Adjust for font size
  if (fontSize < 14) {
    return baseHeight + 0.1;
  } else if (fontSize > 20) {
    return baseHeight - 0.1;
  }

  return baseHeight;
}

/**
 * Calculate optimal letter spacing for Serbian text
 */
export function getSerbianLetterSpacing(
  fontSize: number,
  script: 'cyrillic' | 'latin' = 'cyrillic'
): string {
  // Smaller fonts need slightly more letter spacing for readability
  let baseSpacing = script === 'cyrillic' ? 0 : -0.025;

  if (fontSize < 14) {
    baseSpacing += 0.025;
  } else if (fontSize > 24) {
    baseSpacing -= 0.025;
  }

  return `${baseSpacing}em`;
}