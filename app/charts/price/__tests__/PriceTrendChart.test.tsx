/**
 * Test file for PriceTrendChart component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import PriceTrendChart from '../PriceTrendChart';
import { PriceTrend } from '../types';

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
  Dot: () => <div data-testid="dot" />,
}));

const theme = createTheme();

// Sample test data
const sampleTrendData: PriceTrend[] = [
  {
    productId: 'prod1',
    productName: 'Laptop',
    productNameSr: 'Лаптоп',
    retailer: 'tech-store',
    retailerName: 'Tech Store',
    category: 'Electronics',
    categorySr: 'Електроника',
    dataPoints: [
      { date: '2024-01-01', price: 89999, currency: 'RSD', availability: 'in_stock' },
      { date: '2024-01-02', price: 87999, currency: 'RSD', availability: 'in_stock' },
      { date: '2024-01-03', price: 86999, currency: 'RSD', availability: 'in_stock' },
      { date: '2024-01-04', price: 85999, currency: 'RSD', availability: 'in_stock' },
      { date: '2024-01-05', price: 84999, currency: 'RSD', availability: 'in_stock' },
    ],
  },
  {
    productId: 'prod2',
    productName: 'Smartphone',
    productNameSr: 'Смартфон',
    retailer: 'mobile-store',
    retailerName: 'Mobile Store',
    category: 'Electronics',
    categorySr: 'Електроника',
    dataPoints: [
      { date: '2024-01-01', price: 79999, currency: 'RSD', availability: 'in_stock' },
      { date: '2024-01-02', price: 78999, currency: 'RSD', availability: 'in_stock' },
      { date: '2024-01-03', price: 77999, currency: 'RSD', availability: 'in_stock' },
      { date: '2024-01-04', price: 76999, currency: 'RSD', availability: 'in_stock' },
      { date: '2024-01-05', price: 75999, currency: 'RSD', availability: 'in_stock' },
    ],
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('PriceTrendChart', () => {
  it('renders without crashing', () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);
    expect(screen.getByText('Price Trends')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    renderWithTheme(<PriceTrendChart data={[]} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    renderWithTheme(<PriceTrendChart data={[]} error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('displays trend chip with correct percentage', () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);
    expect(screen.getByText(/-?\d+\.\d+%/)).toBeInTheDocument();
  });

  it('renders time range selector', () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);
    expect(screen.getByLabelText('Time Range')).toBeInTheDocument();
  });

  it('handles time range change', async () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);

    const timeRangeSelect = screen.getByLabelText('Time Range');
    fireEvent.mouseDown(timeRangeSelect);

    await waitFor(() => {
      expect(screen.getByText('7 days')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('7 days'));
  });

  it('toggles between line and area chart', () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);

    const lineButton = screen.getByText('Line');
    const areaButton = screen.getByText('Area');

    expect(lineButton).toBeInTheDocument();
    expect(areaButton).toBeInTheDocument();

    fireEvent.click(areaButton);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('toggles forecast display', () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);

    const forecastButton = screen.getByText('Show Forecast');
    fireEvent.click(forecastButton);

    expect(forecastButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('displays statistics when available', () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);
    expect(screen.getByText('increasing')).toBeInTheDocument();
  });

  it('opens export menu', () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);

    const menuButton = screen.getByRole('button', { name: '' });
    fireEvent.click(menuButton);

    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
    expect(screen.getByText('Export as Image')).toBeInTheDocument();
  });

  it('displays chart when data is available', () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('displays no data message when no trend data available', () => {
    renderWithTheme(<PriceTrendChart data={[]} />);
    expect(screen.getByText('No trend data available')).toBeInTheDocument();
  });

  it('calls onExport when export option is clicked', () => {
    const mockOnExport = jest.fn();
    renderWithTheme(<PriceTrendChart data={sampleTrendData} onExport={mockOnExport} />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    fireEvent.click(screen.getByText('Export CSV'));
    expect(mockOnExport).toHaveBeenCalledWith({
      format: 'csv',
      includeImages: false,
      includeDescriptions: true,
      language: 'en',
      currency: 'RSD',
    });
  });

  it('applies custom className', () => {
    const { container } = renderWithTheme(
      <PriceTrendChart data={sampleTrendData} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('shows forecast by default when prop is true', () => {
    renderWithTheme(
      <PriceTrendChart data={sampleTrendData} showForecast={true} />
    );
    const forecastButton = screen.getByText('Show Forecast');
    expect(forecastButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('compares retailers when enabled', () => {
    renderWithTheme(
      <PriceTrendChart data={sampleTrendData} compareRetailers={true} />
    );
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('displays Serbian text when Serbian locale is provided', () => {
    const serbianLocale = {
      language: 'sr' as const,
      currency: 'RSD' as const,
      dateFormat: 'dd.MM.yyyy' as const,
      numberFormat: { style: 'currency', currency: 'RSD' },
      useCyrillic: false,
    };

    renderWithTheme(
      <PriceTrendChart
        data={sampleTrendData}
        locale={serbianLocale}
      />
    );
    expect(screen.getByText('Трендови цена')).toBeInTheDocument();
  });

  it('handles different time ranges', async () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);

    const timeRangeSelect = screen.getByLabelText('Time Range');

    const timeRanges = ['7 days', '30 days', '90 days', '1 year', 'All time'];

    for (const range of timeRanges) {
      fireEvent.mouseDown(timeRangeSelect);
      await waitFor(() => {
        expect(screen.getByText(range)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText(range));
    }
  });

  it('displays empty state for empty data array', () => {
    renderWithTheme(<PriceTrendChart data={[]} />);
    expect(screen.getByText('No trend data available')).toBeInTheDocument();
  });

  it('updates chart type on toggle', () => {
    renderWithTheme(<PriceTrendChart data={sampleTrendData} />);

    // Default should be line chart
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Switch to area chart
    const areaButton = screen.getByText('Area');
    fireEvent.click(areaButton);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();

    // Switch back to line chart
    const lineButton = screen.getByText('Line');
    fireEvent.click(lineButton);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});