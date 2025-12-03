/**
 * Enhanced Data Visualization Components - World-Class Quality
 *
 * Purpose: Create premium, accessible, and performant chart components
 * with Serbian cultural context and world-class user experience
 *
 * Design Principles:
 * - Accessibility first (WCAG 2.1 AA compliance)
 * - Serbian cultural context (colors, formatting, language)
 * - Performance optimized (lazy loading, virtualization)
 * - Responsive design (mobile-first approach)
 * - Smooth animations (300ms timing, spring easing)
 * - Data storytelling (progressive disclosure, interactive legends)
 *
 * Serbian Color Palette:
 * - Red: #C6363C (primary accent)
 * - Blue: #0C4076 (secondary accent)
 * - Green: #115740 (success/growth)
 * - Gold: #D4AF37 (premium/highlight)
 * - White: #FFFFFF (clean background)
 * - Gray: #6B7280 (subtle text)
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Suspense,
  lazy
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts';

// Serbian number formatting utilities
export const serbianNumberFormatter = (value: number, options: {
  style?: 'decimal' | 'currency' | 'percent';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
} = {}) => {
  const {
    style = 'decimal',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  return new Intl.NumberFormat('sr-RS', {
    style,
    currency: style === 'currency' ? 'RSD' : undefined,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

// Serbian date formatting
export const serbianDateFormatter = (date: Date) => {
  return new Intl.DateTimeFormat('sr-RS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Serbian color palette with accessibility
export const SERBIAN_COLORS = {
  primary: '#C6363C',    // Serbian Red
  secondary: '#0C4076',  // Serbian Blue
  success: '#115740',    // Serbian Green
  warning: '#D4AF37',    // Gold
  danger: '#DC2626',     // Enhanced Red
  info: '#3B82F6',       // Enhanced Blue
  neutral: '#6B7280',    // Gray
  background: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB'
} as const;

// AQI Colors with Serbian context
export const AQI_COLORS = {
  dobar: '#00E400',           // Good - Green
  umeren: '#FFFF00',          // Moderate - Yellow
  nezdravZaOsetljive: '#FF7E00', // Unhealthy for Sensitive - Orange
  nezdrav: '#FF0000',         // Unhealthy - Red
  veomaNezdrav: '#8F3F97',    // Very Unhealthy - Purple
  opasan: '#7E0023'           // Hazardous - Maroon
} as const;

// Chart animation configurations
export const CHART_ANIMATIONS = {
  duration: 300,
  easing: [0.34, 1.56, 0.64, 1], // Spring easing
  stagger: 0.05,
  delay: 0.1
} as const;

// Enhanced chart types with Serbian context
export type ChartType =
  | 'airQuality'
  | 'demographics'
  | 'budget'
  | 'energy'
  | 'economic'
  | 'education'
  | 'healthcare';

export type VariantType =
  | 'default'
  | 'comparison'
  | 'trend'
  | 'distribution'
  | 'correlation'
  | 'heatmap';

// Base chart component interfaces
export interface BaseChartProps {
  data: any[];
  type?: ChartType;
  variant?: VariantType;
  height?: number;
  width?: string | number;
  loading?: boolean;
  error?: string | null;
  interactive?: boolean;
  accessible?: boolean;
  animated?: boolean;
  theme?: 'light' | 'dark';
  language?: 'sr' | 'en';
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  onDataPointClick?: (data: any) => void;
  className?: string;
}

// Enhanced tooltip component with Serbian localization
export const EnhancedTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any, name: string) => React.ReactNode;
  serbian?: boolean;
}> = ({ active, payload, label, formatter, serbian = true }) => {
  if (!active || !payload?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[200px]"
      role="tooltip"
    >
      {label && (
        <p className="font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-1">
          {label}
        </p>
      )}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.name}</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

// Loading skeleton component
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 400 }) => (
  <div
    className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"
    style={{ height }}
    role="status"
    aria-label="Učitavanje grafikona..."
  >
    <div className="h-full flex items-center justify-center">
      <div className="text-gray-500">Učitavanje...</div>
    </div>
  </div>
);

// Error state component
export const ChartError: React.FC<{
  error: string;
  onRetry?: () => void;
}> = ({ error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    role="alert"
  >
    <div className="text-red-600 mb-2">⚠️ Greška pri učitavanju grafikona</div>
    <div className="text-red-700 text-sm mb-4">{error}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Pokušaj ponovo
      </button>
    )}
  </motion.div>
);

// Export controls component
export const ChartExportControls: React.FC<{
  onExport: (format: 'png' | 'svg' | 'csv') => void;
  loading?: boolean;
}> = ({ onExport, loading = false }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex gap-2"
  >
    <button
      onClick={() => onExport('png')}
      disabled={loading}
      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
      aria-label="Izvezi kao PNG"
    >
      PNG
    </button>
    <button
      onClick={() => onExport('svg')}
      disabled={loading}
      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
      aria-label="Izvezi kao SVG"
    >
      SVG
    </button>
    <button
      onClick={() => onExport('csv')}
      disabled={loading}
      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
      aria-label="Izvezi kao CSV"
    >
      CSV
    </button>
  </motion.div>
);

// Base chart container with accessibility and performance
export const ChartContainer: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  className?: string;
  showExport?: boolean;
}> = ({
  title,
  description,
  children,
  loading = false,
  error = null,
  onRetry,
  onExport,
  className = '',
  showExport = true
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async (format: 'png' | 'svg' | 'csv') => {
    if (!onExport || isExporting) return;

    setIsExporting(true);
    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [onExport, isExporting]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: CHART_ANIMATIONS.duration / 1000 }}
      className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 ${className}`}
      role="region"
      aria-labelledby="chart-title"
    >
      {/* Chart Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2
            id="chart-title"
            className="text-xl font-bold text-gray-900 mb-2"
          >
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>

        {showExport && onExport && (
          <ChartExportControls onExport={handleExport} loading={isExporting} />
        )}
      </div>

      {/* Chart Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ChartSkeleton />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ChartError error={error} onRetry={onRetry} />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Legend component with interactive filtering
export const InteractiveLegend: React.FC<{
  items: Array<{
    name: string;
    color: string;
    value?: number;
    percentage?: number;
  }>;
  onToggle?: (name: string) => void;
  activeItems?: string[];
  serbian?: boolean;
}> = ({ items, onToggle, activeItems, serbian = true }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(items.map(item => item.name))
  );

  const handleToggle = useCallback((name: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedItems(newSelected);
    onToggle?.(name);
  }, [selectedItems, onToggle]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-3 mt-4"
    >
      {items.map((item, index) => {
        const isActive = (activeItems || selectedItems).has(item.name);

        return (
          <motion.button
            key={item.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleToggle(item.name)}
            className={`flex items-center px-3 py-2 rounded-lg border transition-all ${
              isActive
                ? 'bg-white border-gray-300 shadow-sm'
                : 'bg-gray-50 border-gray-200 opacity-60'
            } hover:shadow-md`}
            aria-label={`Toggle ${item.name} ${isActive ? 'on' : 'off'}`}
          >
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-gray-700">{item.name}</span>
            {item.value !== undefined && (
              <span className="text-sm text-gray-500 ml-2">
                {serbian ? serbianNumberFormatter(item.value) : item.value.toLocaleString()}
              </span>
            )}
            {item.percentage !== undefined && (
              <span className="text-xs text-gray-400 ml-1">
                ({item.percentage.toFixed(1)}%)
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

// Utility hook for responsive charts
export const useResponsiveChart = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        setDimensions({
          width: clientWidth,
          height: Math.min(400, clientWidth * 0.6) // Responsive height
        });
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateDimensions();
    }

    return () => resizeObserver.disconnect();
  }, []);

  return { dimensions, containerRef };
};

// Performance monitoring hook
export const useChartPerformance = (chartName: string) => {
  const renderStartTime = useRef<number>();

  useEffect(() => {
    renderStartTime.current = performance.now();

    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        console.log(`${chartName} render time: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  const trackInteraction = useCallback((action: string) => {
    console.log(`${chartName} interaction: ${action} at ${new Date().toISOString()}`);
  }, [chartName]);

  return { trackInteraction };
};

// Data validation utilities
export const validateChartData = (data: any[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false;

  return data.every(item =>
    item !== null &&
    typeof item === 'object' &&
    !Array.isArray(item)
  );
};

// Accessibility utilities
export const generateAriaLabel = (
  chartType: string,
  data: any[],
  title: string
): string => {
  const itemCount = data.length;
  const dataSummary = data.slice(0, 3).map(item =>
    Object.values(item).slice(0, 2).join(', ')
  ).join('; ');

  return `${title}. ${chartType} grafikon sa ${itemCount} stavki. Prvi podaci: ${dataSummary}${itemCount > 3 ? ' i još...' : ''}`;
};

const enhancedDataVisualization = {
  ChartContainer,
  EnhancedTooltip,
  InteractiveLegend,
  ChartSkeleton,
  ChartError,
  ChartExportControls,
  useResponsiveChart,
  useChartPerformance,
  serbianNumberFormatter,
  serbianDateFormatter,
  SERBIAN_COLORS,
  AQI_COLORS,
  CHART_ANIMATIONS,
  validateChartData,
  generateAriaLabel
};

export default enhancedDataVisualization;