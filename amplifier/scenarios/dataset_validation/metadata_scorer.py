from __future__ import annotations

from dataclasses import dataclass


@dataclass
class MetadataScore:
    score: float
    description_score: float
    tag_score: float
    description_length: int
    tag_count: int
    reason: str


def _score_description(length: int) -> float:
    if length >= 400:
        return 1.0
    if length >= 250:
        return 0.85
    if length >= 120:
        return 0.7
    if length >= 60:
        return 0.5
    if length > 0:
        return 0.3
    return 0.0


def _score_tags(count: int) -> float:
    if count >= 8:
        return 1.0
    if count >= 5:
        return 0.8
    if count >= 3:
        return 0.6
    if count >= 1:
        return 0.4
    return 0.0


def score_metadata(description: str | None, tags: list[str] | None) -> MetadataScore:
    """Score metadata richness based on description length and tag count."""
    desc = description or ""
    tag_list = tags or []

    desc_len = len(desc.strip())
    tag_count = len([t for t in (tag_list) if t and t.strip()])

    desc_score = _score_description(desc_len)
    tag_score = _score_tags(tag_count)
    composite = round(desc_score * 0.6 + tag_score * 0.4, 4)

    reason = f"Description length {desc_len} and {tag_count} tags"

    return MetadataScore(
        score=composite,
        description_score=round(desc_score, 4),
        tag_score=round(tag_score, 4),
        description_length=desc_len,
        tag_count=tag_count,
        reason=reason,
    )
