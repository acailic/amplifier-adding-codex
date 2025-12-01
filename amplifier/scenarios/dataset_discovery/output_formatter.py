"""JSON output formatting for dataset discovery results.

This module formats dataset information into a standardized JSON schema
compatible with the vizualni-admin demo configuration.
"""

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class OutputFormatter:
    """Formats dataset discovery results into standardized JSON."""

    @staticmethod
    def extract_dataset_info(dataset: dict[str, Any]) -> dict[str, Any]:
        """Extract relevant information from a uData dataset object.

        Args:
            dataset: Raw dataset object from uData API

        Returns:
            Formatted dataset information with schema:
                - id: Dataset identifier
                - title: Dataset title
                - organization: Organization name
                - tags: List of tags
                - format: Primary data format (CSV, JSON, XLS, etc.)
                - url: Dataset URL

        Example:
            >>> formatter = OutputFormatter()
            >>> raw = {"id": "abc123", "title": "Air Quality", ...}
            >>> formatter.extract_dataset_info(raw)
            {'id': 'abc123', 'title': 'Air Quality', ...}
        """
        # Extract basic info
        dataset_id = dataset.get("id", "")
        title = dataset.get("title", "Untitled")

        # Extract organization
        org = dataset.get("organization", {})
        organization = org.get("name", "Unknown") if isinstance(org, dict) else str(org)

        # Extract tags
        tags = dataset.get("tags", [])
        if isinstance(tags, list):
            # Tags might be strings or objects with 'name' field
            tag_list = []
            for tag in tags:
                if isinstance(tag, dict):
                    tag_list.append(tag.get("name", ""))
                else:
                    tag_list.append(str(tag))
        else:
            tag_list = []

        # Extract format from resources
        resources = dataset.get("resources", [])
        format_type = "Unknown"
        url = ""

        if resources and isinstance(resources, list):
            # Get format from first resource
            first_resource = resources[0]
            if isinstance(first_resource, dict):
                format_type = first_resource.get("format", "Unknown").upper()
                url = first_resource.get("url", "")

        # If no URL from resources, try dataset page
        if not url:
            url = dataset.get("page", "")

        return {
            "id": dataset_id,
            "title": title,
            "organization": organization,
            "tags": tag_list,
            "format": format_type,
            "url": url,
        }

    @staticmethod
    def format_datasets(datasets: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Format a list of datasets into standardized schema.

        Args:
            datasets: List of raw dataset objects from uData API

        Returns:
            List of formatted dataset objects

        Example:
            >>> formatter = OutputFormatter()
            >>> raw_datasets = [{"id": "1", ...}, {"id": "2", ...}]
            >>> formatted = formatter.format_datasets(raw_datasets)
            >>> len(formatted) == 2
            True
        """
        formatted = []

        for dataset in datasets:
            try:
                formatted.append(OutputFormatter.extract_dataset_info(dataset))
            except Exception as e:
                logger.warning(f"Failed to format dataset: {e}")
                # Continue with other datasets
                continue

        logger.info(f"Formatted {len(formatted)} out of {len(datasets)} datasets")
        return formatted

    @staticmethod
    def save_to_json(
        datasets: list[dict[str, Any]],
        output_path: Path | str,
        indent: int = 2,
    ) -> None:
        """Save formatted datasets to JSON file.

        Args:
            datasets: List of formatted dataset objects
            output_path: Path to output JSON file
            indent: JSON indentation (default: 2 spaces)

        Example:
            >>> formatter = OutputFormatter()
            >>> datasets = [{"id": "1", "title": "Test"}]
            >>> formatter.save_to_json(datasets, "output.json")
        """
        output_path = Path(output_path)

        # Ensure parent directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Write JSON
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(datasets, f, indent=indent, ensure_ascii=False)

        logger.info(f"Saved {len(datasets)} datasets to {output_path}")

    @staticmethod
    def load_from_json(input_path: Path | str) -> list[dict[str, Any]]:
        """Load datasets from JSON file.

        Args:
            input_path: Path to input JSON file

        Returns:
            List of dataset objects

        Raises:
            FileNotFoundError: If file doesn't exist
            json.JSONDecodeError: If file is not valid JSON

        Example:
            >>> formatter = OutputFormatter()
            >>> datasets = formatter.load_from_json("datasets.json")
        """
        input_path = Path(input_path)

        with open(input_path, encoding="utf-8") as f:
            datasets = json.load(f)

        logger.info(f"Loaded {len(datasets)} datasets from {input_path}")
        return datasets

    @staticmethod
    def print_summary(datasets: list[dict[str, Any]]) -> None:
        """Print a summary of discovered datasets to console.

        Args:
            datasets: List of formatted dataset objects

        Example:
            >>> formatter = OutputFormatter()
            >>> datasets = [{"id": "1", "title": "Test", "format": "CSV"}]
            >>> formatter.print_summary(datasets)  # Prints summary to console
        """
        print(f"\nFound {len(datasets)} datasets\n")

        if not datasets:
            return

        # Group by format
        formats: dict[str, int] = {}
        for dataset in datasets:
            fmt = dataset.get("format", "Unknown")
            formats[fmt] = formats.get(fmt, 0) + 1

        print("Formats:")
        for fmt, count in sorted(formats.items()):
            print(f"  {fmt}: {count}")

        print("\nDatasets:")
        for i, dataset in enumerate(datasets[:10], 1):
            print(f"\n{i}. {dataset.get('title', 'Untitled')}")
            print(f"   ID: {dataset.get('id', 'N/A')}")
            print(f"   Organization: {dataset.get('organization', 'Unknown')}")
            print(f"   Format: {dataset.get('format', 'Unknown')}")
            print(f"   Tags: {', '.join(dataset.get('tags', [])[:5])}")

        if len(datasets) > 10:
            print(f"\n... and {len(datasets) - 10} more")
