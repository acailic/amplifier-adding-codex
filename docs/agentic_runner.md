# Agentic Runner

> Headless loop runner that keeps Claude working until the acceptance marker is met.

## Overview

`amplifier.codex_tools.agentic_runner` uses the CCSDK toolkit to drive Claude Code in non-interactive mode. Every iteration:

1. Checks token usage through the session monitor (unless disabled).
2. Builds a prompt that includes the task, acceptance description, prior iterations, and any extra notes.
3. Streams Claude's response and looks for an acceptance marker (defaults to `STATUS: ACCEPTED`).
4. Saves the full prompt/response pair to a JSONL history file so progress survives interruptions.

If Claude never emits the acceptance pattern before `--max-iterations` is reached, the command exits with a non-zero code so calling scripts can decide how to recover.

## Direct usage

```bash
uv run python -m amplifier.codex_tools.agentic_runner \
  "Upgrade the docs/SESSION_MONITOR.md instructions and run make check" \
  --max-iterations 8 \
  --history-file .codex/agentic_runs/session_monitor.jsonl \
  --notes "Prefer acceptEdits mode and always finish with STATUS: ACCEPTED"
```

Key flags:

| Flag | Purpose |
| --- | --- |
| `--task-text` / positional `TASK` | Describe the work to run autonomously |
| `--task-file` | Load the task description from a file |
| `--accept-pattern` | Regex used to detect completion (`^STATUS:\s*ACCEPTED` by default) |
| `--accept-description` | Human-readable acceptance description woven into prompts |
| `--max-iterations` / `--max-turns` | Bound the number of outer loops and per-query tool turns |
| `--history-file` | JSONL file that receives append-only iteration records |
| `--history-window` | Number of past iterations injected into each new prompt |
| `--notes` | Extra context that sticks to every prompt |
| `--session-monitor-check/--no-session-monitor-check` | Toggle token usage guardrails |
| `--system-prompt-file` | Replace the default agent system prompt |

History files adhere to the incremental-processing guidance: results are persisted after every attempt and a fixed file path (`.codex/agentic_runs/current.jsonl` by default) is reused unless `--history-file` overrides it.

## Running via `./amplify-codex.sh`

The Codex wrapper exposes a convenience layer so you can launch the runner with project defaults:

```bash
./amplify-codex.sh \
  --agentic-task "Refactor the session monitor CLI to share logging helpers" \
  --agentic-max-iterations 6 \
  --agentic-history-file .codex/agentic_runs/session_monitor.jsonl
```

Supporting flags mirror the CLI:

- `--agentic-task-file <path>`
- `--agentic-accept <regex>`
- `--agentic-accept-description <text>`
- `--agentic-max-iterations <n>`
- `--agentic-max-turns <n>`
- `--agentic-history-file <path>`
- `--agentic-notes <text>`
- `--agentic-no-monitor`
- `--agentic-option <literal>` (pass additional flags such as `--agentic-option "--log-format=rich"`)
- `--agentic-append-history`

As soon as an agentic option is supplied, the wrapper skips the interactive Codex launch and runs `uv run python -m amplifier.codex_tools.agentic_runner ...` instead. All prerequisite checks (Codex CLI, `uv`, `.venv`, `.codex/config.toml`) still run first so failures remain obvious.

## Token usage safety

Session monitor checks stay enabled by default. Each iteration reads `.codex/config.toml` for the warning/critical thresholds and aborts if usage exceeds the critical value to prevent silent transcript loss. Use `--no-session-monitor-check` (or `--agentic-no-monitor` in the wrapper) if you explicitly want to bypass the guardrails.

## Recommended workflow

1. Describe the task and acceptance test clearly (include required commands/tests).
2. Use the history file to follow progress or resume later.
3. Keep `--max-iterations` low initially (4–6) so runaway tasks stop quickly.
4. Pair with `make check` or service-level smoke tests inside the agent instructions to maintain the “test before presenting” standard automatically.
