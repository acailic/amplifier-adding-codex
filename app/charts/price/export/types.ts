/**
 * Type definitions for premium digital artifact export system
 */

// Base export formats and dimensions
export type ExportFormat = 'png' | 'jpg' | 'pdf' | 'svg';

export type AspectRatio = 'square' | 'vertical' | 'horizontal' | 'print';

export type PrintSize = 'A2' | 'A3' | 'A4' | 'poster' | 'custom';

// Quality presets for different use cases
export type QualityPreset =
  | 'web'           // 72 DPI, optimized for web
  | 'social'        // 150 DPI, optimized for social media
  | 'print'         // 300 DPI, print quality
  | 'gallery'       // 600 DPI, museum quality
  | 'ultra'         // 1200 DPI, archival quality;

// Color profiles for different media
export type ColorProfile =
  | 'sRGB'          // Standard web
  | 'DisplayP3'     // Wide gamut displays
  | 'AdobeRGB'      // Professional photography
  | 'CMYK'          // Print production
  | 'Grayscale'     // Monochrome;

// Edition and provenance
export interface EditionInfo {
  editionNumber: number;
  editionSize: number;
  isLimited: boolean;
  signatureDate: string;
  artistName: string;
  certificateId: string;
}

// Watermark configuration
export interface WatermarkConfig {
  enabled: boolean;
  type: 'subtle' | 'integrated' | 'corner' | 'none';
  opacity: number; // 0-100
  position?: 'bottom-right' | 'bottom-left' | 'center' | 'top-right';
  text?: string;
  logo?: string;
}

// Export specifications for each format
export interface ExportSpecification {
  id: string;
  name: string;
  description: string;
  aspectRatio: AspectRatio;
  dimensions: {
    width: number;
    height: number;
    unit: 'px' | 'mm' | 'in';
  };
  resolution: {
    dpi: number;
    quality: QualityPreset;
  };
  colorProfile: ColorProfile;
  formats: ExportFormat[];
  useCases: string[];
  price?: number; // For pro versions
}

// Export pack configuration
export interface ExportPack {
  id: string;
  name: string;
  description: string;
  isPro: boolean;
  price: number;
  specifications: ExportSpecification[];
  features: string[];
  previewImage?: string;
  deliveryFormat: 'zip' | 'download' | 'cloud';
}

// Metadata for provenance tracking
export interface ExportMetadata {
  id: string;
  title: string;
  description: string;
  created: string;
  modified: string;
  dataSource: string;
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    categories: string[];
    retailers: string[];
    priceRange: [number, number];
  };
  chartType: string;
  visualizationConfig: any;
  editionInfo?: EditionInfo;
  copyright: string;
  license: string;
  attribution: {
    dataProvider: string;
    visualizationEngine: string;
    artist: string;
  };
  technical: {
    software: string;
    version: string;
    renderTime: number;
    canvasSize: { width: number; height: number };
    colorSpace: string;
  };
}

// Export job configuration
export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  packId: string;
  specifications: ExportSpecification[];
  metadata: ExportMetadata;
  watermark: WatermarkConfig;
  customizations: {
    title?: string;
    subtitle?: string;
    colorTheme?: 'light' | 'dark' | 'auto';
    typography?: 'modern' | 'classic' | 'minimal';
    layout?: 'centered' | 'edge' | 'dynamic';
  };
  output: {
    files: ExportedFile[];
    totalSize: number;
    downloadUrl?: string;
    shareUrl?: string;
  };
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// Individual exported file
export interface ExportedFile {
  filename: string;
  format: ExportFormat;
  size: number;
  url: string;
  checksum: string;
  metadata: Partial<ExportMetadata>;
}

// Preview generation
export interface PreviewConfig {
  enabled: boolean;
  size: 'thumbnail' | 'medium' | 'large';
  format: ExportFormat;
  quality: number; // 1-100
  watermark: boolean;
}

// Batch export configuration
export interface BatchExportConfig {
  jobs: ExportJob[];
  parallel: boolean;
  maxConcurrent: number;
  notifyOnComplete: boolean;
  compressOutput: boolean;
}

// Export analytics
export interface ExportAnalytics {
  totalExports: number;
  formatDistribution: Record<ExportFormat, number>;
  qualityDistribution: Record<QualityPreset, number>;
  popularPacks: Array<{ packId: string; count: number }>;
  averageRenderTime: number;
  errorRate: number;
  userSatisfaction: number;
}

// Gallery/Presentation mode
export interface GalleryConfig {
  theme: 'minimal' | 'elegant' | 'modern' | 'artistic';
  layout: 'grid' | 'masonry' | 'carousel' | 'slideshow';
  showMetadata: boolean;
  showPricing: boolean;
  enableSharing: boolean;
  customBranding?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
      background: string;
    };
  };
}

// Share configuration
export interface ShareConfig {
  enabled: boolean;
  platforms: ('link' | 'social' | 'email' | 'qr')[];
  expiration?: string; // ISO date
  password?: string;
  allowDownload: boolean;
  watermark?: WatermarkConfig;
}