from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "ai_working/problempulse/src"))

import httpx  # noqa: E402
import pytest  # noqa: E402
from problempulse.ingest.sources import DiscordExportSource  # noqa: E402
from problempulse.ingest.sources import GitHubIssuesSource  # noqa: E402
from problempulse.ingest.sources import gather_sources  # noqa: E402


def test_github_issues_source_filters_prs_and_non_signals():
    payload = {
        "items": [
            {
                "title": "Deploying OPA locally is painful",
                "body": "Manual copy paste for every policy update.",
                "created_at": "2024-01-10T12:30:00Z",
                "html_url": "https://github.com/example/repo/issues/42",
                "repository_url": "https://api.github.com/repos/example/repo",
                "user": {"login": "alice"},
                "number": 42,
                "comments": 7,
                "state": "open",
            },
            {
                "title": "Add new feature",
                "body": "Just an idea without any frustration keywords.",
                "created_at": "2024-01-10T12:31:00Z",
                "html_url": "https://github.com/example/repo/issues/43",
                "repository_url": "https://api.github.com/repos/example/repo",
                "user": {"login": "bob"},
                "number": 43,
                "comments": 1,
                "state": "open",
            },
            {
                "title": "Pull request that should be ignored",
                "body": "Implements X",
                "created_at": "2024-01-10T12:32:00Z",
                "html_url": "https://github.com/example/repo/pull/44",
                "repository_url": "https://api.github.com/repos/example/repo",
                "user": {"login": "carol"},
                "number": 44,
                "comments": 0,
                "state": "open",
                "pull_request": {},
            },
        ]
    }

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.host == "api.github.com"
        return httpx.Response(200, json=payload)

    transport = httpx.MockTransport(handler)
    client = httpx.Client(transport=transport)
    source = GitHubIssuesSource(queries=["repo:example/repo"], client=client)

    records = source.fetch(limit=5)

    assert len(records) == 1
    record = records[0]
    assert record.source == "github"
    assert record.metadata["repository"] == "example/repo"
    assert record.metadata["issue_number"] == 42
    assert record.author == "alice"
    assert record.extracted_problem == "Deploying OPA locally is painful"
    assert record.raw_text.startswith("Deploying OPA locally is painful")


def test_discord_export_source_tracks_state_and_skips_processed(tmp_path: Path):
    export_dir = tmp_path / "exports"
    export_dir.mkdir()
    export = export_dir / "messages.json"
    messages = [
        {
            "id": "m-1",
            "content": "Deploying Rego policies is painful and tedious right now.",
            "author": {"name": "DevUser"},
            "timestamp": "2024-01-15T09:00:00Z",
            "url": "https://discord.com/channels/1/2/3",
            "channel": "opa-help",
            "server": "Policy Builders",
        },
        {
            "id": "m-2",
            "content": "Thanks everyone!",
            "author": "DevUser",
            "timestamp": "2024-01-15T09:05:00Z",
            "url": "https://discord.com/channels/1/2/4",
            "channel": "opa-help",
            "server": "Policy Builders",
        },
    ]
    export.write_text(json.dumps(messages), encoding="utf-8")

    source = DiscordExportSource(export_dir=export_dir)
    first_batch = source.fetch(limit=5)

    assert len(first_batch) == 1
    record = first_batch[0]
    assert record.source == "discord"
    assert record.metadata["message_id"] == "m-1"
    assert record.metadata["channel"] == "opa-help"
    assert record.metadata["export_file"] == "messages.json"

    state_path = export.with_suffix(export.suffix + ".state")
    assert state_path.exists()
    processed_ids = json.loads(state_path.read_text(encoding="utf-8"))
    assert set(processed_ids) == {"m-1", "m-2"}

    second_batch = source.fetch(limit=5)
    assert second_batch == []


def test_gather_sources_subset_preserves_order():
    subset = ("discord", "github")
    sources = gather_sources(selected=subset)
    assert [source.name for source in sources] == list(subset)


def test_gather_sources_rejects_unknown_source():
    with pytest.raises(ValueError):
        gather_sources(selected=["unknown_source"])
