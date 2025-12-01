from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

from .anomaly_detector import AnomalyResult
from .anomaly_detector import detect_anomalies
from .correlation_finder import CorrelationResult
from .correlation_finder import detect_correlations
from .trend_detector import TrendResult
from .trend_detector import detect_trends


def load_table(path: Path) -> pd.DataFrame:
    if path.suffix.lower() in {".csv"}:
        return pd.read_csv(path)
    if path.suffix.lower() in {".json"}:
        return pd.read_json(path)
    if path.suffix.lower() in {".xlsx", ".xls"}:
        return pd.read_excel(path)
    raise ValueError(f"Unsupported file type: {path.suffix}")


def detect_numeric_columns(df: pd.DataFrame) -> dict[str, list[float]]:
    series: dict[str, list[float]] = {}
    for col in df.columns:
        if "date" in col.lower() or "time" in col.lower():
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            clean = df[col].dropna().astype(float).tolist()
            if len(clean) >= 5:
                series[col] = clean
    return series


def severity_from_percent(percent: float) -> str:
    abs_val = abs(percent)
    if abs_val >= 40:
        return "critical"
    if abs_val >= 20:
        return "warning"
    return "info"


def severity_from_z(z: float) -> str:
    abs_val = abs(z)
    if abs_val >= 3:
        return "critical"
    if abs_val >= 2.2:
        return "warning"
    return "info"


def severity_from_corr(r: float) -> str:
    abs_val = abs(r)
    if abs_val >= 0.85:
        return "critical"
    if abs_val >= 0.7:
        return "warning"
    return "info"


def trend_to_dict(result: TrendResult, locale: str) -> dict:
    rising = result.percent_change > 0
    return {
        "id": f"trend-{result.field}",
        "type": "trend",
        "severity": severity_from_percent(result.percent_change),
        "title": f"{'Rastući' if locale == 'sr' else 'Upward'} trend za {result.field}"
        if rising
        else f"{'Opadajući' if locale == 'sr' else 'Downward'} trend za {result.field}",
        "description": f"Promena od {result.percent_change:.1f}% u odnosu na početak.",
        "metric": result.field,
        "value": result.percent_change,
    }


def anomaly_to_dict(result: AnomalyResult, locale: str) -> dict:
    return {
        "id": f"anomaly-{result.field}-{result.index}",
        "type": "anomaly",
        "severity": severity_from_z(result.z_score),
        "title": "Uočen izuzetak" if locale == "sr" else "Anomaly detected",
        "description": f"Vrednost na poziciji {result.index + 1} odstupa {result.z_score:.1f}σ od proseka.",
        "metric": result.field,
        "value": result.value,
        "evidence": f"z={result.z_score:.2f}",
    }


def correlation_to_dict(result: CorrelationResult, locale: str) -> dict:
    return {
        "id": f"corr-{result.fields[0]}-{result.fields[1]}",
        "type": "correlation",
        "severity": severity_from_corr(result.coefficient),
        "title": f"Veza {result.fields[0]} ↔ {result.fields[1]}"
        if locale == "sr"
        else f"Link {result.fields[0]} ↔ {result.fields[1]}",
        "description": f"Korelacija r={result.coefficient:.2f}",
        "metric": f"{result.fields[0]} ↔ {result.fields[1]}",
        "value": result.coefficient,
    }


def generate_insights(frame: pd.DataFrame, locale: str, max_insights: int) -> list[dict]:
    numeric = detect_numeric_columns(frame)
    if not numeric:
        return []

    trends = [trend_to_dict(res, locale) for field, values in numeric.items() for res in detect_trends(field, values)]

    anomalies = [
        anomaly_to_dict(res, locale) for field, values in numeric.items() for res in detect_anomalies(field, values)
    ]

    correlations = [correlation_to_dict(res, locale) for res in detect_correlations(numeric)]

    combined = trends + anomalies + correlations
    priority = {"critical": 3, "warning": 2, "info": 1}
    combined.sort(key=lambda item: priority.get(item["severity"], 0), reverse=True)
    return combined[:max_insights]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate lightweight insights from a dataset.")
    parser.add_argument("--input", required=True, help="Path to CSV/JSON/XLSX file")
    parser.add_argument("--output", required=False, help="Optional path to save insights JSON")
    parser.add_argument("--locale", default="sr", choices=["sr", "en"], help="Output language")
    parser.add_argument("--max-insights", type=int, default=5, help="Maximum number of insights")
    args = parser.parse_args()

    input_path = Path(args.input)
    df = load_table(input_path)
    insights = generate_insights(df, args.locale, args.max_insights)

    if args.output:
        output_path = Path(args.output)
        output_path.write_text(json.dumps(insights, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Saved {len(insights)} insights to {output_path}")
    else:
        print(json.dumps(insights, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
