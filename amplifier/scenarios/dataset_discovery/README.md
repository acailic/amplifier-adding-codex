# Dataset Discovery Tool

Automated dataset discovery from data.gov.rs (Serbian open data portal) with support for Serbian language specifics.

## Features

- **Category-based search**: Predefined categories with Serbian keyword expansion
- **Custom query search**: Flexible search with diacritic handling
- **Tag-based fallback**: Automatic fallback to tag search when needed
- **Pagination support**: Automatically fetches all pages of results
- **Serbian diacritics**: Handles č, ć, đ, š, ž variations automatically
- **JSON output**: Compatible with vizualni-admin configuration format

## Installation

```bash
cd amplifier/scenarios/dataset_discovery
pip install -r requirements.txt
```

## Usage

### Basic Examples

```bash
# Discover budget datasets
python discover_datasets.py --category budget --min-results 10 --output budget_datasets.json

# Search for air quality data
python discover_datasets.py --query "kvalitet vazduha" --output air_quality.json

# List available categories
python discover_datasets.py --list-categories
```

### Command-Line Options

```
--category CATEGORY       Category to search (e.g., budget, air_quality)
--query QUERY            Custom search query
--min-results N          Minimum number of results (default: 5)
--output FILE            Output JSON file path
--no-expand-diacritics   Disable diacritic expansion
--base-url URL           Custom uData instance URL
--verbose                Enable verbose logging
--list-categories        List available categories
```

### Available Categories

- `budget` - Budžet, finansije, rashodi, prihodi
- `air_quality` - Kvalitet vazduha, zagađenje, PM10, PM2.5
- `demographics` - Stanovništvo, popis, migracija
- `education` - Obrazovanje, škole, univerziteti
- `employment` - Zaposlenost, nezaposlenost, plate
- `energy` - Energija, struja, gas, obnovljivi izvori
- `environment` - Životna sredina, ekologija, zaštita prirode
- `healthcare` - Zdravstvo, bolnice, zdravstvena zaštita
- `transport` - Saobraćaj, javni prevoz, metro, autobus
- `economy` - Ekonomija, privreda, BDP, inflacija
- `digital` - Digitalizacija, internet, IKT, e-uprava

## Output Format

The tool outputs JSON compatible with vizualni-admin:

```json
[
  {
    "id": "dataset-id",
    "title": "Dataset Title",
    "organization": "Organization Name",
    "tags": ["tag1", "tag2"],
    "format": "CSV",
    "url": "https://data.gov.rs/..."
  }
]
```

## Python API

You can also use the tool programmatically:

```python
from amplifier.scenarios.dataset_discovery import discover_by_category, discover_by_query

# Discover by category
datasets = discover_by_category("budget", min_results=10)

# Discover by custom query
datasets = discover_by_query("kvalitet vazduha", expand_diacritics=True)

# Access dataset information
for dataset in datasets:
    print(f"{dataset['title']} ({dataset['format']})")
```

## Serbian Language Support

The tool automatically handles Serbian language specifics:

### Diacritic Variations

When you search for "budžet", the tool automatically tries:
- budžet (with diacritics)
- budzet (without diacritics)

When you search for "budzet", the tool automatically tries:
- budzet (original)
- budžet (with diacritics)

### Supported Diacritics

- č ↔ c
- ć ↔ c
- đ ↔ dj
- š ↔ s
- ž ↔ z

## Examples

### Example 1: Budget Data

```bash
python discover_datasets.py --category budget --output budget.json
```

Output:
```
Found 15 datasets

Formats:
  CSV: 10
  JSON: 3
  XLS: 2

Datasets:

1. Budžet Republike Srbije 2024
   ID: budget-2024
   Organization: Ministarstvo finansija
   Format: CSV
   Tags: budžet, finansije, rashodi

...
```

### Example 2: Air Quality Search

```bash
python discover_datasets.py --query "kvalitet vazduha" --min-results 10 --output air_quality.json
```

The tool automatically:
1. Expands query to: "kvalitet vazduha", "kvalitet vazduha" (variations)
2. Searches data.gov.rs API
3. Handles pagination
4. Formats results
5. Saves to air_quality.json

### Example 3: Custom Search Without Diacritic Expansion

```bash
python discover_datasets.py --query "budzet" --no-expand-diacritics --output exact_budget.json
```

This searches only for "budzet" without trying "budžet" variations.

## Architecture

The tool consists of four main components:

1. **api_client.py** - uData API wrapper
   - Handles HTTP requests to data.gov.rs
   - Manages pagination
   - Provides context manager interface

2. **query_expander.py** - Serbian keyword expansion
   - Diacritic variation handling
   - Category keyword mapping
   - Query expansion logic

3. **output_formatter.py** - JSON output formatting
   - Extracts relevant dataset fields
   - Formats to vizualni-admin schema
   - Handles file I/O

4. **discover_datasets.py** - CLI interface
   - Command-line argument parsing
   - Orchestrates discovery workflow
   - Provides both category and query search

## Troubleshooting

### No datasets found

If no datasets are found:
1. Try a different query or category
2. Enable verbose logging with `--verbose`
3. Check if data.gov.rs is accessible
4. Try searching without diacritic expansion

### Connection errors

If you get connection errors:
1. Check your internet connection
2. Verify data.gov.rs is accessible
3. Try increasing timeout (modify `api_client.py`)

### Encoding issues

The tool handles UTF-8 encoding automatically. If you see encoding issues:
1. Ensure your terminal supports UTF-8
2. Check the output file encoding

## Development

### Running Tests

```bash
pytest tests/test_dataset_discovery.py -v
```

### Adding New Categories

Edit `query_expander.py` and add to `CATEGORY_KEYWORDS`:

```python
CATEGORY_KEYWORDS = {
    "your_category": ["keyword1", "keyword2", "keyword3"],
    # ...
}
```

## License

Part of the Amplifier project.
