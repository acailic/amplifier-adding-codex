/**
 * Luxury Gallery Showcase with 3D & AR
 *
 * Advanced visualization features for the foil constellation posters,
 * including 3D room placement, AR preview, and interactive gallery tour.
 */

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import {
  Camera,
  RotateCw,
  Move3d,
  Smartphone,
  Maximize2,
  Play,
  Volume2,
  VolumeX,
  Home,
  Palette,
  Package,
  Info,
  Download,
  Share2,
  Settings,
  Eye,
  Frame,
  Grid3x3
} from 'lucide-react';

// ==================== COMPONENTS ====================

interface RoomPreviewProps {
  posterSize: { width: number; height: number; unit: 'in' | 'cm' };
  frameStyle: string;
  onSettingsChange: (settings: any) => void;
}

const RoomPreview: React.FC<RoomPreviewProps> = ({
  posterSize,
  frameStyle,
  onSettingsChange
}) => {
  const [viewAngle, setViewAngle] = useState(45);
  const [distance, setDistance] = useState(5);
  const [roomStyle, setRoomStyle] = useState('modern');
  const [isRotating, setIsRotating] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const roomStyles = {
    modern: {
      bg: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
      wall: '#ffffff',
      floor: '#f0f0f0',
      accent: '#2c3e50'
    },
    classic: {
      bg: 'linear-gradient(135deg, #f9f6f2 0%, #e8dfce 100%)',
      wall: '#faf8f3',
      floor: '#d4c5b0',
      accent: '#8b7355'
    },
    gallery: {
      bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      wall: '#2a2a2a',
      floor: '#1f1f1f',
      accent: '#d4af37'
    }
  };

  const currentStyle = roomStyles[roomStyle as keyof typeof roomStyles];

  return (
    <div className="room-preview h-full bg-gray-100 rounded-2xl overflow-hidden relative">
      {/* Room Scene */}
      <div
        className="room-scene h-full relative"
        style={{
          background: currentStyle.bg,
          perspective: '1000px'
        }}
      >
        {/* Back Wall */}
        <div
          className="absolute inset-x-0 top-0 h-3/5"
          style={{
            background: currentStyle.wall,
            transform: `rotateX(${viewAngle}deg) translateZ(-${distance * 50}px)`,
            transformOrigin: 'bottom'
          }}
        />

        {/* Floor */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/5"
          style={{
            background: currentStyle.floor,
            transform: `rotateX(-${30 - viewAngle}deg) translateZ(${distance * 20}px)`,
            transformOrigin: 'top'
          }}
        />

        {/* Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 grid-rows-8 h-full">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border border-gray-400" />
              ))}
            </div>
          </div>
        )}

        {/* Poster on Wall */}
        <motion.div
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
          animate={{
            rotateY: isRotating ? 360 : 0,
          }}
          transition={{
            rotateY: { duration: 10, repeat: isRotating ? Infinity : 0, ease: 'linear' }
          }}
          style={{
            width: `${posterSize.width * 8}px`,
            height: `${posterSize.height * 8}px`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Frame */}
          <div
            className="absolute inset-0 rounded-lg shadow-2xl"
            style={{
              background: frameStyle === 'gold' ? 'linear-gradient(135deg, #FFD700, #B8860B)' :
                        frameStyle === 'black' ? '#1a1a1a' :
                        frameStyle === 'wood' ? 'linear-gradient(135deg, #8B4513, #654321)' :
                        '#ffffff',
              padding: frameStyle === 'minimal' ? '2px' : '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Poster */}
            <div
              className="w-full h-full rounded bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at center, #FFD700 0%, #B8860B 50%, transparent 70%)'
              }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <div className="text-sm font-medium text-gray-700">Foil Constellation</div>
                <div className="text-xs text-gray-600">{posterSize.width}" × {posterSize.height}"</div>
              </div>
            </div>
          </div>

          {/* Lighting Effect */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 100%)',
            }}
          />
        </motion.div>

        {/* Room Elements */}
        {/* Sofa */}
        <div
          className="absolute bottom-10 left-10 w-32 h-20 rounded-lg shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #8B4513, #654321)',
            transform: `translateX(-${distance * 10}px)`
          }}
        />

        {/* Plant */}
        <div
          className="absolute bottom-10 right-10 w-16 h-24 rounded-full shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #228B22, #006400)',
            transform: `translateX(${distance * 10}px)`
          }}
        />
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 space-y-3">
        <div>
          <label className="text-xs font-medium">View Angle</label>
          <input
            type="range"
            min="0"
            max="60"
            value={viewAngle}
            onChange={(e) => setViewAngle(Number(e.target.value))}
            className="w-32"
          />
        </div>
        <div>
          <label className="text-xs font-medium">Distance</label>
          <input
            type="range"
            min="2"
            max="10"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-32"
          />
        </div>
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="w-full py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          {isRotating ? 'Stop' : 'Start'} Rotation
        </button>
      </div>

      {/* Room Style Selector */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
        <div className="flex gap-2">
          {Object.keys(roomStyles).map((style) => (
            <button
              key={style}
              onClick={() => setRoomStyle(style)}
              className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                roomStyle === style
                  ? 'bg-serbia-red-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ARViewerProps {
  posterImage: string;
  posterSize: { width: number; height: number };
}

const ARViewer: React.FC<ARViewerProps> = ({ posterImage, posterSize }) => {
  const [isSupported, setIsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [arMode, setArMode] = useState<'camera' | 'upload'>('camera');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check WebXR support
    if (!navigator.xr) {
      setIsSupported(false);
    }
  }, []);

  const startAR = async () => {
    setIsLoading(true);
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('AR access denied:', error);
    }
    setIsLoading(false);
  };

  if (!isSupported) {
    return (
      <div className="ar-viewer h-full bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <Smartphone size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">AR Not Supported</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your device doesn't support AR features. Try on a mobile device with AR capabilities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-viewer h-full bg-gray-100 rounded-2xl overflow-hidden relative">
      {/* Camera Feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
      />

      {/* AR Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Placeholder for AR tracking */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-64 h-80 border-2 border-white rounded-lg shadow-2xl">
            <img
              src={posterImage}
              alt="AR Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          {/* AR Instructions */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-white bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              Point camera at a wall to place artwork
            </p>
          </div>
        </div>
      </div>

      {/* AR Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={startAR}
            disabled={isLoading}
            className="px-6 py-2 bg-serbia-red-600 text-white rounded-lg font-medium hover:bg-serbia-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4" />
                Starting AR...
              </>
            ) : (
              <>
                <Camera size={20} />
                Start AR View
              </>
            )}
          </button>
          <button className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
            <Grid3x3 size={20} />
          </button>
          <button className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

interface InteractiveGalleryProps {
  artworks: Array<{
    id: string;
    title: string;
    artist: string;
    price: number;
    image: string;
  }>;
  selectedArtwork?: string;
  onArtworkSelect: (id: string) => void;
}

const InteractiveGallery: React.FC<InteractiveGalleryProps> = ({
  artworks,
  selectedArtwork,
  onArtworkSelect
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'carousel' | '3d'>('grid');
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="interactive-gallery h-full bg-gray-900 rounded-2xl overflow-hidden">
      {/* Gallery Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold">Virtual Gallery</h3>
          <div className="flex gap-2">
            {(['grid', 'carousel', '3d'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-serbia-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="p-6 h-[calc(100%-80px)] overflow-auto">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 gap-4">
            {artworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                  selectedArtwork === artwork.id ? 'ring-2 ring-serbia-red-600' : ''
                }`}
                onClick={() => onArtworkSelect(artwork.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <div className="font-semibold text-sm">{artwork.title}</div>
                    <div className="text-xs opacity-80">{artwork.artist}</div>
                    <div className="text-sm font-bold mt-1">${artwork.price}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {viewMode === 'carousel' && (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + artworks.length) % artworks.length)}
              className="absolute left-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              ←
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="w-full max-w-md"
              >
                <img
                  src={artworks[currentSlide].image}
                  alt={artworks[currentSlide].title}
                  className="w-full h-96 object-cover rounded-lg shadow-2xl"
                />
                <div className="mt-4 text-center">
                  <h4 className="text-white text-xl font-semibold">{artworks[currentSlide].title}</h4>
                  <p className="text-gray-400">{artworks[currentSlide].artist}</p>
                  <p className="text-white text-2xl font-bold mt-2">${artworks[currentSlide].price}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % artworks.length)}
              className="absolute right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              →
            </button>
          </div>
        )}

        {viewMode === '3d' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Move3d size={48} className="mx-auto mb-4" />
              <p>3D Gallery View</p>
              <p className="text-sm">Coming Soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

interface LuxuryGalleryShowcaseProps {
  posterSize: { width: number; height: number; unit: 'in' | 'cm' };
  posterImage: string;
  frameStyle: string;
}

const LuxuryGalleryShowcase: React.FC<LuxuryGalleryShowcaseProps> = ({
  posterSize,
  posterImage,
  frameStyle
}) => {
  const [activeView, setActiveView] = useState<'3d' | 'ar' | 'gallery'>('3d');
  const [settings, setSettings] = useState({
    roomStyle: 'modern',
    lighting: 'natural',
    frameWidth: 'standard'
  });

  const sampleArtworks = [
    {
      id: '1',
      title: 'Orion\'s Belt',
      artist: 'John Smith',
      price: 450,
      image: posterImage
    },
    {
      id: '2',
      title: 'Andromeda',
      artist: 'Sarah Johnson',
      price: 520,
      image: '/api/placeholder/400/300'
    },
    {
      id: '3',
      title: 'Cassiopeia',
      artist: 'Michael Chen',
      price: 380,
      image: '/api/placeholder/400/300'
    },
    {
      id: '4',
      title: 'Draco',
      artist: 'Emma Wilson',
      price: 410,
      image: '/api/placeholder/400/300'
    }
  ];

  return (
    <div className="luxury-gallery-showcase h-[800px] bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* View Selector */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Premium Visualization Suite</h2>
        <div className="flex gap-3">
          {[
            { id: '3d', label: '3D Room Preview', icon: Home },
            { id: 'ar', label: 'AR Placement', icon: Smartphone },
            { id: 'gallery', label: 'Virtual Gallery', icon: Frame }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeView === view.id
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <view.icon size={18} />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="h-[calc(100%-180px)] p-6">
        <AnimatePresence mode="wait">
          {activeView === '3d' && (
            <motion.div
              key="3d"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <RoomPreview
                posterSize={posterSize}
                frameStyle={frameStyle}
                onSettingsChange={setSettings}
              />
            </motion.div>
          )}

          {activeView === 'ar' && (
            <motion.div
              key="ar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <ARViewer
                posterImage={posterImage}
                posterSize={posterSize}
              />
            </motion.div>
          )}

          {activeView === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <InteractiveGallery
                artworks={sampleArtworks}
                onArtworkSelect={(id) => console.log('Selected:', id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-6 py-4 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {activeView === '3d' && 'Preview your artwork in realistic room settings'}
            {activeView === 'ar' && 'Use your camera to see the artwork on your wall'}
            {activeView === 'gallery' && 'Explore curated collections in our virtual space'}
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Download size={18} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Share2 size={18} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Info size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuxuryGalleryShowcase;