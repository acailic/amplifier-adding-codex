"""Tests for Codex CLI reasoning backend."""

from __future__ import annotations

from langchain_core.messages import HumanMessage
from langchain_core.messages import SystemMessage
from scenarios.edge_coach import backends


def _prepare_backend(monkeypatch, **kwargs) -> backends.CodexCLIReasoningBackend:
    """Create backend with CLI checks mocked out."""
    monkeypatch.setattr(backends.shutil, "which", lambda _: "/usr/bin/codex")
    return backends.CodexCLIReasoningBackend(**kwargs)


def test_codex_cli_embedding_parses_json(monkeypatch):
    monkeypatch.setattr(
        backends.CodexCLIReasoningBackend,
        "_run_codex",
        lambda self, prompt: "[0.1, 0.2, -0.3, 0.4]",
    )
    backend = _prepare_backend(monkeypatch, embedding_dim=4, profile="test")

    vector = backend.embed_query("hello world")

    assert vector == [0.1, 0.2, -0.3, 0.4]


def test_codex_cli_embedding_falls_back(monkeypatch):
    monkeypatch.setattr(
        backends.CodexCLIReasoningBackend,
        "_run_codex",
        lambda self, prompt: "not json at all",
    )
    backend = _prepare_backend(monkeypatch, embedding_dim=8, profile="test")

    vector = backend.embed_query("fallback text")

    assert len(vector) == 8
    magnitude = sum(value * value for value in vector) ** 0.5
    assert abs(magnitude - 1.0) < 1e-6


def test_codex_cli_generate_formats_messages(monkeypatch):
    captured: list[str] = []

    def fake_run(self, prompt: str) -> str:
        captured.append(prompt)
        return '{"ok": true}'

    monkeypatch.setattr(backends.CodexCLIReasoningBackend, "_run_codex", fake_run)
    backend = _prepare_backend(monkeypatch, profile="test")

    backend.generate(
        [
            SystemMessage(content="Return JSON."),
            HumanMessage(content="Assess this plan."),
        ]
    )

    assert captured, "Codex CLI should be invoked"
    prompt = captured[0]
    assert "System:" in prompt and "Return JSON." in prompt
    assert "User:" in prompt and "Assess this plan." in prompt
