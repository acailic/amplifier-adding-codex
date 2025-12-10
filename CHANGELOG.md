# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-12-10

### Added
- 🆕 Price analytics dashboard with real-time alerts
- 📊 Enhanced chart components with forecasting capabilities
- 🎨 New visualization types:
  - Price volatility charts
  - Retailer comparison radar charts
  - Price scatter plots
  - Market share treemaps
- 🔍 Advanced filtering component with category and brand filters
- 🌍 Full Serbian language support (Latin and Cyrillic scripts)
- 📱 Mobile-responsive design with Tailwind CSS
- 🔧 TypeScript support with comprehensive type definitions
- 📚 Complete documentation and examples

### Changed
- ♻️ Refactored component structure for better modularity
- 🎯 Improved performance with optimized re-renders
- 🔄 Updated dependencies to latest stable versions

### Fixed
- 🐛 Fixed price calculation issues in comparison charts
- 🎨 Resolved styling inconsistencies across components
- 📉 Fixed discount percentage calculations

## [1.1.0] - 2024-11-15

### Added
- 📈 Simple price trend charts
- 📊 Price comparison bar charts
- 🥧 Discount analysis pie charts
- 🗺️ Price heatmaps for category/brand analysis
- 📦 Initial npm package structure

### Changed
- 🏗️ Migrated from internal components to publishable package
- 📝 Added TypeScript definitions

## [1.0.0] - 2024-10-01

### Added
- 🎉 Initial release of vizualni-admin dashboard
- 📊 Basic price visualization components
- 🇷🇸 Serbian market specific features
- 🎨 Tailwind CSS styling

---

## Version Summary

- **v1.2.x** - Feature releases (new components, enhanced functionality)
- **v1.1.x** - Feature releases (new chart types, improvements)
- **v1.0.x** - Major stable releases

## Migration Guide

### From v1.1 to v1.2

No breaking changes. All v1.1 components remain compatible.

### From v1.0 to v1.1

If you were using internal imports:
```tsx
// Old
import PriceDashboard from '../components/price-dashboard-wrapper';

// New
import { PriceDashboardWrapper } from '@acailic/vizualni-admin';
```

## Planned Features (Roadmap)

### v1.3.0
- [ ] Real-time data streaming support
- [ ] Export functionality (CSV, PDF, Excel)
- [ ] Dark theme support
- [ ] Additional chart types (Gantt, Funnel, Sankey)

### v1.4.0
- [ ] WebSocket integration for live updates
- [ ] Custom plugin system
- [ ] Advanced analytics formulas
- [ ] Multi-language support expansion

### v2.0.0
- [ ] React Server Components support
- [ ] Vue.js version
- [ ] Angular version
- [ ] Standalone analytics engine