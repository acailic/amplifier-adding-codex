# Dataset Insights (amplifier scenario)

Lightweight, offline insights for tabular datasets (CSV/JSON/XLS/XLSX). Generates trends, anomalies, and correlations without external APIs.

## Usage

```bash
uv run python amplifier/scenarios/dataset_insights/generate_insights.py \
  --input data.csv \
  --output insights.json \
  --locale sr \
  --max-insights 5
```

## How it works
- Detects numeric columns (ignores date/time columns)
- Trends: linear slope + percent change (>=10% change)
- Anomalies: z-score outliers (|z| >= 2.0)
- Correlations: Pearson (|r| >= 0.65)
- Severity tiers: critical | warning | info

## Files
- `generate_insights.py` — CLI orchestrator
- `trend_detector.py` — trend detection helpers
- `anomaly_detector.py` — anomaly detection helpers
- `correlation_finder.py` — correlation helpers
- `requirements.txt` — numpy/pandas

## Output schema (example)

```json
[
  {
    "id": "trend-pm25",
    "type": "trend",
    "severity": "warning",
    "title": "Rastući trend za pm25",
    "description": "Promena od 22.4% u odnosu na početak.",
    "metric": "pm25",
    "value": 22.4
  }
]
```
