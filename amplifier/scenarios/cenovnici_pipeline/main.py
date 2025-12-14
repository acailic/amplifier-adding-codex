"""
Main orchestration script for the cenovnici pipeline.

This script runs the complete data processing pipeline:
1. Fetches data from retailers
2. Transforms to vizualni-admin format
3. Generates insights and analytics
4. Saves processed data

Usage:
    python -m amplifier.scenarios.cenovnici_pipeline.main

Options:
    --sample-only: Generate sample data only
    --no-fetch: Skip data fetching
    --products N: Generate N sample products (default: 1000)
"""

import argparse
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from .config.settings import settings
from .fetchers.data_fetcher import DataFetcher
from .generators.sample_generator import SampleDataGenerator
from .transformers.data_transformer import DataTransformer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout), logging.FileHandler("cenovnici_pipeline.log")],
)
logger = logging.getLogger(__name__)


class CenovniciPipeline:
    """Main pipeline orchestrator."""

    def __init__(self):
        """Initialize the pipeline."""
        self.settings = settings
        self.settings.ensure_output_dirs()

        self.fetcher = DataFetcher()
        self.transformer = DataTransformer()
        self.generator = SampleDataGenerator()

        self.stats = {
            "start_time": datetime.now(),
            "total_records": 0,
            "total_retailers": 0,
            "total_errors": 0,
            "files_processed": 0,
        }

    def run_full_pipeline(self) -> dict[str, Any]:
        """Run the complete pipeline.

        Returns:
            Dictionary with pipeline results and statistics
        """
        logger.info("Starting cenovnici pipeline")
        results = {}

        try:
            # Step 1: Fetch data
            logger.info("Step 1: Fetching data from retailers")
            retailer_files = self.fetcher.fetch_all_retailers()
            self.stats["total_retailers"] = len(retailer_files)
            logger.info(f"Found data from {len(retailer_files)} retailers")

            # Step 2: Transform data
            logger.info("Step 2: Transforming data to vizualni-admin format")
            all_products = []

            for retailer_id, files in retailer_files.items():
                if files:
                    retailer_products = self._process_retailer_files(retailer_id, files)
                    all_products.extend(retailer_products)

            self.stats["total_records"] = len(all_products)
            logger.info(f"Transformed {len(all_products)} total records")

            # Step 3: Generate insights
            logger.info("Step 3: Generating insights and analytics")
            insights = self._generate_insights(all_products)
            results.update(insights)

            # Step 4: Save processed data
            logger.info("Step 4: Saving processed data")
            self._save_processed_data(all_products, insights)

            # Step 5: Generate summary report
            logger.info("Step 5: Generating summary report")
            report = self._generate_report(all_products, insights)
            results["report"] = report

        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            self.stats["error"] = str(e)
            raise

        finally:
            self.stats["end_time"] = datetime.now()
            self.stats["duration"] = (self.stats["end_time"] - self.stats["start_time"]).total_seconds()
            results["stats"] = self.stats

        logger.info(f"Pipeline completed in {self.stats['duration']:.2f} seconds")
        return results

    def run_sample_generation(self, product_count: int = 1000) -> dict[str, Any]:
        """Generate sample data only.

        Args:
            product_count: Number of sample products to generate

        Returns:
            Dictionary with generated data and statistics
        """
        logger.info(f"Generating {product_count} sample products")

        sample_data = self.generator.generate_all_sample_data(product_count)

        # Update stats
        self.stats.update(
            {
                "start_time": datetime.now(),
                "end_time": datetime.now(),
                "total_records": product_count,
                "duration": 0,
                "mode": "sample_generation",
            }
        )

        sample_data["stats"] = self.stats

        logger.info("Sample data generation completed")
        return sample_data

    def _process_retailer_files(self, retailer_id: str, files: list[Path]) -> list:
        """Process all files for a retailer.

        Args:
            retailer_id: Retailer identifier
            files: List of data files

        Returns:
            List of transformed products
        """
        retailer_products = []

        for file_path in files:
            try:
                logger.info(f"Processing {file_path}")

                # Load raw records
                raw_records = self.fetcher.load_raw_records(file_path)
                self.stats["files_processed"] += 1

                # Transform records
                transformed = self.transformer.transform_batch(raw_records, retailer_id)
                retailer_products.extend(transformed)

                logger.info(f"Transformed {len(transformed)} records from {file_path}")

            except Exception as e:
                logger.error(f"Error processing {file_path}: {e}")
                self.stats["total_errors"] += 1
                continue

        return retailer_products

    def _generate_insights(self, products: list) -> dict[str, Any]:
        """Generate insights from transformed products.

        Args:
            products: List of transformed products

        Returns:
            Dictionary with all insights
        """
        insights = {}

        # Extract discounts
        insights["discounts"] = self.transformer.extract_discounts(products)
        logger.info(f"Extracted {len(insights['discounts'])} discount records")

        # Create price trends
        if self.settings.config.enable_trends:
            insights["trends"] = self.transformer.create_price_trends(
                products, days=self.settings.config.date_range_days
            )
            logger.info(f"Created {len(insights['trends'])} price trends")

        # Generate analytics
        insights["category_analytics"] = self.generator.generate_category_analytics(products)
        insights["retailer_analytics"] = self.generator.generate_retailer_analytics(products)
        insights["insights"] = self.generator.generate_sample_insights(products)

        return insights

    def _save_processed_data(self, products: list, insights: dict[str, Any]):
        """Save all processed data.

        Args:
            products: List of transformed products
            insights: Dictionary with insights
        """
        # Save products
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.transformer.save_transformed_data(products, f"products_{timestamp}.json", "products")

        # Save insights
        if "discounts" in insights:
            self.transformer.save_transformed_data(insights["discounts"], f"discounts_{timestamp}.json", "discounts")

        if "trends" in insights:
            self.transformer.save_transformed_data(insights["trends"], f"trends_{timestamp}.json", "trends")

        # Save analytics
        self.generator.save_sample_data(
            insights["category_analytics"], f"category_analytics_{timestamp}.json", "analytics"
        )
        self.generator.save_sample_data(
            insights["retailer_analytics"], f"retailer_analytics_{timestamp}.json", "analytics"
        )

        logger.info("All data saved successfully")

    def _generate_report(self, products: list, insights: dict[str, Any]) -> dict[str, Any]:
        """Generate pipeline execution report.

        Args:
            products: List of products processed
            insights: Dictionary with insights

        Returns:
            Report dictionary
        """
        report = {
            "execution_summary": {
                "start_time": self.stats["start_time"].isoformat(),
                "end_time": self.stats["end_time"].isoformat(),
                "duration_seconds": self.stats["duration"],
                "status": "success" if "error" not in self.stats else "failed",
            },
            "data_summary": {
                "total_products": len(products),
                "unique_products": len(set(p.product_id for p in products)),
                "total_retailers": len(set(p.retailer for p in products)),
                "total_categories": len(set(p.category for p in products)),
                "files_processed": self.stats["files_processed"],
                "errors": self.stats["total_errors"],
            },
            "price_statistics": {
                "min_price": min(p.price for p in products) if products else 0,
                "max_price": max(p.price for p in products) if products else 0,
                "avg_price": sum(p.price for p in products) / len(products) if products else 0,
                "products_with_discounts": len([p for p in products if p.discount]),
                "avg_discount_percentage": 0,
            },
            "insights_generated": {
                "discounts": len(insights.get("discounts", [])),
                "trends": len(insights.get("trends", [])),
                "category_analytics": len(insights.get("category_analytics", [])),
                "retailer_analytics": len(insights.get("retailer_analytics", [])),
                "insights": len(insights.get("insights", [])),
            },
        }

        # Calculate average discount
        discounted_products = [p for p in products if p.discount and p.discount > 0]
        if discounted_products:
            report["price_statistics"]["avg_discount_percentage"] = sum(p.discount for p in discounted_products) / len(
                discounted_products
            )

        # Save report
        self.generator.save_sample_data(
            report, f"pipeline_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json", "reports"
        )

        return report


def main():
    """Main entry point for the pipeline."""
    parser = argparse.ArgumentParser(description="Cenovnici Data Processing Pipeline")

    parser.add_argument("--sample-only", action="store_true", help="Generate sample data only (skip fetching)")

    parser.add_argument("--no-fetch", action="store_true", help="Skip data fetching step")

    parser.add_argument(
        "--products", type=int, default=1000, help="Number of sample products to generate (default: 1000)"
    )

    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()

    # Configure logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Initialize pipeline
    pipeline = CenovniciPipeline()

    try:
        # Run pipeline
        if args.sample_only:
            results = pipeline.run_sample_generation(args.products)
        elif args.no_fetch:
            logger.info("Skipping data fetch as requested")
            results = {"message": "Data fetching skipped"}
        else:
            results = pipeline.run_full_pipeline()

        # Print summary
        print("\n" + "=" * 50)
        print("PIPELINE EXECUTION SUMMARY")
        print("=" * 50)

        if "stats" in results:
            stats = results["stats"]
            print(f"Status: {stats.get('status', 'Unknown')}")
            print(f"Duration: {stats.get('duration', 0):.2f} seconds")

            if "total_records" in stats:
                print(f"Total records processed: {stats['total_records']}")
            if "total_retailers" in stats:
                print(f"Total retailers: {stats['total_retailers']}")
            if "total_errors" in stats:
                print(f"Errors: {stats['total_errors']}")

        print("\nPipeline completed successfully!")
        print(f"Check output directory: {settings.get_output_paths()['processed']}")

    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
