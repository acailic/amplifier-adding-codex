/**
 * Client service for interacting with the dataset discovery API
 */

import { Dataset, DatasetSearchRequest, DatasetSearchResponse, DatasetDetailResponse } from '../types/datasets';

export class DatasetService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/datasets') {
    this.baseUrl = baseUrl;
  }

  /**
   * Search for datasets
   */
  async searchDatasets(params: DatasetSearchRequest = {}): Promise<DatasetSearchResponse> {
    const queryParams = new URLSearchParams();

    // Add parameters to query string
    if (params.query) queryParams.append('query', params.query);
    if (params.category) queryParams.append('category', params.category);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.organization) queryParams.append('organization', params.organization);
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${this.baseUrl}/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get a specific dataset by ID
   */
  async getDataset(id: string): Promise<DatasetDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get available categories
   */
  async getCategories(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Search datasets with advanced filtering
   */
  async advancedSearch(searchRequest: {
    query?: string;
    filters?: {
      categories?: string[];
      organizations?: string[];
      formats?: string[];
      tags?: string[];
    };
    pagination?: {
      page: number;
      limit: number;
    };
    sort?: {
      field: 'relevance' | 'title' | 'created' | 'modified' | 'downloads';
      order: 'asc' | 'desc';
    };
  }): Promise<DatasetSearchResponse> {
    // Convert advanced search to basic search parameters
    const params: DatasetSearchRequest = {
      query: searchRequest.query,
      page: searchRequest.pagination?.page,
      limit: searchRequest.pagination?.limit,
      sortBy: searchRequest.sort?.field,
      sortOrder: searchRequest.sort?.order,
    };

    // For now, we'll use the first category if multiple are provided
    // This could be enhanced in the Python script to support multiple categories
    if (searchRequest.filters?.categories?.length) {
      params.category = searchRequest.filters.categories[0];
    }

    // Combine organizations into a query
    if (searchRequest.filters?.organizations?.length) {
      const orgQuery = searchRequest.filters.organizations.join(' OR ');
      params.query = params.query ? `${params.query} ${orgQuery}` : orgQuery;
    }

    // Combine tags into a query
    if (searchRequest.filters?.tags?.length) {
      const tagQuery = searchRequest.filters.tags.map(tag => `tag:"${tag}"`).join(' OR ');
      params.query = params.query ? `${params.query} ${tagQuery}` : tagQuery;
    }

    return this.searchDatasets(params);
  }

  /**
   * Suggest related datasets based on a current dataset
   */
  async getRelatedDatasets(dataset: Dataset, limit: number = 5): Promise<Dataset[]> {
    // Use category or tags to find related datasets
    const params: DatasetSearchRequest = {
      category: dataset.category,
      limit: limit + 1, // Get one extra to exclude the current dataset
      sortBy: 'relevance',
    };

    const response = await this.searchDatasets(params);

    // Filter out the current dataset and return the rest
    return response.data.filter(d => d.id !== dataset.id).slice(0, limit);
  }

  /**
   * Get datasets by organization
   */
  async getDatasetsByOrganization(
    organization: string,
    page: number = 1,
    limit: number = 20
  ): Promise<DatasetSearchResponse> {
    return this.searchDatasets({
      organization,
      page,
      limit,
      sortBy: 'title',
      sortOrder: 'asc',
    });
  }

  /**
   * Get popular datasets
   */
  async getPopularDatasets(limit: number = 10): Promise<Dataset[]> {
    const response = await this.searchDatasets({
      limit,
      sortBy: 'downloads',
      sortOrder: 'desc',
    });

    return response.data;
  }

  /**
   * Get recently updated datasets
   */
  async getRecentlyUpdatedDatasets(limit: number = 10): Promise<Dataset[]> {
    const response = await this.searchDatasets({
      limit,
      sortBy: 'modified',
      sortOrder: 'desc',
    });

    return response.data;
  }
}

// Export a singleton instance
export const datasetService = new DatasetService();

// Export convenience functions
export const searchDatasets = (params?: DatasetSearchRequest) => datasetService.searchDatasets(params);
export const getDataset = (id: string) => datasetService.getDataset(id);
export const getCategories = () => datasetService.getCategories();
export const getPopularDatasets = (limit?: number) => datasetService.getPopularDatasets(limit);
export const getRecentlyUpdatedDatasets = (limit?: number) => datasetService.getRecentlyUpdatedDatasets(limit);