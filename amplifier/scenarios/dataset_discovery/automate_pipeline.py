#!/usr/bin/env python3
"""Automated workflow for dataset discovery and integration.

This script provides automated workflows for:
- Regular dataset discovery from data.gov.rs
- Integration with vizualni-admin
- Data validation and quality checks
- Backup and versioning of datasets

Usage:
    python automate_pipeline.py --daily-update
    python automate_pipeline.py --full-sync
    python automate_pipeline.py --validate-data
"""

import argparse
import json
import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from data_pipeline import create_sample_datasets
from data_pipeline import discover_datasets_with_fallback

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class DatasetAutomationManager:
    """Manages automated dataset discovery and integration workflows."""

    def __init__(self, vizualni_path: Path):
        """Initialize the automation manager.

        Args:
            vizualni_path: Path to vizualni-admin project
        """
        self.vizualni_path = Path(vizualni_path)
        self.data_path = self.vizualni_path / "app" / "data"
        self.backup_path = self.data_path / "backups"
        self.backup_path.mkdir(exist_ok=True)

        # Configuration
        self.categories = ["budget", "air_quality", "demographics", "energy", "healthcare"]
        self.max_days_old_for_update = 7  # Update datasets older than 7 days

    def get_last_update_info(self) -> dict[str, datetime]:
        """Get last update information for each dataset category.

        Returns:
            Dictionary mapping category to last update datetime
        """
        last_updates: dict[str, datetime] = {}
        discovered_file = self.data_path / "discovered-datasets.json"

        if discovered_file.exists():
            file_mtime = datetime.fromtimestamp(discovered_file.stat().st_mtime, tz=timezone.utc)
            # Assume all categories were updated at the same time
            for category in self.categories:
                last_updates[category] = file_mtime

        return last_updates

    def backup_current_data(self) -> Path:
        """Create a backup of current datasets.

        Returns:
            Path to backup directory
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = self.backup_path / f"datasets_{timestamp}"
        backup_dir.mkdir(exist_ok=True)

        # Backup discovered datasets
        discovered_file = self.data_path / "discovered-datasets.json"
        if discovered_file.exists():
            shutil.copy2(discovered_file, backup_dir / "discovered-datasets.json")

        # Backup TypeScript files
        for category in self.categories:
            ts_file = self.data_path / f"serbian-{category}.ts"
            if ts_file.exists():
                shutil.copy2(ts_file, backup_dir / f"serbian-{category}.ts")

        logger.info(f"Created backup at: {backup_dir}")
        return backup_dir

    def cleanup_old_backups(self, keep_count: int = 10) -> None:
        """Clean up old backup directories.

        Args:
            keep_count: Number of most recent backups to keep
        """
        if not self.backup_path.exists():
            return

        # Get all backup directories sorted by name (which includes timestamp)
        backup_dirs = [d for d in self.backup_path.iterdir() if d.is_dir() and d.name.startswith("datasets_")]
        backup_dirs.sort(reverse=True)

        # Keep only the most recent ones
        for old_backup in backup_dirs[keep_count:]:
            shutil.rmtree(old_backup)
            logger.info(f"Removed old backup: {old_backup}")

    def discover_all_categories(self) -> list[dict[str, Any]]:
        """Discover datasets for all configured categories.

        Returns:
            List of all discovered datasets
        """
        all_datasets = []

        for category in self.categories:
            logger.info(f"Discovering datasets for category: {category}")
            try:
                category_datasets = discover_datasets_with_fallback(
                    category=category,
                    min_results=2,  # Minimum for each category
                    base_url="https://data.gov.rs",
                )
                all_datasets.extend(category_datasets)
                logger.info(f"Found {len(category_datasets)} datasets for {category}")
            except Exception as e:
                logger.warning(f"Failed to discover datasets for {category}: {e}")
                # Add sample data as fallback
                sample_data = create_sample_datasets()
                category_samples = [d for d in sample_data if d.get("category") == category]
                all_datasets.extend(category_samples[:2])

        return all_datasets

    def integrate_datasets(self, datasets: list[dict[str, Any]]) -> None:
        """Integrate datasets into vizualni-admin.

        Args:
            datasets: List of dataset objects
        """
        from data_pipeline import integrate_with_vizualni_admin

        integrate_with_vizualni_admin(
            datasets=datasets,
            vizualni_path=self.vizualni_path,
            create_typescript=True,
        )

    def validate_datasets(self, datasets: list[dict[str, Any]]) -> dict[str, Any]:
        """Validate dataset quality and completeness.

        Args:
            datasets: List of dataset objects

        Returns:
            Validation report
        """
        report = {
            "total_datasets": len(datasets),
            "valid_datasets": 0,
            "invalid_datasets": 0,
            "categories": {},
            "issues": [],
        }

        for dataset in datasets:
            is_valid = True
            dataset_issues = []

            # Check required fields
            required_fields = ["id", "title", "organization", "format", "url"]
            for field in required_fields:
                if not dataset.get(field):
                    is_valid = False
                    dataset_issues.append(f"Missing required field: {field}")

            # Check URL format
            url = dataset.get("url", "")
            if not (url.startswith("http://") or url.startswith("https://")):
                is_valid = False
                dataset_issues.append("Invalid URL format")

            # Check category
            category = dataset.get("category", "unknown")
            if category not in self.categories:
                dataset_issues.append(f"Unknown category: {category}")

            # Update counters
            if is_valid:
                report["valid_datasets"] += 1
            else:
                report["invalid_datasets"] += 1
                report["issues"].append(
                    {
                        "dataset_id": dataset.get("id", "unknown"),
                        "issues": dataset_issues,
                    }
                )

            # Update category counts
            if category not in report["categories"]:
                report["categories"][category] = {"valid": 0, "invalid": 0}

            if is_valid:
                report["categories"][category]["valid"] += 1
            else:
                report["categories"][category]["invalid"] += 1

        return report

    def save_validation_report(self, report: dict[str, Any]) -> None:
        """Save validation report to file.

        Args:
            report: Validation report
        """
        timestamp = datetime.now().isoformat()
        report_data = {
            "timestamp": timestamp,
            "validation_report": report,
        }

        report_path = self.data_path / "validation-report.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)

        logger.info(f"Saved validation report to {report_path}")

        # Print summary
        logger.info("Validation summary:")
        logger.info(f"  Total datasets: {report['total_datasets']}")
        logger.info(f"  Valid datasets: {report['valid_datasets']}")
        logger.info(f"  Invalid datasets: {report['invalid_datasets']}")
        if report["issues"]:
            logger.warning(f"  Found {len(report['issues'])} datasets with issues")

    def run_daily_update(self) -> bool:
        """Run daily update workflow.

        Returns:
            True if update was performed, False if skipped
        """
        logger.info("Starting daily update workflow")

        # Check if update is needed
        last_updates = self.get_last_update_info()
        should_update = False

        for category in self.categories:
            last_update = last_updates.get(category)
            if not last_update or (datetime.now() - last_update).days >= self.max_days_old_for_update:
                should_update = True
                break

        if not should_update:
            logger.info("Datasets are up to date, skipping daily update")
            return False

        logger.info("Datasets need update, performing discovery")

        # Create backup
        self.backup_current_data()

        try:
            # Discover new datasets
            datasets = self.discover_all_categories()

            # Validate datasets
            validation_report = self.validate_datasets(datasets)
            self.save_validation_report(validation_report)

            if validation_report["valid_datasets"] == 0:
                logger.error("No valid datasets found, aborting update")
                return False

            # Integrate datasets
            self.integrate_datasets(datasets)

            # Clean up old backups
            self.cleanup_old_backups()

            logger.info("Daily update completed successfully")
            return True

        except Exception as e:
            logger.error(f"Daily update failed: {e}")
            return False

    def run_full_sync(self) -> bool:
        """Run full synchronization workflow.

        Returns:
            True if sync was successful
        """
        logger.info("Starting full synchronization workflow")

        # Create backup
        self.backup_current_data()

        try:
            # Discover all datasets
            datasets = self.discover_all_categories()

            # Validate datasets
            validation_report = self.validate_datasets(datasets)
            self.save_validation_report(validation_report)

            # Integrate datasets
            self.integrate_datasets(datasets)

            # Clean up old backups
            self.cleanup_old_backups(keep_count=20)  # Keep more for full sync

            logger.info("Full synchronization completed successfully")
            return True

        except Exception as e:
            logger.error(f"Full synchronization failed: {e}")
            return False

    def run_validation(self) -> dict[str, Any]:
        """Run data validation only.

        Returns:
            Validation report
        """
        logger.info("Running data validation")

        # Load current datasets
        discovered_file = self.data_path / "discovered-datasets.json"
        if not discovered_file.exists():
            return {"error": "No discovered datasets file found"}

        with open(discovered_file, encoding="utf-8") as f:
            datasets = json.load(f)

        # Validate
        report = self.validate_datasets(datasets)
        self.save_validation_report(report)

        return report


def main() -> int:
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Automated dataset discovery and integration workflows",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run daily update (only if needed)
  %(prog)s --daily-update

  # Force full synchronization
  %(prog)s --full-sync

  # Validate current data only
  %(prog)s --validate-data

  # Custom vizualni-admin path
  %(prog)s --daily-update --vizualni-path /path/to/vizualni-admin
        """,
    )

    # Actions
    action_group = parser.add_mutually_exclusive_group(required=True)
    action_group.add_argument(
        "--daily-update",
        action="store_true",
        help="Run daily update (only if data is old)",
    )
    action_group.add_argument(
        "--full-sync",
        action="store_true",
        help="Force full synchronization of all datasets",
    )
    action_group.add_argument(
        "--validate-data",
        action="store_true",
        help="Validate current datasets without updating",
    )

    # Options
    parser.add_argument(
        "--vizualni-path",
        type=str,
        default="../../ai_working/vizualni-admin",
        help="Path to vizualni-admin project (default: ../../ai_working/vizualni-admin)",
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

    # Validate vizualni-admin path
    vizualni_path = Path(args.vizualni_path)
    if not vizualni_path.exists():
        print(f"Error: vizualni-admin path does not exist: {vizualni_path}")
        return 1

    try:
        # Initialize automation manager
        manager = DatasetAutomationManager(vizualni_path)

        # Run requested action
        if args.daily_update:
            success = manager.run_daily_update()
            return 0 if success else 1

        if args.full_sync:
            success = manager.run_full_sync()
            return 0 if success else 1

        if args.validate_data:
            report = manager.run_validation()
            if "error" in report:
                print(f"Validation error: {report['error']}")
                return 1

            # Print summary
            print("\nValidation Summary:")
            print(f"Total datasets: {report['total_datasets']}")
            print(f"Valid datasets: {report['valid_datasets']}")
            print(f"Invalid datasets: {report['invalid_datasets']}")

            if report["issues"]:
                print("\nIssues found:")
                for issue in report["issues"]:
                    print(f"  - {issue['dataset_id']}: {', '.join(issue['issues'])}")

            return 0

    except Exception as e:
        logger.error(f"Automation failed: {e}", exc_info=args.verbose)
        return 1


if __name__ == "__main__":
    import sys

    sys.exit(main())
