from __future__ import annotations

from dataclasses import dataclass

from .models import ColumnStats


@dataclass
class CompletenessResult:
    """Completeness scores at dataset and column level."""

    score: float
    per_column: dict[str, float]
    total_cells: int
    non_null_cells: int
    row_count: int


def compute_completeness(column_stats: dict[str, ColumnStats], row_count: int) -> CompletenessResult:
    """Compute completeness scores from collected column statistics."""
    per_column: dict[str, float] = {}
    total_cells = 0
    non_null_cells = 0

    for name, stats in column_stats.items():
        if stats.total == 0:
            per_column[name] = 0.0
            continue

        column_score = stats.non_null / stats.total
        per_column[name] = round(column_score, 4)
        total_cells += stats.total
        non_null_cells += stats.non_null

    overall = (non_null_cells / total_cells) if total_cells else 0.0

    return CompletenessResult(
        score=round(overall, 4),
        per_column=per_column,
        total_cells=total_cells,
        non_null_cells=non_null_cells,
        row_count=row_count,
    )
