"""Tests for checkpoint/resume functionality in session management."""

import json

import pytest

from amplifier.ccsdk_toolkit.sessions.manager import SessionManager
from amplifier.ccsdk_toolkit.sessions.models import SessionMetadata
from amplifier.ccsdk_toolkit.sessions.models import SessionState
from amplifier.session_monitor.models import TokenUsageSnapshot


class TestCheckpointResume:
    """Test cases for session checkpoint and resume functionality."""

    @pytest.fixture
    def sample_session_state(self):
        """Create a sample session state for testing."""
        metadata = SessionMetadata(session_id="test-session-123", name="Test Session", turns=5, total_tokens=1500)

        return SessionState(
            metadata=metadata,
            messages=[
                {"role": "user", "content": "Hello", "timestamp": "2024-01-01T10:00:00"},
                {"role": "assistant", "content": "Hi there!", "timestamp": "2024-01-01T10:00:01"},
            ],
            context={"project": "test"},
            config={"model": "claude-3"},
        )

    @pytest.fixture
    def session_manager(self, tmp_path):
        """Provide a session manager scoped to a temp directory."""
        manager = SessionManager(session_dir=tmp_path / "sessions")
        manager.workspace_base_dir = tmp_path / "workspaces"
        return manager

    @pytest.fixture
    def sample_checkpoint_data(self):
        """Sample checkpoint data."""
        return {
            "current_task": "implementing authentication",
            "completed_steps": ["setup", "database"],
            "next_step": "api endpoints",
            "variables": {"user_id": 123, "token": "abc123"},
        }

    def test_session_state_checkpoint_extension(self, sample_session_state, sample_checkpoint_data):
        """Test that SessionState supports checkpoint data."""
        # Should not have checkpoint data initially
        assert sample_session_state.checkpoint_data is None
        assert sample_session_state.last_checkpoint_at is None
        assert sample_session_state.token_usage_history == []

        # Create checkpoint
        sample_session_state.create_checkpoint(sample_checkpoint_data)

        assert sample_session_state.checkpoint_data == sample_checkpoint_data
        assert sample_session_state.last_checkpoint_at is not None
        assert len(sample_session_state.token_usage_history) == 0  # No token usage yet

    def test_record_token_usage(self, sample_session_state):
        """Test recording token usage in session state."""
        usage1 = TokenUsageSnapshot(estimated_tokens=1000, usage_pct=10.0, source="session_log")
        usage2 = TokenUsageSnapshot(estimated_tokens=2000, usage_pct=20.0, source="transcript")

        sample_session_state.record_token_usage(usage1)
        sample_session_state.record_token_usage(usage2)

        assert len(sample_session_state.token_usage_history) == 2
        assert sample_session_state.token_usage_history[0].estimated_tokens == 1000
        assert sample_session_state.token_usage_history[1].estimated_tokens == 2000

    def test_restore_from_checkpoint(self, sample_session_state, sample_checkpoint_data):
        """Test restoring checkpoint data."""
        # Initially no checkpoint
        assert sample_session_state.restore_from_checkpoint() is None

        # Create checkpoint
        sample_session_state.create_checkpoint(sample_checkpoint_data)

        # Should be able to restore
        restored = sample_session_state.restore_from_checkpoint()
        assert restored == sample_checkpoint_data

    def test_save_checkpoint_to_file(self, session_manager, sample_session_state, sample_checkpoint_data):
        """SessionManager.save_checkpoint persists both session and workspace file."""
        session_manager.save_session(sample_session_state)
        checkpoint_file = session_manager.save_checkpoint(
            sample_session_state.metadata.session_id, sample_checkpoint_data
        )

        assert checkpoint_file.exists()
        with open(checkpoint_file) as f:
            saved_data = json.load(f)

        assert saved_data["session_id"] == sample_session_state.metadata.session_id
        assert saved_data["checkpoint_data"] == sample_checkpoint_data
        assert "timestamp" in saved_data

        # The in-memory session should also reflect the checkpoint
        restored_session = session_manager.load_session(sample_session_state.metadata.session_id)
        assert restored_session
        assert restored_session.checkpoint_data == sample_checkpoint_data

    def test_load_checkpoint_from_file(self, session_manager, sample_session_state, sample_checkpoint_data):
        """SessionManager.load_checkpoint returns persisted data."""
        session_id = sample_session_state.metadata.session_id
        session_manager.save_session(sample_session_state)
        session_manager.save_checkpoint(session_id, sample_checkpoint_data)

        checkpoint = session_manager.load_checkpoint(session_id)

        assert checkpoint is not None
        assert checkpoint["checkpoint_data"] == sample_checkpoint_data
        assert checkpoint["session_id"] == session_id

    def test_resume_session_workflow(self, sample_session_state, sample_checkpoint_data):
        """Test the complete resume session workflow."""
        # 1. Create checkpoint
        sample_session_state.create_checkpoint(sample_checkpoint_data)

        # 2. Simulate session save (this would update session state)
        sample_session_state.metadata.update()

        # 3. Simulate resume (load checkpoint)
        restored_data = sample_session_state.restore_from_checkpoint()

        assert restored_data == sample_checkpoint_data
        assert sample_session_state.last_checkpoint_at is not None

    def test_missing_checkpoint_file(self, session_manager):
        """Test graceful handling when checkpoint file doesn't exist."""
        loaded_checkpoint = session_manager.load_checkpoint("missing-session")
        assert loaded_checkpoint is None

    def test_checkpoint_with_token_history(self, sample_session_state, sample_checkpoint_data):
        """Test checkpoint creation with token usage history."""
        # Record some token usage
        usage = TokenUsageSnapshot(estimated_tokens=1500, usage_pct=15.0, source="session_log")
        sample_session_state.record_token_usage(usage)

        # Create checkpoint
        sample_session_state.create_checkpoint(sample_checkpoint_data)

        # Verify both checkpoint data and token history are preserved
        assert sample_session_state.checkpoint_data == sample_checkpoint_data
        assert len(sample_session_state.token_usage_history) == 1
        assert sample_session_state.token_usage_history[0].estimated_tokens == 1500

    def test_checkpoint_backward_compatibility(self):
        """Test that sessions without checkpoint fields still work."""
        # Create a session state without checkpoint fields (simulating old format)
        metadata = SessionMetadata(session_id="old-session", name="Old Session")

        # Manually create session state without calling create_checkpoint
        session_state = SessionState(metadata=metadata, messages=[], context={}, config={})

        # Should not have checkpoint data
        assert session_state.checkpoint_data is None
        assert session_state.last_checkpoint_at is None
        assert session_state.token_usage_history == []

        # Should be able to call restore (returns None)
        restored = session_state.restore_from_checkpoint()
        assert restored is None

        # Should be able to record token usage
        usage = TokenUsageSnapshot(estimated_tokens=1000, usage_pct=10.0, source="test")
        session_state.record_token_usage(usage)
        assert len(session_state.token_usage_history) == 1
        assert session_state.token_usage_history[0].estimated_tokens == 1000

    def test_resume_session_updates_context(self, session_manager, sample_session_state, sample_checkpoint_data):
        """SessionManager.resume_session restores checkpoint and tracks continuation command."""
        session_id = sample_session_state.metadata.session_id
        session_manager.save_session(sample_session_state)
        session_manager.save_checkpoint(session_id, sample_checkpoint_data)

        resumed = session_manager.resume_session(session_id, "claude --continue")

        assert resumed.checkpoint_data == sample_checkpoint_data
        assert resumed.context["continuation_command"] == "claude --continue"
        assert resumed.last_checkpoint_at is not None
