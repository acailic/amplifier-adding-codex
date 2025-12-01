from __future__ import annotations

import json
import sys
from collections.abc import Mapping
from dataclasses import asdict
from pathlib import Path
from typing import Any

import click

# Support running as a script: python amplifier/scenarios/dataset_validation/validate_pipeline.py
if __package__ is None:  # pragma: no cover - runtime path fixup
    project_root = Path(__file__).resolve().parents[3]
    sys.path.append(str(project_root))
    __package__ = "amplifier.scenarios.dataset_validation"

from amplifier.scenarios.dataset_validation.data_quality_scorer import build_scorecard
from amplifier.scenarios.dataset_validation.data_quality_scorer import detect_format
from amplifier.scenarios.dataset_validation.data_quality_scorer import scan_dataset
from amplifier.scenarios.dataset_validation.preview_generator import PreviewGenerationError
from amplifier.scenarios.dataset_validation.preview_generator import generate_preview_image
from amplifier.scenarios.dataset_validation.schema_validator import SchemaValidationResult
from amplifier.scenarios.dataset_validation.schema_validator import validate_schema
from amplifier.scenarios.dataset_validation.visualization_tester import VisualizationTestResult
from amplifier.scenarios.dataset_validation.visualization_tester import test_visualization


def load_records(path: Path, dataset_format: str, limit: int) -> list[dict[str, Any]]:
    """Load up to `limit` records for schema/visualization/preview steps."""
    records: list[dict[str, Any]] = []
    if dataset_format == "csv":
        import csv

        with path.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                records.append(dict(row))
                if idx + 1 >= limit:
                    break
    elif dataset_format == "json":
        data = json.loads(path.read_text())
        items = data["data"] if isinstance(data, dict) and isinstance(data.get("data"), list) else data
        if not isinstance(items, list):
            raise click.UsageError("JSON must be a list of records or contain a 'data' list.")
        for idx, row in enumerate(items):
            if isinstance(row, Mapping):
                records.append(dict(row))
            if idx + 1 >= limit:
                break
    elif dataset_format == "xlsx":
        import openpyxl

        workbook = openpyxl.load_workbook(filename=path, read_only=True, data_only=True)
        sheet = workbook.active
        iterator = sheet.iter_rows(values_only=True)
        try:
            headers = next(iterator)
        except StopIteration:
            return []
        header_names = [str(h).strip() for h in headers if h is not None and str(h).strip()]
        for idx, row_values in enumerate(iterator):
            row = {header_names[i]: row_values[i] for i in range(min(len(header_names), len(row_values)))}
            records.append(row)
            if idx + 1 >= limit:
                break
    elif dataset_format == "xls":
        import xlrd

        workbook = xlrd.open_workbook(path)
        sheet = workbook.sheet_by_index(0)
        if sheet.nrows == 0:
            return []
        headers = [str(cell.value).strip() for cell in sheet.row(0) if str(cell.value).strip()]
        for idx in range(1, min(sheet.nrows, limit + 1)):
            row_values = sheet.row(idx)
            row = {headers[i]: row_values[i].value for i in range(min(len(headers), len(row_values)))}
            records.append(row)
    else:  # pragma: no cover - defensive
        raise click.UsageError(f"Unsupported format '{dataset_format}' for preview loading.")

    return records


def _scorecard_to_dict(scorecard) -> dict[str, Any]:
    return {
        "composite": scorecard.composite,
        "completeness": asdict(scorecard.completeness),
        "temporal": {
            **asdict(scorecard.temporal),
            "earliest": scorecard.temporal.earliest.isoformat() if scorecard.temporal.earliest else None,
            "latest": scorecard.temporal.latest.isoformat() if scorecard.temporal.latest else None,
        },
        "format": asdict(scorecard.format),
        "metadata": asdict(scorecard.metadata),
    }


def _schema_result_to_dict(result: SchemaValidationResult | None) -> dict[str, Any] | None:
    if result is None:
        return None
    return {
        "passed": result.passed,
        "missing_columns": result.missing_columns,
        "type_issues": result.type_issues,
        "checked_columns": result.checked_columns,
    }


def _viz_result_to_dict(result: VisualizationTestResult | None) -> dict[str, Any] | None:
    if result is None:
        return None
    return {
        "passed": result.passed,
        "message": result.message,
        "numeric_fields": result.numeric_fields,
        "time_field": result.time_field,
    }


@click.command()
@click.option("--input", "-i", "input_path", required=True, type=click.Path(path_type=Path, exists=True))
@click.option("--format", "dataset_format", type=click.Choice(["csv", "json", "xls", "xlsx"], case_sensitive=False))
@click.option("--dataset-id", type=str, help="Optional dataset identifier")
@click.option("--description", type=str, help="Dataset description for metadata scoring")
@click.option("--tag", "tags", multiple=True, help="Metadata tag (repeatable)")
@click.option("--date-column", "date_columns", multiple=True, help="Optional hint for date column names")
@click.option("--schema", "schema_path", type=click.Path(path_type=Path), help="Path to JSON schema file")
@click.option("--output", "-o", "output_path", type=click.Path(path_type=Path), help="Path to write validation report")
@click.option("--preview", "preview_path", type=click.Path(path_type=Path), help="Optional PNG preview output path")
@click.option("--max-rows", type=int, default=500, show_default=True, help="Max rows to load for validation/preview")
def main(
    input_path: Path,
    dataset_format: str | None,
    dataset_id: str | None,
    description: str | None,
    tags: tuple[str, ...],
    date_columns: tuple[str, ...],
    schema_path: Path | None,
    output_path: Path | None,
    preview_path: Path | None,
    max_rows: int,
) -> None:
    """Run end-to-end dataset validation: accessibility, format, schema, visualization, quality, preview."""
    resolved_format = detect_format(input_path, dataset_format)
    date_hints = set(date_columns) if date_columns else None

    # Quality scoring + profile (reuses existing scanner)
    profile = scan_dataset(input_path, resolved_format, date_hints=date_hints)
    scorecard = build_scorecard(profile, resolved_format, description=description, tags=list(tags))

    # Load sample records for downstream checks
    records = load_records(input_path, resolved_format, limit=max_rows)

    # Schema validation
    schema_result: SchemaValidationResult | None = None
    if schema_path:
        schema = json.loads(schema_path.read_text())
        schema_result = validate_schema(records, schema)

    # Visualization readiness
    viz_result = test_visualization(records)

    # Preview generation (optional)
    preview_info: dict[str, Any] | None = None
    if preview_path:
        try:
            preview_info = generate_preview_image(records, output_path=preview_path)
        except PreviewGenerationError as exc:
            preview_info = {"error": str(exc)}

    report = {
        "dataset_id": dataset_id,
        "format": resolved_format,
        "rows": profile.rows,
        "columns": profile.columns,
        "quality": _scorecard_to_dict(scorecard),
        "schema": _schema_result_to_dict(schema_result),
        "visualization": _viz_result_to_dict(viz_result),
        "preview": preview_info,
    }

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        click.echo(f"Wrote validation report to {output_path}")
    else:
        click.echo(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
