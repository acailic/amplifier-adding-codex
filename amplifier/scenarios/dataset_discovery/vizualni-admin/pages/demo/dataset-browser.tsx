/**
 * Demo Page - Showcase DatasetBrowser component with different configurations
 */

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import MainLayout from '@/components/layout/MainLayout';
import DatasetBrowser from '@/components/onboarding/DatasetBrowser';
import { Dataset } from '@/types/datasets';
import Button from '@/components/ui/Button';

interface DemoPageProps {
  _nextI18Next: {
    initialLocale: string;
    userConfig: any;
  };
}

const DatasetBrowserDemo: React.FC<DemoPageProps> = () => {
  const { t } = useTranslation('common');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [demoMode, setDemoMode] = useState<'search' | 'category' | 'compact'>('search');

  const handleDatasetSelect = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    // In a real app, this might navigate to a detail page or open a modal
    console.log('Selected dataset:', dataset);
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DatasetBrowser Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            Explore different configurations of the DatasetBrowser component
          </p>
        </div>

        {/* Demo Mode Selector */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demo Mode</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={demoMode === 'search' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDemoMode('search')}
            >
              Search & Filter
            </Button>
            <Button
              variant={demoMode === 'category' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDemoMode('category')}
            >
              Category Browsing
            </Button>
            <Button
              variant={demoMode === 'compact' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDemoMode('compact')}
            >
              Compact View
            </Button>
          </div>
        </div>

        {/* Selected Dataset Display */}
        {selectedDataset && (
          <div className="mb-6 p-4 bg-serbia-red-50 border border-serbia-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-serbia-red-900">
                  Selected Dataset: {selectedDataset.title}
                </h3>
                <p className="text-sm text-serbia-red-700">
                  {selectedDataset.organization} • {selectedDataset.format?.toUpperCase()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDataset(null)}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Dataset Browser - Search Mode */}
        {demoMode === 'search' && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Full Search & Filter Mode
            </h2>
            <p className="text-gray-600 mb-4">
              Complete dataset browser with search, categories, sorting, and pagination.
            </p>
            <DatasetBrowser
              onDatasetSelect={handleDatasetSelect}
              pageSize={12}
              showSearch={true}
              showCategories={true}
              showPagination={true}
              initialQuery="grad"
              className="mb-8"
            />
          </div>
        )}

        {/* Dataset Browser - Category Mode */}
        {demoMode === 'category' && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Category Browsing Mode
            </h2>
            <p className="text-gray-600 mb-4">
              Focused on category filtering without search functionality.
            </p>
            <DatasetBrowser
              onDatasetSelect={handleDatasetSelect}
              pageSize={12}
              showSearch={false}
              showCategories={true}
              showPagination={true}
              initialCategory="Demografija"
              className="mb-8"
            />
          </div>
        )}

        {/* Dataset Browser - Compact Mode */}
        {demoMode === 'compact' && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Compact View Mode
            </h2>
            <p className="text-gray-600 mb-4">
              Minimal configuration with just search and results, no categories or pagination.
            </p>
            <DatasetBrowser
              onDatasetSelect={handleDatasetSelect}
              pageSize={10}
              showSearch={true}
              showCategories={false}
              showPagination={false}
              className="mb-8"
            />
          </div>
        )}

        {/* Configuration Examples */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configuration Examples
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Basic Usage:</h3>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
{`<DatasetBrowser
  onDatasetSelect={handleDatasetSelect}
  pageSize={20}
/>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">With Search and Categories:</h3>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
{`<DatasetBrowser
  onDatasetSelect={handleDatasetSelect}
  pageSize={20}
  showSearch={true}
  showCategories={true}
  showPagination={true}
  initialQuery="pretraga"
  initialCategory="Kategorija"
/>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Minimal Configuration:</h3>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
{`<DatasetBrowser
  pageSize={10}
  showSearch={false}
  showCategories={false}
  showPagination={false}
/>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                🔍 Real-time Search
              </h3>
              <p className="text-sm text-gray-600">
                Debounced search with instant results dropdown
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                🏷️ Category Filtering
              </h3>
              <p className="text-sm text-gray-600">
                Filter datasets by categories with dynamic loading
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                📄 Pagination
              </h3>
              <p className="text-sm text-gray-600">
                Load more results or navigate with pagination controls
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                🔄 Sorting
              </h3>
              <p className="text-sm text-gray-600">
                Sort by relevance, title, date, or download count
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                🇷🇸 Serbian Support
              </h3>
              <p className="text-sm text-gray-600">
                Full support for Serbian language (Latin and Cyrillic)
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                ♿ Accessibility
              </h3>
              <p className="text-sm text-gray-600">
                WCAG compliant with keyboard navigation and ARIA labels
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                📱 Responsive
              </h3>
              <p className="text-sm text-gray-600">
                Mobile-friendly design with touch-optimized interactions
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                🎨 View Modes
              </h3>
              <p className="text-sm text-gray-600">
                Switch between grid and list view layouts
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                🎯 Type-Safe
              </h3>
              <p className="text-sm text-gray-600">
                Full TypeScript support with proper type definitions
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Static props for SSR
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'sr', ['common', 'datasets'])),
    },
    revalidate: 60, // Revalidate every minute
  };
};

export default DatasetBrowserDemo;