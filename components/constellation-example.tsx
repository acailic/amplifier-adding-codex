/**
 * Constellation Visualization Example
 *
 * Complete example showing how to integrate the sophisticated animation system
 * with real commit/activity data to create a living cosmos visualization
 */

import React, { useState, useRef, useEffect } from 'react';
import ConstellationVisualization, {
  type ConstellationVisualizationRef,
  type StarNode,
  type ConnectionData,
  type ConstellationEvent
} from './constellation-visualization';
import { usePerformanceOptimizations } from './constellation-performance';
import { useAccessibility } from './constellation-accessibility';

// Sample data representing commit/activity across repositories
const SAMPLE_NODES: StarNode[] = [
  {
    id: 'core',
    name: 'Core System',
    x: 400,
    y: 300,
    commits: 1250,
    lastCommit: new Date('2024-01-15'),
    connections: ['api', 'ui', 'database'],
    metadata: {
      language: 'typescript',
      contributors: 8,
      size: 1.5,
      health: 0.9
    }
  },
  {
    id: 'api',
    name: 'API Layer',
    x: 200,
    y: 200,
    commits: 890,
    lastCommit: new Date('2024-01-14'),
    connections: ['core', 'auth', 'database'],
    metadata: {
      language: 'javascript',
      contributors: 5,
      size: 1.2,
      health: 0.8
    }
  },
  {
    id: 'ui',
    name: 'UI Components',
    x: 600,
    y: 200,
    commits: 1100,
    lastCommit: new Date('2024-01-15'),
    connections: ['core', 'design-system'],
    metadata: {
      language: 'typescript',
      contributors: 6,
      size: 1.3,
      health: 0.95
    }
  },
  {
    id: 'database',
    name: 'Database Layer',
    x: 200,
    y: 400,
    commits: 650,
    lastCommit: new Date('2024-01-13'),
    connections: ['core', 'api', 'analytics'],
    metadata: {
      language: 'sql',
      contributors: 3,
      size: 1.0,
      health: 0.85
    }
  },
  {
    id: 'auth',
    name: 'Authentication',
    x: 100,
    y: 300,
    commits: 420,
    lastCommit: new Date('2024-01-12'),
    connections: ['api'],
    metadata: {
      language: 'python',
      contributors: 2,
      size: 0.8,
      health: 0.75
    }
  },
  {
    id: 'design-system',
    name: 'Design System',
    x: 700,
    y: 300,
    commits: 780,
    lastCommit: new Date('2024-01-14'),
    connections: ['ui'],
    metadata: {
      language: 'typescript',
      contributors: 4,
      size: 1.1,
      health: 0.92
    }
  },
  {
    id: 'analytics',
    name: 'Analytics',
    x: 300,
    y: 500,
    commits: 350,
    lastCommit: new Date('2024-01-11'),
    connections: ['database'],
    metadata: {
      language: 'python',
      contributors: 3,
      size: 0.9,
      health: 0.7
    }
  }
];

const SAMPLE_CONNECTIONS: ConnectionData[] = [
  { source: 'core', target: 'api', strength: 0.9, type: 'dependency', dataFlow: 75 },
  { source: 'core', target: 'ui', strength: 0.85, type: 'dependency', dataFlow: 60 },
  { source: 'core', target: 'database', strength: 0.8, type: 'dependency', dataFlow: 50 },
  { source: 'api', target: 'auth', strength: 0.7, type: 'dependency', dataFlow: 30 },
  { source: 'api', target: 'database', strength: 0.75, type: 'dependency', dataFlow: 45 },
  { source: 'ui', target: 'design-system', strength: 0.9, type: 'dependency', dataFlow: 55 },
  { source: 'database', target: 'analytics', strength: 0.6, type: 'collaboration', dataFlow: 25 },
  { source: 'core', target: 'design-system', strength: 0.3, type: 'shared-contributors', dataFlow: 10 },
];

const SAMPLE_EVENTS: ConstellationEvent[] = [
  {
    id: 'event-1',
    type: 'merge',
    timestamp: new Date(Date.now() - 5000),
    impact: 0.8,
    nodeIds: ['core', 'api']
  }
];

export const ConstellationExample: React.FC = () => {
  const constellationRef = useRef<ConstellationVisualizationRef>(null);
  const [selectedNode, setSelectedNode] = useState<StarNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<StarNode | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showDataFlow, setShowDataFlow] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize performance optimizations
  const {
    performanceMonitor,
    reducedMotion,
    qualityLevel
  } = usePerformanceOptimizations();

  // Initialize accessibility
  const {
    announce,
    screenReaderEnabled
  } = useAccessibility();

  // Subscribe to performance metrics
  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((metrics) => {
      if (metrics.fps < 30) {
        console.warn('Performance degradation detected:', metrics);
        // Automatically reduce quality
        constellationRef.current?.pauseAnimations();
      }
    });

    return unsubscribe;
  }, [performanceMonitor]);

  // Handle node interactions
  const handleNodeHover = (node: StarNode | null) => {
    setHoveredNode(node);

    if (node && screenReaderEnabled) {
      announce(`${node.name}: ${node.commits} commits, last updated ${node.lastCommit.toLocaleDateString()}`);
    }
  };

  const handleNodeClick = (node: StarNode) => {
    setSelectedNode(node);
    announce(`Selected ${node.name}. Repository has ${node.commits} commits and ${node.metadata?.contributors || 0} contributors.`);
  };

  // Toggle animations
  const toggleAnimations = () => {
    if (isPaused) {
      constellationRef.current?.resumeAnimations();
    } else {
      constellationRef.current?.pauseAnimations();
    }
    setIsPaused(!isPaused);
    announce(isPaused ? 'Animations resumed' : 'Animations paused');
  };

  // Simulate new commit event
  const simulateNewEvent = () => {
    const randomNode = SAMPLE_NODES[Math.floor(Math.random() * SAMPLE_NODES.length)];
    const newEvent: ConstellationEvent = {
      id: `event-${Date.now()}`,
      type: 'significant-commit',
      timestamp: new Date(),
      impact: 0.6,
      nodeIds: [randomNode.id]
    };

    announce(`New commit detected in ${randomNode.name}`);

    // In a real app, you'd update the data and trigger a re-render
    console.log('New event:', newEvent);
  };

  return (
    <div className="constellation-example" style={{ padding: '20px', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ color: theme === 'dark' ? '#fff' : '#000', marginBottom: '10px' }}>
          Living Constellation Visualization
        </h1>
        <p style={{ color: theme === 'dark' ? '#aaa' : '#666' }}>
          Watch as your code repositories come alive with sophisticated animations
        </p>
      </header>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={toggleAnimations}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
            background: theme === 'dark' ? '#333' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            cursor: 'pointer'
          }}
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'} Animations
        </button>

        <button
          onClick={() => setShowLabels(!showLabels)}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
            background: theme === 'dark' ? '#333' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            cursor: 'pointer'
          }}
        >
          {showLabels ? '🏷️ Hide' : '🏷️ Show'} Labels
        </button>

        <button
          onClick={() => setShowDataFlow(!showDataFlow)}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
            background: theme === 'dark' ? '#333' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            cursor: 'pointer'
          }}
        >
          {showDataFlow ? '💫 Hide' : '💫 Show'} Data Flow
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
            background: theme === 'dark' ? '#333' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'} Mode
        </button>

        <button
          onClick={simulateNewEvent}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
            background: theme === 'dark' ? '#333' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            cursor: 'pointer'
          }}
        >
          ✨ Simulate Event
        </button>
      </div>

      {/* Main visualization */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <ConstellationVisualization
          ref={constellationRef}
          nodes={SAMPLE_NODES}
          connections={SAMPLE_CONNECTIONS}
          events={SAMPLE_EVENTS}
          width={800}
          height={600}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          animated={!reducedMotion}
          theme={theme}
          showLabels={showLabels}
          showDataFlow={showDataFlow}
          accessibilityMode={screenReaderEnabled}
        />
      </div>

      {/* Info panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Selected node info */}
        {selectedNode && (
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
            background: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
            color: theme === 'dark' ? '#fff' : '#000'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{selectedNode.name}</h3>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Commits:</strong> {selectedNode.commits}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Language:</strong> {selectedNode.metadata?.language || 'Unknown'}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Contributors:</strong> {selectedNode.metadata?.contributors || 0}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Health:</strong> {((selectedNode.metadata?.health || 0) * 100).toFixed(0)}%
            </p>
            <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.7 }}>
              Last commit: {selectedNode.lastCommit.toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Performance info */}
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
          background: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
          color: theme === 'dark' ? '#fff' : '#000'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Performance</h3>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Quality Level:</strong> {qualityLevel.animationDetail}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Max Particles:</strong> {qualityLevel.maxParticles}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Reduced Motion:</strong> {reducedMotion ? 'Yes' : 'No'}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Screen Reader:</strong> {screenReaderEnabled ? 'Detected' : 'Not detected'}
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.7 }}>
            Animation Status: {isPaused ? 'Paused' : 'Running'}
          </p>
        </div>

        {/* Legend */}
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
          background: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
          color: theme === 'dark' ? '#fff' : '#000'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Legend</h3>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#64b5f6', marginRight: '8px' }}></span>
            Active Node
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#ff6b6b', marginRight: '8px' }}></span>
            Needs Attention
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <span style={{ display: 'inline-block', width: '30px', height: '1px', background: '#4a5568', marginRight: '8px' }}></span>
            Dependency
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <span style={{ display: 'inline-block', width: '30px', height: '1px', background: '#4a5568', borderStyle: 'dashed', marginRight: '8px' }}></span>
            Collaboration
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.7, marginTop: '10px' }}>
            Star size = Repository size<br />
            Pulse intensity = Activity level<br />
            Connections = Dependencies
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        maxWidth: '800px',
        margin: '30px auto 0',
        padding: '20px',
        borderRadius: '8px',
        border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
        background: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
        color: theme === 'dark' ? '#fff' : '#000'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>How to Use</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
          <li><strong>Hover:</strong> Stars respond with gravitational attraction effect</li>
          <li><strong>Click:</strong> Select a node to view detailed information</li>
          <li><strong>Keyboard:</strong> Use Tab to navigate, Enter/Space to activate</li>
          <li><strong>Animations:</strong> Breathing nebulae, pulsing stars, shooting stars, and data flow particles</li>
          <li><strong>Accessibility:</strong> Full screen reader and reduced motion support</li>
          <li><strong>Performance:</strong> Automatically adjusts quality based on device capabilities</li>
        </ul>
      </div>
    </div>
  );
};

export default ConstellationExample;