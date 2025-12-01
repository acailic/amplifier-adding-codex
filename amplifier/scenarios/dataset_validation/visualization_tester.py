from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass


@dataclass
class VisualizationTestResult:
    passed: bool
    message: str
    numeric_fields: list[str]
    time_field: str | None


def test_visualization(records: list[Mapping[str, object]]) -> VisualizationTestResult:
    """Lightweight visualization readiness check.

    Rules:
    - At least one numeric field is required.
    - Optional time/date field improves readiness but is not mandatory.
    """
    if not records:
        return VisualizationTestResult(
            passed=False, message="No records to visualize", numeric_fields=[], time_field=None
        )

    sample = records[0]
    numeric_fields = [key for key, value in sample.items() if _looks_numeric(value)]
    time_field = next((k for k in sample if _looks_time_like(k)), None)

    if not numeric_fields:
        return VisualizationTestResult(
            passed=False,
            message="No numeric fields detected for charting",
            numeric_fields=[],
            time_field=time_field,
        )

    return VisualizationTestResult(
        passed=True,
        message="Ready for simple charts",
        numeric_fields=numeric_fields,
        time_field=time_field,
    )


def _looks_numeric(value: object) -> bool:
    try:
        float(value)  # type: ignore[arg-type]
        return True
    except Exception:
        return False


def _looks_time_like(column_name: str) -> bool:
    name = column_name.lower()
    return "date" in name or "time" in name
