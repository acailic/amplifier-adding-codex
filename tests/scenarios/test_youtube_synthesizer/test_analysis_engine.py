"""Tests for the YouTube synthesizer analysis engine."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from scenarios.youtube_synthesizer.analysis_engine import AnalysisEngine
from scenarios.youtube_synthesizer.analysis_engine import AnalysisSettings
from scenarios.youtube_synthesizer.state import TranscriptMetadata


@pytest.mark.asyncio
async def test_analyze_writes_expected_outputs(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Ensure the analysis engine writes artifacts and updates metadata."""
    engine = AnalysisEngine(
        output_dir=tmp_path,
        settings=AnalysisSettings(chunk_char_threshold=50, chunk_size=50, chunk_overlap=0),
    )

    transcript = "Chunk one content. " * 5 + "Chunk two content. " * 5
    metadata = TranscriptMetadata(source="youtube", title="Test Video")

    async def fake_invoke(self, prompt: str, system: str) -> str:  # type: ignore[override]
        if "Summarize this transcript segment" in prompt:
            return "- bullet A\n- bullet B"
        return json.dumps(
            {
                "core_ideas": ["Idea 1", "Idea 2"],
                "hidden_lessons": ["Lesson"],
                "real_world_applications": ["Apply it"],
                "contradictions_or_biases": ["Bias"],
                "summary_capsule": "Summary paragraph.",
                "tiered_summary": {
                    "two_minute_version": "Two-minute overview.",
                    "ten_minute_version": "Ten-minute deep dive.",
                },
            }
        )

    monkeypatch.setattr(AnalysisEngine, "_invoke_claude", fake_invoke, raising=False)

    result = await engine.analyze(transcript, metadata, include_tiered_summary=True)

    assert metadata.chunk_count and metadata.chunk_count > 1
    assert (tmp_path / "core_ideas.md").exists()
    assert result.outputs.tiered_summary is not None
    tiered_content = Path(result.outputs.tiered_summary).read_text(encoding="utf-8")
    assert "Two-minute overview" in tiered_content


def test_subrip_parsing_removes_timestamps(tmp_path: Path) -> None:
    """Ensure SubRip/VTT parsing strips timing information."""
    from scenarios.youtube_synthesizer.transcript_fetcher.core import TranscriptFetcher

    fetcher = TranscriptFetcher(tmp_path)
    sample = """WEBVTT

1
00:00:00.000 --> 00:00:01.000
Hello world.

2
00:00:01.000 --> 00:00:02.000
Another line.
"""
    text = fetcher._parse_subrip_like(sample)  # noqa: SLF001 (test access to private helper)
    assert "00:00" not in text
    assert "Hello world" in text
