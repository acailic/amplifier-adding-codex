"""Tests for SessionMonitorDaemon class."""

import json
import logging
import os
import signal
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock
from unittest.mock import MagicMock
from unittest.mock import patch

import pytest

from amplifier.session_monitor.daemon import SessionMonitorDaemon
from amplifier.session_monitor.models import MonitorConfig
from amplifier.session_monitor.models import TerminationPriority
from amplifier.session_monitor.models import TerminationReason
from amplifier.session_monitor.models import TerminationRequest


class TestSessionMonitorDaemon:
    """Test cases for SessionMonitorDaemon functionality."""

    @pytest.fixture
    def config(self, tmp_path):
        """Create a test monitor configuration."""
        workspace_base_dir = tmp_path / "workspaces"
        workspace_base_dir.mkdir(parents=True, exist_ok=True)

        return MonitorConfig(
            workspace_base_dir=workspace_base_dir,
            check_interval_seconds=1,  # Fast for testing
            token_warning_threshold=80.0,
            token_critical_threshold=90.0,
            max_restart_attempts=3,
            restart_backoff_seconds=1,  # Integer for testing
        )

    @pytest.fixture
    def daemon(self, config):
        """Create a SessionMonitorDaemon instance."""
        return SessionMonitorDaemon(config)

    @pytest.fixture
    def sample_request(self):
        """Create a sample termination request."""
        return TerminationRequest(
            reason=TerminationReason.TOKEN_LIMIT_APPROACHING,
            continuation_command="claude --continue-session",
            priority=TerminationPriority.GRACEFUL,
            token_usage_pct=85.0,
            pid=os.getpid(),
            workspace_id="test_workspace",
        )

    def test_daemon_initialization(self, daemon, config):
        """Test daemon initialization."""
        assert daemon.config == config
        assert not daemon.running
        assert daemon.pid_file == Path(".codex/session_monitor.pid")

    @pytest.mark.asyncio
    @patch("amplifier.session_monitor.daemon.asyncio.create_subprocess_exec")
    async def test_terminate_session_graceful(self, mock_subprocess, daemon, sample_request):
        """Test graceful session termination."""
        # Mock a process that exits quickly
        mock_process = AsyncMock()
        mock_process.wait.return_value = None
        mock_subprocess.return_value = mock_process

        # Mock os.kill to simulate process exists
        with patch("os.kill") as mock_kill:
            mock_kill.return_value = None  # Process exists

            await daemon._terminate_session(sample_request)

            # Should send SIGTERM first
            mock_kill.assert_any_call(sample_request.pid, signal.SIGTERM)

    @pytest.mark.asyncio
    @patch("amplifier.session_monitor.daemon.asyncio.create_subprocess_exec")
    async def test_terminate_session_force_kill(self, mock_subprocess, daemon, sample_request):
        """Test force termination when process doesn't exit gracefully."""
        # Mock a process that doesn't exit
        mock_process = AsyncMock()
        mock_subprocess.return_value = mock_process

        # Mock os.kill to simulate process still exists after timeout
        with (
            patch("os.kill") as mock_kill,
            patch.object(daemon, "_wait_for_process_exit", new_callable=AsyncMock) as mock_wait,
        ):
            mock_wait.side_effect = [None, None]
            mock_kill.side_effect = [None, None, None]  # SIGTERM, check, SIGKILL

            await daemon._terminate_session(sample_request)

            mock_kill.assert_any_call(sample_request.pid, signal.SIGTERM)
            mock_kill.assert_any_call(sample_request.pid, signal.SIGKILL)

    @pytest.mark.asyncio
    async def test_terminate_session_priority_waits(self, daemon, sample_request):
        """Wait duration should respect termination priority enum values."""
        with (
            patch("os.kill") as mock_kill,
            patch.object(daemon, "_wait_for_process_exit", new_callable=AsyncMock) as mock_wait,
            patch.object(daemon, "_restart_session", new_callable=AsyncMock),
        ):
            mock_kill.side_effect = [None, OSError(), None, OSError()]

            await daemon._terminate_session(sample_request)
            immediate_request = sample_request.model_copy(update={"priority": TerminationPriority.IMMEDIATE})
            await daemon._terminate_session(immediate_request)

            assert mock_wait.await_args_list[0].args == (sample_request.pid, 30)
            assert mock_wait.await_args_list[1].args == (sample_request.pid, 5)

    @pytest.mark.asyncio
    async def test_validate_request_valid_pid(self, daemon, sample_request):
        """Test validation of requests with valid PIDs."""
        with patch("os.kill") as mock_kill:
            mock_kill.return_value = None  # Process exists

            is_valid = await daemon._validate_request(sample_request)
            assert is_valid

    @pytest.mark.asyncio
    async def test_validate_request_invalid_pid(self, daemon, sample_request):
        """Test validation of requests with invalid PIDs."""
        with patch("os.kill") as mock_kill:
            mock_kill.side_effect = OSError("No such process")

            is_valid = await daemon._validate_request(sample_request)
            assert not is_valid

    @pytest.mark.asyncio
    async def test_load_termination_request(self, daemon, sample_request):
        """Test loading termination request from file."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump(sample_request.model_dump(mode="json"), f)
            request_file = Path(f.name)

        try:
            loaded_request = await daemon._load_termination_request(request_file)
            assert loaded_request.reason == sample_request.reason
            assert loaded_request.pid == sample_request.pid
            assert loaded_request.workspace_id == sample_request.workspace_id

        finally:
            request_file.unlink()

    @pytest.mark.asyncio
    @patch("amplifier.session_monitor.daemon.asyncio.create_subprocess_exec")
    async def test_restart_session_success(self, mock_subprocess, daemon, sample_request):
        """Test successful session restart."""
        # Mock successful subprocess creation
        mock_process = AsyncMock()
        mock_process.pid = 12345
        mock_subprocess.return_value = mock_process

        workspace_dir = daemon.config.workspace_base_dir / sample_request.workspace_id
        workspace_dir.mkdir(parents=True, exist_ok=True)

        with patch("builtins.open", create=True) as mock_open:
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file

            await daemon._restart_session(sample_request)

            # Should create subprocess with continuation command
            mock_subprocess.assert_called_once()
            args, kwargs = mock_subprocess.call_args
            assert args[0] == "claude"  # Command split using shlex
            assert kwargs["cwd"] == str(workspace_dir)

    @pytest.mark.asyncio
    @patch("amplifier.session_monitor.daemon.asyncio.create_subprocess_exec")
    async def test_restart_session_with_backoff(self, mock_subprocess, daemon, sample_request):
        """Test session restart with exponential backoff on failures."""
        # Mock subprocess creation that fails twice then succeeds
        mock_process = AsyncMock()
        mock_process.pid = 12345

        mock_subprocess.side_effect = [
            Exception("Command failed"),  # First attempt fails
            Exception("Command failed"),  # Second attempt fails
            mock_process,  # Third attempt succeeds
        ]

        workspace_dir = daemon.config.workspace_base_dir / sample_request.workspace_id
        workspace_dir.mkdir(parents=True, exist_ok=True)

        with (
            patch("builtins.open", create=True) as mock_open,
            patch("amplifier.session_monitor.daemon.asyncio.sleep") as mock_sleep,
        ):
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file

            await daemon._restart_session(sample_request)

            # Should have tried 3 times
            assert mock_subprocess.call_count == 3
            # Should have slept for backoff (0.1, then 0.2)
            assert mock_sleep.call_count == 2
            for _, kwargs in mock_subprocess.call_args_list:
                assert kwargs["cwd"] == str(workspace_dir)

    @pytest.mark.asyncio
    @patch("amplifier.session_monitor.daemon.asyncio.create_subprocess_exec")
    async def test_restart_session_missing_workspace(self, mock_subprocess, daemon, sample_request, caplog):
        """Restart should abort when workspace directory is missing."""
        workspace_dir = daemon.config.workspace_base_dir / sample_request.workspace_id
        if workspace_dir.exists():
            for child in workspace_dir.iterdir():
                if child.is_file():
                    child.unlink()
                else:
                    child.rmdir()
            workspace_dir.rmdir()

        with caplog.at_level(logging.ERROR):
            await daemon._restart_session(sample_request)

        assert mock_subprocess.call_count == 0
        assert "does not exist" in caplog.text

    def test_scan_workspaces(self, daemon, config, sample_request):
        """Test scanning workspaces for termination requests."""
        # Create test workspace directory with request file
        workspace_dir = config.workspace_base_dir / sample_request.workspace_id
        workspace_dir.mkdir(parents=True, exist_ok=True)

        request_file = workspace_dir / "termination-request"
        with open(request_file, "w") as f:
            json.dump(sample_request.model_dump(mode="json"), f)

        try:
            workspaces = daemon._scan_workspaces()
            assert len(workspaces) >= 1
            assert workspace_dir in workspaces

        finally:
            request_file.unlink()
            workspace_dir.rmdir()
            config.workspace_base_dir.rmdir()

    @pytest.mark.asyncio
    async def test_handle_termination_request(self, daemon, sample_request):
        """Test handling of termination request files."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump(sample_request.model_dump(mode="json"), f)
            request_file = Path(f.name)

        try:
            with (
                patch.object(daemon, "_terminate_session") as mock_terminate,
                patch.object(daemon, "_validate_request", return_value=True) as mock_validate,
            ):
                await daemon.handle_termination_request(request_file)

                mock_validate.assert_called_once_with(sample_request)
                mock_terminate.assert_called_once_with(sample_request)

                # Request file should be deleted after processing
                assert not request_file.exists()

        finally:
            if request_file.exists():
                request_file.unlink()

    @pytest.mark.asyncio
    async def test_health_check(self, daemon, config):
        """Test daemon health check functionality."""
        with patch("os.getpid", return_value=12345), patch.object(daemon, "_scan_workspaces", return_value=[]):
            health = await daemon.health_check()

            assert health["daemon_running"] is False  # Not started yet
            assert health["pid"] == 12345
            assert "last_check" in health
            assert health["active_sessions"] == 0
            assert str(config.workspace_base_dir) in health["workspace_base_dir"]

    @patch("amplifier.session_monitor.daemon.asyncio.sleep")
    @pytest.mark.asyncio
    async def test_daemon_main_loop(self, mock_sleep, daemon):
        """Test the main daemon loop."""
        with (
            patch.object(daemon, "_scan_and_process_requests") as mock_scan,
            patch("os.getpid", return_value=12345),
            patch("builtins.open", create=True),
        ):
            # Mock to stop after one iteration
            call_count = 0

            async def stop_after_one():
                nonlocal call_count
                call_count += 1
                if call_count >= 1:
                    daemon.running = False

            mock_scan.side_effect = stop_after_one

            await daemon.start()

            assert mock_scan.call_count == 1
            mock_sleep.assert_called_once_with(daemon.config.check_interval_seconds)
