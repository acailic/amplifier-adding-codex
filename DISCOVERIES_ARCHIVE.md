# DISCOVERIES ARCHIVE

This file contains older discovery entries that have been archived from the main DISCOVERIES.md file. These entries document problems that have been resolved or are specific to past project states.

For current discoveries and timeless patterns, see DISCOVERIES.md.

---

## 2025-10-30 – Elite Coach Reflections Duplicated Practice Sessions

### Issue
Running `elite-coach reflect` and recording a mental model created duplicate rows in the practice session log and inflated session counts in the dashboard.

### Root Cause
`EliteCoachService.capture_mental_model()` fetched the original session, appended the new model, and called `save_practice_session()`. That helper always performs an INSERT, so reflections re-saved the entire session as a brand-new row while also persisting the mental model.

### Solution
Introduced `EliteCoachStore.append_mental_model()` to append models atomically. `capture_mental_model()` now calls this method, which updates both the `mental_models` table and the JSON blob on the existing session row instead of inserting a new session.

### Prevention
- Provide dedicated append/update helpers in the store instead of reusing insert-only helpers.
- When adding incremental persistence features, verify whether the data access layer performs INSERT vs. UPSERT semantics.
- Add dashboard summaries that surface unexpected jumps in counts (sessions vs. mental models) so data drift is visible quickly.

## 2025-10-29 – Duplicate Oracle DataSource Bean During Spring Boot Startup

### Issue
The db-transfer-syncer service failed to start with `APPLICATION FAILED TO START`, reporting that `oracleDataSource` was defined twice (once by the shared `config-lib` and once by the project).

### Root Cause
`DbTransferSyncApplication` uses `@EnableMultiTenantConfig` from `config-lib`. That meta-annotation imports `ch.claninfo.config.datasource.OracleConfig`, which auto-registers its own `oracleDataSource` bean. Our project also provides a bespoke multi-tenant Oracle configuration bean with the same name, so Spring refuses to start because bean overriding is disabled.

### Solution
Replace `@EnableMultiTenantConfig` with an explicit `@Import` list that brings in every component except the library's `OracleConfig`. This keeps all other multi-tenant infrastructure (tenant context, configuration service, Postgres & Mongo configs) while ensuring only the project-defined Oracle datasource bean is created.

### Prevention
- Prefer explicit imports when we need to customize or supersede parts of shared autoconfiguration.
- Before adding `@Enable...` meta-annotations from shared libraries, inspect their `@Import` targets (via `javap` if source is unavailable) to confirm they don't register overlapping beans.
- Document custom datasource beans with unique names when possible, or guarantee conflicting autoconfig is excluded.

## 2025-11-03 – YouTube Synthesizer Hit Claude Session Limits on Long Videos

### Issue
Running `scenarios.youtube_synthesizer` against multi-hour videos generated 100+ chunk summaries, exhausting the Claude session limit and leaving all analysis files empty with "Session limit reached ∙ resets 7pm".

### Root Cause
Each transcript chunk triggered a separate Claude request. Videos above ~90 minutes exceeded the CLI's per-session quota long before the pipeline finished, and the engine treated the quota warning as valid output.

### Solution
Batch multiple transcript segments into a single Claude call and parse a JSON response to recover per-chunk bullet summaries. Added explicit detection of the session-limit message so the pipeline fails fast rather than writing empty artifacts.

### Prevention
- Use batching for any LLM pipeline that might scale to dozens of sequential requests.
- Treat quota/limit messages as hard failures and surface them immediately.
- Add regression tests around batched summarization and session-limit handling when extending LLM-driven workflows.

## 2025-11-03 – Vitest Timestamp Files Fail in Read-Only Sandbox

### Issue
Running `vitest --config config/vite.config.ts` (and derived coverage commands) failed with `EPERM` because Vite attempts to write `.timestamp-*.mjs` next to the config file. The repository sandbox does not allow writes under `config/`.

### Root Cause
The CLI relies on `loadConfigFromBundledFile`, which always emits bundled artifacts alongside the config path. The sandbox only permits modifications via patch tooling, so runtime writes fail.

### Solution
- Introduced `tools/scripts/vitest-runner.mjs`, which:
  - Builds an inline Vitest config (aliases, jsdom, coverage reporters) without bundling.
  - Executes tests via `startVitest('test', args, { configFile: false }, inlineConfig)`.
  - Redirects coverage output to `/tmp/archicomm-vitest-coverage`.
- Updated `package.json` scripts (`test`, `test:run`, `test:watch`, `test:coverage`, `test:coverage:check`) to use the new runner.
- Tweaked ESLint/tsconfig layering so lint/type-check includes configs without breaking the build graph.

### Prevention
- Use the wrapper for all Vitest invocations; avoid direct `vitest --config ...` in the sandbox.
- Document `/tmp` coverage destination and wrapper usage in `docs/TOOLING.md`.
- When adding new configs that might require runtime writes, confirm sandbox permissions and prefer temp directories.

## 2025-10-27 – Coding Interview Prep: None Value in fromisoformat Call

### Issue
The coding interview prep tool crashed with error "fromisoformat: argument must be str" when starting a new problem. The error occurred in the problem selector's spaced repetition scoring logic.

### Root Cause
In `selector.py:_spaced_repetition_score()`, the method checked if a problem was due for review using `progress.is_due_for_review()`, which returns `False` both when:
1. `next_review` is `None` (no review scheduled)
2. The review date is in the future

When `is_due_for_review()` returned `False`, the code unconditionally tried to call `datetime.fromisoformat(progress.next_review)` on line 162. However, if `next_review` was `None`, this caused a TypeError.

The logic bug was:
```python
if progress.is_due_for_review():
    # Use next_review (safe, it's not None)
    days_overdue = (datetime.now() - datetime.fromisoformat(progress.next_review)).days
    return min(100.0, 50.0 + days_overdue * 10)

# Not due yet = lower priority
# BUG: progress.next_review could be None here!
days_until_due = (datetime.fromisoformat(progress.next_review) - datetime.now()).days
return max(0.0, 50.0 - days_until_due * 5)
```

### Solution
Added an explicit check for `None` before attempting to use `next_review`:
```python
# No review scheduled yet = moderate priority
if not progress.next_review:
    return 50.0

# Check if due for review
if progress.is_due_for_review():
    # Use next_review (safe, it's not None)
    ...
```

This ensures that when `next_review` is `None`, the function returns early with a moderate priority score (50.0) rather than attempting to call `fromisoformat` on `None`.

### Key Learnings
1. **Boolean returns hide multiple conditions** - When a method returns `False`, consider all the reasons why it might be false
2. **Validate assumptions about data** - Even if a method checks for `None`, that doesn't mean the value is safe to use after the check returns `False`
3. **Test edge cases** - Problems that have been attempted but not yet solved may not have a `next_review` scheduled

### Prevention
- Add explicit `None` checks before calling methods that expect strings
- When using boolean checks, consider what happens in both the `True` and `False` branches
- Add test cases for problems at various stages: never attempted, attempted but unsolved, solved once, solved multiple times

## 2025-10-28 – Chess Quest Pieces Not Movable

### Issue
The Chess Quest frontend loaded correctly but none of the pieces could be dragged, so quests could not progress.

### Root Cause
`scenarios/chess_quest/frontend/src/components/ChessBoard.tsx` relied on `Chess.SQUARES` from `chess.js` to enumerate board squares. The modern `chess.js` build no longer exposes that static constant, so the generated destination map was always empty and Chessground disallowed every move.

### Solution
Replace the reliance on `Chess.SQUARES` with a locally generated list of the 64 algebraic squares, ensuring `movable.dests` is populated with legal moves derived from `chess.js`. Pieces can now be moved normally.

### Prevention
- Avoid depending on undocumented or removed `chess.js` statics; prefer explicit square generation.
- Add a frontend regression test that asserts at least one pawn has legal moves in the starting FEN.
- When upgrading external libraries, confirm any used internals still exist by running smoke tests that exercise drag-and-drop.

## 2025-10-27 – Codex CLI `--agent` Flag Removal

### Issue
Attempts to invoke specialized agents via `codex exec --agent <name>` now fail with `unexpected argument '--agent'`, breaking the automated sub-agent workflow (`spawn_agent_with_context`) and manual agent runs. (Superseded November 2025: use `python scripts/codex_prompt.py --agent ... --task ... | codex exec -` instead.)

### Root Cause
The installed Codex CLI version removed or renamed the `--agent` flag, but project tooling (including `CodexAgentBackend`) still assumes the older interface that accepted `--agent`/`--context`.

### Solution
Initially fixed by updating `CodexAgentBackend` to call `codex exec --context-file` and treat agent definitions as custom prompts. As of November 2025 the CLI deprecated that flag as well, so the backend now pipes the combined agent/context markdown directly into `codex exec -`, matching the helper workflow documented in `scripts/codex_prompt.py`.

### Implementation Details
- Command pattern (current): `python scripts/codex_prompt.py --agent <file> --task "<task>" | codex exec -`
- Combined context file embeds the agent definition, serialized context, and the current task in markdown sections
- Approach aligns with the custom prompt workflow documented in `.codex/prompts/` and used by `amplify-codex.sh`

### Prevention
- Add integration coverage that executes `codex exec --help` to track interface changes automatically
- Standardize on the custom prompt pattern for all Codex CLI integrations
- Document working CLI patterns in `.codex/prompts/README.md` and update tests when the CLI evolves

## 2025-02-15 – Migrating Coding Interview Progress to SQLite

### Issue
Legacy JSON files (`progress.json`, `mastery.json`) held spaced-repetition progress, but new features required efficient solved-problem lookups. Duplicate state between JSON and the new SQLite backend risked divergence.

### Root Cause
`ProgressStore` was hard-wired to JSON persistence while `CodingProgressDB` introduced a parallel SQLite implementation. Without a bridge, consumers would either lack the database or face a disruptive migration.

### Solution
Refactored `ProgressStore` into a facade over `CodingProgressDB` and added a one-time importer that loads existing JSON data into the SQLite tables before first use. The facade preserves the original API so callers remain unchanged.

### Prevention
Favor centralized persistence abstractions that can evolve storage without touching call sites. When adding new storage backends, build migration hooks immediately so there is only ever one source of truth.

## 2025-10-22 – DevContainer Setup: Using Official Features Instead of Custom Scripts

### Issue

Claude CLI was not reliably available in DevContainers, and there was no visibility into what tools were installed during container creation.

### Root Cause

1. **Custom installation approach**: Previously attempted to install Claude CLI via npm in post-create script (was commented out, indicating unreliability)
2. **Broken pipx feature URL**: Used `devcontainers-contrib` which was incorrect
3. **No logging**: Post-create script had no output to help diagnose issues
4. **No status reporting**: Users couldn't easily see what tools were available

### Solution

Switched to declarative DevContainer features instead of custom installation scripts:

**devcontainer.json changes:**
```json
// Fixed broken pipx feature URL
"ghcr.io/devcontainers-extra/features/pipx-package:1": { ... }

// Added official Claude Code feature
"ghcr.io/anthropics/devcontainer-features/claude-code:1": {},

// Added VSCode extension
"extensions": ["anthropic.claude-code", ...]

// Named container for easier identification
"runArgs": ["--name=amplifier_devcontainer"]
```

**post-create.sh improvements:**
```bash
# Added logging to persistent file for troubleshooting
LOG_FILE="/tmp/devcontainer-post-create.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Added development environment status report
echo "📋 Development Environment Ready:"
echo "  • Python: $(python3 --version 2>&1 | cut -d' ' -f2)"
echo "  • Claude CLI: $(claude --version 2>&1 || echo 'NOT INSTALLED')"
# ... other tools
```

### Key Learnings

1. **Use official DevContainer features over custom scripts**: Features are tested, maintained, and more reliable than custom npm installs
2. **Declarative > imperative**: Define what you need in devcontainer.json rather than scripting installations
3. **Add logging for troubleshooting**: Persistent logs help diagnose container build issues
4. **Provide status reporting**: Show users what tools are available after container creation
5. **Test with fresh containers**: Only way to verify DevContainer configuration works

### Prevention

- Prefer official DevContainer features from `ghcr.io/anthropics/`, `ghcr.io/devcontainers/`, etc.
- Add logging (`tee` to a log file) in post-create scripts for troubleshooting
- Include tool version reporting to confirm installations
- Use named containers (`runArgs`) for easier identification in Docker Desktop
- Test DevContainer changes by rebuilding containers from scratch
