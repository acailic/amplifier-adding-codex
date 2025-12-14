/**
 * Digital Artifact Export System
 * Premium export functionality for creating museum-quality digital artifacts
 */

// Export all types
export * from './types';

// Export specifications and presets
export * from './specifications';

// Export components
export { default as ExportManager } from './ExportManager';
export { ExportRenderer, ExportRendererComponent } from './renderer';

// Export services
export { ExportService, exportQueue, exportAnalytics, exportStorage, shareManager } from './exportService';

// Re-export commonly used items for convenience
export type {
  ExportSpecification,
  ExportPack,
  ExportJob,
  ExportMetadata,
  WatermarkConfig,
  EditionInfo,
  QualityPreset,
  ColorProfile,
  GalleryConfig,
  ShareConfig,
} from './types';

export {
  EXPORT_PACKS,
  SQUARE_FORMATS,
  VERTICAL_FORMATS,
  HORIZONTAL_FORMATS,
  PRINT_FORMATS,
  QUALITY_PRESETS,
} from './specifications';

// Utility exports
export const EXPORT_SYSTEM_VERSION = '1.0.0';
export const SUPPORTED_FORMATS = ['png', 'jpg', 'pdf', 'svg'] as const;
export const MAX_EXPORT_SIZE = 50 * 1024 * 1024; // 50MB
export const DEFAULT_DPI = 300;

// Quick access functions for common export scenarios
export const createQuickExport = async (
  chartElement: HTMLElement,
  title: string,
  format: 'png' | 'jpg' | 'pdf' = 'png'
) => {
  const metadata = {
    id: `quick_${Date.now()}`,
    title,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    dataSource: 'quick-export',
    dateRange: {
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    },
    filters: {
      categories: [],
      retailers: [],
      priceRange: [0, 100000],
    },
    chartType: 'quick-export',
    visualizationConfig: {},
    copyright: `© ${new Date().getFullYear()} Digital Artifact`,
    license: 'Creative Commons',
    attribution: {
      dataProvider: 'User',
      visualizationEngine: 'Digital Artifact Exporter',
      artist: 'Digital Artist',
    },
    technical: {
      software: 'Digital Artifact Exporter',
      version: EXPORT_SYSTEM_VERSION,
      renderTime: Date.now(),
      canvasSize: { width: 1920, height: 1080 },
      colorSpace: 'sRGB',
    },
  };

  // This would trigger the actual export process
  console.log('Creating quick export:', { title, format, metadata });
  return metadata;
};

// Gallery showcase presets for inspiration
export const GALLERY_SHOWCASE = {
  museumQuality: {
    title: 'Museum Exhibition Print',
    description: 'Archival quality prints suitable for gallery exhibitions',
    specifications: ['print-a2', 'print-a3'],
    features: ['600 DPI', 'CMYK color profile', 'Certificate of authenticity'],
  },
  digitalCollection: {
    title: 'Digital Art Collection',
    description: 'Premium digital assets for collectors and enthusiasts',
    specifications: ['square-social', 'vertical-story', 'horizontal-wide'],
    features: ['Multiple formats', 'No watermarks', 'Extended license'],
  },
  professionalPresentation: {
    title: 'Professional Presentation',
    description: 'High-quality exports for business presentations and reports',
    specifications: ['horizontal-banner', 'print-a4'],
    features: ['Corporate branding', 'Presentation layouts', 'PDF with metadata'],
  },
  socialMediaCampaign: {
    title: 'Social Media Campaign',
    description: 'Optimized formats for comprehensive social media presence',
    specifications: ['square-social', 'vertical-reel', 'horizontal-banner'],
    features: ['Platform optimization', 'Engagement tracking', 'Brand consistency'],
  },
};