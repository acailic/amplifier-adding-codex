/**
 * Button Component Demonstration Page
 *
 * This page showcases the enhanced Button component with world-class interactions.
 * All timing is optimized for human perception (300ms for responsive feel).
 * Magnetic pull effect provides subtle feedback within 8px maximum.
 * Ripple effects confirm clicks with tactile visual feedback.
 */

import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Button from '@/components/ui/Button';
import { formatSerbianNumber, formatSerbianDate } from '@/lib/utils';

const ButtonDemo: NextPage = () => {
  const [loadingButton, setLoadingButton] = useState<number | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('primary');

  const handleLoadingClick = (buttonId: number) => {
    setLoadingButton(buttonId);
    setTimeout(() => {
      setLoadingButton(null);
    }, 2000);
  };

  const handleIncrementClick = () => {
    setClickCount(prev => prev + 1);
  };

  const variants = [
    'primary',
    'secondary',
    'accent',
    'outline',
    'outline-secondary',
    'ghost',
    'ghost-secondary',
    'white'
  ] as const;

  const sizes = ['sm', 'md', 'lg', 'xl'] as const;

  return (
    <>
      <Head>
        <title>Button Component Demo - Serbian Dashboard</title>
        <meta name="description" content="Enhanced Button component demonstration with world-class interactions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-serbia-red-50 via-white to-serbia-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-gradient-serbia mb-4">
              Enhanced Button Component
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              World-class interactions with 300ms timing, magnetic pull effects, and WCAG AAA compliance.
              All animations respect user preferences and accessibility needs.
            </p>
            <div className="mt-4 text-sm text-neutral-500">
              <p>Current Serbian date: {formatSerbianDate(new Date())}</p>
              <p>Click count: <span className="font-semibold text-serbia-red-600">{formatSerbianNumber(clickCount)}</span></p>
            </div>
          </div>

          {/* Button Variants */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Button Variants</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {variants.map((variant) => (
                <div key={variant} className="space-y-2">
                  <div className="text-sm font-medium text-neutral-700 capitalize">{variant}</div>
                  <Button
                    variant={variant}
                    fullWidth
                    onClick={() => setSelectedVariant(variant)}
                    className={selectedVariant === variant ? 'ring-2 ring-serbia-red-500' : ''}
                  >
                    {variant} Button
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Button Sizes */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Button Sizes</h2>
            <div className="flex flex-wrap gap-4 items-center">
              {sizes.map((size) => (
                <div key={size} className="space-y-2">
                  <div className="text-sm font-medium text-neutral-700 capitalize">{size}</div>
                  <Button variant="primary" size={size}>
                    {size} Button
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive States */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Interactive States</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Loading States */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-neutral-900">Loading States</h3>
                </div>
                <div className="space-y-4">
                  <Button
                    variant="primary"
                    loading={loadingButton === 1}
                    onClick={() => handleLoadingClick(1)}
                    fullWidth
                  >
                    {loadingButton === 1 ? 'Processing...' : 'Start Loading'}
                  </Button>
                  <Button
                    variant="secondary"
                    loading={loadingButton === 2}
                    onClick={() => handleLoadingClick(2)}
                    fullWidth
                  >
                    {loadingButton === 2 ? 'Processing...' : 'Start Loading'}
                  </Button>
                </div>
              </div>

              {/* Disabled States */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-neutral-900">Disabled States</h3>
                </div>
                <div className="space-y-4">
                  <Button variant="primary" disabled fullWidth>
                    Disabled Primary
                  </Button>
                  <Button variant="outline" disabled fullWidth>
                    Disabled Outline
                  </Button>
                </div>
              </div>

              {/* Interactive Counter */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-neutral-900">Interactive Counter</h3>
                </div>
                <div className="space-y-4">
                  <Button
                    variant="accent"
                    fullWidth
                    onClick={handleIncrementClick}
                  >
                    Increment Counter
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setClickCount(0)}
                  >
                    Reset Counter
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Buttons */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Full Width Buttons</h2>
            <div className="max-w-md mx-auto space-y-4">
              <Button variant="primary" fullWidth>
                Full Width Primary
              </Button>
              <Button variant="secondary" fullWidth>
                Full Width Secondary
              </Button>
              <Button variant="outline" fullWidth>
                Full Width Outline
              </Button>
            </div>
          </div>

          {/* Button Groups */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Button Groups</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="primary">Save Changes</Button>
              <Button variant="outline-secondary">Cancel</Button>
              <Button variant="ghost-secondary">Preview</Button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-neutral-900">World-Class Features</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">🎯 Optimized Timing</h3>
                <ul className="space-y-2 text-neutral-600">
                  <li>• 300ms base timing (human perception)</li>
                  <li>• 150ms active state feedback</li>
                  <li>• Spring easing for premium feel</li>
                  <li>• Reduced motion support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">🎨 Interactive Effects</h3>
                <ul className="space-y-2 text-neutral-600">
                  <li>• Magnetic pull (8px max)</li>
                  <li>• Ripple effects on click</li>
                  <li>• Subtle scale animations</li>
                  <li>• Progressive shadow depth</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">♿ Accessibility</h3>
                <ul className="space-y-2 text-neutral-600">
                  <li>• WCAG AAA compliant colors</li>
                  <li>• 44px minimum touch targets</li>
                  <li>• Full keyboard navigation</li>
                  <li>• Screen reader support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">🇷🇸 Serbian Design</h3>
                <ul className="space-y-2 text-neutral-600">
                  <li>• Serbian flag colors</li>
                  <li>• Cultural color semantics</li>
                  <li>• Localized formatting</li>
                  <li>• Regional accessibility</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 text-center text-neutral-600">
            <p className="mb-2">
              <strong>Try the magnetic pull effect:</strong> Hover over buttons and move your cursor nearby
            </p>
            <p className="mb-2">
              <strong>Click feedback:</strong> Click any button to see the ripple effect
            </p>
            <p>
              <strong>Keyboard navigation:</strong> Tab through buttons and press Enter/Space
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
};

export default ButtonDemo;