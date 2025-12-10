from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any

import pandas as pd

from .anomaly_detector import AnomalyResult
from .anomaly_detector import detect_anomalies
from .correlation_finder import CorrelationResult
from .correlation_finder import detect_correlations
from .trend_detector import TrendResult
from .trend_detector import detect_trends

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def create_error_response(error_message: str, error_type: str = "processing_error") -> dict[str, Any]:
    """Create a standardized error response."""
    return {"success": False, "error": {"type": error_type, "message": error_message}, "insights": []}


def create_success_response(insights: list[dict[str, Any]]) -> dict[str, Any]:
    """Create a standardized success response."""
    return {"success": True, "error": None, "insights": insights, "count": len(insights)}


def load_table(path: Path) -> pd.DataFrame:
    """Load data from various file formats with proper error handling."""
    if not path.exists():
        raise FileNotFoundError(f"Input file not found: {path}")

    if not path.is_file():
        raise ValueError(f"Path is not a file: {path}")

    try:
        if path.suffix.lower() in {".csv"}:
            df = pd.read_csv(path)
        elif path.suffix.lower() in {".json"}:
            df = pd.read_json(path)
        elif path.suffix.lower() in {".xlsx", ".xls"}:
            df = pd.read_excel(path)
        else:
            raise ValueError(f"Unsupported file type: {path.suffix}")

        if df.empty:
            raise ValueError(f"Loaded dataset is empty: {path}")

        logger.info(f"Successfully loaded dataset with {len(df)} rows and {len(df.columns)} columns")
        return df

    except pd.errors.EmptyDataError:
        raise ValueError(f"File is empty or malformed: {path}")
    except pd.errors.ParserError as e:
        raise ValueError(f"Failed to parse file {path}: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error loading {path}: {str(e)}")


def detect_numeric_columns(df: pd.DataFrame) -> dict[str, list[float]]:
    """Detect numeric columns with validation."""
    if df.empty:
        return {}

    series: dict[str, list[float]] = {}
    for col in df.columns:
        # Skip date/time columns
        if any(keyword in str(col).lower() for keyword in ["date", "time", "vreme", "datum"]):
            continue

        try:
            if pd.api.types.is_numeric_dtype(df[col]):
                # Convert to float, handling conversion errors
                clean_series = pd.to_numeric(df[col], errors="coerce")
                clean_values = clean_series.dropna().astype(float).tolist()

                if len(clean_values) >= 5:
                    series[col] = clean_values
                    logger.debug(f"Found numeric column '{col}' with {len(clean_values)} valid values")
        except Exception as e:
            logger.warning(f"Failed to process column '{col}': {str(e)}")
            continue

    return series


def severity_from_percent(percent: float) -> str:
    """Determine severity level from percentage change."""
    abs_val = abs(percent)
    if abs_val >= 40:
        return "critical"
    if abs_val >= 20:
        return "warning"
    return "info"


def severity_from_z(z: float) -> str:
    """Determine severity level from z-score."""
    abs_val = abs(z)
    if abs_val >= 3:
        return "critical"
    if abs_val >= 2.2:
        return "warning"
    return "info"


def severity_from_corr(r: float) -> str:
    """Determine severity level from correlation coefficient."""
    abs_val = abs(r)
    if abs_val >= 0.85:
        return "critical"
    if abs_val >= 0.7:
        return "warning"
    return "info"


def trend_to_dict(result: TrendResult, locale: str) -> dict:
    """Convert trend result to dictionary format."""
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
    """Convert anomaly result to dictionary format."""
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
    """Convert correlation result to dictionary format."""
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
    """Generate insights from dataframe with proper error handling."""
    try:
        if frame.empty:
            logger.warning("Empty dataframe provided for insights generation")
            return []

        numeric = detect_numeric_columns(frame)
        if not numeric:
            logger.info("No numeric columns found for insights generation")
            return []

        logger.info(f"Processing {len(numeric)} numeric columns for insights")

        # Generate different types of insights
        trends = []
        anomalies = []
        correlations = []

        # Process trends
        try:
            trends = [
                trend_to_dict(res, locale) for field, values in numeric.items() for res in detect_trends(field, values)
            ]
        except Exception as e:
            logger.error(f"Error detecting trends: {str(e)}")

        # Process anomalies
        try:
            anomalies = [
                anomaly_to_dict(res, locale)
                for field, values in numeric.items()
                for res in detect_anomalies(field, values)
            ]
        except Exception as e:
            logger.error(f"Error detecting anomalies: {str(e)}")

        # Process correlations
        try:
            correlations = [correlation_to_dict(res, locale) for res in detect_correlations(numeric)]
        except Exception as e:
            logger.error(f"Error detecting correlations: {str(e)}")

        # Combine and prioritize insights
        combined = trends + anomalies + correlations
        priority = {"critical": 3, "warning": 2, "info": 1}
        combined.sort(key=lambda item: priority.get(item["severity"], 0), reverse=True)

        result = combined[:max_insights]
        logger.info(
            f"Generated {len(result)} insights ({len(trends)} trends, {len(anomalies)} anomalies, {len(correlations)} correlations)"
        )

        return result

    except Exception as e:
        logger.error(f"Unexpected error in generate_insights: {str(e)}")
        return []


def main() -> int:
    """Main CLI entry point with proper error handling."""
    parser = argparse.ArgumentParser(description="Generate lightweight insights from a dataset.")
    parser.add_argument("--input", required=True, help="Path to CSV/JSON/XLSX file")
    parser.add_argument("--output", required=False, help="Optional path to save insights JSON")
    parser.add_argument("--locale", default="sr", choices=["sr", "en"], help="Output language")
    parser.add_argument("--max-insights", type=int, default=5, help="Maximum number of insights")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()

    # Configure logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    try:
        input_path = Path(args.input)

        # Load and validate data
        df = load_table(input_path)

        # Generate insights
        insights = generate_insights(df, args.locale, args.max_insights)

        # Create response
        response = create_success_response(insights)

        # Output results
        if args.output:
            output_path = Path(args.output)
            try:
                output_path.parent.mkdir(parents=True, exist_ok=True)
                output_path.write_text(json.dumps(response, ensure_ascii=False, indent=2), encoding="utf-8")
                print(f"Saved {len(insights)} insights to {output_path}")
            except Exception as e:
                logger.error(f"Failed to write output file: {str(e)}")
                return 1
        else:
            print(json.dumps(response, ensure_ascii=False, indent=2))

        return 0

    except FileNotFoundError as e:
        error_response = create_error_response(str(e), "file_not_found")
        print(json.dumps(error_response, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1
    except ValueError as e:
        error_response = create_error_response(str(e), "validation_error")
        print(json.dumps(error_response, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=args.verbose)
        error_response = create_error_response(f"Unexpected error: {str(e)}", "system_error")
        print(json.dumps(error_response, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
