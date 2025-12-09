/**
 * Dataset Detail Page - View detailed information about a specific dataset
 */

import React from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { useDataset } from '@/hooks/useDatasets';
import { Dataset } from '@/types/datasets';
import { formatSerbianDate, formatSerbianNumber } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface DatasetDetailPageProps {
  id: string;
  _nextI18Next: {
    initialLocale: string;
    userConfig: any;
  };
}

const DatasetDetailPage: React.FC<DatasetDetailPageProps> = ({ id }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { dataset, loading, error, refetch } = useDataset(id);

  // Handle download
  const handleDownload = async (url: string, format?: string) => {
    try {
      // For direct downloads, create a temporary link
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      // Add download attribute if it's a direct file
      if (format && !url.startsWith('http')) {
        link.download = `dataset.${format}`;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <MainLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !dataset) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold">{t('datasets:errorTitle')}</h3>
          </div>
          <p className="text-red-600 mb-6">{error || t('datasets:notFound')}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={refetch} variant="primary" size="sm">
              {t('datasets:retryButton')}
            </Button>
            <Button onClick={() => router.push('/datasets')} variant="outline" size="sm">
              {t('datasets:backToList')}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('datasets:backButton')}
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {dataset.title}
              </h1>
              <p className="text-lg text-gray-600">
                {dataset.organization}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-6">
              {dataset.format && (
                <span className="px-3 py-1 bg-serbia-red-100 text-serbia-red-800 text-sm font-medium rounded-full">
                  {dataset.format.toUpperCase()}
                </span>
              )}
              {dataset.category && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                  {dataset.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {dataset.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('datasets:description')}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {dataset.description}
                </p>
              </div>
            )}

            {/* Resources */}
            {dataset.resources && dataset.resources.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('datasets:resources')} ({dataset.resources.length})
                </h2>
                <div className="space-y-3">
                  {dataset.resources.map((resource, index) => (
                    <div
                      key={resource.id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {resource.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {resource.format?.toUpperCase()}
                          </span>
                          {resource.size && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              {(resource.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                          {resource.modified_at && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatSerbianDate(resource.modified_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(resource.url, resource.format)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t('datasets:download')}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {dataset.tags && dataset.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('datasets:tags')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {dataset.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-serbia-blue-50 text-serbia-blue-700 text-sm rounded-full hover:bg-serbia-blue-100 cursor-pointer"
                      onClick={() => router.push(`/datasets?tag=${encodeURIComponent(tag)}`)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Metadata */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('datasets:quickActions')}
              </h2>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleDownload(dataset.url, dataset.format)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('datasets:downloadDataset')}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => window.open(dataset.url, '_blank')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {t('datasets:viewOnPortal')}
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: dataset.title,
                        text: dataset.description,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 2.943-9.543 7a9.97 9.97 0 011.827 3.342M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('datasets:share')}
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('datasets:metadata')}
              </h2>
              <dl className="space-y-3">
                {dataset.created_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      {t('datasets:created')}
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {formatSerbianDate(dataset.created_at)}
                    </dd>
                  </div>
                )}
                {dataset.modified_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      {t('datasets:lastUpdated')}
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {formatSerbianDate(dataset.modified_at)}
                    </dd>
                  </div>
                )}
                {dataset.views && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      {t('datasets:views')}
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {formatSerbianNumber(dataset.views)}
                    </dd>
                  </div>
                )}
                {dataset.downloads && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      {t('datasets:downloads')}
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {formatSerbianNumber(dataset.downloads)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* License information */}
            <div className="bg-serbia-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-serbia-blue-900 mb-3">
                {t('datasets:license')}
              </h2>
              <p className="text-serbia-blue-800 text-sm">
                {t('datasets:licenseInfo')}
              </p>
              <a
                href="https://data.gov.rs/sr/registrovani-agencijama-za-ponudu-podataka/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-serbia-blue-700 hover:text-serbia-blue-900 text-sm font-medium mt-2"
              >
                {t('datasets:learnMore')}
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Static path generation
export const getStaticPaths: GetStaticPaths = async () => {
  // Since we can't know all dataset IDs in advance, we'll use fallback: 'blocking'
  // This means Next.js will generate the page on-demand if it's not already built
  return {
    paths: [],
    fallback: 'blocking',
  };
};

// Static props for SSR
export const getStaticProps: GetStaticPaths & GetStaticProps = async ({ params, locale }) => {
  const id = params?.id as string;

  return {
    props: {
      id,
      ...(await serverSideTranslations(locale ?? 'sr', ['common', 'datasets'])),
    },
    revalidate: 60, // Revalidate every minute
  };
};

export default DatasetDetailPage;