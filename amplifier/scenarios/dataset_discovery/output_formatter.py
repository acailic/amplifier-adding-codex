"""JSON output formatting for dataset discovery results.

This module formats dataset information into a standardized JSON schema
compatible with the vizualni-admin demo configuration with robust error handling.
"""

import json
import logging
import sys
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
                - description: Dataset description (optional)
                - created_at: Creation date (optional)
                - last_modified: Last modification date (optional)

        Raises:
            ValueError: If dataset is invalid or missing required fields
        """
        if not isinstance(dataset, dict):
            raise ValueError("Dataset must be a dictionary")

        # Extract and validate required fields
        dataset_id = dataset.get("id")
        if not dataset_id:
            raise ValueError("Dataset missing required 'id' field")

        title = dataset.get("title")
        if not title:
            title = "Untitled"  # Provide default
            logger.warning(f"Dataset {dataset_id} missing title, using default")

        # Extract organization with proper validation
        org = dataset.get("organization")
        if isinstance(org, dict):
            organization = org.get("name", "Unknown")
        elif isinstance(org, str):
            organization = org
        else:
            organization = "Unknown"
            logger.debug(f"Dataset {dataset_id} has no valid organization")

        # Extract and validate tags
        tags = dataset.get("tags", [])
        if not isinstance(tags, list):
            logger.debug(f"Dataset {dataset_id} tags is not a list, using empty list")
            tags = []

        tag_list = []
        for tag in tags:
            if isinstance(tag, dict):
                tag_name = tag.get("name")
                if tag_name:
                    tag_list.append(str(tag_name))
            elif isinstance(tag, str):
                tag_list.append(tag)
            else:
                logger.debug(f"Dataset {dataset_id} has invalid tag format: {type(tag)}")

        # Extract format and URL from resources
        resources = dataset.get("resources", [])
        if not isinstance(resources, list):
            logger.debug(f"Dataset {dataset_id} resources is not a list, using empty list")
            resources = []

        format_type = "Unknown"
        url = ""
        resource_count = 0

        for resource in resources:
            if not isinstance(resource, dict):
                continue

            resource_count += 1
            if not url:  # Get URL from first valid resource
                resource_url = resource.get("url")
                if isinstance(resource_url, str) and resource_url.strip():
                    url = resource_url.strip()

            if format_type == "Unknown":  # Get format from first valid resource
                resource_format = resource.get("format")
                if isinstance(resource_format, str) and resource_format.strip():
                    format_type = resource_format.strip().upper()
                    break

        # Fallback URL strategies
        if not url:
            # Try dataset page
            page_url = dataset.get("page")
            if isinstance(page_url, str) and page_url.strip():
                url = page_url.strip()
            else:
                # Construct URL from ID as last resort
                base_url = "https://data.gov.rs"
                if "/" in dataset_id:
                    url = f"{base_url}/datasets/{dataset_id}/"
                else:
                    url = f"{base_url}/fr/datasets/{dataset_id}/"

        # Extract optional fields
        description = dataset.get("description", "")
        if description and not isinstance(description, str):
            description = str(description)

        created_at = dataset.get("created_at")
        if created_at and not isinstance(created_at, str):
            created_at = str(created_at)

        last_modified = dataset.get("last_modified")
        if last_modified and not isinstance(last_modified, str):
            last_modified = str(last_modified)

        return {
            "id": str(dataset_id),
            "title": str(title),
            "organization": str(organization),
            "tags": tag_list,
            "format": format_type,
            "url": url,
            "description": description,
            "created_at": created_at,
            "last_modified": last_modified,
            "resource_count": resource_count,
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
        if not isinstance(datasets, list):
            raise ValueError("Datasets must be a list")

        formatted = []
        errors = []

        for i, dataset in enumerate(datasets):
            try:
                formatted_dataset = OutputFormatter.extract_dataset_info(dataset)
                formatted.append(formatted_dataset)
            except Exception as e:
                error_info = {
                    "index": i,
                    "dataset_id": dataset.get("id", "unknown") if isinstance(dataset, dict) else f"item_{i}",
                    "error": str(e),
                }
                errors.append(error_info)
                logger.warning(f"Failed to format dataset at index {i}: {str(e)}")
                continue

        if errors:
            logger.warning(f"Failed to format {len(errors)} out of {len(datasets)} datasets")
            # Log detailed errors in debug mode
            for error in errors[:5]:  # Limit to first 5 errors to avoid spam
                logger.debug(f"Formatting error details: {error}")

        logger.info(f"Successfully formatted {len(formatted)} out of {len(datasets)} datasets")
        return formatted

    @staticmethod
    def save_to_json(
        datasets: list[dict[str, Any]],
        output_path: Path | str,
        indent: int = 2,
    ) -> None:
        """Save formatted datasets to JSON file with error handling.

        Args:
            datasets: List of formatted dataset objects
            output_path: Path to output JSON file
            indent: JSON indentation (default: 2 spaces)

        Raises:
            ValueError: If datasets is not a list
            OSError: If file cannot be written
            TypeError: If datasets contain non-serializable objects

        Example:
            >>> formatter = OutputFormatter()
            >>> datasets = [{"id": "1", "title": "Test"}]
            >>> formatter.save_to_json(datasets, "output.json")
        """
        if not isinstance(datasets, list):
            raise ValueError("Datasets must be a list")

        try:
            output_path = Path(output_path)

            # Validate output path
            if output_path.suffix.lower() != ".json":
                logger.warning(f"Output file {output_path} does not have .json extension")

            # Ensure parent directory exists
            try:
                output_path.parent.mkdir(parents=True, exist_ok=True)
            except OSError as e:
                raise OSError(f"Failed to create output directory {output_path.parent}: {str(e)}")

            # Validate that all datasets are serializable
            try:
                # Test serialization before writing
                json.dumps(datasets, ensure_ascii=False)
            except (TypeError, ValueError) as e:
                raise TypeError(f"Datasets contain non-serializable data: {str(e)}")

            # Write JSON with atomic write (write to temp file first, then rename)
            temp_path = output_path.with_suffix(".tmp")
            try:
                with open(temp_path, "w", encoding="utf-8") as f:
                    json.dump(datasets, f, indent=indent, ensure_ascii=False)

                # Atomic rename
                temp_path.replace(output_path)

            except OSError as e:
                # Clean up temp file if it exists
                if temp_path.exists():
                    from contextlib import suppress

                    with suppress(OSError):
                        temp_path.unlink()
                raise OSError(f"Failed to write to {output_path}: {str(e)}")

            logger.info(f"Successfully saved {len(datasets)} datasets to {output_path}")

        except Exception as e:
            logger.error(f"Failed to save datasets to {output_path}: {str(e)}")
            raise

    @staticmethod
    def load_from_json(input_path: Path | str) -> list[dict[str, Any]]:
        """Load datasets from JSON file with validation.

        Args:
            input_path: Path to input JSON file

        Returns:
            List of dataset objects

        Raises:
            FileNotFoundError: If file doesn't exist
            json.JSONDecodeError: If file is not valid JSON
            ValueError: If file doesn't contain a list

        Example:
            >>> formatter = OutputFormatter()
            >>> datasets = formatter.load_from_json("datasets.json")
        """
        input_path = Path(input_path)

        if not input_path.exists():
            raise FileNotFoundError(f"Input file not found: {input_path}")

        if not input_path.is_file():
            raise ValueError(f"Input path is not a file: {input_path}")

        try:
            with open(input_path, encoding="utf-8") as f:
                data = json.load(f)

            if not isinstance(data, list):
                raise ValueError("JSON file must contain a list of datasets")

            # Validate that each item is a dictionary
            for i, item in enumerate(data):
                if not isinstance(item, dict):
                    raise ValueError(f"Item at index {i} is not a dictionary")

            logger.info(f"Successfully loaded {len(data)} datasets from {input_path}")
            return data

        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(f"Invalid JSON in {input_path}: {str(e)}", e.doc, e.pos)
        except Exception as e:
            raise OSError(f"Failed to read {input_path}: {str(e)}")

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
        if not isinstance(datasets, list):
            print("Error: datasets must be a list", file=sys.stderr)
            return

        print(f"\nFound {len(datasets)} datasets\n")

        if not datasets:
            return

        # Group by format
        formats: dict[str, int] = {}
        organizations: dict[str, int] = {}

        for dataset in datasets:
            if not isinstance(dataset, dict):
                continue

            fmt = dataset.get("format", "Unknown")
            formats[fmt] = formats.get(fmt, 0) + 1

            org = dataset.get("organization", "Unknown")
            organizations[org] = organizations.get(org, 0) + 1

        # Print format summary
        print("Formats:")
        for fmt, count in sorted(formats.items()):
            print(f"  {fmt}: {count}")

        # Print organization summary
        if len(organizations) <= 10:  # Only show if not too many
            print("\nOrganizations:")
            for org, count in sorted(organizations.items(), key=lambda x: x[1], reverse=True):
                print(f"  {org}: {count}")

        # Print dataset details
        print("\nDatasets:")
        for i, dataset in enumerate(datasets[:10], 1):
            if not isinstance(dataset, dict):
                continue

            print(f"\n{i}. {dataset.get('title', 'Untitled')}")
            print(f"   ID: {dataset.get('id', 'N/A')}")
            print(f"   Organization: {dataset.get('organization', 'Unknown')}")
            print(f"   Format: {dataset.get('format', 'Unknown')}")

            tags = dataset.get("tags", [])
            if tags:
                tag_str = ", ".join(str(tag) for tag in tags[:5])
                if len(tags) > 5:
                    tag_str += f" ... and {len(tags) - 5} more"
                print(f"   Tags: {tag_str}")

            url = dataset.get("url", "")
            if url:
                # Truncate long URLs for display
                if len(url) > 80:
                    url = url[:77] + "..."
                print(f"   URL: {url}")

        if len(datasets) > 10:
            print(f"\n... and {len(datasets) - 10} more datasets")

        print()  # Final newline
