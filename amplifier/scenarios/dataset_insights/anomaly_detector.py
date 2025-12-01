from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

import numpy as np


@dataclass
class AnomalyResult:
    field: str
    index: int
    value: float
    z_score: float


def detect_anomalies(field: str, values: Sequence[float]) -> list[AnomalyResult]:
    if len(values) < 8:
        return []
    arr = np.array(values, dtype=float)
    mean = float(np.mean(arr))
    std = float(np.std(arr))
    if std == 0:
        return []

    z_scores = (arr - mean) / std
    candidates = np.where(np.abs(z_scores) >= 2.0)[0]
    if len(candidates) == 0:
        return []

    strongest_idx = candidates[np.argmax(np.abs(z_scores[candidates]))]
    return [
        AnomalyResult(
            field=field,
            index=int(strongest_idx),
            value=float(arr[strongest_idx]),
            z_score=float(z_scores[strongest_idx]),
        )
    ]
