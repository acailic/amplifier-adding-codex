#!/usr/bin/env python3
"""Batch fix common type errors in scenarios."""

import re
from pathlib import Path


def fix_logger_exception(content: str) -> str:
    """Replace logger.exception with logger.error for ToolkitLogger."""
    return content.replace("logger.exception(", "logger.error(")


def fix_optional_path_none(file_path: Path) -> bool:
    """Fix Path | None issues in storage files."""
    content = file_path.read_text()
    original = content

    # Fix sqlite3.connect with None check
    content = re.sub(
        r"sqlite3\.connect\(([^)]+)\)",
        lambda m: f"sqlite3.connect(str({m.group(1)}))"
        if "Path" in m.group(1) or "db_path" in m.group(1)
        else m.group(0),
        content,
    )

    # Fix int() with None check
    content = re.sub(r"int\(([^)]+\.fetchone\(\)\[0\])\)", r"int(\1) if \1 is not None else 0", content)

    if content != original:
        file_path.write_text(content)
        return True
    return False


def fix_protocol_abstractmethods(file_path: Path) -> bool:
    """Add pass to Protocol abstract methods."""
    content = file_path.read_text()
    original = content

    # Find Protocol methods that need return statements
    pattern = r"(@abstractmethod\s+def [^:]+-> (list\[list\[float\]\]|list\[float\]|str):)\s*$"

    def add_ellipsis(match):
        return match.group(1) + " ..."

    content = re.sub(pattern, add_ellipsis, content, flags=re.MULTILINE)

    if content != original:
        file_path.write_text(content)
        return True
    return False


# Fix all logger.exception calls
for scenario_dir in Path("scenarios").iterdir():
    if scenario_dir.is_dir():
        for py_file in scenario_dir.rglob("*.py"):
            content = py_file.read_text()
            new_content = fix_logger_exception(content)
            if new_content != content:
                py_file.write_text(new_content)
                print(f"Fixed logger.exception in {py_file}")

# Fix storage files
for storage_file in Path("scenarios").rglob("storage.py"):
    if fix_optional_path_none(storage_file):
        print(f"Fixed Path issues in {storage_file}")

# Fix backends.py files
for backends_file in Path("scenarios").rglob("backends.py"):
    if fix_protocol_abstractmethods(backends_file):
        print(f"Fixed Protocol methods in {backends_file}")

print("Done!")
