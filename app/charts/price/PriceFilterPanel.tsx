/**
 * Price Filter Panel Component
 * Comprehensive filtering component for price data
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Filter as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from 'lucide-react';

import {
  PriceFilterPanelProps,
  PriceFilter,
  LocaleConfig,
  ExportOptions,
} from './types';
import {
  localizeText,
  debounce,
  SERBIAN_LOCALE,
} from './utils';

const PriceFilterPanel: React.FC<PriceFilterPanelProps> = ({
  filter,
  categories,
  retailers,
  priceRange,
  onFilterChange,
  onReset,
  className,
}) => {
  const [localFilter, setLocalFilter] = useState<PriceFilter>(filter);
  const [searchTerm, setSearchTerm] = useState(filter.search || '');

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setLocalFilter(prev => ({ ...prev, search }));
    }, 300),
    []
  );

  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Update local filter when props change
  useEffect(() => {
    setLocalFilter(filter);
    setSearchTerm(filter.search || '');
  }, [filter]);

  // Apply filter changes
  const handleFilterChange = (updates: Partial<PriceFilter>) => {
    const newFilter = { ...localFilter, ...updates };
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  // Reset all filters
  const handleReset = () => {
    setSearchTerm('');
    setLocalFilter({
      categories: [],
      retailers: [],
      priceRange: priceRange,
      currency: 'both',
      availability: ['in_stock', 'out_of_stock', 'limited'],
      discountOnly: false,
      sortBy: 'price',
      sortOrder: 'asc',
    });
    onReset();
  };

  // Category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...localFilter.categories, category]
      : localFilter.categories.filter(c => c !== category);
    handleFilterChange({ categories: newCategories });
  };

  // Retailer selection
  const handleRetailerChange = (retailer: string, checked: boolean) => {
    const newRetailers = checked
      ? [...localFilter.retailers, retailer]
      : localFilter.retailers.filter(r => r !== retailer);
    handleFilterChange({ retailers: newRetailers });
  };

  // Availability selection
  const handleAvailabilityChange = (availability: string, checked: boolean) => {
    const newAvailability = checked
      ? [...localFilter.availability, availability as any]
      : localFilter.availability.filter(a => a !== availability);
    handleFilterChange({ availability: newAvailability as any });
  };

  // Clear specific filter section
  const clearCategories = () => handleFilterChange({ categories: [] });
  const clearRetailers = () => handleFilterChange({ retailers: [] });
  const clearAvailability = () => handleFilterChange({ availability: ['in_stock', 'out_of_stock', 'limited'] });

  return (
    <Card className={className}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <FilterIcon />
            <Typography variant="h6">
              {localizeText('Filters', 'Филтери', locale)}
            </Typography>
            {(localFilter.categories.length > 0 ||
              localFilter.retailers.length > 0 ||
              localFilter.search ||
              localFilter.discountOnly ||
              localFilter.availability.length !== 3) && (
              <Chip
                label={`${Object.entries(localFilter).filter(([key, value]) => {
                  if (key === 'priceRange' || key === 'currency') return false;
                  if (Array.isArray(value)) return value.length > 0;
                  if (typeof value === 'boolean') return value;
                  if (typeof value === 'string') return value.length > 0;
                  return false;
                }).length} ${localizeText('active', 'активних', locale)}`}
                size="small"
                color="primary"
              />
            )}
          </Box>
        }
        action={
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
            >
              {localizeText('Reset All', 'Ресетуј све', locale)}
            </Button>
          </Box>
        }
      />

      <CardContent>
        {/* Search */}
        <TextField
          fullWidth
          label={localizeText('Search products...', 'Претражи производе...', locale)}
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={20} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon size={16} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Quick Filters */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <TagIcon />
              <Typography variant="subtitle1">
                {localizeText('Quick Filters', 'Брзи филтери', locale)}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localFilter.discountOnly}
                    onChange={(e) => handleFilterChange({ discountOnly: e.target.checked })}
                  />
                }
                label={localizeText('Discounted items only', 'Само производи са попустом', locale)}
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{localizeText('Currency', 'Валута', locale)}</InputLabel>
                <Select
                  value={localFilter.currency}
                  label={localizeText('Currency', 'Валута', locale)}
                  onChange={(e) => handleFilterChange({ currency: e.target.value as any })}
                >
                  <MenuItem value="both">{localizeText('All', 'Све', locale)}</MenuItem>
                  <MenuItem value="RSD">RSD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{localizeText('Sort By', 'Сортирај по', locale)}</InputLabel>
                <Select
                  value={localFilter.sortBy}
                  label={localizeText('Sort By', 'Сортирај по', locale)}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                >
                  <MenuItem value="price">{localizeText('Price', 'Цени', locale)}</MenuItem>
                  <MenuItem value="discount">{localizeText('Discount', 'Попусту', locale)}</MenuItem>
                  <MenuItem value="name">{localizeText('Name', 'Имену', locale)}</MenuItem>
                  <MenuItem value="date">{localizeText('Date', 'Датуму', locale)}</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{localizeText('Order', 'Редослед', locale)}</InputLabel>
                <Select
                  value={localFilter.sortOrder}
                  label={localizeText('Order', 'Редослед', locale)}
                  onChange={(e) => handleFilterChange({ sortOrder: e.target.value as any })}
                >
                  <MenuItem value="asc">{localizeText('Ascending', 'Растући', locale)}</MenuItem>
                  <MenuItem value="desc">{localizeText('Descending', 'Опадајући', locale)}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Price Range */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <MoneyIcon />
              <Typography variant="subtitle1">
                {localizeText('Price Range', 'Вредносни опсег', locale)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({localFilter.currency === 'RSD' ? 'RSD' : localFilter.currency === 'EUR' ? 'EUR' : 'RSD/EUR'} {localFilter.priceRange[0]} - {localFilter.priceRange[1]})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ px: 2, py: 1 }}>
              <Slider
                value={localFilter.priceRange}
                onChange={(_, value) => handleFilterChange({ priceRange: value as [number, number] })}
                valueLabelDisplay="auto"
                min={priceRange[0]}
                max={priceRange[1]}
                step={localFilter.currency === 'EUR' ? 1 : 100}
                marks={[
                  { value: priceRange[0], label: formatCurrency(priceRange[0], localFilter.currency === 'EUR' ? 'EUR' : 'RSD', SERBIAN_LOCALE) },
                  { value: priceRange[1], label: formatCurrency(priceRange[1], localFilter.currency === 'EUR' ? 'EUR' : 'RSD', SERBIAN_LOCALE) },
                ]}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Categories */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              <CategoryIcon />
              <Typography variant="subtitle1">
                {localizeText('Categories', 'Категорије', locale)}
              </Typography>
              {localFilter.categories.length > 0 && (
                <Chip
                  label={localFilter.categories.length}
                  size="small"
                  color="primary"
                />
              )}
              <Box flexGrow={1} />
              {localFilter.categories.length > 0 && (
                <Button size="small" onClick={clearCategories}>
                  {localizeText('Clear', 'Очисти', locale)}
                </Button>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup row>
              {categories.slice(0, 20).map((category) => (
                <FormControlLabel
                  key={category}
                  control={
                    <Checkbox
                      checked={localFilter.categories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    />
                  }
                  label={localizeText(category, category, SERBIAN_LOCALE)}
                />
              ))}
            </FormGroup>
            {categories.length > 20 && (
              <Typography variant="caption" color="text.secondary">
                {localizeText('Showing first 20 categories', 'Приказане првих 20 категорија', locale)}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Retailers */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              <StoreIcon />
              <Typography variant="subtitle1">
                {localizeText('Retailers', 'Продавци', locale)}
              </Typography>
              {localFilter.retailers.length > 0 && (
                <Chip
                  label={localFilter.retailers.length}
                  size="small"
                  color="primary"
                />
              )}
              <Box flexGrow={1} />
              {localFilter.retailers.length > 0 && (
                <Button size="small" onClick={clearRetailers}>
                  {localizeText('Clear', 'Очисти', locale)}
                </Button>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup row>
              {retailers.slice(0, 20).map((retailer) => (
                <FormControlLabel
                  key={retailer}
                  control={
                    <Checkbox
                      checked={localFilter.retailers.includes(retailer)}
                      onChange={(e) => handleRetailerChange(retailer, e.target.checked)}
                    />
                  }
                  label={localizeText(retailer, retailer, SERBIAN_LOCALE)}
                />
              ))}
            </FormGroup>
            {retailers.length > 20 && (
              <Typography variant="caption" color="text.secondary">
                {localizeText('Showing first 20 retailers', 'Приказаних првих 20 продаваца', locale)}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Availability */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              <CalendarIcon />
              <Typography variant="subtitle1">
                {localizeText('Availability', 'Доступност', locale)}
              </Typography>
              {localFilter.availability.length !== 3 && (
                <Chip
                  label={localFilter.availability.length}
                  size="small"
                  color="primary"
                />
              )}
              <Box flexGrow={1} />
              {localFilter.availability.length !== 3 && (
                <Button size="small" onClick={clearAvailability}>
                  {localizeText('Clear', 'Очисти', locale)}
                </Button>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localFilter.availability.includes('in_stock')}
                    onChange={(e) => handleAvailabilityChange('in_stock', e.target.checked)}
                  />
                }
                label={localizeText('In Stock', 'На стању', locale)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localFilter.availability.includes('limited')}
                    onChange={(e) => handleAvailabilityChange('limited', e.target.checked)}
                  />
                }
                label={localizeText('Limited Stock', 'Ограничено стање', locale)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localFilter.availability.includes('out_of_stock')}
                    onChange={(e) => handleAvailabilityChange('out_of_stock', e.target.checked)}
                  />
                }
                label={localizeText('Out of Stock', 'Није на стању', locale)}
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* Selected Filters Summary */}
        {(localFilter.categories.length > 0 ||
          localFilter.retailers.length > 0 ||
          localFilter.search) && (
          <Box mt={2} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {localizeText('Active Filters', 'Активни филтери', locale)}:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {localFilter.search && (
                <Chip
                  label={`${localizeText('Search', 'Претрага', locale)}: ${localFilter.search}`}
                  onDelete={() => handleFilterChange({ search: '' })}
                  size="small"
                />
              )}
              {localFilter.categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onDelete={() => handleCategoryChange(category, false)}
                  size="small"
                  color="primary"
                />
              ))}
              {localFilter.retailers.map((retailer) => (
                <Chip
                  key={retailer}
                  label={retailer}
                  onDelete={() => handleRetailerChange(retailer, false)}
                  size="small"
                  color="secondary"
                />
              ))}
              {localFilter.discountOnly && (
                <Chip
                  label={localizeText('Discounted only', 'Само са попустом', locale)}
                  onDelete={() => handleFilterChange({ discountOnly: false })}
                  size="small"
                  color="warning"
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to format currency (import from utils)
const formatCurrency = (amount: number, currency: string, locale: any): string => {
  try {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'EUR' ? 2 : 0,
      maximumFractionDigits: currency === 'EUR' ? 2 : 0,
    };

    if (locale.language === 'sr') {
      return new Intl.NumberFormat('sr-RS', options).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', options).format(amount);
    }
  } catch (error) {
    return `${amount.toFixed(currency === 'EUR' ? 2 : 0)} ${currency}`;
  }
};

export default PriceFilterPanel;