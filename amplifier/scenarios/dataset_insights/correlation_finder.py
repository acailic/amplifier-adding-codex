from __future__ import annotations

from collections.abc import Iterable
from collections.abc import Sequence
from dataclasses import dataclass
from itertools import combinations

import numpy as np


@dataclass
class CorrelationResult:
    fields: tuple[str, str]
    coefficient: float


def pearson(a: Sequence[float], b: Sequence[float]) -> float | None:
    if len(a) < 10 or len(b) < 10:
        return None
    arr_a = np.array(a, dtype=float)
    arr_b = np.array(b, dtype=float)
    n = min(len(arr_a), len(arr_b))
    arr_a = arr_a[:n]
    arr_b = arr_b[:n]
    if np.std(arr_a) == 0 or np.std(arr_b) == 0:
        return None
    r = float(np.corrcoef(arr_a, arr_b)[0, 1])
    if np.isnan(r):
        return None
    return r


def detect_correlations(series: dict[str, Iterable[float]]) -> list[CorrelationResult]:
    results: list[CorrelationResult] = []
    for left, right in combinations(series.keys(), 2):
        r = pearson(list(series[left]), list(series[right]))
        if r is None or abs(r) < 0.65:
            continue
        results.append(CorrelationResult(fields=(left, right), coefficient=r))
    return results
