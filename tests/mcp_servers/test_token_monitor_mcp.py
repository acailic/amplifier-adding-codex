"""Tests for token monitor MCP server."""

import asyncio
import shutil
import sys
from pathlib import Path
from unittest.mock import MagicMock
from unittest.mock import patch

import pytest

# Add project paths for imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / ".codex"))

from amplifier.session_monitor.models import MonitorConfig  # noqa: E402
from amplifier.session_monitor.models import TokenUsageSnapshot  # noqa: E402


class TestTokenMonitorMCP:
    """Test cases for token monitor MCP server."""

    @pytest.fixture
    def mock_token_tracker(self):
        """Mock TokenTracker for testing."""
        tracker = MagicMock()
        tracker.get_current_usage.return_value = TokenUsageSnapshot(
            estimated_tokens=75000, usage_pct=75.0, source="transcript"
        )
        tracker.should_terminate.return_value = (False, "Token usage within safe limits")
        return tracker

    @pytest.fixture
    def mock_monitor_config(self):
        """Mock MonitorConfig for testing."""
        return MonitorConfig(token_warning_threshold=80.0, token_critical_threshold=90.0)

    @pytest.fixture
    def workspace_dir(self):
        """Create a temporary workspace directory."""
        path = Path(".codex/workspaces/test_workspace")
        path.mkdir(parents=True, exist_ok=True)
        try:
            yield path
        finally:
            if path.exists():
                shutil.rmtree(path)

    @staticmethod
    def run_async(func, *args, **kwargs):
        """Helper to run async MCP tools in tests."""
        return asyncio.run(func(*args, **kwargs))

    def test_get_token_usage_tool_success(self, mock_token_tracker):
        """Test successful get_token_usage tool call."""
        with (
            patch("codex.mcp_servers.token_monitor.setup_amplifier_path", return_value=True),
            patch("codex.mcp_servers.token_monitor.get_project_root", return_value=Path("/tmp")),
            patch("codex.mcp_servers.token_monitor.TokenTracker", return_value=mock_token_tracker),
        ):
            # Import after patching
            from codex.mcp_servers.token_monitor.server import get_token_usage

            # This would be called via MCP, but we'll test the function directly
            # In a real scenario, this would be invoked through the MCP protocol

            result = self.run_async(get_token_usage, "test_workspace")

            assert result["success"] is True
            assert result["data"]["workspace_id"] == "test_workspace"
            assert result["data"]["token_usage"]["estimated_tokens"] == 75000
            assert result["data"]["token_usage"]["usage_pct"] == 75.0
            assert result["data"]["token_usage"]["source"] == "transcript"

    def test_get_token_usage_tool_amplifier_not_available(self):
        """Test get_token_usage when amplifier modules not available."""
        with patch("codex.mcp_servers.token_monitor.setup_amplifier_path", return_value=False):
            from codex.mcp_servers.token_monitor.server import get_token_usage

            result = self.run_async(get_token_usage, "test_workspace")

            assert result["success"] is False
            assert "Amplifier modules not available" in result["error"]

    def test_check_should_terminate_tool(self, mock_token_tracker, mock_monitor_config):
        """Test check_should_terminate tool."""
        with (
            patch("codex.mcp_servers.token_monitor.setup_amplifier_path", return_value=True),
            patch("codex.mcp_servers.token_monitor.get_project_root", return_value=Path("/tmp")),
            patch("codex.mcp_servers.token_monitor.TokenTracker", return_value=mock_token_tracker),
            patch("codex.mcp_servers.token_monitor.MonitorConfig", return_value=mock_monitor_config),
        ):
            from codex.mcp_servers.token_monitor.server import check_should_terminate

            result = self.run_async(check_should_terminate, "test_workspace")

            assert result["success"] is True
            assert result["data"]["workspace_id"] == "test_workspace"
            assert result["data"]["should_terminate"] is False
            assert "within safe limits" in result["data"]["reason"]
            assert result["data"]["token_usage"]["usage_pct"] == 75.0
            assert result["data"]["thresholds"]["warning"] == 80.0
            assert result["data"]["thresholds"]["critical"] == 90.0

    def test_request_termination_tool_success(self, mock_token_tracker, workspace_dir):
        """Test successful request_termination tool."""
        session_pid_file = workspace_dir / "session.pid"
        session_pid_file.write_text("12345\n")

        with (
            patch("codex.mcp_servers.token_monitor.setup_amplifier_path", return_value=True),
            patch("codex.mcp_servers.token_monitor.get_project_root", return_value=Path("/tmp")),
            patch("codex.mcp_servers.token_monitor.TokenTracker", return_value=mock_token_tracker),
            patch("os.kill", return_value=None),
        ):
            from codex.mcp_servers.token_monitor.server import request_termination

            result = self.run_async(
                request_termination,
                workspace_id="test_workspace",
                reason="token_limit_approaching",
                continuation_command="claude --continue",
                priority="graceful",
            )

            assert result["success"] is True
            assert result["data"]["workspace_id"] == "test_workspace"
            assert result["data"]["reason"] == "token_limit_approaching"
            assert result["data"]["priority"] == "graceful"
            assert result["data"]["token_usage_pct"] == 75.0
            assert result["data"]["pid"] == 12345

    def test_request_termination_tool_invalid_reason(self, workspace_dir):
        """Test request_termination with invalid reason."""
        (workspace_dir / "session.pid").write_text("9999\n")

        with (
            patch("codex.mcp_servers.token_monitor.setup_amplifier_path", return_value=True),
            patch("codex.mcp_servers.token_monitor.get_project_root", return_value=Path("/tmp")),
            patch("os.kill", return_value=None),
        ):
            from codex.mcp_servers.token_monitor.server import request_termination

            result = self.run_async(
                request_termination,
                workspace_id="test_workspace",
                reason="invalid_reason",
                continuation_command="claude --continue",
                priority="graceful",
            )

            assert result["success"] is False
            assert "Invalid reason or priority" in result["error"]

    def test_get_monitor_status_tool(self, workspace_dir):
        """Test get_monitor_status tool."""
        pid_file = Path(".codex/session_monitor.pid")
        pid_file.parent.mkdir(parents=True, exist_ok=True)
        pid_file.write_text("2222\n")
        (workspace_dir / "session.pid").write_text("3333\n")

        try:
            with (
                patch("codex.mcp_servers.token_monitor.setup_amplifier_path", return_value=True),
                patch("codex.mcp_servers.token_monitor.get_project_root", return_value=Path("/tmp")),
                patch("os.kill", return_value=None),
            ):
                from codex.mcp_servers.token_monitor.server import get_monitor_status

                result = self.run_async(get_monitor_status)

                assert result["success"] is True
                data = result["data"]
                assert data["daemon_running"] is True
                assert data["daemon_pid"] == 2222
                assert data["daemon_pid_stale"] is False
                assert data["active_sessions"]
                session = data["active_sessions"][0]
                assert session["session_running"] is True
                assert session["workspace_id"] == "test_workspace"
        finally:
            if pid_file.exists():
                pid_file.unlink()

    def test_health_check_tool(self):
        """Test health check tool."""
        with (
            patch("codex.mcp_servers.token_monitor.setup_amplifier_path", return_value=True),
            patch("codex.mcp_servers.token_monitor.get_project_root", return_value=Path("/tmp")),
            patch("os.getpid", return_value=12345),
        ):
            from codex.mcp_servers.token_monitor.server import health_check

            result = self.run_async(health_check)

            assert result["success"] is True
            assert result["data"]["server"] == "token_monitor"
            assert result["data"]["project_root"] == "/tmp"
            assert result["data"]["modules_available"] is True

    def test_error_handling_import_failure(self):
        """Test error handling when TokenTracker import fails."""
        with (
            patch("codex.mcp_servers.token_monitor.setup_amplifier_path", return_value=True),
            patch("codex.mcp_servers.token_monitor.get_project_root", return_value=Path("/tmp")),
            patch.dict("sys.modules", {"amplifier.session_monitor.token_tracker": None}),
        ):
            original_import = __import__

            def mock_import(name, globals=None, locals=None, fromlist=(), level=0):
                if name == "amplifier.session_monitor.token_tracker":
                    raise ImportError("Mock import error")
                return original_import(name, globals, locals, fromlist, level)

            with patch("builtins.__import__", side_effect=mock_import):
                from codex.mcp_servers.token_monitor.server import get_token_usage

                result = self.run_async(get_token_usage, "test_workspace")

                assert result["success"] is False
                assert "TokenTracker not available" in result["error"]

    def test_mcp_server_startup(self):
        """Test that MCP server can be imported and initialized."""
        # This test just verifies the server module can be imported without errors
        try:
            from codex.mcp_servers.token_monitor import server

            assert hasattr(server, "mcp")
            assert hasattr(server, "get_token_usage")
            assert hasattr(server, "check_should_terminate")
            assert hasattr(server, "request_termination")
            assert hasattr(server, "get_monitor_status")
        except ImportError as e:
            pytest.skip(f"Server module not available: {e}")
