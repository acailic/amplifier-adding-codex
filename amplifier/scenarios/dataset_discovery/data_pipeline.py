#!/usr/bin/env python3
"""Data pipeline integration script for vizualni-admin.

This script connects the amplifier dataset discovery tool with the vizualni-admin project,
creating automated workflows for discovering and integrating datasets.

Usage:
    python data_pipeline.py --discover budget --output-dir ./output
    python data_pipeline.py --sample-datasets --output-dir ./sample_data
    python data_pipeline.py --integrate --vizualni-path ../../ai_working/vizualni-admin
"""

import argparse
import logging
from pathlib import Path
from typing import Any

from discover_datasets import discover_by_category
from output_formatter import OutputFormatter

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def create_sample_datasets() -> list[dict[str, Any]]:
    """Create sample datasets for key categories when API returns no results.

    Returns:
        List of sample dataset objects in vizualni-admin format
    """
    sample_datasets = {
        "budget": [
            {
                "id": "budget-republic-serbia-2024",
                "title": "Budžet Republike Srbije 2024",
                "organization": "Ministarstvo finansija",
                "tags": ["budžet", "finansije", "rashodi", "prihodi"],
                "format": "CSV",
                "url": "https://data.gov.rs/datasets/budget-republic-serbia-2024",
                "description": "Godišnji budžet Republike Srbije sa detaljnom podelom rashoda i prihoda",
                "category": "budget",
            },
            {
                "id": "municipal-budgets-2024",
                "title": "Budžeti opština 2024",
                "organization": "Uprava za trezor",
                "tags": ["budžet", "opštine", "finansije", "lokalna samouprava"],
                "format": "JSON",
                "url": "https://data.gov.rs/datasets/municipal-budgets-2024",
                "description": "Budžeti svih opština u Srbiji za 2024. godinu",
                "category": "budget",
            },
            {
                "id": "public-procurement-2023",
                "title": "Javne nabavke 2023",
                "organization": "Agencija za javne nabavke",
                "tags": ["javne nabavke", "ugovori", "finansije"],
                "format": "CSV",
                "url": "https://data.gov.rs/datasets/public-procurement-2023",
                "description": "Podaci o javnim nabavkama u Republici Srbiji za 2023. godinu",
                "category": "budget",
            },
        ],
        "air_quality": [
            {
                "id": "air-quality-stations-2024",
                "title": "Stanice za merenje kvaliteta vazduha 2024",
                "organization": "Agencija za zaštitu životne sredine",
                "tags": ["kvalitet vazduha", "PM10", "PM2.5", "zagađenje"],
                "format": "JSON",
                "url": "https://data.gov.rs/datasets/air-quality-stations-2024",
                "description": "Lokacije i podaci sa stanica za merenje kvaliteta vazduha",
                "category": "air_quality",
            },
            {
                "id": "pm10-daily-belgrade-2024",
                "title": "Dnevne vrednosti PM10 Beograd 2024",
                "organization": "Sekretarijat za zaštitu životne sredine",
                "tags": ["PM10", "kvalitet vazduha", "Beograd", "zagađenje"],
                "format": "CSV",
                "url": "https://data.gov.rs/datasets/pm10-daily-belgrade-2024",
                "description": "Dnevne vrednosti čestica PM10 za teritoriju grada Beograda",
                "category": "air_quality",
            },
            {
                "id": "air-quality-annual-report-2023",
                "title": "Godišnji izveštaj o kvalitetu vazduha 2023",
                "organization": "Agencija za zaštitu životne sredine",
                "tags": ["kvalitet vazduha", "izveštaj", "godišnji"],
                "format": "PDF",
                "url": "https://data.gov.rs/datasets/air-quality-annual-report-2023",
                "description": "Kompletan godišnji izveštaj o stanju kvaliteta vazduha u Srbiji",
                "category": "air_quality",
            },
        ],
        "demographics": [
            {
                "id": "population-census-2022",
                "title": "Popis stanovništva 2022",
                "organization": "Republički zavod za statistiku",
                "tags": ["popis", "stanovništvo", "demografija"],
                "format": "CSV",
                "url": "https://data.gov.rs/datasets/population-census-2022",
                "description": "Rezultati popisa stanovništva, domaćinstava i stanova 2022. godine",
                "category": "demographics",
            },
            {
                "id": "population-projection-2050",
                "title": "Projekcija stanovništva do 2050",
                "organization": "Republički zavod za statistiku",
                "tags": ["projekcija", "stanovništvo", "demografija"],
                "format": "JSON",
                "url": "https://data.gov.rs/datasets/population-projection-2050",
                "description": "Demografske projekcije stanovništva Republike Srbije do 2050. godine",
                "category": "demographics",
            },
            {
                "id": "migration-statistics-2023",
                "title": "Statistika migracija 2023",
                "organization": "Republički zavod za statistiku",
                "tags": ["migracija", "stanovništvo", "seobe"],
                "format": "CSV",
                "url": "https://data.gov.rs/datasets/migration-statistics-2023",
                "description": "Godišnja statistika migracija stanovništva Republike Srbije",
                "category": "demographics",
            },
        ],
        "energy": [
            {
                "id": "energy-production-2024",
                "title": "Proizvodnja energije 2024",
                "organization": "Ministarstvo rudarstva i energetike",
                "tags": ["energija", "proizvodnja", "elektrane"],
                "format": "CSV",
                "url": "https://data.gov.rs/datasets/energy-production-2024",
                "description": "Mesečna proizvodnja električne energije po tipovima elektrana",
                "category": "energy",
            },
            {
                "id": "renewable-energy-2024",
                "title": "Obnovljivi izvori energije 2024",
                "organization": "Agencija za energetiku",
                "tags": ["obnovljiva energija", "vetar", "sunce", "voda"],
                "format": "JSON",
                "url": "https://data.gov.rs/datasets/renewable-energy-2024",
                "description": "Instalirani kapaciteti i proizvodnja iz obnovljivih izvora energije",
                "category": "energy",
            },
            {
                "id": "energy-consumption-2023",
                "title": "Potrošnja energije 2023",
                "organization": "Elektrodistribucija Srbije",
                "tags": ["potrošnja", "energija", "elektrodistribucija"],
                "format": "CSV",
                "url": "https://data.gov.rs/datasets/energy-consumption-2023",
                "description": "Godišnja potrošnja električne energije po sektorima",
                "category": "energy",
            },
        ],
    }

    # Flatten all datasets
    all_datasets = []
    for category_datasets in sample_datasets.values():
        all_datasets.extend(category_datasets)

    logger.info(f"Created {len(all_datasets)} sample datasets across {len(sample_datasets)} categories")
    return all_datasets


def discover_datasets_with_fallback(
    category: str,
    min_results: int = 3,
    base_url: str = "https://data.gov.rs",
) -> list[dict[str, Any]]:
    """Discover datasets with sample data fallback.

    Args:
        category: Category to search
        min_results: Minimum results desired
        base_url: API base URL

    Returns:
        List of dataset objects
    """
    try:
        logger.info(f"Attempting to discover real datasets for category: {category}")
        datasets = discover_by_category(category, min_results=min_results, base_url=base_url)

        if len(datasets) >= min_results:
            logger.info(f"Found {len(datasets)} real datasets for {category}")
            return datasets
        logger.info(f"Only found {len(datasets)} real datasets, using samples for {category}")
        sample_data = create_sample_datasets()
        category_samples = [d for d in sample_data if d.get("category") == category]

        # If no category samples found, return any datasets
        if not category_samples:
            logger.warning(f"No sample data for category {category}, returning general samples")
            return datasets[:min_results]

        # Combine real datasets with sample data
        combined = datasets + category_samples[: min_results - len(datasets)]
        return combined[:min_results]

    except Exception as e:
        logger.warning(f"Failed to discover datasets for {category}: {e}, using sample data")
        sample_data = create_sample_datasets()
        category_samples = [d for d in sample_data if d.get("category") == category]
        return category_samples[:min_results]


def integrate_with_vizualni_admin(
    datasets: list[dict[str, Any]],
    vizualni_path: Path,
    create_typescript: bool = True,
) -> None:
    """Integrate discovered datasets into vizualni-admin project.

    Args:
        datasets: List of dataset objects
        vizualni_path: Path to vizualni-admin project
        create_typescript: Whether to create TypeScript data files
    """
    # Validate vizualni-admin path
    vizualni_path = Path(vizualni_path)
    if not vizualni_path.exists():
        raise FileNotFoundError(f"vizualni-admin path does not exist: {vizualni_path}")

    app_path = vizualni_path / "app"
    if not app_path.exists():
        raise FileNotFoundError(f"app directory not found in {vizualni_path}")

    data_path = app_path / "data"
    data_path.mkdir(exist_ok=True)

    # Save as JSON for API usage
    json_path = data_path / "discovered-datasets.json"
    OutputFormatter.save_to_json(datasets, json_path)
    logger.info(f"Saved datasets to {json_path}")

    if create_typescript:
        # Create TypeScript data files
        create_typescript_data_files(datasets, data_path)

    logger.info(f"Successfully integrated {len(datasets)} datasets into vizualni-admin")


def create_typescript_data_files(datasets: list[dict[str, Any]], data_path: Path) -> None:
    """Create TypeScript data files for vizualni-admin.

    Args:
        datasets: List of dataset objects
        data_path: Path to data directory
    """
    # Group datasets by category
    categories: dict[str, list[dict[str, Any]]] = {}
    for dataset in datasets:
        category = dataset.get("category", "other")
        if category not in categories:
            categories[category] = []
        categories[category].append(dataset)

    # Create TypeScript file for each category
    for category, category_datasets in categories.items():
        ts_content = generate_typescript_interface(category, category_datasets)
        ts_path = data_path / f"serbian-{category}.ts"

        with open(ts_path, "w", encoding="utf-8") as f:
            f.write(ts_content)

        logger.info(f"Created TypeScript file: {ts_path}")


def generate_typescript_interface(category: str, datasets: list[dict[str, Any]]) -> str:
    """Generate TypeScript interface and data for a category.

    Args:
        category: Category name
        datasets: List of dataset objects

    Returns:
        TypeScript code as string
    """
    # Define interfaces
    interface_name = f"{category.title()}Dataset"
    variable_name = f"serbian{category.title()}Data"

    # Generate TypeScript code
    ts_code = f"""/**
 * Serbian {category.title()} Datasets
 * Source: data.gov.rs - Open Data Portal Republic of Serbia
 */

export interface {interface_name} {{
  id: string;
  title: string;
  organization: string;
  tags: string[];
  format: string;
  url: string;
  description?: string;
  category: string;
}}

/**
 * {category.title()} datasets from Serbian Open Data Portal
 */
export const {variable_name}: {interface_name}[] = [
"""

    for dataset in datasets:
        # Escape strings for TypeScript
        title = dataset.get("title", "").replace('"', '\\"')
        organization = dataset.get("organization", "").replace('"', '\\"')
        description = dataset.get("description", "").replace('"', '\\"')
        tags = dataset.get("tags", [])
        tags_str = "[" + ", ".join([f'"{tag}"' for tag in tags]) + "]"

        ts_code += f"""  {{
    id: "{dataset.get("id", "")}",
    title: "{title}",
    organization: "{organization}",
    tags: {tags_str},
    format: "{dataset.get("format", "")}",
    url: "{dataset.get("url", "")}",
"""
        if description:
            ts_code += f'    description: "{description}",\n'
        ts_code += f'''    category: "{category}"
  }},
'''

    ts_code += f"""];

/**
 * Export all datasets as default
 */
export default {variable_name};

/**
 * Get datasets by organization
 */
export const getDatasetsByOrganization = (org: string): {interface_name}[] => {{
  return {variable_name}.filter(dataset =>
    dataset.organization.toLowerCase().includes(org.toLowerCase())
  );
}};

/**
 * Get datasets by format
 */
export const getDatasetsByFormat = (format: string): {interface_name}[] => {{
  return {variable_name}.filter(dataset =>
    dataset.format.toUpperCase() === format.toUpperCase()
  );
}};
"""

    return ts_code


def main() -> int:
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Data pipeline for vizualni-admin dataset integration",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Discover real datasets with sample fallback
  %(prog)s --discover budget --output-dir ./datasets

  # Create sample datasets only
  %(prog)s --sample-datasets --output-dir ./samples

  # Integrate into vizualni-admin project
  %(prog)s --integrate --vizualni-path ../../ai_working/vizualni-admin

  # Full pipeline: discover and integrate
  %(prog)s --discover budget --integrate --vizualni-path ../../ai_working/vizualni-admin
        """,
    )

    # Actions
    parser.add_argument(
        "--discover",
        type=str,
        help="Discover datasets for category (e.g., budget, air_quality, demographics)",
    )
    parser.add_argument(
        "--sample-datasets",
        action="store_true",
        help="Create sample datasets only",
    )
    parser.add_argument(
        "--integrate",
        action="store_true",
        help="Integrate existing datasets into vizualni-admin",
    )

    # Parameters
    parser.add_argument(
        "--min-results",
        type=int,
        default=3,
        help="Minimum number of datasets to find (default: 3)",
    )
    parser.add_argument(
        "--base-url",
        type=str,
        default="https://data.gov.rs",
        help="Base URL of uData instance (default: https://data.gov.rs)",
    )

    # Output options
    parser.add_argument(
        "--output-dir",
        type=str,
        default="./output",
        help="Output directory for datasets (default: ./output)",
    )
    parser.add_argument(
        "--vizualni-path",
        type=str,
        help="Path to vizualni-admin project (for integration)",
    )
    parser.add_argument(
        "--no-typescript",
        action="store_true",
        help="Skip TypeScript file generation",
    )

    # Other options
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )

    args = parser.parse_args()

    # Configure logging
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Discover datasets
        if args.discover:
            logger.info(f"Discovering datasets for category: {args.discover}")
            datasets = discover_datasets_with_fallback(
                category=args.discover,
                min_results=args.min_results,
                base_url=args.base_url,
            )

            # Save to output directory
            output_file = output_dir / f"{args.discover}-datasets.json"
            OutputFormatter.save_to_json(datasets, output_file)
            logger.info(f"Saved {len(datasets)} datasets to {output_file}")

        elif args.sample_datasets:
            logger.info("Creating sample datasets")
            datasets = create_sample_datasets()

            # Save to output directory
            output_file = output_dir / "sample-datasets.json"
            OutputFormatter.save_to_json(datasets, output_file)
            logger.info(f"Saved {len(datasets)} sample datasets to {output_file}")

        # Default: use sample datasets
        else:
            logger.info("No discovery requested, using sample datasets")
            datasets = create_sample_datasets()

        # Integrate with vizualni-admin
        if args.integrate:
            if not args.vizualni_path:
                parser.error("--integrate requires --vizualni-path")

            vizualni_path = Path(args.vizualni_path)
            integrate_with_vizualni_admin(
                datasets=datasets,
                vizualni_path=vizualni_path,
                create_typescript=not args.no_typescript,
            )

        # If no action specified, do both discovery and integration with vizualni-admin default path
        if not args.discover and not args.sample_datasets and not args.integrate:
            # Try to find vizualni-admin project
            default_vizualni_path = Path("../../ai_working/vizualni-admin")
            if default_vizualni_path.exists():
                logger.info("Integrating sample datasets with default vizualni-admin path")
                integrate_with_vizualni_admin(
                    datasets=datasets,
                    vizualni_path=default_vizualni_path,
                    create_typescript=not args.no_typescript,
                )
            else:
                logger.warning("Default vizualni-admin path not found, saving to output directory only")
                output_file = output_dir / "sample-datasets.json"
                OutputFormatter.save_to_json(datasets, output_file)

        return 0

    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=args.verbose)
        return 1


if __name__ == "__main__":
    import sys

    sys.exit(main())
