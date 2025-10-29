#!/bin/bash

# Amplifier Codex Wrapper - Starts Codex CLI with MCP servers and session management
#
# This script provides a seamless integration between Codex CLI and the Amplifier
# memory system. It handles session initialization, MCP server orchestration, and
# cleanup automatically.
#
# Usage examples:
#   ./amplify-codex.sh                    # Start with default profile
#   ./amplify-codex.sh --profile review   # Use review profile
#   ./amplify-codex.sh --no-init          # Skip initialization
#   ./amplify-codex.sh --help             # Show help

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[Amplifier-Codex]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[Amplifier-Codex]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Amplifier-Codex]${NC} $1"
}

print_error() {
    echo -e "${RED}[Amplifier-Codex]${NC} $1"
}

# Default values
PROFILE="development"
SKIP_INIT=false
SKIP_CLEANUP=false
SHOW_HELP=false
CHECK_ONLY=false
LIST_PROMPTS=false
AUTO_CHECKS=true
AUTO_SAVE=true
PROMPT_COUNT=0

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --profile)
            PROFILE="$2"
            shift 2
            ;;
        --no-init)
            SKIP_INIT=true
            shift
            ;;
        --no-cleanup)
            SKIP_CLEANUP=true
            shift
            ;;
        --no-auto-checks)
            AUTO_CHECKS=false
            shift
            ;;
        --no-auto-save)
            AUTO_SAVE=false
            shift
            ;;
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        --list-prompts)
            LIST_PROMPTS=true
            shift
            ;;
        --help)
            SHOW_HELP=true
            shift
            ;;
        *)
            # Pass through to Codex
            break
            ;;
    esac
done

# Show help if requested
if [ "$SHOW_HELP" = true ]; then
    echo "Amplifier Codex Wrapper"
    echo ""
    echo "Usage: $0 [options] [codex-options]"
    echo ""
    echo "Options:"
    echo "  --profile <name>    Select Codex profile (development, ci, review) [default: development]"
    echo "  --no-init           Skip pre-session initialization"
    echo "  --no-cleanup        Skip post-session cleanup"
    echo "  --no-auto-checks    Disable automatic quality checks after session"
    echo "  --no-auto-save      Disable periodic transcript auto-saves"
    echo "  --check-only        Run prerequisite checks and exit (no Codex launch)"
    echo "  --list-prompts      List available custom prompts and exit"
    echo "  --help              Show this help message"
    echo ""
    echo "All other arguments are passed through to Codex CLI."
    echo ""
    echo "The script automatically manages Codex configuration by copying .codex/config.toml to ~/.codex/config.toml."
    echo ""
    echo "Environment Variables:"
    echo "  CODEX_PROFILE       Override default profile"
    echo "  MEMORY_SYSTEM_ENABLED  Enable/disable memory system [default: true]"
    exit 0
fi

# List prompts if requested
if [ "$LIST_PROMPTS" = true ]; then
    echo "Available Custom Prompts:"
    echo ""

    if [ ! -d ".codex/prompts" ]; then
        print_error "Custom prompts directory (.codex/prompts/) not found"
        exit 1
    fi

    PROMPT_FILES=$(find .codex/prompts -name "*.md" -type f ! -name "README.md" | sort)

    if [ -z "$PROMPT_FILES" ]; then
        print_warning "No custom prompts found in .codex/prompts/"
        exit 0
    fi

    # List each prompt with name and description from YAML frontmatter
    while IFS= read -r prompt_file; do
        PROMPT_NAME=$(basename "$prompt_file" .md)

        # Extract description from YAML frontmatter
        # Strategy: Use yq if available (fast, reliable), else fallback to awk parser
        # Works without external dependencies but uses yq for speed when present
        if command -v yq &> /dev/null; then
            # Fast path: Use yq to extract description and normalize to single line
            # - Extracts .description field from first YAML document (frontmatter)
            # - Converts newlines to spaces for display as single line
            # - Normalizes multiple spaces and trims leading/trailing whitespace
            PROMPT_DESC=$(yq eval '.description // ""' "$prompt_file" 2>/dev/null | tr '\n' ' ' | sed 's/  */ /g' | sed 's/^ *//;s/ *$//')
        else
            # Fallback: Pure awk parser (no external dependencies required)
            # Robust YAML frontmatter parser that handles all common description formats:
            # Handles:
            # - Single-line plain text: description: Some text
            # - Single-line quoted: description: "Some text" or description: 'Some text'
            # - Multiline block scalar: description: | or description: >-
            # - Missing description field
            PROMPT_DESC=$(awk '
                BEGIN { in_frontmatter = 0; in_description = 0; description = "" }

                # Track frontmatter boundaries (between first and second ---)
                /^---$/ {
                    frontmatter_markers++
                    if (frontmatter_markers == 1) {
                        in_frontmatter = 1
                        next
                    }
                    if (frontmatter_markers == 2) {
                        in_frontmatter = 0
                        exit
                    }
                }

                # Skip if not in frontmatter
                !in_frontmatter { next }

                # Handle description field
                /^description:/ {
                    in_description = 1
                    line = $0
                    sub(/^description: */, "", line)

                    # Check if value is on same line
                    if (line != "" && line !~ /^[|>][-+]?$/) {
                        # Single-line value (plain or quoted)
                        gsub(/^["'"'"']|["'"'"']$/, "", line)  # Strip quotes
                        description = line
                        in_description = 0
                        next
                    }

                    # If line is block scalar indicator (| or >-)
                    if (line ~ /^[|>][-+]?$/) {
                        # Next lines are block content
                        next
                    }

                    # Empty value
                    next
                }

                # Collect multiline block scalar content
                in_description && /^[ \t]+/ {
                    line = $0
                    sub(/^[ \t]+/, "", line)  # Remove leading whitespace
                    if (description != "") description = description " "
                    description = description line
                    next
                }

                # Non-indented line or new field ends description block
                in_description && /^[^ \t]/ {
                    in_description = 0
                }

                END {
                    # Trim and output
                    gsub(/^[ \t]+|[ \t]+$/, "", description)
                    gsub(/  +/, " ", description)  # Normalize multiple spaces
                    print description
                }
            ' "$prompt_file")
        fi

        # Default if no description found
        if [ -z "$PROMPT_DESC" ]; then
            PROMPT_DESC="No description available"
        fi

        echo -e "  ${GREEN}$PROMPT_NAME${NC}"
        echo "    $PROMPT_DESC"
        echo ""
    done <<< "$PROMPT_FILES"

    echo "Usage:"
    echo "  - Primary: codex exec --context-file=.codex/prompts/<name>.md \"<task>\""
    echo "  - TUI: Use /prompts: to browse (if registry supported in your Codex version)"
    echo ""
    echo "For more information, see .codex/prompts/README.md"

    exit 0
fi

# Environment Setup
export AMPLIFIER_BACKEND=codex
export AMPLIFIER_ROOT="$(pwd)"
export MEMORY_SYSTEM_ENABLED="${MEMORY_SYSTEM_ENABLED:-true}"

# Prerequisites Validation
print_status "Validating prerequisites..."

if ! command -v codex &> /dev/null; then
    print_error "Codex CLI is not installed."
    print_error "Install Codex CLI from: https://github.com/xai-org/grok-1"
    exit 1
fi

if [ ! -d ".codex" ]; then
    print_error "Project structure incomplete: .codex/ directory not found."
    print_error "Ensure you're in the correct project directory."
    exit 1
fi

if [ ! -d ".venv" ]; then
    print_error "Virtual environment not found: .venv/ directory missing."
    print_error "Run 'make install' or 'uv sync' to set up the environment."
    exit 1
fi

if ! command -v uv &> /dev/null; then
    print_error "uv is not installed."
    print_error "Install uv from: https://github.com/astral-sh/uv"
    exit 1
fi

print_success "Prerequisites validated"

# Exit early if --check-only
if [ "$CHECK_ONLY" = true ]; then
    print_status "Check-only mode: Validating configuration..."

    if [ ! -f ".codex/config.toml" ]; then
        print_error ".codex/config.toml not found"
        exit 1
    fi

    if [ -n "$CODEX_PROFILE" ]; then
        PROFILE="$CODEX_PROFILE"
    fi

    if ! grep -q "\[profiles\.$PROFILE\]" .codex/config.toml; then
        print_warning "Profile '$PROFILE' not found in config.toml"
    else
        print_success "Profile '$PROFILE' found in config.toml"
    fi

    print_success "All checks passed"
    exit 0
fi

# Configuration Detection
print_status "Detecting configuration..."

if [ ! -f ".codex/config.toml" ]; then
    print_error ".codex/config.toml not found."
    print_error "Ensure Codex configuration is properly set up."
    exit 1
fi

# Allow profile override via environment
if [ -n "$CODEX_PROFILE" ]; then
    PROFILE="$CODEX_PROFILE"
fi

print_status "Using profile: $PROFILE"

# Check if profile exists in config (basic validation)
if ! grep -q "\[profiles\.$PROFILE\]" .codex/config.toml; then
    print_warning "Profile '$PROFILE' not found in config.toml, using default behavior"
fi

# Configuration Setup
print_status "Setting up Codex configuration..."

# Create ~/.codex directory if it doesn't exist
mkdir -p ~/.codex

# Copy project config to Codex's default location
if cp .codex/config.toml ~/.codex/config.toml; then
    print_success "Configuration copied to ~/.codex/config.toml"
else
    print_error "Failed to copy configuration file"
    exit 1
fi

# Verify custom prompts directory exists
if [ -d ".codex/prompts" ]; then
    PROMPT_COUNT=$(find .codex/prompts -name "*.md" -type f ! -name "README.md" | wc -l | tr -d ' ')
    if [ "$PROMPT_COUNT" -gt 0 ]; then
        print_success "Found $PROMPT_COUNT custom prompt(s) in .codex/prompts/"
    else
        print_warning "No custom prompts found in .codex/prompts/"
    fi
else
    print_warning "Custom prompts directory (.codex/prompts/) not found"
fi

# Pre-Session Initialization
if [ "$SKIP_INIT" = false ]; then
    print_status "Running pre-session initialization..."

    # Create logs directory if it doesn't exist
    mkdir -p .codex/logs

    # Smart context detection
    export GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    export RECENT_COMMITS=$(git log --oneline -5 2>/dev/null | tr '\n' '|' | sed 's/|$//' || echo "none")
    export TODO_FILES=$(find . -name "*.py" -type f -exec grep -l "TODO\|FIXME\|XXX" {} \; 2>/dev/null | head -5 | tr '\n' ' ' || echo "none")

    # Create session start marker for file tracking
    touch .codex/session_start_marker

    # Run initialization script
    if uv run python .codex/tools/session_init.py 2>&1 | tee .codex/logs/session_init.log; then
        # Extract summary from output (assuming it prints something like "Loaded X memories")
        SUMMARY=$(tail -n 1 .codex/logs/session_init.log | grep -o "Loaded [0-9]* memories" || echo "Initialization completed")
        print_success "$SUMMARY"
    else
        print_warning "Pre-session initialization failed, continuing anyway"
        print_warning "Check .codex/logs/session_init.log for details"
    fi
else
    print_status "Skipping pre-session initialization (--no-init)"
fi

# Start periodic auto-save background process
AUTO_SAVE_PID=""
if [ "$AUTO_SAVE" = true ]; then
    print_status "Starting periodic transcript auto-save (every 10 minutes)..."
    (
        while true; do
            sleep 600  # 10 minutes
            echo "$(date '+%Y-%m-%d %H:%M:%S'): Auto save triggered" >> .codex/logs/auto_saves.log
            uv run python .codex/tools/auto_save.py >> .codex/logs/auto_saves.log 2>&1 || echo "$(date '+%Y-%m-%d %H:%M:%S'): Auto save failed" >> .codex/logs/auto_saves.log
        done
    ) &
    AUTO_SAVE_PID=$!
fi

# Parse active MCP servers from config
ACTIVE_SERVERS=""
if [ -f ".codex/config.toml" ]; then
    # Extract mcp_servers array from the profile section
    ACTIVE_SERVERS=$(grep -A 20 "\[profiles\.$PROFILE\]" .codex/config.toml | grep "mcp_servers" | sed 's/.*\[//' | sed 's/\].*//' | tr ',' '\n' | tr -d '"' | tr -d ' ')
fi

# Check if specific servers are active
HAS_TASK_TRACKER=$(echo "$ACTIVE_SERVERS" | grep -q "amplifier_tasks" && echo "yes" || echo "no")
HAS_WEB_RESEARCH=$(echo "$ACTIVE_SERVERS" | grep -q "amplifier_web" && echo "yes" || echo "no")

# User Guidance Display
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ${BLUE}Amplifier Codex Session Started${NC}                               ${BLUE}║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}MCP Tools Available:${NC}                                          ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}• initialize_session${NC} - Load context from memory system        ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}• check_code_quality${NC} - Run quality checks after changes       ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}• save_current_transcript${NC} - Export session transcript         ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}• finalize_session${NC} - Save memories before ending              ${BLUE}║${NC}"
if [ "$HAS_TASK_TRACKER" = "yes" ]; then
    echo -e "${BLUE}║${NC}  ${GREEN}• create_task${NC} - Create and manage development tasks           ${BLUE}║${NC}"
fi
if [ "$HAS_WEB_RESEARCH" = "yes" ]; then
    echo -e "${BLUE}║${NC}  ${GREEN}• search_web${NC} - Research information on the web                ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}• fetch_url${NC} - Fetch and analyze web content                  ${BLUE}║${NC}"
fi
echo -e "${BLUE}║${NC}                                                                ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}Custom Prompts Available:${NC}                                    ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}• Use: codex exec --context-file=.codex/prompts/<name>.md${NC}     ${BLUE}║${NC}"
if [ -n "$PROMPT_COUNT" ] && [ "$PROMPT_COUNT" -gt 0 ]; then
    echo -e "${BLUE}║${NC}  ${GREEN}• $PROMPT_COUNT prompt(s) found in .codex/prompts/${NC}               ${BLUE}║${NC}"
fi
echo -e "${BLUE}║${NC}                                                                ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}Keyboard Shortcuts:${NC}                                          ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}• Ctrl+C${NC} - Exit session gracefully                          ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}                                                                ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}Session Statistics:${NC}                                          ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}• Profile:${NC} $PROFILE                                           ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}• Memory System:${NC} ${MEMORY_SYSTEM_ENABLED}                     ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}• Auto-save:${NC} ${AUTO_SAVE}                                   ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}• Auto-checks:${NC} ${AUTO_CHECKS}                               ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}                                                                ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}Recommended Workflow:${NC}                                         ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}1. Start:${NC} Use initialize_session to load context              ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}2. Work:${NC} Edit code, run tools                                 ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}3. Check:${NC} Use check_code_quality after changes                ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}4. End:${NC} Use finalize_session to save learnings                ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}                                                                ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}Press Ctrl+C to exit${NC}                                          ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Codex Execution
print_status "Starting Codex CLI..."

# Build Codex command
CODEX_CMD=("codex" "--profile" "$PROFILE")

# Pass through remaining arguments
CODEX_CMD+=("$@")

print_status "Executing: ${CODEX_CMD[*]}"

# Trap SIGINT to ensure cleanup runs
cleanup_needed=true
trap 'cleanup_needed=true; kill $AUTO_SAVE_PID 2>/dev/null || true' SIGINT

# Run Codex
"${CODEX_CMD[@]}"
CODEX_EXIT_CODE=$?

# Stop auto-save process
if [ -n "$AUTO_SAVE_PID" ]; then
    kill $AUTO_SAVE_PID 2>/dev/null || true
fi

# Auto-quality checks
if [ "$AUTO_CHECKS" = true ]; then
    print_status "Running auto-quality checks on modified files..."

    # Detect modified files since session start
    MODIFIED_FILES=$(find . -newer .codex/session_start_marker -type f \( -name "*.py" -o -name "*.md" -o -name "*.txt" \) 2>/dev/null | head -20 || echo "")

    if [ -n "$MODIFIED_FILES" ]; then
        # Create logs directory if it doesn't exist
        mkdir -p .codex/logs

        # Run auto-check script
        echo "$MODIFIED_FILES" | uv run python .codex/tools/auto_check.py 2>&1 | tee .codex/logs/auto_checks.log || print_warning "Auto-quality checks failed"
    else
        print_status "No modified files detected for quality checks"
    fi
fi

# Post-Session Cleanup
if [ "$SKIP_CLEANUP" = false ] && [ "$cleanup_needed" = true ]; then
    print_status "Running post-session cleanup..."

    # Create logs directory if it doesn't exist
    mkdir -p .codex/logs

    # Run cleanup script
    if uv run python .codex/tools/session_cleanup.py 2>&1 | tee .codex/logs/session_cleanup.log; then
        # Extract summary from output
        SUMMARY=$(tail -n 1 .codex/logs/session_cleanup.log | grep -o "Extracted [0-9]* memories" || echo "Cleanup completed")
        print_success "$SUMMARY"
    else
        print_warning "Post-session cleanup failed"
        print_warning "Check .codex/logs/session_cleanup.log for details"
    fi
else
    if [ "$SKIP_CLEANUP" = true ]; then
        print_status "Skipping post-session cleanup (--no-cleanup)"
    fi
fi

# Exit Summary
echo ""
print_status "Session Summary:"
if [ -n "$MODIFIED_FILES" ]; then
    FILE_COUNT=$(echo "$MODIFIED_FILES" | wc -l)
    echo "  Files modified: $FILE_COUNT"
else
    echo "  Files modified: 0"
fi
echo "  Tasks created/completed: Check .codex/tasks/ for details"
if [ "$AUTO_CHECKS" = true ] && [ -f ".codex/logs/auto_checks.log" ]; then
    echo "  Quality check results: See .codex/logs/auto_checks.log"
else
    echo "  Quality check results: Auto-checks disabled or no results"
fi
echo "  Memories extracted: See cleanup logs"
echo "  Transcript location: .codex/transcripts/"
echo ""

# Clean up session marker
rm -f .codex/session_start_marker

# Exit Handling
if [ $CODEX_EXIT_CODE -eq 0 ]; then
    print_success "Session completed successfully"
else
    print_warning "Codex exited with code $CODEX_EXIT_CODE"
fi

exit $CODEX_EXIT_CODE
