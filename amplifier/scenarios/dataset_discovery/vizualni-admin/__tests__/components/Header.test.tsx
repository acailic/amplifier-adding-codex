import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import Header from '../../components/layout/Header'

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with Serbian text', () => {
    render(<Header />)

    // Check if Serbian text is rendered
    expect(screen.getByText(/контролна табла/i)).toBeInTheDocument()
    expect(screen.getByText(/визуелни администратор/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', async () => {
    const { checkA11y } = render(<Header />)

    const results = await checkA11y()
    expect(results).toHaveNoViolations()
  })

  it('has correct language attribute for Serbian', () => {
    render(<Header />)

    const html = document.documentElement
    expect(html).toHaveAttribute('lang', 'sr')
  })

  it('navigation menu is accessible via keyboard', async () => {
    render(<Header />)

    // Find navigation menu
    const navButton = screen.getByRole('button', { name: /мени/i })

    // Test keyboard navigation
    navButton.focus()
    expect(navButton).toHaveFocus()

    // Test Enter key
    fireEvent.keyPress(navButton, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeVisible()
    })
  })

  it('maintains proper ARIA attributes', () => {
    render(<Header />)

    // Check for proper ARIA labels
    const navigation = screen.getByRole('navigation')
    expect(navigation).toHaveAttribute('aria-label', /главна навигација/i)
  })

  it('supports Serbian Cyrillic rendering', () => {
    render(<Header />)

    // Check if Cyrillic characters render properly
    const cyrillicText = screen.getByText(/визуелни администратор/i)
    expect(cyrillicText).toBeInTheDocument()
    expect(cyrillicText).toHaveStyle('font-family: sans-serif')
  })

  it('provides proper color contrast for Serbian text', () => {
    render(<Header />)

    const headerElement = screen.getByRole('banner')
    const computedStyle = window.getComputedStyle(headerElement)

    // Check for sufficient color contrast (basic check)
    expect(computedStyle.color).not.toBe(computedStyle.backgroundColor)
  })

  it('is responsive on different screen sizes', async () => {
    const responsiveTests = await testResponsive(<Header />, ['mobile', 'tablet', 'desktop'])

    responsiveTests.forEach(({ size, a11yResults }) => {
      expect(a11yResults).toHaveNoViolations()
    })
  })
})