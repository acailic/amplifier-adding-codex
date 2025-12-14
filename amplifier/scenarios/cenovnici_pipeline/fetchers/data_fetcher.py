"""
Data fetcher for cenovnici datasets.

This module handles fetching price list data from data.gov.rs and other sources.
Supports CSV and Excel file downloads with caching.
"""

import hashlib
import logging
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests

from ..config.settings import settings
from ..core.models import RawCenovnikRecord

logger = logging.getLogger(__name__)


class DataFetcher:
    """Fetches cenovnici data from various sources."""

    def __init__(self, cache_dir: Path | None = None):
        """Initialize the data fetcher.

        Args:
            cache_dir: Directory for caching downloaded files
        """
        self.cache_dir = cache_dir or Path(settings.get_output_paths()["cache"])
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "Mozilla/5.0 (compatible; CenovniciPipeline/1.0)"})

    def fetch_from_url(self, url: str, force_refresh: bool = False) -> Path:
        """Download file from URL with caching.

        Args:
            url: URL to fetch
            force_refresh: Skip cache and re-download

        Returns:
            Path to downloaded file
        """
        # Generate cache filename from URL
        url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
        parsed = urlparse(url)
        ext = Path(parsed.path).suffix or ".csv"
        cache_file = self.cache_dir / f"{url_hash}{ext}"

        # Check cache
        if cache_file.exists() and not force_refresh:
            logger.info(f"Using cached file: {cache_file}")
            return cache_file

        # Download file
        logger.info(f"Downloading: {url}")
        try:
            response = self.session.get(url, stream=True, timeout=30)
            response.raise_for_status()

            # Save to cache
            with open(cache_file, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            logger.info(f"Downloaded to: {cache_file}")
            return cache_file

        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            raise

    def fetch_retailer_data(self, retailer_id: str) -> list[Path]:
        """Fetch all data files for a retailer.

        Args:
            retailer_id: Retailer identifier

        Returns:
            List of downloaded file paths
        """
        retailer = settings.get_retailer_by_id(retailer_id)
        if not retailer:
            raise ValueError(f"Unknown retailer: {retailer_id}")

        # For now, use local files if they exist
        # In production, this would fetch from retailer.data_source_url
        local_files = []

        # Check for existing files in raw_data directory
        raw_dir = Path(settings.get_output_paths()["raw"]) / retailer_id
        if raw_dir.exists():
            local_files.extend(raw_dir.glob("*.csv"))
            local_files.extend(raw_dir.glob("*.xlsx"))

        # If no local files, try to find sample data
        if not local_files:
            sample_file = (
                Path(__file__).parent.parent.parent.parent.parent / ".playwright-mcp" / "cene-proizvoda-lidl.csv"
            )
            if sample_file.exists():
                local_files.append(sample_file)
                logger.info(f"Using sample file: {sample_file}")

        if not local_files:
            logger.warning(f"No data files found for retailer: {retailer_id}")

        return local_files

    def fetch_all_retailers(self) -> dict[str, list[Path]]:
        """Fetch data for all configured retailers.

        Returns:
            Dictionary mapping retailer_id to list of file paths
        """
        results = {}
        retailers = settings.get_all_retailers()

        logger.info(f"Fetching data for {len(retailers)} retailers")

        for retailer in retailers:
            try:
                files = self.fetch_retailer_data(retailer.id)
                results[retailer.id] = files
                logger.info(f"Fetched {len(files)} files for {retailer.name}")
            except Exception as e:
                logger.error(f"Failed to fetch data for {retailer.name}: {e}")
                results[retailer.id] = []

        return results

    def parse_csv_file(self, file_path: Path, encoding: str = "utf-8") -> list[dict[str, Any]]:
        """Parse CSV file and return raw records.

        Args:
            file_path: Path to CSV file
            encoding: File encoding

        Returns:
            List of raw data rows as dictionaries
        """
        import pandas as pd

        try:
            # Try different encodings
            for enc in [encoding, "utf-8-sig", "cp1250", "cp1252", "iso-8859-2"]:
                try:
                    df = pd.read_csv(file_path, encoding=enc, sep=";", dtype=str, na_filter=False)
                    logger.info(f"Successfully parsed {file_path} with encoding {enc}")
                    return df.to_dict("records")
                except UnicodeDecodeError:
                    continue

            # Last attempt with error handling
            df = pd.read_csv(file_path, encoding="utf-8", sep=";", dtype=str, na_filter=False, on_bad_lines="skip")
            return df.to_dict("records")

        except Exception as e:
            logger.error(f"Failed to parse CSV {file_path}: {e}")
            raise

    def parse_excel_file(self, file_path: Path) -> list[dict[str, Any]]:
        """Parse Excel file and return raw records.

        Args:
            file_path: Path to Excel file

        Returns:
            List of raw data rows as dictionaries
        """
        import pandas as pd

        try:
            # Try different sheet names
            sheet_names = ["Sheet1", "Cenovnik", "Podaci", "Data"]

            for sheet_name in sheet_names:
                try:
                    df = pd.read_excel(file_path, sheet_name=sheet_name, dtype=str, na_values=[""])
                    if not df.empty:
                        logger.info(f"Successfully parsed {file_path} from sheet '{sheet_name}'")
                        return df.fillna("").to_dict("records")
                except:
                    continue

            # Try first sheet
            df = pd.read_excel(file_path, dtype=str, na_values=[""])
            return df.fillna("").to_dict("records")

        except Exception as e:
            logger.error(f"Failed to parse Excel {file_path}: {e}")
            raise

    def load_raw_records(self, file_path: Path) -> list[RawCenovnikRecord]:
        """Load and validate raw cenovnik records from file.

        Args:
            file_path: Path to data file

        Returns:
            List of validated RawCenovnikRecord objects
        """
        logger.info(f"Loading raw records from {file_path}")

        # Parse file based on extension
        if file_path.suffix.lower() == ".csv":
            raw_data = self.parse_csv_file(file_path)
        elif file_path.suffix.lower() in [".xlsx", ".xls"]:
            raw_data = self.parse_excel_file(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_path.suffix}")

        # Convert to RawCenovnikRecord objects
        records = []
        errors = 0

        for i, row in enumerate(raw_data):
            try:
                record = RawCenovnikRecord(**row)
                records.append(record)
            except Exception as e:
                errors += 1
                if errors <= 10:  # Log first 10 errors only
                    logger.warning(f"Error parsing row {i} in {file_path}: {e}")

        logger.info(f"Loaded {len(records)} valid records from {file_path} (errors: {errors})")
        return records

    def get_retailer_from_filename(self, filename: str) -> str | None:
        """Extract retailer ID from filename.

        Args:
            filename: Filename to analyze

        Returns:
            Retailer ID if found, None otherwise
        """
        filename_lower = filename.lower()

        for retailer in settings.get_all_retailers():
            if retailer.id.lower() in filename_lower:
                return retailer.id
            # Check for variations
            if retailer.name.lower() in filename_lower:
                return retailer.id

        return None

    def discover_data_files(self, directory: Path) -> dict[str, list[Path]]:
        """Discover data files in directory by retailer.

        Args:
            directory: Directory to scan

        Returns:
            Dictionary mapping retailer_id to list of file paths
        """
        results = {}

        for file_path in directory.rglob("*.csv"):
            retailer_id = self.get_retailer_from_filename(file_path.name)
            if retailer_id:
                results.setdefault(retailer_id, []).append(file_path)

        for file_path in directory.rglob("*.xlsx"):
            retailer_id = self.get_retailer_from_filename(file_path.name)
            if retailer_id:
                results.setdefault(retailer_id, []).append(file_path)

        return results


# Export the main class
__all__ = ["DataFetcher"]
