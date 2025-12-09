/**
 * Datasets Page - Browse and discover datasets from data.gov.rs
 */

import React from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import MainLayout from '@/components/layout/MainLayout';
import DatasetBrowser from '@/components/onboarding/DatasetBrowser';
import { Dataset } from '@/types/datasets';
import { useRouter } from 'next/router';

interface DatasetsPageProps {
  _nextI18Next: {
    initialLocale: string;
    userConfig: any;
  };
}

const DatasetsPage: React.FC<DatasetsPageProps> = () => {
  const { t } = useTranslation('common');
  const router = useRouter();

  // Handle dataset selection
  const handleDatasetSelect = (dataset: Dataset) => {
    // Navigate to dataset detail page or open modal
    router.push(`/datasets/${encodeURIComponent(dataset.id)}`);
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('datasets:title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('datasets:subtitle')}
          </p>
        </div>

        {/* Dataset Browser */}
        <DatasetBrowser
          onDatasetSelect={handleDatasetSelect}
          pageSize={20}
          className="mb-8"
        />

        {/* Additional Information */}
        <div className="mt-12 bg-serbia-red-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-serbia-red-900 mb-4">
            {t('datasets:aboutTitle')}
          </h2>
          <div className="prose prose-serbia-red max-w-none">
            <p className="text-serbia-red-800 mb-4">
              {t('datasets:aboutDescription')}
            </p>
            <ul className="space-y-2 text-serbia-red-700">
              <li>
                <strong>{t('datasets:serbianData')}:</strong> {t('datasets:serbianDataDesc')}
              </li>
              <li>
                <strong>{t('datasets:multipleFormats')}:</strong> {t('datasets:multipleFormatsDesc')}
              </li>
              <li>
                <strong>{t('datasets:regularUpdates')}:</strong> {t('datasets:regularUpdatesDesc')}
              </li>
              <li>
                <strong>{t('datasets:openData')}:</strong> {t('datasets:openDataDesc')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom styles for Serbian theme */}
      <style jsx global>{`
        .prose-serbia-red {
          color: #991b1b;
        }

        .prose-serbia-red strong {
          color: #7f1d1d;
        }
      `}</style>
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

export default DatasetsPage;