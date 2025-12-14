#!/usr/bin/env python3
"""Dataset discovery CLI for data.gov.rs.

This tool discovers datasets from data.gov.rs uData API with support for:
- Category-based search with Serbian keyword expansion
- Custom query search with diacritic handling
- Tag-based fallback search
- Pagination support
- JSON output compatible with vizualni-admin configuration
"""

import argparse
import json
import logging
import sys
import time
from typing import Any

from api_client import UDataAPIClient
from output_formatter import OutputFormatter
from query_expander import QueryExpander

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def create_error_response(error_message: str, error_type: str = "discovery_error") -> dict[str, Any]:
    """Create a standardized error response."""
    return {"success": False, "error": {"type": error_type, "message": error_message}, "datasets": [], "count": 0}


def create_success_response(datasets: list[dict[str, Any]]) -> dict[str, Any]:
    """Create a standardized success response."""
    return {"success": True, "error": None, "datasets": datasets, "count": len(datasets)}


def discover_by_category(
    category: str,
    min_results: int = 5,
    base_url: str = "https://data.gov.rs",
) -> list[dict[str, Any]]:
    """Discover datasets for a specific category.

    Args:
        category: Category name (e.g., 'budget', 'air_quality')
        min_results: Minimum number of results to find
        base_url: Base URL of uData instance

    Returns:
        List of formatted dataset objects

    Raises:
        ValueError: If category is invalid
        RuntimeError: If API requests fail
    """
    try:
        expander = QueryExpander()
        client = UDataAPIClient(base_url=base_url)

        # Validate category
        if not category or not isinstance(category, str):
            raise ValueError("Category must be a non-empty string")

        category = category.strip().lower()
        logger.info(f"Starting category discovery for: {category}")

        # Get best query for category
        try:
            query = expander.best_query_for_category(category)
            logger.info(f"Searching for category '{category}' using query: {query}")
        except Exception as e:
            logger.warning(f"Failed to expand category keywords, using category as query: {str(e)}")
            query = category

        # Try main query first
        datasets = []
        try:
            datasets = client.get_all_pages(query=query, max_results=min_results)
            logger.info(f"Found {len(datasets)} datasets with main query")
        except Exception as e:
            logger.error(f"Main query failed: {str(e)}")
            # Continue with tag search even if main query fails

        # If not enough results, try tag-based search
        if len(datasets) < min_results:
            logger.info(f"Found {len(datasets)} datasets with query, trying tag search")
            try:
                tag_datasets = client.get_all_pages(tag=category, max_results=min_results)

                # Merge results (avoid duplicates)
                existing_ids = {d.get("id") for d in datasets}
                for dataset in tag_datasets:
                    if dataset.get("id") not in existing_ids:
                        datasets.append(dataset)
                        existing_ids.add(dataset.get("id"))

                logger.info(f"Tag search added {len(tag_datasets)} datasets, total now: {len(datasets)}")

            except Exception as e:
                logger.error(f"Tag search failed: {str(e)}")
                # Continue with whatever datasets we have

        # Format results
        try:
            formatted = OutputFormatter.format_datasets(datasets)
            logger.info(f"Successfully formatted {len(formatted)} datasets for category '{category}'")
            return formatted
        except Exception as e:
            logger.error(f"Failed to format datasets: {str(e)}")
            raise RuntimeError(f"Failed to format dataset results: {str(e)}")

    except Exception as e:
        logger.error(f"Category discovery failed for '{category}': {str(e)}")
        raise


def discover_by_query(
    query: str,
    min_results: int | None = None,
    expand_diacritics: bool = True,
    base_url: str = "https://data.gov.rs",
) -> list[dict[str, Any]]:
    """Discover datasets using a custom query.

    Args:
        query: Search query string
        min_results: Minimum number of results (None for all)
        expand_diacritics: Whether to try diacritic variations
        base_url: Base URL of uData instance

    Returns:
        List of formatted dataset objects

    Raises:
        ValueError: If query is invalid
        RuntimeError: If API requests fail
    """
    try:
        if not query or not isinstance(query, str):
            raise ValueError("Query must be a non-empty string")

        query = query.strip()
        if not query:
            raise ValueError("Query cannot be empty")

        client = UDataAPIClient(base_url=base_url)
        logger.info(f"Starting query discovery for: '{query}'")

        all_datasets = []

        if expand_diacritics:
            try:
                expander = QueryExpander()
                queries = expander.expand_query(query)
                logger.info(f"Expanded query to {len(queries)} variations: {queries}")
            except Exception as e:
                logger.warning(f"Failed to expand diacritics, using original query: {str(e)}")
                queries = [query]
        else:
            queries = [query]

        # Try each query variation
        seen_ids = set()
        for i, q in enumerate(queries):
            try:
                logger.info(f"Trying query variation {i + 1}/{len(queries)}: {q}")
                datasets = client.get_all_pages(query=q, max_results=min_results)

                # Merge results (avoid duplicates)
                new_datasets = 0
                for dataset in datasets:
                    dataset_id = dataset.get("id")
                    if dataset_id not in seen_ids:
                        all_datasets.append(dataset)
                        seen_ids.add(dataset_id)
                        new_datasets += 1

                logger.info(f"Query variation found {len(datasets)} datasets, {new_datasets} new")

                # Stop if we have enough results
                if min_results and len(all_datasets) >= min_results:
                    logger.info(f"Reached minimum results threshold ({min_results})")
                    break

                # Add small delay between requests to be respectful
                if i < len(queries) - 1:  # Don't sleep after last request
                    time.sleep(0.5)

            except Exception as e:
                logger.warning(f"Query variation '{q}' failed: {str(e)}")
                continue  # Try next variation

        # Format results
        try:
            formatted = OutputFormatter.format_datasets(all_datasets)
            logger.info(f"Successfully formatted {len(formatted)} datasets for query '{query}'")
            return formatted
        except Exception as e:
            logger.error(f"Failed to format datasets: {str(e)}")
            raise RuntimeError(f"Failed to format dataset results: {str(e)}")

    except Exception as e:
        logger.error(f"Query discovery failed for '{query}': {str(e)}")
        raise


def list_categories() -> dict[str, Any]:
    """List available categories with their keywords.

    Returns:
        Dictionary containing category information
    """
    try:
        from query_expander import CATEGORY_KEYWORDS

        categories = []
        for category, keywords in sorted(CATEGORY_KEYWORDS.items()):
            categories.append(
                {
                    "name": category,
                    "keywords": keywords[:5],  # Show first 5 keywords
                    "total_keywords": len(keywords),
                }
            )

        return {"success": True, "categories": categories, "count": len(categories)}

    except Exception as e:
        logger.error(f"Failed to list categories: {str(e)}")
        return {"success": False, "error": f"Failed to list categories: {str(e)}", "categories": [], "count": 0}


def main() -> int:
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Discover datasets from data.gov.rs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Discover budget datasets
  %(prog)s --category budget --min-results 10 --output budget_datasets.json

  # Search for air quality data
  %(prog)s --query "kvalitet vazduha" --output air_quality.json

  # Search without diacritic expansion
  %(prog)s --query "budzet" --no-expand-diacritics --output budget.json

  # List available categories
  %(prog)s --list-categories
        """,
    )

    # Search options
    search_group = parser.add_mutually_exclusive_group(required=False)
    search_group.add_argument(
        "--category",
        type=str,
        help="Category to search (e.g., budget, air_quality, demographics)",
    )
    search_group.add_argument(
        "--query",
        type=str,
        help="Custom search query",
    )
    search_group.add_argument(
        "--list-categories",
        action="store_true",
        help="List available categories and exit",
    )

    # Search parameters
    parser.add_argument(
        "--min-results",
        type=int,
        default=5,
        help="Minimum number of results to find (default: 5)",
    )
    parser.add_argument(
        "--no-expand-diacritics",
        action="store_true",
        help="Disable diacritic expansion for queries",
    )

    # Output options
    parser.add_argument(
        "--output",
        type=str,
        help="Output JSON file path",
    )
    parser.add_argument(
        "--base-url",
        type=str,
        default="https://data.gov.rs",
        help="Base URL of uData instance (default: https://data.gov.rs)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )
    parser.add_argument(
        "--format",
        choices=["json", "summary"],
        default="json",
        help="Output format (default: json)",
    )

    args = parser.parse_args()

    # Configure logging
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    try:
        # List categories
        if args.list_categories:
            if args.format == "json":
                result = list_categories()
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                from query_expander import CATEGORY_KEYWORDS

                print("\nAvailable categories:")
                for category in sorted(CATEGORY_KEYWORDS.keys()):
                    keywords = CATEGORY_KEYWORDS[category]
                    print(f"\n  {category}")
                    print(f"    Keywords: {', '.join(keywords[:3])}")
                    if len(keywords) > 3:
                        print(f"    ... and {len(keywords) - 3} more")
                print()
            return 0

        # Validate arguments
        if not args.category and not args.query:
            parser.error("Either --category or --query must be specified")

        # Discover datasets
        try:
            if args.category:
                datasets = discover_by_category(
                    category=args.category,
                    min_results=args.min_results,
                    base_url=args.base_url,
                )
            else:
                datasets = discover_by_query(
                    query=args.query,
                    min_results=args.min_results,
                    expand_diacritics=not args.no_expand_diacritics,
                    base_url=args.base_url,
                )

            # Create response
            response = create_success_response(datasets)

            # Output results
            if args.output:
                try:
                    OutputFormatter.save_to_json(datasets, args.output)
                    print(f"\nSaved {len(datasets)} datasets to {args.output}")
                    return 0
                except Exception as e:
                    logger.error(f"Failed to save output file: {str(e)}")
                    error_response = create_error_response(f"Failed to save output: {str(e)}", "file_error")
                    print(json.dumps(error_response, ensure_ascii=False, indent=2), file=sys.stderr)
                    return 1
            else:
                if args.format == "json":
                    print(json.dumps(response, ensure_ascii=False, indent=2))
                else:
                    OutputFormatter.print_summary(datasets)
                return 0

        except ValueError as e:
            error_response = create_error_response(str(e), "validation_error")
            print(json.dumps(error_response, ensure_ascii=False, indent=2), file=sys.stderr)
            return 1
        except Exception as e:
            logger.error(f"Discovery failed: {str(e)}", exc_info=args.verbose)
            error_response = create_error_response(f"Discovery failed: {str(e)}", "discovery_error")
            print(json.dumps(error_response, ensure_ascii=False, indent=2), file=sys.stderr)
            return 1

    except KeyboardInterrupt:
        print("\nDiscovery interrupted by user", file=sys.stderr)
        return 130
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=args.verbose)
        error_response = create_error_response(f"Unexpected error: {str(e)}", "system_error")
        print(json.dumps(error_response, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
