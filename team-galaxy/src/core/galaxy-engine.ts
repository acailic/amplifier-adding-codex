/**
 * Team Galaxy Visualization Engine
 *
 * Transforms team analytics data into beautiful cosmic visualizations
 * that teams would be proud to display as cultural artifacts.
 */

import React, { useRef, useEffect, useState, useCallback, useMemo, memo, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import * as d3 from 'd3';
import {
  TeamGalaxy,
  DeveloperStar,
  CollaborationGravitationalConnection,
  TeamConstellation,
  TeamNebula,
  GalaxyClassification,
  CustomizationOptions,
  MuseumFrame
} from '../types/team-galaxy';

// ==================== GALAXY PHYSICS ENGINE ====================

interface GalaxyPhysicsConfig {
  centerForce: number;
  chargeStrength: number;
  linkDistance: number;
  linkStrength: number;
  gravity: number;
  velocityDecay: number;
  alphaDecay: number;
  alphaMin: number;
}

const DEFAULT_GALAXY_PHYSICS: GalaxyPhysicsConfig = {
  centerForce: 0.1,
  chargeStrength: -300,
  linkDistance: 80,
  linkStrength: 0.5,
  gravity: 0.05,
  velocityDecay: 0.8,
  alphaDecay: 0.01,
  alphaMin: 0.001
};

export class GalaxyPhysicsEngine {
  private simulation: d3.Simulation<DeveloperStar, CollaborationGravitationalConnection>;
  private config: GalaxyPhysicsConfig;

  constructor(container: HTMLElement, config: Partial<GalaxyPhysicsConfig> = {}) {
    this.config = { ...DEFAULT_GALAXY_PHYSICS, ...config };

    this.simulation = d3.forceSimulation<DeveloperStar>()
      .force('charge', d3.forceManyBody().strength(this.config.chargeStrength))
      .force('link', d3.forceLink<DeveloperStar, CollaborationGravitationalConnection>().id(d => d.id))
      .force('center', d3.forceCenter(0, 0).strength(this.config.centerForce))
      .force('collision', d3.forceCollide<DeveloperStar>().radius(d => d.radius + 5))
      .alphaDecay(this.config.alphaDecay)
      .alphaMin(this.config.alphaMin);
  }

  updateGalaxy(galaxy: TeamGalaxy): void {
    // Update force parameters based on galaxy properties
    const linkForce = this.simulation.force< d3.ForceLink<DeveloperStar, CollaborationGravitationalConnection>>('link');
    if (linkForce) {
      linkForce
        .distance(this.config.linkDistance * (1 / (galaxy.density || 1)))
        .strength(this.config.linkStrength);
    }

    // Update node positions based on archetype groups
    const centerForce = this.simulation.force<d3.ForceCenter<DeveloperStar>>('center');
    if (centerForce && galaxy.spiralArms && galaxy.spiralArms.length > 0) {
      // Create spiral structure for spiral galaxies
      this.applySpiralStructure(galaxy);
    }

    // Start simulation with galaxy data
    this.simulation.nodes(galaxy.stars);
    if (linkForce) {
      linkForce.links(galaxy.connections);
    }

    this.simulation.alpha(1).restart();
  }

  private applySpiralStructure(galaxy: TeamGalaxy): void {
    // Position stars in spiral arms for spiral galaxies
    galaxy.stars.forEach((star, i) => {
      const arm = galaxy.spiralArms[i % galaxy.spiralArms.length];
      const angle = arm.startAngle + (i / galaxy.stars.length) * (arm.endAngle - arm.startAngle);
      const radius = 50 + i * 3;

      star.x = radius * Math.cos(angle);
      star.y = radius * Math.sin(angle);
    });
  }

  setConfig(config: Partial<GalaxyPhysicsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getSimulation(): d3.Simulation<DeveloperStar, CollaborationGravitationalConnection> {
    return this.simulation;
  }

  stop(): void {
    this.simulation.stop();
  }

  restart(): void {
    this.simulation.alpha(1).restart();
  }
}

// ==================== VISUALIZATION COMPONENTS ====================

interface DeveloperStarComponentProps {
  star: DeveloperStar;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (star: DeveloperStar | null) => void;
  onClick: (star: DeveloperStar) => void;
  reducedMotion: boolean;
  showLabels: boolean;
  customization: CustomizationOptions;
}

const DeveloperStarComponent: React.FC<DeveloperStarComponentProps> = memo(({
  star,
  isHovered,
  isSelected,
  onHover,
  onClick,
  reducedMotion,
  showLabels,
  customization
}) => {
  const starRef = useRef<SVGGElement>(null);

  // Star visual properties
  const starVisual = useMemo(() => {
    const baseSize = star.radius * (star.magnitude / 5);
    const brightness = star.temperature / 10000; // Normalize to 0-1
    const opacity = 0.6 + brightness * 0.4;

    return {
      size: baseSize,
      color: getSpectralColor(star.spectralClass),
      opacity,
      glow: brightness * 20,
      pulse: star.contributions.commits / 100 // Normalize commits for pulsing
    };
  }, [star]);

  // Spectral class colors (realistic stellar classification)
  function getSpectralColor(spectralClass: string): string {
    const colors = {
      'O': '#9bb0ff', // Blue - hottest
      'B': '#aabfff', // Blue-white
      'A': '#cad7ff', // White
      'F': '#f8f7ff', // Yellow-white
      'G': '#fff4ea', // Yellow (like our Sun)
      'K': '#ffd2a1', // Orange
      'M': '#ffcc6f'  // Red - coolest
    };
    return colors[spectralClass as keyof typeof colors] || '#ffffff';
  }

  const handleInteraction = useCallback((hovering: boolean) => {
    onHover(hovering ? star : null);
  }, [onHover, star]);

  return (
    <g
      ref={starRef}
      className="developer-star"
      transform={`translate(${star.x}, ${star.y})`}
      onMouseEnter={() => handleInteraction(true)}
      onMouseLeave={() => handleInteraction(false)}
      onClick={() => onClick(star)}
      style={{ cursor: 'pointer' }}
    >
      {/* Star glow effect */}
      {!reducedMotion && (
        <motion.circle
          r={starVisual.size * 3}
          fill={starVisual.color}
          opacity={0.1}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 3 + starVisual.pulse,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Main star body */}
      <motion.circle
        r={starVisual.size}
        fill={starVisual.color}
        opacity={starVisual.opacity}
        stroke={isSelected ? customization.colorPalette.accent[0] : 'none'}
        strokeWidth={isSelected ? 2 : 0}
        filter={`url(#starGlow-${star.id})`}
        animate={{
          scale: isHovered ? 1.3 : 1,
          r: isHovered ? starVisual.size * 1.1 : starVisual.size
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      />

      {/* Star core */}
      <circle
        r={starVisual.size * 0.3}
        fill="#ffffff"
        opacity={0.9}
      />

      {/* Constellation connection indicator */}
      {star.constellation && (
        <motion.circle
          r={starVisual.size + 5}
          fill="none"
          stroke={customization.colorPalette.accent[0]}
          strokeWidth={1}
          strokeDasharray="2,2"
          opacity={0.5}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {/* Label */}
      {showLabels && (
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: isHovered ? 1 : 0.7,
            y: isHovered ? 15 : 10
          }}
          transition={{ duration: 0.2 }}
        >
          <text
            y={starVisual.size + 20}
            textAnchor="middle"
            fill={customization.colorPalette.text[0]}
            fontSize={customization.labels.fontSize}
            fontFamily={customization.labels.font}
            fontWeight={isHovered ? "bold" : "normal"}
          >
            {star.name}
          </text>
          <text
            y={starVisual.size + 35}
            textAnchor="middle"
            fill={customization.colorPalette.text[1]}
            fontSize={customization.labels.fontSize * 0.8}
            fontFamily={customization.labels.font}
            opacity={0.8}
          >
            {star.archetype.name}
          </text>
        </motion.g>
      )}

      {/* Define glow filter */}
      <defs>
        <filter id={`starGlow-${star.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={starVisual.glow} />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="1 1" />
          </feComponentTransfer>
        </filter>
      </defs>
    </g>
  );
});

DeveloperStarComponent.displayName = 'DeveloperStarComponent';

interface GravitationalConnectionProps {
  connection: CollaborationGravitationalConnection;
  sourceStar: DeveloperStar;
  targetStar: DeveloperStar;
  customization: CustomizationOptions;
  reducedMotion: boolean;
}

const GravitationalConnection: React.FC<GravitationalConnectionProps> = memo(({
  connection,
  sourceStar,
  targetStar,
  customization,
  reducedMotion
}) => {
  const connectionVisual = useMemo(() => {
    const opacity = 0.1 + (connection.strength * 0.6);
    const strokeWidth = 0.5 + (connection.strength * 3);
    const color = getConnectionTypeColor(connection.type, customization);

    return { opacity, strokeWidth, color };
  }, [connection, customization]);

  function getConnectionTypeColor(type: string, customization: CustomizationOptions): string {
    const typeColors: Record<string, string> = {
      'strong_gravity': customization.colorPalette.accent[0],
      'tidal_force': customization.colorPalette.secondary[0],
      'quantum_entangle': customization.colorPalette.primary[1],
      'gravitational_lens': customization.colorPalette.secondary[1],
      'orbital_sync': customization.colorPalette.primary[2],
      'comet_trajectory': customization.colorPalette.accent[1]
    };
    return typeColors[type] || customization.colorPalette.primary[0];
  }

  // Create curved path for gravitational lensing effects
  const pathData = useMemo(() => {
    const dx = targetStar.x - sourceStar.x;
    const dy = targetStar.y - sourceStar.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (connection.type === 'gravitational_lens' && !reducedMotion) {
      // Create curved path for lensing effect
      const midX = sourceStar.x + dx / 2;
      const midY = sourceStar.y + dy / 2;
      const curveOffset = Math.sin(connection.energy * Math.PI) * distance * 0.1;

      return `M ${sourceStar.x} ${sourceStar.y} Q ${midX + curveOffset} ${midY - curveOffset} ${targetStar.x} ${targetStar.y}`;
    }

    return `M ${sourceStar.x} ${sourceStar.y} L ${targetStar.x} ${targetStar.y}`;
  }, [sourceStar, targetStar, connection, reducedMotion]);

  return (
    <g className="gravitational-connection">
      {/* Connection line */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={connectionVisual.color}
        strokeWidth={connectionVisual.strokeWidth}
        opacity={connectionVisual.opacity}
        strokeDasharray={connection.type === 'comet_trajectory' ? '5,5' : '0'}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 2,
          delay: Math.random() * 0.5,
          ease: "easeOut"
        }}
      />

      {/* Energy flow particles */}
      {!reducedMotion && connection.energy > 0.5 && (
        <circle r="2" fill={connectionVisual.color} opacity="0.6">
          <animateMotion
            dur={`${3 / connection.energy}s`}
            repeatCount="indefinite"
            path={pathData}
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur={`${3 / connection.energy}s`}
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
});

GravitationalConnection.displayName = 'GravitationalConnection';

// ==================== MAIN TEAM GALAXY COMPONENT ====================

export interface TeamGalaxyVisualizationRef {
  exportToSVG: () => string;
  exportToPNG: (options?: { scale?: number; quality?: number }) => Promise<Blob>;
  getPhysicsEngine: () => GalaxyPhysicsEngine | null;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  resetView: () => void;
}

export interface TeamGalaxyVisualizationProps {
  galaxy: TeamGalaxy;
  width?: number;
  height?: number;
  onStarSelect?: (star: DeveloperStar | null) => void;
  onConstellationHover?: (constellation: TeamConstellation | null) => void;
  customization?: Partial<CustomizationOptions>;
  showFrame?: boolean;
  frameStyle?: MuseumFrame;
  interactive?: boolean;
  className?: string;
}

const TeamGalaxyVisualization = forwardRef<TeamGalaxyVisualizationRef, TeamGalaxyVisualizationProps>(
  ({
    galaxy,
    width = 1200,
    height = 800,
    onStarSelect,
    onConstellationHover,
    customization = {},
    showFrame = false,
    frameStyle,
    interactive = true,
    className = ''
  }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const physicsEngineRef = useRef<GalaxyPhysicsEngine | null>(null);
    const [hoveredStar, setHoveredStar] = useState<DeveloperStar | null>(null);
    const [selectedStar, setSelectedStar] = useState<DeveloperStar | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const reducedMotion = useReducedMotion();

    // Default customization
    const fullCustomization: CustomizationOptions = useMemo(() => ({
      theme: {
        name: 'cosmic_deep',
        background: 'radial-gradient(ellipse at center, #0a0e27 0%, #000000 100%)',
        starColors: ['#ffffff', '#ffe9c4', '#d4e4ff', '#ffcccc', '#ccddff'],
        nebulaColors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'],
        connectionColors: ['#4a5568', '#667eea', '#48bb78', '#ed8936'],
        style: 'realistic'
      },
      colorPalette: {
        primary: ['#6366f1', '#8b5cf6', '#a855f7'],
        secondary: ['#4c1d95', '#5b21b6', '#6d28d9'],
        accent: ['#fbbf24', '#f59e0b', '#d97706'],
        background: ['#0f172a', '#1e293b', '#334155'],
        text: ['#f8fafc', '#e2e8f0', '#cbd5e1']
      },
      visualStyle: {
        realism: 0.8,
        abstraction: 0.2,
        ornamentation: 0.3,
        density: 0.6,
        animation: 0.7
      },
      framing: frameStyle || {
        style: 'museum',
        material: 'black',
        title: galaxy.name,
        subtitle: `${new Date(galaxy.formation).getFullYear()} - Present`,
        artist: 'Team Galaxy',
        date: new Date().toLocaleDateString(),
        description: galaxy.classification.replace('_', ' ').toUpperCase() + ' GALAXY',
        metadata: {
          medium: 'Digital Visualization',
          dimensions: `${width}x${height}px`,
          period: 'Contemporary',
          provenance: 'Team Analytics',
          curator: 'Galaxy Generator',
          references: [],
          interpretations: []
        }
      },
      labels: {
        showNames: true,
        showRoles: true,
        showConnections: false,
        showMetrics: false,
        fontSize: 12,
        font: 'Inter, sans-serif',
        placement: 'hover'
      },
      effects: {
        particles: true,
        gravitationalLens: true,
        supernovae: false,
        pulsing: true,
        rotation: false,
        depth: true
      },
      interactions: {
        hoverEffects: true,
        clickActions: true,
        zoom: true,
        pan: true,
        filter: true,
        search: true,
        timeline: true
      },
      ...customization
    }), [galaxy, frameStyle, customization, width, height]);

    // Initialize physics engine
    useEffect(() => {
      if (containerRef.current && !physicsEngineRef.current) {
        physicsEngineRef.current = new GalaxyPhysicsEngine(containerRef.current);
        physicsEngineRef.current.updateGalaxy(galaxy);
      }

      return () => {
        physicsEngineRef.current?.stop();
      };
    }, [galaxy]);

    // Handle star interactions
    const handleStarHover = useCallback((star: DeveloperStar | null) => {
      setHoveredStar(star);
      if (!interactive) return;

      // Find constellations this star belongs to
      const starConstellations = galaxy.constellations.filter(c =>
        c.stars.includes(star.id)
      );

      if (starConstellations.length > 0) {
        onConstellationHover?.(starConstellations[0]);
      } else {
        onConstellationHover?.(null);
      }
    }, [galaxy.constellations, interactive, onConstellationHover]);

    const handleStarClick = useCallback((star: DeveloperStar) => {
      if (!interactive) return;

      setSelectedStar(prev => prev?.id === star.id ? null : star);
      onStarSelect?.(star);
    }, [interactive, onStarSelect]);

    // Export functions
    const exportToSVG = useCallback(() => {
      if (!svgRef.current) return '';
      return new XMLSerializer().serializeToString(svgRef.current);
    }, []);

    const exportToPNG = useCallback(async (options = { scale: 2, quality: 0.9 }) => {
      if (!svgRef.current) throw new Error('SVG reference not available');

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = width * options.scale;
      canvas.height = height * options.scale;

      const svgData = exportToSVG();
      const img = new Image();

      return new Promise<Blob>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(resolve, 'image/png', options.quality);
        };
        img.onerror = reject;
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      });
    }, [exportToSVG, width, height]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      exportToSVG,
      exportToPNG,
      getPhysicsEngine: () => physicsEngineRef.current,
      pauseAnimation: () => {
        setIsPaused(true);
        physicsEngineRef.current?.stop();
      },
      resumeAnimation: () => {
        setIsPaused(false);
        physicsEngineRef.current?.restart();
      },
      resetView: () => {
        setSelectedStar(null);
        setHoveredStar(null);
        physicsEngineRef.current?.restart();
      }
    }), [exportToSVG, exportToPNG]);

    // Create lookup maps
    const starMap = useMemo(() =>
      new Map(galaxy.stars.map(star => [star.id, star])),
      [galaxy.stars]
    );

    const connectionMap = useMemo(() => {
      const map = new Map<string, CollaborationGravitationalConnection>();
      galaxy.connections.forEach(conn => {
        map.set(`${conn.sourceId}-${conn.targetId}`, conn);
      });
      return map;
    }, [galaxy.connections]);

    return (
      <div ref={containerRef} className={`team-galaxy-container ${className}`}>
        <div className={`relative ${showFrame ? 'p-8 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg' : ''}`}>
          {/* Museum Frame */}
          {showFrame && (
            <div className="absolute inset-0 border-8 border-amber-900 rounded-lg pointer-events-none">
              <div className="absolute top-4 left-4 text-amber-900 font-serif">
                <div className="text-lg font-bold">{fullCustomization.framing.title}</div>
                <div className="text-sm">{fullCustomization.framing.subtitle}</div>
              </div>
              <div className="absolute bottom-4 right-4 text-amber-900 font-serif text-xs">
                <div>{fullCustomization.framing.artist}</div>
                <div>{fullCustomization.framing.date}</div>
              </div>
              {fullCustomization.framing.qrCode && (
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-white p-1 rounded">
                  {/* QR Code would go here */}
                  <div className="w-full h-full bg-gray-300 rounded text-xs flex items-center justify-center">
                    QR
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Galaxy Visualization */}
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className={`${showFrame ? 'mt-16 mb-16' : ''}`}
            style={{
              background: fullCustomization.theme.background,
              borderRadius: showFrame ? '4px' : '8px',
              boxShadow: showFrame
                ? '0 4px 6px rgba(0, 0, 0, 0.1)'
                : '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
            viewBox={`${-width/2} ${-height/2} ${width} ${height}`}
          >
            {/* Define filters and gradients */}
            <defs>
              <radialGradient id="galaxyCenterGradient">
                <stop offset="0%" stopColor={fullCustomization.colorPalette.accent[0]} stopOpacity="0.3" />
                <stop offset="50%" stopColor={fullCustomization.colorPalette.primary[0]} stopOpacity="0.1" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {fullCustomization.effects.gravitationalLens && (
                <filter id="gravitationalLensing">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                  <feDisplacementMap in="SourceGraphic" scale="5" />
                </filter>
              )}
            </defs>

            {/* Galaxy background glow */}
            {galaxy.luminosity > 0 && (
              <circle
                cx="0"
                cy="0"
                r={galaxy.diameter / 2}
                fill="url(#galaxyCenterGradient)"
                opacity={galaxy.luminosity / 10}
              />
            )}

            {/* Nebulae (growth areas) */}
            {galaxy.nebulae.map((nebula) => (
              <g key={nebula.id} className="team-nebula" opacity={nebula.density}>
                <circle
                  cx={nebula.x}
                  cy={nebula.y}
                  r={nebula.radius}
                  fill={nebula.color}
                  opacity={0.1}
                  filter={fullCustomization.effects.gravitationalLens ? "url(#gravitationalLensing)" : undefined}
                />
                <circle
                  cx={nebula.x}
                  cy={nebula.y}
                  r={nebula.radius * 0.6}
                  fill="none"
                  stroke={nebula.color}
                  strokeWidth={1}
                  opacity={0.3}
                  strokeDasharray="2,4"
                />
                {showFrame && (
                  <text
                    x={nebula.x}
                    y={nebula.y + nebula.radius + 15}
                    textAnchor="middle"
                    fill={fullCustomization.colorPalette.text[2]}
                    fontSize="10"
                    fontFamily={fullCustomization.labels.font}
                  >
                    {nebula.represents.domain}
                  </text>
                )}
              </g>
            ))}

            {/* Gravitational connections */}
            <g className="connections-layer">
              {galaxy.connections.map((connection) => {
                const sourceStar = starMap.get(connection.sourceId);
                const targetStar = starMap.get(connection.targetId);

                if (!sourceStar || !targetStar) return null;

                return (
                  <GravitationalConnection
                    key={`${connection.sourceId}-${connection.targetId}`}
                    connection={connection}
                    sourceStar={sourceStar}
                    targetStar={targetStar}
                    customization={fullCustomization}
                    reducedMotion={reducedMotion}
                  />
                );
              })}
            </g>

            {/* Constellation patterns */}
            <g className="constellations-layer">
              {galaxy.constellations.map((constellation) => {
                const constellationStars = constellation.stars
                  .map(id => starMap.get(id))
                  .filter(Boolean) as DeveloperStar[];

                if (constellationStars.length < 2) return null;

                return (
                  <motion.g
                    key={constellation.id}
                    className="constellation-pattern"
                    opacity={constellation.visualStyle.opacity}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, delay: 0.5 }}
                  >
                    {/* Draw constellation connections */}
                    {constellationStars.slice(0, -1).map((star, i) => {
                      const nextStar = constellationStars[i + 1];
                      if (!nextStar) return null;

                      return (
                        <motion.line
                          key={`${star.id}-${nextStar.id}`}
                          x1={star.x}
                          y1={star.y}
                          x2={nextStar.x}
                          y2={nextStar.y}
                          stroke={constellation.visualStyle.color}
                          strokeWidth={constellation.visualStyle.lineWidth}
                          strokeDasharray={constellation.visualStyle.pattern === 'dashed' ? '5,5' :
                                        constellation.visualStyle.pattern === 'dotted' ? '2,2' : '0'}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, delay: i * 0.1 }}
                        />
                      );
                    })}
                  </motion.g>
                );
              })}
            </g>

            {/* Developer stars */}
            <g className="stars-layer">
              {galaxy.stars.map((star) => (
                <DeveloperStarComponent
                  key={star.id}
                  star={star}
                  isHovered={hoveredStar?.id === star.id}
                  isSelected={selectedStar?.id === star.id}
                  onHover={handleStarHover}
                  onClick={handleStarClick}
                  reducedMotion={reducedMotion}
                  showLabels={fullCustomization.labels.showNames}
                  customization={fullCustomization}
                />
              ))}
            </g>

            {/* Selected star details */}
            {selectedStar && showFrame && (
              <motion.g
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="star-details"
              >
                <rect
                  x={selectedStar.x + 30}
                  y={selectedStar.y - 40}
                  width="200"
                  height="80"
                  fill="rgba(0, 0, 0, 0.8)"
                  rx="4"
                />
                <text
                  x={selectedStar.x + 40}
                  y={selectedStar.y - 20}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {selectedStar.name}
                </text>
                <text
                  x={selectedStar.x + 40}
                  y={selectedStar.y - 5}
                  fill="#ccc"
                  fontSize="12"
                >
                  {selectedStar.archetype.name}
                </text>
                <text
                  x={selectedStar.x + 40}
                  y={selectedStar.y + 10}
                  fill="#999"
                  fontSize="11"
                >
                  {selectedStar.contributions.commits} commits
                </text>
                <text
                  x={selectedStar.x + 40}
                  y={selectedStar.y + 25}
                  fill="#999"
                  fontSize="11"
                >
                  Collaboration: {Math.round(selectedStar.collaborationScore * 100)}%
                </text>
              </motion.g>
            )}

            {/* Pause indicator */}
            {isPaused && (
              <text
                x={-width/2 + 20}
                y={-height/2 + 30}
                fill={fullCustomization.colorPalette.text[0]}
                fontSize="12"
                fontFamily={fullCustomization.labels.font}
              >
                Animation Paused
              </text>
            )}
          </svg>
        </div>
      </div>
    );
  }
);

TeamGalaxyVisualization.displayName = 'TeamGalaxyVisualization';

export default TeamGalaxyVisualization;