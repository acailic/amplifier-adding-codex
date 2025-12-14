/**
 * Constellation Visualization Component - Living Cosmos Data Display
 *
 * Purpose: Transform commit/activity data into an animated, living constellation
 * where each star represents a repository/module and connections show relationships
 *
 * Features:
 * - Data-driven star pulsing based on activity levels
 * - Breathing nebula effects for ambient data visualization
 * - Gravitational hover interactions that feel natural
 * - Shooting stars for significant events
 * - Data flow animations along connections
 * - Full accessibility with reduced motion support
 */

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  forwardRef,
  useImperativeHandle
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  COSMIC_TIMING,
  COSMIC_EASING,
  CosmicChoreography,
  createCosmicStyles,
  applyCosmicClasses,
  getElementActivityLevel,
  setupReducedMotion,
  type CosmicChoreography as CosmicChoreographyType
} from './constellation-animation-system';

// ==================== TYPE DEFINITIONS ====================

export interface StarNode {
  id: string;
  name: string;
  x: number;
  y: number;
  commits: number;
  lastCommit: Date;
  connections: string[];
  metadata?: {
    language?: string;
    contributors?: number;
    size?: number;
    health?: number;
  };
}

export interface ConnectionData {
  source: string;
  target: string;
  strength: number;
  type: 'dependency' | 'collaboration' | 'shared-contributors';
  dataFlow?: number;
}

export interface ConstellationEvent {
  id: string;
  type: 'merge' | 'release' | 'significant-commit';
  timestamp: Date;
  impact: number;
  nodeIds: string[];
}

export interface ConstellationVisualizationProps {
  nodes: StarNode[];
  connections: ConnectionData[];
  events?: ConstellationEvent[];
  width?: number;
  height?: number;
  onNodeHover?: (node: StarNode | null) => void;
  onNodeClick?: (node: StarNode) => void;
  animated?: boolean;
  theme?: 'light' | 'dark';
  showLabels?: boolean;
  showDataFlow?: boolean;
  className?: string;
  accessibilityMode?: boolean;
}

// ==================== SUBCOMPONENTS ====================

interface StarProps {
  node: StarNode;
  maxCommits: number;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  reducedMotion: boolean;
  showLabels: boolean;
}

const StarNode = memo<StarProps>(({
  node,
  maxCommits,
  isHovered,
  onHover,
  onClick,
  reducedMotion,
  showLabels
}) => {
  const starRef = useRef<HTMLDivElement>(null);
  const activityLevel = getElementActivityLevel(node.commits, maxCommits);
  const pulseIntensity = activityLevel < 0.2 ? 'faint' :
                        activityLevel < 0.5 ? 'normal' :
                        activityLevel < 0.8 ? 'active' : 'intense';

  // Apply cosmic classes and data attributes
  useEffect(() => {
    if (starRef.current) {
      applyCosmicClasses(starRef.current, 'star', pulseIntensity);
      starRef.current.dataset.activity = activityLevel.toString();
      starRef.current.dataset.nodeId = node.id;
    }
  }, [node.id, activityLevel, pulseIntensity]);

  // Calculate star size based on data
  const starSize = useMemo(() => {
    const baseSize = 8;
    const sizeMultiplier = 1 + (node.metadata?.size || 1) * 0.5;
    return baseSize * sizeMultiplier;
  }, [node.metadata?.size]);

  // Color based on health/language
  const starColor = useMemo(() => {
    if (node.metadata?.health && node.metadata.health < 0.5) {
      return '#ff6b6b'; // Red for poor health
    }
    if (node.metadata?.language) {
      const languageColors: Record<string, string> = {
        javascript: '#f7df1e',
        typescript: '#3178c6',
        python: '#3776ab',
        rust: '#ce422b',
        go: '#00add8',
      };
      return languageColors[node.metadata.language.toLowerCase()] || '#64b5f6';
    }
    return '#64b5f6'; // Default blue
  }, [node.metadata]);

  const handleHover = useCallback((hovered: boolean) => {
    onHover(hovered);

    // Apply gravitational hover effect
    if (starRef.current && !reducedMotion) {
      if (hovered) {
        starRef.current.style.transform = `scale(1.1)`;
        starRef.current.style.filter = `brightness(1.5) drop-shadow(0 0 20px ${starColor})`;
      } else {
        starRef.current.style.transform = `scale(1)`;
        starRef.current.style.filter = `brightness(1) drop-shadow(0 0 5px ${starColor})`;
      }
    }
  }, [onHover, reducedMotion, starColor]);

  return (
    <motion.div
      ref={starRef}
      className="cosmic-star"
      style={{
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${starSize}px`,
        height: `${starSize}px`,
        backgroundColor: starColor,
        borderRadius: '50%',
        boxShadow: `0 0 ${starSize * 2}px ${starColor}40`,
        cursor: 'pointer',
        zIndex: isHovered ? 20 : 10,
      }}
      whileHover={reducedMotion ? {} : {
        scale: 1.15,
        transition: {
          duration: COSMIC_TIMING.hover.attract / 1000,
          ease: COSMIC_EASING.hoverAttract,
        }
      }}
      onTap={onClick}
      onHoverStart={() => handleHover(true)}
      onHoverEnd={() => handleHover(false)}
      aria-label={`Star: ${node.name}. ${node.commits} commits. Last commit: ${node.lastCommit.toLocaleDateString()}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Star glow effect */}
      <div
        className="cosmic-star-glow"
        style={{
          position: 'absolute',
          inset: -starSize,
          background: `radial-gradient(circle, ${starColor}20, transparent)`,
          borderRadius: '50%',
          animation: reducedMotion ? 'none' : `cosmic-pulse-${pulseIntensity} ${COSMIC_TIMING.pulse[pulseIntensity]}ms ${COSMIC_EASING.starPulse} infinite`,
        }}
      />

      {/* Optional label */}
      {showLabels && (
        <motion.div
          className="cosmic-star-label"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            top: starSize + 10,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            color: '#e0e0e0',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        >
          {node.name}
        </motion.div>
      )}

      {/* Pulse ring for active stars */}
      {activityLevel > 0.5 && !reducedMotion && (
        <div
          className="cosmic-pulse-ring"
          style={{
            position: 'absolute',
            inset: -starSize,
            border: `1px solid ${starColor}60`,
            borderRadius: '50%',
            animation: `cosmic-data-pulse ${COSMIC_TIMING.flow.pulseSpeed}ms ease-out infinite`,
          }}
        />
      )}
    </motion.div>
  );
});

StarNode.displayName = 'StarNode';

interface ConnectionProps {
  connection: ConnectionData;
  sourceNode: StarNode;
  targetNode: StarNode;
  showDataFlow: boolean;
  reducedMotion: boolean;
}

const ConnectionLine = memo<ConnectionProps>(({
  connection,
  sourceNode,
  targetNode,
  showDataFlow,
  reducedMotion
}) => {
  const lineRef = useRef<SVGLineElement>(null);

  // Calculate line path
  const lineData = useMemo(() => {
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
      x1: sourceNode.x,
      y1: sourceNode.y,
      x2: targetNode.x,
      y2: targetNode.y,
      distance,
      angle: Math.atan2(dy, dx) * 180 / Math.PI,
    };
  }, [sourceNode, targetNode]);

  // Connection styling based on strength and type
  const connectionStyle = useMemo(() => {
    const opacity = 0.2 + (connection.strength * 0.6);
    const strokeWidth = 1 + (connection.strength * 2);

    let strokeDasharray = '0';
    if (connection.type === 'dependency') {
      strokeDasharray = '5,5';
    } else if (connection.type === 'collaboration') {
      strokeDasharray = '10,5';
    }

    return { opacity, strokeWidth, strokeDasharray };
  }, [connection]);

  // Apply cosmic classes
  useEffect(() => {
    if (lineRef.current) {
      applyCosmicClasses(lineRef.current, 'connection');
      lineRef.current.dataset.strength = connection.strength.toString();
      lineRef.current.dataset.type = connection.type;
    }
  }, [connection]);

  return (
    <g className="cosmic-connection-group">
      {/* Main connection line */}
      <motion.line
        ref={lineRef}
        x1={lineData.x1}
        y1={lineData.y1}
        x2={lineData.x2}
        y2={lineData.y2}
        stroke="#4a5568"
        strokeWidth={connectionStyle.strokeWidth}
        strokeDasharray={connectionStyle.strokeDasharray}
        opacity={connectionStyle.opacity}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 2,
          ease: COSMIC_EASING.dataFlow,
          delay: Math.random() * 0.5,
        }}
      />

      {/* Data flow particles */}
      {showDataFlow && connection.dataFlow > 0 && !reducedMotion && (
        <circle
          r="3"
          fill="#64b5f6"
          opacity="0.8"
        >
          <animateMotion
            dur={`${COSMIC_TIMING.flow.particleSpeed}ms`}
            repeatCount="indefinite"
            path={`M${lineData.x1},${lineData.y1} L${lineData.x2},${lineData.y2}`}
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur={`${COSMIC_TIMING.flow.particleSpeed}ms`}
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
});

ConnectionLine.displayName = 'ConnectionLine';

// ==================== MAIN COMPONENT ====================

export interface ConstellationVisualizationRef {
  getChoreography: () => CosmicChoreographyType | null;
  pauseAnimations: () => void;
  resumeAnimations: () => void;
}

const ConstellationVisualization = forwardRef<ConstellationVisualizationRef, ConstellationVisualizationProps>(
  ({
    nodes,
    connections,
    events = [],
    width = 800,
    height = 600,
    onNodeHover,
    onNodeClick,
    animated = true,
    theme = 'dark',
    showLabels = false,
    showDataFlow = true,
    className = '',
    accessibilityMode = false
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const choreographyRef = useRef<CosmicChoreographyType | null>(null);
    const [hoveredNode, setHoveredNode] = useState<StarNode | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const reducedMotion = useReducedMotion();

    const maxCommits = useMemo(() => {
      return Math.max(...nodes.map(n => n.commits), 1);
    }, [nodes]);

    // Initialize cosmic styles
    useEffect(() => {
      createCosmicStyles();
    }, []);

    // Initialize choreography
    useEffect(() => {
      if (animated && !reducedMotion && containerRef.current) {
        choreographyRef.current = new CosmicChoreography(containerRef.current);
      }

      return () => {
        choreographyRef.current?.destroy();
      };
    }, [animated, reducedMotion]);

    // Setup reduced motion listener
    useEffect(() => {
      if (containerRef.current) {
        const cleanup = setupReducedMotion(containerRef.current);
        return cleanup;
      }
    }, []);

    // Process shooting star events
    useEffect(() => {
      if (!animated || reducedMotion || !choreographyRef.current) return;

      events.forEach(event => {
        const timeSinceEvent = Date.now() - event.timestamp.getTime();
        if (timeSinceEvent < 30000) { // Show events from last 30 seconds
          setTimeout(() => {
            // Trigger shooting star visualization
            const star = document.createElement('div');
            star.className = 'cosmic-shooting-star';
            star.style.cssText = `
              position: absolute;
              width: 100px;
              height: 2px;
              background: linear-gradient(90deg, transparent, #ffd700, transparent);
              top: ${Math.random() * 100}%;
              left: -100px;
              transform: rotate(${Math.random() * 60 + 30}deg);
              animation: cosmic-shooting-star ${COSMIC_TIMING.shootingStar.appearance}ms ${COSMIC_EASING.shootingStar} forwards;
              pointer-events: none;
              z-index: 100;
            `;

            containerRef.current?.appendChild(star);
            setTimeout(() => star.remove(), COSMIC_TIMING.shootingStar.appearance);
          }, timeSinceEvent);
        }
      });
    }, [events, animated, reducedMotion]);

    // Create node lookup map
    const nodeMap = useMemo(() => {
      return new Map(nodes.map(node => [node.id, node]));
    }, [nodes]);

    // Handle node interactions
    const handleNodeHover = useCallback((node: StarNode | null) => {
      setHoveredNode(node);
      onNodeHover?.(node);
    }, [onNodeHover]);

    const handleNodeClick = useCallback((node: StarNode) => {
      onNodeClick?.(node);
    }, [onNodeClick]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getChoreography: () => choreographyRef.current,
      pauseAnimations: () => {
        setIsPaused(true);
        containerRef.current?.style.setProperty('--cosmic-play-state', 'paused');
      },
      resumeAnimations: () => {
        setIsPaused(false);
        containerRef.current?.style.setProperty('--cosmic-play-state', 'running');
      }
    }), []);

    // Create nebula background
    const NebulaBackground = useMemo(() => {
      if (!animated || reducedMotion) return null;

      return (
        <svg
          className="cosmic-nebula"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <radialGradient id="nebula1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="nebula2">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="20%" cy="30%" r="150" fill="url(#nebula1)">
            <animate
              attributeName="r"
              values="150;180;150"
              dur={`${COSMIC_TIMING.breathing.inhale + COSMIC_TIMING.breathing.hold}ms`}
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="70%" cy="60%" r="200" fill="url(#nebula2)">
            <animate
              attributeName="r"
              values="200;240;200"
              dur={`${COSMIC_TIMING.breathing.exhale + COSMIC_TIMING.breathing.pause}ms`}
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      );
    }, [animated, reducedMotion]);

    return (
      <div
        ref={containerRef}
        className={`cosmic-constellation ${className}`}
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          background: theme === 'dark'
            ? 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)'
            : 'radial-gradient(ellipse at center, #f0f9ff 0%, #e0f2fe 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: theme === 'dark'
            ? 'inset 0 0 100px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)'
            : 'inset 0 0 100px rgba(100,150,255,0.1), 0 4px 20px rgba(0,0,0,0.1)',
        }}
        role="img"
        aria-label={`Interactive constellation visualization showing ${nodes.length} nodes and ${connections.length} connections`}
      >
        {/* Nebula background */}
        {NebulaBackground}

        {/* SVG for connections */}
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          width={width}
          height={height}
        >
          {connections.map((connection, index) => {
            const sourceNode = nodeMap.get(connection.source);
            const targetNode = nodeMap.get(connection.target);

            if (!sourceNode || !targetNode) return null;

            return (
              <ConnectionLine
                key={`${connection.source}-${connection.target}-${index}`}
                connection={connection}
                sourceNode={sourceNode}
                targetNode={targetNode}
                showDataFlow={showDataFlow}
                reducedMotion={reducedMotion}
              />
            );
          })}
        </svg>

        {/* Star nodes */}
        <AnimatePresence>
          {nodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{
                opacity: 0,
                scale: 0,
                x: node.x,
                y: node.y,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: node.x,
                y: node.y,
              }}
              exit={{
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.02,
                ease: COSMIC_EASING.starPulse,
              }}
              style={{
                position: 'absolute',
                zIndex: hoveredNode?.id === node.id ? 20 : 10,
              }}
            >
              <StarNode
                node={node}
                maxCommits={maxCommits}
                isHovered={hoveredNode?.id === node.id}
                onHover={(isHovered) => handleNodeHover(isHovered ? node : null)}
                onClick={() => handleNodeClick(node)}
                reducedMotion={reducedMotion}
                showLabels={showLabels}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Accessibility overlay */}
        {accessibilityMode && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 30,
            }}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {hoveredNode && (
              <div
                style={{
                  position: 'absolute',
                  left: `${hoveredNode.x}px`,
                  top: `${hoveredNode.y + 20}px`,
                  background: 'rgba(0,0,0,0.9)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  maxWidth: '200px',
                  transform: 'translateX(-50%)',
                }}
              >
                <strong>{hoveredNode.name}</strong>
                <br />
                {hoveredNode.commits} commits
                <br />
                {hoveredNode.metadata?.language && `Language: ${hoveredNode.metadata.language}`}
              </div>
            )}
          </div>
        )}

        {/* Loading/pause indicator */}
        {isPaused && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              zIndex: 100,
            }}
          >
            Animation Paused
          </div>
        )}
      </div>
    );
  }
);

ConstellationVisualization.displayName = 'ConstellationVisualization';

export default memo(ConstellationVisualization);