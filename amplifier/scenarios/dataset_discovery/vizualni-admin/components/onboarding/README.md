# DatasetBrowser Component

A powerful React component for browsing and discovering datasets from data.gov.rs with real-time search, filtering, and pagination capabilities.

## Features

- 🔍 **Real-time Search**: Debounced search with instant results dropdown
- 🏷️ **Category Filtering**: Dynamic category loading and filtering
- 📄 **Pagination**: Load more results or navigate with pagination controls
- 🔄 **Sorting**: Sort by relevance, title, creation date, modification date, or downloads
- 🇷🇸 **Serbian Language Support**: Full support for Serbian (Latin and Cyrillic scripts)
- ♿ **Accessibility**: WCAG compliant with keyboard navigation and ARIA labels
- 📱 **Responsive Design**: Mobile-friendly with touch-optimized interactions
- 🎨 **View Modes**: Switch between grid and list layouts
- 🎯 **TypeScript**: Full type safety with proper type definitions
- 🚀 **Performance Optimized**: Efficient data fetching and rendering

## Installation

The component is part of the vizualni-admin project. Make sure you have the required dependencies:

```bash
npm install next-i18next clsx lucide-react
# or
yarn add next-i18next clsx lucide-react
```

## Basic Usage

```tsx
import DatasetBrowser from '@/components/onboarding/DatasetBrowser';
import { Dataset } from '@/types/datasets';

function MyPage() {
  const handleDatasetSelect = (dataset: Dataset) => {
    // Handle dataset selection
    console.log('Selected:', dataset);
    // Navigate to detail page, open modal, etc.
  };

  return (
    <DatasetBrowser
      onDatasetSelect={handleDatasetSelect}
      pageSize={20}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialQuery` | `string` | `''` | Initial search query |
| `initialCategory` | `string` | `''` | Initial category filter |
| `pageSize` | `number` | `20` | Number of datasets per page |
| `showSearch` | `boolean` | `true` | Show/hide search functionality |
| `showCategories` | `boolean` | `true` | Show/hide category filter |
| `showPagination` | `boolean` | `true` | Show/hide pagination controls |
| `className` | `string` | `''` | Additional CSS classes |
| `onDatasetSelect` | `(dataset: Dataset) => void` | `undefined` | Callback when dataset is selected |

## Advanced Usage

### With Initial Filters

```tsx
<DatasetBrowser
  initialQuery="budžet"
  initialCategory="Finansije"
  pageSize={12}
  onDatasetSelect={handleDatasetSelect}
/>
```

### Minimal Configuration

```tsx
<DatasetBrowser
  showSearch={false}
  showCategories={false}
  showPagination={false}
  pageSize={10}
/>
```

### Custom Styling

```tsx
<DatasetBrowser
  className="my-custom-browser"
  onDatasetSelect={handleDatasetSelect}
/>

<style jsx>{`
  .my-custom-browser {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
  }
`}</style>
```

## Data Structure

The component works with the following TypeScript interfaces:

```tsx
interface Dataset {
  id: string;
  title: string;
  organization: string;
  tags: string[];
  format: string;
  url: string;
  description?: string;
  category?: string;
  created_at?: string;
  modified_at?: string;
  downloads?: number;
  views?: number;
  resources?: DatasetResource[];
}

interface DatasetResource {
  id: string;
  title: string;
  format: string;
  url: string;
  size?: number;
  created_at?: string;
  modified_at?: string;
}
```

## Integration with API Endpoints

The component uses the following hooks which connect to your API:

- `useDatasets`: Main dataset fetching with pagination and filtering
- `useDataset`: Individual dataset fetching
- `useCategories`: Category list fetching
- `useDatasetSearch`: Debounced search functionality

Make sure your API endpoints match the expected format:

```
GET /api/datasets/search?query=...&category=...&page=...&limit=...
GET /api/datasets/:id
GET /api/datasets/categories
```

## Internationalization

The component supports Serbian and English languages. Translation files:

- `/public/locales/sr/datasets.json` - Serbian translations
- `/public/locales/en/datasets.json` - English translations

Key translation keys:

```json
{
  "datasets": {
    "title": "Skupovi podataka",
    "searchPlaceholder": "Pretražite skupove podataka...",
    "noDatasetsTitle": "Nema pronađenih skupova podataka",
    // ...
  }
}
```

## Examples in the Project

1. **Main Datasets Page**: `/pages/datasets/index.tsx`
   - Full-featured implementation with all options enabled

2. **Dataset Detail Page**: `/pages/datasets/[id].tsx`
   - Individual dataset view with download options

3. **Demo Page**: `/pages/demo/dataset-browser.tsx`
   - Interactive demo showing different configurations

4. **Navigation Integration**: Added to main sidebar navigation

## Styling

The component uses Tailwind CSS classes and follows the project's design system:

- **Colors**: Uses Serbian-themed colors (`serbia-red`, `serbia-blue`, `serbia-green`)
- **Spacing**: Consistent 8px grid system
- **Typography**: Responsive text sizes
- **Animations**: Smooth transitions with 300ms timing
- **Breakpoints**: Mobile-first responsive design

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with tab indices
- **ARIA Labels**: Proper ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Screen Reader**: Semantic HTML structure
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Supports high contrast mode

## Performance Considerations

- **Debounced Search**: 300ms debounce to reduce API calls
- **Virtual Pagination**: Only loads visible data
- **Memoization**: React.memo for expensive renders
- **Lazy Loading**: Images and content load as needed
- **Optimized Re-renders**: Proper dependency arrays in hooks

## Testing

The component is designed to be testable:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import DatasetBrowser from '@/components/onboarding/DatasetBrowser';

test('renders search input', () => {
  render(<DatasetBrowser />);
  expect(screen.getByPlaceholderText('Pretražite skupove podataka...')).toBeInTheDocument();
});

test('calls onDatasetSelect when dataset is clicked', () => {
  const mockSelect = jest.fn();
  render(<DatasetBrowser onDatasetSelect={mockSelect} />);

  // Mock dataset data and simulate click
  // ...

  expect(mockSelect).toHaveBeenCalledWith(expectedDataset);
});
```

## Troubleshooting

### Common Issues

1. **No data showing**: Check API endpoints are running and returning correct format
2. **Search not working**: Verify debouncing and API query parameters
3. **Pagination issues**: Check `totalPages` calculation in API response
4. **Translation missing**: Ensure all keys are present in translation files

### Debug Mode

Add debug props to see internal state:

```tsx
<DatasetBrowser
  debug={true}  // Shows console logs for debugging
  onDatasetSelect={handleDatasetSelect}
/>
```

## Contributing

When modifying the component:

1. Follow the existing TypeScript interfaces
2. Maintain accessibility standards
3. Test with screen readers
4. Verify responsive design
5. Update translations if adding new text
6. Add comprehensive error handling
7. Consider performance implications

## License

This component is part of the vizualni-admin project and follows the same license terms.