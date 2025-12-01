from __future__ import annotations

import base64
from collections.abc import Mapping
from pathlib import Path


class PreviewGenerationError(Exception):
    """Raised when a preview cannot be generated."""


def _first_numeric_column(records: list[Mapping[str, object]]) -> tuple[str | None, list[float]]:
    if not records:
        return None, []
    sample = records[0]
    for key, value in sample.items():
        try:
            numeric_values = [float(row[key]) for row in records if row.get(key) is not None]
            if numeric_values:
                return key, numeric_values
        except Exception:
            continue
    return None, []


def generate_preview_image(
    records: list[Mapping[str, object]],
    output_path: Path | None = None,
) -> dict:
    """Generate a minimal line preview (index vs first numeric column).

    If matplotlib is unavailable, returns metadata without creating an image.
    """
    column, values = _first_numeric_column(records)
    if not column or not values:
        raise PreviewGenerationError("No numeric data available for preview.")

    try:
        import matplotlib.pyplot as plt  # type: ignore
    except Exception as exc:  # pragma: no cover - optional dependency
        raise PreviewGenerationError(f"matplotlib not available: {exc}") from exc

    fig, ax = plt.subplots(figsize=(4, 2.5))
    ax.plot(range(len(values)), values, color="#1976d2", linewidth=1.5)
    ax.set_title(f"Preview: {column}")
    ax.set_xlabel("Index")
    ax.set_ylabel(column)
    fig.tight_layout()

    info: dict[str, object] = {"column": column, "points": len(values)}

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(output_path, dpi=150)
        info["file"] = str(output_path)
    else:
        import io

        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150)
        info["inline_base64"] = base64.b64encode(buf.getvalue()).decode("utf-8")

    plt.close(fig)
    return info
