# Cenovnici Data Processing Pipeline

## Purpose

A comprehensive data processing pipeline for Serbian retailers' price lists (cenovnici) from data.gov.rs. This pipeline fetches data from 27+ retailers, transforms it to match the vizualni-admin schema, generates insights, and outputs processed data for visualization.

## Architecture

The pipeline follows a modular brick-and-stud architecture:

### Bricks (Self-contained modules)

1. **Data Fetchers** (`fetchers/`) - Fetch raw data from retailers
2. **Transformers** (`transformers/`) - Convert data to vizualni-admin schema
3. **Generators** (`generators/`) - Create sample datasets and insights
4. **Analyzers** (`analyzers/`) - Generate price trends and analytics
5. **Utils** (`utils/`) - Shared utilities and helpers

### Studs (Public contracts)

Each module exposes a clear public contract via `__all__` that other modules can connect to.

## Quick Start

```bash
# Run the complete pipeline
python -m amplifier.scenarios.cenovnici_pipeline.main

# Run individual stages
python -m amplifier.scenarios.cenovnici_pipeline.fetchers.fetch_all
python -m amplifier.scenarios.cenovnici_pipeline.transformers.transform_all
python -m amplifier.scenarios.cenovnici_pipeline.generators.generate_insights
```

## Data Flow

1. **Fetch**: Download CSV/XLSX files from data.gov.rs
2. **Parse**: Extract product data from raw files
3. **Transform**: Convert to vizualni-admin PriceData format
4. **Enrich**: Add category mappings and retailer metadata
5. **Analyze**: Generate trends, discounts, and insights
6. **Output**: Save processed data for visualization

## Configuration

Edit `config/settings.yaml` to configure:
- Retailer sources and URLs
- Output directories
- Processing options
- Sample data generation parameters

## Output Structure

```
amplifier/output/
├── raw_data/           # Original CSV/XLSX files
├── processed/          # Transformed JSON data
├── insights/           # Analytics and trends
├── samples/            # Demo datasets
└── reports/            # Summary reports
```

## Dependencies

- pandas: Data processing
- pydantic: Data validation
- requests: HTTP client
- openpyxl: Excel file support
- python-dateutil: Date parsing
- pyyaml: Configuration

## Testing

```bash
# Run all tests
pytest tests/

# Run specific test
pytest tests/test_transformers.py
```

## Development

The pipeline is designed for extensibility:
- Add new retailers by creating fetcher modules
- Add new transformations by extending transformers
- Add new analytics by creating analyzer modules