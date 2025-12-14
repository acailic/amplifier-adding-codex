/**
 * Typography System Examples - React Component Library
 * Demonstrates museum-grade typography in context
 */

import React from 'react';

// Example data
const artworkData = {
  title: "Starry Night Over the Rhône",
  artist: "Vincent van Gogh",
  date: "September 1888",
  description: "A night scene painted in Arles, France, capturing the reflection of gas lighting in the Rhône River. The painting showcases Van Gogh's distinctive post-impressionist style with bold, swirling brushstrokes and vibrant color contrasts.",
  medium: "Oil on canvas",
  dimensions: "72.5 cm × 92 cm",
  location: "Musée d'Orsay, Paris"
};

const chartData = [
  { label: "Impressionism", value: 42, unit: "%" },
  { label: "Post-Impressionism", value: 28, unit: "%" },
  { label: "Cubism", value: 18, unit: "%" },
  { label: "Surrealism", value: 12, unit: "%" }
];

// Typography Components

// Hero Section Component
export const HeroSection = () => {
  return (
    <section className="hero" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="hero-title" style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: 'var(--font-size-6xl)',
        fontWeight: 'var(--font-weight-extrabold)',
        lineHeight: 'var(--line-height-none)',
        letterSpacing: 'var(--letter-spacing-tight)',
        color: 'var(--color-neutral-900)',
        marginBottom: '1rem'
      }}>
        Exhibition
      </h1>
      <h2 className="hero-subtitle" style={{
        fontFamily: 'var(--font-family-editorial)',
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'var(--font-weight-medium)',
        lineHeight: 'var(--line-height-snug)',
        letterSpacing: 'var(--letter-spacing-tight-head)',
        color: 'var(--color-neutral-600)',
        marginBottom: '2rem'
      }}>
        Masters of Light and Shadow
      </h2>
      <p className="hero-description" style={{
        fontFamily: 'var(--font-family-ui)',
        fontSize: 'var(--font-size-large)',
        fontWeight: 'var(--font-weight-normal)',
        lineHeight: 'var(--line-height-loose)',
        color: 'var(--color-neutral-700)',
        maxWidth: '65ch',
        margin: '0 auto'
      }}>
        Explore the revolutionary artists who transformed visual perception through their mastery of light, color, and form.
      </p>
    </section>
  );
};

// Artwork Card Component
export const ArtworkCard = ({ artwork = artworkData }) => {
  return (
    <article className="artwork-card" style={{
      padding: '3rem',
      maxWidth: '800px',
      margin: '2rem auto',
      backgroundColor: 'var(--color-neutral-0)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-md)'
    }}>
      <h3 className="artwork-title" style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: 'var(--font-size-4xl)',
        fontWeight: 'var(--font-weight-bold)',
        lineHeight: 'var(--line-height-tight)',
        letterSpacing: 'var(--letter-spacing-tight)',
        color: 'var(--color-neutral-900)',
        marginBottom: '0.5rem'
      }}>
        {artwork.title}
      </h3>
      <p className="artwork-artist" style={{
        fontFamily: 'var(--font-family-editorial)',
        fontSize: 'var(--font-size-2xl)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: 'var(--line-height-snug)',
        color: 'var(--color-neutral-700)',
        marginBottom: '0.25rem'
      }}>
        {artwork.artist}
      </p>
      <p className="artwork-caption" style={{
        fontFamily: 'var(--font-family-ui)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-normal)',
        lineHeight: 'var(--line-height-relaxed)',
        fontStyle: 'italic',
        color: 'var(--color-neutral-600)',
        marginBottom: '1.5rem'
      }}>
        {artwork.date} • {artwork.medium}, {artwork.dimensions}
      </p>
      <div className="artwork-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span className="small-caps" style={{
            fontFamily: 'var(--font-family-ui)',
            fontSize: '0.8em',
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: 'var(--letter-spacing-all-caps)',
            textTransform: 'uppercase',
            color: 'var(--color-neutral-700)'
          }}>
            Location
          </span>
          <p style={{ fontFamily: 'var(--font-family-ui)', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
            {artwork.location}
          </p>
        </div>
        <div>
          <span className="small-caps" style={{
            fontFamily: 'var(--font-family-ui)',
            fontSize: '0.8em',
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: 'var(--letter-spacing-all-caps)',
            textTransform: 'uppercase',
            color: 'var(--color-neutral-700)'
          }}>
            Period
          </span>
          <p style={{ fontFamily: 'var(--font-family-ui)', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
            Post-Impressionism
          </p>
        </div>
      </div>
      <p className="artwork-description typography-enhanced" style={{
        fontFamily: 'var(--font-family-ui)',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-normal)',
        lineHeight: 'var(--line-height-text)',
        color: 'var(--color-neutral-700)',
        textAlign: 'justify'
      }}>
        {artwork.description}
      </p>
    </article>
  );
};

// Data Visualization Component
export const ChartTypography = ({ data = chartData }) => {
  return (
    <div className="chart-container" style={{
      padding: '2rem',
      backgroundColor: 'var(--color-neutral-50)',
      borderRadius: 'var(--radius-lg)',
      maxWidth: '600px',
      margin: '2rem auto'
    }}>
      <h4 className="chart-title" style={{
        fontFamily: 'var(--font-family-editorial)',
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: 'var(--line-height-normal)',
        letterSpacing: 'var(--letter-spacing-tight-head)',
        color: 'var(--color-neutral-900)',
        marginBottom: '1.5rem'
      }}>
        Art Movement Distribution
      </h4>
      {data.map((item, index) => (
        <div key={index} className="chart-item" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 0',
          borderBottom: index < data.length - 1 ? '1px solid var(--color-neutral-200)' : 'none'
        }}>
          <div style={{ flex: 1 }}>
            <span className="chart-label" style={{
              fontFamily: 'var(--font-family-micro)',
              fontSize: 'var(--font-size-3xs)',
              fontWeight: 'var(--font-weight-medium)',
              lineHeight: 'var(--line-height-normal)',
              letterSpacing: 'var(--letter-spacing-all-caps)',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-600)',
              display: 'block'
            }}>
              {item.label}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="chart-value" style={{
              fontFamily: 'var(--font-family-ui)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              lineHeight: 'var(--line-height-snug)',
              color: 'var(--color-neutral-900)',
              display: 'block'
            }}>
              {item.value}
              <span style={{
                fontFamily: 'var(--font-family-micro)',
                fontSize: '0.75em',
                fontWeight: 'var(--font-weight-normal)',
                color: 'var(--color-neutral-600)'
              }}>
                {item.unit}
              </span>
            </span>
          </div>
        </div>
      ))}
      <p className="chart-annotation" style={{
        fontFamily: 'var(--font-family-micro)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-normal)',
        lineHeight: 'var(--line-height-relaxed)',
        color: 'var(--color-neutral-500)',
        marginTop: '1rem',
        fontStyle: 'italic'
      }}>
        *Based on collection analysis of major European museums (2023)
      </p>
    </div>
  );
};

// Typography Scale Demo Component
export const TypographyScale = () => {
  const scales = [
    { name: 'Micro', class: 'text-3xs', usage: 'Chart labels' },
    { name: 'Caption', class: 'text-xs', usage: 'Metadata' },
    { name: 'Small', class: 'text-sm', usage: 'Secondary text' },
    { name: 'Base', class: 'text-base', usage: 'Body copy' },
    { name: 'Medium', class: 'text-xl', usage: 'Subheadings' },
    { name: 'Large', class: 'text-2xl', usage: 'Section headings' },
    { name: 'XL', class: 'text-3xl', usage: 'Feature titles' },
    { name: '2XL', class: 'text-4xl', usage: 'Hero titles' },
    { name: '3XL', class: 'text-5xl', usage: 'Exhibition titles' },
    { name: '4XL', class: 'text-6xl', usage: 'Showcase titles' }
  ];

  return (
    <section className="typography-scale-demo" style={{
      padding: '3rem',
      maxWidth: '1200px',
      margin: '2rem auto'
    }}>
      <h2 className="section-title" style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'var(--font-weight-bold)',
        lineHeight: 'var(--line-height-tight)',
        color: 'var(--color-neutral-900)',
        marginBottom: '2rem'
      }}>
        Typography Scale
      </h2>
      <div className="scale-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {scales.map((scale, index) => (
          <div key={index} className="scale-item" style={{
            padding: '1.5rem',
            backgroundColor: 'var(--color-neutral-0)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-neutral-200)'
          }}>
            <h3 className={scale.class} style={{
              fontFamily: index > 3 ? 'var(--font-family-display)' : 'var(--font-family-ui)',
              fontWeight: index > 3 ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
              lineHeight: index > 3 ? 'var(--line-height-tight)' : 'var(--line-height-normal)',
              color: 'var(--color-neutral-900)',
              marginBottom: '0.5rem'
            }}>
              Aa Bb Cc
            </h3>
            <div style={{
              fontFamily: 'var(--font-family-micro)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-neutral-600)'
            }}>
              <span className="small-caps">{scale.name}</span>
              <span style={{ display: 'block', marginTop: '0.25rem' }}>
                {scale.usage}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Editorial Layout Component
export const EditorialLayout = () => {
  const pullQuote = "Typography is the craft of endowing human language with a durable visual form.";

  return (
    <article className="editorial-article" style={{
      maxWidth: '800px',
      margin: '3rem auto',
      padding: '0 2rem'
    }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="editorial-headline" style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--line-height-snug)',
          letterSpacing: 'var(--letter-spacing-tight)',
          color: 'var(--color-neutral-900)'
        }}>
          The Architecture of Letters
        </h1>
        <h2 className="editorial-subheadline" style={{
          fontFamily: 'var(--font-family-editorial)',
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          lineHeight: 'var(--line-height-normal)',
          letterSpacing: 'var(--letter-spacing-tight-head)',
          color: 'var(--color-neutral-700)',
          marginTop: '1rem'
        }}>
          How museum typography shapes our perception of art
        </h2>
      </header>

      <div className="editorial-content">
        <p className="editorial-body drop-cap" style={{
          fontFamily: 'var(--font-family-ui)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-normal)',
          lineHeight: 'var(--line-height-text)',
          color: 'var(--color-neutral-700)',
          textAlign: 'justify',
          marginBottom: '1.5rem'
        }}>
          In the hallowed halls of the world's greatest museums, typography serves as an invisible guide,
          leading visitors through curated narratives without calling attention to itself. The careful selection
          of typefaces, the precision of spacing, and the hierarchy of text elements work in harmony to create
          an environment where art can speak with clarity and authority.
        </p>

        <blockquote className="editorial-pullquote" style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-light)',
          lineHeight: 'var(--line-height-relaxed)',
          letterSpacing: 'var(--letter-spacing-tight)',
          fontStyle: 'italic',
          color: 'var(--color-neutral-800)',
          margin: '2rem 0',
          padding: '0 2rem',
          borderLeft: '3px solid var(--color-neutral-300)'
        }}>
          "{pullQuote}"
        </blockquote>

        <p className="editorial-body" style={{
          fontFamily: 'var(--font-family-ui)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-normal)',
          lineHeight: 'var(--line-height-text)',
          color: 'var(--color-neutral-700)',
          textAlign: 'justify',
          marginBottom: '1.5rem'
        }}>
          The evolution of museum typography mirrors the changing relationship between institutions and their
          audiences. From the rigid, authoritative typefaces of the 19th century to the inclusive, accessible
          typography of today, each transformation reflects broader cultural shifts in how we value education,
          accessibility, and visitor experience.
        </p>

        <div className="editorial-metadata" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--color-neutral-200)'
        }}>
          <div>
            <span className="small-caps" style={{
              fontFamily: 'var(--font-family-ui)',
              fontSize: '0.8em',
              fontWeight: 'var(--font-weight-semibold)',
              letterSpacing: 'var(--letter-spacing-all-caps)',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-700)',
              display: 'block',
              marginBottom: '0.25rem'
            }}>
              Author
            </span>
            <span style={{ fontFamily: 'var(--font-family-ui)', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
              Dr. Eleanor Wright
            </span>
          </div>
          <div>
            <span className="small-caps" style={{
              fontFamily: 'var(--font-family-ui)',
              fontSize: '0.8em',
              fontWeight: 'var(--font-weight-semibold)',
              letterSpacing: 'var(--letter-spacing-all-caps)',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-700)',
              display: 'block',
              marginBottom: '0.25rem'
            }}>
              Published
            </span>
            <span style={{ fontFamily: 'var(--font-family-ui)', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
              Winter 2024 Edition
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

// Main Demo Component
export const TypographySystemDemo = () => {
  return (
    <div className="typography-demo" style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-neutral-0)'
    }}>
      <HeroSection />
      <ArtworkCard />
      <ChartTypography />
      <TypographyScale />
      <EditorialLayout />

      {/* CSS to be injected */}
      <style jsx global>{`
        @import url('./typography-tokens.css');

        body {
          font-family: var(--font-family-ui);
          font-size: var(--font-size-base);
          line-height: var(--line-height-relaxed);
          color: var(--color-neutral-900);
          background-color: var(--color-neutral-0);
        }
      `}</style>
    </div>
  );
};

export default TypographySystemDemo;