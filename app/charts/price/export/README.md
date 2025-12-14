# Digital Artifact Export System

A comprehensive premium export system that transforms data visualizations into museum-quality digital artifacts, suitable for galleries, collectors, and professional presentations.

## Overview

The export system goes beyond traditional data export functionality by treating charts as digital art. It provides museum-quality rendering, multiple format specifications, and a gallery-like purchasing experience that makes users proud to share their visualizations.

## Key Features

### 🎨 **Museum-Quality Rendering**
- **High-Resolution Output**: 72 DPI to 1200 DPI for archival quality
- **Professional Color Profiles**: sRGB, DisplayP3, AdobeRGB, CMYK
- **Premium Typography**: Museum-quality layout and typography
- **Artist Signatures**: Digital signatures and edition numbering for premium prints

### 📦 **Curated Export Packs**
- **Social Media Starter**: Free pack with essential social media formats
- **Creator Collection**: Professional pack for content creators ($9.99)
- **Gallery Artist Edition**: Museum-quality prints for galleries ($49.99)
- **Ultimate Collector**: Complete collection with lifetime updates ($99.99)

### 🎯 **Format Specifications**
- **Square Formats** (1080x1080 to 300mm): Avatars, social posts, art prints
- **Vertical Formats** (1080x1920 to A4): Stories, phone wallpapers, posters
- **Horizontal Formats** (1920x1080 to A3): Banners, wallpapers, landscape prints
- **Print Formats** (A2-A4 to poster sizes): Gallery exhibitions, archival prints

### 💎 **Premium Features**
- **No Watermarks**: Clean exports for professional use
- **Extended Licenses**: Commercial use and redistribution rights
- **Certificate of Authenticity**: NFT-ready metadata and provenance
- **Color Variations**: Multiple color themes and style options
- **Priority Support**: Dedicated assistance for premium users

## Quick Start

### Basic Usage

```tsx
import { ExportManager } from './export';
import { ExportMetadata } from './export/types';

// Create metadata for your chart
const metadata: ExportMetadata = {
  id: 'my-chart-001',
  title: 'Price Analysis Dashboard',
  description: 'Comprehensive price trends across retailers',
  created: new Date().toISOString(),
  dataSource: 'data.gov.rs',
  // ... other metadata fields
};

// Use the ExportManager component
<ExportManager
  open={showExport}
  onClose={() => setShowExport(false)}
  chartData={data}
  metadata={metadata}
  onExportComplete={handleExportComplete}
/>
```

### Integration with Price Dashboard

The export system is already integrated into the PriceDashboard component. Users can access the Digital Art Gallery from the export menu:

```tsx
// Access via the dropdown menu
<Menu>
  <MenuItem onClick={handleCSVExport}>Export CSV</MenuItem>
  <MenuItem onClick={handleJSONExport}>Export JSON</MenuItem>
  <Divider />
  <MenuItem onClick={() => setShowExportGallery(true)}>
    Digital Art Gallery {/* Premium option */}
  </MenuItem>
</Menu>
```

## Export Packs

### Free Pack - Social Media Starter
- **Formats**: Avatar, Social Post, Story, Banner
- **Quality**: Social media optimized (150 DPI)
- **Features**: Subtle watermarks, basic metadata
- **Price**: Free

### Pro Pack - Creator Collection ($9.99)
- **Formats**: 6 premium formats including print-ready
- **Quality**: Print quality (300 DPI)
- **Features**: No watermarks, extended license, color variations
- **Bonus**: Priority support

### Gallery Pack - Artist Edition ($49.99)
- **Formats**: Archival quality prints (A2-A4)
- **Quality**: Gallery quality (600 DPI)
- **Features**: CMYK color profile, certificate of authenticity
- **Bonus**: Artist signature, edition numbering, physical print option

### Ultimate Pack - Collector ($99.99)
- **Formats**: All formats included
- **Quality**: Ultra high resolution (1200 DPI)
- **Features**: NFT-ready, multiple color profiles, lifetime updates
- **Bonus**: Private gallery access, 1-on-1 consultation

## Technical Architecture

### Export Pipeline

```typescript
// Export job creation
const job = await ExportService.createExportJob(
  'gallery-artist',     // Pack ID
  metadata,            // Chart metadata
  customizations,      // Style customizations
  watermarkConfig      // Watermark settings
);

// Export processing
await exportQueue.add(job);

// Completion handling
job.onComplete = (completedJob) => {
  console.log('Export ready:', completedJob.output.downloadUrl);
};
```

### Quality Tiers

| Tier | DPI | Use Case | Color Profile |
|------|-----|----------|---------------|
| Web | 72 | Screen viewing | sRGB |
| Social | 150 | Social media | sRGB |
| Print | 300 | Standard prints | sRGB/CMYK |
| Gallery | 600 | Gallery exhibitions | CMYK |
| Ultra | 1200 | Archival quality | CMYK |

### Color Profiles

- **sRGB**: Standard web color space
- **DisplayP3**: Wide gamut for modern displays
- **AdobeRGB**: Professional photography
- **CMYK**: Print production
- **Grayscale**: Monochrome prints

## API Reference

### ExportManager Component

```tsx
interface ExportManagerProps {
  open: boolean;                    // Show/hide dialog
  onClose: () => void;              // Close handler
  chartData: any;                   // Chart data to export
  metadata: ExportMetadata;         // Export metadata
  onExportComplete: (job: ExportJob) => void;  // Completion handler
}
```

### ExportService

```typescript
// Create export job
export async createExportJob(
  packId: string,
  metadata: ExportMetadata,
  customizations: any,
  watermark: WatermarkConfig
): Promise<ExportJob>

// Get export status
export async getExportJob(id: string): Promise<ExportJob | null>

// Get user exports
export async getUserExports(userId?: string): Promise<ExportJob[]>

// Create share link
export async createShareLink(
  jobId: string,
  config: ShareConfig
): Promise<string>
```

### Export Types

```typescript
// Export specification
interface ExportSpecification {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  dimensions: { width: number; height: number; unit: 'px' | 'mm' | 'in' };
  resolution: { dpi: number; quality: QualityPreset };
  colorProfile: ColorProfile;
  formats: ExportFormat[];
}

// Export metadata
interface ExportMetadata {
  id: string;
  title: string;
  description: string;
  created: string;
  dataSource: string;
  chartType: string;
  editionInfo?: EditionInfo;
  attribution: AttributionInfo;
}
```

## Customization Options

### Visual Styles

- **Color Themes**: Light, Dark, Auto
- **Typography**: Modern, Classic, Minimal
- **Layout**: Centered, Edge, Dynamic
- **Watermarks**: Subtle, Integrated, Corner, None

### Metadata Customization

- **Title & Description**: Custom titles and descriptions
- **Attribution**: Artist credits and data sources
- **Copyright**: Custom copyright notices
- **License**: Creative Commons or custom licenses

### Edition Control

- **Limited Editions**: Numbered editions (1/100, 2/100, etc.)
- **Artist Signatures**: Digital signatures with timestamps
- **Certificates**: PDF certificates of authenticity
- **Blockchain**: NFT-ready metadata for Web3 integration

## Best Practices

### For Optimal Export Quality

1. **Use High-Resolution Data**: Ensure your source data is clean and comprehensive
2. **Choose Appropriate Formats**: Select formats that match your use case
3. **Customize Metadata**: Add meaningful titles and descriptions
4. **Test Previews**: Always review previews before final export
5. **Consider Color Profiles**: Use CMYK for print, sRGB for digital

### For Gallery Exhibitions

1. **Use Gallery Pack**: Includes archival quality and certificates
2. **Set Edition Numbers**: Create limited editions for exclusivity
3. **Include Artist Statement**: Add context about the visualization
4. **Print Verification**: Order test prints before final production
5. **Document Provenance**: Keep detailed records of creation process

## Performance Considerations

### Export Processing

- **Queue Management**: Exports are processed in parallel queues
- **Resource Limits**: Maximum 3 concurrent exports
- **File Size Limits**: 50MB per export, 500MB for batch exports
- **Retention**: Files stored for 30 days by default

### Optimization Tips

- **Choose Appropriate Quality**: Higher DPI = larger files and slower processing
- **Batch Exports**: Process multiple formats together for efficiency
- **Preview First**: Use preview mode to verify before full export
- **Clean Metadata**: Remove unnecessary data to reduce file size

## Integration Examples

### Custom Export Button

```tsx
const CustomExportButton = ({ data, metadata }) => {
  const [showGallery, setShowGallery] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<ImageIcon />}
        onClick={() => setShowGallery(true)}
      >
        Create Digital Art
      </Button>

      <ExportManager
        open={showGallery}
        onClose={() => setShowGallery(false)}
        chartData={data}
        metadata={metadata}
        onExportComplete={(job) => {
          toast.success('Export completed successfully!');
        }}
      />
    </>
  );
};
```

### Batch Export Processing

```tsx
const handleBatchExport = async (charts: ChartData[]) => {
  const jobIds = await Promise.all(
    charts.map(chart =>
      ExportService.createExportJob(
        'creator-collection',
        createMetadata(chart),
        getDefaultCustomizations(),
        getDefaultWatermark()
      )
    )
  );

  // Track progress
  const jobs = await Promise.all(
    jobIds.map(id => ExportService.getExportJob(id))
  );

  return jobs;
};
```

## Troubleshooting

### Common Issues

1. **Export Failed**: Check chart data validity and metadata completeness
2. **Poor Quality**: Ensure appropriate DPI and format selection
3. **Large File Size**: Consider reducing complexity or choosing lower quality
4. **Watermark Issues**: Verify watermark settings for free vs pro versions

### Error Messages

- `Export pack not found`: Verify pack ID is correct
- `Invalid metadata`: Check required metadata fields
- `Processing timeout`: Try reducing complexity or file size
- `Storage error`: Contact support for storage issues

## Support

For premium users, dedicated support is available via:
- Email: support@digitalartifact.gallery
- Discord: https://discord.gg/digitalartifacts
- Documentation: https://docs.digitalartifact.gallery

## License

This export system is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License. Commercial use requires a premium license.

## Roadmap

### Upcoming Features

- **NFT Integration**: Direct minting to blockchain platforms
- **Physical Print Partners**: Integration with professional printing services
- **Advanced Analytics**: Export usage and engagement tracking
- **API Access**: REST API for programmatic export generation
- **Collaborative Galleries**: Shared gallery spaces for teams

### Future Enhancements

- **AI-Powered Styling**: Automatic style recommendations
- **Interactive Exports**: Embeddable interactive visualizations
- **Augmented Reality**: AR viewing for exported artifacts
- **Marketplace Integration**: Direct selling on NFT marketplaces

---

**Transform your data into art. Share with pride.** 🎨