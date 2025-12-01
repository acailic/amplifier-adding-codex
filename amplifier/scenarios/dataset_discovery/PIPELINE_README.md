# Amplifier Dataset Discovery Pipeline

A comprehensive data discovery and integration system for the Serbian Open Data Portal (data.gov.rs) with automated integration into the vizualni-admin visualization tool.

## Overview

This pipeline provides:
- **Automated dataset discovery** from data.gov.rs API
- **Serbian language support** with diacritic handling
- **Category-based searches** with keyword expansion
- **Sample data fallback** when API returns no results
- **TypeScript integration** for vizualni-admin
- **Automated workflows** with validation and backup
- **Quality assurance** with comprehensive error handling

## Components

### 1. Core Discovery Tool (`discover_datasets.py`)
- **Purpose**: Direct CLI tool for dataset discovery
- **Features**: Category search, custom queries, Serbian diacritic expansion
- **Output**: JSON compatible with vizualni-admin

### 2. Data Pipeline (`data_pipeline.py`)
- **Purpose**: Integration layer between discovery and vizualni-admin
- **Features**: Sample data generation, TypeScript file creation, data formatting
- **Output**: JSON + TypeScript files for vizualni-admin

### 3. Automation Manager (`automate_pipeline.py`)
- **Purpose**: Automated workflows and scheduling
- **Features**: Daily updates, validation, backup, cleanup
- **Output**: Scheduled integration with quality checks

### 4. API Client (`api_client.py`)
- **Purpose**: HTTP wrapper for data.gov.rs uData API
- **Features**: Pagination, error handling, context management
- **Output**: Raw dataset data from API

### 5. Query Expander (`query_expander.py`)
- **Purpose**: Serbian language processing
- **Features**: Diacritic variations, keyword mapping, category expansion
- **Output**: Enhanced search queries

### 6. Output Formatter (`output_formatter.py`)
- **Purpose**: Data formatting and file I/O
- **Features**: JSON output, TypeScript generation, validation
- **Output**: Standardized dataset objects

## Quick Start

### 1. Install Dependencies
```bash
cd amplifier/scenarios/dataset_discovery
pip install -r requirements.txt
```

### 2. Test the Discovery Tool
```bash
# List available categories
python discover_datasets.py --list-categories

# Test discovery with sample fallback
python discover_datasets.py --category budget --min-results 3 --output test_budget.json
```

### 3. Run Data Pipeline
```bash
# Create sample datasets and integrate with vizualni-admin
python data_pipeline.py --sample-datasets --integrate --vizualni-path ../../ai_working/vizualni-admin

# Discover real datasets and integrate
python data_pipeline.py --discover air_quality --integrate --vizualni-path ../../ai_working/vizualni-admin
```

### 4. Set Up Automation
```bash
# Run daily update (only if needed)
python automate_pipeline.py --daily-update

# Force full synchronization
python automate_pipeline.py --full-sync

# Validate current data
python automate_pipeline.py --validate-data
```

## Supported Categories

| Category | Keywords | Sample Datasets |
|----------|----------|-----------------|
| `budget` | budžet, finansije, rashodi | Budget reports, procurement data |
| `air_quality` | kvalitet vazduha, zagađenje | Air quality stations, PM measurements |
| `demographics` | stanovništvo, popis | Census data, population projections |
| `education` | obrazovanje, škola | School statistics, university data |
| `employment` | zaposlenost, plate | Labor market statistics |
| `energy` | energija, struja | Energy production, consumption |
| `environment` | životna sredina | Environmental protection data |
| `healthcare` | zdravstvo, bolnice | Healthcare statistics |
| `transport` | saobraćaj, prevoz | Traffic, public transport |
| `economy` | ekonomija, BDP | Economic indicators |
| `digital` | digitalizacija, internet | ICT infrastructure |

## File Structure

### Input Files
```
amplifier/scenarios/dataset_discovery/
├── discover_datasets.py      # CLI discovery tool
├── data_pipeline.py          # Integration pipeline
├── automate_pipeline.py      # Automation workflows
├── api_client.py            # API wrapper
├── query_expander.py        # Serbian language processing
├── output_formatter.py      # Data formatting
├── requirements.txt         # Python dependencies
└── README.md               # Tool documentation
```

### Output Files (in vizualni-admin)
```
ai_working/vizualni-admin/app/data/
├── discovered-datasets.json       # Combined JSON data
├── serbian-budget.ts             # Budget datasets
├── serbian-air_quality.ts        # Air quality datasets
├── serbian-demographics.ts       # Demographics datasets
├── backups/                      # Automated backups
│   ├── datasets_20241130_123456/
│   └── datasets_20241129_120000/
└── validation-report.json        # Data quality report
```

## TypeScript Integration

The pipeline generates TypeScript files that are compatible with vizualni-admin:

```typescript
// Example: serbian-budget.ts
export interface BudgetDataset {
  id: string;
  title: string;
  organization: string;
  tags: string[];
  format: string;
  url: string;
  description?: string;
  category: string;
}

export const serbianBudgetData: BudgetDataset[] = [
  // Dataset objects here
];

// Helper functions
export const getDatasetsByOrganization = (org: string): BudgetDataset[] => { /* ... */ };
export const getDatasetsByFormat = (format: string): BudgetDataset[] => { /* ... */ };
```

## Data Quality

### Validation Rules
- **Required fields**: id, title, organization, format, url
- **URL format**: Must start with http:// or https://
- **Category validation**: Must be from supported categories
- **Deduplication**: Automatic removal of duplicate datasets

### Sample Data Fallback
When the API returns no results, the system generates realistic sample datasets:
- **Authentic Serbian titles and organizations**
- **Proper categorization and tagging**
- **Realistic URL patterns**
- **Multiple data formats** (CSV, JSON, PDF)

## Automation Features

### Daily Updates
- **Smart updates**: Only runs if data is older than 7 days
- **Backup creation**: Automatic backup before updates
- **Rollback capability**: Restore from backups if needed
- **Validation**: Comprehensive quality checks

### Full Synchronization
- **Complete refresh**: Discovers all categories from scratch
- **Enhanced backup**: Keeps more backup versions
- **Comprehensive validation**: Full data quality report
- **Error recovery**: Graceful handling of API failures

### Data Validation
- **Field completeness**: All required fields present
- **Format validation**: URLs, categories, data types
- **Duplicate detection**: Automatic deduplication
- **Quality reporting**: Detailed validation reports

## Error Handling

### API Failures
- **Automatic retry**: Configurable retry logic
- **Graceful degradation**: Sample data fallback
- **Error logging**: Comprehensive error tracking
- **Recovery mechanisms**: Automatic recovery strategies

### Data Issues
- **Validation errors**: Detailed reporting and logging
- **Format issues**: Automatic format normalization
- **Encoding problems**: UTF-8 handling throughout
- **Backup corruption**: Multiple backup versions

## Performance Considerations

### Rate Limiting
- **Request throttling**: Respectful API usage
- **Batch operations**: Efficient data retrieval
- **Caching**: Local caching of results
- **Progress tracking**: Real-time progress updates

### Memory Usage
- **Streaming**: Large datasets processed in chunks
- **Garbage collection**: Proper cleanup of resources
- **Efficient structures**: Memory-conscious data structures
- **Monitoring**: Resource usage tracking

## Security

### Data Privacy
- **No personal data**: Only public government datasets
- **Secure transmission**: HTTPS for all API calls
- **Input validation**: Sanitization of all inputs
- **Error disclosure**: Minimal information in errors

### Access Control
- **Read-only operations**: No modification of source data
- **Limited scope**: Specific dataset categories only
- **Audit trail**: Complete logging of all operations
- **Permission checks**: Validation of file system permissions

## Troubleshooting

### Common Issues

#### No Datasets Found
```bash
# Check API connectivity
python -c "import requests; print(requests.get('https://data.gov.rs').status_code)"

# Use sample data fallback
python data_pipeline.py --sample-datasets --integrate --vizualni-path ../../ai_working/vizualni-admin
```

#### Import Errors
```bash
# Check Python path
python -c "import sys; print(sys.path)"

# Run from correct directory
cd amplifier/scenarios/dataset_discovery
python discover_datasets.py --list-categories
```

#### Permission Errors
```bash
# Check file permissions
ls -la /path/to/vizualni-admin/app/data/

# Ensure write permissions
chmod u+w /path/to/vizualni-admin/app/data/
```

#### TypeScript Compilation Errors
```bash
# Check generated TypeScript files
python automate_pipeline.py --validate-data

# Review validation report
cat /path/to/vizualni-admin/app/data/validation-report.json
```

### Debug Mode
```bash
# Enable verbose logging
python discover_datasets.py --category budget --verbose
python data_pipeline.py --discover budget --verbose
python automate_pipeline.py --daily-update --verbose
```

### Manual Recovery
```bash
# List available backups
ls -la /path/to/vizualni-admin/app/data/backups/

# Restore from backup
cp /path/to/backups/datasets_20241130_123456/* /path/to/vizualni-admin/app/data/
```

## Configuration

### Environment Variables
```bash
# Optional: Custom API endpoint
export DATA_GOV_RS_URL="https://custom-instance.example.com"

# Optional: Cache directory
export DATASET_CACHE_DIR="/tmp/dataset-cache"

# Optional: Log level
export DATASET_LOG_LEVEL="DEBUG"
```

### Custom Categories
Edit `query_expander.py` to add new categories:

```python
CATEGORY_KEYWORDS = {
    "your_category": ["keyword1", "keyword2", "keyword3"],
    # ... existing categories
}
```

## Development

### Running Tests
```bash
# Test discovery tool
python discover_datasets.py --list-categories

# Test data pipeline
python data_pipeline.py --sample-datasets --output-dir /tmp/test

# Test automation
python automate_pipeline.py --validate-data
```

### Adding New Features
1. **API changes**: Update `api_client.py`
2. **New data formats**: Update `output_formatter.py`
3. **Language support**: Update `query_expander.py`
4. **Workflow changes**: Update `data_pipeline.py` or `automate_pipeline.py`

### Code Style
- **Python 3.11+**: Modern type hints and features
- **Type hints**: Complete type annotations
- **Docstrings**: Google-style documentation
- **Logging**: Comprehensive logging throughout
- **Error handling**: Proper exception management

## Contributing

### Submitting Changes
1. **Test thoroughly**: Ensure all functionality works
2. **Update documentation**: Keep READMEs current
3. **Add tests**: Cover new functionality
4. **Check compatibility**: Ensure vizualni-admin compatibility

### Reporting Issues
Include:
- **Python version**: `python --version`
- **Error messages**: Complete error output
- **Steps to reproduce**: Detailed reproduction steps
- **Environment details**: OS, dependencies, etc.

## License

Part of the Amplifier project. See main project license for details.