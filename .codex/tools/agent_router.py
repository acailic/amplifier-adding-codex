"""
Agent router for Codex: map a free-form task description to a project agent file.

Usage:
  uv run python .codex/tools/agent_router.py --task "review src/api.py"
  uv run python .codex/tools/agent_router.py --task "write docs" --output both
  uv run python .codex/tools/agent_router.py --task "design API" --agent api-designer

Outputs either the agent path, name, or both (default: path). Exits non-zero if
no agent could be resolved or the agent file is missing.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable


AGENTS_DIR = Path(__file__).resolve().parent.parent / "agents"

# Ordered by priority; first match wins.
AGENT_KEYWORDS: list[tuple[str, tuple[str, ...]]] = [
    ("code-reviewer", ("review", "pull request", "pr", "regression", "diff")),
    ("qa-expert", ("test", "pytest", "unit test", "integration test", "coverage")),
    ("documentation-engineer", ("doc", "readme", "guide", "documentation", "wiki")),
    ("build-engineer", ("build", "ci", "pipeline", "lint", "format", "ruff", "pyright")),
    ("tooling-engineer", ("tooling", "devex", "dx", "automation", "cli")),
    ("mcp-developer", ("mcp", "model context")),
    ("devops-engineer", ("deploy", "deployment", "devops", "infra", "k8s", "kubernetes", "terraform", "docker")),
    ("backend-developer", ("backend", "server", "api", "endpoint", "fastapi", "flask", "django")),
    ("api-designer", ("api design", "contract", "schema", "openapi", "graphql")),
    ("microservices-architect", ("microservice", "service mesh", "distributed", "saga")),
    ("java-architect", ("java",)),
    ("spring-boot-engineer", ("spring", "spring boot")),
    ("python-pro", ("python", "pyproject", "uv")),
    ("javascript-pro", ("javascript", "js", "node")),
    ("typescript-pro", ("typescript", "ts")),
    ("react-specialist", ("react", "jsx", "tsx")),
    ("angular-architect", ("angular",)),
    ("frontend-developer", ("frontend", "ui", "ux", "web app")),
    ("ui-designer", ("design", "visual", "layout", "mock", "figma")),
    ("dependency-manager", ("dependency", "deps", "package", "lockfile")),
    ("git-workflow-manager", ("git", "branch", "merge", "rebase", "workflow")),
    ("research-analyst", ("research", "investigate", "compare", "analysis")),
]


def match_agent(task: str) -> str | None:
    text = task.lower()
    for agent, keywords in AGENT_KEYWORDS:
        if any(keyword in text for keyword in keywords):
            return agent
    return None


def ensure_agent_path(agent: str) -> Path:
    path = AGENTS_DIR / f"{agent}.md"
    if not path.exists():
        raise FileNotFoundError(f"Agent file not found: {path}")
    return path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Resolve a task to a Codex agent.")
    parser.add_argument("--task", required=True, help="Task description to route.")
    parser.add_argument("--agent", help="Override agent name instead of keyword routing.")
    parser.add_argument(
        "--output",
        choices=("path", "name", "both"),
        default="path",
        help="Output format: agent path, name, or both.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    agent_name = args.agent or match_agent(args.task)
    if not agent_name:
        raise SystemExit("No matching agent found. Provide --agent to override.")

    path = ensure_agent_path(agent_name)

    if args.output == "path":
        print(path)
    elif args.output == "name":
        print(agent_name)
    else:
        print(f"{agent_name}:{path}")


if __name__ == "__main__":
    main()
