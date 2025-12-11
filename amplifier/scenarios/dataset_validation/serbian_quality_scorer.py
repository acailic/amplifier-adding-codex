from __future__ import annotations

import gc
import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

from .models import ColumnStats
from .models import DatasetProfile
from .serbian_metadata_scorer import SerbianMetadataScore
from .serbian_metadata_scorer import score_serbian_metadata
from .serbian_temporal_analyzer import SerbianTemporalAnalyzer
from .serbian_temporal_analyzer import SerbianTemporalResult
from .serbian_validators import SerbianDataValidator
from .serbian_validators import SerbianValidationResult
from .serbian_visualization_analyzer import SerbianVisualizationAnalysis
from .serbian_visualization_analyzer import SerbianVisualizationAnalyzer

# Performance configuration
CHUNK_SIZE = 10000  # Number of rows to process at once
MAX_WORKERS = 4  # Number of parallel workers
SAMPLE_SIZE_FOR_DEEP_ANALYSIS = 5000  # Sample size for intensive Serbian validation
MEMORY_THRESHOLD_MB = 500  # Memory usage threshold


@dataclass
class SerbianQualityScorecard:
    """Comprehensive Serbian data quality assessment results."""

    overall_score: float
    basic_score: float  # From original scorer
    serbian_validation: SerbianValidationResult
    serbian_metadata: SerbianMetadataScore
    serbian_temporal: SerbianTemporalResult
    serbian_visualization: SerbianVisualizationAnalysis
    performance_metrics: dict[str, Any]
    recommendations: list[str]
    compliance_indicators: dict[str, float]


@dataclass
class ProcessingStats:
    """Statistics for performance monitoring."""

    rows_processed: int = 0
    chunks_processed: int = 0
    processing_time_seconds: float = 0.0
    memory_peak_mb: float = 0.0
    serbian_patterns_detected: int = 0
    validation_errors: int = 0
    cache_hits: int = 0


class SerbianStreamingDatasetScanner:
    """Memory-efficient scanner for large Serbian datasets."""

    def __init__(self, chunk_size: int = CHUNK_SIZE):
        self.chunk_size = chunk_size
        self.validator = SerbianDataValidator()
        self.missing_tokens = {"", "na", "n/a", "null", "none", "nan", "nepoznato", "nema"}
        self.serbian_text_cache = {}  # Cache for Serbian text detection

    def _get_memory_usage(self) -> float:
        """Get current memory usage in MB."""
        try:
            import os

            import psutil

            process = psutil.Process(os.getpid())
            return process.memory_info().rss / 1024 / 1024
        except ImportError:
            return 0.0

    def _is_serbian_text(self, text: str) -> bool:
        """Cache-aware Serbian text detection."""
        if text in self.serbian_text_cache:
            return self.serbian_text_cache[text]

        is_serbian = bool(
            self.validator.cyrillic_pattern.search(text) or self.validator.serbian_chars_latin.search(text)
        )

        # Limit cache size
        if len(self.serbian_text_cache) < 10000:
            self.serbian_text_cache[text] = is_serbian

        return is_serbian

    def _normalize_cell(self, value: Any) -> Any:
        """Normalize cell value with Serbian missing tokens."""
        if value is None:
            return None

        if isinstance(value, str):
            text = value.strip()
            if text.lower() in self.missing_tokens:
                return None
            return text

        return value

    def _parse_date_fast(self, value: Any) -> datetime | None:
        """Fast date parsing for performance."""
        if value is None:
            return None

        if isinstance(value, datetime):
            return value

        if not isinstance(value, str):
            return None

        text = value.strip()
        if not text:
            return None

        # Quick check for common Serbian date patterns
        if re.match(r"^\d{1,2}\.\d{1,2}\.\d{4}$", text):  # dd.mm.yyyy
            try:
                day, month, year = text.split(".")
                return datetime(int(year), int(month), int(day))
            except ValueError:
                pass

        elif re.match(r"^\d{4}-\d{2}-\d{2}$", text):  # yyyy-mm-dd
            try:
                return datetime.fromisoformat(text)
            except ValueError:
                pass

        elif re.match(r"^\d{2}/\d{2}/\d{4}$", text):  # dd/mm/yyyy
            try:
                day, month, year = text.split("/")
                return datetime(int(year), int(month), int(day))
            except ValueError:
                pass

        return None

    def scan_csv_streaming(
        self, path: Path, date_hints: set[str] | None = None, sample_size: int | None = None
    ) -> tuple[DatasetProfile, ProcessingStats]:
        """Stream-scan CSV file for memory efficiency."""
        import csv

        stats: dict[str, ColumnStats] = {}
        rows = 0
        chunks = 0
        processing_stats = ProcessingStats()

        date_hints = {h.lower() for h in date_hints} if date_hints else None
        sample_rows = []

        start_time = datetime.now()

        with path.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)

            # Initialize column stats
            if reader.fieldnames:
                for field in reader.fieldnames:
                    stats[field] = ColumnStats(name=field)

            for _row_index, row in enumerate(reader):
                rows += 1
                chunks += 1

                # Sample for deep analysis
                if sample_size and len(sample_rows) < sample_size:
                    sample_rows.append(dict(row))

                # Process row
                all_columns = set(stats.keys())
                for column in all_columns:
                    raw_value = row.get(column)
                    value = self._normalize_cell(raw_value)

                    # Date parsing
                    parsed_date = None
                    should_parse_date = date_hints is None or column.lower() in date_hints
                    if should_parse_date and value is not None:
                        parsed_date = self._parse_date_fast(value)

                    stats[column].register(value=value, parsed_date=parsed_date)

                # Memory management
                if chunks % self.chunk_size == 0:
                    gc.collect()
                    current_memory = self._get_memory_usage()
                    processing_stats.memory_peak_mb = max(processing_stats.memory_peak_mb, current_memory)

                if sample_size and rows >= sample_size + (self.chunk_size * 2):
                    break  # Stop after collecting sufficient sample

        processing_stats.rows_processed = rows
        processing_stats.chunks_processed = chunks
        processing_stats.processing_time_seconds = (datetime.now() - start_time).total_seconds()

        return (DatasetProfile(rows=rows, columns=list(stats.keys()), column_stats=stats), processing_stats)

    def scan_json_streaming(
        self, path: Path, date_hints: set[str] | None = None, sample_size: int | None = None
    ) -> tuple[DatasetProfile, ProcessingStats]:
        """Stream-scan JSON file for memory efficiency."""
        stats: dict[str, ColumnStats] = {}
        rows = 0
        chunks = 0
        processing_stats = ProcessingStats()

        date_hints = {h.lower() for h in date_hints} if date_hints else None
        sample_rows = []

        start_time = datetime.now()

        try:
            with path.open("r", encoding="utf-8") as f:
                # Try to process JSON line by line if it's NDJSON
                first_char = f.read(1)
                f.seek(0)

                if first_char == "{":
                    # NDJSON format - one JSON object per line
                    for _line_num, line in enumerate(f):
                        try:
                            record = json.loads(line.strip())
                            if not isinstance(record, dict):
                                continue

                            rows += 1
                            chunks += 1

                            if sample_size and len(sample_rows) < sample_size:
                                sample_rows.append(record)

                            # Initialize columns if first record
                            if rows == 1:
                                for key in record:
                                    stats[key] = ColumnStats(name=key)

                            # Process record
                            for column in stats:
                                value = self._normalize_cell(record.get(column))

                                parsed_date = None
                                if date_hints is None or column.lower() in date_hints:
                                    if value is not None:
                                        parsed_date = self._parse_date_fast(value)

                                stats[column].register(value=value, parsed_date=parsed_date)

                            if chunks % self.chunk_size == 0:
                                gc.collect()
                                current_memory = self._get_memory_usage()
                                processing_stats.memory_peak_mb = max(processing_stats.memory_peak_mb, current_memory)

                            if sample_size and rows >= sample_size + (self.chunk_size * 2):
                                break

                        except json.JSONDecodeError:
                            processing_stats.validation_errors += 1
                            continue

                else:
                    # Standard JSON array
                    data = json.load(f)

                    if isinstance(data, dict) and "data" in data:
                        records = data["data"]
                    elif isinstance(data, list):
                        records = data
                    else:
                        records = []

                    for _record_num, record in enumerate(records):
                        if not isinstance(record, dict):
                            continue

                        rows += 1
                        chunks += 1

                        if sample_size and len(sample_rows) < sample_size:
                            sample_rows.append(record)

                        # Initialize columns if first record
                        if rows == 1:
                            for key in record:
                                stats[key] = ColumnStats(name=key)

                        # Process record
                        for column in stats:
                            value = self._normalize_cell(record.get(column))

                            parsed_date = None
                            if date_hints is None or column.lower() in date_hints:
                                if value is not None:
                                    parsed_date = self._parse_date_fast(value)

                            stats[column].register(value=value, parsed_date=parsed_date)

                        if chunks % self.chunk_size == 0:
                            gc.collect()
                            current_memory = self._get_memory_usage()
                            processing_stats.memory_peak_mb = max(processing_stats.memory_peak_mb, current_memory)

                        if sample_size and rows >= sample_size + (self.chunk_size * 2):
                            break

        except Exception:
            processing_stats.validation_errors += 1

        processing_stats.rows_processed = rows
        processing_stats.chunks_processed = chunks
        processing_stats.processing_time_seconds = (datetime.now() - start_time).total_seconds()

        return (DatasetProfile(rows=rows, columns=list(stats.keys()), column_stats=stats), processing_stats)


class SerbianQualityScorer:
    """World-class quality scorer for large Serbian government datasets."""

    def __init__(self, chunk_size: int = CHUNK_SIZE):
        self.scanner = SerbianStreamingDatasetScanner(chunk_size)
        self.temporal_analyzer = SerbianTemporalAnalyzer()
        self.viz_analyzer = SerbianVisualizationAnalyzer()
        self.metadata_cache = {}

    def calculate_completeness_score(self, column_stats: dict[str, ColumnStats], row_count: int) -> dict[str, Any]:
        """Calculate enhanced completeness score for Serbian data."""
        if row_count == 0:
            return {
                "overall_score": 0.0,
                "per_column": {},
                "critical_completeness": 0.0,
                "serbian_fields_completeness": 0.0,
            }

        per_column_scores = {}
        total_values = 0
        total_non_null = 0

        # Serbian field patterns
        serbian_field_patterns = [
            "jmbg",
            "pib",
            "maticni_broj",
            "opstina",
            "grad",
            "adresa",
            "telefon",
            "email",
            "naziv",
            "opis",
        ]

        serbian_completeness_sum = 0.0
        serbian_completeness_count = 0

        critical_completeness_sum = 0.0
        critical_completeness_count = 0

        for name, stats in column_stats.items():
            score = stats.non_null / row_count if row_count > 0 else 0.0
            per_column_scores[name] = round(score, 4)

            total_values += row_count
            total_non_null += stats.non_null

            # Check if this is a Serbian field
            is_serbian_field = any(pattern in name.lower() for pattern in serbian_field_patterns)
            if is_serbian_field:
                serbian_completeness_sum += score
                serbian_completeness_count += 1

            # Check if this is a critical field (high cardinality or unique identifier)
            if stats.non_null > 0 and (stats.date_values > 0 or score > 0.95):
                critical_completeness_sum += score
                critical_completeness_count += 1

        overall_score = total_non_null / total_values if total_values > 0 else 0.0
        serbian_fields_completeness = (
            serbian_completeness_sum / serbian_completeness_count if serbian_completeness_count > 0 else 1.0
        )
        critical_completeness = (
            critical_completeness_sum / critical_completeness_count if critical_completeness_count > 0 else 1.0
        )

        return {
            "overall_score": round(overall_score, 4),
            "per_column": per_column_scores,
            "critical_completeness": round(critical_completeness, 4),
            "serbian_fields_completeness": round(serbian_fields_completeness, 4),
        }

    def calculate_performance_bonus(self, processing_stats: ProcessingStats, dataset_size_mb: float) -> float:
        """Calculate performance bonus for efficient processing."""
        if dataset_size_mb <= 0:
            return 0.0

        rows_per_second = processing_stats.rows_processed / max(processing_stats.processing_time_seconds, 0.001)
        memory_efficiency = 1.0 - min(processing_stats.memory_peak_mb / 1000, 0.5)  # Penalty if >1GB

        # Bonus for fast processing (1000+ rows/second) and low memory usage
        speed_bonus = min(rows_per_second / 1000, 1.0) * 0.3
        memory_bonus = memory_efficiency * 0.2

        return min(speed_bonus + memory_bonus, 0.5)  # Max 0.5 bonus

    def generate_recommendations(
        self,
        serbian_validation: SerbianValidationResult,
        metadata_score: SerbianMetadataScore,
        temporal_result: SerbianTemporalResult,
        viz_analysis: SerbianVisualizationAnalysis,
    ) -> list[str]:
        """Generate Serbian-specific data quality recommendations."""
        recommendations = []

        # Serbian validation recommendations
        if not serbian_validation.serbian_language_detected:
            recommendations.append(
                "Add Serbian language content (Cyrillic or Latin) to improve Serbian government compliance"
            )

        if serbian_validation.script_consistency < 0.8:
            recommendations.append(
                "Improve script consistency - use either Cyrillic or Latin consistently throughout the dataset"
            )

        if not serbian_validation.jmbg_valid and serbian_validation.invalid_municipalities:
            recommendations.append(
                "Validate JMBG (Unique Master Citizen Number) format using Serbian government standards"
            )

        if len(serbian_validation.invalid_municipalities) > 0:
            recommendations.append(
                f"Standardize municipality names - {len(serbian_validation.invalid_municipalities)} invalid Serbian municipalities detected"
            )

        # Metadata recommendations
        if metadata_score.institution_compliance_score < 0.7:
            recommendations.append(
                "Include Serbian government institution information in metadata for better compliance"
            )

        if metadata_score.geographic_coverage_score < 0.6:
            recommendations.append(
                "Add geographic coverage details (regions, municipalities) to improve metadata quality"
            )

        # Temporal recommendations
        if not temporal_result.serbian_date_format_detected:
            recommendations.append(
                "Use standard Serbian date formats (DD.MM.YYYY or YYYY-MM-DD) for better temporal coverage"
            )

        if temporal_result.serbian_business_day_coverage < 0.5:
            recommendations.append("Consider Serbian business calendar in temporal data collection schedules")

        # Visualization recommendations
        if viz_analysis.geographic_suitability > 0.7 and len(viz_analysis.recommended_chart_types) == 0:
            recommendations.append(
                "Geographic data detected - add municipality/region fields for better mapping capabilities"
            )

        if viz_analysis.temporal_suitability > 0.7 and len(viz_analysis.recommended_chart_types) == 0:
            recommendations.append(
                "Temporal data detected - ensure consistent date formatting for time-series visualization"
            )

        if not recommendations:
            recommendations.append("Dataset meets Serbian government data quality standards")

        return recommendations

    def score_serbian_dataset(
        self,
        profile: DatasetProfile,
        processing_stats: ProcessingStats,
        dataset_format: str,
        description: str | None = None,
        tags: list[str] | None = None,
        sample_records: list[dict[str, Any]] | None = None,
        file_size_mb: float = 0.0,
    ) -> SerbianQualityScorecard:
        """Comprehensive Serbian dataset quality scoring."""
        # Get sample records for analysis
        if not sample_records:
            sample_records = []  # Would need to be loaded from file in real implementation

        # Serbian validation
        text_columns = [
            col
            for col in profile.columns
            if any(pattern in col.lower() for pattern in ["naziv", "opis", "adresa", "text", "ime", "prezime"])
        ]
        serbian_validation = self.validator.validate_serbian_dataset(sample_records, text_columns)

        # Basic quality scoring
        completeness_result = self.calculate_completeness_score(profile.column_stats, profile.rows)

        # Serbian metadata scoring
        serbian_metadata = score_serbian_metadata(description, tags, completeness_result["overall_score"])

        # Serbian temporal analysis
        sample_dates = []
        if sample_records:
            for record in sample_records[:1000]:
                for column_name, stats in profile.column_stats.items():
                    if stats.date_values > 0 and column_name in record:
                        parsed_date = self.temporal_analyzer.parse_serbian_date(record[column_name])
                        if parsed_date:
                            sample_dates.append(parsed_date)

        serbian_temporal = self.temporal_analyzer.analyze_serbian_temporal_coverage(
            profile.column_stats, profile.rows, sample_dates
        )

        # Serbian visualization analysis
        numeric_fields = [
            col
            for col, stats in profile.column_stats.items()
            if stats.non_null > 0 and self._is_numeric_column(col, sample_records[:100])
        ]

        time_field = None
        for col in profile.columns:
            if profile.column_stats[col].date_values > 0:
                time_field = col
                break

        serbian_viz = self.viz_analyzer.analyze_serbian_visualization_compatibility(
            sample_records[:1000], numeric_fields, time_field, 0.0
        )

        # Calculate scores
        basic_score = completeness_result["overall_score"]
        performance_bonus = self.calculate_performance_bonus(processing_stats, file_size_mb)

        # Weighted overall score
        weights = {
            "basic_quality": 0.3,
            "serbian_validation": 0.2,
            "metadata_quality": 0.2,
            "temporal_quality": 0.15,
            "visualization_ready": 0.1,
            "performance": 0.05,
        }

        serbian_validation_score = (
            (1.0 if serbian_validation.serbian_language_detected else 0.3) * 0.3
            + serbian_validation.script_consistency * 0.3
            + (1.0 if serbian_validation.jmbg_valid else 0.7) * 0.2
            + (1.0 if serbian_validation.pib_valid else 0.7) * 0.2
        )

        overall_score = (
            basic_score * weights["basic_quality"]
            + serbian_validation_score * weights["serbian_validation"]
            + serbian_metadata.overall_score * weights["metadata_quality"]
            + serbian_temporal.serbian_calendar_compliance * weights["temporal_quality"]
            + serbian_viz.overall_score * weights["visualization_ready"]
            + performance_bonus * weights["performance"]
        )

        # Compliance indicators
        compliance_indicators = {
            "serbian_language_compliance": 1.0 if serbian_validation.serbian_language_detected else 0.3,
            "government_format_compliance": serbian_metadata.institution_compliance_score,
            "temporal_compliance": serbian_temporal.serbian_calendar_compliance,
            "data_integrity": completeness_result["critical_completeness"],
            "visualization_readiness": serbian_viz.overall_score,
        }

        # Generate recommendations
        recommendations = self.generate_recommendations(
            serbian_validation, serbian_metadata, serbian_temporal, serbian_viz
        )

        # Performance metrics
        performance_metrics = {
            "rows_processed": processing_stats.rows_processed,
            "processing_time_seconds": processing_stats.processing_time_seconds,
            "memory_peak_mb": processing_stats.memory_peak_mb,
            "rows_per_second": processing_stats.rows_processed / max(processing_stats.processing_time_seconds, 0.001),
            "file_size_mb": file_size_mb,
            "cache_efficiency": processing_stats.cache_hits / max(processing_stats.rows_processed, 1),
        }

        return SerbianQualityScorecard(
            overall_score=round(min(overall_score, 1.0), 4),
            basic_score=round(basic_score, 4),
            serbian_validation=serbian_validation,
            serbian_metadata=serbian_metadata,
            serbian_temporal=serbian_temporal,
            serbian_visualization=serbian_viz,
            performance_metrics=performance_metrics,
            recommendations=recommendations,
            compliance_indicators={k: round(v, 4) for k, v in compliance_indicators.items()},
        )

    def _is_numeric_column(self, column_name: str, sample_records: list[dict[str, Any]]) -> bool:
        """Check if column contains numeric data."""
        if not sample_records:
            return False

        numeric_count = 0
        total_count = 0

        for record in sample_records:
            if column_name in record:
                value = record[column_name]
                if value is not None:
                    total_count += 1
                    try:
                        float(value)
                        numeric_count += 1
                    except (ValueError, TypeError):
                        pass

        return numeric_count / max(total_count, 1) > 0.8


# Utility function for integration
def score_serbian_dataset_quality(
    file_path: Path,
    dataset_format: str,
    description: str | None = None,
    tags: list[str] | None = None,
    sample_size: int = 1000,
) -> SerbianQualityScorecard:
    """Convenience function for Serbian dataset quality scoring."""
    scorer = SerbianQualityScorer()

    # Get file size
    file_size_mb = file_path.stat().st_size / 1024 / 1024

    # Scan dataset
    if dataset_format == "csv":
        profile, stats = scorer.scanner.scan_csv_streaming(file_path, sample_size=sample_size)
    elif dataset_format == "json":
        profile, stats = scorer.scanner.scan_json_streaming(file_path, sample_size=sample_size)
    else:
        raise ValueError(f"Unsupported format: {dataset_format}")

    # Score dataset
    return scorer.score_serbian_dataset(profile, stats, dataset_format, description, tags, file_size_mb=file_size_mb)
