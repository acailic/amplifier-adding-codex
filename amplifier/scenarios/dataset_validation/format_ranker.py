"""Rank dataset formats by preference."""

from __future__ import annotations

from dataclasses import dataclass

PREFERRED_FORMAT_SCORES = {
    "csv": 1.0,
    "json": 0.9,
    "xls": 0.7,
    "xlsx": 0.7,
    "xml": 0.5,
}


@dataclass
class FormatScore:
    score: float
    normalized_format: str
    reason: str


def score_format(dataset_format: str | None) -> FormatScore:
    """Score the dataset format by preference."""
    if dataset_format is None:
        return FormatScore(
            score=0.5, normalized_format="unknown", reason="Format not provided; defaulting to neutral score"
        )

    normalized = dataset_format.lower()
    base_score = PREFERRED_FORMAT_SCORES.get(normalized, 0.5)
    reason = f"Scored via preference map (csv > json > xls/xlsx > xml > other) as {base_score}"
    return FormatScore(score=base_score, normalized_format=normalized, reason=reason)
