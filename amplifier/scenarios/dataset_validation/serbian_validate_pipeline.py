from __future__ import annotations

import json
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Any

import click

# Support running as a script
if __package__ is None:  # pragma: no cover - runtime path fixup
    project_root = Path(__file__).resolve().parents[3]
    sys.path.append(str(project_root))
    __package__ = "amplifier.scenarios.dataset_validation"

from amplifier.scenarios.dataset_validation.data_quality_scorer import detect_format
from amplifier.scenarios.dataset_validation.models import ColumnStats
from amplifier.scenarios.dataset_validation.models import DatasetProfile
from amplifier.scenarios.dataset_validation.preview_generator import PreviewGenerationError
from amplifier.scenarios.dataset_validation.preview_generator import generate_preview_image
from amplifier.scenarios.dataset_validation.schema_validator import SchemaValidationResult
from amplifier.scenarios.dataset_validation.schema_validator import validate_schema
from amplifier.scenarios.dataset_validation.serbian_quality_scorer import SerbianQualityScorer
from amplifier.scenarios.dataset_validation.serbian_quality_scorer import SerbianStreamingDatasetScanner
from amplifier.scenarios.dataset_validation.visualization_tester import test_visualization

# Enhanced Serbian schema validation
SERBIAN_SCHEMA_VALIDATORS = {
    "jmbg": {
        "pattern": r"^\d{13}$",
        "description": "Serbian Unique Master Citizen Number (JMBG)",
        "examples": ["0101990710006", "3112985730001"],
    },
    "pib": {
        "pattern": r"^\d{8,9}$",
        "description": "Serbian Tax Identification Number (PIB)",
        "examples": ["12345678", "123456789"],
    },
    "maticni_broj": {
        "pattern": r"^\d{13}$",
        "description": "Serbian Unique Master Citizen Number (Matični broj)",
        "examples": ["0101990710006"],
    },
    "opstina": {
        "enum": [
            "Beograd",
            "Novi Sad",
            "Niš",
            "Kragujevac",
            "Subotica",
            "Priština",
            "Šabac",
            "Kraljevo",
            "Čačak",
            "Užice",
            "Pančevo",
            "Kruševac",
            "Smederevo",
            "Leskovac",
            "Valjevo",
            "Loznica",
            "Zrenjanin",
            "Vranje",
            "Sombor",
            "Požarevac",
            "Pirot",
            "Kikinda",
            "Vršac",
            "Sremska Mitrovica",
            "Novi Pazar",
            "Šabac",
            "Bor",
            "Zaječar",
        ],
        "description": "Serbian municipality name",
    },
    "postanski_broj": {
        "pattern": r"^\d{5}$",
        "description": "Serbian postal code",
        "examples": ["11000", "21000", "18000"],
    },
    "telefon": {
        "pattern": r"^(\+381|0)[\s-]*\d{2,3}[\s-]*\d{3,4}[\s-]*\d{3,4}$",
        "description": "Serbian phone number format",
        "examples": ["+381 11 123456", "011/123-456", "063123456"],
    },
}


class SerbianPipelineManager:
    """World-class validation pipeline manager for Serbian government datasets."""

    def __init__(self):
        self.scanner = SerbianStreamingDatasetScanner()
        self.quality_scorer = SerbianQualityScorer()

    def load_records_streaming(
        self, path: Path, dataset_format: str, limit: int, sample_size: int = 5000
    ) -> tuple[list[dict[str, Any]], DatasetProfile, Any]:
        """Load records with streaming support for large files."""
        records = []

        if dataset_format == "csv":
            import csv

            with path.open("r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for idx, row in enumerate(reader):
                    if idx < sample_size:  # Sample for Serbian validation
                        records.append(dict(row))
                    if idx >= limit:
                        break

            # Get full profile using streaming
            profile, processing_stats = self.scanner.scan_csv_streaming(path, sample_size=sample_size)
            return records, profile, processing_stats

        if dataset_format == "json":
            # Use the scanner for JSON as well
            profile, processing_stats = self.scanner.scan_json_streaming(path, sample_size=sample_size)

            # Load records for schema/visualization
            try:
                data = json.loads(path.read_text())
                items = data["data"] if isinstance(data, dict) and isinstance(data.get("data"), list) else data
                if not isinstance(items, list):
                    raise click.UsageError("JSON must be a list of records or contain a 'data' list.")

                for idx, row in enumerate(items):
                    if isinstance(row, Mapping) and idx < limit:
                        records.append(dict(row))
                    if idx >= limit:
                        break
            except Exception as e:
                raise click.UsageError(f"Error loading JSON records: {e}")

            return records, profile, processing_stats

        if dataset_format == "xlsx":
            import openpyxl

            workbook = openpyxl.load_workbook(filename=path, read_only=True, data_only=True)
            sheet = workbook.active
            iterator = sheet.iter_rows(values_only=True)

            try:
                headers = next(iterator)
            except StopIteration:
                return [], DatasetProfile(rows=0, columns=[], column_stats={}), None

            header_names = [str(h).strip() for h in headers if h is not None and str(h).strip()]

            # Initialize column stats
            column_stats = {name: ColumnStats(name=name) for name in header_names}
            rows = 0

            for idx, row_values in enumerate(iterator):
                if idx >= limit:
                    break

                row = {header_names[i]: row_values[i] for i in range(min(len(header_names), len(row_values)))}
                records.append(row)
                rows += 1

                # Update column stats for the first sample_size rows
                if idx < sample_size:
                    for column in header_names:
                        if column in row:
                            value = row[column]
                            column_stats[column].total += 1
                            if value is not None:
                                column_stats[column].non_null += 1

            profile = DatasetProfile(rows=rows, columns=header_names, column_stats=column_stats)
            return records, profile, None

        if dataset_format == "xls":
            import xlrd

            workbook = xlrd.open_workbook(path)
            sheet = workbook.sheet_by_index(0)

            if sheet.nrows == 0:
                return [], DatasetProfile(rows=0, columns=[], column_stats={}), None

            headers = [str(cell.value).strip() for cell in sheet.row(0) if str(cell.value).strip()]
            column_stats = {header: ColumnStats(name=header) for header in headers}
            rows = 0

            for idx in range(1, min(sheet.nrows, limit + 1)):
                row_values = sheet.row(idx)
                row = {headers[i]: row_values[i].value for i in range(min(len(headers), len(row_values)))}
                records.append(row)
                rows += 1

                # Update column stats for the first sample_size rows
                if idx < sample_size:
                    for column in headers:
                        if column in row:
                            value = row[column]
                            column_stats[column].total += 1
                            if value is not None:
                                column_stats[column].non_null += 1

            profile = DatasetProfile(rows=rows, columns=headers, column_stats=column_stats)
            return records, profile, None

        raise click.UsageError(f"Unsupported format '{dataset_format}' for Serbian validation.")

    def validate_serbian_schema(
        self, records: list[Mapping[str, object]], schema: Mapping[str, object] | None = None
    ) -> SchemaValidationResult:
        """Enhanced schema validation with Serbian-specific rules."""
        if schema is None:
            # Apply Serbian government data schema by default
            schema = self._get_default_serbian_schema()

        # Basic schema validation
        result = validate_schema(records, schema)

        # Serbian-specific validations
        serbian_issues = []
        checked_columns = set(result.checked_columns)

        # Check for Serbian identifiers if present
        for record in records[:100]:  # Sample for performance
            for column_name, value in record.items():
                if value is None:
                    continue

                col_lower = column_name.lower()

                # JMBG validation
                if "jmbg" in col_lower or "maticni_broj" in col_lower:
                    if isinstance(value, str) and len(value.strip()) == 13:
                        from amplifier.scenarios.dataset_validation.serbian_validators import validate_serbian_jmbg

                        if not validate_serbian_jmbg(value.strip().replace(".", "").replace("-", "")):
                            serbian_issues.append(f"{column_name}: Invalid JMBG format")

                # PIB validation
                elif "pib" in col_lower:
                    if isinstance(value, str) and value.strip().replace(".", "").isdigit():
                        from amplifier.scenarios.dataset_validation.serbian_validators import validate_serbian_pib

                        if not validate_serbian_pib(value.strip().replace(".", "").replace("-", "")):
                            serbian_issues.append(f"{column_name}: Invalid PIB format")

                # Municipality validation
                elif "opstina" in col_lower or "municipality" in col_lower:
                    if isinstance(value, str):
                        from amplifier.scenarios.dataset_validation.serbian_validators import is_serbian_municipality

                        if not is_serbian_municipality(value.strip()):
                            serbian_issues.append(f"{column_name}: Invalid Serbian municipality")

        # Merge Serbian issues with basic validation issues
        result.type_issues.extend(serbian_issues)
        result.checked_columns = sorted(checked_columns)

        return result

    def _get_default_serbian_schema(self) -> dict[str, Any]:
        """Get default Serbian government data schema."""
        return {
            "required": [],  # No required fields by default
            "numeric": ["id", "broj", "vrednost", "iznos", "količina"],
            "categorical": ["opstina", "grad", "region", "status", "tip"],
        }

    def run_comprehensive_serbian_validation(
        self,
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
        sample_size: int,
        performance_mode: bool = False,
    ) -> dict[str, Any]:
        """Run comprehensive Serbian government dataset validation."""
        resolved_format = detect_format(input_path, dataset_format)
        date_hints = set(date_columns) if date_columns else None

        # Load records and get dataset profile
        records, profile, processing_stats = self.load_records_streaming(
            input_path, resolved_format, limit=max_rows, sample_size=sample_size
        )

        # Serbian quality scoring
        file_size_mb = input_path.stat().st_size / 1024 / 1024
        serbian_quality_scorecard = self.quality_scorer.score_serbian_dataset(
            profile=profile,
            processing_stats=processing_stats
            or type(
                "Stats",
                (),
                {"rows_processed": len(records), "processing_time_seconds": 0, "memory_peak_mb": 0, "cache_hits": 0},
            )(),
            dataset_format=resolved_format,
            description=description,
            tags=list(tags),
            sample_records=records,
            file_size_mb=file_size_mb,
        )

        # Enhanced Serbian schema validation
        schema_result: SchemaValidationResult | None = None
        if schema_path:
            schema = json.loads(schema_path.read_text())
            schema_result = self.validate_serbian_schema(records, schema)
        else:
            # Apply default Serbian validation
            schema_result = self.validate_serbian_schema(records, None)

        # Basic visualization readiness
        basic_viz_result = test_visualization(records)

        # Generate preview (optional)
        preview_info: dict[str, Any] | None = None
        if preview_path:
            try:
                preview_info = generate_preview_image(records, output_path=preview_path)
            except PreviewGenerationError as exc:
                preview_info = {"error": str(exc)}

        # Build comprehensive report
        report = {
            "dataset_id": dataset_id,
            "format": resolved_format,
            "rows": profile.rows,
            "columns": profile.columns,
            "file_size_mb": round(file_size_mb, 2),
            # Serbian-specific quality metrics
            "serbian_quality": {
                "overall_score": serbian_quality_scorecard.overall_score,
                "basic_score": serbian_quality_scorecard.basic_score,
                "compliance_indicators": serbian_quality_scorecard.compliance_indicators,
                "performance_metrics": serbian_quality_scorecard.performance_metrics,
                "recommendations": serbian_quality_scorecard.recommendations,
            },
            # Serbian validation results
            "serbian_validation": {
                "script_detected": serbian_quality_scorecard.serbian_validation.script_detected,
                "script_consistency": serbian_quality_scorecard.serbian_validation.script_consistency,
                "has_serbian_place_names": serbian_quality_scorecard.serbian_validation.has_serbian_place_names,
                "valid_municipalities": list(serbian_quality_scorecard.serbian_validation.valid_municipalities),
                "jmbg_valid": serbian_quality_scorecard.serbian_validation.jmbg_valid,
                "pib_valid": serbian_quality_scorecard.serbian_validation.pib_valid,
                "government_institutions_found": list(
                    serbian_quality_scorecard.serbian_validation.government_institutions_found
                ),
            },
            # Serbian metadata assessment
            "serbian_metadata": {
                "overall_score": serbian_quality_scorecard.serbian_metadata.overall_score,
                "serbian_language_score": serbian_quality_scorecard.serbian_metadata.serbian_language_score,
                "institution_compliance_score": serbian_quality_scorecard.serbian_metadata.institution_compliance_score,
                "classification_score": serbian_quality_scorecard.serbian_metadata.classification_score,
                "geographic_coverage_score": serbian_quality_scorecard.serbian_metadata.geographic_coverage_score,
                "details": serbian_quality_scorecard.serbian_metadata.details,
            },
            # Serbian temporal analysis
            "serbian_temporal": {
                "calendar_compliance": serbian_quality_scorecard.serbian_temporal.serbian_calendar_compliance,
                "serbian_date_format_detected": serbian_quality_scorecard.serbian_temporal.serbian_date_format_detected,
                "business_day_coverage": serbian_quality_scorecard.serbian_temporal.serbian_business_day_coverage,
                "holiday_aware_coverage": serbian_quality_scorecard.serbian_temporal.holiday_aware_coverage,
                "seasonal_patterns": serbian_quality_scorecard.serbian_temporal.seasonal_pattern_detected,
                "data_collection_patterns": serbian_quality_scorecard.serbian_temporal.data_collection_patterns,
            },
            # Serbian visualization analysis
            "serbian_visualization": {
                "overall_score": serbian_quality_scorecard.serbian_visualization.overall_score,
                "geographic_suitability": serbian_quality_scorecard.serbian_visualization.geographic_suitability,
                "temporal_suitability": serbian_quality_scorecard.serbian_visualization.temporal_suitability,
                "serbian_patterns_detected": serbian_quality_scorecard.serbian_visualization.serbian_patterns_detected,
                "recommended_chart_types": serbian_quality_scorecard.serbian_visualization.recommended_chart_types,
                "field_mapping_suggestions": serbian_quality_scorecard.serbian_visualization.field_mapping_suggestions,
            },
            # Standard validation results
            "schema": {
                "passed": schema_result.passed if schema_result else None,
                "missing_columns": schema_result.missing_columns if schema_result else [],
                "type_issues": schema_result.type_issues if schema_result else [],
                "checked_columns": schema_result.checked_columns if schema_result else [],
            },
            "visualization": {
                "passed": basic_viz_result.passed,
                "message": basic_viz_result.message,
                "numeric_fields": basic_viz_result.numeric_fields,
                "time_field": basic_viz_result.time_field,
            },
            "preview": preview_info,
            # Metadata summary
            "metadata": {
                "description": description or "",
                "tags": list(tags),
                "date_columns": list(date_columns),
                "processing_mode": "performance" if performance_mode else "comprehensive",
            },
            # Performance metrics
            "performance": serbian_quality_scorecard.performance_metrics,
        }

        return report


@click.command()
@click.option("--input", "-i", "input_path", required=True, type=click.Path(path_type=Path, exists=True))
@click.option("--format", "dataset_format", type=click.Choice(["csv", "json", "xls", "xlsx"], case_sensitive=False))
@click.option("--dataset-id", type=str, help="Optional dataset identifier")
@click.option("--description", type=str, help="Dataset description for metadata scoring")
@click.option("--tag", "tags", multiple=True, help="Metadata tag (repeatable)")
@click.option("--date-column", "date_columns", multiple=True, help="Optional hint for date column names")
@click.option("--schema", "schema_path", type=click.Path(path_type=Path), help="Path to JSON schema file")
@click.option(
    "--output", "-o", "output_path", type=click.Path(path_type=Path), help="Path to write Serbian validation report"
)
@click.option("--preview", "preview_path", type=click.Path(path_type=Path), help="Optional PNG preview output path")
@click.option("--max-rows", type=int, default=1000, show_default=True, help="Max rows to load for validation")
@click.option("--sample-size", type=int, default=5000, show_default=True, help="Sample size for Serbian analysis")
@click.option("--performance-mode", is_flag=True, help="Enable performance-optimized mode for large files")
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
    sample_size: int,
    performance_mode: bool,
) -> None:
    """Run world-class Serbian government dataset validation."""
    pipeline = SerbianPipelineManager()

    # Run comprehensive Serbian validation
    report = pipeline.run_comprehensive_serbian_validation(
        input_path=input_path,
        dataset_format=dataset_format,
        dataset_id=dataset_id,
        description=description,
        tags=tags,
        date_columns=date_columns,
        schema_path=schema_path,
        output_path=output_path,
        preview_path=preview_path,
        max_rows=max_rows,
        sample_size=sample_size,
        performance_mode=performance_mode,
    )

    # Output results
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(report, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
        click.echo(f"Wrote Serbian validation report to {output_path}")

        # Print summary
        score = report["serbian_quality"]["overall_score"]
        click.echo(f"\nSerbian Dataset Quality Score: {score:.1%}")

        if score >= 0.8:
            click.echo("✅ Excellent - Ready for Serbian government publication")
        elif score >= 0.6:
            click.echo("⚠️  Good - Minor improvements recommended")
        else:
            click.echo("❌ Needs significant improvements for Serbian standards")
    else:
        click.echo(json.dumps(report, indent=2, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main()
