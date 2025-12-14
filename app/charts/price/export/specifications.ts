/**
 * Export specifications for different artifact formats
 * Each specification defines the quality and characteristics for a specific use case
 */

import { ExportSpecification, QualityPreset, ExportPack, AspectRatio } from './types';

// Core quality presets with their technical specifications
export const QUALITY_PRESETS: Record<QualityPreset, ExportSpecification['resolution']> = {
  web: {
    dpi: 72,
    quality: 'web'
  },
  social: {
    dpi: 150,
    quality: 'social'
  },
  print: {
    dpi: 300,
    quality: 'print'
  },
  gallery: {
    dpi: 600,
    quality: 'gallery'
  },
  ultra: {
    dpi: 1200,
    quality: 'ultra'
  }
};

// Format specifications for each aspect ratio
export const SQUARE_FORMATS: ExportSpecification[] = [
  {
    id: 'square-avatar',
    name: 'Avatar & Profile',
    description: 'Perfect for social media avatars and profile pictures',
    aspectRatio: 'square',
    dimensions: { width: 1080, height: 1080, unit: 'px' },
    resolution: QUALITY_PRESETS.social,
    colorProfile: 'sRGB',
    formats: ['png', 'jpg'],
    useCases: ['Instagram avatar', 'Twitter profile', 'Discord avatar', 'Forum signature'],
    price: 0
  },
  {
    id: 'square-social',
    name: 'Social Media Post',
    description: 'Optimized for Instagram and Facebook posts',
    aspectRatio: 'square',
    dimensions: { width: 2048, height: 2048, unit: 'px' },
    resolution: QUALITY_PRESETS.social,
    colorProfile: 'sRGB',
    formats: ['png', 'jpg'],
    useCases: ['Instagram post', 'Facebook post', 'LinkedIn post'],
    price: 0
  },
  {
    id: 'square-print',
    name: 'Square Art Print',
    description: 'Gallery-quality square prints',
    aspectRatio: 'square',
    dimensions: { width: 300, height: 300, unit: 'mm' },
    resolution: QUALITY_PRESETS.print,
    colorProfile: 'CMYK',
    formats: ['pdf', 'png'],
    useCases: ['Art prints', 'Gallery exhibitions', 'Portfolio prints'],
    price: 4.99
  }
];

export const VERTICAL_FORMATS: ExportSpecification[] = [
  {
    id: 'vertical-story',
    name: 'Instagram Story',
    description: 'Full-screen stories with optimal resolution',
    aspectRatio: 'vertical',
    dimensions: { width: 1080, height: 1920, unit: 'px' },
    resolution: QUALITY_PRESETS.social,
    colorProfile: 'sRGB',
    formats: ['png', 'jpg'],
    useCases: ['Instagram Stories', 'WhatsApp Status', 'Facebook Stories'],
    price: 0
  },
  {
    id: 'vertical-reel',
    name: 'Instagram Reel Cover',
    description: 'High-quality covers for video content',
    aspectRatio: 'vertical',
    dimensions: { width: 1080, height: 1350, unit: 'px' },
    resolution: QUALITY_PRESETS.social,
    colorProfile: 'sRGB',
    formats: ['png', 'jpg'],
    useCases: ['Instagram Reels', 'TikTok covers', 'YouTube Shorts'],
    price: 0
  },
  {
    id: 'vertical-phone',
    name: 'Phone Wallpaper',
    description: 'Premium phone wallpapers for all devices',
    aspectRatio: 'vertical',
    dimensions: { width: 1170, height: 2532, unit: 'px' },
    resolution: QUALITY_PRESETS.social,
    colorProfile: 'DisplayP3',
    formats: ['png', 'jpg'],
    useCases: ['iPhone wallpaper', 'Android wallpaper', 'Lock screen'],
    price: 1.99
  },
  {
    id: 'vertical-poster',
    name: 'Vertical Poster',
    description: 'Museum-quality vertical posters',
    aspectRatio: 'vertical',
    dimensions: { width: 210, height: 297, unit: 'mm' }, // A4
    resolution: QUALITY_PRESETS.gallery,
    colorProfile: 'CMYK',
    formats: ['pdf', 'png', 'svg'],
    useCases: ['Art exhibitions', 'Gallery posters', 'Academic presentations'],
    price: 9.99
  }
];

export const HORIZONTAL_FORMATS: ExportSpecification[] = [
  {
    id: 'horizontal-banner',
    name: 'Web Banner',
    description: 'Optimized for website headers and banners',
    aspectRatio: 'horizontal',
    dimensions: { width: 1920, height: 1080, unit: 'px' },
    resolution: QUALITY_PRESETS.web,
    colorProfile: 'sRGB',
    formats: ['png', 'jpg'],
    useCases: ['Website header', 'YouTube banner', 'LinkedIn cover'],
    price: 0
  },
  {
    id: 'horizontal-wide',
    name: 'Wide Banner',
    description: 'Extra-wide format for panoramic displays',
    aspectRatio: 'horizontal',
    dimensions: { width: 2560, height: 1080, unit: 'px' },
    resolution: QUALITY_PRESETS.social,
    colorProfile: 'sRGB',
    formats: ['png', 'jpg'],
    useCases: ['Desktop wallpaper', 'Presentation header', 'Event backdrop'],
    price: 2.99
  },
  {
    id: 'horizontal-print',
    name: 'Landscape Print',
    description: 'Gallery-quality landscape prints',
    aspectRatio: 'horizontal',
    dimensions: { width: 420, height: 297, unit: 'mm' }, // A3 landscape
    resolution: QUALITY_PRESETS.gallery,
    colorProfile: 'CMYK',
    formats: ['pdf', 'png', 'svg'],
    useCases: ['Landscape photography', 'Gallery displays', 'Corporate art'],
    price: 12.99
  }
];

export const PRINT_FORMATS: ExportSpecification[] = [
  {
    id: 'print-a4',
    name: 'A4 Art Print',
    description: 'Standard A4 museum-quality print',
    aspectRatio: 'print',
    dimensions: { width: 210, height: 297, unit: 'mm' }, // A4
    resolution: QUALITY_PRESETS.gallery,
    colorProfile: 'CMYK',
    formats: ['pdf', 'png'],
    useCases: ['Portfolio prints', 'Gallery sales', 'Art exhibitions'],
    price: 7.99
  },
  {
    id: 'print-a3',
    name: 'A3 Art Print',
    description: 'Large A3 gallery-quality print',
    aspectRatio: 'print',
    dimensions: { width: 297, height: 420, unit: 'mm' }, // A3
    resolution: QUALITY_PRESETS.gallery,
    colorProfile: 'CMYK',
    formats: ['pdf', 'png'],
    useCases: ['Gallery exhibitions', 'Large art displays', 'Corporate art'],
    price: 14.99
  },
  {
    id: 'print-a2',
    name: 'A2 Art Print',
    description: 'Museum-quality large format print',
    aspectRatio: 'print',
    dimensions: { width: 420, height: 594, unit: 'mm' }, // A2
    resolution: QUALITY_PRESETS.gallery,
    colorProfile: 'CMYK',
    formats: ['pdf', 'png'],
    useCases: ['Museum exhibitions', 'Gallery installations', 'Premium art sales'],
    price: 29.99
  },
  {
    id: 'print-poster',
    name: 'Poster Size',
    description: 'Large poster format for exhibitions',
    aspectRatio: 'print',
    dimensions: { width: 594, height: 841, unit: 'mm' }, // A1
    resolution: QUALITY_PRESETS.print,
    colorProfile: 'CMYK',
    formats: ['pdf'],
    useCases: ['Poster exhibitions', 'Event displays', 'Art festivals'],
    price: 39.99
  }
];

// Export packs combining multiple specifications
export const EXPORT_PACKS: ExportPack[] = [
  {
    id: 'free-social',
    name: 'Social Media Starter',
    description: 'Perfect for sharing on social media',
    isPro: false,
    price: 0,
    specifications: [
      SQUARE_FORMATS[0], // Avatar
      SQUARE_FORMATS[1], // Social Post
      VERTICAL_FORMATS[0], // Story
      HORIZONTAL_FORMATS[0], // Banner
    ],
    features: [
      '3 high-quality formats',
      'Optimized for social media',
      'Subtle watermark',
      'Instant download',
      'Basic metadata'
    ],
    deliveryFormat: 'download'
  },
  {
    id: 'pro-creator',
    name: 'Creator Collection',
    description: 'Professional pack for content creators',
    isPro: true,
    price: 9.99,
    specifications: [
      SQUARE_FORMATS[1], // Social Post
      SQUARE_FORMATS[2], // Square Print
      VERTICAL_FORMATS[1], // Reel Cover
      VERTICAL_FORMATS[2], // Phone Wallpaper
      HORIZONTAL_FORMATS[1], // Wide Banner
      PRINT_FORMATS[0], // A4 Print
    ],
    features: [
      '6 premium formats',
      'No watermark',
      'Extended license',
      'Full metadata',
      'Color variations',
      'Priority support'
    ],
    deliveryFormat: 'zip'
  },
  {
    id: 'gallery-artist',
    name: 'Gallery Artist Edition',
    description: 'Museum-quality prints for galleries and exhibitions',
    isPro: true,
    price: 49.99,
    specifications: [
      PRINT_FORMATS[0], // A4 Print
      PRINT_FORMATS[1], // A3 Print
      PRINT_FORMATS[2], // A2 Print
      PRINT_FORMATS[3], // Poster
    ],
    features: [
      '4 archival quality prints',
      '600 DPI resolution',
      'CMYK color profile',
      'Certificate of authenticity',
      'Edition numbering',
      'Artist signature',
      'Unlimited rights',
      'Physical print option'
    ],
    deliveryFormat: 'zip'
  },
  {
    id: 'ultimate-collector',
    name: 'Ultimate Collector',
    description: 'Complete collection for serious collectors and galleries',
    isPro: true,
    price: 99.99,
    specifications: [
      ...SQUARE_FORMATS,
      ...VERTICAL_FORMATS,
      ...HORIZONTAL_FORMATS,
      ...PRINT_FORMATS
    ],
    features: [
      'All formats included',
      '1200 DPI ultra quality',
      'Multiple color profiles',
      'NFT-ready formats',
      'Physical print bundle',
      'Private gallery access',
      'Lifetime updates',
      '1-on-1 consultation'
    ],
    deliveryFormat: 'cloud'
  }
];

// Helper functions for getting specifications
export function getSpecificationsByAspectRatio(aspectRatio: AspectRatio): ExportSpecification[] {
  switch (aspectRatio) {
    case 'square':
      return SQUARE_FORMATS;
    case 'vertical':
      return VERTICAL_FORMATS;
    case 'horizontal':
      return HORIZONTAL_FORMATS;
    case 'print':
      return PRINT_FORMATS;
    default:
      return [];
  }
}

export function getSpecificationById(id: string): ExportSpecification | undefined {
  const allSpecs = [...SQUARE_FORMATS, ...VERTICAL_FORMATS, ...HORIZONTAL_FORMATS, ...PRINT_FORMATS];
  return allSpecs.find(spec => spec.id === id);
}

export function getPackById(id: string): ExportPack | undefined {
  return EXPORT_PACKS.find(pack => pack.id === id);
}

export function getFreeSpecs(): ExportSpecification[] {
  const allSpecs = [...SQUARE_FORMATS, ...VERTICAL_FORMATS, ...HORIZONTAL_FORMATS, ...PRINT_FORMATS];
  return allSpecs.filter(spec => spec.price === 0);
}

export function getProSpecs(): ExportSpecification[] {
  const allSpecs = [...SQUARE_FORMATS, ...VERTICAL_FORMATS, ...HORIZONTAL_FORMATS, ...PRINT_FORMATS];
  return allSpecs.filter(spec => spec.price > 0);
}

// DPI and quality conversion utilities
export function getDimensionsForDPI(
  baseWidth: number,
  baseHeight: number,
  targetDPI: number,
  baseUnit: 'px' | 'mm' | 'in' = 'px'
): { width: number; height: number; unit: 'px' | 'mm' | 'in' } {
  if (baseUnit === 'px') {
    // Converting from pixels to physical dimensions
    const mmWidth = (baseWidth / 96) * 25.4; // Assuming 96 DPI as base
    const mmHeight = (baseHeight / 96) * 25.4;
    const pxWidth = (mmWidth * targetDPI) / 25.4;
    const pxHeight = (mmHeight * targetDPI) / 25.4;
    return { width: Math.round(pxWidth), height: Math.round(pxHeight), unit: 'px' };
  } else if (baseUnit === 'mm') {
    // Converting from mm to pixels at target DPI
    const pxWidth = (baseWidth * targetDPI) / 25.4;
    const pxHeight = (baseHeight * targetDPI) / 25.4;
    return { width: Math.round(pxWidth), height: Math.round(pxHeight), unit: 'px' };
  } else {
    // Inches to pixels
    return {
      width: Math.round(baseWidth * targetDPI),
      height: Math.round(baseHeight * targetDPI),
      unit: 'px'
    };
  }
}

// File size estimates for different qualities and formats
export function estimateFileSize(
  width: number,
  height: number,
  format: 'png' | 'jpg' | 'pdf' | 'svg',
  quality: QualityPreset,
  complexity: 'simple' | 'medium' | 'complex' = 'medium'
): number {
  const pixels = width * height;
  const mp = pixels / 1000000; // Megapixels

  let baseSize = 0;

  switch (format) {
    case 'png':
      // PNG: lossless, size depends on complexity
      baseSize = mp * (complexity === 'simple' ? 3 : complexity === 'medium' ? 8 : 15);
      break;
    case 'jpg':
      // JPG: compressed, size depends on quality
      baseSize = mp * (quality === 'web' ? 0.5 : quality === 'social' ? 1.5 : quality === 'print' ? 3 : 6);
      break;
    case 'pdf':
      // PDF: vector-based, relatively small
      baseSize = mp * 0.8;
      break;
    case 'svg':
      // SVG: vector, very small
      baseSize = 0.2;
      break;
  }

  return Math.round(baseSize * 1024 * 1024); // Convert to bytes
}