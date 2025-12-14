# Museum-Grade Typography System

**Elevating design to exhibition quality**

---

## Purpose & Philosophy

This typography system achieves museum-grade quality through:

1. **Curated font pairings** that evoke the sophistication of high-end exhibitions
2. **Modular scale hierarchy** based on mathematical harmony
3. **Context-specific variants** for different presentation contexts
4. **Performance-optimized loading** for web implementation
5. **Accessibility-first approach** meeting WCAG AAA standards

**Inspiration**: Monocle magazine's editorial precision meets MoMA's exhibition typography

---

## Font Families

### Primary Display Serif: *Cormorant Garamond*

**Why**: Elegant, high-contrast serif with exhibition presence
- Optically scaled for headlines
- Classic proportions with contemporary clarity
- Excellent rendering at large sizes
- Cultural gravitas without being antiquated

**Fallbacks**: `Georgia`, `Times New Roman`, `serif`

```css
--font-family-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
```

### Secondary UI Sans: *Inter*

**Why**: The new standard for UI typography
- Optimized for screen rendering
- Excellent legibility at small sizes
- Neutral personality that supports content
- Extensive weight variations

**Fallbacks**: `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`

```css
--font-family-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Editorial Sans: *Inter Display*

**Why**: Slightly wider proportions for headlines
- More generous spacing for impact
- Maintains Inter's screen optimization
- Perfect bridge between display and UI

**Fallbacks**: `Inter`, system sans-serif

```css
--font-family-editorial: 'Inter Display', 'Inter', system-ui, sans-serif;
```

### Caption Micro: *Inter Tight*

**Why**: Ultra-compact for data-dense interfaces
- Optimized for small sizes
- Maintains readability at 10px
- Perfect for charts and captions

**Fallbacks**: `Inter`, `system-ui`

```css
--font-family-micro: 'Inter Tight', 'Inter', system-ui, sans-serif;
```

### Monospace: *IBM Plex Mono*

**Why**: Technical precision with editorial warmth
- Distinctive character shapes
- Excellent code/data display
- Pairs well with Inter

**Fallbacks**: `'SF Mono'`, `'Fira Code'`, `monospace`

```css
--font-family-mono: 'IBM Plex Mono', 'SF Mono', 'Fira Code', monospace;
```

---

## Modular Scale System

Based on **Perfect Fourth (1.333)** ratio for musical harmony in typography

### Scale Progression
```
Base: 16px
×1.333 = 21.33px ≈ 21px
×1.333² = 28.44px ≈ 28px
×1.333³ = 37.92px ≈ 38px
×1.333⁴ = 50.56px ≈ 51px
×1.333⁵ = 67.41px ≈ 67px
×1.333⁶ = 89.88px ≈ 90px
```

### Type Scale (Rem Units)

| Scale | Pixels | Rem | Use Case | Weight | Line Height |
|-------|--------|-----|----------|--------|-------------|
| Micro | 10px | 0.625 | Chart labels | 400 | 1.4 |
| Caption | 12px | 0.75 | Captions, metadata | 400 | 1.5 |
| Small | 14px | 0.875 | Secondary text | 400 | 1.5 |
| Base | 16px | 1.0 | Body text | 400 | 1.6 |
| Medium | 21px | 1.3125 | Subheadings | 500 | 1.4 |
| Large | 28px | 1.75 | Section headings | 600 | 1.3 |
| XL | 38px | 2.375 | Feature titles | 700 | 1.2 |
| 2XL | 51px | 3.1875 | Hero titles | 700 | 1.1 |
| 3XL | 67px | 4.1875 | Exhibition titles | 700 | 1.05 |
| 4XL | 90px | 5.625 | Showcase titles | 800 | 1.0 |

---

## Context-Specific Typography

### 1. Hero Presentations

**Exhibition Title**
```css
.hero-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-4xl); /* 5.625rem / 90px */
  font-weight: 800;
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: var(--color-neutral-900);
}
```

**Subtitle**
```css
.hero-subtitle {
  font-family: var(--font-family-editorial);
  font-size: var(--font-size-xl); /* 2.375rem / 38px */
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-neutral-600);
}
```

**Description**
```css
.hero-description {
  font-family: var(--font-family-ui);
  font-size: var(--font-size-large); /* 1.75rem / 28px */
  font-weight: 400;
  line-height: 1.5;
  max-width: 65ch; /* Optimal reading length */
}
```

### 2. Chart Labels & Data Visualization

**Axis Labels**
```css
.chart-axis {
  font-family: var(--font-family-micro);
  font-size: var(--font-size-micro); /* 0.625rem / 10px */
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

**Data Labels**
```css
.chart-label {
  font-family: var(--font-family-micro);
  font-size: var(--font-size-caption); /* 0.75rem / 12px */
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-neutral-700);
}
```

**Value Annotations**
```css
.chart-value {
  font-family: var(--font-family-ui);
  font-size: var(--font-size-small); /* 0.875rem / 14px */
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-neutral-900);
}
```

### 3. Gallery Exhibition Text

**Artwork Title**
```css
.artwork-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-2xl); /* 3.1875rem / 51px */
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-neutral-900);
}
```

**Artist Name**
```css
.artist-name {
  font-family: var(--font-family-editorial);
  font-size: var(--font-size-large); /* 1.75rem / 28px */
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-neutral-700);
}
```

**Caption Text**
```css
.artwork-caption {
  font-family: var(--font-family-ui);
  font-size: var(--font-size-caption); /* 0.75rem / 12px */
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-neutral-600);
  font-style: italic;
}
```

**Extended Description**
```css
.artwork-description {
  font-family: var(--font-family-ui);
  font-size: var(--font-size-base); /* 1rem / 16px */
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-neutral-700);
  column-count: 2;
  column-gap: var(--space-8);
}
```

### 4. Poster & Print Materials

**Main Headline**
```css
.poster-headline {
  font-family: var(--font-family-display);
  font-size: var(--font-size-3xl); /* 4.1875rem / 67px */
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}
```

**Sub-headline**
```css
.poster-subheadline {
  font-family: var(--font-family-editorial);
  font-size: var(--font-size-xl); /* 2.375rem / 38px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}
```

**Information**
```css
.poster-info {
  font-family: var(--font-family-ui);
  font-size: var(--font-size-medium); /* 1.3125rem / 21px */
  font-weight: 500;
  line-height: 1.4;
}
```

---

## Typographic Details

### Letter Spacing

Optimized for each context:

```css
/* Display: Tight for impact */
--letter-spacing-tight: -0.03em;

/* Headings: Slightly tight */
--letter-spacing-heading: -0.01em;

/* Body: Normal */
--letter-spacing-normal: 0em;

/* Small text: Loose for legibility */
--letter-spacing-loose: 0.05em;

/* All caps: Extra loose */
--letter-spacing-wide: 0.1em;
```

### Optical Sizes

Using font-display: swap for performance:

```css
@font-face {
  font-family: 'Cormorant Garamond';
  src: url('/fonts/cormorant-garamond-regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
  size-adjust: 95%; /* Optical adjustment for screens */
}
```

### Advanced Typography Features

Enabled for enhanced quality:

```css
.feature-rich {
  font-variant-ligatures: common-ligatures discretionary-ligatures;
  font-variant-numeric: oldstyle-nums proportional-nums;
  font-variant-position: sub;
  font-kerning: normal;
  text-rendering: optimizeLegibility;
}
```

---

## Responsive Typography

Fluid scaling for seamless adaptation:

```css
:root {
  --fluid-min-width: 320;
  --fluid-max-width: 1140;
  --fluid-screen: 100vw;
  --fluid-bp: calc(
    (var(--fluid-screen) - var(--fluid-min-width) / 16 * 1rem) /
    (var(--fluid-max-width) - var(--fluid-min-width))
  );
}

/* Example: Fluid headline */
.fluid-headline {
  font-size: calc(
    var(--font-size-2xl) + var(--font-size-3xl) * var(--fluid-bp)
  );
}
```

---

## Performance Optimization

### Font Loading Strategy

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/cormorant-garamond-bold.woff2" as="font" type="font/woff2" crossorigin>

<!-- Font display with fallback -->
<style>
  @font-face {
    font-family: 'Inter';
    src: local('Inter'), url('/fonts/inter-regular.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
    ascent-override: 90%;
    descent-override: 35%;
  }
</style>
```

### Critical CSS Inlining

```html
<style>
  /* Inline critical typography for immediate render */
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  h1, h2, h3 { margin: 0 0 1rem; line-height: 1.2; }
  .critical-text { font-family: 'Inter', sans-serif; }
</style>
```

---

## Accessibility Standards

### WCAG AAA Compliance

All text meets 7:1 contrast minimum:

```css
/* Text-specific contrast values */
--contrast-aaa-text: #171717 on #ffffff; /* 15.8:1 */
--contrast-aaa-text-secondary: #525252 on #ffffff; /* 7.9:1 */
--contrast-aaa-text-disabled: #a3a3a3 on #ffffff; /* 3:1 minimum for large text */
```

### Print Optimization

```css
@media print {
  /* Ensure high-quality print rendering */
  * {
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }

  /* Optimize line heights for print */
  p, li {
    line-height: 1.4;
    orphans: 3;
    widows: 3;
  }

  /* Avoid breaks in critical elements */
  h1, h2, h3 {
    page-break-after: avoid;
    break-after: avoid;
  }
}
```

### Screen Reader Optimization

```css
/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-neutral-900);
  color: var(--color-neutral-0);
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 6px;
}

/* Accessible hiding */
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
```

---

## Implementation Guide

### 1. CSS Custom Properties

```css
:root {
  /* Font families */
  --font-family-display: 'Cormorant Garamond', Georgia, serif;
  --font-family-ui: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-editorial: 'Inter Display', 'Inter', system-ui, sans-serif;
  --font-family-micro: 'Inter Tight', 'Inter', system-ui, sans-serif;
  --font-family-mono: 'IBM Plex Mono', 'SF Mono', monospace;

  /* Modular scale - rem units */
  --font-size-micro: 0.625rem;
  --font-size-caption: 0.75rem;
  --font-size-small: 0.875rem;
  --font-size-base: 1rem;
  --font-size-medium: 1.3125rem;
  --font-size-large: 1.75rem;
  --font-size-xl: 2.375rem;
  --font-size-2xl: 3.1875rem;
  --font-size-3xl: 4.1875rem;
  --font-size-4xl: 5.625rem;

  /* Letter spacing */
  --letter-spacing-tight: -0.03em;
  --letter-spacing-heading: -0.01em;
  --letter-spacing-normal: 0em;
  --letter-spacing-loose: 0.05em;
  --letter-spacing-wide: 0.1em;

  /* Line heights */
  --line-height-tight: 1.0;
  --line-height-heading: 1.1;
  --line-height-compact: 1.2;
  --line-height-normal: 1.4;
  --line-height-readable: 1.5;
  --line-height-loose: 1.6;
}
```

### 2. Utility Classes

```css
/* Font families */
.font-display { font-family: var(--font-family-display); }
.font-ui { font-family: var(--font-family-ui); }
.font-editorial { font-family: var(--font-family-editorial); }
.font-micro { font-family: var(--font-family-micro); }
.font-mono { font-family: var(--font-family-mono); }

/* Font sizes */
.text-micro { font-size: var(--font-size-micro); }
.text-caption { font-size: var(--font-size-caption); }
.text-small { font-size: var(--font-size-small); }
.text-base { font-size: var(--font-size-base); }
.text-medium { font-size: var(--font-size-medium); }
.text-large { font-size: var(--font-size-large); }
.text-xl { font-size: var(--font-size-xl); }
.text-2xl { font-size: var(--font-size-2xl); }
.text-3xl { font-size: var(--font-size-3xl); }
.text-4xl { font-size: var(--font-size-4xl); }

/* Weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
```

### 3. Component Examples

```tsx
// Exhibition Card Component
function ExhibitionCard({ title, artist, date, description }) {
  return (
    <article className="exhibition-card">
      <h2 className="artwork-title">{title}</h2>
      <p className="artist-name">{artist}</p>
      <time className="artwork-caption">{date}</time>
      <p className="artwork-description">{description}</p>
    </article>
  );
}

// Chart Component
function DataChart({ label, value, unit }) {
  return (
    <div className="chart-item">
      <span className="chart-label">{label}</span>
      <span className="chart-value">{value}{unit}</span>
    </div>
  );
}
```

---

## Testing & Validation

### Typography Checklist

- [ ] All text meets WCAG AAA (7:1) contrast
- [ ] Minimum 16px base size for body text
- [ ] Consistent hierarchy across all breakpoints
- [ ] Font loading is optimized with `font-display: swap`
- [ ] Critical fonts are preloaded
- [ ] Line length stays within 45-75 characters for readability
- [ ] All caps text has increased letter spacing
- [ ] Text remains legible at 200% zoom
- [ ] Print styles are optimized for paper
- [ ] Screen reader announcements are properly set up

### Manual Testing Points

1. **Performance**: Fonts load without FOUT/FOIT
2. **Legibility**: Text is readable at minimum sizes
3. **Hierarchy**: Information structure is clear without color
4. **Responsiveness**: Typography scales smoothly across devices
5. **Accessibility**: Passes all contrast and zoom tests

---

## Maintenance Guide

### Updating Font Files

1. Always include WOFF2 format (best compression)
2. Provide multiple weights (300, 400, 500, 600, 700, 800)
3. Include italic variants where appropriate
4. Test font rendering across browsers and devices

### Performance Monitoring

1. Monitor Core Web Vitals (LCP, FID, CLS)
2. Check font loading times
3. Verify cumulative layout shift is minimal
4. Test on slow 3G connections

### Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Supports most features
- **Safari**: May need vendor prefixes for some features
- **IE11**: Graceful degradation with system fonts

---

## Conclusion

This typography system delivers museum-grade quality through:

- **Curated font selections** that evoke cultural institutions
- **Mathematical harmony** through modular scaling
- **Context-aware typography** for different presentation needs
- **Performance optimization** for fast, reliable loading
- **AAA accessibility** for inclusive design

**Result**: A typography system that transforms interfaces into exhibitions, data into stories, and users into connoisseurs.

---

**Next Steps**:
1. Implement font loading strategy
2. Apply typography to existing components
3. Test across all breakpoints and devices
4. Validate accessibility compliance
5. Monitor performance metrics

Remember: Typography is not just about legibility—it's about creating an experience that worthy of the walls it occupies.