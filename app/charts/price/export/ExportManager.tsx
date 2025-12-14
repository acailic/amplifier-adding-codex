/**
 * Export Manager - Gallery-style interface for exporting premium digital artifacts
 * Provides a high-end gallery experience for selecting and purchasing export packs
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Check as CheckIcon,
  Lock as LockIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  PhotoSizeSelectLarge as SizeIcon,
  FilterVintage as FilterIcon,
  Brush as BrushIcon,
  Info as InfoIcon,
  Payment as PaymentIcon,
  CloudUpload as CloudIcon,
  GetApp as GetAppIcon,
  Share as ShareIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';

import {
  ExportPack,
  ExportSpecification,
  ExportJob,
  ExportMetadata,
  WatermarkConfig,
  EditionInfo,
  GalleryConfig,
  ShareConfig,
} from './types';
import { EXPORT_PACKS, getSpecificationById } from './specifications';
import { ExportRendererComponent } from './renderer';

interface ExportManagerProps {
  open: boolean;
  onClose: () => void;
  chartData: any;
  metadata: ExportMetadata;
  onExportComplete: (job: ExportJob) => void;
}

interface PackSelection {
  pack: ExportPack;
  specifications: ExportSpecification[];
  customizations: {
    title?: string;
    subtitle?: string;
    colorTheme: 'light' | 'dark' | 'auto';
    typography: 'modern' | 'classic' | 'minimal';
    layout: 'centered' | 'edge' | 'dynamic';
  };
  watermark: WatermarkConfig;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  open,
  onClose,
  chartData,
  metadata,
  onExportComplete,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPack, setSelectedPack] = useState<PackSelection | null>(null);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewSpec, setPreviewSpec] = useState<ExportSpecification | null>(null);
  const [galleryView, setGalleryView] = useState<'grid' | 'masonry'>('grid');

  const steps = ['Gallery', 'Customize', 'Preview', 'Payment & Export'];

  const handleStepChange = (step: number) => {
    if (step <= activeStep || (step === activeStep + 1 && selectedPack)) {
      setActiveStep(step);
    }
  };

  const handlePackSelection = (pack: ExportPack) => {
    setSelectedPack({
      pack,
      specifications: pack.specifications,
      customizations: {
        title: metadata.title,
        subtitle: metadata.description,
        colorTheme: 'auto',
        typography: 'modern',
        layout: 'centered',
      },
      watermark: pack.isPro
        ? { enabled: false, type: 'none', opacity: 0 }
        : { enabled: true, type: 'subtle', opacity: 10, text: 'Free Version' },
    });
    setActiveStep(1);
  };

  const handleExport = async () => {
    if (!selectedPack) return;

    setIsProcessing(true);

    try {
      const jobs: ExportJob[] = selectedPack.specifications.map((spec, index) => ({
        id: `export_${Date.now()}_${index}`,
        status: 'pending' as const,
        progress: 0,
        packId: selectedPack.pack.id,
        specifications: [spec],
        metadata: {
          ...metadata,
          title: selectedPack.customizations.title || metadata.title,
          description: selectedPack.customizations.subtitle || metadata.description,
          editionInfo: selectedPack.pack.isPro ? {
            editionNumber: 1,
            editionSize: 100,
            isLimited: true,
            signatureDate: new Date().toISOString(),
            artistName: 'Digital Artist',
            certificateId: `CERT_${Date.now()}`,
          } : undefined,
        },
        watermark: selectedPack.watermark,
        customizations: selectedPack.customizations,
        output: {
          files: [],
          totalSize: 0,
        },
        createdAt: new Date().toISOString(),
      }));

      setExportJobs(jobs);

      // Process each export job
      for (const job of jobs) {
        const updatedJob = { ...job, status: 'processing' as const };
        setExportJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));

        // Simulate export processing
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setExportJobs(prev =>
            prev.map(j =>
              j.id === job.id ? { ...j, progress } : j
            )
          );
        }

        // Complete the job
        const completedJob = {
          ...updatedJob,
          status: 'completed' as const,
          completedAt: new Date().toISOString(),
          progress: 100,
        };

        setExportJobs(prev =>
          prev.map(j => j.id === job.id ? completedJob : j)
        );

        onExportComplete(completedJob);
      }

      setActiveStep(3);

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderGalleryStep = () => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 300, mb: 4 }}>
        Digital Art Gallery
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Choose from our curated collection of premium export packs. Each pack is carefully crafted to showcase your data as museum-quality digital artifacts.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {EXPORT_PACKS.map((pack) => (
          <Grid item xs={12} md={6} lg={4} key={pack.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedPack?.pack.id === pack.id ? 2 : 1,
                borderColor: selectedPack?.pack.id === pack.id ? 'primary.main' : 'divider',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={() => handlePackSelection(pack)}
            >
              {pack.isPro && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                  <Chip
                    icon={<StarIcon />}
                    label="PRO"
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              )}

              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <ImageIcon sx={{ fontSize: 64, color: 'white', opacity: 0.8 }} />
                {pack.isPro && (
                  <Avatar sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'white', width: 32, height: 32 }}>
                    <LockIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  </Avatar>
                )}
              </CardMedia>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {pack.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pack.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {pack.specifications.length} formats included
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {pack.specifications.slice(0, 3).map((spec) => (
                    <Chip
                      key={spec.id}
                      label={spec.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {pack.specifications.length > 3 && (
                    <Chip
                      label={`+${pack.specifications.length - 3} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {pack.price === 0 ? 'Free' : `$${pack.price}`}
                  </Typography>
                  <Button
                    variant={selectedPack?.pack.id === pack.id ? 'contained' : 'outlined'}
                    size="small"
                    endIcon={<CheckIcon />}
                  >
                    {selectedPack?.pack.id === pack.id ? 'Selected' : 'Choose'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quality Assurance
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaletteIcon color="primary" />
              <Typography variant="body2">
                Color-accurate rendering
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SizeIcon color="primary" />
              <Typography variant="body2">
                Multiple size options
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon color="primary" />
              <Typography variant="body2">
                Premium watermarks
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BrushIcon color="primary" />
              <Typography variant="body2">
                Artist quality output
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  const renderCustomizeStep = () => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 300, mb: 4 }}>
        Customize Your Artifact
      </Typography>

      {selectedPack && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Selected Pack: {selectedPack.pack.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedPack.pack.description}
              </Typography>
            </Box>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Content & Metadata</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={selectedPack.customizations.title || ''}
                      onChange={(e) => setSelectedPack({
                        ...selectedPack,
                        customizations: {
                          ...selectedPack.customizations,
                          title: e.target.value,
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subtitle/Description"
                      multiline
                      rows={3}
                      value={selectedPack.customizations.subtitle || ''}
                      onChange={(e) => setSelectedPack({
                        ...selectedPack,
                        customizations: {
                          ...selectedPack.customizations,
                          subtitle: e.target.value,
                        }
                      })}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Visual Style</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Color Theme</InputLabel>
                      <Select
                        value={selectedPack.customizations.colorTheme}
                        onChange={(e) => setSelectedPack({
                          ...selectedPack,
                          customizations: {
                            ...selectedPack.customizations,
                            colorTheme: e.target.value as any,
                          }
                        })}
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="auto">Auto</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Typography</InputLabel>
                      <Select
                        value={selectedPack.customizations.typography}
                        onChange={(e) => setSelectedPack({
                          ...selectedPack,
                          customizations: {
                            ...selectedPack.customizations,
                            typography: e.target.value as any,
                          }
                        })}
                      >
                        <MenuItem value="modern">Modern</MenuItem>
                        <MenuItem value="classic">Classic</MenuItem>
                        <MenuItem value="minimal">Minimal</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Layout</InputLabel>
                      <Select
                        value={selectedPack.customizations.layout}
                        onChange={(e) => setSelectedPack({
                          ...selectedPack,
                          customizations: {
                            ...selectedPack.customizations,
                            layout: e.target.value as any,
                          }
                        })}
                      >
                        <MenuItem value="centered">Centered</MenuItem>
                        <MenuItem value="edge">Edge</MenuItem>
                        <MenuItem value="dynamic">Dynamic</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {!selectedPack.pack.isPro && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Watermark</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedPack.watermark.enabled}
                        onChange={(e) => setSelectedPack({
                          ...selectedPack,
                          watermark: {
                            ...selectedPack.watermark,
                            enabled: e.target.checked,
                          }
                        })}
                      />
                    }
                    label="Include watermark"
                  />
                  {selectedPack.watermark.enabled && (
                    <Box sx={{ mt: 2, ml: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Watermarks are automatically applied to free versions to protect the artwork while maintaining visual appeal.
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Export Formats
                </Typography>
                <List dense>
                  {selectedPack.specifications.map((spec) => (
                    <ListItem key={spec.id}>
                      <ListItemIcon>
                        <ImageIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={spec.name}
                        secondary={`${spec.dimensions.width}x${spec.dimensions.height} ${spec.dimensions.unit}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {selectedPack.pack.isPro && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Pro Features Included:
                </Typography>
                <List dense>
                  {selectedPack.pack.features.map((feature, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderPreviewStep = () => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 300, mb: 4 }}>
        Preview Your Digital Artifact
      </Typography>

      {selectedPack && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Typography variant="h6" color="text.secondary">
                  Chart preview would be rendered here
                </Typography>
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => setPreviewSpec(selectedPack.specifications[0])}
                >
                  <PreviewIcon />
                </IconButton>
              </Box>
            </Card>

            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
              {selectedPack.specifications.map((spec) => (
                <Button
                  key={spec.id}
                  variant={previewSpec?.id === spec.id ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setPreviewSpec(spec)}
                >
                  {spec.name}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Export Summary
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Pack: {selectedPack.pack.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Formats: {selectedPack.specifications.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quality: Premium
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" color="primary" gutterBottom>
                  {selectedPack.pack.price === 0 ? 'Free' : `$${selectedPack.pack.price}`}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleExport}
                  disabled={isProcessing}
                  startIcon={isProcessing ? <CircularProgress size={20} /> : <DownloadIcon />}
                >
                  {isProcessing ? 'Processing...' : 'Export Now'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderExportProgress = () => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 300, mb: 4 }}>
        Export Progress
      </Typography>

      <Grid container spacing={3}>
        {exportJobs.map((job) => (
          <Grid item xs={12} md={6} key={job.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {job.specifications[0]?.name || 'Export'}
                  </Typography>
                  {job.status === 'completed' ? (
                    <CheckIcon color="success" />
                  ) : job.status === 'processing' ? (
                    <CircularProgress size={24} />
                  ) : (
                    <CircularProgress size={24} variant="indeterminate" />
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {job.status === 'completed' ? 'Completed' :
                       job.status === 'processing' ? 'Processing...' : 'Pending'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.progress}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 4,
                      bgcolor: 'grey.200',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${job.progress}%`,
                        bgcolor: job.status === 'completed' ? 'success.main' : 'primary.main',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>

                {job.status === 'completed' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<DownloadIcon />}>
                      Download
                    </Button>
                    <Button size="small" startIcon={<ShareIcon />}>
                      Share
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {exportJobs.every(job => job.status === 'completed') && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            All exports completed successfully! Your digital artifacts are ready for download.
          </Alert>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        <Box>
          <Typography variant="h5" component="div">
            Digital Art Export Gallery
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transform your data into premium digital artifacts
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Stepper activeStep={activeStep} sx={{ px: 3, pt: 2 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <DialogContent sx={{ pt: 2 }}>
        {activeStep === 0 && renderGalleryStep()}
        {activeStep === 1 && renderCustomizeStep()}
        {activeStep === 2 && renderPreviewStep()}
        {activeStep === 3 && renderExportProgress()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {activeStep > 0 && activeStep < 3 && (
          <Button onClick={() => setActiveStep(activeStep - 1)}>
            Back
          </Button>
        )}
        {activeStep === 1 && (
          <Button variant="contained" onClick={() => setActiveStep(2)}>
            Preview
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ExportManager;