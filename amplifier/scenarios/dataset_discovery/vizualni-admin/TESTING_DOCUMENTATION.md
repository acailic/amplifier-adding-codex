# Testing Infrastructure Documentation

This document outlines the comprehensive testing infrastructure implemented for the vizualni-admin dashboard to ensure world-class quality while supporting Serbian language and cultural features.

## Overview

The testing infrastructure follows the testing pyramid principle:
- **60% Unit Tests**: Fast, isolated tests for individual components and functions
- **30% Integration Tests**: Component interaction and API integration tests
- **10% E2E Tests**: Critical user journey tests

## Setup and Configuration

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Unit tests
npm test                    # Run all unit tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run with coverage report
npm run test:ci           # Run tests for CI (single run)

# E2E tests
npm run test:e2e          # Run all E2E tests
npm run test:e2e:headed   # Run E2E tests with visible browser
npm run test:visual       # Run visual regression tests

# Accessibility tests
npm run test:accessibility # Run accessibility-specific tests

# Storybook
npm run storybook         # Start Storybook for component development
npm run build-storybook   # Build Storybook for deployment
```

## Testing Frameworks

### 1. Unit Testing (Jest + React Testing Library)

**Configuration**: `jest.config.js`, `jest.setup.js`

**Features**:
- TypeScript support with `ts-jest`
- React Testing Library for component testing
- Mock implementations for Next.js, Recharts, and Lucide icons
- Coverage thresholds set to 90%
- Serbian language testing utilities

**File Structure**:
```
__tests__/
├── utils/
│   └── test-utils.tsx      # Common testing utilities and mocks
├── components/
│   ├── Header.test.tsx     # Header component tests
│   ├── DemographicsChart.test.tsx
│   └── ...
```

### 2. Accessibility Testing (axe-core)

**Integration**: Integrated into both unit tests and E2E tests

**Features**:
- WCAG 2.1 AA compliance checks
- Serbian language-specific accessibility rules
- Screen reader testing
- Keyboard navigation testing
- Color contrast validation

**Accessibility Test Rules**:
- Serbian language attributes (`lang="sr"`)
- Proper ARIA labels in Serbian
- Keyboard navigation for Cyrillic text
- Focus management
- Screen reader announcements

### 3. Component Documentation (Storybook)

**Configuration**: `.storybook/main.ts`, `.storybook/preview.ts`

**Features**:
- Serbian language support
- Multiple viewport testing
- Dark mode support
- Interactive component playground
- Accessibility testing integration

**Stories Structure**:
```
stories/
├── Header.stories.tsx       # Header component stories
├── DemographicsChart.stories.tsx
└── ...
```

### 4. E2E Testing (Playwright)

**Configuration**: `playwright.config.ts`

**Features**:
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile responsive testing
- Visual regression testing
- Serbian localization testing
- Accessibility E2E testing

**E2E Test Structure**:
```
e2e/
├── accessibility.spec.ts          # Accessibility E2E tests
├── serbian-localization.spec.ts    # Serbian language tests
├── visual-regression.spec.ts       # Visual regression tests
├── global-setup.ts                # Test environment setup
└── global-teardown.ts             # Test environment cleanup
```

## Serbian Language Testing

### Text Rendering Tests

Tests ensure proper rendering of Serbian Cyrillic characters:

```typescript
// Check for Serbian Cyrillic characters
await expect(page.locator('body')).toContainText(/[А-Ша-ш]/)

// Test specific Serbian phrases
const serbianPhrases = [
  'контролна табла',
  'визуелни администратор',
  'демографија',
  'буџет',
]
```

### Number Formatting Tests

Validates Serbian number formatting (dot as thousands separator):

```typescript
const serbianNumberFormat = /\d{1,3}(?:\.\d{3})*(?:,\d{2})?/
```

### Date Formatting Tests

Ensures proper Serbian date formatting:

```typescript
const serbianDateFormat = /\d{1,2}\.\d{1,2}\.\d{4}/
const serbianMonths = /(јануар|фебруар|март|...)/i
```

### Language Switching Tests

Tests functionality for switching between:
- Serbian Cyrillic (`sr`)
- Serbian Latin (`sr-Latn`)
- English (`en`)

## Visual Regression Testing

### Screenshot Testing

Automated visual tests ensure UI consistency:

```typescript
await expect(page).toHaveScreenshot('homepage-full.png', {
  fullPage: true,
  animations: 'disabled',
  caret: 'hide',
})
```

### Responsive Testing

Tests across different viewports:
- Mobile: 375x667
- Tablet: 768x1024
- Desktop: 1920x1080

### State Testing

Tests different UI states:
- Loading states
- Error states
- Interactive states (hover, focus)
- Dark mode
- Print styles

## Accessibility Testing

### Automated Tests

Comprehensive accessibility checks using axe-core:

```typescript
await checkA11y(page, {
  detailedReport: true,
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'aria-labels': { enabled: true },
  },
})
```

### Manual Testing Guidelines

1. **Keyboard Navigation**: Test all functionality using only keyboard
2. **Screen Reader**: Test with screen readers (NVDA, JAWS, VoiceOver)
3. **Color Contrast**: Verify WCAG AA compliance
4. **Focus Management**: Ensure proper focus indicators and logical tab order
5. **Serbian Support**: Verify screen reader properly announces Serbian text

## Performance Testing

### Lighthouse CI

Automated performance audits:

```json
{
  "assertions": {
    "categories:performance": ["warn", {"minScore": 0.8}],
    "categories:accessibility": ["error", {"minScore": 0.9}],
    "categories:best-practices": ["warn", {"minScore": 0.8}],
    "categories:seo": ["warn", {"minScore": 0.8}]
  }
}
```

### Bundle Size Analysis

Monitors JavaScript bundle sizes:

```json
{
  "files": [
    {
      "path": ".next/static/chunks/*.js",
      "maxSize": "200kb"
    }
  ]
}
```

## Quality Gates

### CI/CD Pipeline

Automated quality checks on every push and PR:

1. **Unit Tests**: 90% coverage threshold
2. **Accessibility Tests**: WCAG 2.1 AA compliance
3. **Visual Regression**: UI consistency checks
4. **Serbian Localization**: Language functionality tests
5. **Security Audit**: Dependency vulnerability scans
6. **Performance Tests**: Lighthouse performance scores

### Coverage Requirements

All code must maintain:
- **Lines**: 90% minimum
- **Functions**: 90% minimum
- **Branches**: 90% minimum
- **Statements**: 90% minimum

## Test Data

### Serbian Test Data

Predefined test data for Serbian features:

```typescript
export const serbianTestData = {
  regions: [
    { id: 1, name: 'Београд', population: 1680000, budget: 1500000000 },
    { id: 2, name: 'Војводина', population: 1950000, budget: 1200000000 },
    // ...
  ],
  airQuality: [
    { city: 'Београд', aqi: 85, pm25: 25.3, status: 'умерено' },
    // ...
  ],
}
```

### Mock Services

Mock implementations for external services:
- API endpoints
- Authentication
- File uploads
- External integrations

## Best Practices

### Writing Tests

1. **Test User Behavior**: Test what users do, not implementation details
2. **Serbian First**: Write tests with Serbian language as default
3. **Accessibility First**: Include accessibility tests in every component
4. **Use Test Utilities**: Leverage provided testing utilities for consistency
5. **Descriptive Tests**: Use clear, descriptive test names in Serbian when appropriate

### Test Organization

1. **Co-location**: Keep tests close to the code they test
2. **Shared Utilities**: Use common testing utilities for consistency
3. **Environment Setup**: Use proper test environment setup and teardown
4. **Data Management**: Use consistent test data and cleanup procedures

### Performance Considerations

1. **Parallel Execution**: Configure tests to run in parallel
2. **Efficient Selectors**: Use efficient and stable selectors
3. **Minimal Overhead**: Avoid unnecessary browser operations
4. **Resource Cleanup**: Proper cleanup after each test

## Troubleshooting

### Common Issues

1. **Font Rendering**: Serbian fonts may render differently in test environment
2. **Test Isolation**: Ensure tests don't interfere with each other
3. **Timing Issues**: Use proper wait strategies for dynamic content
4. **Environment Differences**: Account for CI/CD environment differences

### Debugging

1. **Test Debugging**: Use Playwright's debugging tools for E2E tests
2. **Visual Debugging**: Compare screenshots for visual regression failures
3. **Accessibility Debugging**: Use axe-core's detailed violation reports
4. **Performance Debugging**: Use Lighthouse reports for performance issues

## Integration with Development Workflow

### Pre-commit Hooks

Run fast tests before commits:
```bash
npm run lint
npm run type-check
npm test -- --passWithNoTests
```

### Pre-push Hooks

Run comprehensive tests before pushing:
```bash
npm run test:coverage
npm run test:accessibility
```

### IDE Integration

Configure IDE for optimal testing experience:
- Jest integration for unit tests
- Playwright integration for E2E tests
- ESLint integration for code quality
- TypeScript integration for type safety

## Future Enhancements

### Planned Improvements

1. **AI-Powered Testing**: Implement AI-generated test cases
2. **Visual Testing Platform**: Integrate with professional visual testing service
3. **Performance Monitoring**: Add real-world performance monitoring
4. **Cross-Browser Testing**: Expand browser support matrix
5. **Mobile App Testing**: Add mobile app testing capabilities

### Metrics and Monitoring

1. **Test Metrics**: Track test execution time and reliability
2. **Coverage Trends**: Monitor coverage trends over time
3. **Accessibility Compliance**: Track accessibility compliance metrics
4. **Performance Benchmarks**: Monitor performance score trends

## Conclusion

This comprehensive testing infrastructure ensures the vizualni-admin dashboard maintains world-class quality while providing excellent Serbian language support. The combination of unit tests, integration tests, E2E tests, accessibility tests, and visual regression tests provides multiple layers of quality assurance.

The Serbian-specific testing approach ensures that language features, cultural nuances, and accessibility requirements are thoroughly validated, providing a robust foundation for a high-quality Serbian data visualization dashboard.