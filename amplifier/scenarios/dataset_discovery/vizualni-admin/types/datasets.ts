/**
 * TypeScript types for dataset discovery API responses
 */

export interface Dataset {
  id: string;
  title: string;
  organization: string;
  tags: string[];
  format: string;
  url: string;
  description?: string;
  category?: string;
  created_at?: string;
  modified_at?: string;
  downloads?: number;
  views?: number;
  resources?: DatasetResource[];
}

export interface DatasetResource {
  id: string;
  title: string;
  format: string;
  url: string;
  size?: number;
  created_at?: string;
  modified_at?: string;
}

export interface DatasetSearchResponse {
  success: boolean;
  data: Dataset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  searchInfo: {
    query?: string;
    category?: string;
    totalResults: number;
    searchTime: number;
  };
}

export interface DatasetDetailResponse {
  success: boolean;
  data: Dataset;
  relatedDatasets?: Dataset[];
}

export interface DatasetSearchRequest {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
  organization?: string;
  tag?: string;
  sortBy?: 'relevance' | 'title' | 'created' | 'modified' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}

export interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export type DatasetApiResponse = DatasetSearchResponse | DatasetDetailResponse | APIError;