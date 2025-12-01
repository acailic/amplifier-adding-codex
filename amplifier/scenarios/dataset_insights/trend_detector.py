from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

import numpy as np


@dataclass
class TrendResult:
    field: str
    percent_change: float
    slope: float


def compute_trend(values: Sequence[float]) -> TrendResult | None:
    """Calculate slope and percent change; return None if insufficient points."""
    if len(values) < 5:
        return None

    y = np.array(values, dtype=float)
    x = np.arange(len(y), dtype=float)

    # Least squares slope
    slope = float(np.polyfit(x, y, 1)[0])
    if np.isfinite(y[0]) and y[0] != 0:
        percent_change = float(((y[-1] - y[0]) / abs(y[0])) * 100)
    else:
        percent_change = 0.0

    return TrendResult(field="", percent_change=percent_change, slope=slope)


def detect_trends(field: str, values: Sequence[float]) -> list[TrendResult]:
    result = compute_trend(values)
    if not result:
        return []
    if abs(result.percent_change) < 10:
        return []
    result.field = field
    return [result]
