# Vizualni Admin Architecture Documentation
# Документација архитектуре Визуелни Админ

## Overview (Преглед)

The vizualni-admin project has been completely restructured to follow modern React architecture patterns with feature-based organization, centralized state management, and comprehensive error handling.

## Directory Structure (Структура директоријума)

```
src/
├── app/                          # App-level components and configuration
│   ├── error-boundaries/         # Error boundary components
│   ├── layout/                   # Layout components (AppLayout, Sidebar, etc.)
│   └── providers/                # React providers (AppProviders with QueryClient)
├── features/                     # Feature-based organization
│   ├── forms/                    # Form-related components
│   │   ├── FormFeatureWrapper.tsx
│   │   ├── SerbianTextInput.tsx
│   │   └── index.ts
│   ├── data-validation/          # Data validation components
│   │   ├── DataValidationFeatureWrapper.tsx
│   │   ├── SerbianDataValidator.tsx
│   │   ├── compliance/           # Serbian data standards compliance
│   │   └── index.ts
│   ├── charts/                   # Chart components (future)
│   ├── dashboard/                # Dashboard components (future)
│   ├── configurator/             # Configurator components (future)
│   └── user-management/          # User management components (future)
├── shared/                       # Shared resources across features
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API services and utilities
│   ├── stores/                   # Zustand state management
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   └── index.ts
├── styles/                       # Global styles
├── fonts/                        # Font files
└── index.ts                      # Main export file
```

## Key Architectural Decisions (Кључне архитектонске одлуке)

### 1. Feature-Based Organization (Организација по функционалностима)

**Why:** Clear separation of concerns, better scalability, easier team collaboration.

**Implementation:**
- Each feature is a self-contained module
- Features have their own components, hooks, and business logic
- Shared resources live in the `shared/` directory
- Feature wrappers provide error boundaries and context

### 2. Centralized API Client (Централизован API клијент)

**Why:** Consistent error handling, request/response interceptors, better caching and retry logic.

**Features:**
- Automatic authentication token injection
- Comprehensive error handling with Serbian language messages
- Request/response logging for debugging
- Retry logic with exponential backoff
- Automatic redirect on authentication errors

**Usage:**
```typescript
import { api, useApiQuery, useApiMutation } from '@/shared/services/api-client';

// Direct API calls
const response = await api.get('/users');

// React Query integration
const { data, error, loading } = useApiQuery({
  endpoint: '/users',
  queryKey: ['users'],
  loadingKey: 'users',
});
```

### 3. State Management (Управљање стањем)

**Zustand for Global State:**
- UI state (sidebar, theme, language)
- User state and authentication
- Notifications and loading states
- Error state management

**React Query for Server State:**
- API data caching and synchronization
- Background updates and invalidation
- Optimistic updates
- Pagination and infinite queries

**Usage:**
```typescript
// Zustand store
const { user, setUser, theme, setTheme } = useAppStore();

// React Query
const { data: users } = useApiQuery({
  endpoint: '/users',
  queryKey: ['users'],
});
```

### 4. Structured Error Handling (Структурирано руковање грешкама)

**Global Error Boundary:**
- Catches all unhandled React errors
- Provides user-friendly error messages in Serbian
- Includes development mode details
- Offers recovery options (reload, go home)

**Feature Error Boundaries:**
- Isolated error handling per feature
- Feature-specific recovery options
- Retry functionality with attempt limits
- Detailed logging for debugging

**API Error Handling:**
- Centralized error processing
- Serbian language error messages
- Automatic error notification system
- Contextual error information

### 5. Logging System (Систем логирања)

**Structured Logging:**
- Multiple log levels (DEBUG, INFO, WARN, ERROR)
- Context information (feature, user, session)
- Performance monitoring
- Remote logging capabilities
- Automatic log buffering and flushing

**Usage:**
```typescript
import { logger } from '@/shared/utils/logger';

logger.featureInfo('dashboard', 'User loaded data', { userId: '123' });
logger.error('API request failed', error, { endpoint: '/users' });
```

## Performance Optimizations (Оптимизација перформанси)

### 1. Code Splitting (Раздела кода)
- Feature-based lazy loading
- Dynamic imports for large components
- Route-based code splitting

### 2. Query Optimization (Оптимизација упита)
- Intelligent caching strategies
- Background refetching
- Request deduplication
- Pagination support

### 3. Bundle Optimization (Оптимизација пакета)
- Tree shaking for unused code
- Proper import/export patterns
- Minimal bundle size

## Security Considerations (Безбедносне предострожности)

### 1. Authentication (Аутентификација)
- JWT token management
- Automatic token refresh
- Secure storage mechanisms

### 2. Data Validation (Валидација података)
- Serbian data standards compliance
- Input sanitization
- XSS protection

### 3. Error Information (Информације о грешкама)
- No sensitive data in error messages
- Production vs development error details
- Secure error logging

## Serbian Language Support (Подршка за српски језик)

### 1. Internationalization (Интернационализација)
- Lingui integration for translations
- Cyrillic and Latin script support
- Dynamic language switching

### 2. Localization (Локализација)
- Serbian number formatting
- Date and time formatting
- Currency formatting

### 3. Script Detection (Детекција скрипте)
- Automatic Cyrillic/Latin detection
- Script conversion utilities
- Mixed script handling

## Testing Strategy (Стратегија тестирања)

### 1. Unit Tests (Јединични тестови)
- Component testing with React Testing Library
- Hook testing with custom utilities
- Utility function testing

### 2. Integration Tests (Интеграциони тестови)
- API client testing with mock servers
- State management testing
- Feature integration testing

### 3. E2E Tests (Е2Е тестови)
- Critical user journey testing
- Cross-browser compatibility
- Performance testing

## Development Workflow (Развојни ток рада)

### 1. Feature Development (Развој функционалности)
1. Create feature directory under `src/features/`
2. Implement components with feature wrapper
3. Add hooks and business logic
4. Update exports and index files
5. Add comprehensive error handling

### 2. Code Quality (Квалитет кода)
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Husky for pre-commit hooks

### 3. Documentation (Документација)
- JSDoc comments for all public APIs
- README for each feature
- Architecture decision records
- User guides and examples

## Migration Guide (Водич за миграцију)

### From Old Architecture:
1. **Components**: Move to appropriate feature directories
2. **State**: Replace Context API with Zustand
3. **API Calls**: Replace fetch with centralized API client
4. **Error Handling**: Wrap features with error boundaries
5. **Styling**: Replace makeStyles with styled components or Tailwind

### Import Path Updates:
```typescript
// Old
import { SerbianTextInput } from './components/SerbianTextInput';

// New
import { SerbianTextInput } from './features/forms';
```

## Future Enhancements (Будућа побољшања)

### 1. Real-time Features (Реалне функционалности)
- WebSocket integration
- Live data updates
- Real-time collaboration

### 2. Advanced Charts (Напредни графикони)
- Interactive visualizations
- D3.js integration
- Custom chart types

### 3. Performance Monitoring (Надзор перформанси)
- Real-user monitoring
- Performance budgets
- Automated performance testing

### 4. Accessibility (Приступачност)
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation

## Best Practices (Најбоље праксе)

### 1. Component Design (Дизајн компоненти)
- Single responsibility principle
- Clear prop interfaces
- Comprehensive error boundaries
- Accessibility first

### 2. State Management (Управљање стањем)
- Separate UI and server state
- Use derived state when possible
- Implement proper loading and error states
- Consistent state updates

### 3. API Integration (API интеграција)
- Use centralized API client
- Implement proper error handling
- Cache strategically
- Handle offline scenarios

### 4. Error Handling (Руковање грешкама)
- Graceful degradation
- User-friendly error messages
- Comprehensive logging
- Recovery mechanisms

---

This architecture provides a solid foundation for building scalable, maintainable, and user-friendly applications with excellent Serbian language support.