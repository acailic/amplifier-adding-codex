/**
 * React hooks for consuming the dataset discovery API
 */

import { useState, useEffect, useCallback } from 'react';
import { Dataset, DatasetSearchRequest, DatasetSearchResponse } from '../types/datasets';
import { datasetService } from '../lib/dataset-service';

interface UseDatasetsOptions extends DatasetSearchRequest {
  immediate?: boolean;
}

interface UseDatasetsResult {
  datasets: Dataset[];
  loading: boolean;
  error: string | null;
  pagination: DatasetSearchResponse['pagination'];
  searchInfo: DatasetSearchResponse['searchInfo'];
  refetch: () => Promise<void>;
  search: (params: DatasetSearchRequest) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useDatasets(options: UseDatasetsOptions = {}): UseDatasetsResult {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<DatasetSearchResponse['pagination']>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [searchInfo, setSearchInfo] = useState<DatasetSearchResponse['searchInfo']>({
    totalResults: 0,
    searchTime: 0,
  });

  const { immediate = false, ...searchParams } = options;

  const performSearch = useCallback(async (params: DatasetSearchRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await datasetService.searchDatasets(params);

      if (params.page === 1) {
        // New search, replace all results
        setDatasets(response.data);
      } else {
        // Pagination, append results
        setDatasets(prev => [...prev, ...response.data]);
      }

      setPagination(response.pagination);
      setSearchInfo(response.searchInfo);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch datasets');
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (params: DatasetSearchRequest) => {
    await performSearch({ ...params, page: 1 });
  }, [performSearch]);

  const loadMore = useCallback(async () => {
    if (!loading && pagination.hasNext) {
      await performSearch({ ...searchParams, page: pagination.page + 1 });
    }
  }, [loading, pagination.hasNext, pagination.page, searchParams, performSearch]);

  const refetch = useCallback(async () => {
    await search(searchParams);
  }, [search, searchParams]);

  // Initial load
  useEffect(() => {
    if (immediate) {
      search(searchParams);
    }
  }, []); // Only run once on mount

  return {
    datasets,
    loading,
    error,
    pagination,
    searchInfo,
    refetch,
    search,
    loadMore,
    hasMore: pagination.hasNext,
  };
}

interface UseDatasetResult {
  dataset: Dataset | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDataset(id: string): UseDatasetResult {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDataset = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await datasetService.getDataset(id);
      setDataset(response.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dataset');
      setDataset(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = useCallback(async () => {
    await fetchDataset();
  }, [fetchDataset]);

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset]);

  return {
    dataset,
    loading,
    error,
    refetch,
  };
}

interface UseCategoriesResult {
  categories: any[];
  loading: boolean;
  error: string | null;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await datasetService.getCategories();
        setCategories(response.data || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
  };
}

/**
 * Hook for dataset search with debouncing
 */
export function useDatasetSearch(debounceMs: number = 300) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [results, setResults] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Perform search when debounced query or category changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery && !category) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await datasetService.searchDatasets({
          query: debouncedQuery || undefined,
          category: category || undefined,
          limit: 10,
        });
        setResults(response.data);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, category]);

  return {
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
    results,
    loading,
  };
}

/**
 * Hook for popular datasets
 */
export function usePopularDatasets(limit: number = 5) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopular = async () => {
      setLoading(true);
      setError(null);

      try {
        const popular = await datasetService.getPopularDatasets(limit);
        setDatasets(popular);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch popular datasets');
        setDatasets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, [limit]);

  return {
    datasets,
    loading,
    error,
  };
}