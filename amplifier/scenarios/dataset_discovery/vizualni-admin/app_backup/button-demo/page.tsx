'use client';

import { useState } from 'react';
import Link from 'next/link';

// Button component with magnetic effect
const MagneticButton = ({ children, variant = 'primary', ripple = false, ...props }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Limit magnetic pull to 8px maximum
    const maxPull = 8;
    const distance = Math.sqrt(x * x + y * y);
    const strength = Math.min(distance / 100, 1);

    setMousePos({
      x: (x / rect.width) * maxPull * strength,
      y: (y / rect.height) * maxPull * strength
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }
  };

  const getButtonStyle = () => {
    const baseStyle = {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      margin: '10px'
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: '#0066cc', color: 'white' };
      case 'secondary':
        return { ...baseStyle, backgroundColor: '#6c757d', color: 'white' };
      case 'success':
        return { ...baseStyle, backgroundColor: '#28a745', color: 'white' };
      case 'magnetic':
        return { ...baseStyle, backgroundColor: '#007bff', color: 'white', boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)' };
      default:
        return baseStyle;
    }
  };

  return (
    <button
      style={getButtonStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute' as const,
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            transform: 'translate(-50%, -50%) scale(0)',
            animation: 'ripple 0.6s ease-out',
            pointerEvents: 'none' as const
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
};

export default function ButtonDemoPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Button Component Demo</h1>
      <p>Interactive button components with world-class interactions</p>
      <p>Demonstracija komponenti sa svetskim klasama interakcijama</p>

      <div style={{ marginTop: '30px' }}>
        <h2>Primary Buttons</h2>
        <div style={{ marginBottom: '20px' }}>
          <MagneticButton variant="primary">Primary Button</MagneticButton>
          <MagneticButton variant="primary" disabled>Disabled</MagneticButton>
        </div>

        <h2>Magnetic Effect (max 8px pull)</h2>
        <div style={{ marginBottom: '20px' }}>
          <MagneticButton variant="magnetic">Hover over me!</MagneticButton>
          <MagneticButton variant="magnetic">
            Магнетични ефекат (Magnetic Effect)
          </MagneticButton>
        </div>

        <h2>Ripple Effect</h2>
        <div style={{ marginBottom: '20px' }}>
          <MagneticButton variant="success" ripple>Click for Ripple</MagneticButton>
          <MagneticButton variant="primary" ripple>Klikni za talas</MagneticButton>
        </div>

        <h2>Combined Effects</h2>
        <div style={{ marginBottom: '20px' }}>
          <MagneticButton variant="magnetic" ripple>
            Magnetic + Ripple
          </MagneticButton>
        </div>

        <h2>Performance Features</h2>
        <ul>
          <li>✓ 300ms timing for responsive feel</li>
          <li>✓ 8px maximum magnetic pull distance</li>
          <li>✓ Cubic-bezier easing for natural motion</li>
          <li>✓ CSS transforms for GPU acceleration</li>
          <li>✓ Serbian localization support</li>
          <li>✓ Accessibility ready (keyboard navigation)</li>
        </ul>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Technical Implementation</h3>
        <p>These buttons demonstrate:</p>
        <ul>
          <li><strong>Magnetic Pull:</strong> Mouse position tracking with 8px limit</li>
          <li><strong>Ripple Effect:</strong> Dynamic element creation on click</li>
          <li><strong>Optimized Performance:</strong> CSS transforms and transitions</li>
          <li><strong>Smooth Timing:</strong> 300ms cubic-bezier easing curves</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link href="/" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          ← Nazad na početnu / Back to Home
        </Link>
      </div>
    </div>
  );
}