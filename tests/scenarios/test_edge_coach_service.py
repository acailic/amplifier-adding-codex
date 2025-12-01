"""Tests for Edge Coach service orchestration."""

from __future__ import annotations

import json

from scenarios.edge_coach.service import EdgeCoachService
from scenarios.edge_coach.storage import EdgeCoachStore


class FakeBackend:
    """Deterministic backend for tests."""

    name = "fake"

    def embed_documents(self, texts):
        return [[1.0, 0.0, 0.0] for _ in texts]

    def embed_query(self, text):
        return [1.0, 0.0, 0.0]

    def generate(self, messages) -> str:  # type: ignore[override]
        system_prompt = messages[0].content if messages else ""

        if "Meta Coach" in system_prompt:
            return json.dumps(
                {
                    "summary": "synthesis-summary",
                    "tradeoffs": ["risk vs reward"],
                    "recommended_focus": ["ship iterative MVP"],
                    "decision_guardrails": ["protect IC focus time"],
                    "next_review": "in 2 weeks",
                    "success_metrics": {
                        "time": 0.6,
                        "capital": 0.4,
                        "mastery": 0.7,
                        "meaning": 0.8,
                        "confidence": 0.65,
                    },
                }
            )

        if "Current Self" in system_prompt:
            persona = "current"
        elif "Future Self" in system_prompt:
            persona = "future"
        else:
            persona = "family"

        return json.dumps(
            {
                "stance": f"{persona} stance",
                "risks": [f"{persona} risk"],
                "opportunities": [f"{persona} upside"],
                "recommended_actions": [f"{persona} action"],
                "confidence": 0.7,
                "scorecard": {
                    "time": 0.5,
                    "capital": 0.5,
                    "mastery": 0.6,
                    "meaning": 0.7,
                },
            }
        )


def test_service_creates_record(tmp_path, monkeypatch):
    """Service should orchestrate personas, synthesis, and persistence."""
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")

    store = EdgeCoachStore(base_dir=tmp_path)
    service = EdgeCoachService(backend=FakeBackend(), store=store)

    result = service.ask("Test decision about launching a new data pipeline.")

    assert result.decision_id == 1
    assert result.backend_name == "fake"
    assert len(result.persona_outputs) == 3
    assert result.synthesis.summary == "synthesis-summary"
    assert result.synthesis.success_metrics["confidence"] == 0.65

    history = service.history(limit=5)
    assert history and history[0].id == result.decision_id

    stored = service.show(result.decision_id)
    assert stored is not None
    assert stored.summary == "synthesis-summary"
