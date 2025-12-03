import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import DemographicsChart from '../../components/charts/DemographicsChart'
import { serbianTestData } from '../utils/test-utils'

describe('DemographicsChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders demographics data in Serbian', () => {
    render(<DemographicsChart data={serbianTestData.regions} />)

    // Check if Serbian region names are displayed
    expect(screen.getByText(/Београд/i)).toBeInTheDocument()
    expect(screen.getByText(/Војводина/i)).toBeInTheDocument()
    expect(screen.getByText(/Шумадија и Западна Србија/i)).toBeInTheDocument()
    expect(screen.getByText(/Јужна и Источна Србија/i)).toBeInTheDocument()
  })

  it('displays population numbers with Serbian formatting', () => {
    render(<DemographicsChart data={serbianTestData.regions} />)

    // Check for Serbian number formatting (using dots as thousands separators)
    expect(screen.getByText(/1\.680\.000/i)).toBeInTheDocument()
    expect(screen.getByText(/1\.950\.000/i)).toBeInTheDocument()
  })

  it('has proper accessibility for chart data', async () => {
    const { checkA11y } = render(<DemographicsChart data={serbianTestData.regions} />)

    const results = await checkA11y()
    expect(results).toHaveNoViolations()
  })

  it('provides alternative text for screen readers', () => {
    render(<DemographicsChart data={serbianTestData.regions} />)

    // Check for proper ARIA descriptions
    const chart = screen.getByRole('img', { name: /графикон демографије/i })
    expect(chart).toBeInTheDocument()
  })

  it('supports keyboard navigation for data points', async () => {
    render(<DemographicsChart data={serbianTestData.regions} />)

    // Test keyboard navigation through chart elements
    const chartContainer = screen.getByTestId('demographics-chart')

    fireEvent.keyDown(chartContainer, { key: 'Tab' })

    await waitFor(() => {
      const focusedElement = document.activeElement
      expect(focusedElement).toHaveAttribute('tabindex', '0')
    })
  })

  it('maintains proper color contrast for chart elements', () => {
    render(<DemographicsChart data={serbianTestData.regions} />)

    // Check for sufficient color contrast in chart elements
    const chartBars = screen.getAllByTestId('bar')
    chartBars.forEach(bar => {
      const styles = window.getComputedStyle(bar)
      // Basic contrast check - fill color should not be transparent
      expect(styles.fill).not.toBe('transparent')
    })
  })

  it('responds to window resize for responsive design', async () => {
    const { container } = render(<DemographicsChart data={serbianTestData.regions} />)

    // Test mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    window.dispatchEvent(new Event('resize'))

    await waitFor(() => {
      const chart = container.querySelector('[data-testid="demographics-chart"]')
      expect(chart).toBeInTheDocument()
    })
  })

  it('displays tooltips with Serbian labels', async () => {
    render(<DemographicsChart data={serbianTestData.regions} />)

    // Hover over a data point to trigger tooltip
    const dataPoint = screen.getByTestId('bar')
    fireEvent.mouseEnter(dataPoint)

    await waitFor(() => {
      expect(screen.getByText(/становништво/i)).toBeInTheDocument()
      expect(screen.getByText(/буџет/i)).toBeInTheDocument()
    })
  })

  it('supports data export functionality', () => {
    render(<DemographicsChart data={serbianTestData.regions} />)

    const exportButton = screen.getByRole('button', { name: /извоз података/i })
    expect(exportButton).toBeInTheDocument()

    fireEvent.click(exportButton)

    // Mock export functionality
    expect(exportButton).toBeEnabled()
  })

  it('handles empty data gracefully', () => {
    render(<DemographicsChart data={[]} />)

    expect(screen.getByText(/нема доступних података/i)).toBeInTheDocument()
  })

  it('validates Serbian language metadata', () => {
    render(<DemographicsChart data={serbianTestData.regions} />)

    const chart = screen.getByRole('img', { name: /графикон демографије/i })
    expect(chart).toHaveAttribute('lang', 'sr')
  })

  it('is accessible across different screen sizes', async () => {
    const responsiveTests = await testResponsive(
      <DemographicsChart data={serbianTestData.regions} />,
      ['mobile', 'tablet', 'desktop']
    )

    responsiveTests.forEach(({ size, a11yResults }) => {
      expect(a11yResults).toHaveNoViolations()
    })
  })
})