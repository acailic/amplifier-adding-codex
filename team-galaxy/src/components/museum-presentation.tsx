/**
 * Museum-Style Team Galaxy Presentation
 *
 * Transforms team analytics into gallery-worthy cultural artifacts
 * that teams would be proud to display in their office spaces.
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Download, Share2, Maximize2, Info, Camera, Palette, Frame, QrCode } from 'lucide-react';
import TeamGalaxyVisualization, { TeamGalaxyVisualizationRef } from '../core/galaxy-engine';
import {
  TeamGalaxy,
  MuseumFrame,
  CustomizationOptions,
  TeamPortrait,
  CulturalInsights,
  ExportOptions
} from '../types/team-galaxy';

// ==================== MUSEUM FRAME COMPONENTS ====================

interface MuseumFrameProps {
  frame: MuseumFrame;
  children: React.ReactNode;
  interactive?: boolean;
  onFrameChange?: (frame: Partial<MuseumFrame>) => void;
}

const MuseumFrameComponent: React.FC<MuseumFrameProps> = ({
  frame,
  children,
  interactive = false,
  onFrameChange
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const frameStyles = useMemo(() => {
    const baseStyles = {
      position: 'relative' as const,
      transition: 'all 0.3s ease-in-out'
    };

    const styleVariants = {
      classical: {
        border: '20px solid',
        borderImage: 'linear-gradient(45deg, #B8860B, #FFD700, #B8860B) 1',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.3)',
        borderRadius: '2px'
      },
      modern: {
        border: '12px solid #1a1a1a',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        borderRadius: '0px'
      },
      minimalist: {
        border: '2px solid #333',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: '0px'
      },
      ornate: {
        border: '25px solid',
        borderImage: 'linear-gradient(45deg, #8B4513, #D2691E, #8B4513) 1',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3), 0 15px 40px rgba(0,0,0,0.4)',
        borderRadius: '4px'
      },
      museum: {
        border: '18px solid #2c1810',
        boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3), 0 12px 35px rgba(0,0,0,0.35)',
        borderRadius: '2px'
      },
      digital: {
        border: 'none',
        boxShadow: '0 0 40px rgba(100,150,255,0.3)',
        borderRadius: '12px'
      }
    };

    return {
      ...baseStyles,
      ...styleVariants[frame.style as keyof typeof styleVariants]
    };
  }, [frame.style]);

  return (
    <motion.div
      className={`museum-frame museum-frame-${frame.style}`}
      style={frameStyles}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={interactive ? { scale: 1.02 } : {}}
    >
      {/* Frame corners and decorations for ornate styles */}
      {(frame.style === 'ornate' || frame.style === 'classical') && (
        <>
          {/* Corner ornaments */}
          {[0, 1, 2, 3].map((corner) => (
            <div
              key={corner}
              className="frame-corner-ornament"
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                ...[
                  { top: '-20px', left: '-20px' },
                  { top: '-20px', right: '-20px' },
                  { bottom: '-20px', right: '-20px' },
                  { bottom: '-20px', left: '-20px' }
                ][corner]
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  border: '3px solid #FFD700',
                  borderRadius: '50%'
                }}
              />
            </div>
          ))}
        </>
      )}

      {/* Artwork content */}
      <div className="artwork-container" style={{ margin: frame.style === 'digital' ? '0' : '20px' }}>
        {children}
      </div>

      {/* Museum plaque */}
      <div className="museum-plaque">
        <div className="plaque-content">
          <h3 className="artwork-title" style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
            {frame.title}
          </h3>
          <p className="artwork-subtitle" style={{ fontSize: '14px', margin: '0 0 8px 0', opacity: 0.8 }}>
            {frame.subtitle}
          </p>
          <div className="artwork-metadata" style={{ fontSize: '12px', opacity: 0.7 }}>
            <div>{frame.artist} • {frame.date}</div>
            <div>{frame.metadata.medium} • {frame.metadata.dimensions}</div>
          </div>
        </div>

        {frame.qrCode && (
          <div className="artwork-qr">
            <QrCode size={48} />
          </div>
        )}
      </div>

      {/* Interactive controls */}
      {interactive && isHovered && (
        <motion.div
          className="frame-controls"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '8px'
          }}
        >
          <button
            className="frame-control-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Customize frame"
          >
            <Palette size={16} />
          </button>
          <button
            className="frame-control-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Download artwork"
          >
            <Download size={16} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

// ==================== GALLERY PRESENTATION COMPONENT ====================

interface GalleryPresentationProps {
  galaxy: TeamGalaxy;
  insights?: CulturalInsights;
  onExport?: (options: ExportOptions) => void;
  onShare?: () => void;
  className?: string;
}

const GalleryPresentation: React.FC<GalleryPresentationProps> = ({
  galaxy,
  insights,
  onExport,
  onShare,
  className = ''
}) => {
  const [selectedPortrait, setSelectedPortrait] = useState<TeamPortrait | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentView, setCurrentView] = useState<'galaxy' | 'insights' | 'evolution'>('galaxy');
  const galaxyRef = useRef<TeamGalaxyVisualizationRef>(null);

  // Generate portrait options
  const portraitOptions: TeamPortrait[] = useMemo(() => [
    {
      format: 'digital',
      dimensions: { width: 1920, height: 1080, unit: 'px' },
      quality: 'museum',
      features: [
        { name: 'Interactive', included: true, description: 'Click to explore stars', value: 'High' },
        { name: 'Animations', included: true, description: 'Living constellation', value: 'Enabled' },
        { name: 'Details', included: true, description: 'Rich metadata', value: 'Complete' },
        { name: 'Frame', included: true, description: 'Museum-quality digital frame', value: 'Gallery' }
      ],
      price: {
        base: 0,
        currency: 'USD',
        features: {},
        discounts: [],
        total: 0
      }
    },
    {
      format: 'physical',
      dimensions: { width: 24, height: 16, unit: 'in' },
      quality: 'premium',
      features: [
        { name: 'Print Quality', included: true, description: 'Giclée archival print', value: 'Museum Grade' },
        { name: 'Paper', included: true, description: 'Hahnemühle Photo Rag', value: '308gsm' },
        { name: 'Frame', included: true, description: 'Custom hardwood frame', value: 'Gallery Quality' },
        { name: 'Certificate', included: true, description: 'Authenticity certificate', value: 'Included' },
        { name: 'QR Code', included: true, description: 'Link to interactive version', value: 'Interactive' }
      ],
      price: {
        base: 299,
        currency: 'USD',
        features: { 'frame_upgrade': 75, 'larger_size': 100 },
        discounts: [
          { type: 'team_discount', value: 0.1, condition: 'Teams of 10+' },
          { type: 'bulk_order', value: 0.15, condition: '3+ portraits' }
        ],
        total: 299
      }
    },
    {
      format: 'mixed',
      dimensions: { width: 24, height: 16, unit: 'in' },
      quality: 'premium',
      features: [
        { name: 'Physical Print', included: true, description: 'Premium gallery print', value: 'Archival' },
        { name: 'Digital Twin', included: true, description: 'Interactive digital version', value: 'Full Feature' },
        { name: 'AR Viewer', included: true, description: 'Augmented reality experience', value: 'Mobile App' },
        { name: 'Updates', included: true, description: 'Quarterly galaxy updates', value: 'Subscription' }
      ],
      price: {
        base: 499,
        currency: 'USD',
        features: { 'ar_enhancement': 100, 'year_updates': 199 },
        discounts: [
          { type: 'early_adopter', value: 0.2, condition: 'First 100 teams' }
        ],
        total: 499
      }
    }
  ], [galaxy]);

  const handleExport = useCallback((format: 'png' | 'svg' | 'pdf' | 'print') => {
    const options: ExportOptions = {
      format,
      resolution: format === 'print' ? 300 : 150,
      quality: 'museum',
      framing: true,
      metadata: true,
      interactivity: format === 'png'
    };

    onExport?.(options);
  }, [onExport]);

  return (
    <div className={`gallery-presentation ${className}`}>
      {/* Gallery Header */}
      <div className="gallery-header" style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '12px 12px 0 0'
      }}>
        <div className="gallery-info" style={{ maxWidth: '800px' }}>
          <h1 className="gallery-title" style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {galaxy.name} Galaxy
          </h1>
          <p className="gallery-description" style={{
            fontSize: '16px',
            margin: '0',
            opacity: 0.9,
            lineHeight: 1.5
          }}>
            {galaxy.classification.replace('_', ' ').toUpperCase()} Galaxy • {galaxy.stars.length} Stars • {galaxy.connections.length} Gravitational Bonds
          </p>
        </div>

        <div className="gallery-actions" style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Info size={16} />
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
          <button
            onClick={onShare}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>

      {/* Main Gallery View */}
      <div className="gallery-main" style={{
        background: '#0a0a0a',
        padding: '40px',
        minHeight: '600px'
      }}>
        {/* View Selector */}
        <div className="view-selector" style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          justifyContent: 'center'
        }}>
          {[
            { id: 'galaxy', label: 'Galaxy View', icon: '🌌' },
            { id: 'insights', label: 'Cultural Insights', icon: '🔍' },
            { id: 'evolution', label: 'Evolution', icon: '📈' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id as any)}
              style={{
                padding: '12px 24px',
                background: currentView === view.id ? '#FFD700' : 'rgba(255,255,255,0.1)',
                color: currentView === view.id ? '#000' : '#fff',
                border: currentView === view.id ? 'none' : '1px solid rgba(255,255,255,0.2)',
                borderRadius: '24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentView === view.id ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <span>{view.icon}</span>
              {view.label}
            </button>
          ))}
        </div>

        {/* Galaxy Visualization */}
        <AnimatePresence mode="wait">
          {currentView === 'galaxy' && (
            <motion.div
              key="galaxy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="galaxy-view"
              style={{ textAlign: 'center' }}
            >
              <MuseumFrameComponent
                frame={{
                  style: 'museum',
                  material: 'black',
                  title: galaxy.name,
                  subtitle: `${new Date(galaxy.formation).getFullYear()} - Present`,
                  artist: 'Team Galaxy',
                  date: new Date().toLocaleDateString(),
                  description: galaxy.classification.replace('_', ' ').toUpperCase() + ' GALAXY',
                  metadata: {
                    medium: 'Digital Visualization',
                    dimensions: '1200x800px',
                    period: 'Contemporary',
                    provenance: 'Team Analytics',
                    curator: 'Galaxy Generator',
                    references: [],
                    interpretations: []
                  }
                }}
                interactive={true}
              >
                <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                  <TeamGalaxyVisualization
                    ref={galaxyRef}
                    galaxy={galaxy}
                    width={1200}
                    height={800}
                    showFrame={false}
                    interactive={true}
                  />
                </div>
              </MuseumFrameComponent>

              {/* Export Options */}
              <div className="export-options" style={{
                marginTop: '32px',
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {[
                  { format: 'png' as const, label: 'High-Res Image', icon: Camera },
                  { format: 'svg' as const, label: 'Vector Art', icon: Palette },
                  { format: 'pdf' as const, label: 'Gallery Print', icon: Frame },
                  { format: 'print' as const, label: 'Order Physical', icon: Maximize2 }
                ].map(option => (
                  <button
                    key={option.format}
                    onClick={() => handleExport(option.format)}
                    style={{
                      padding: '12px 20px',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    <option.icon size={16} />
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cultural Insights View */}
          {currentView === 'insights' && insights && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="insights-view"
              style={{
                maxWidth: '1200px',
                margin: '0 auto',
                color: 'white'
              }}
            >
              <div className="insights-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {/* Team Identity */}
                <div className="insight-card" style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Team Identity</h3>
                  <div className="values-list">
                    {insights.teamIdentity.values.slice(0, 3).map((value, i) => (
                      <div key={i} style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{value.name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>{value.manifestation}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Collaboration Patterns */}
                <div className="insight-card" style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Collaboration</h3>
                  <div className="collaboration-metrics">
                    <div style={{ marginBottom: '8px' }}>
                      <span>Density: </span>
                      <span style={{ color: '#FFD700' }}>{Math.round(insights.collaborationPatterns.density * 100)}%</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span>Efficiency: </span>
                      <span style={{ color: '#FFD700' }}>{Math.round(insights.collaborationPatterns.efficiency * 100)}%</span>
                    </div>
                    <div>
                      <span>Balance: </span>
                      <span style={{ color: '#FFD700' }}>{Math.round(insights.collaborationPatterns.balance * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Growth Areas */}
                <div className="insight-card" style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Growth Catalysts</h3>
                  <div className="growth-catalysts">
                    {insights.growthTrajectory.catalysts.slice(0, 3).map((catalyst, i) => (
                      <div key={i} style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{catalyst.type}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>{catalyst.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Evolution View */}
          {currentView === 'evolution' && (
            <motion.div
              key="evolution"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="evolution-view"
              style={{
                maxWidth: '1200px',
                margin: '0 auto',
                color: 'white',
                textAlign: 'center'
              }}
            >
              <div className="evolution-timeline" style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '24px' }}>Galaxy Evolution</h3>
                <div className="timeline" style={{
                  position: 'relative',
                  maxWidth: '800px',
                  margin: '0 auto'
                }}>
                  {galaxy.evolution.map((phase, i) => (
                    <motion.div
                      key={i}
                      className="timeline-event"
                      style={{
                        position: 'relative',
                        padding: '16px',
                        marginBottom: '16px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        borderLeft: `3px solid ${phase.phase === 'main_sequence' ? '#FFD700' : '#666'}`
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                        {phase.phase.replace('_', ' ').toUpperCase()}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>
                        {phase.date.toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        {phase.event.description}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Portrait Selection Modal */}
      <AnimatePresence>
        {selectedPortrait && (
          <motion.div
            className="portrait-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setSelectedPortrait(null)}
          >
            <motion.div
              className="portrait-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: '#1a1a1a',
                padding: '32px',
                borderRadius: '16px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 24px 0', fontSize: '24px' }}>
                {selectedPortrait.format.charAt(0).toUpperCase() + selectedPortrait.format.slice(1)} Portrait
              </h2>
              <div className="portrait-features">
                {selectedPortrait.features.map((feature, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{feature.name}</div>
                      <div style={{ fontSize: '14px', opacity: 0.7 }}>{feature.description}</div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      background: feature.included ? '#FFD700' : 'rgba(255,255,255,0.1)',
                      color: feature.included ? '#000' : '#fff',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {feature.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="portrait-pricing" style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(255,215,0,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255,215,0,0.3)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  ${selectedPortrait.price.total}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  {selectedPortrait.dimensions.width}x{selectedPortrait.dimensions.height} {selectedPortrait.dimensions.unit}
                </div>
              </div>
              <button
                onClick={() => setSelectedPortrait(null)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#FFD700',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '24px'
                }}
              >
                Order Portrait
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPresentation;