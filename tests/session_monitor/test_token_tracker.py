"""Tests for TokenTracker class."""

import json
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest

from amplifier.session_monitor.models import MonitorConfig
from amplifier.session_monitor.models import TokenUsageSnapshot
from amplifier.session_monitor.token_tracker import TokenTracker


class TestTokenTracker:
    """Test cases for TokenTracker functionality."""

    @pytest.fixture
    def tracker(self):
        """Create a TokenTracker instance."""
        return TokenTracker()

    @pytest.fixture
    def sample_log_content(self):
        """Sample session log content for testing."""
        return """
Starting Claude Code session...
User: Please help me implement a function
Assistant: I'll help you implement that function. Here's how you can do it:

```python
def example_function():
    return "Hello World"
```

User: Thanks, that looks good.
Assistant: You're welcome! Let me know if you need any modifications.
"""

    @pytest.fixture
    def sample_transcript(self):
        """Sample Claude Code JSONL transcript for testing."""
        return [
            {
                "type": "user",
                "uuid": "abc123",
                "timestamp": "2024-01-01T10:00:00Z",
                "message": {"content": "Please help me implement a function"},
            },
            {
                "type": "assistant",
                "uuid": "def456",
                "parentUuid": "abc123",
                "timestamp": "2024-01-01T10:00:01Z",
                "message": {
                    "content": [
                        {"type": "text", "text": "I'll help you implement that function. Here's how you can do it:"}
                    ]
                },
            },
            {
                "type": "assistant",
                "uuid": "ghi789",
                "parentUuid": "def456",
                "timestamp": "2024-01-01T10:00:02Z",
                "message": {
                    "content": [
                        {"type": "text", "text": '```python\ndef example_function():\n    return "Hello World"\n```'}
                    ]
                },
            },
        ]

    def test_estimate_from_session_log(self, tracker, sample_log_content):
        """Test token estimation from session log file."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".log", delete=False) as f:
            f.write(sample_log_content)
            log_path = Path(f.name)

        try:
            usage = tracker.estimate_from_session_log(log_path)

            assert isinstance(usage, TokenUsageSnapshot)
            assert usage.estimated_tokens > 0
            assert usage.usage_pct > 0
            assert usage.source == "session_log"
            # Should be well under 100k tokens for this small sample
            assert usage.usage_pct < 10

        finally:
            log_path.unlink()

    def test_estimate_from_transcript(self, tracker, sample_transcript):
        """Test token estimation from JSONL transcript."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as f:
            for entry in sample_transcript:
                f.write(json.dumps(entry) + "\n")
            transcript_path = Path(f.name)

        try:
            usage = tracker.estimate_from_transcript(transcript_path)

            assert isinstance(usage, TokenUsageSnapshot)
            assert usage.estimated_tokens > 0
            assert usage.usage_pct > 0
            assert usage.source == "transcript"

        finally:
            transcript_path.unlink()

    def test_token_multiplier_accuracy(self, tracker):
        """Test that the 1.3x multiplier is applied correctly."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".log", delete=False) as f:
            # Write exactly 100 words
            f.write("word " * 100)
            log_path = Path(f.name)

        try:
            usage = tracker.estimate_from_session_log(log_path)

            # 100 words * 1.3 = 130 tokens
            assert usage.estimated_tokens == 130

        finally:
            log_path.unlink()

    def test_should_terminate_thresholds(self, tracker):
        """Test termination threshold logic."""
        config = MonitorConfig(token_warning_threshold=80.0, token_critical_threshold=90.0)

        # Below warning threshold
        usage = TokenUsageSnapshot(estimated_tokens=70000, usage_pct=70.0, source="test")
        should_terminate, reason = tracker.should_terminate(usage, config)
        assert not should_terminate
        assert "within safe limits" in reason

        # Above warning but below critical
        usage = TokenUsageSnapshot(estimated_tokens=85000, usage_pct=85.0, source="test")
        should_terminate, reason = tracker.should_terminate(usage, config)
        assert not should_terminate
        assert "exceeds warning threshold" in reason

        # Above critical threshold
        usage = TokenUsageSnapshot(estimated_tokens=95000, usage_pct=95.0, source="test")
        should_terminate, reason = tracker.should_terminate(usage, config)
        assert should_terminate
        assert "exceeds critical threshold" in reason

    def test_missing_log_file_handling(self, tracker):
        """Test graceful handling of missing log files."""
        non_existent_path = Path("/tmp/non_existent_session.log")
        usage = tracker.estimate_from_session_log(non_existent_path)

        assert usage.estimated_tokens == 0
        assert usage.usage_pct == 0.0
        assert usage.source == "session_log_missing"

    def test_corrupted_log_file_handling(self, tracker):
        """Test handling of corrupted log files."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".log", delete=False) as f:
            # Write some binary data that will cause issues
            f.write("\x00\x01\x02invalid utf-8 content\x03\x04")
            log_path = Path(f.name)

        try:
            usage = tracker.estimate_from_session_log(log_path)

            # Should handle corruption gracefully and return some estimate
            # The binary data gets treated as text, so we get some token count
            assert usage.estimated_tokens >= 0  # Should be non-negative
            assert usage.usage_pct >= 0.0  # Should be non-negative percentage
            assert usage.source == "session_log"  # Successfully processed as session log

        finally:
            log_path.unlink()

    @patch("pathlib.Path.home")
    def test_get_current_usage_claude_code(self, mock_home, tracker, sample_transcript):
        """Test getting current usage for Claude Code workspace."""
        # Mock Claude Code directory structure
        mock_home.return_value = Path("/tmp")
        claude_dir = Path("/tmp/.config/claude/projects/test_workspace")
        claude_dir.mkdir(parents=True, exist_ok=True)

        transcript_file = claude_dir / "test_workspace.jsonl"
        with open(transcript_file, "w") as f:
            for entry in sample_transcript:
                f.write(json.dumps(entry) + "\n")

        try:
            usage = tracker.get_current_usage("test_workspace")

            assert isinstance(usage, TokenUsageSnapshot)
            assert usage.source == "transcript"

        finally:
            transcript_file.unlink()
            claude_dir.rmdir()

    def test_get_current_usage_session_log(self, tracker, sample_log_content):
        """Test fallback to session log when transcript not available."""
        # Create session log in .codex directory
        codex_dir = Path(".codex/workspaces/test_workspace")
        codex_dir.mkdir(parents=True, exist_ok=True)
        log_file = codex_dir / "session.log"

        with open(log_file, "w") as f:
            f.write(sample_log_content)

        try:
            usage = tracker.get_current_usage("test_workspace")

            assert isinstance(usage, TokenUsageSnapshot)
            assert usage.source == "session_log"

        finally:
            log_file.unlink()
            codex_dir.rmdir()
            Path(".codex/workspaces").rmdir()

    def test_get_current_usage_no_files(self, tracker):
        """Test behavior when no session files exist."""
        usage = tracker.get_current_usage("non_existent_workspace")

        assert usage.estimated_tokens == 0
        assert usage.usage_pct == 0.0
        assert usage.source == "no_files"
