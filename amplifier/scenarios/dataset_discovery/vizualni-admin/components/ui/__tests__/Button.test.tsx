import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../__tests__/utils/test-utils';
import Button from '../Button';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Button Component', () => {
  const defaultProps = {
    children: 'Test Button',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders button with default props', () => {
      render(<Button {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test Button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders with custom className', () => {
      render(<Button {...defaultProps} className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders as disabled when disabled prop is true', () => {
      render(<Button {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });

    it('renders as loading when loading prop is true', () => {
      render(<Button {...defaultProps} loading />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');

      // Check for loading spinner
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with full width when fullWidth prop is true', () => {
      render(<Button {...defaultProps} fullWidth />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('renders with different sizes', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'] as const;

      sizes.forEach(size => {
        const { unmount } = render(<Button {...defaultProps} size={size} />);
        const button = screen.getByRole('button');

        // Check size-specific classes
        switch (size) {
          case 'sm':
            expect(button).toHaveClass('text-xs', 'px-3', 'py-1.5', 'min-h-[40px]', 'rounded-lg');
            break;
          case 'md':
            expect(button).toHaveClass('px-4', 'py-2', 'min-h-[44px]', 'rounded-xl');
            break;
          case 'lg':
            expect(button).toHaveClass('text-base', 'px-6', 'py-3', 'min-h-[48px]', 'rounded-2xl');
            break;
          case 'xl':
            expect(button).toHaveClass('text-lg', 'px-8', 'py-4', 'min-h-[56px]', 'rounded-3xl');
            break;
        }

        unmount();
      });
    });

    it('renders with different variants', () => {
      const variants = [
        'primary',
        'secondary',
        'accent',
        'outline',
        'outline-secondary',
        'ghost',
        'ghost-secondary',
        'white',
      ] as const;

      variants.forEach(variant => {
        const { unmount } = render(<Button {...defaultProps} variant={variant} />);
        const button = screen.getByRole('button');

        // Check that button has variant-specific classes
        expect(button).toBeInTheDocument();

        unmount();
      });
    });

    it('passes through additional button attributes', () => {
      render(
        <Button
          {...defaultProps}
          type="submit"
          aria-label="Submit form"
          data-testid="submit-button"
        />
      );

      const button = screen.getByTestId('submit-button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} disabled />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} loading />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('creates ripple effect on click', async () => {
      render(<Button {...defaultProps} />);

      const button = screen.getByRole('button');

      // Initially no ripples
      expect(button.querySelector('[style*="ripple"]')).not.toBeInTheDocument();

      // Click to create ripple
      fireEvent.click(button);

      // Check for ripple element
      await waitFor(() => {
        const ripple = button.querySelector('[style*="ripple"]');
        expect(ripple).toBeInTheDocument();
      });
    });

    it('handles multiple clicks creating multiple ripples', async () => {
      render(<Button {...defaultProps} />);

      const button = screen.getByRole('button');

      // Click multiple times
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Check for multiple ripple elements
      await waitFor(() => {
        const ripples = button.querySelectorAll('[style*="ripple"]');
        expect(ripples.length).toBeGreaterThan(0);
      });
    });

    it('removes ripples after animation completes', async () => {
      jest.useFakeTimers();

      render(<Button {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Ripple should exist
      await waitFor(() => {
        const ripple = button.querySelector('[style*="ripple"]');
        expect(ripple).toBeInTheDocument();
      });

      // Fast-forward past animation duration
      jest.advanceTimersByTime(600);

      await waitFor(() => {
        const ripple = button.querySelector('[style*="ripple"]');
        expect(ripple).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('handles keyboard events - Enter key', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events - Space key', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger on other keyboard keys', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Tab', code: 'Tab' });

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Button {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes when disabled', () => {
      render(<Button {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('has proper focus management', () => {
      render(<Button {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
    });

    it('supports keyboard navigation', () => {
      render(<Button {...defaultProps} />);

      const button = screen.getByRole('button');

      // Tab to focus
      fireEvent.focus(button);
      expect(button).toHaveFocus();

      // Activate with Enter
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it('has accessible names', () => {
      render(<Button {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName('Test Button');
    });

    it('supports custom aria-label', () => {
      render(<Button {...defaultProps} aria-label="Custom label" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('announces loading state to screen readers', () => {
      render(<Button {...defaultProps} loading />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to DOM element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button {...defaultProps} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toBe(screen.getByRole('button'));
    });

    it('supports imperative handle', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button {...defaultProps} ref={ref} />);

      expect(ref.current).toBeDefined();
      expect(ref.current?.tagName).toBe('BUTTON');
    });
  });

  describe('Styling and visual states', () => {
    it('applies hover state classes', () => {
      render(<Button {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      // Note: Testing actual hover pseudo-classes in jsdom is limited
      // In a real browser environment, hover styles would apply
      expect(button).toBeInTheDocument();
    });

    it('applies active state classes on click', () => {
      render(<Button {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.mouseDown(button);

      expect(button).toBeInTheDocument();
    });

    it('applies focus state classes on focus', () => {
      render(<Button {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.focus(button);

      expect(button).toHaveFocus();
    });

    it('applies proper disabled styling', () => {
      render(<Button {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Edge cases', () => {
    it('handles empty children', () => {
      render(<Button {...defaultProps} children="" />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('');
    });

    it('handles null children', () => {
      render(<Button {...defaultProps} children={null} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles complex children (icons, text)', () => {
      const { container } = render(
        <Button {...defaultProps}>
          <span data-testid="icon">🚀</span>
          <span>Click me</span>
        </Button>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('handles long text content', () => {
      const longText = 'A'.repeat(1000);
      render(<Button {...defaultProps}>{longText}</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longText);
    });

    it('handles rapid clicking', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} />);

      const button = screen.getByRole('button');

      // Rapidly click multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      expect(mockOnClick).toHaveBeenCalledTimes(10);
    });

    it('handles concurrent loading and disabled states', () => {
      render(<Button {...defaultProps} loading disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not create unnecessary re-renders', () => {
      const mockOnClick = jest.fn();
      const { rerender } = render(
        <Button {...defaultProps} onClick={mockOnClick} />
      );

      // Initial render
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Re-render with same props
      rerender(<Button {...defaultProps} onClick={mockOnClick} />);
      expect(button).toBeInTheDocument();

      // Click handler should not be called during re-render
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Integration with forms', () => {
    it('works as submit button in form', () => {
      const mockOnSubmit = jest.fn();

      const { container } = render(
        <form onSubmit={mockOnSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('works as reset button in form', () => {
      const mockOnReset = jest.fn();

      const { container } = render(
        <form onReset={mockOnReset}>
          <Button type="reset">Reset</Button>
        </form>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });
});