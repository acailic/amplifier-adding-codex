# Font Loading Strategy for Museum-Grade Typography

**Optimizing web fonts for performance without sacrificing quality**

---

## Overview

This guide outlines the font loading strategy for our museum-grade typography system, balancing visual excellence with web performance. The strategy ensures fonts load quickly, prevent layout shifts, and provide graceful fallbacks.

---

## Loading Strategy Summary

1. **Self-host critical fonts** for maximum control
2. **Use font-display: swap** for better perceived performance
3. **Implement preloading** for above-the-fold text
4. **Provide robust fallbacks** for each font family
5. **Monitor font loading** with Web Vitals

---

## Font Files Organization

### Directory Structure
```
/fonts/
├── display/
│   ├── cormorant-garamond-regular.woff2
│   ├── cormorant-garamond-medium.woff2
│   ├── cormorant-garamond-semibold.woff2
│   ├── cormorant-garamond-bold.woff2
│   └── cormorant-garamond-extrabold.woff2
├── ui/
│   ├── inter-regular.woff2
│   ├── inter-medium.woff2
│   ├── inter-semibold.woff2
│   └── inter-bold.woff2
├── editorial/
│   ├── inter-display-regular.woff2
│   ├── inter-display-medium.woff2
│   └── inter-display-bold.woff2
├── micro/
│   └── inter-tight-regular.woff2
└── mono/
    ├── ibm-plex-mono-regular.woff2
    └── ibm-plex-mono-medium.woff2
```

---

## Implementation Options

### Option 1: Google Fonts (Easiest)

```html
<!-- HTML head -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Inter+Display:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Pros:**
- Easy to implement
- Automatic optimization
- CDN delivery

**Cons:**
- External dependency
- Limited control over loading
- Potential privacy concerns

### Option 2: Self-Hosted (Recommended for Production)

#### 1. Font Face Definitions

```css
/* critical.css - Inline in HTML head */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Inter'),
       local('Inter-Regular'),
       url('/fonts/ui/inter-regular.woff2') format('woff2');
  ascent-override: 90%;
  descent-override: 35%;
  line-gap-override: 10%;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('Inter Medium'),
       url('/fonts/ui/inter-medium.woff2') format('woff2');
  ascent-override: 90%;
  descent-override: 35%;
  line-gap-override: 10%;
}

@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Cormorant Garamond'),
       local('CormorantGaramond-SemiBold'),
       url('/fonts/display/cormorant-garamond-semibold.woff2') format('woff2');
  size-adjust: 95%; /* Optical adjustment for screens */
}

@font-face {
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('IBM Plex Mono'),
       local('IBMPlexMono'),
       url('/fonts/mono/ibm-plex-mono-regular.woff2') format('woff2');
}
```

#### 2. Font Subsetting

Create subsets for different languages:

```bash
# Example using fonttools
pyftsubset Inter-Regular.otf \
  --unicodes=U+0020-007F,U+00A0-00FF \
  --output-file=Inter-Latin1.woff2 \
  --flavor=woff2 \
  --layout-features-=kern \
  --glyph-names
```

#### 3. Variable Fonts (Advanced Option)

```css
@font-face {
  font-family: 'Inter Var';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/ui/inter-variable.woff2') format('woff2-variations'),
       url('/fonts/ui/inter-variable.woff2') format('woff2');
}
```

---

## Critical CSS Strategy

### 1. Inline Critical Typography

```html
<style>
  /* Inline in HTML head for instant rendering */
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #171717;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 700;
    line-height: 1.2;
  }

  .hero-title {
    font-size: clamp(2.5rem, 5vw, 5rem);
    font-weight: 800;
    line-height: 1;
    margin-bottom: 1rem;
  }

  /* Prevent flash of unstyled text */
  .font-display,
  .font-ui,
  .font-editorial {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
</style>
```

### 2. Non-Critical CSS Loading

```html
<!-- Load after initial render -->
<link rel="preload" href="/css/typography.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/css/typography.css"></noscript>
```

---

## Font Loading Events

### JavaScript Monitoring

```javascript
// Monitor font loading
if ('fonts' in document) {
  Promise.all([
    document.fonts.load('400 1em Inter'),
    document.fonts.load('600 1em Cormorant Garamond'),
    document.fonts.load('400 1em IBM Plex Mono')
  ]).then(() => {
    document.documentElement.classList.add('fonts-loaded');

    // Remove FOIT prevention class
    document.body.style.fontDisplay = 'auto';
  });
}

// Fallback for older browsers
setTimeout(() => {
  document.documentElement.classList.add('fonts-loaded');
}, 3000);
```

### CSS with Font Loading States

```css
/* Before fonts load */
.fonts-loading {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
}

/* After fonts load */
.fonts-loaded .font-ui {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.fonts-loaded .font-display {
  font-family: 'Cormorant Garamond', Georgia, serif;
}

/* Smooth transition */
.font-ui,
.font-display {
  transition: font-family 0.3s ease;
}
```

---

## Performance Optimization Techniques

### 1. Preloading Critical Fonts

```html
<!-- Preload most important fonts -->
<link rel="preload" href="/fonts/ui/inter-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/display/cormorant-garamond-semibold.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preconnect to font domains (if using CDN) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### 2. Font Display Strategies

```css
/* Different strategies for different contexts */

/* System fonts - No loading needed */
.font-system {
  font-family: system-ui, sans-serif;
}

/* Important UI - Fast swap */
.font-ui-important {
  font-family: 'Inter', system-ui, sans-serif;
  font-display: swap;
}

/* Display text - Optional block for brief period */
.font-display-headline {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-display: optional; /* Won't render if not loaded */
}

/* Secondary text - Fallback */
.font-secondary {
  font-family: 'IBM Plex Mono', 'SF Mono', monospace;
  font-display: fallback; /* Uses fallback for short time */
}
```

### 3. Size Adjustments for Consistent Layout

```css
@font-face {
  font-family: 'Inter';
  font-weight: 400;
  src: url('/fonts/ui/inter-regular.woff2') format('woff2');
  font-display: swap;
  /* Match system font metrics */
  size-adjust: 92%;
  ascent-override: 95%;
  descent-override: 30%;
}
```

---

## Fallback Font System

### 1. Fallback Metrics

```css
:root {
  /* Fallback font stacks that match our custom fonts */
  --fallback-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --fallback-serif: Georgia, 'Times New Roman', serif;
  --fallback-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

/* Progressive enhancement */
.font-ui {
  font-family: var(--fallback-ui);
}

.fonts-loaded .font-ui {
  font-family: 'Inter', var(--fallback-ui);
}
```

### 2. Emergency Fallbacks

```css
/* If all else fails */
@supports not (font-display: swap) {
  .font-ui {
    font-family: var(--fallback-ui) !important;
  }
}
```

---

## Monitoring and Analytics

### 1. Web Vitals Integration

```javascript
// Measure font loading impact on CLS
let fontLoadComplete = false;

document.fonts.ready.then(() => {
  fontLoadComplete = true;

  // Log font loading time
  const loadTime = performance.now();
  console.log(`All fonts loaded in ${loadTime}ms`);

  // Send to analytics
  if (typeof gtag === 'function') {
    gtag('event', 'font_load_complete', {
      'custom_parameter': loadTime
    });
  }
});

// Track layout shifts during font loading
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!fontLoadComplete && entry.value > 0) {
      console.log('CLS during font load:', entry.value);
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
```

### 2. Font Loading States for Debugging

```css
/* Debug styles - remove in production */
.debug-fonts .font-ui::before {
  content: "Loading UI font...";
  position: absolute;
  top: -20px;
  font-size: 10px;
  color: red;
}

.debug-fonts.fonts-loaded .font-ui::before {
  content: "UI font loaded";
  color: green;
}
```

---

## Browser Compatibility

### Font Display Support

| Browser | swap | block | fallback | optional |
|---------|------|-------|----------|----------|
| Chrome 35+ | ✓ | ✓ | ✓ | ✓ |
| Firefox 41+ | ✓ | ✓ | ✓ | ✓ |
| Safari 11.1+ | ✓ | ✓ | ✓ | ✓ |
| Edge 79+ | ✓ | ✓ | ✓ | ✓ |

### Fallbacks for Older Browsers

```css
/* IE11 and Edge Legacy */
@supports not (font-display: swap) {
  .font-ui {
    /* Use system fonts immediately */
    font-family: var(--fallback-ui) !important;
  }
}
```

---

## Best Practices Checklist

### Pre-Launch Checklist

- [ ] All font files are compressed (WOFF2 only)
- [ ] Critical fonts are preloaded
- [ ] Font-display is set to 'swap' or 'optional'
- [ ] Fallback fonts have similar metrics
- [ ] No FOIT (flash of invisible text)
- [ ] Minimal CLS from font loading
- [ ] Font loading time is < 1 second
- [ ] All font weights load properly
- [ ] Italic variants work correctly
- [ ] Performance budgets are met

### Ongoing Monitoring

- [ ] Track font loading times in analytics
- [ ] Monitor CLS scores
- [ ] Check font file sizes quarterly
- [ ] Test on slow connections (3G)
- [ ] Verify accessibility with reduced motion
- [ ] Test print styles

---

## Implementation Example

### Complete HTML Head

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Preconnect for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Preload critical fonts -->
  <link rel="preload" href="/fonts/ui/inter-regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/display/cormorant-garamond-semibold.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Critical CSS inline -->
  <style>
    /* System font fallbacks */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
      line-height: 1.5;
    }

    /* Font face definitions with swap */
    @font-face {
      font-family: 'Inter';
      font-weight: 400;
      font-display: swap;
      src: local('Inter'), url('/fonts/ui/inter-regular.woff2') format('woff2');
    }

    /* Loading states */
    .font-ui { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .fonts-loaded .font-ui { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  </style>

  <!-- Non-critical CSS -->
  <link rel="preload" href="/css/typography.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/typography.css"></noscript>

  <!-- Font loading monitoring -->
  <script>
    if ('fonts' in document) {
      Promise.all([
        document.fonts.load('400 1em Inter'),
        document.fonts.load('600 1em Cormorant Garamond')
      ]).then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
    }
  </script>
</head>
<body class="fonts-loading">
  <!-- Content -->
</body>
</html>
```

---

## Conclusion

This font loading strategy ensures our museum-grade typography system:

1. **Loads quickly** with minimal impact on Core Web Vitals
2. **Prevents layout shifts** through metric matching
3. **Provides graceful degradation** with robust fallbacks
4. **Maintains quality** without sacrificing performance
5. **Monitors effectively** to catch issues early

The result is a typography system that feels instantaneous and professional, worthy of exhibition-quality design.