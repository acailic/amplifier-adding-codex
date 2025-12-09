# Dataset Discovery API

This directory contains API endpoints for integrating with the amplifier dataset discovery functionality. These endpoints provide a bridge between the Next.js frontend and the Python dataset discovery tool.

## Endpoints

### 1. Search Datasets - `/api/datasets/search`

Search for datasets from data.gov.rs using various filters and parameters.

**Methods:** `GET`, `POST`

**Parameters:**
- `query` (string, optional): Search query term
- `category` (string, optional): Predefined category (budget, demographics, air_quality, energy, etc.)
- `page` (number, default: 1): Pagination page number
- `limit` (number, default: 20, max: 100): Number of results per page
- `organization` (string, optional): Filter by organization name
- `tag` (string, optional): Filter by tag
- `sortBy` (string, default: 'relevance'): Sort field ('relevance', 'title', 'created', 'modified', 'downloads')
- `sortOrder` (string, default: 'desc'): Sort order ('asc', 'desc')

**Example Request:**
```bash
GET /api/datasets/search?query=air quality&limit=10&sortBy=title
```

```json
POST /api/datasets/search
{
  "category": "budget",
  "page": 1,
  "limit": 20,
  "sortBy": "created",
  "sortOrder": "desc"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "budget-republic-serbia-2024",
      "title": "Budžet Republike Srbije 2024",
      "organization": "Ministarstvo finansija",
      "tags": ["budžet", "finansije", "rashodi", "prihodi"],
      "format": "CSV",
      "url": "https://data.gov.rs/datasets/budget-republic-serbia-2024",
      "description": "Godišnji budžet Republike Srbije sa detaljnom podelom rashoda i prihoda",
      "category": "budget"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "searchInfo": {
    "query": "air quality",
    "totalResults": 45,
    "searchTime": 1250
  }
}
```

### 2. Get Dataset Details - `/api/datasets/[id]`

Get detailed information about a specific dataset.

**Method:** `GET`

**Parameters:**
- `id` (string, required): Dataset identifier

**Example Request:**
```bash
GET /api/datasets/budget-republic-serbia-2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "budget-republic-serbia-2024",
    "title": "Budžet Republike Srbije 2024",
    "organization": "Ministarstvo finansija",
    "tags": ["budžet", "finansije", "rashodi", "prihodi"],
    "format": "CSV",
    "url": "https://data.gov.rs/datasets/budget-republic-serbia-2024",
    "description": "Godišnji budžet Republike Srbije sa detaljnom podelom rashoda i prihoda",
    "category": "budget",
    "created_at": "2024-01-15T10:00:00Z",
    "modified_at": "2024-02-01T14:30:00Z",
    "downloads": 1250,
    "views": 5420,
    "resources": [
      {
        "id": "res-123",
        "title": "Budžet 2024 - CSV",
        "format": "CSV",
        "url": "https://data.gov.rs/resources/budget-2024.csv",
        "size": 2048576
      }
    ]
  },
  "relatedDatasets": [
    {
      "id": "municipal-budgets-2024",
      "title": "Budžeti opština 2024",
      "organization": "Uprava za trezor",
      "format": "JSON"
    }
  ]
}
```

### 3. Get Categories - `/api/datasets/categories`

Get a list of available dataset categories with descriptions and example queries.

**Method:** `GET`

**Example Request:**
```bash
GET /api/datasets/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "budget",
      "displayName": "Буџет и финансије",
      "description": "Подаци о државном и локалним буџетима, јавним финансијама и фискалној политици",
      "keywords": ["budžet", "finansije", "prihodi", "rashodi", "javne nabavke"],
      "exampleQueries": ["budžet srbije", "javne nabavke", "finansijski izveštaj"]
    }
  ]
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Common Error Codes:

- `METHOD_NOT_ALLOWED`: HTTP method not supported
- `MISSING_ID`: Required ID parameter missing
- `INVALID_ID`: Invalid ID format
- `DATASET_NOT_FOUND`: Dataset not found
- `SEARCH_FAILED`: Search operation failed
- `FETCH_FAILED`: Failed to fetch data
- `CATEGORIES_FETCH_FAILED`: Failed to fetch categories

## Usage Examples

### Using the Dataset Service

```typescript
import { datasetService } from '../lib/dataset-service';

// Search datasets
const results = await datasetService.searchDatasets({
  query: 'air quality',
  limit: 10,
  sortBy: 'downloads',
  sortOrder: 'desc'
});

// Get specific dataset
const dataset = await datasetService.getDataset('budget-republic-serbia-2024');

// Get categories
const categories = await datasetService.getCategories();
```

### Using React Hooks

```typescript
import { useDatasets, useDataset } from '../hooks/useDatasets';

function DatasetList() {
  const { datasets, loading, error, search, loadMore } = useDatasets({
    category: 'budget',
    immediate: true
  });

  const handleSearch = (query: string) => {
    search({ query, page: 1 });
  };

  // ... render datasets
}

function DatasetDetail({ id }: { id: string }) {
  const { dataset, loading, error } = useDataset(id);

  // ... render dataset details
}
```

## Integration with Python Discovery Tool

The API endpoints integrate with the Python dataset discovery tool located in `amplifier/scenarios/dataset_discovery/`. The integration uses:

1. **Python Runner** (`lib/python-runner.ts`): Utility for executing Python scripts
2. **Type Definitions** (`types/datasets.ts`): TypeScript interfaces for all data structures
3. **Error Handling**: Graceful error handling with proper cleanup of temporary files

## Performance Considerations

- Results are cached at the Python script level
- Temporary files are automatically cleaned up
- Request timeout is set to 30 seconds
- Pagination limits are enforced (max 100 results per page)
- Search results are limited to prevent timeout issues

## Security Notes

- All input parameters are validated and sanitized
- File paths are restricted to temp directories
- Python script execution is isolated to specific scenarios directory
- Error messages are sanitized to prevent information disclosure