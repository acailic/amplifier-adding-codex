from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .models import ColumnStats

DATETIME_PATTERNS: tuple[str, ...] = (
    "%Y-%m-%d",
    "%Y/%m/%d",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M:%S",
    "%d.%m.%Y",
    "%d/%m/%Y",
    "%m/%d/%Y",
)


@dataclass
class TemporalCoverageResult:
    """Temporal coverage analysis result."""

    score: float
    column: str | None
    earliest: datetime | None
    latest: datetime | None
    coverage_days: int
    date_columns: dict[str, dict]
    reason: str


def parse_date(value: object) -> datetime | None:
    """Attempt to parse a value into a datetime."""
    if value is None:
        return None

    if isinstance(value, datetime):
        return value

    if isinstance(value, (int, float)):
        # Avoid treating numeric columns as dates
        return None

    if not isinstance(value, str):
        return None

    text = value.strip()
    if not text:
        return None

    # ISO-8601 first
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        pass

    for pattern in DATETIME_PATTERNS:
        try:
            return datetime.strptime(text, pattern)
        except ValueError:
            continue

    return None


def _score_range_days(days: int) -> float:
    """Map coverage days to a score between 0 and 1."""
    if days >= 365 * 3:
        return 1.0
    if days >= 365:
        return 0.85
    if days >= 180:
        return 0.75
    if days >= 90:
        return 0.6
    if days >= 30:
        return 0.45
    if days > 0:
        return 0.25
    return 0.0


def analyze_temporal_coverage(
    column_stats: dict[str, ColumnStats],
    row_count: int,
) -> TemporalCoverageResult:
    """Analyze temporal coverage by inspecting columns with parsed dates."""
    best_column: str | None = None
    best_score = 0.0
    best_days = 0
    best_min: datetime | None = None
    best_max: datetime | None = None

    date_columns: dict[str, dict] = {}

    for name, stats in column_stats.items():
        if stats.date_values == 0 or stats.date_min is None or stats.date_max is None:
            continue

        coverage_days = (stats.date_max - stats.date_min).days
        coverage_score = _score_range_days(coverage_days)

        # Penalize if only a handful of dates were detected relative to rows
        if row_count:
            density = stats.date_values / row_count
            if density < 0.1:
                coverage_score *= 0.7

        date_columns[name] = {
            "date_values": stats.date_values,
            "earliest": stats.date_min.isoformat(),
            "latest": stats.date_max.isoformat(),
            "coverage_days": coverage_days,
            "density": round((stats.date_values / row_count), 4) if row_count else 0,
            "score": round(coverage_score, 4),
        }

        if coverage_score > best_score:
            best_score = coverage_score
            best_column = name
            best_days = coverage_days
            best_min = stats.date_min
            best_max = stats.date_max

    if best_column is None:
        return TemporalCoverageResult(
            score=0.0,
            column=None,
            earliest=None,
            latest=None,
            coverage_days=0,
            date_columns=date_columns,
            reason="No date-like columns detected",
        )

    reason = f"Using column '{best_column}' with {best_days} day range"
    return TemporalCoverageResult(
        score=round(best_score, 4),
        column=best_column,
        earliest=best_min,
        latest=best_max,
        coverage_days=best_days,
        date_columns=date_columns,
        reason=reason,
    )
