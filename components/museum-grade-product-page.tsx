/**
 * Museum-Grade Product Page for Foil Constellation Posters
 *
 * A luxury gallery e-commerce experience that transforms product browsing
 * into a sophisticated art acquisition journey.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation, useScroll, useTransform } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Frame,
  Award,
  Clock,
  Package,
  Shield,
  Star,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ArrowRight,
  Check
} from 'lucide-react';

// ==================== TYPES & INTERFACES ====================

interface ProductVariant {
  id: string;
  name: string;
  size: string;
  dimensions: { width: number; height: number; unit: 'in' | 'cm' };
  edition: string;
  editionSize: number;
  price: number;
  foilColor: 'gold' | 'silver' | 'copper' | 'platinum';
  paperType: 'archival' | 'museum' | 'premium';
  frameIncluded: boolean;
  stock: number;
  artistProof: boolean;
}

interface GalleryImage {
  id: string;
  type: 'main' | 'detail' | 'lifestyle' | 'macro' | '3d' | 'ar';
  url: string;
  alt: string;
  zoomLevel?: number;
}

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  date: Date;
  helpful: number;
}

// ==================== SAMPLE DATA ====================

const PRODUCT_VARIANTS: ProductVariant[] = [
  {
    id: 'fs-orion-gold-16x20',
    name: 'Orion\'s Belt',
    size: '16" x 20"',
    dimensions: { width: 16, height: 20, unit: 'in' },
    edition: 'Limited Edition',
    editionSize: 250,
    price: 450,
    foilColor: 'gold',
    paperType: 'archival',
    frameIncluded: false,
    stock: 47,
    artistProof: false
  },
  {
    id: 'fs-orion-gold-24x36',
    name: 'Orion\'s Belt',
    size: '24" x 36"',
    dimensions: { width: 24, height: 36, unit: 'in' },
    edition: 'Limited Edition',
    editionSize: 100,
    price: 890,
    foilColor: 'gold',
    paperType: 'museum',
    frameIncluded: true,
    stock: 12,
    artistProof: false
  },
  {
    id: 'fs-orion-gold-40x60-ap',
    name: 'Orion\'s Belt (Artist Proof)',
    size: '40" x 60"',
    dimensions: { width: 40, height: 60, unit: 'in' },
    edition: 'Artist Proof',
    editionSize: 10,
    price: 2500,
    foilColor: 'gold',
    paperType: 'premium',
    frameIncluded: true,
    stock: 2,
    artistProof: true
  }
];

const GALLERY_IMAGES: GalleryImage[] = [
  { id: 'main', type: 'main', url: '/api/placeholder/1200/1600', alt: 'Orion\'s Belt constellation in gold foil' },
  { id: 'detail-1', type: 'detail', url: '/api/placeholder/800/800', alt: 'Macro detail of gold foil application' },
  { id: 'detail-2', type: 'macro', url: '/api/placeholder/600/600', alt: 'Close-up of foil texture and paper' },
  { id: 'lifestyle-1', type: 'lifestyle', url: '/api/placeholder/1000/667', alt: 'Poster in luxury living room setting' },
  { id: 'lifestyle-2', type: 'lifestyle', url: '/api/placeholder/1000/667', alt: 'Gallery wall installation' },
  { id: '3d', type: '3d', url: '/api/placeholder/1200/800', alt: '3D preview of framed poster' }
];

const SAMPLE_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Alexandra Chen',
    location: 'New York, NY',
    rating: 5,
    title: 'Breathtaking quality',
    content: 'The foil work is absolutely stunning. This piece transformed my entire living room. The attention to detail and packaging made it feel like a true gallery purchase.',
    verified: true,
    date: new Date('2024-01-15'),
    helpful: 24
  },
  {
    id: '2',
    name: 'Marcus Williams',
    location: 'Los Angeles, CA',
    rating: 5,
    title: 'Museum quality indeed',
    content: 'As an art collector, I\'m impressed by the archival quality and the precision of the foil application. The certificate of authenticity adds a professional touch.',
    verified: true,
    date: new Date('2024-01-10'),
    helpful: 18
  }
];

// ==================== COMPONENTS ====================

interface ImageGalleryProps {
  images: GalleryImage[];
  selectedVariant: ProductVariant;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, selectedVariant }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setSelectedIndex(prev => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, images.length]);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      if (direction === 'in') return Math.min(prev + 0.5, 3);
      return Math.max(prev - 0.5, 1);
    });
  };

  const selectedImage = images[selectedIndex];

  return (
    <div className="image-gallery" ref={galleryRef}>
      {/* Main Image Display */}
      <div className="main-image-container relative bg-neutral-900 rounded-2xl overflow-hidden">
        <motion.div
          className="main-image-wrapper"
          animate={{ scale: zoomLevel }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
        >
          <img
            src={selectedImage.url}
            alt={selectedImage.alt}
            className="w-full h-full object-cover"
            style={{
              maxHeight: isFullscreen ? '90vh' : '700px',
              objectPosition: 'center'
            }}
          />
        </motion.div>

        {/* Zoom Controls */}
        <div className="zoom-controls absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => handleZoom('in')}
            disabled={zoomLevel >= 3}
            className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-lg disabled:opacity-50"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={() => handleZoom('out')}
            disabled={zoomLevel <= 1}
            className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-lg disabled:opacity-50"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-lg"
          >
            <Maximize2 size={20} />
          </button>
        </div>

        {/* Image Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium capitalize">
            {selectedImage.type === 'macro' ? 'Macro Detail' :
             selectedImage.type === 'detail' ? 'Detail View' :
             selectedImage.type === 'lifestyle' ? 'In Situ' :
             selectedImage.type === '3d' ? '3D Preview' :
             selectedImage.type === 'ar' ? 'AR View' : 'Main View'}
          </span>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setSelectedIndex(prev => (prev + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="thumbnail-strip mt-4 flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all ${
              selectedIndex === index
                ? 'ring-2 ring-serbia-red-600 ring-offset-2'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-20 h-20 object-cover"
            />
            {selectedIndex === index && (
              <div className="absolute inset-0 bg-serbia-red-600/20" />
            )}
          </button>
        ))}
      </div>

      {/* Auto-play Controls */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="px-4 py-2 flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
        >
          {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isAutoPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
        </button>
      </div>
    </div>
  );
};

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange
}) => {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="variant-selector">
      <h3 className="text-lg font-semibold mb-4">Available Editions</h3>

      <div className="space-y-3">
        {variants.map((variant) => (
          <motion.div
            key={variant.id}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedVariant.id === variant.id
                ? 'border-serbia-red-600 bg-serbia-red-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
            onClick={() => onVariantChange(variant)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{variant.size}</h4>
                  {variant.artistProof && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs rounded-full font-medium">
                      Artist Proof
                    </span>
                  )}
                  {variant.stock <= 5 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                      Only {variant.stock} left
                    </span>
                  )}
                </div>

                <p className="text-sm text-neutral-600 mb-2">
                  {variant.edition} • {variant.editionSize} edition
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-neutral-100 rounded">
                    {variant.foilColor} foil
                  </span>
                  <span className="text-xs px-2 py-1 bg-neutral-100 rounded">
                    {variant.paperType} paper
                  </span>
                  {variant.frameIncluded && (
                    <span className="text-xs px-2 py-1 bg-neutral-100 rounded">
                      Frame included
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-2xl font-bold">${variant.price}</div>
                <div className="text-sm text-neutral-600 line-through">
                  ${(variant.price * 1.2).toFixed(0)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Button */}
      <button
        onClick={() => setShowComparison(!showComparison)}
        className="mt-4 text-sm text-serbia-red-600 hover:text-serbia-red-700 font-medium flex items-center gap-1"
      >
        <RotateCw size={16} />
        Compare all editions
      </button>

      {/* Size Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-neutral-50 rounded-xl"
          >
            <h4 className="font-semibold mb-3">Size Comparison</h4>
            <div className="space-y-2">
              {variants.map((variant) => {
                const maxSize = Math.max(...variants.map(v => v.dimensions.width));
                const scale = variant.dimensions.width / maxSize;

                return (
                  <div key={variant.id} className="flex items-center gap-3">
                    <div className="w-16 text-sm font-medium">{variant.size}</div>
                    <div className="flex-1 bg-neutral-200 rounded h-8 relative">
                      <div
                        className="absolute top-0 left-0 h-full bg-serbia-red-600 rounded flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${scale * 100}%` }}
                      >
                        {variant.dimensions.width}" × {variant.dimensions.height}"
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductSpecs: React.FC<{ variant: ProductVariant }> = ({ variant }) => {
  const specs = [
    { label: 'Print Method', value: 'Hand-applied foil stamping' },
    { label: 'Paper Type', value: `${variant.paperType === 'archival' ? 'Hahnemühle Photo Rag' : variant.paperType === 'museum' ? 'Somerset Velvet' : 'Canson Infinity'} (308gsm)` },
    { label: 'Foil', value: `22kt ${variant.foilColor} leaf` },
    { label: 'Print Run', value: `${variant.editionSize} numbered prints` },
    { label: 'Signed', value: 'Artist signature & edition number' },
    { label: 'Certificate', value: 'Certificate of authenticity included' },
    { label: 'Packaging', value: 'Acid-free archival sleeve + custom box' },
    { label: 'Estimated Delivery', value: '7-10 business days' }
  ];

  return (
    <div className="product-specs">
      <h3 className="text-lg font-semibold mb-4">Specifications</h3>
      <dl className="space-y-3">
        {specs.map((spec, index) => (
          <div key={index} className="flex justify-between py-2 border-b border-neutral-200">
            <dt className="text-sm text-neutral-600">{spec.label}</dt>
            <dd className="text-sm font-medium text-right ml-4">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

const AuthenticityGuarantee: React.FC = () => {
  const guarantees = [
    { icon: Shield, text: '100% authenticity guaranteed' },
    { icon: Award, text: 'Artist-signed certificate' },
    { icon: Package, text: 'Secure archival packaging' },
    { icon: Clock, text: '30-day return policy' }
  ];

  return (
    <div className="authenticity-guarantee mt-8 p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl">
      <h3 className="text-lg font-semibold mb-4">Gallery Guarantee</h3>
      <div className="grid grid-cols-2 gap-3">
        {guarantees.map((guarantee, index) => (
          <div key={index} className="flex items-center gap-2">
            <guarantee.icon size={16} className="text-serbia-red-600" />
            <span className="text-sm">{guarantee.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CountdownTimer: React.FC<{ endTime: Date; editionSize: number; remaining: number }> = ({
  endTime,
  editionSize,
  remaining
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="countdown-timer mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-red-700">Limited Edition Release</h4>
        <span className="text-sm text-red-600">{remaining}/{editionSize} available</span>
      </div>

      <div className="text-center mb-3">
        <p className="text-sm text-red-600">Edition closes in:</p>
        <div className="flex justify-center gap-3 mt-2">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="text-center">
              <div className="bg-red-600 text-white rounded-lg p-2 min-w-[50px]">
                <div className="text-xl font-bold">{value.toString().padStart(2, '0')}</div>
              </div>
              <div className="text-xs text-red-600 mt-1 capitalize">{unit}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full bg-red-200 rounded-full h-2">
        <div
          className="bg-red-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(remaining / editionSize) * 100}%` }}
        />
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const MuseumGradeProductPage: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(PRODUCT_VARIANTS[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);
  const headerY = useTransform(scrollY, [0, 100], [0, -20]);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsAddingToCart(false);
    setAddedToCart(true);

    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className="museum-product-page min-h-screen bg-white">
      {/* Sticky Header */}
      <motion.header
        className="sticky top-0 z-50 bg-white border-b border-neutral-200 px-6 py-4"
        style={{ opacity: headerOpacity, y: headerY }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Foil Constellation: {selectedVariant.name}</h1>
            <p className="text-sm text-neutral-600">
              {selectedVariant.size} • {selectedVariant.foilColor} foil • ${selectedVariant.price}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Heart
                size={20}
                className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-600'}
              />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <Share2 size={20} className="text-neutral-600" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || addedToCart}
              className="px-6 py-2 bg-serbia-red-600 text-white rounded-lg font-medium hover:bg-serbia-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4" />
                  Adding...
                </>
              ) : addedToCart ? (
                <>
                  <Check size={20} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Gallery */}
          <div>
            <ImageGallery images={GALLERY_IMAGES} selectedVariant={selectedVariant} />
          </div>

          {/* Right Column - Product Info */}
          <div>
            {/* Product Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Foil Constellation: {selectedVariant.name}</h1>
              <p className="text-xl text-neutral-600 mb-4">
                Hand-crafted foil art print • Limited edition of {selectedVariant.editionSize}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-neutral-600">
                  4.9 (127 reviews) • <span className="text-green-600 font-medium">In Stock</span>
                </span>
              </div>
            </div>

            {/* Price Display */}
            <div className="mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">${selectedVariant.price}</span>
                {selectedVariant.artistProof && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full text-sm font-medium">
                    Artist Proof
                  </span>
                )}
              </div>
              {selectedVariant.frameIncluded && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <Check size={16} />
                  Museum-grade frame included ($200 value)
                </p>
              )}
            </div>

            {/* Variant Selector */}
            <VariantSelector
              variants={PRODUCT_VARIANTS}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center border border-neutral-300 rounded-lg px-3 py-2"
                  min="1"
                  max={selectedVariant.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                  className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  +
                </button>
                <span className="text-sm text-neutral-600 ml-2">
                  {selectedVariant.stock} available
                </span>
              </div>
            </div>

            {/* Countdown Timer */}
            <CountdownTimer
              endTime={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
              editionSize={selectedVariant.editionSize}
              remaining={selectedVariant.stock}
            />

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || addedToCart || selectedVariant.stock === 0}
              className="w-full py-4 bg-serbia-red-600 text-white rounded-xl font-semibold hover:bg-serbia-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4"
            >
              {isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full border-3 border-white border-t-transparent h-6 w-6" />
                  Processing order...
                </>
              ) : addedToCart ? (
                <>
                  <Check size={24} />
                  Added to cart successfully!
                </>
              ) : selectedVariant.stock === 0 ? (
                <>Sold Out</>
              ) : (
                <>
                  <ShoppingCart size={24} />
                  Add {quantity} to Cart - ${(selectedVariant.price * quantity).toFixed(0)}
                </>
              )}
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button className="py-3 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
                <Heart size={20} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
                {isWishlisted ? 'Saved' : 'Save for Later'}
              </button>
              <button className="py-3 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
                <Share2 size={20} />
                Share
              </button>
            </div>

            {/* Product Specifications */}
            <ProductSpecs variant={selectedVariant} />

            {/* Authenticity Guarantee */}
            <AuthenticityGuarantee />
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-16 space-y-16">
          {/* Story Section */}
          <section className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">The Art of Foil Constellations</h2>
            <div className="prose prose-lg mx-auto text-neutral-600">
              <p className="mb-6">
                Each foil constellation is a masterpiece of traditional craftsmanship meeting modern astronomy.
                Our artists hand-apply genuine 22-karat gold leaf using techniques passed down through generations
                of master printers.
              </p>
              <p className="mb-6">
                The constellations are mapped using precision astronomical data, ensuring every star's position
                is scientifically accurate while creating a stunning visual impact. The foil application process
                takes over 8 hours per print, with each star individually placed by hand.
              </p>
              <p>
                Limited to just {selectedVariant.editionSize} numbered prints worldwide, each piece is signed
                by the artist and comes with a certificate of authenticity, making it not just art, but an
                investment in craftsmanship.
              </p>
            </div>
          </section>

          {/* Reviews Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center">Collector Reviews</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {SAMPLE_REVIEWS.map((review) => (
                <div key={review.id} className="bg-neutral-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600">{review.date.toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{review.title}</h3>
                  <p className="text-neutral-600 mb-3">{review.content}</p>
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <div className="font-medium">{review.name}</div>
                      <div className="text-neutral-500">{review.location}</div>
                    </div>
                    {review.verified && (
                      <span className="text-green-600 flex items-center gap-1">
                        <Check size={16} />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .transition-all-300 {
          transition: all var(--duration-normal) var(--ease-smooth);
        }
      `}</style>
    </div>
  );
};

export default MuseumGradeProductPage;