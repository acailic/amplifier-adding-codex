/**
 * DatasetBrowser Component - Discover and browse datasets from data.gov.rs
 *
 * Features:
 * - Real-time search with debouncing
 * - Category filtering
 * - Pagination support
 * - Loading and error states
 * - Serbian language support (Latin and Cyrillic)
 * - Responsive design
 * - Accessibility features
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { Dataset } from '../../types/datasets';
import { useDatasets, useCategories, useDatasetSearch } from '../../hooks/useDatasets';
import { formatSerbianDate, formatSerbianNumber } from '../../lib/utils';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

interface DatasetBrowserProps {
  /** Initial search query */
  initialQuery?: string;
  /** Initial category filter */
  initialCategory?: string;
  /** Number of datasets per page */
  pageSize?: number;
  /** Show/Hide specific features */
  showSearch?: boolean;
  showCategories?: boolean;
  showPagination?: boolean;
  /** Custom class name */
  className?: string;
  /** Callback when dataset is selected */
  onDatasetSelect?: (dataset: Dataset) => void;
}

const DatasetBrowser: React.FC<DatasetBrowserProps> = ({
  initialQuery = '',
  initialCategory = '',
  pageSize = 20,
  showSearch = true,
  showCategories = true,
  showPagination = true,
  className = '',
  onDatasetSelect,
}) => {
  const { t } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'relevance' | 'title' | 'created' | 'modified' | 'downloads'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Dataset search hook with debouncing
  const {
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
    results: searchResults,
    loading: searchLoading,
  } = useDatasetSearch(300);

  // Datasets hook for main display
  const {
    datasets,
    loading,
    error,
    pagination,
    searchInfo,
    refetch,
    search,
    loadMore,
    hasMore,
  } = useDatasets({
    immediate: true,
    query: initialQuery,
    category: initialCategory,
    limit: pageSize,
    sortBy,
    sortOrder,
  });

  // Categories hook
  const { categories, loading: categoriesLoading } = useCategories();

  // Initialize search query
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery, setSearchQuery]);

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    setCategory(newCategory);
    setCurrentPage(1);
    search({
      query: searchQuery || undefined,
      category: newCategory || undefined,
      page: 1,
      limit: pageSize,
      sortBy,
      sortOrder,
    });
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    search({
      query: query || undefined,
      category: selectedCategory || undefined,
      page: 1,
      limit: pageSize,
      sortBy,
      sortOrder,
    });
  };

  // Handle sort
  const handleSort = (field: typeof sortBy, order: typeof sortOrder) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
    search({
      query: searchQuery || undefined,
      category: selectedCategory || undefined,
      page: 1,
      limit: pageSize,
      sortBy: field,
      sortOrder: order,
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    search({
      query: searchQuery || undefined,
      category: selectedCategory || undefined,
      page,
      limit: pageSize,
      sortBy,
      sortOrder,
    });
  };

  // Handle load more
  const handleLoadMore = async () => {
    await loadMore();
    setCurrentPage(prev => prev + 1);
  };

  // Handle dataset click
  const handleDatasetClick = (dataset: Dataset) => {
    onDatasetSelect?.(dataset);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
      <div className="bg-gray-200 h-3 rounded w-1/2 mb-1"></div>
      <div className="bg-gray-200 h-3 rounded w-1/4"></div>
    </div>
  );

  // Dataset card component
  const DatasetCard: React.FC<{ dataset: Dataset }> = ({ dataset }) => (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer',
        'focus-within:ring-2 focus-within:ring-serbia-red-500'
      )}
      onClick={() => handleDatasetClick(dataset)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDatasetClick(dataset);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View dataset: ${dataset.title}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {dataset.title}
        </h3>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
          {dataset.format?.toUpperCase()}
        </span>
      </div>

      {/* Organization */}
      <div className="flex items-center text-sm text-gray-600 mb-2">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {dataset.organization}
      </div>

      {/* Description */}
      {dataset.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {dataset.description}
        </p>
      )}

      {/* Tags */}
      {dataset.tags && dataset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {dataset.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-serbia-red-50 text-serbia-red-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {dataset.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{dataset.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {dataset.created_at && (
            <span>
              {t('datasets:created')}: {formatSerbianDate(dataset.created_at)}
            </span>
          )}
          {dataset.modified_at && (
            <span>
              {t('datasets:updated')}: {formatSerbianDate(dataset.modified_at)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {dataset.views && (
            <span>
              <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {formatSerbianNumber(dataset.views)}
            </span>
          )}
          {dataset.downloads && (
            <span>
              <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {formatSerbianNumber(dataset.downloads)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('dataset-browser', className)}>
      {/* Search Header */}
      {showSearch && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={t('datasets:searchPlaceholder')}
                  className={cn(
                    'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-serbia-red-500 focus:border-transparent',
                    'transition-colors duration-200'
                  )}
                  aria-label="Search datasets"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Sort controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value as typeof sortBy, sortOrder)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-serbia-red-500 focus:border-transparent"
                aria-label="Sort by"
              >
                <option value="relevance">{t('datasets:sortByRelevance')}</option>
                <option value="title">{t('datasets:sortByTitle')}</option>
                <option value="created">{t('datasets:sortByCreated')}</option>
                <option value="modified">{t('datasets:sortByUpdated')}</option>
                <option value="downloads">{t('datasets:sortByDownloads')}</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                aria-label={`Sort order: ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Search results dropdown */}
          {searchQuery && searchResults.length > 0 && !searchLoading && (
            <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 mb-1">
                {t('datasets:quickResults')} ({searchResults.length})
              </div>
              {searchResults.slice(0, 3).map((dataset) => (
                <div
                  key={dataset.id}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleDatasetClick(dataset)}
                >
                  <div className="font-medium text-sm">{dataset.title}</div>
                  <div className="text-xs text-gray-500">{dataset.organization}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      {showCategories && categories.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedCategory ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('')}
            >
              {t('datasets:allCategories')}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id || cat.name}
                variant={selectedCategory === cat.name ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(cat.name)}
              >
                {cat.displayName || cat.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && datasets.length === 0 && (
        <div className="space-y-4">
          {[...Array(pageSize)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <LoadingSkeleton />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold">{t('datasets:errorTitle')}</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="primary" size="sm">
            {t('datasets:retryButton')}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && datasets.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('datasets:noDatasetsTitle')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('datasets:noDatasetsMessage')}
          </p>
          {searchQuery || selectedCategory ? (
            <Button
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('');
              }}
              variant="outline"
              size="sm"
            >
              {t('datasets:clearFilters')}
            </Button>
          ) : null}
        </div>
      )}

      {/* Dataset List/Grid */}
      {!loading && !error && datasets.length > 0 && (
        <>
          {/* Results info */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {searchInfo.totalResults > 0 && (
                <>
                  {t('datasets:showingResults', {
                    start: (currentPage - 1) * pageSize + 1,
                    end: Math.min(currentPage * pageSize, searchInfo.totalResults),
                    total: searchInfo.totalResults,
                  })}
                  {searchInfo.searchTime > 0 && (
                    <span className="ml-2">
                      ({t('datasets:searchTime', { time: searchInfo.searchTime.toFixed(2) })})
                    </span>
                  )}
                </>
              )}
            </div>

            {/* View toggle */}
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Dataset display */}
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          )}>
            {datasets.map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>

          {/* Load More / Pagination */}
          {showPagination && hasMore && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleLoadMore}
                loading={loading}
                variant="outline"
                size="lg"
              >
                {t('datasets:loadMore')}
              </Button>
            </div>
          )}

          {/* Pagination controls */}
          {showPagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ←
              </Button>

              <span className="text-sm text-gray-600 px-4">
                {t('datasets:pageInfo', { current: currentPage, total: pagination.totalPages })}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Styles for line clamping */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default DatasetBrowser;