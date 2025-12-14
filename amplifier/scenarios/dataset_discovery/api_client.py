"""uData API client for data.gov.rs dataset discovery.

This module provides a robust wrapper around the uData API used by data.gov.rs
for discovering open datasets with proper error handling, rate limiting, and retries.
"""

import logging
import time
from typing import Any
from urllib.parse import urljoin

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)


class APIError(Exception):
    """Custom exception for API-related errors."""

    pass


class RateLimitError(APIError):
    """Exception raised when rate limit is exceeded."""

    pass


class UDataAPIClient:
    """Client for interacting with data.gov.rs uData API."""

    def __init__(
        self,
        base_url: str = "https://data.gov.rs",
        timeout: int = 30,
        max_retries: int = 3,
        retry_backoff_factor: float = 0.5,
        rate_limit_delay: float = 1.0,
    ) -> None:
        """Initialize the uData API client.

        Args:
            base_url: Base URL of the uData instance
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
            retry_backoff_factor: Backoff factor for retries
            rate_limit_delay: Delay between requests to respect rate limits
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.rate_limit_delay = rate_limit_delay
        self.last_request_time = 0

        # Configure session with retry strategy
        self.session = requests.Session()

        # Set up retry strategy
        retry_strategy = Retry(
            total=max_retries,
            backoff_factor=retry_backoff_factor,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"],
            raise_on_status=False,
        )

        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

        self.session.headers.update(
            {
                "User-Agent": "VizualniAdmin-DatasetDiscovery/1.0",
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
            }
        )

        # Test connectivity
        try:
            self._test_connectivity()
        except Exception as e:
            logger.warning(f"Initial connectivity test failed: {str(e)}")

    def _test_connectivity(self) -> None:
        """Test basic connectivity to the API."""
        try:
            # Simple health check - try to access the datasets endpoint with page=1, page_size=1
            self.search_datasets(page=1, page_size=1)
            logger.info("API connectivity test successful")
        except Exception as e:
            raise APIError(f"Failed to connect to API at {self.base_url}: {str(e)}")

    def _respect_rate_limit(self) -> None:
        """Ensure we don't exceed rate limits."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time

        if time_since_last < self.rate_limit_delay:
            sleep_time = self.rate_limit_delay - time_since_last
            logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)

        self.last_request_time = time.time()

    def _make_request(self, url: str, params: dict[str, Any]) -> requests.Response:
        """Make an HTTP request with proper error handling."""
        self._respect_rate_limit()

        try:
            response = self.session.get(url, params=params, timeout=self.timeout)

            # Check for rate limiting
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 60))
                raise RateLimitError(f"Rate limit exceeded. Retry after {retry_after} seconds")

            # Check for other HTTP errors
            if response.status_code >= 400:
                error_msg = f"HTTP {response.status_code}"
                try:
                    error_data = response.json()
                    if "error" in error_data:
                        error_msg += f": {error_data['error']}"
                    elif "message" in error_data:
                        error_msg += f": {error_data['message']}"
                except ValueError:
                    # Not JSON response
                    error_msg += f": {response.text[:200]}"

                raise APIError(error_msg)

            return response

        except requests.exceptions.Timeout:
            raise APIError(f"Request timeout after {self.timeout} seconds")
        except requests.exceptions.ConnectionError:
            raise APIError(f"Failed to connect to {self.base_url}")
        except requests.exceptions.RequestException as e:
            raise APIError(f"Request failed: {str(e)}")

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
            APIError: If API request fails
            RateLimitError: If rate limit is exceeded
        """
        # Validate parameters
        if page < 1:
            raise ValueError("Page number must be >= 1")
        if page_size < 1 or page_size > 100:  # Reasonable limits
            raise ValueError("Page size must be between 1 and 100")

        endpoint = "/api/1/datasets/"
        url = urljoin(self.base_url, endpoint)

        params: dict[str, Any] = {
            "page": page,
            "page_size": min(page_size, 100),  # Enforce max limit
        }

        if query:
            params["q"] = query.strip()
        if tag:
            params["tag"] = tag.strip()
        if organization:
            params["organization"] = organization.strip()

        logger.debug(f"Searching datasets: query={query}, tag={tag}, page={page}")

        try:
            response = self._make_request(url, params)

            try:
                data = response.json()
            except ValueError as e:
                raise APIError(f"Invalid JSON response: {str(e)}")

            # Validate response structure
            if not isinstance(data, dict):
                raise APIError("Invalid response format: expected dictionary")

            if "data" not in data:
                raise APIError("Invalid response format: missing 'data' field")

            # Ensure data is a list
            if not isinstance(data["data"], list):
                raise APIError("Invalid response format: 'data' field must be a list")

            logger.info(f"Found {len(data['data'])} datasets on page {page}")
            return data

        except APIError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in search_datasets: {str(e)}")
            raise APIError(f"Unexpected error: {str(e)}")

    def get_dataset(self, dataset_id: str) -> dict[str, Any]:
        """Fetch a specific dataset by ID.

        Args:
            dataset_id: Dataset identifier

        Returns:
            Dataset object as dictionary

        Raises:
            APIError: If API request fails
            ValueError: If dataset_id is invalid
        """
        if not dataset_id or not isinstance(dataset_id, str):
            raise ValueError("Dataset ID must be a non-empty string")

        endpoint = f"/api/1/datasets/{dataset_id.strip()}/"
        url = urljoin(self.base_url, endpoint)

        logger.debug(f"Fetching dataset: {dataset_id}")

        try:
            response = self._make_request(url, {})

            try:
                data = response.json()
            except ValueError as e:
                raise APIError(f"Invalid JSON response: {str(e)}")

            # Validate response structure
            if not isinstance(data, dict):
                raise APIError("Invalid response format: expected dictionary")

            logger.info(f"Successfully fetched dataset: {dataset_id}")
            return data

        except APIError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in get_dataset: {str(e)}")
            raise APIError(f"Unexpected error: {str(e)}")

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
            APIError: If API request fails
        """
        all_datasets: list[dict[str, Any]] = []
        page = 1
        consecutive_errors = 0
        max_consecutive_errors = 3

        logger.info(f"Starting multi-page fetch: query={query}, tag={tag}")

        try:
            while True:
                try:
                    result = self.search_datasets(
                        query=query,
                        tag=tag,
                        organization=organization,
                        page=page,
                        page_size=page_size,
                    )

                    datasets = result.get("data", [])
                    if not datasets:
                        logger.info("No more datasets found, stopping pagination")
                        break

                    all_datasets.extend(datasets)
                    consecutive_errors = 0  # Reset error counter on success

                    logger.info(f"Fetched page {page}, got {len(datasets)} datasets, total so far: {len(all_datasets)}")

                    # Check if we've reached max_results
                    if max_results and len(all_datasets) >= max_results:
                        all_datasets = all_datasets[:max_results]
                        logger.info(f"Reached max_results limit ({max_results})")
                        break

                    # Check if there are more pages
                    total = result.get("total", 0)
                    if len(all_datasets) >= total:
                        logger.info(f"Fetched all available datasets ({total})")
                        break

                    page += 1

                    # Add small delay between pages
                    time.sleep(0.5)

                except RateLimitError as e:
                    logger.warning(f"Rate limit hit, waiting: {str(e)}")
                    time.sleep(5)  # Wait longer for rate limit
                    continue

                except APIError as e:
                    consecutive_errors += 1
                    if consecutive_errors >= max_consecutive_errors:
                        logger.error(f"Too many consecutive errors ({max_consecutive_errors}), stopping pagination")
                        raise APIError(f"Pagination failed after {max_consecutive_errors} consecutive errors: {str(e)}")

                    logger.warning(
                        f"Page {page} failed (error {consecutive_errors}/{max_consecutive_errors}): {str(e)}"
                    )
                    time.sleep(1)  # Brief delay before retry
                    continue

        except Exception as e:
            logger.error(f"Unexpected error in get_all_pages: {str(e)}")
            raise APIError(f"Pagination failed: {str(e)}")

        logger.info(f"Successfully fetched total of {len(all_datasets)} datasets")
        return all_datasets

    def close(self) -> None:
        """Close the session and clean up resources."""
        try:
            self.session.close()
            logger.debug("API client session closed")
        except Exception as e:
            logger.warning(f"Error closing session: {str(e)}")

    def __enter__(self) -> "UDataAPIClient":
        """Context manager entry."""
        return self

    def __exit__(self, *args: Any) -> None:
        """Context manager exit."""
        self.close()

    def __del__(self) -> None:
        """Destructor to ensure session is closed."""
        from contextlib import suppress

        with suppress(Exception):
            self.close()
