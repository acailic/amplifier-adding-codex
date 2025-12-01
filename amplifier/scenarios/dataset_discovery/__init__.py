"""Dataset discovery tool for data.gov.rs.

This package provides tools for discovering datasets from the Serbian open data portal
with support for Serbian language specifics (diacritics, keywords, etc.).
"""

from .api_client import UDataAPIClient
from .discover_datasets import discover_by_category
from .discover_datasets import discover_by_query
from .output_formatter import OutputFormatter
from .query_expander import QueryExpander

__all__ = [
    "UDataAPIClient",
    "QueryExpander",
    "OutputFormatter",
    "discover_by_category",
    "discover_by_query",
]
