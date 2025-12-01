from __future__ import annotations

from collections.abc import Iterable
from collections.abc import Mapping
from dataclasses import dataclass


@dataclass
class SchemaValidationResult:
    passed: bool
    missing_columns: list[str]
    type_issues: list[str]
    checked_columns: list[str]


def validate_schema(records: list[Mapping[str, object]], schema: Mapping[str, object]) -> SchemaValidationResult:
    """Validate dataset records against a simple schema.

    Supported schema keys:
    - required: list of column names that must exist
    - numeric: list of column names that must be numeric
    - categorical: list of column names that must be strings
    """
    if not records:
        return SchemaValidationResult(
            passed=False,
            missing_columns=[],
            type_issues=["No records available for validation"],
            checked_columns=[],
        )

    first = records[0]
    required = set(_as_list(schema.get("required", [])))
    numeric = set(_as_list(schema.get("numeric", [])))
    categorical = set(_as_list(schema.get("categorical", [])))

    missing = [col for col in required if col not in first]
    type_issues: list[str] = []

    def is_numeric(value: object) -> bool:
        try:
            float(value)  # type: ignore[arg-type]
            return True
        except Exception:
            return False

    def is_string(value: object) -> bool:
        return isinstance(value, str)

    for col in numeric:
        if col not in first:
            continue
        for row in records:
            value = row.get(col)
            if value is None:
                continue
            if not is_numeric(value):
                type_issues.append(f"{col}: expected numeric, got {value!r}")
                break

    for col in categorical:
        if col not in first:
            continue
        for row in records:
            value = row.get(col)
            if value is None:
                continue
            if not is_string(value):
                type_issues.append(f"{col}: expected string, got {value!r}")
                break

    passed = not missing and not type_issues
    return SchemaValidationResult(
        passed=passed,
        missing_columns=missing,
        type_issues=type_issues,
        checked_columns=sorted(required | numeric | categorical),
    )


def _as_list(value: object) -> Iterable[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, Iterable):
        return [str(v) for v in value]
    return []
