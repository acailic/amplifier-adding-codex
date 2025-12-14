/**
 * Gallery Exhibition Page - Constellation Codex Gallery
 *
 * A museum-quality exhibition page showcasing developer work as curated art pieces
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import CuratedGallery, { createArtworkMetadata, ArtworkMetadata } from '../components/curated-gallery';
import { StarNode, ConnectionData, ConstellationEvent } from '../components/constellation-visualization';
import {
  ArrowLeft,
  Download,
  Share2,
  Bookmark,
  Filter,
  Calendar,
  Award,
  Star as StarIcon,
  Eye,
  Heart,
  Info,
  User,
  Clock,
  Code,
  Activity,
  Zap,
  Shield,
  Target,
  TrendingUp
} from 'lucide-react';

// ==================== SAMPLE DATA ====================

const generateSampleNodes = (): StarNode[] => {
  const repositories = [
    { id: 'react-constellation', name: 'React Constellation', language: 'typescript', commits: 234, health: 0.9 },
    { id: 'data-cosmos', name: 'Data Cosmos', language: 'python', commits: 189, health: 0.85 },
    { id: 'algorithm-garden', name: 'Algorithm Garden', language: 'rust', commits: 156, health: 0.92 },
    { id: 'ui-laboratory', name: 'UI Laboratory', language: 'javascript', commits: 312, health: 0.88 },
    { id: 'api-monolith', name: 'API Monolith', language: 'go', commits: 278, health: 0.79 },
    { id: 'ml-pipeline', name: 'ML Pipeline', language: 'python', commits: 145, health: 0.91 },
    { id: 'mobile-experience', name: 'Mobile Experience', language: 'typescript', commits: 198, health: 0.86 },
    { id: 'cloud-architecture', name: 'Cloud Architecture', language: 'typescript', commits: 267, health: 0.94 },
    { id: 'database-design', name: 'Database Design', language: 'sql', commits: 134, health: 0.87 },
    { id: 'security-fortress', name: 'Security Fortress', language: 'rust', commits: 167, health: 0.95 },
    { id: 'performance-optimizer', name: 'Performance Optimizer', language: 'cpp', commits: 201, health: 0.89 },
    { id: 'real-time-stream', name: 'Real-time Stream', language: 'java', commits: 223, health: 0.83 }
  ];

  return repositories.map((repo, index) => ({
    id: repo.id,
    name: repo.name,
    x: 100 + (index % 4) * 150 + (index % 2) * 75,
    y: 100 + Math.floor(index / 4) * 150 + (index % 2) * 50,
    commits: repo.commits,
    lastCommit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    connections: [],
    metadata: {
      language: repo.language,
      contributors: Math.floor(Math.random() * 10) + 1,
      size: Math.floor(Math.random() * 5) + 1,
      health: repo.health
    }
  }));
};

const generateSampleConnections = (nodes: StarNode[]): ConnectionData[] => {
  const connections: ConnectionData[] = [];

  // Create meaningful connections based on languages and collaboration patterns
  const typeScriptNodes = nodes.filter(n => n.metadata?.language === 'typescript');
  const pythonNodes = nodes.filter(n => n.metadata?.language === 'python');
  const rustNodes = nodes.filter(n => n.metadata?.language === 'rust');

  // TypeScript ecosystem connections
  typeScriptNodes.forEach((node, i) => {
    if (i < typeScriptNodes.length - 1) {
      connections.push({
        source: node.id,
        target: typeScriptNodes[i + 1].id,
        strength: 0.8,
        type: 'dependency',
        dataFlow: Math.random() * 10
      });
    }
  });

  // Python data science connections
  pythonNodes.forEach((node, i) => {
    if (i < pythonNodes.length - 1) {
      connections.push({
        source: node.id,
        target: pythonNodes[i + 1].id,
        strength: 0.7,
        type: 'collaboration',
        dataFlow: Math.random() * 8
      });
    }
  });

  // Cross-language collaborations
  for (let i = 0; i < 5; i++) {
    const source = nodes[Math.floor(Math.random() * nodes.length)];
    const target = nodes[Math.floor(Math.random() * nodes.length)];
    if (source.id !== target.id) {
      connections.push({
        source: source.id,
        target: target.id,
        strength: Math.random() * 0.6 + 0.2,
        type: 'shared-contributors',
        dataFlow: Math.random() * 5
      });
    }
  }

  return connections;
};

const generateSampleEvents = (): ConstellationEvent[] => {
  return [
    {
      id: 'major-release',
      type: 'release',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      impact: 0.9,
      nodeIds: ['react-constellation', 'ui-laboratory']
    },
    {
      id: 'significant-merge',
      type: 'merge',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      impact: 0.7,
      nodeIds: ['api-monolith']
    },
    {
      id: 'security-update',
      type: 'significant-commit',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      impact: 0.8,
      nodeIds: ['security-fortress']
    }
  ];
};

const generateArtworkMetadata = (nodes: StarNode[]): Map<string, ArtworkMetadata> => {
  const metadata = new Map<string, ArtworkMetadata>();

  const artistNames = [
    'Alexandra Chen', 'Marcus Rodriguez', 'Sarah Kim', 'James Liu',
    'Elena Volkov', 'David Park', 'Zara Ahmed', 'Thomas Schmidt',
    'Maya Patel', 'Roberto Silva', 'Yuki Tanaka', 'Emma Wilson'
  ];

  const curatorialNotes = [
    'A masterful exploration of reactive programming patterns, demonstrating exceptional understanding of modern frontend architecture.',
    'This work showcases elegant data transformation pipelines with remarkable attention to performance optimization.',
    'An innovative approach to algorithm design that balances theoretical elegance with practical implementation.',
    'Exemplary user interface design that prioritizes accessibility while maintaining aesthetic sophistication.',
    'Robust system architecture demonstrating foresight in scalability and maintainability considerations.',
    'Cutting-edge machine learning implementation with careful attention to model interpretability.',
    'Thoughtful mobile-first design that respects platform conventions while pushing creative boundaries.',
    'Cloud-native architecture leveraging modern distributed systems patterns with exceptional reliability.',
    'Database design that masterfully balances normalization requirements with performance optimization.',
    'Security-conscious development practices embedded throughout the codebase architecture.',
    'Performance-critical optimizations that demonstrate deep understanding of system-level programming.',
    'Real-time data processing architecture with elegant handling of concurrency and state management.'
  ];

  const artistStatements = [
    'I believe code should be poetry—elegant, expressive, and meaningful.',
    'My work explores the intersection of mathematical beauty and practical functionality.',
    'Every commit is a conversation with future maintainers—clarity is my primary medium.',
    'I seek to create systems that are not just functional, but delightful to interact with.',
    'Performance is not just about speed—it\'s about respect for the user\'s time and attention.',
    'I approach each problem as an opportunity to learn and share knowledge through code.',
    'My goal is to build bridges between complex technical concepts and human understanding.',
    'Software architecture is the art of making deliberate trade-offs with full awareness.',
    'I strive to write code that is both a solution and a lesson in problem-solving.',
    'Every line of code is an investment in the future of the project and its users.',
    'I find beauty in elegant solutions that make complex problems seem simple.',
    'My work is guided by the principle that software should empower, not complicate.'
  ];

  nodes.forEach((node, index) => {
    const artwork = createArtworkMetadata(node, {
      artist: artistNames[index % artistNames.length],
      curatorNotes: curatorialNotes[index % curatorialNotes.length],
      statement: artistStatements[index % artistStatements.length],
      exhibitionHistory: [
        'Digital Art Biennial 2024',
        'Code as Craft Exhibition',
        'Software Architecture Showcase'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      awards: node.commits > 200 ? [
        'Excellence in Architecture Award',
        'Innovation in Programming Prize'
      ] : [],
      tags: [
        node.metadata?.language || 'programming',
        'architecture',
        'clean-code',
        node.commits > 200 ? 'high-impact' : 'emerging',
        node.metadata?.health && node.metadata.health > 0.9 ? 'exemplary' : 'solid'
      ].filter(Boolean),
      collection: node.commits > 250 ? 'masterpiece' : 'contemporary'
    });

    metadata.set(node.id, artwork);
  });

  return metadata;
};

// ==================== GALLERY STATISTICS COMPONENT ====================

interface GalleryStatsProps {
  nodes: StarNode[];
  metadata: Map<string, ArtworkMetadata>;
}

const GalleryStats = ({ nodes, metadata }: GalleryStatsProps) => {
  const stats = useMemo(() => {
    const artworks = Array.from(metadata.values());
    const totalCommits = nodes.reduce((sum, node) => sum + node.commits, 0);
    const totalLines = artworks.reduce((sum, artwork) => sum + artwork.dimensions.lines, 0);
    const avgComplexity = artworks.reduce((sum, artwork) => sum + artwork.dimensions.complexity, 0) / artworks.length;
    const uniqueArtists = new Set(artworks.map(a => a.artist)).size;
    const languages = new Set(artworks.map(a => a.technique)).size;

    return {
      totalCommits,
      totalLines,
      avgComplexity,
      uniqueArtists,
      languages
    };
  }, [nodes, metadata]);

  const statCards = [
    {
      icon: Code,
      value: stats.totalCommits.toLocaleString(),
      label: 'Total Commits',
      color: 'text-blue-600'
    },
    {
      icon: Activity,
      value: stats.uniqueArtists,
      label: 'Featured Artists',
      color: 'text-purple-600'
    },
    {
      icon: Zap,
      value: stats.languages,
      label: 'Languages',
      color: 'text-green-600'
    },
    {
      icon: TrendingUp,
      value: stats.avgComplexity.toFixed(1),
      label: 'Avg Complexity',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-xl shadow-md p-6 text-center"
          >
            <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ==================== MAIN GALLERY PAGE ====================

export default function GalleryPage() {
  const [nodes] = useState<StarNode[]>(generateSampleNodes);
  const [connections] = useState<ConnectionData[]>(() => generateSampleConnections(generateSampleNodes()));
  const [events] = useState<ConstellationEvent[]>(generateSampleEvents);
  const [metadata] = useState<Map<string, ArtworkMetadata>>(() => generateArtworkMetadata(generateSampleNodes()));
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMetadata | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleArtworkSelect = useCallback((artwork: ArtworkMetadata) => {
    setSelectedArtwork(artwork);
  }, []);

  const handleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked);
  }, [isBookmarked]);

  return (
    <>
      <Head>
        <title>Constellation Codex Gallery - Digital Art Exhibition</title>
        <meta name="description" content="A curated exhibition of developer work presented as digital art pieces" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Gallery Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 text-white"
        >
          <div className="container mx-auto px-6 py-12">
            <div className="flex items-center justify-between">
              <div>
                <motion.h1
                  className="text-5xl font-light mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Constellation Codex Gallery
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-300 max-w-2xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Where software architecture meets digital art. Experience the living cosmos of code through our curated exhibitions.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookmark}
                  className={`p-3 rounded-full transition-colors ${
                    isBookmarked ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title="Bookmark Gallery"
                >
                  <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
                  title="Share Gallery"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
                  title="Export Exhibition"
                >
                  <Download className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>

            {/* Quick Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6 mt-8"
            >
              <a
                href="#exhibitions"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Current Exhibitions
              </a>
              <a
                href="#artists"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Featured Artists
              </a>
              <a
                href="#about"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                About the Gallery
              </a>
            </motion.div>
          </div>
        </motion.header>

        {/* Gallery Statistics */}
        <div className="container mx-auto px-6 -mt-8">
          <GalleryStats nodes={nodes} metadata={metadata} />
        </div>

        {/* Main Gallery */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <CuratedGallery
            nodes={nodes}
            connections={connections}
            events={events}
            metadata={metadata}
            onArtworkSelect={handleArtworkSelect}
            onExhibitionChange={(exhibition) => {
              console.log('Exhibition changed:', exhibition.title);
            }}
          />
        </motion.main>

        {/* Gallery Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-900 text-white mt-16"
        >
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">About the Gallery</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  The Constellation Codex Gallery transforms software development into an art form,
                  celebrating the creativity and craftsmanship of developers worldwide.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Visiting Information</h3>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>Open 24/7 • Always Online</li>
                  <li>Free Admission • Open Source</li>
                  <li>Virtual Tours Available</li>
                  <li>New Exhibitions Weekly</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
                <div className="flex items-center gap-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Shield className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Target className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <StarIcon className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2024 Constellation Codex Gallery. Celebrating code as contemporary art.</p>
            </div>
          </div>
        </motion.footer>

        {/* Back to Home Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-8 left-8"
        >
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full hover:shadow-xl transition-shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </a>
        </motion.div>
      </div>
    </>
  );
}