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
import logging
import sys

from api_client import UDataAPIClient
from output_formatter import OutputFormatter
from query_expander import QueryExpander

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def discover_by_category(
    category: str,
    min_results: int = 5,
    base_url: str = "https://data.gov.rs",
) -> list[dict]:
    """Discover datasets for a specific category.

    Args:
        category: Category name (e.g., 'budget', 'air_quality')
        min_results: Minimum number of results to find
        base_url: Base URL of uData instance

    Returns:
        List of formatted dataset objects
    """
    expander = QueryExpander()
    client = UDataAPIClient(base_url=base_url)

    # Get best query for category
    query = expander.best_query_for_category(category)
    logger.info(f"Searching for category '{category}' using query: {query}")

    # Try main query first
    datasets = client.get_all_pages(query=query, max_results=min_results)

    # If not enough results, try tag-based search
    if len(datasets) < min_results:
        logger.info(f"Found {len(datasets)} datasets with query, trying tag search")
        tag_datasets = client.get_all_pages(tag=category, max_results=min_results)

        # Merge results (avoid duplicates)
        existing_ids = {d.get("id") for d in datasets}
        for dataset in tag_datasets:
            if dataset.get("id") not in existing_ids:
                datasets.append(dataset)

    # Format results
    formatted = OutputFormatter.format_datasets(datasets)

    logger.info(f"Found {len(formatted)} datasets for category '{category}'")
    return formatted


def discover_by_query(
    query: str,
    min_results: int | None = None,
    expand_diacritics: bool = True,
    base_url: str = "https://data.gov.rs",
) -> list[dict]:
    """Discover datasets using a custom query.

    Args:
        query: Search query string
        min_results: Minimum number of results (None for all)
        expand_diacritics: Whether to try diacritic variations
        base_url: Base URL of uData instance

    Returns:
        List of formatted dataset objects
    """
    client = UDataAPIClient(base_url=base_url)

    if expand_diacritics:
        expander = QueryExpander()
        queries = expander.expand_query(query)
        logger.info(f"Expanded query to {len(queries)} variations: {queries}")

        # Try each query variation
        all_datasets = []
        seen_ids = set()

        for q in queries:
            logger.info(f"Trying query: {q}")
            datasets = client.get_all_pages(query=q, max_results=min_results)

            # Merge results (avoid duplicates)
            for dataset in datasets:
                dataset_id = dataset.get("id")
                if dataset_id not in seen_ids:
                    all_datasets.append(dataset)
                    seen_ids.add(dataset_id)

            # Stop if we have enough results
            if min_results and len(all_datasets) >= min_results:
                break
    else:
        all_datasets = client.get_all_pages(query=query, max_results=min_results)

    # Format results
    formatted = OutputFormatter.format_datasets(all_datasets)

    logger.info(f"Found {len(formatted)} datasets for query '{query}'")
    return formatted


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

    args = parser.parse_args()

    # Configure logging
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # List categories
    if args.list_categories:
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

        # Output results
        if args.output:
            OutputFormatter.save_to_json(datasets, args.output)
            print(f"\nSaved {len(datasets)} datasets to {args.output}")
        else:
            OutputFormatter.print_summary(datasets)

        return 0

    except Exception as e:
        logger.error(f"Discovery failed: {e}", exc_info=args.verbose)
        return 1


if __name__ == "__main__":
    sys.exit(main())
