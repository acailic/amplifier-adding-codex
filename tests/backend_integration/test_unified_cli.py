#!/usr/bin/env python3
"""
Comprehensive unified CLI integration tests for Amplifier.

Tests cover argument parsing, backend selection, launching, special commands,
configuration loading, error handling, exit codes, and end-to-end workflows.
"""

import os
import subprocess
import tempfile
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock
from unittest.mock import patch

import pytest

# Import modules under test - currently none needed for these tests
from amplifier.core.config import BackendConfig

# Test Fixtures (assuming these are defined in conftest.py)


@pytest.fixture
def temp_dir():
    """Create temporary directory for test operations."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def integration_test_project(temp_dir):
    """Create complete project structure for integration tests."""
    project_dir = temp_dir / "project"
    project_dir.mkdir()

    # Create .claude directory
    claude_dir = project_dir / ".claude"
    claude_dir.mkdir()
    (claude_dir / "settings.json").write_text('{"backend": "claude"}')

    # Create .codex directory
    codex_dir = project_dir / ".codex"
    codex_dir.mkdir()
    (codex_dir / "config.toml").write_text("""
[backend]
profile = "development"

[mcp_servers]
enabled = ["session_manager", "quality_checker", "transcript_saver"]
""")

    # Create Makefile
    makefile = project_dir / "Makefile"
    makefile.write_text("""
check:
	@echo "Running checks..."
	uv run ruff check .
	uv run pyright .
	uv run pytest tests/

test:
	uv run pytest tests/

lint:
	uv run ruff check .

format:
	uv run ruff format --check .
""")

    # Create pyproject.toml
    pyproject = project_dir / "pyproject.toml"
    pyproject.write_text("""
[project]
name = "test-project"
version = "0.1.0"

[tool.uv]
dev-dependencies = ["pytest", "ruff", "pyright"]
""")

    # Create .git directory
    git_dir = project_dir / ".git"
    git_dir.mkdir()

    # Create sample Python files
    (project_dir / "main.py").write_text("print('Hello, World!')")
    (project_dir / "test_main.py").write_text("def test_hello(): pass")

    return project_dir


@pytest.fixture
def mock_claude_cli():
    """Mock subprocess calls to claude CLI."""

    def mock_run(cmd, **kwargs):
        if cmd[0] == "claude":
            result = Mock()
            result.returncode = 0
            result.stdout = "Claude Code started successfully"
            result.stderr = ""
            return result
        raise FileNotFoundError("claude not found")

    return mock_run


@pytest.fixture
def mock_codex_cli():
    """Mock subprocess calls to codex CLI."""

    def mock_run(cmd, **kwargs):
        if cmd[0] in ["./amplify-codex.sh", "codex"]:
            result = Mock()
            result.returncode = 0
            result.stdout = "Codex started successfully"
            result.stderr = ""
            return result
        raise FileNotFoundError("codex not found")

    return mock_run


@pytest.fixture
def mock_both_backends_available():
    """Mock both backends as available."""
    with (
        patch("amplifier.core.config.is_backend_available", return_value=True),
        patch("amplify.is_backend_available", return_value=True),
    ):
        yield


@pytest.fixture
def mock_only_claude_available():
    """Mock only Claude Code available."""

    def mock_is_available(backend):
        return backend == "claude"

    with (
        patch("amplifier.core.config.is_backend_available", side_effect=mock_is_available),
        patch("amplify.is_backend_available", side_effect=mock_is_available),
    ):
        yield


@pytest.fixture
def mock_only_codex_available():
    """Mock only Codex available."""

    def mock_is_available(backend):
        return backend == "codex"

    with (
        patch("amplifier.core.config.is_backend_available", side_effect=mock_is_available),
        patch("amplify.is_backend_available", side_effect=mock_is_available),
    ):
        yield


@pytest.fixture
def clean_env(monkeypatch):
    """Clear all AMPLIFIER_* environment variables."""
    for key in list(os.environ.keys()):
        if key.startswith("AMPLIFIER_"):
            monkeypatch.delenv(key, raising=False)


@pytest.fixture
def claude_env(monkeypatch):
    """Set environment for Claude Code backend."""
    monkeypatch.setenv("AMPLIFIER_BACKEND", "claude")


@pytest.fixture
def codex_env(monkeypatch):
    """Set environment for Codex backend."""
    monkeypatch.setenv("AMPLIFIER_BACKEND", "codex")


def make_cli_args(**overrides):
    """Build a namespace that mimics argparse output."""
    defaults = {
        "backend": None,
        "profile": "development",
        "config": None,
        "list_backends": False,
        "info": None,
        "version": False,
        "args": [],
    }
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


# Test Classes


class TestCLIArgumentParsing:
    """Test argument parsing and validation."""

    def test_cli_parse_args_defaults(self):
        """Parse arguments with no flags."""
        from amplify import parse_args

        # Mock sys.argv
        with patch("sys.argv", ["amplify.py"]):
            args = parse_args()

            assert args.backend is None
            assert args.profile == "development"
            assert args.args == []

    def test_cli_parse_args_backend_claude(self):
        """Parse --backend claude."""
        from amplify import parse_args

        with patch("sys.argv", ["amplify.py", "--backend", "claude"]):
            args = parse_args()

            assert args.backend == "claude"

    def test_cli_parse_args_backend_codex(self):
        """Parse --backend codex."""
        from amplify import parse_args

        with patch("sys.argv", ["amplify.py", "--backend", "codex"]):
            args = parse_args()

            assert args.backend == "codex"

    def test_cli_parse_args_profile(self):
        """Parse --profile ci."""
        from amplify import parse_args

        with patch("sys.argv", ["amplify.py", "--profile", "ci"]):
            args = parse_args()

            assert args.profile == "ci"

    def test_cli_parse_args_config_file(self):
        """Parse --config .env.production."""
        from amplify import parse_args

        with patch("sys.argv", ["amplify.py", "--config", ".env.production"]):
            args = parse_args()

            assert args.config == ".env.production"

    def test_cli_parse_args_passthrough(self):
        """Parse --backend codex exec "task"."""
        from amplify import parse_args

        with patch("sys.argv", ["amplify.py", "--backend", "codex", "exec", "task"]):
            args = parse_args()

            assert args.backend == "codex"
            assert args.args == ["exec", "task"]

    def test_cli_parse_args_special_commands(self):
        """Parse special commands."""
        from amplify import parse_args

        # Test --list-backends
        with patch("sys.argv", ["amplify.py", "--list-backends"]):
            args = parse_args()
            assert args.list_backends is True

        # Test --info codex
        with patch("sys.argv", ["amplify.py", "--info", "codex"]):
            args = parse_args()
            assert args.info == "codex"

        # Test --version
        with patch("sys.argv", ["amplify.py", "--version"]):
            args = parse_args()
            assert args.version is True


class TestCLIBackendSelection:
    """Test backend selection logic."""

    def test_cli_backend_selection_from_cli_arg(self, mock_both_backends_available, monkeypatch):
        """CLI argument takes precedence."""
        monkeypatch.setenv("AMPLIFIER_BACKEND", "claude")

        args = make_cli_args(backend="codex", args=["exec", "task"])
        config = SimpleNamespace(amplifier_backend="claude", amplifier_backend_auto_detect=False)

        with (
            patch("amplify.parse_args", return_value=args),
            patch("amplify.get_backend_config", return_value=config),
            patch("amplify.validate_backend", return_value=True),
            patch("amplify.launch_codex", return_value=0) as mock_launch_codex,
            patch("amplify.launch_claude_code") as mock_launch_claude,
        ):
            from amplify import main

            exit_code = main()

        assert exit_code == 0
        mock_launch_codex.assert_called_once_with(["exec", "task"], "development")
        mock_launch_claude.assert_not_called()

    def test_cli_backend_selection_from_env_var(self, mock_both_backends_available, codex_env):
        """Environment variable is used."""
        args = make_cli_args(backend=None)
        config = SimpleNamespace(amplifier_backend="codex", amplifier_backend_auto_detect=False)

        with (
            patch("amplify.parse_args", return_value=args),
            patch("amplify.get_backend_config", return_value=config),
            patch("amplify.validate_backend", return_value=True),
            patch("amplify.launch_codex", return_value=0) as mock_launch_codex,
        ):
            from amplify import main

            exit_code = main()

        assert exit_code == 0
        mock_launch_codex.assert_called_once_with([], "development")

    def test_cli_backend_selection_from_config_file(self, mock_both_backends_available, temp_dir, monkeypatch):
        """Config file is read."""
        env_file = temp_dir / ".env"
        env_file.write_text("AMPLIFIER_BACKEND=codex")

        monkeypatch.chdir(temp_dir)
        monkeypatch.delenv("ENV_FILE", raising=False)

        def load_config():
            return BackendConfig()

        args = make_cli_args(backend=None)

        with (
            patch("amplify.parse_args", return_value=args),
            patch("amplify.get_backend_config", side_effect=load_config),
            patch("amplify.validate_backend", return_value=True),
            patch("amplify.launch_codex", return_value=0) as mock_launch_codex,
        ):
            from amplify import main

            exit_code = main()

        assert exit_code == 0
        mock_launch_codex.assert_called_once_with([], "development")

    def test_cli_backend_selection_auto_detect(self, mock_only_codex_available, monkeypatch):
        """Auto-detection runs."""
        monkeypatch.delenv("AMPLIFIER_BACKEND", raising=False)
        monkeypatch.setenv("AMPLIFIER_BACKEND_AUTO_DETECT", "true")

        args = make_cli_args(backend=None)
        config = SimpleNamespace(amplifier_backend=None, amplifier_backend_auto_detect=True)

        with (
            patch("amplify.parse_args", return_value=args),
            patch("amplify.get_backend_config", return_value=config),
            patch("amplify.detect_backend", return_value="codex") as mock_detect,
            patch("amplify.validate_backend", return_value=True),
            patch("amplify.launch_codex", return_value=0) as mock_launch_codex,
        ):
            from amplify import main

            exit_code = main()

        mock_detect.assert_called_once()
        assert exit_code == 0
        mock_launch_codex.assert_called_once_with([], "development")

    def test_cli_backend_selection_default_fallback(self, mock_both_backends_available, clean_env):
        """Defaults to Claude Code."""
        args = make_cli_args(backend=None)
        config = SimpleNamespace(amplifier_backend=None, amplifier_backend_auto_detect=False)

        with (
            patch("amplify.parse_args", return_value=args),
            patch("amplify.get_backend_config", return_value=config),
            patch("amplify.validate_backend", return_value=True),
            patch("amplify.launch_claude_code", return_value=0) as mock_launch_claude,
        ):
            from amplify import main

            exit_code = main()

        assert exit_code == 0
        mock_launch_claude.assert_called_once()

    def test_cli_backend_selection_precedence_chain(self, mock_both_backends_available, temp_dir, monkeypatch):
        """CLI arg wins precedence."""
        env_file = temp_dir / ".env"
        env_file.write_text("AMPLIFIER_BACKEND=claude")
        monkeypatch.setenv("AMPLIFIER_BACKEND", "codex")

        args = make_cli_args(backend="claude")
        config = SimpleNamespace(amplifier_backend="codex", amplifier_backend_auto_detect=False)

        with (
            patch("amplify.parse_args", return_value=args),
            patch("amplify.get_backend_config", return_value=config),
            patch("amplify.validate_backend", return_value=True),
            patch("amplify.launch_claude_code", return_value=0) as mock_launch_claude,
            patch("amplify.launch_codex") as mock_launch_codex,
        ):
            from amplify import main

            exit_code = main()

        assert exit_code == 0
        mock_launch_claude.assert_called_once()
        mock_launch_codex.assert_not_called()


class TestCLIBackendLaunching:
    """Test launching backends via CLI."""

    def test_cli_launch_claude_code(self, mock_both_backends_available):
        """Launch Claude Code."""
        mock_result = Mock(returncode=0, stdout="ok", stderr="")
        with patch("subprocess.run", return_value=mock_result) as mock_run:
            from amplify import launch_claude_code

            exit_code = launch_claude_code(["status"])

        assert exit_code == 0
        mock_run.assert_called_once_with(["claude", "status"], check=False)

    def test_cli_launch_claude_with_passthrough_args(self, mock_both_backends_available):
        """Launch Claude with passthrough args."""
        mock_result = Mock(returncode=0, stdout="ok", stderr="")
        with patch("subprocess.run", return_value=mock_result) as mock_run:
            from amplify import launch_claude_code

            launch_claude_code(["--foo", "bar"])

        mock_run.assert_called_once()
        assert mock_run.call_args[0][0][-2:] == ["--foo", "bar"]

    def test_cli_launch_codex_with_wrapper(self, integration_test_project, mock_both_backends_available, monkeypatch):
        """Launch Codex with wrapper."""
        wrapper = integration_test_project / "amplify-codex.sh"
        wrapper.write_text("#!/bin/bash\necho 'Wrapper executed'")
        wrapper.chmod(0o755)
        (integration_test_project / ".codex" / "config.toml").write_text("[profiles.development]\n")

        mock_result = Mock(returncode=0, stdout="ok", stderr="")
        monkeypatch.chdir(integration_test_project)

        with patch("subprocess.run", return_value=mock_result) as mock_run:
            from amplify import launch_codex

            exit_code = launch_codex(["--diagnostic"], profile="development")

        assert exit_code == 0
        cmd = mock_run.call_args[0][0]
        assert cmd[:3] == ["./amplify-codex.sh", "--profile", "development"]
        assert cmd[-1] == "--diagnostic"

    def test_cli_launch_codex_direct_no_wrapper(
        self, integration_test_project, mock_both_backends_available, monkeypatch
    ):
        """Launch Codex directly without wrapper."""
        (integration_test_project / ".codex" / "config.toml").write_text("[profiles.development]\n")
        monkeypatch.chdir(integration_test_project)

        mock_result = Mock(returncode=0, stdout="ok", stderr="")
        with patch("subprocess.run", return_value=mock_result) as mock_run:
            from amplify import launch_codex

            exit_code = launch_codex(["--diagnostic"], profile="development")

        assert exit_code == 0
        cmd = mock_run.call_args[0][0]
        assert cmd[:4] == ["codex", "--profile", "development", "--config"]
        assert cmd[-1] == "--diagnostic"

    def test_cli_launch_codex_with_passthrough_args(
        self, integration_test_project, mock_both_backends_available, monkeypatch
    ):
        """Launch Codex with passthrough args."""
        wrapper = integration_test_project / "amplify-codex.sh"
        wrapper.write_text("#!/bin/bash\nexit 0")
        wrapper.chmod(0o755)
        mock_result = Mock(returncode=0, stdout="ok", stderr="")
        monkeypatch.chdir(integration_test_project)

        with patch("subprocess.run", return_value=mock_result) as mock_run:
            from amplify import launch_codex

            launch_codex(["exec", "--task", "Fix bug"], profile="ci")

        cmd = mock_run.call_args[0][0]
        assert cmd[:3] == ["./amplify-codex.sh", "--profile", "ci"]
        assert cmd[-3:] == ["exec", "--task", "Fix bug"]


class TestCLISpecialCommands:
    """Test --list-backends, --info, --version."""

    def test_cli_list_backends_both_available(self, mock_both_backends_available, capsys):
        """List both backends."""
        with patch("amplify.list_backends") as mock_list:
            mock_list.return_value = None

            # Simulate CLI call
            with patch("sys.argv", ["amplify.py", "--list-backends"]):
                from amplify import main

                main()

            captured = capsys.readouterr()
            # Verify output contains both backends
            assert "claude" in captured.out.lower()
            assert "codex" in captured.out.lower()

    def test_cli_list_backends_only_claude(self, mock_only_claude_available, capsys):
        """List only Claude."""
        with (
            patch("amplify.BackendFactory.get_available_backends", return_value=["claude"]),
            patch("sys.argv", ["amplify.py", "--list-backends"]),
        ):
            from amplify import main

            main()

        captured = capsys.readouterr()
        assert "claude" in captured.out.lower()
        assert "codex" in captured.out.lower()
        assert "not available" in captured.out.lower()

    def test_cli_list_backends_none_available(self, monkeypatch, capsys):
        """List when none available."""

        def mock_is_available(backend):
            return False

        monkeypatch.setattr("amplify.is_backend_available", mock_is_available)

        with (
            patch("amplify.BackendFactory.get_available_backends", return_value=[]),
            patch("sys.argv", ["amplify.py", "--list-backends"]),
        ):
            from amplify import main

            main()

        captured = capsys.readouterr()
        assert "no backends available" in captured.out.lower()

    def test_cli_show_backend_info_claude(self, mock_only_claude_available, capsys):
        """Show Claude info."""
        with patch("amplify.show_backend_info") as mock_info:
            mock_info.return_value = None

            with patch("sys.argv", ["amplify.py", "--info", "claude"]):
                from amplify import main

                main()

            # Verify info was called
            mock_info.assert_called_with("claude")

    def test_cli_show_backend_info_codex(self, mock_only_codex_available, capsys):
        """Show Codex info."""
        with patch("amplify.show_backend_info") as mock_info:
            mock_info.return_value = None

            with patch("sys.argv", ["amplify.py", "--info", "codex"]):
                from amplify import main

                main()

        mock_info.assert_called_with("codex")

    def test_cli_show_version(self, capsys):
        """Show version."""
        with patch("amplify.show_version") as mock_version:
            mock_version.return_value = None

            with patch("sys.argv", ["amplify.py", "--version"]):
                from amplify import main

                main()

            # Verify version was called
            mock_version.assert_called()


class TestCLIConfigurationLoading:
    """Test configuration file loading and precedence."""

    def test_cli_loads_config_from_default_env_file(self, temp_dir, mock_both_backends_available, monkeypatch):
        """Load from default .env."""
        env_file = temp_dir / ".env"
        env_file.write_text("AMPLIFIER_BACKEND=codex")

        monkeypatch.chdir(temp_dir)
        monkeypatch.delenv("ENV_FILE", raising=False)

        args = make_cli_args()

        with (
            patch("amplify.parse_args", return_value=args),
            patch("amplify.get_backend_config", side_effect=BackendConfig),
            patch("amplify.validate_backend", return_value=True),
            patch("amplify.launch_codex", return_value=0) as mock_launch_codex,
        ):
            from amplify import main

            exit_code = main()

        assert exit_code == 0
        mock_launch_codex.assert_called_once()

    def test_cli_loads_config_from_custom_file(self, temp_dir, mock_both_backends_available, monkeypatch):
        """Load from custom config file."""
        custom_env = temp_dir / ".env.production"
        custom_env.write_text("AMPLIFIER_BACKEND=codex")

        monkeypatch.chdir(temp_dir)
        monkeypatch.delenv("ENV_FILE", raising=False)

        args = make_cli_args(config=".env.production")

        def load_config():
            return BackendConfig()

        with (
            patch("amplify.parse_args", return_value=args),
            patch("amplify.get_backend_config", side_effect=load_config),
            patch("amplify.validate_backend", return_value=True),
            patch("amplify.launch_codex", return_value=0) as mock_launch_codex,
        ):
            from amplify import main

            exit_code = main()

        assert os.environ.get("ENV_FILE") == ".env.production"
        monkeypatch.delenv("ENV_FILE", raising=False)
        assert exit_code == 0
        mock_launch_codex.assert_called_once()

    def test_cli_config_override_with_env_var(self, temp_dir, mock_both_backends_available, monkeypatch):
        """Env var overrides config file."""
        env_file = temp_dir / ".env"
        env_file.write_text("AMPLIFIER_BACKEND=claude")
        monkeypatch.setenv("AMPLIFIER_BACKEND", "codex")
        monkeypatch.chdir(temp_dir)
        monkeypatch.delenv("ENV_FILE", raising=False)

        args = make_cli_args()

        with (
            patch("amplify.parse_args", return_value=args),
            patch("amplify.get_backend_config", side_effect=BackendConfig),
            patch("amplify.validate_backend", return_value=True),
            patch("amplify.launch_codex", return_value=0) as mock_launch_codex,
        ):
            from amplify import main

            exit_code = main()

        assert exit_code == 0
        mock_launch_codex.assert_called_once()

    def test_cli_config_override_with_cli_arg(self, temp_dir, mock_both_backends_available, monkeypatch):
        """CLI arg overrides everything."""
        env_file = temp_dir / ".env"
        env_file.write_text("AMPLIFIER_BACKEND=codex")
        monkeypatch.setenv("AMPLIFIER_BACKEND", "codex")

        monkeypatch.chdir(temp_dir)
        monkeypatch.delenv("ENV_FILE", raising=False)

        args = make_cli_args(backend="claude")

        with (
            patch("amplify.parse_args", return_value=args),
            patch("amplify.get_backend_config", side_effect=BackendConfig),
            patch("amplify.validate_backend", return_value=True),
            patch("amplify.launch_claude_code", return_value=0) as mock_launch_claude,
            patch("amplify.launch_codex") as mock_launch_codex,
        ):
            from amplify import main

            exit_code = main()

        assert exit_code == 0
        mock_launch_claude.assert_called_once()
        mock_launch_codex.assert_not_called()


class TestCLIErrorHandling:
    """Test error handling scenarios."""

    def test_cli_backend_not_available_error(self, mock_only_claude_available, capsys):
        """Backend not available error."""
        with patch("sys.argv", ["amplify.py", "--backend", "codex"]):
            from amplify import main

            exit_code = main()

            assert exit_code == 1
            captured = capsys.readouterr()
            assert "not available" in captured.out

    def test_cli_keyboard_interrupt(self, mock_both_backends_available, monkeypatch):
        """Handle keyboard interrupt."""

        def mock_run(*args, **kwargs):
            raise KeyboardInterrupt()

        monkeypatch.setattr("subprocess.run", mock_run)

        with patch("sys.argv", ["amplify.py", "--backend", "claude"]):
            from amplify import main

            exit_code = main()

            assert exit_code == 130

    def test_cli_subprocess_error(self, mock_both_backends_available, monkeypatch):
        """Handle subprocess error."""

        def mock_run(*args, **kwargs):
            raise subprocess.CalledProcessError(1, "claude", "Command failed")

        monkeypatch.setattr("subprocess.run", mock_run)

        with patch("sys.argv", ["amplify.py", "--backend", "claude"]):
            from amplify import main

            exit_code = main()

        assert exit_code == 1

    def test_cli_invalid_profile(self, mock_both_backends_available):
        """Invalid profile error."""
        with patch("sys.argv", ["amplify.py", "--backend", "codex", "--profile", "invalid"]):
            from amplify import main

            exit_code = main()

            assert exit_code != 0

    def test_cli_missing_config_file(self, temp_dir, mock_both_backends_available):
        """Missing config file handling."""
        with patch("sys.argv", ["amplify.py", "--config", "nonexistent.env"]):
            from amplify import main

            exit_code = main()

            # Should continue with defaults
            assert exit_code == 0


class TestCLIExitCodes:
    """Test exit code handling."""

    def test_cli_exit_code_success(self, mock_both_backends_available, mock_claude_cli):
        """Successful exit."""
        with (
            patch("subprocess.run", mock_claude_cli),
            patch("sys.argv", ["amplify.py", "--backend", "claude"]),
        ):
            from amplify import main

            exit_code = main()

            assert exit_code == 0

    def test_cli_exit_code_backend_failure(self, mock_both_backends_available, mock_codex_cli):
        """Backend failure exit."""

        def failing_cli(*args, **kwargs):
            result = Mock()
            result.returncode = 1
            result.stdout = ""
            result.stderr = "Error"
            return result

        with (
            patch("subprocess.run", failing_cli),
            patch("sys.argv", ["amplify.py", "--backend", "codex"]),
        ):
            from amplify import main

            exit_code = main()

            assert exit_code == 1

    def test_cli_exit_code_validation_failure(self, monkeypatch, capsys):
        """Validation failure exit."""
        monkeypatch.setattr("amplify.validate_backend", lambda x: False)

        with patch("sys.argv", ["amplify.py", "--backend", "invalid"]):
            from amplify import main

            exit_code = main()

            assert exit_code == 1


class TestCLIIntegration:
    """Integration tests for end-to-end workflows."""

    def test_cli_end_to_end_claude(self, integration_test_project, mock_claude_cli, mock_memory_system):
        """Full Claude workflow."""
        with (
            patch("subprocess.run", mock_claude_cli),
            patch("os.chdir", lambda x: None),
            patch("sys.argv", ["amplify.py", "--backend", "claude"]),
        ):
            from amplify import main

            exit_code = main()

            assert exit_code == 0

    def test_cli_end_to_end_codex(self, integration_test_project, mock_codex_cli, mock_memory_system):
        """Full Codex workflow."""
        with (
            patch("subprocess.run", mock_codex_cli),
            patch("sys.argv", ["amplify.py", "--backend", "codex"]),
        ):
            from amplify import main

            exit_code = main()

            assert exit_code == 0

    def test_cli_backend_switching_in_same_session(
        self, integration_test_project, mock_both_backends_available, mock_claude_cli, mock_codex_cli
    ):
        """Switch backends in same session."""
        with (
            patch("subprocess.run", mock_claude_cli),
            patch("sys.argv", ["amplify.py", "--backend", "claude"]),
        ):
            from amplify import main

            assert main() == 0

        with (
            patch("subprocess.run", mock_codex_cli),
            patch("sys.argv", ["amplify.py", "--backend", "codex"]),
        ):
            from amplify import main

            assert main() == 0


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
