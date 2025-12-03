# Enhanced Data Visualization Components

World-class, accessible, and performant React chart components with Serbian cultural context and data storytelling capabilities.

## Overview

This library provides a comprehensive suite of enhanced data visualization components specifically designed for Serbian data with world-class quality, accessibility, and user experience.

### Key Features

- 🇷🇸 **Serbian Context**: Full Serbian language support, RSD currency formatting, and culturally relevant data
- ♿ **Accessibility First**: WCAG 2.1 AA compliance with screen reader support and keyboard navigation
- ⚡ **High Performance**: Optimized rendering with lazy loading and virtualization support
- 🎨 **World-Class Design**: Premium visual design with Serbian color palette and smooth animations
- 📱 **Responsive**: Mobile-first design that works perfectly on all devices
- 🔧 **Developer Friendly**: Full TypeScript support with comprehensive documentation
- 📊 **Data Storytelling**: Interactive legends, progressive disclosure, and data export capabilities

## Components

### 1. Enhanced Air Quality Chart (`EnhancedAirQualityChart`)

Advanced air quality visualization for Serbian cities with real-time AQI monitoring and health recommendations.

**Features:**
- Real-time AQI monitoring for major Serbian cities
- Multi-pollutant radar analysis
- Historical trend analysis with predictions
- Serbian AQI categories with health recommendations
- Interactive city selection and filtering
- Export capabilities (PNG, SVG, CSV)

```tsx
import { EnhancedAirQualityChart } from './enhanced-air-quality-chart';

<EnhancedAirQualityChart
  data={airQualityData}
  historicalData={historicalData}
  type="cityComparison"
  onCitySelect={handleCitySelect}
  onExport={handleExport}
  language="sr"
/>
```

### 2. Enhanced Demographics Chart (`EnhancedDemographicsChart`)

Comprehensive demographic analysis with population pyramids, regional comparisons, and migration trends.

**Features:**
- Population pyramid with Serbian age groups
- Regional demographic comparison
- Migration and urbanization trends
- Serbian municipality and regional data
- Interactive filtering and exploration
- Demographic insights and metrics

```tsx
import { EnhancedDemographicsChart } from './enhanced-demographics-chart';

<EnhancedDemographicsChart
  populationData={populationData}
  ageGroupData={ageGroups}
  regionData={regions}
  type="populationPyramid"
  onRegionSelect={handleRegionSelect}
  language="sr"
/>
```

### 3. Enhanced Budget Chart (`EnhancedBudgetChart`)

Advanced Serbian budget visualization with fiscal transparency and budget category analysis.

**Features:**
- Serbian national and regional budget breakdown
- Treasury and spending analysis
- Revenue vs expenditure comparisons
- Historical budget trends and forecasts
- RSD currency formatting
- Interactive budget category exploration

```tsx
import { EnhancedBudgetChart } from './enhanced-budget-chart';

<EnhancedBudgetChart
  currentBudget={budgetData}
  categories={budgetCategories}
  type="overview"
  onCategorySelect={handleCategorySelect}
  onExport={handleExport}
  language="sr"
/>
```

### 4. Enhanced Energy Chart (`EnhancedEnergyChart`)

Comprehensive energy analysis with renewable transition tracking and sustainability insights.

**Features:**
- Energy production and consumption analysis
- Renewable energy transition tracking
- Carbon footprint and emissions monitoring
- Serbian energy infrastructure visualization
- EU Green Deal alignment metrics
- Energy security indicators

```tsx
import { EnhancedEnergyChart } from './enhanced-energy-chart';

<EnhancedEnergyChart
  overview={energyOverview}
  energySources={energySources}
  type="overview"
  onSourceSelect={handleSourceSelect}
  onTimeRangeChange={handleTimeRangeChange}
  language="sr"
/>
```

## Installation

```bash
npm install framer-motion recharts
```

## Dependencies

- **React 18+**: Modern React with hooks support
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Powerful charting library
- **TypeScript**: Full type safety and IntelliSense

## Serbian Cultural Context

### Color Palette

The components use a carefully selected Serbian color palette:

```typescript
export const SERBIAN_COLORS = {
  primary: '#C6363C',    // Serbian Red
  secondary: '#0C4076',  // Serbian Blue
  success: '#115740',    // Serbian Green
  warning: '#D4AF37',    // Gold
  danger: '#DC2626',     // Enhanced Red
  info: '#3B82F6',       // Enhanced Blue
  neutral: '#6B7280',    // Gray
  background: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB'
} as const;
```

### Language Support

Full Serbian language support with:
- Complete translations for all UI elements
- Serbian date and number formatting
- RSD (Serbian Dinar) currency formatting
- Cultural context for data interpretation

## Accessibility

All components are built with accessibility as a primary concern:

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: Full keyboard support with tab indices and focus management
- **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- **Color Contrast**: Minimum 4.5:1 contrast ratio for all text
- **Reduced Motion**: Respects `prefers-reduced-motion` settings
- **High Contrast Mode**: Supports high contrast system preferences

### Implementation

```typescript
// Accessible chart implementation
<div
  role="img"
  aria-label={generateAriaLabel('Kvalitet vazduha', data, 'Poređenje AQI indeksa gradova')}
  tabIndex={accessible ? 0 : undefined}
>
  {/* Chart content */}
</div>
```

## Performance

### Optimizations

- **Lazy Loading**: Components support code splitting and lazy loading
- **Virtualization**: Ready for large datasets with virtualized rendering
- **Memoization**: Strategic use of React.memo and useMemo
- **Debounced Interactions**: Optimized hover and resize handlers
- **Efficient Re-renders**: Minimal unnecessary re-renders

### Animation Performance

- **300ms Timing**: Consistent animation duration following human perception research
- **Spring Easing**: Natural-feeling animations with cubic-bezier curves
- **GPU Acceleration**: Hardware-accelerated transforms and opacity changes
- **Reduced Motion**: Automatic detection and accommodation of user preferences

```typescript
export const CHART_ANIMATIONS = {
  duration: 300,
  easing: [0.34, 1.56, 0.64, 1], // Spring easing
  stagger: 0.05,
  delay: 0.1
} as const;
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
interface EnhancedAirQualityChartProps {
  data: AirQualityData[];
  type?: 'cityComparison' | 'pollutantRadar' | 'historicalTrend';
  onCitySelect?: (city: string) => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  animated?: boolean;
  accessible?: boolean;
  language?: 'sr' | 'en';
}
```

## Data Storytelling

### Progressive Disclosure

Information is revealed progressively to avoid overwhelming users:

1. **Overview**: High-level metrics and key insights first
2. **Details**: Detailed breakdowns on demand
3. **Context**: Historical trends and comparisons
4. **Actions**: Interactive filtering and exploration

### Interactive Legends

```typescript
<InteractiveLegend
  items={legendItems}
  activeItems={activeItems}
  onToggle={handleToggle}
  serbian={true}
/>
```

### Export Capabilities

All charts support multiple export formats:

- **PNG**: High-quality raster images
- **SVG**: Vector graphics for print
- **CSV**: Raw data for analysis

```typescript
const handleExport = async (format: 'png' | 'svg' | 'csv') => {
  // Export implementation
};
```

## Responsive Design

### Mobile-First Approach

- **Touch Targets**: Minimum 44×44px touch targets
- **Readable Text**: Appropriate font sizes and contrast
- **Navigation**: Thumb-friendly navigation patterns
- **Performance**: Optimized for mobile networks

### Breakpoints

```css
/* Mobile first responsive design */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

## Customization

### Theme Support

Components support light/dark theme switching:

```typescript
interface ChartProps {
  theme?: 'light' | 'dark';
  // ... other props
}
```

### Custom Colors

Override the default Serbian color palette:

```typescript
const customColors = {
  primary: '#custom-red',
  secondary: '#custom-blue',
  // ... other colors
};
```

### Animation Control

Control animations for performance or accessibility:

```typescript
<EnhancedChart
  animated={userPrefersMotion}
  accessible={true}
/>
```

## Data Validation

Built-in data validation ensures reliability:

```typescript
export const validateChartData = (data: any[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false;

  return data.every(item =>
    item !== null &&
    typeof item === 'object' &&
    !Array.isArray(item)
  );
};
```

## Error Handling

Comprehensive error handling with fallback states:

- **Loading States**: Skeleton loaders during data fetching
- **Error States**: User-friendly error messages with retry options
- **Empty States**: Helpful messages when no data is available
- **Validation**: Input validation with clear error messages

## Testing

### Accessibility Testing

- **Screen Readers**: Tested with NVDA, VoiceOver, and JAWS
- **Keyboard Navigation**: Full keyboard accessibility verified
- **Color Contrast**: Automated contrast checking
- **Reduced Motion**: Animation reduction testing

### Performance Testing

- **Bundle Size**: Optimized for minimal bundle impact
- **Rendering**: Large dataset performance testing
- **Memory Usage**: Memory leak prevention
- **Animation**: Smooth 60fps animations on all devices

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Contributing

### Development Setup

```bash
git clone <repository>
cd enhanced-charts
npm install
npm run dev
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for accessibility
- **Prettier**: Consistent formatting
- **Husky**: Pre-commit hooks

### Testing Requirements

- **Unit Tests**: 90% coverage minimum
- **Integration Tests**: Key user flows
- **Accessibility Tests**: Automated a11y testing
- **Performance Tests**: Bundle size and rendering

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review examples in the demo

## Roadmap

### Upcoming Features

- [ ] **Additional Chart Types**: Sankey diagrams, network graphs
- [ ] **Advanced Animations**: Page transitions, choreographed sequences
- [ ] **Data Visualization Builder**: Drag-and-drop chart builder
- [ ] **Real-time Updates**: WebSocket integration for live data
- [ ] **Advanced Export**: PowerPoint, Excel, PDF export
- [ ] **AI Integration**: Automated insights and recommendations

### Version History

**v1.0.0** (Current)
- Initial release with core components
- Serbian cultural context and accessibility
- Performance optimizations
- Comprehensive documentation

---

Built with ❤️ for Serbia, following world-class standards for accessibility, performance, and user experience.