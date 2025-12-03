# Data Quality Scorer

Assess dataset readiness across completeness, temporal coverage, format preference, and metadata richness.

## What it does
- Scans CSV, JSON, XLS, or XLSX files without loading them fully into memory.
- Computes completeness per column and overall.
- Detects date-like columns to measure temporal coverage.
- Ranks formats (CSV > JSON > XLS/XLSX > XML/other).
- Scores metadata based on description and tags.
- Produces a JSON report with component scores and a composite score.

## Quick start
```bash
# Install dependencies (workspace uses uv)
uv add openpyxl xlrd

# Run a quality check (use uv run if you rely on the uv-managed environment)
uv run python amplifier/scenarios/dataset_validation/data_quality_scorer.py \
  --input data/air_quality.csv \
  --dataset-id aq-2025 \
  --format csv \
  --description "Daily PM10 and PM2.5 readings for Belgrade 2023-2025" \
  --tag air-quality --tag pm10 --tag pm25 \
  --date-column date \
  --output report.json
```

## CLI options
- `--input / -i` (required): Dataset file path.
- `--format`: csv | json | xls | xlsx (auto-detected from extension if omitted).
- `--dataset-id`: Optional identifier echoed in the report.
- `--description`: Used for metadata scoring.
- `--tag`: Repeatable metadata tags.
- `--date-column`: Optional hint for date column names.
- `--output / -o`: Path to write JSON report (stdout if omitted).

## Scoring model
```
composite = (
  completeness_score * 0.30 +
  temporal_score     * 0.20 +
  format_score       * 0.25 +
  metadata_score     * 0.25
)
```

### Completeness
- Overall and per-column non-null ratios.
- Missing tokens treated as null: `""`, `na`, `n/a`, `null`, `none`, `nan`.

### Temporal coverage
- Detects date-like columns via common patterns (ISO-8601, dd/mm/yyyy, yyyy-mm-dd, etc.).
- Picks the column with the widest date range; penalizes very sparse date columns.
- Scores by range length (0–1), capped at 3+ years = 1.0.

### Format preference
- csv=1.0, json=0.9, xls/xlsx=0.7, xml/other=0.5.

### Metadata richness
- Description length and tag count contribute: description (60%), tags (40%).
- Longer descriptions and more tags yield higher scores; empty metadata scores 0.

## Supported inputs
- **CSV**: UTF-8, header row required.
- **JSON**: List of objects, or an object with `data` containing that list.
- **XLS/XLSX**: First sheet scanned; first row treated as headers.

## Output
JSON with component breakdowns, including:
- `scores.completeness` (overall + per-column)
- `scores.temporal` (best column, date range, reason)
- `scores.format` (format score and reason)
- `scores.metadata` (description/tag details)
- `scores.composite`

## End-to-end validation pipeline

Validate schema + visualization readiness + generate a preview in one command:

```bash
uv run python amplifier/scenarios/dataset_validation/validate_pipeline.py \
  --input data/air_quality.csv \
  --schema schema.json \
  --preview /tmp/preview.png \
  --output report.json
```

What it checks:
- Accessibility/loading of the dataset
- Quality score (reuses scorer above)
- Schema validation (`required`, `numeric`, `categorical`)
- Visualization readiness (detects numeric + time fields)
- Preview chart generation (PNG; inline base64 if no path)
