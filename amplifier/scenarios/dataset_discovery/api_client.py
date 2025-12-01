"""uData API client for data.gov.rs dataset discovery.

This module provides a simple wrapper around the uData API used by data.gov.rs
for discovering open datasets.
"""

import logging
from typing import Any
from urllib.parse import urljoin

import requests

logger = logging.getLogger(__name__)


class UDataAPIClient:
    """Client for interacting with data.gov.rs uData API."""

    def __init__(
        self,
        base_url: str = "https://data.gov.rs",
        timeout: int = 30,
    ) -> None:
        """Initialize the uData API client.

        Args:
            base_url: Base URL of the uData instance
            timeout: Request timeout in seconds
        """
        self.base_url = base_url
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "VizualniAdmin-DatasetDiscovery/1.0",
                "Accept": "application/json",
            }
        )

    def search_datasets(
        self,
        query: str | None = None,
        tag: str | None = None,
        organization: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict[str, Any]:
        """Search for datasets using the uData API.

        Args:
            query: Search query string
            tag: Filter by tag
            organization: Filter by organization
            page: Page number (1-indexed)
            page_size: Number of results per page

        Returns:
            API response as dictionary containing:
                - data: List of dataset objects
                - total: Total number of results
                - page: Current page number
                - page_size: Results per page
                - next_page: URL for next page (if available)

        Raises:
            requests.RequestException: If API request fails
        """
        endpoint = "/api/1/datasets/"
        url = urljoin(self.base_url, endpoint)

        params: dict[str, Any] = {
            "page": page,
            "page_size": page_size,
        }

        if query:
            params["q"] = query
        if tag:
            params["tag"] = tag
        if organization:
            params["organization"] = organization

        logger.info(f"Searching datasets: query={query}, tag={tag}, page={page}")

        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"API request failed: {e}")
            raise

    def get_dataset(self, dataset_id: str) -> dict[str, Any]:
        """Fetch a specific dataset by ID.

        Args:
            dataset_id: Dataset identifier

        Returns:
            Dataset object as dictionary

        Raises:
            requests.RequestException: If API request fails
        """
        endpoint = f"/api/1/datasets/{dataset_id}/"
        url = urljoin(self.base_url, endpoint)

        logger.info(f"Fetching dataset: {dataset_id}")

        try:
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Failed to fetch dataset {dataset_id}: {e}")
            raise

    def get_all_pages(
        self,
        query: str | None = None,
        tag: str | None = None,
        organization: str | None = None,
        page_size: int = 20,
        max_results: int | None = None,
    ) -> list[dict[str, Any]]:
        """Fetch all pages of search results.

        Args:
            query: Search query string
            tag: Filter by tag
            organization: Filter by organization
            page_size: Number of results per page
            max_results: Maximum number of results to return (None for all)

        Returns:
            List of all dataset objects

        Raises:
            requests.RequestException: If API request fails
        """
        all_datasets: list[dict[str, Any]] = []
        page = 1

        while True:
            result = self.search_datasets(
                query=query,
                tag=tag,
                organization=organization,
                page=page,
                page_size=page_size,
            )

            datasets = result.get("data", [])
            if not datasets:
                break

            all_datasets.extend(datasets)

            logger.info(f"Fetched page {page}, got {len(datasets)} datasets, total so far: {len(all_datasets)}")

            # Check if we've reached max_results
            if max_results and len(all_datasets) >= max_results:
                all_datasets = all_datasets[:max_results]
                break

            # Check if there are more pages
            total = result.get("total", 0)
            if len(all_datasets) >= total:
                break

            page += 1

        logger.info(f"Fetched total of {len(all_datasets)} datasets")
        return all_datasets

    def close(self) -> None:
        """Close the session."""
        self.session.close()

    def __enter__(self) -> "UDataAPIClient":
        """Context manager entry."""
        return self

    def __exit__(self, *args: Any) -> None:
        """Context manager exit."""
        self.close()
