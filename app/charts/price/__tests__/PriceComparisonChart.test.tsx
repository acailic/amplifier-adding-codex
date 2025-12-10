/**
 * Test file for PriceComparisonChart component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import PriceComparisonChart from '../PriceComparisonChart';
import { PriceData } from '../types';

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />,
}));

const theme = createTheme();

// Sample test data
const samplePriceData: PriceData[] = [
  {
    id: '1',
    productId: 'prod1',
    productName: 'Laptop',
    productNameSr: 'Laptop',
    retailer: 'tech-store',
    retailerName: 'Tech Store',
    price: 89999,
    currency: 'RSD',
    discount: 10,
    category: 'Electronics',
    categorySr: 'Електроника',
    availability: 'in_stock',
    timestamp: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    productId: 'prod1',
    productName: 'Laptop',
    productNameSr: 'Laptop',
    retailer: 'computer-shop',
    retailerName: 'Computer Shop',
    price: 94999,
    originalPrice: 104999,
    currency: 'RSD',
    discount: 5,
    category: 'Electronics',
    categorySr: 'Електроника',
    availability: 'in_stock',
    timestamp: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    productId: 'prod2',
    productName: 'Smartphone',
    productNameSr: 'Смартфон',
    retailer: 'mobile-store',
    retailerName: 'Mobile Store',
    price: 79999,
    currency: 'RSD',
    discount: 15,
    category: 'Electronics',
    categorySr: 'Електроника',
    availability: 'in_stock',
    timestamp: '2024-01-15T10:00:00Z',
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('PriceComparisonChart', () => {
  it('renders without crashing', () => {
    renderWithTheme(<PriceComparisonChart data={samplePriceData} />);
    expect(screen.getByText('Price Comparison')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    renderWithTheme(<PriceComparisonChart data={[]} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    renderWithTheme(<PriceComparisonChart data={[]} error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('displays correct number of items', () => {
    renderWithTheme(<PriceComparisonChart data={samplePriceData} />);
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });

  it('renders group by selector', () => {
    renderWithTheme(<PriceComparisonChart data={samplePriceData} />);
    expect(screen.getByLabelText('Group By')).toBeInTheDocument();
  });

  it('handles group by change', async () => {
    renderWithTheme(<PriceComparisonChart data={samplePriceData} />);

    const groupBySelect = screen.getByLabelText('Group By');
    fireEvent.mouseDown(groupBySelect);

    await waitFor(() => {
      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Category'));
  });

  it('renders discount only checkbox', () => {
    renderWithTheme(<PriceComparisonChart data={samplePriceData} />);
    expect(screen.getByLabelText('Discounted only')).toBeInTheDocument();
  });

  it('handles discount only toggle', () => {
    renderWithTheme(<PriceComparisonChart data={samplePriceData} />);

    const discountCheckbox = screen.getByLabelText('Discounted only');
    fireEvent.click(discountCheckbox);

    expect(discountCheckbox).toBeChecked();
  });

  it('displays chart when data is available', () => {
    renderWithTheme(<PriceComparisonChart data={samplePriceData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('displays no data message when no data available', () => {
    renderWithTheme(<PriceComparisonChart data={[]} />);
    expect(screen.getByText('No data available for the selected filters')).toBeInTheDocument();
  });

  it('calls onPriceClick when bar is clicked', () => {
    const mockOnPriceClick = jest.fn();
    renderWithTheme(<PriceComparisonChart data={samplePriceData} onPriceClick={mockOnPriceClick} />);

    const barChart = screen.getByTestId('bar-chart');
    fireEvent.click(barChart);
  });

  it('applies custom className', () => {
    const { container } = renderWithTheme(
      <PriceComparisonChart data={samplePriceData} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('handles reset button click', () => {
    renderWithTheme(<PriceComparisonChart data={samplePriceData} />);

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
  });

  it('filters by selected products', () => {
    renderWithTheme(
      <PriceComparisonChart
        data={samplePriceData}
        selectedProducts={['prod1']}
      />
    );
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('shows retailer comparison when enabled', () => {
    renderWithTheme(
      <PriceComparisonChart
        data={samplePriceData}
        showRetailerComparison={true}
      />
    );
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('groups by category when enabled', () => {
    renderWithTheme(
      <PriceComparisonChart
        data={samplePriceData}
        groupByCategory={true}
      />
    );
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
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
      <PriceComparisonChart
        data={samplePriceData}
        locale={serbianLocale}
      />
    );
    expect(screen.getByText('Поређење цена')).toBeInTheDocument();
  });

  it('renders categories filter when categories exist', () => {
    renderWithTheme(<PriceComparisonChart data={samplePriceData} />);
    expect(screen.getByLabelText('Categories')).toBeInTheDocument();
  });

  it('handles category selection', async () => {
    renderWithTheme(<PriceComparisonChart data={samplePriceData} />);

    const categorySelect = screen.getByLabelText('Categories');
    fireEvent.mouseDown(categorySelect);

    await waitFor(() => {
      expect(screen.getByText('Електроника')).toBeInTheDocument();
    });
  });
});