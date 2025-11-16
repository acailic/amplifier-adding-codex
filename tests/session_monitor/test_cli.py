"""Tests for session monitor CLI."""

import json
import signal
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest
from click.testing import CliRunner

from amplifier.session_monitor.cli import cli
from amplifier.session_monitor.models import MonitorConfig


class TestSessionMonitorCLI:
    """Test cases for session monitor CLI commands."""

    @pytest.fixture
    def runner(self):
        """Create a Click test runner."""
        return CliRunner()

    @pytest.fixture
    def config_file(self):
        """Create a temporary config file."""
        config = MonitorConfig()
        config_dict = config.model_dump()
        # Convert Path to string for JSON serialization
        config_dict["workspace_base_dir"] = str(config_dict["workspace_base_dir"])
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump(config_dict, f)
            return Path(f.name)

    def test_start_command(self, runner, config_file):
        """Start command should spawn detached daemon and write PID file."""
        pid_file = Path(".codex/session_monitor.pid")
        if pid_file.exists():
            pid_file.unlink()

        with patch("amplifier.session_monitor.cli.subprocess.Popen") as mock_popen:
            mock_process = mock_popen.return_value
            mock_process.pid = 4321

            result = runner.invoke(cli, ["start", "--config", str(config_file)])

            assert result.exit_code == 0
            mock_popen.assert_called_once()
            args, kwargs = mock_popen.call_args
            assert "_run_daemon" in args[0]
            assert kwargs.get("start_new_session") is True
            assert pid_file.read_text().strip() == "4321"

        pid_file.unlink(missing_ok=True)

    def test_stop_command(self, runner):
        """Test the stop command."""
        pid_file = Path(".codex/session_monitor.pid")

        # Create a mock PID file
        pid_file.parent.mkdir(parents=True, exist_ok=True)
        with open(pid_file, "w") as f:
            f.write("12345")

        try:
            call_sequence = []

            def kill_side_effect(target_pid, sig):
                call_sequence.append((target_pid, sig))
                if sig == 0 and len(call_sequence) in {1, 3}:
                    if len(call_sequence) == 3:
                        raise ProcessLookupError()
                    return
                return

            with patch("os.kill", side_effect=kill_side_effect):
                result = runner.invoke(cli, ["stop"])

                assert result.exit_code == 0
                assert (12345, signal.SIGTERM) in call_sequence

        finally:
            pid_file.unlink(missing_ok=True)

    def test_stop_command_no_pid_file(self, runner):
        """Test stop command when no PID file exists."""
        result = runner.invoke(cli, ["stop"])

        assert result.exit_code == 1
        # Error message goes to stderr, not captured by CliRunner

    def test_status_command_daemon_running(self, runner):
        """Test status command when daemon is running."""
        # Create PID file
        pid_file = Path(".codex/session_monitor.pid")
        pid_file.parent.mkdir(parents=True, exist_ok=True)
        with open(pid_file, "w") as f:
            f.write("12345")

        try:
            with (
                patch("os.kill") as mock_kill,
                patch("amplifier.session_monitor.cli.TokenTracker") as mock_tracker_class,
            ):
                mock_kill.return_value = None  # Process exists
                mock_tracker = mock_tracker_class.return_value
                mock_tracker.get_current_usage.return_value = type(
                    "MockUsage", (), {"source": "transcript", "usage_pct": 75.0, "estimated_tokens": 75000}
                )()

                result = runner.invoke(cli, ["status"])

                assert result.exit_code == 0
                assert "✓ Daemon running" in result.output
                assert "75.0%" in result.output

        finally:
            if pid_file.exists():
                pid_file.unlink()

    def test_status_command_daemon_not_running(self, runner):
        """Test status command when daemon is not running."""
        with patch("amplifier.session_monitor.cli.TokenTracker") as mock_tracker_class:
            mock_tracker = mock_tracker_class.return_value
            mock_tracker.get_current_usage.return_value = type(
                "MockUsage", (), {"source": "no_files", "usage_pct": 0.0, "estimated_tokens": 0}
            )()

            result = runner.invoke(cli, ["status"])

            assert result.exit_code == 0
            assert "✗ Daemon not running" in result.output

    def test_status_command_removes_stale_pid(self, runner):
        """Status --clean should remove stale daemon PID files."""
        pid_file = Path(".codex/session_monitor.pid")
        pid_file.parent.mkdir(parents=True, exist_ok=True)
        pid_file.write_text("2222")

        with (
            patch("os.kill", side_effect=ProcessLookupError()),
            patch("amplifier.session_monitor.cli.TokenTracker") as mock_tracker_class,
        ):
            mock_tracker = mock_tracker_class.return_value
            mock_tracker.get_current_usage.return_value = type(
                "MockUsage", (), {"source": "no_files", "usage_pct": 0.0, "estimated_tokens": 0}
            )()

            result = runner.invoke(cli, ["status", "--clean"])

            assert result.exit_code == 0
            assert "Removed stale daemon PID file." in result.output
            assert not pid_file.exists()

    def test_request_termination_command(self, runner):
        """Test request-termination command with explicit PID."""
        workspace_dir = Path(".codex/workspaces/test_workspace")
        workspace_dir.mkdir(parents=True, exist_ok=True)

        try:
            with (
                patch("amplifier.session_monitor.cli.TokenTracker") as mock_tracker_class,
                patch("pathlib.Path.cwd", return_value=Path("/tmp/test_workspace")),
                patch("os.kill", return_value=None),
            ):
                mock_tracker = mock_tracker_class.return_value
                mock_tracker.get_current_usage.return_value = type("MockUsage", (), {"usage_pct": 85.0})()

                result = runner.invoke(
                    cli,
                    [
                        "request-termination",
                        "--reason",
                        "token_limit_approaching",
                        "--continuation-command",
                        "claude --continue",
                        "--priority",
                        "graceful",
                        "--pid",
                        "5555",
                    ],
                )

                assert result.exit_code == 0
                request_file = workspace_dir / "termination-request"
                assert request_file.exists()
                payload = json.loads(request_file.read_text())
                assert payload["pid"] == 5555
                assert payload["workspace_id"] == "test_workspace"

        finally:
            for path in workspace_dir.glob("*"):
                path.unlink()
            workspace_dir.rmdir()

    def test_request_termination_requires_pid_file(self, runner):
        """Request termination should fail without PID info."""
        with (
            patch("amplifier.session_monitor.cli.TokenTracker") as mock_tracker_class,
            patch("pathlib.Path.cwd", return_value=Path("/tmp/test_workspace")),
        ):
            mock_tracker = mock_tracker_class.return_value
            mock_tracker.get_current_usage.return_value = type("MockUsage", (), {"usage_pct": 70.0})()

            result = runner.invoke(
                cli,
                [
                    "request-termination",
                    "--reason",
                    "manual",
                    "--continuation-command",
                    "resume",
                ],
            )

            assert result.exit_code == 1
            assert "Session PID file" in result.output

    def test_check_tokens_command(self, runner):
        """Test check-tokens command."""
        with (
            patch("amplifier.session_monitor.cli.TokenTracker") as mock_tracker_class,
            patch("pathlib.Path.cwd", return_value=Path("/tmp/test_workspace")),
        ):
            mock_tracker = mock_tracker_class.return_value
            mock_tracker.get_current_usage.return_value = type(
                "MockUsage", (), {"source": "transcript", "usage_pct": 85.0, "estimated_tokens": 85000}
            )()

            result = runner.invoke(cli, ["check-tokens"])

            assert result.exit_code == 0
            assert "WARNING" in result.output
            assert "85.0%" in result.output
            assert "85,000" in result.output

    def test_check_tokens_command_no_files(self, runner):
        """Test check-tokens when no session files exist."""
        with patch("amplifier.session_monitor.cli.TokenTracker") as mock_tracker_class:
            mock_tracker = mock_tracker_class.return_value
            mock_tracker.get_current_usage.return_value = type(
                "MockUsage", (), {"source": "no_files", "usage_pct": 0.0, "estimated_tokens": 0}
            )()

            result = runner.invoke(cli, ["check-tokens"])

            assert result.exit_code == 0
            assert "No session files found" in result.output

    def test_list_sessions_command(self, runner):
        """Test list-sessions command."""
        # Create test workspace structure
        workspace_dir = Path(".codex/workspaces/test_workspace")
        workspace_dir.mkdir(parents=True, exist_ok=True)
        pid_file = workspace_dir / "session.pid"

        with open(pid_file, "w") as f:
            f.write("12345")

        try:
            with (
                patch("os.kill", return_value=None),
                patch("amplifier.session_monitor.cli.TokenTracker") as mock_tracker_class,
            ):
                mock_tracker = mock_tracker_class.return_value
                mock_tracker.get_current_usage.return_value = type(
                    "MockUsage", (), {"source": "transcript", "usage_pct": 60.0, "estimated_tokens": 60000}
                )()

                result = runner.invoke(cli, ["list-sessions"])

                assert result.exit_code == 0
                assert "test_workspace" in result.output
                assert "PID 12345" in result.output
                assert "running" in result.output

        finally:
            pid_file.unlink()
            workspace_dir.rmdir()
            workspaces_root = Path(".codex/workspaces")
            if workspaces_root.exists() and not any(workspaces_root.iterdir()):
                workspaces_root.rmdir()

    def test_invalid_workspace(self, runner):
        """Test error handling for invalid workspace."""
        with patch("amplifier.session_monitor.cli.TokenTracker") as mock_tracker_class:
            mock_tracker = mock_tracker_class.return_value
            mock_tracker.get_current_usage.return_value = type(
                "MockUsage", (), {"source": "no_files", "usage_pct": 0.0, "estimated_tokens": 0}
            )()

            result = runner.invoke(cli, ["check-tokens", "--workspace", "invalid@workspace"])

        # Should still work but with no files found
        assert result.exit_code == 0

    def test_list_sessions_clean_stale_pid(self, runner):
        """list-sessions --clean should remove stale PID files."""
        workspace_dir = Path(".codex/workspaces/test_workspace")
        workspace_dir.mkdir(parents=True, exist_ok=True)
        pid_file = workspace_dir / "session.pid"
        pid_file.write_text("7777")

        try:
            with (
                patch("os.kill", side_effect=ProcessLookupError()),
                patch("amplifier.session_monitor.cli.TokenTracker") as mock_tracker_class,
            ):
                mock_tracker = mock_tracker_class.return_value
                mock_tracker.get_current_usage.return_value = type(
                    "MockUsage", (), {"source": "no_files", "usage_pct": 0.0, "estimated_tokens": 0}
                )()

                result = runner.invoke(cli, ["list-sessions", "--clean"])

                assert result.exit_code == 0
                assert "Cleanup: removed stale session PID file." in result.output
                assert not pid_file.exists()
        finally:
            if workspace_dir.exists():
                for child in workspace_dir.iterdir():
                    child.unlink()
                workspace_dir.rmdir()

    def test_config_file_loading(self, runner, config_file):
        """Test loading custom config file."""
        pid_file = Path(".codex/session_monitor.pid")
        with patch("amplifier.session_monitor.cli.subprocess.Popen") as mock_popen:
            mock_popen.return_value.pid = 9999

            result = runner.invoke(cli, ["start", "--config", str(config_file), "--verbose"])

            assert result.exit_code == 0
            args, _ = mock_popen.call_args
            assert "--config-path" in args[0]

        pid_file.unlink(missing_ok=True)

    def test_run_daemon_hidden_command(self, runner, config_file):
        """The hidden _run_daemon command should instantiate and start the daemon."""
        with (
            patch("amplifier.session_monitor.cli.SessionMonitorDaemon") as mock_daemon_class,
            patch("amplifier.session_monitor.cli.asyncio.run") as mock_asyncio_run,
        ):
            result = runner.invoke(cli, ["_run_daemon", "--config-path", str(config_file)])

            assert result.exit_code == 0
            mock_daemon_class.assert_called_once()
            mock_asyncio_run.assert_called_once()
