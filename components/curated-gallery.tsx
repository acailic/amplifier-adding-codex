/**
 * Curated Exhibition Gallery - Constellation Codex Gallery
 *
 * Purpose: Transform data visualization into a high-end museum exhibition experience
 * featuring developer work as prestigious art pieces with curatorial context
 *
 * Features:
 * - Exhibition-style sections with curatorial narratives
 * - Museum-grade spacing and typography
 * - Interactive artwork exploration
 * - Curatorial filters and thematic collections
 * - Developer spotlights and featured exhibitions
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  memo
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X,
  Filter,
  Calendar,
  Award,
  Star,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Search,
  Info,
  Play,
  Pause,
  Maximize2,
  ArrowRight,
  Clock,
  User,
  Code,
  Activity,
  Quote,
  Minimize2,
  Zap
} from 'lucide-react';
import ConstellationVisualization, {
  StarNode,
  ConnectionData,
  ConstellationEvent,
  ConstellationVisualizationRef
} from './constellation-visualization';

// ==================== TYPE DEFINITIONS ====================

export interface ArtworkMetadata {
  id: string;
  title: string;
  artist: string; // Developer name
  createdAt: Date;
  lastModified: Date;
  technique: string; // Programming language/framework
  medium: string; // Type of contribution
  dimensions: {
    lines: number;
    files: number;
    complexity: number;
  };
  curatorNotes: string;
  statement?: string; // Artist's statement about the work
  exhibitionHistory: string[];
  awards: string[];
  tags: string[];
  collection: string;
}

export interface Exhibition {
  id: string;
  title: string;
  subtitle: string;
  curator: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  featuredArtworks: string[]; // Artwork IDs
  theme: string;
  color: string;
}

export interface GalleryProps {
  nodes: StarNode[];
  connections: ConnectionData[];
  events: ConstellationEvent[];
  metadata: Map<string, ArtworkMetadata>;
  exhibitions?: Exhibition[];
  className?: string;
  onArtworkSelect?: (artwork: ArtworkMetadata) => void;
  onExhibitionChange?: (exhibition: Exhibition) => void;
}

// ==================== EXHIBITION CONFIGURATION ====================

const DEFAULT_EXHIBITIONS: Exhibition[] = [
  {
    id: 'constellations-week',
    title: 'Constellations of the Week',
    subtitle: 'Emerging Patterns in Digital Cosmos',
    curator: 'Digital Curation Team',
    startDate: new Date(),
    description: 'A weekly showcase of the most compelling code constellations, where architecture meets artistry in the digital realm.',
    featuredArtworks: [],
    theme: 'Weekly Highlights',
    color: '#6366f1'
  },
  {
    id: 'high-intensity',
    title: 'High-Intensity Builders',
    subtitle: 'Monuments of Digital Labor',
    curator: 'Performance Curator',
    startDate: new Date(),
    description: 'Celebrating the architects of complexity, whose work demonstrates exceptional dedication and technical mastery.',
    featuredArtworks: [],
    theme: 'High Performance',
    color: '#ef4444'
  },
  {
    id: 'quiet-masters',
    title: 'Quiet Masters',
    subtitle: 'The Subtle Art of Refinement',
    curator: 'Minimalism Curator',
    startDate: new Date(),
    description: 'Honoring the unsung heroes of code—those whose precise, thoughtful improvements create the foundation of excellence.',
    featuredArtworks: [],
    theme: 'Elegant Solutions',
    color: '#10b981'
  },
  {
    id: 'emerging-patterns',
    title: 'Emerging Patterns',
    subtitle: 'Novel Approaches to Ageless Problems',
    curator: 'Innovation Curator',
    startDate: new Date(),
    description: 'Exploring the bleeding edge of software architecture, where new paradigms and patterns challenge conventional thinking.',
    featuredArtworks: [],
    theme: 'Innovation',
    color: '#f59e0b'
  }
];

const COLLECTION_THEMES = [
  { id: 'architecture', name: 'Software Architecture', icon: Code },
  { id: 'performance', name: 'Performance Art', icon: Activity },
  { id: 'minimalism', name: 'Code Minimalism', icon: Minimize2 },
  { id: 'innovation', name: 'Digital Innovation', icon: Zap },
  { id: 'craftsmanship', name: 'Technical Craft', icon: Award }
];

// ==================== SUBCOMPONENTS ====================

interface CuratorialPanelProps {
  exhibition: Exhibition;
  artworkCount: number;
  onFilterChange?: (filter: string) => void;
  selectedFilter: string;
}

const CuratorialPanel = memo<CuratorialPanelProps>(({
  exhibition,
  artworkCount,
  onFilterChange,
  selectedFilter
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="curatorial-panel bg-white border-l-4 shadow-lg p-8 mb-8"
      style={{ borderLeftColor: exhibition.color }}
    >
      {/* Exhibition Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <motion.h1
            className="text-4xl font-light text-gray-900 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {exhibition.title}
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {exhibition.subtitle}
          </motion.p>
          <motion.div
            className="flex items-center gap-4 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {exhibition.curator}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {exhibition.startDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {artworkCount} works
            </span>
          </motion.div>
        </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: exhibition.color }}
        >
          {exhibition.title.charAt(0)}
        </motion.div>
      </div>

      {/* Curatorial Statement */}
      <motion.div
        className="prose prose-lg max-w-none mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-gray-700 leading-relaxed italic">
          {exhibition.description}
        </p>
      </motion.div>

      {/* Thematic Filters */}
      {onFilterChange && (
        <motion.div
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span className="text-sm font-medium text-gray-500 self-center">Explore by theme:</span>
          {COLLECTION_THEMES.map((theme) => {
            const Icon = theme.icon;
            return (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onFilterChange(theme.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedFilter === theme.id
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {theme.name}
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
});

CuratorialPanel.displayName = 'CuratorialPanel';

interface ArtworkCardProps {
  artwork: ArtworkMetadata;
  node?: StarNode;
  onSelect: (artwork: ArtworkMetadata) => void;
  onHover: (artwork: ArtworkMetadata | null) => void;
  featured?: boolean;
}

const ArtworkCard = memo<ArtworkCardProps>(({
  artwork,
  node,
  onSelect,
  onHover,
  featured = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  }, [isLiked]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  }, [isSaved]);

  return (
    <motion.div
      layoutId={`artwork-${artwork.id}`}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(artwork)}
      onMouseEnter={() => onHover(artwork)}
      onMouseLeave={() => onHover(null)}
      className={`group bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
        featured ? 'ring-2 ring-offset-2 ring-blue-500' : ''
      }`}
    >
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {artwork.title}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <User className="w-4 h-4" />
              {artwork.artist}
            </p>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors ${
                isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={handleSave}
              className={`p-2 rounded-full transition-colors ${
                isSaved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Technical Details */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            {artwork.technique}
          </span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {artwork.medium}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {artwork.lastModified.toLocaleDateString()}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-lg font-semibold text-gray-900">{artwork.dimensions.lines.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Lines</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-lg font-semibold text-gray-900">{artwork.dimensions.files}</div>
            <div className="text-xs text-gray-500">Files</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-lg font-semibold text-gray-900">{artwork.dimensions.complexity}</div>
            <div className="text-xs text-gray-500">Complexity</div>
          </div>
        </div>
      </div>

      {/* Curatorial Notes */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Curator's Notes</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
          {artwork.curatorNotes}
        </p>

        {/* Tags */}
        {artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {artwork.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {artwork.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                +{artwork.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {artwork.exhibitionHistory.length > 0 && (
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                {artwork.exhibitionHistory.length} exhibitions
              </span>
            )}
            {artwork.awards.length > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {artwork.awards.length} awards
              </span>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
});

ArtworkCard.displayName = 'ArtworkCard';

interface ArtworkDetailModalProps {
  artwork: ArtworkMetadata | null;
  node?: StarNode;
  isOpen: boolean;
  onClose: () => void;
}

const ArtworkDetailModal = memo<ArtworkDetailModalProps>(({
  artwork,
  node,
  isOpen,
  onClose
}) => {
  const reducedMotion = useReducedMotion();

  if (!artwork) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={onClose}
        >
          <motion.div
            layoutId={`artwork-${artwork.id}`}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            initial={!reducedMotion ? { scale: 0.9, opacity: 0 } : {}}
            animate={!reducedMotion ? { scale: 1, opacity: 1 } : {}}
            exit={!reducedMotion ? { scale: 0.9, opacity: 0 } : {}}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-light text-gray-900 mb-2">{artwork.title}</h2>
                  <p className="text-lg text-gray-600">by {artwork.artist}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Artwork Statement */}
              {artwork.statement && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Quote className="w-5 h-5 text-blue-600" />
                    Artist's Statement
                  </h3>
                  <blockquote className="text-gray-700 italic leading-relaxed border-l-4 border-blue-200 pl-6">
                    {artwork.statement}
                  </blockquote>
                </div>
              )}

              {/* Technical Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Technical Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Technique:</dt>
                      <dd className="font-medium">{artwork.technique}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Medium:</dt>
                      <dd className="font-medium">{artwork.medium}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Created:</dt>
                      <dd className="font-medium">{artwork.createdAt.toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Dimensions</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Lines of Code:</dt>
                      <dd className="font-medium">{artwork.dimensions.lines.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Files:</dt>
                      <dd className="font-medium">{artwork.dimensions.files}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Complexity Score:</dt>
                      <dd className="font-medium">{artwork.dimensions.complexity}/10</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Exhibition History */}
              {artwork.exhibitionHistory.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3">Exhibition History</h4>
                  <ul className="space-y-2">
                    {artwork.exhibitionHistory.map((exhibition, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {exhibition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curatorial Analysis */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Curatorial Analysis
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {artwork.curatorNotes}
                </p>
              </div>

              {/* Tags */}
              {artwork.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {artwork.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ArtworkDetailModal.displayName = 'ArtworkDetailModal';

// ==================== MAIN GALLERY COMPONENT ====================

export const CuratedGallery: React.FC<GalleryProps> = ({
  nodes,
  connections,
  events,
  metadata,
  exhibitions = DEFAULT_EXHIBITIONS,
  className = '',
  onArtworkSelect,
  onExhibitionChange
}) => {
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition>(exhibitions[0]);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMetadata | null>(null);
  const [hoveredArtwork, setHoveredArtwork] = useState<ArtworkMetadata | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const constellationRef = useRef<ConstellationVisualizationRef>(null);
  const reducedMotion = useReducedMotion();

  // Filter artworks based on exhibition and filters
  const filteredArtworks = useMemo(() => {
    let artworks = Array.from(metadata.values());

    // Filter by exhibition theme
    if (selectedExhibition.theme === 'Weekly Highlights') {
      // Show recent high-activity works
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      artworks = artworks.filter(a => a.lastModified > oneWeekAgo)
                       .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
                       .slice(0, 12);
    } else if (selectedExhibition.theme === 'High Performance') {
      artworks = artworks.filter(a => a.dimensions.complexity >= 7)
                       .sort((a, b) => b.dimensions.complexity - a.dimensions.complexity);
    } else if (selectedExhibition.theme === 'Elegant Solutions') {
      artworks = artworks.filter(a => a.dimensions.complexity <= 5 && a.dimensions.files <= 10)
                       .sort((a, b) => a.dimensions.lines - b.dimensions.lines);
    } else if (selectedExhibition.theme === 'Innovation') {
      artworks = artworks.filter(a => a.tags.includes('innovation') || a.tags.includes('experimental'))
                       .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Apply additional filters
    if (selectedFilter) {
      artworks = artworks.filter(a => a.tags.includes(selectedFilter));
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      artworks = artworks.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.artist.toLowerCase().includes(query) ||
        a.technique.toLowerCase().includes(query) ||
        a.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return artworks;
  }, [metadata, selectedExhibition, selectedFilter, searchQuery]);

  // Handle exhibition change
  const handleExhibitionChange = useCallback((exhibition: Exhibition) => {
    setSelectedExhibition(exhibition);
    setSelectedFilter('');
    setSearchQuery('');
    onExhibitionChange?.(exhibition);
  }, [onExhibitionChange]);

  // Handle artwork selection
  const handleArtworkSelect = useCallback((artwork: ArtworkMetadata) => {
    setSelectedArtwork(artwork);
    onArtworkSelect?.(artwork);

    // Highlight corresponding node in constellation
    const node = nodes.find(n => n.id === artwork.id);
    if (node) {
      // Trigger node highlight animation
      setHoveredArtwork(artwork);
      setTimeout(() => setHoveredArtwork(null), 2000);
    }
  }, [nodes, onArtworkSelect]);

  // Toggle constellation animation
  const toggleAnimation = useCallback(() => {
    if (constellationRef.current) {
      if (isPaused) {
        constellationRef.current.resumeAnimations();
      } else {
        constellationRef.current.pauseAnimations();
      }
      setIsPaused(!isPaused);
    }
  }, [isPaused]);

  return (
    <div className={`curated-gallery min-h-screen bg-gray-50 ${className}`}>
      {/* Search and Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search artworks, artists, or techniques..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Exhibition Selector */}
            <div className="flex items-center gap-4 ml-8">
              <select
                value={selectedExhibition.id}
                onChange={(e) => {
                  const exhibition = exhibitions.find(ex => ex.id === e.target.value);
                  if (exhibition) handleExhibitionChange(exhibition);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {exhibitions.map(exhibition => (
                  <option key={exhibition.id} value={exhibition.id}>
                    {exhibition.title}
                  </option>
                ))}
              </select>

              {/* Animation Control */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAnimation}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                title={isPaused ? 'Resume Animation' : 'Pause Animation'}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Curatorial Panel */}
        <CuratorialPanel
          exhibition={selectedExhibition}
          artworkCount={filteredArtworks.length}
          onFilterChange={setSelectedFilter}
          selectedFilter={selectedFilter}
        />

        {/* Main Gallery Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Constellation Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Living Constellation</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  <span>Live Visualization</span>
                </div>
              </div>

              <ConstellationVisualization
                ref={constellationRef}
                nodes={nodes}
                connections={connections}
                events={events}
                width={700}
                height={500}
                animated={!reducedMotion}
                showLabels={false}
                showDataFlow={!reducedMotion}
                theme="dark"
                className="w-full"
                onNodeHover={(node) => {
                  if (node) {
                    const artwork = metadata.get(node.id);
                    if (artwork) setHoveredArtwork(artwork);
                  } else {
                    setHoveredArtwork(null);
                  }
                }}
                onNodeClick={(node) => {
                  const artwork = metadata.get(node.id);
                  if (artwork) handleArtworkSelect(artwork);
                }}
              />

              {/* Hover Information */}
              <AnimatePresence>
                {hoveredArtwork && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <h4 className="font-semibold text-blue-900 mb-1">{hoveredArtwork.title}</h4>
                    <p className="text-sm text-blue-700">{hoveredArtwork.artist} • {hoveredArtwork.technique}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Featured Artworks Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Curator's Picks */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Curator's Picks
              </h3>
              <div className="space-y-4">
                {filteredArtworks.slice(0, 3).map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    node={nodes.find(n => n.id === artwork.id)}
                    onSelect={handleArtworkSelect}
                    onHover={setHoveredArtwork}
                    featured={selectedArtwork?.id === artwork.id}
                  />
                ))}
              </div>
            </div>

            {/* Exhibition Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exhibition Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Artworks</span>
                  <span className="font-semibold">{filteredArtworks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Artists</span>
                  <span className="font-semibold">
                    {new Set(filteredArtworks.map(a => a.artist)).size}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Complexity</span>
                  <span className="font-semibold">
                    {(filteredArtworks.reduce((sum, a) => sum + a.dimensions.complexity, 0) / filteredArtworks.length || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Lines</span>
                  <span className="font-semibold">
                    {filteredArtworks.reduce((sum, a) => sum + a.dimensions.lines, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full Artwork Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-light text-gray-900 mb-8">Complete Exhibition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <ArtworkCard
                  artwork={artwork}
                  node={nodes.find(n => n.id === artwork.id)}
                  onSelect={handleArtworkSelect}
                  onHover={setHoveredArtwork}
                />
              </motion.div>
            ))}
          </div>

          {filteredArtworks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">No artworks found matching your criteria.</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Artwork Detail Modal */}
      <ArtworkDetailModal
        artwork={selectedArtwork}
        node={selectedArtwork ? nodes.find(n => n.id === selectedArtwork.id) : undefined}
        isOpen={!!selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
      />
    </div>
  );
};

// ==================== UTILITY FUNCTIONS ====================

export const createArtworkMetadata = (
  node: StarNode,
  additionalData?: Partial<ArtworkMetadata>
): ArtworkMetadata => {
  return {
    id: node.id,
    title: node.name,
    artist: `Developer ${node.id}`,
    createdAt: node.lastCommit,
    lastModified: node.lastCommit,
    technique: node.metadata?.language || 'Unknown',
    medium: 'Software Architecture',
    dimensions: {
      lines: node.commits * 100, // Estimate
      files: Math.max(1, Math.floor(node.commits / 10)),
      complexity: Math.min(10, Math.max(1, Math.floor(node.commits / 50)))
    },
    curatorNotes: `This work demonstrates ${node.commits} commits of sustained effort and architectural vision.`,
    exhibitionHistory: [],
    awards: node.commits > 100 ? ['High Commmit Award'] : [],
    tags: [node.metadata?.language || 'programming', 'architecture'],
    collection: 'contemporary',
    ...additionalData
  };
};

export default CuratedGallery;