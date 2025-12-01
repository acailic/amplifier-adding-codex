from __future__ import annotations

import json
from pathlib import Path

import pytest

from scenarios.youtube_synthesizer.analysis_engine.core import AnalysisEngine
from scenarios.youtube_synthesizer.analysis_engine.core import AnalysisSettings
from scenarios.youtube_synthesizer.analysis_engine.core import ClaudeSessionLimitError
from scenarios.youtube_synthesizer.state import TranscriptMetadata


class DummyEngine(AnalysisEngine):
    """Test double that feeds deterministic responses to the analysis engine."""

    def __init__(
        self,
        output_dir: Path,
        settings: AnalysisSettings,
        chunks: list[str],
        responses: list[str],
    ) -> None:
        super().__init__(output_dir, settings=settings)
        self._test_chunks = chunks
        self._responses = responses

    def _chunk_text(self, text: str):
        yield from self._test_chunks

    async def _invoke_claude(self, prompt: str, system: str) -> str:
        if not self._responses:
            pytest.fail("Claude invoked more times than expected.")
        response = self._responses.pop(0)
        if "session limit reached" in response.lower():
            raise ClaudeSessionLimitError("Session limit reached")
        return response


@pytest.mark.asyncio
async def test_batch_chunk_summaries(tmp_path: Path) -> None:
    """Chunk summaries are generated via batched requests and written per segment."""
    responses = [
        json.dumps(
            {
                "chunks": [
                    {"id": 1, "bullets": ["First take", "Second take"]},
                    {"id": 2, "bullets": ["Another insight"]},
                    {"id": 3, "bullets": ["Final note"]},
                ]
            }
        ),
        json.dumps(
            {
                "core_ideas": ["Idea"],
                "hidden_lessons": ["Hidden"],
                "real_world_applications": ["Do this"],
                "contradictions_or_biases": [],
                "summary_capsule": "Summary.",
                "tiered_summary": None,
            }
        ),
    ]
    settings = AnalysisSettings(
        chunk_char_threshold=10,
        chunk_size=5,
        chunk_overlap=0,
        chunk_batch_size=3,
        chunk_batch_char_limit=100,
        retry_attempts=1,
    )
    engine = DummyEngine(
        tmp_path,
        settings=settings,
        chunks=["chunk one text", "chunk two text", "chunk three text"],
        responses=responses,
    )

    metadata = TranscriptMetadata(source="youtube", title="Test", language="en")
    result = await engine.analyze("ignored transcript", metadata, include_tiered_summary=False)

    # Three chunk summary files written with bullet formatting.
    chunk_paths = sorted(result.chunk_summaries)
    assert len(chunk_paths) == 3
    contents = [Path(path).read_text().strip() for path in chunk_paths]
    assert contents[0] == "- First take\n- Second take"
    assert contents[1] == "- Another insight"
    assert contents[2] == "- Final note"

    # Main analysis artifacts exist.
    assert Path(result.outputs.core_ideas or "").read_text().strip()  # type: ignore[arg-type]
    assert Path(result.outputs.summary_capsule or "").read_text().strip()  # type: ignore[arg-type]


@pytest.mark.asyncio
async def test_session_limit_detection(tmp_path: Path) -> None:
    settings = AnalysisSettings(chunk_char_threshold=5, chunk_size=5, chunk_overlap=0, retry_attempts=1)

    engine = DummyEngine(
        tmp_path,
        settings=settings,
        chunks=["short"],
        responses=["Session limit reached ∙ resets 7pm"],
    )
    metadata = TranscriptMetadata(source="youtube")

    with pytest.raises(ClaudeSessionLimitError):
        await engine.analyze("ignored", metadata, include_tiered_summary=False)
