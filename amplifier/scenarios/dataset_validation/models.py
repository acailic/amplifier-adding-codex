from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class ColumnStats:
    """Basic statistics collected per column during dataset scanning."""

    name: str
    total: int = 0
    non_null: int = 0
    date_min: datetime | None = None
    date_max: datetime | None = None
    date_values: int = 0

    def register(self, value: object, parsed_date: datetime | None) -> None:
        """Update counters for a single cell."""
        self.total += 1
        if value is not None:
            self.non_null += 1

        if parsed_date is None:
            return

        self.date_values += 1
        if self.date_min is None or parsed_date < self.date_min:
            self.date_min = parsed_date
        if self.date_max is None or parsed_date > self.date_max:
            self.date_max = parsed_date


@dataclass
class DatasetProfile:
    """Aggregate information extracted from a dataset scan."""

    rows: int
    columns: list[str]
    column_stats: dict[str, ColumnStats]
