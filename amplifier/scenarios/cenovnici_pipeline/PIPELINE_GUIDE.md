# Cenovnici Pipeline Guide

## Overview

The cenovnici pipeline is a comprehensive data processing system that:
- Fetches price list data from 27+ Serbian retailers
- Transforms raw CSV/Excel data to vizualni-admin compatible format
- Generates insights about prices, discounts, and trends
- Outputs structured data for visualization

## Architecture

### Module Structure

```
cenovnici_pipeline/
├── core/
│   ├── __init__.py
│   └── models.py          # Pydantic data models
├── config/
│   ├── __init__.py
│   └── settings.py        # Configuration management
├── fetchers/
│   ├── __init__.py
│   └── data_fetcher.py    # Fetch data from retailers
├── transformers/
│   ├── __init__.py
│   └── data_transformer.py # Transform to vizualni-admin format
├── generators/
│   ├── __init__.py
│   └── sample_generator.py # Generate samples and insights
├── analyzers/             # Reserved for future analytics modules
├── utils/                 # Reserved for utility modules
├── types.ts               # TypeScript interfaces
├── main.py                # Pipeline orchestration
└── README.md              # This file
```

### Data Flow

```
Raw Cenovnici Data (CSV/Excel)
    ↓
DataFetcher
    ↓
RawCenovnikRecord[]
    ↓
DataTransformer
    ↓
TransformedProduct[]
    ↓
Insights Generation
    ↓
{ discounts, trends, analytics }
    ↓
JSON Files (vizualni-admin format)
```

## Quick Start

### 1. Generate Sample Data

```bash
# Generate 1000 sample products
python -m amplifier.scenarios.cenovnici_pipeline.main --sample-only --products 1000
```

### 2. Run Full Pipeline

```bash
# Process all retailer data
python -m amplifier.scenarios.cenovnici_pipeline.main

# With verbose logging
python -m amplifier.scenarios.cenovnici_pipeline.main --verbose

# Skip data fetching (use existing files)
python -m amplifier.scenarios.cenovnici_pipeline.main --no-fetch
```

### 3. In Python Code

```python
from amplifier.scenarios.cenovnici_pipeline import CenovniciPipeline

# Initialize pipeline
pipeline = CenovniciPipeline()

# Run sample generation
results = pipeline.run_sample_generation(500)

# Run full pipeline
results = pipeline.run_full_pipeline()

# Access results
print(f"Processed {results['stats']['total_records']} records")
print(f"Generated {len(results['insights'])} insights")
```

## Output Structure

### Directory Layout

```
amplifier/output/processed/
├── samples/
│   ├── products/
│   │   └── sample_products.json
│   ├── trends/
│   │   └── sample_trends.json
│   ├── discounts/
│   │   └── sample_discounts.json
│   ├── analytics/
│   │   ├── category_analytics.json
│   │   └── retailer_analytics.json
│   ├── insights/
│   │   └── sample_insights.json
│   └── stats/
│       └── pipeline_stats.json
├── processed/
│   ├── products/
│   ├── discounts/
│   └── trends/
└── reports/
    └── pipeline_report_YYYYMMDD_HHMMSS.json
```

### Data Formats

#### Products (TransformedProduct)

```json
{
  "id": "uuid",
  "product_id": "unique_product_hash",
  "product_name": "Product Name",
  "product_name_sr": "Назив производа",
  "retailer": "retailer_id",
  "retailer_name": "Retailer Name",
  "price": 299.99,
  "original_price": 399.99,
  "currency": "RSD",
  "discount": 25.0,
  "category": "Category",
  "category_sr": "Категорија",
  "brand": "Brand Name",
  "unit": "kg",
  "quantity": 1.0,
  "price_per_unit": 299.99,
  "availability": "in_stock",
  "timestamp": "2025-01-10T12:00:00",
  "barcode": "8601234567890",
  "vat_rate": "20"
}
```

#### Discounts (DiscountInfo)

```json
{
  "id": "uuid",
  "product_id": "unique_product_hash",
  "product_name": "Product Name",
  "retailer": "retailer_id",
  "original_price": 399.99,
  "current_price": 299.99,
  "discount_amount": 100.0,
  "discount_percentage": 25.0,
  "valid_until": "2025-01-31T23:59:59",
  "tags": ["high_discount", "flash_sale"]
}
```

#### Trends (PriceTrend)

```json
{
  "product_id": "unique_product_hash",
  "dataPoints": [
    {
      "date": "2025-01-01",
      "price": 399.99,
      "discount": 0.0,
      "availability": "in_stock"
    },
    ...
  ]
}
```

## Configuration

### Settings

The pipeline can be configured through environment variables or the settings module:

- `INPUT_DIRECTORY`: Source directory for raw data
- `OUTPUT_DIRECTORY`: Output directory for processed data
- `SAMPLE_SIZE`: Default sample size for generation
- `ENABLE_INSIGHTS`: Enable insight generation
- `ENABLE_TRENDS`: Enable trend analysis
- `DATE_RANGE_DAYS`: Number of days for trend analysis

### Retailer Configuration

Add new retailers by updating `config/settings.py`:

```python
RetailerInfo(
    id="new_retailer",
    name="New Retailer",
    website="https://example.com",
    store_formats=[StoreFormat.SUPERMARKET],
    data_source_url="https://data.gov.rs/dataset/new-retailer",
    update_frequency="Daily"
)
```

## Integration with vizualni-admin

### Frontend Integration

Use the generated TypeScript interfaces in `types.ts` for type-safe frontend development:

```typescript
import { PriceData, DiscountData, CategoryAnalytics } from './types';

// Fetch processed data
const response = await fetch('/api/price-data');
const { data }: { data: PriceData[] } = await response.json();
```

### API Endpoints

The processed data can be served through Next.js API routes:

- `/api/price-data` - Product data with filtering
- `/api/discounts` - Current discounts
- `/api/trends` - Price trends
- `/api/analytics` - Category and retailer analytics

## Testing

### Run Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run all tests
pytest amplifier/scenarios/cenovnici_pipeline/tests/

# Run specific test
pytest tests/test_transformers.py::test_transform_batch
```

### Test with Sample Data

```bash
# Generate small sample for testing
python -m amplifier.scenarios.cenovnici_pipeline.main --sample-only --products 10

# Verify output
ls amplifier/output/processed/samples/
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all `__init__.py` files exist
2. **Encoding Issues**: The pipeline tries multiple encodings (utf-8, cp1250, iso-8859-2)
3. **Missing Dependencies**: Install required packages with `pip install pandas pydantic requests openpyxl python-dateutil pyyaml`

### Debug Mode

Enable verbose logging for detailed debugging:

```bash
python -m amplifier.scenarios.cenovnici_pipeline.main --verbose --sample-only --products 100
```

### Performance Tips

- Process data in batches for large datasets
- Use `max_records_per_file` setting to split large outputs
- Enable caching with `cache_enabled=True`
- Use parallel processing for multiple retailers

## Extending the Pipeline

### Adding New Analyzers

Create new analyzer modules in `analyzers/`:

```python
# analyzers/custom_analyzer.py
class CustomAnalyzer:
    def analyze(self, products: List[TransformedProduct]) -> CustomInsight:
        # Custom analysis logic
        pass
```

### Adding New Data Sources

Extend the `DataFetcher` class:

```python
# fetchers/custom_fetcher.py
class CustomDataFetcher(DataFetcher):
    def fetch_from_custom_api(self, source_url: str) -> List[Path]:
        # Custom fetching logic
        pass
```

## Contributing

When contributing to the pipeline:

1. Follow the brick-and-stud modular design
2. Add comprehensive tests for new features
3. Update documentation
4. Ensure type hints are included
5. Run tests before submitting

## License

This pipeline is part of the amplifier project and follows the same license terms.