"""
Compatibility helpers for FastMCP-based servers.

FastMCP >=2 expects newer MCP bindings that expose an ``Icon`` type. The version
currently installed in this workspace (mcp==1.14.1) predates that addition, so
``from mcp.types import Icon`` raises ``ImportError`` and the FastMCP import
fails.  This shim backfills a minimal Icon model so we can continue using the
existing dependency set until the base environment is upgraded.
"""

from __future__ import annotations

from typing import Literal

import mcp.types as mcp_types
from pydantic import BaseModel, ConfigDict


def _ensure_icon_type() -> None:
    """Backfill the Icon type expected by FastMCP when missing."""

    if hasattr(mcp_types, "Icon"):
        return

    class Icon(BaseModel):
        """Simplified Icon definition compatible with FastMCP expectations."""

        model_config = ConfigDict(extra="allow")

        type: Literal["emoji", "image", "file"] = "emoji"
        emoji: str | None = None
        uri: str | None = None
        alt: str | None = None
        label: str | None = None

    setattr(mcp_types, "Icon", Icon)


_ensure_icon_type()

from fastmcp import FastMCP  # noqa: E402  (import after compatibility fix)

__all__ = ["FastMCP"]
