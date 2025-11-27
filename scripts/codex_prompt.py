#!/usr/bin/env python3
"""
Build Codex stdin prompts from agent definitions.

Usage:
    python scripts/codex_prompt.py --agent .codex/agents/bug-hunter.md --task "Find bug" | codex exec -
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise SystemExit(f"Agent file not found: {path}") from exc


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"Context file not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in context file {path}: {exc}") from exc


def build_prompt(agent_text: str, task: str, context: Any | None) -> str:
    lines: list[str] = [agent_text.rstrip(), ""]

    lines.append("## Current Task Context")
    if context is None:
        lines.append("(no additional context supplied)")
    else:
        context_json = json.dumps(context, indent=2, ensure_ascii=False)
        lines.append("```json")
        lines.append(context_json)
        lines.append("```")

    lines.extend(["", "## Task", task.strip(), ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build stdin prompts for codex exec -")
    parser.add_argument("--agent", required=True, help="Path to agent markdown file")
    parser.add_argument("--task", required=True, help="Task description")
    parser.add_argument("--context", help="Optional path to JSON context file")
    args = parser.parse_args()

    agent_text = read_text(Path(args.agent))
    context = load_json(Path(args.context)) if args.context else None
    prompt = build_prompt(agent_text, args.task, context)
    print(prompt)


if __name__ == "__main__":
    main()
