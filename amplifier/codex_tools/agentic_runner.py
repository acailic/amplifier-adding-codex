#!/usr/bin/env python3
"""
Agentic runner CLI for Amplifier.

Drives Claude Code SDK in a loop until an acceptance marker is produced,
persisting progress after every iteration and respecting session monitor limits.
"""

from __future__ import annotations

import asyncio
import json
import re
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import click

from amplifier.ccsdk_toolkit import ClaudeSession
from amplifier.ccsdk_toolkit import LogFormat
from amplifier.ccsdk_toolkit import LogLevel
from amplifier.ccsdk_toolkit import SessionOptions
from amplifier.ccsdk_toolkit import ToolkitLogger
from amplifier.session_monitor.cli import load_monitor_config
from amplifier.session_monitor.cli import resolve_workspace_name
from amplifier.session_monitor.models import MonitorConfig
from amplifier.session_monitor.models import TokenUsageSnapshot
from amplifier.session_monitor.token_tracker import TokenTracker

DEFAULT_HISTORY_FILE = Path(".codex/agentic_runs/current.jsonl")
DEFAULT_ACCEPT_PATTERN = r"^STATUS:\s*ACCEPTED"
DEFAULT_ACCEPT_DESCRIPTION = "Return `STATUS: ACCEPTED` only when every acceptance test is satisfied."
DEFAULT_SYSTEM_PROMPT = """
You are Amplifier's autonomous implementation agent.
You own the entire task from design through verification and only stop once the
acceptance marker is satisfied. You are ruthless about shipping correct work:
- Drive the repo directly (edit files, run commands, inspect results).
- Always run the minimum verification required before claiming success.
- When you finish, respond with `STATUS: ACCEPTED` and summarize the final change set.
- When more work is needed, use `STATUS: WORKING`, list the next concrete steps,
  and keep iterating without waiting for new human prompts.
""".strip()


@dataclass
class IterationRecord:
    """Captured data for a single iteration."""

    iteration: int
    prompt: str
    response: str
    accepted: bool
    token_usage_pct: float | None
    timestamp: str

    def to_json(self) -> str:
        return json.dumps(
            {
                "iteration": self.iteration,
                "prompt": self.prompt,
                "response": self.response,
                "accepted": self.accepted,
                "token_usage_pct": self.token_usage_pct,
                "timestamp": self.timestamp,
            },
            ensure_ascii=False,
        )


def _build_iteration_prompt(
    task_text: str,
    acceptance_description: str,
    iteration: int,
    history: Sequence[IterationRecord],
    notes: str | None,
    workspace: Path,
) -> str:
    history_section = "No completed iterations yet."
    if history:
        summaries = []
        for entry in history:
            snippet = entry.response.strip()
            if len(snippet) > 800:
                snippet = f"{snippet[:800]}…"
            summaries.append(f"Iteration {entry.iteration} ({'ACCEPTED' if entry.accepted else 'WORKING'}):\n{snippet}")
        history_section = "\n\n".join(summaries)

    optional_notes = f"\nAdditional context:\n{notes.strip()}" if notes else ""

    return f"""
# Autonomous Task
Workspace: {workspace}
Iteration: {iteration}

Task:
{task_text.strip()}

Acceptance target:
{acceptance_description.strip()}

History snapshot:
{history_section}
{optional_notes}

Instructions:
- Continue executing the plan independently until acceptance.
- Use any necessary repo tools (Bash, tests, formatters) to make progress.
- Log the commands you run and the results you observe.
- Verify your changes before returning to the user.
- Respond exactly in this structure:

STATUS: WORKING or STATUS: ACCEPTED
SUMMARY:
- Bullet list of the most important actions taken this iteration.
LOG:
- Key commands, files touched, or test output snippets.
VERIFICATION:
- Tests/checks you ran and whether they passed.
NEXT_ACTIONS:
- Concrete next steps if more work remains (or `none` once accepted).
REQUESTS:
- What you still need from the user (or `none`).
""".strip()


def _prepare_history_file(path: Path, append: bool) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not append and path.exists():
        path.unlink()


def _append_history_record(path: Path, record: IterationRecord) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write(record.to_json())
        handle.write("\n")


def _ensure_task_text(task_parts: Sequence[str], task_text: str | None, task_file: Path | None) -> str:
    pieces: list[str] = []
    if task_text:
        pieces.append(task_text)
    if task_parts:
        pieces.append(" ".join(task_parts))
    if task_file:
        pieces.append(task_file.read_text())

    combined = "\n".join([part.strip() for part in pieces if part.strip()])
    if not combined:
        msg = "Provide a task via positional args, --task-text, or --task-file."
        raise click.BadParameter(msg)
    return combined


def _compile_accept_pattern(pattern: str) -> re.Pattern[str]:
    try:
        return re.compile(pattern, flags=re.IGNORECASE | re.MULTILINE)
    except re.error as exc:
        raise click.BadParameter(f"Invalid acceptance pattern: {exc}") from exc


def _load_monitor_settings(config_override: Path | None) -> tuple[MonitorConfig, str]:
    if config_override:
        return load_monitor_config(str(config_override))
    return load_monitor_config(None)


def _check_token_usage(
    tracker: TokenTracker,
    config: MonitorConfig,
    workspace_id: str,
    logger: ToolkitLogger,
) -> TokenUsageSnapshot:
    usage = tracker.get_current_usage(workspace_id)
    should_terminate, reason = tracker.should_terminate(usage, config)
    context = {
        "usage_pct": usage.usage_pct,
        "estimated_tokens": usage.estimated_tokens,
        "source": usage.source,
    }
    if should_terminate:
        logger.error("Token usage critical", **context)
        raise click.ClickException(
            f"{reason}. Run `uv run session-monitor request-termination --reason token_limit_approaching "
            f"--continuation-command 'claude --continue' --priority graceful` then resume."
        )
    if usage.usage_pct >= config.token_warning_threshold:
        logger.warning(reason, **context)
    else:
        logger.info("Token usage within safe limits", **context)
    return usage


def _resolve_log_format(value: str) -> LogFormat:
    try:
        return LogFormat(value)
    except ValueError:
        raise click.BadParameter("Unsupported log format") from None


@click.command(context_settings={"help_option_names": ["-h", "--help"]})
@click.argument("task", nargs=-1)
@click.option("--task-text", help="Task description string (overrides positional TASK).")
@click.option(
    "--task-file",
    type=click.Path(dir_okay=False, exists=True, path_type=Path),
    help="Path to a file that describes the task.",
)
@click.option(
    "--accept-pattern",
    default=DEFAULT_ACCEPT_PATTERN,
    show_default=True,
    help="Regex that marks a response as accepted.",
)
@click.option(
    "--accept-description",
    default=DEFAULT_ACCEPT_DESCRIPTION,
    show_default=True,
    help="Plain-language acceptance description surfaced to the agent.",
)
@click.option("--max-iterations", default=5, show_default=True, type=click.IntRange(1, 20))
@click.option("--max-turns", default=3, show_default=True, type=click.IntRange(1, 10))
@click.option(
    "--history-file",
    default=DEFAULT_HISTORY_FILE,
    show_default=True,
    type=click.Path(dir_okay=False, path_type=Path),
    help="JSONL file used to persist iteration records.",
)
@click.option("--history-window", default=3, show_default=True, type=click.IntRange(1, 10))
@click.option("--append-history", is_flag=True, help="Append to the existing history file instead of replacing it.")
@click.option("--system-prompt-file", type=click.Path(dir_okay=False, exists=True, path_type=Path))
@click.option("--notes", help="Additional context that should be injected into every prompt.")
@click.option("--workspace-id", help="Workspace identifier for token tracking override.")
@click.option("--monitor-config", type=click.Path(dir_okay=False, exists=True, path_type=Path))
@click.option(
    "--session-monitor-check/--no-session-monitor-check",
    default=True,
    show_default=True,
    help="Check token usage through the session monitor before every iteration.",
)
@click.option("--stream/--no-stream", default=True, show_default=True, help="Stream Claude output in real time.")
@click.option("--verbose", is_flag=True, help="Enable verbose logging.")
@click.option(
    "--log-format",
    type=click.Choice([fmt.value for fmt in LogFormat]),
    default=LogFormat.PLAIN.value,
    show_default=True,
    help="Logging format.",
)
def cli(
    task: tuple[str, ...],
    task_text: str | None,
    task_file: Path | None,
    accept_pattern: str,
    accept_description: str,
    max_iterations: int,
    max_turns: int,
    history_file: Path,
    history_window: int,
    append_history: bool,
    system_prompt_file: Path | None,
    notes: str | None,
    workspace_id: str | None,
    monitor_config: Path | None,
    session_monitor_check: bool,
    stream: bool,
    verbose: bool,
    log_format: str,
) -> None:
    """Drive Claude Code autonomously until acceptance criteria are met."""

    resolved_task = _ensure_task_text(task, task_text, task_file)
    accept_regex = _compile_accept_pattern(accept_pattern)
    _prepare_history_file(history_file, append_history)
    workspace = Path.cwd()
    system_prompt = system_prompt_file.read_text().strip() if system_prompt_file else DEFAULT_SYSTEM_PROMPT

    logger = ToolkitLogger(
        name="agentic_runner",
        level=LogLevel.DEBUG if verbose else LogLevel.INFO,
        format=_resolve_log_format(log_format),
    )
    logger.info("Agentic runner starting", workspace=str(workspace))

    monitor_cfg: MonitorConfig | None = None
    monitor_source = None
    tracker: TokenTracker | None = None
    if session_monitor_check:
        monitor_cfg, monitor_source = _load_monitor_settings(monitor_config)
        tracker = TokenTracker()
        logger.info("Loaded session monitor config", source=monitor_source)

    asyncio.run(
        _run_iterations(
            resolved_task=resolved_task,
            acceptance_description=accept_description,
            accept_regex=accept_regex,
            history_file=history_file,
            history_window=history_window,
            max_iterations=max_iterations,
            max_turns=max_turns,
            system_prompt=system_prompt,
            notes=notes,
            workspace=workspace,
            session_monitor_check=session_monitor_check,
            monitor_config=monitor_cfg,
            tracker=tracker,
            workspace_override=workspace_id,
            stream=stream,
            logger=logger,
        )
    )


async def _run_iterations(
    resolved_task: str,
    acceptance_description: str,
    accept_regex: re.Pattern[str],
    history_file: Path,
    history_window: int,
    max_iterations: int,
    max_turns: int,
    system_prompt: str,
    notes: str | None,
    workspace: Path,
    session_monitor_check: bool,
    monitor_config: MonitorConfig | None,
    tracker: TokenTracker | None,
    workspace_override: str | None,
    stream: bool,
    logger: ToolkitLogger,
) -> None:
    options = SessionOptions(system_prompt=system_prompt, max_turns=max_turns, stream_output=stream)
    history: list[IterationRecord] = []
    workspace_id = resolve_workspace_name(workspace_override)

    async with ClaudeSession(options) as session:
        for iteration in range(1, max_iterations + 1):
            logger.info("Starting iteration", iteration=iteration)
            usage_snapshot: TokenUsageSnapshot | None = None
            if session_monitor_check and tracker and monitor_config:
                usage_snapshot = _check_token_usage(tracker, monitor_config, workspace_id, logger)

            prompt_history = history[-history_window:]
            prompt = _build_iteration_prompt(
                resolved_task,
                acceptance_description,
                iteration,
                prompt_history,
                notes,
                workspace,
            )
            logger.log_query(prompt)

            response = await session.query(prompt, stream=stream)
            if not response.success:
                logger.error("Iteration failed", error=Exception(response.error or "Unknown error"))
                raise click.ClickException(response.error or "Iteration failed with no details")

            content = response.content.strip()
            accepted = bool(accept_regex.search(content))
            history_entry = IterationRecord(
                iteration=iteration,
                prompt=prompt,
                response=content,
                accepted=accepted,
                token_usage_pct=usage_snapshot.usage_pct if usage_snapshot else None,
                timestamp=datetime.now().isoformat(),
            )
            history.append(history_entry)
            _append_history_record(history_file, history_entry)

            status = "ACCEPTED" if accepted else "WORKING"
            logger.info("Iteration complete", iteration=iteration, status=status)

            if accepted:
                click.echo("✅ Acceptance marker detected. Final response:")
                click.echo(content)
                return

        raise click.ClickException(
            f"Acceptance pattern not reached after {max_iterations} iterations. "
            "Review history file for progress and rerun with updated parameters."
        )


if __name__ == "__main__":
    cli()
