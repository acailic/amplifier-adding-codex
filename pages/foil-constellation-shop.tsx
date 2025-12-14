/**
 * Complete Foil Constellation Shop Page
 *
 * Integration of all museum-grade components into a luxury e-commerce experience
 * that feels like purchasing from a high-end art gallery.
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShoppingBag, User, Menu, X, Star, Award, Shield } from 'lucide-react';

// Lazy load components for performance
const MuseumGradeProductPage = lazy(() => import('../components/museum-grade-product-page'));
const LuxuryGalleryShowcase = lazy(() => import('../components/luxury-gallery-showcase'));
const FoilConstellationStory = lazy(() => import('../components/foil-constellation-story'));

// ==================== HEADER COMPONENT ====================

const GalleryHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-lg'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-serbia-red-600 to-serbia-red-800 rounded-lg flex items-center justify-center">
              <Star className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold">Foil Constellations</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#collection" className="text-neutral-700 hover:text-serbia-red-600 transition-colors">
              Collection
            </a>
            <a href="#process" className="text-neutral-700 hover:text-serbia-red-600 transition-colors">
              The Process
            </a>
            <a href="#artists" className="text-neutral-700 hover:text-serbia-red-600 transition-colors">
              Artists
            </a>
            <a href="#about" className="text-neutral-700 hover:text-serbia-red-600 transition-colors">
              About
            </a>
            <button className="p-2 text-neutral-700 hover:text-serbia-red-600 transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-neutral-700 hover:text-serbia-red-600 transition-colors relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-serbia-red-600 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </button>
            <button className="p-2 text-neutral-700 hover:text-serbia-red-600 transition-colors">
              <User size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t"
            >
              <div className="flex flex-col gap-4">
                <a href="#collection" className="text-neutral-700 hover:text-serbia-red-600 transition-colors">
                  Collection
                </a>
                <a href="#process" className="text-neutral-700 hover:text-serbia-red-600 transition-colors">
                  The Process
                </a>
                <a href="#artists" className="text-neutral-700 hover:text-serbia-red-600 transition-colors">
                  Artists
                </a>
                <a href="#about" className="text-neutral-700 hover:text-serbia-red-600 transition-colors">
                  About
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

// ==================== ANNOUNCEMENT BAR ====================

const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-serbia-red-600 text-white text-center py-2 px-4">
      <div className="max-w-7xl mx-auto flex justify-center items-center gap-2 text-sm">
        <Award className="flex-shrink-0" size={16} />
        <span>
          New Release: Milky Way Limited Edition • Only 50 prints available
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 hover:opacity-70 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// ==================== HERO SECTION ====================

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0">
        <img
          src="/api/placeholder/1920/1080"
          alt="Foil constellation gallery"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Cosmic Artistry
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl mb-8 opacity-90"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Hand-crafted foil constellation posters that bring the night sky into your home
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Explore Collection
          </button>
          <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-black transition-colors">
            Watch Creation Process
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
};

// ==================== COLLECTION PREVIEW ====================

const CollectionPreview: React.FC = () => {
  const collections = [
    {
      title: 'Zodiac Collection',
      description: '12 celestial signs rendered in 22kt gold',
      image: '/api/placeholder/400/500',
      count: 12,
      startingPrice: 350
    },
    {
      title: 'Northern Hemisphere',
      description: 'Classic constellations of the northern sky',
      image: '/api/placeholder/400/500',
      count: 28,
      startingPrice: 450
    },
    {
      title: 'Southern Cross',
      description: 'Mystical constellations of the southern sky',
      image: '/api/placeholder/400/500',
      count: 15,
      startingPrice: 450
    },
    {
      title: 'Mythological Series',
      description: 'Legends written in the stars',
      image: '/api/placeholder/400/500',
      count: 8,
      startingPrice: 650
    }
  ];

  return (
    <section className="py-20 bg-neutral-50" id="collection">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Collections</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Each collection tells a unique story, crafted with precision and artistry
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative overflow-hidden rounded-2xl mb-4">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-sm mb-1">{collection.count} pieces</p>
                    <p className="text-2xl font-bold">From ${collection.startingPrice}</p>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{collection.title}</h3>
              <p className="text-neutral-600">{collection.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-serbia-red-600 text-white rounded-lg font-semibold hover:bg-serbia-red-700 transition-colors">
            View All Collections
          </button>
        </div>
      </div>
    </section>
  );
};

// ==================== FEATURES SECTION ====================

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Award,
      title: 'Museum Quality',
      description: 'Archival materials ensure your artwork lasts 500+ years'
    },
    {
      icon: Shield,
      title: 'Authenticity Guaranteed',
      description: 'Each piece signed and numbered with certificate'
    },
    {
      icon: Star,
      title: 'Hand-Crafted',
      description: 'Over 40 hours of craftsmanship in every piece'
    },
    {
      icon: Package,
      title: 'Premium Packaging',
      description: 'Custom-designed boxes for safe delivery'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-20 h-20 bg-serbia-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon size={32} className="text-serbia-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-neutral-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== MAIN SHOP PAGE ====================

const FoilConstellationShop: React.FC = () => {
  const [currentView, setCurrentView] = useState<'product' | 'gallery' | 'story'>('product');
  const [selectedProduct, setSelectedProduct] = useState({
    size: { width: 24, height: 36, unit: 'in' as const },
    image: '/api/placeholder/800/1000',
    frameStyle: 'gold'
  });

  return (
    <div className="foil-constellation-shop">
      {/* Header */}
      <GalleryHeader />
      <AnnouncementBar />

      {/* Main Content */}
      <main>
        {/* Hero */}
        <HeroSection />

        {/* Collection Preview */}
        <CollectionPreview />

        {/* Features */}
        <FeaturesSection />

        {/* Main Product/Gallery View */}
        <section className="py-20 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-6">
            {/* View Selector */}
            <div className="flex justify-center mb-12">
              <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
                {[
                  { id: 'product', label: 'Product Details' },
                  { id: 'gallery', label: '3D Preview' },
                  { id: 'story', label: 'Our Story' }
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setCurrentView(view.id as any)}
                    className={`px-6 py-3 rounded-md font-medium transition-all ${
                      currentView === view.id
                        ? 'bg-serbia-red-600 text-white shadow-lg'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Content */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full border-4 border-serbia-red-600 border-t-transparent h-12 w-12" />
                </div>
              }
            >
              <AnimatePresence mode="wait">
                {currentView === 'product' && (
                  <motion.div
                    key="product"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <MuseumGradeProductPage />
                  </motion.div>
                )}

                {currentView === 'gallery' && (
                  <motion.div
                    key="gallery"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <LuxuryGalleryShowcase
                      posterSize={selectedProduct.size}
                      posterImage={selectedProduct.image}
                      frameStyle={selectedProduct.frameStyle}
                    />
                  </motion.div>
                )}

                {currentView === 'story' && (
                  <motion.div
                    key="story"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <FoilConstellationStory />
                  </motion.div>
                )}
              </AnimatePresence>
            </Suspense>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Artists</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Process</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Collection</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Zodiac</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Northern Sky</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Southern Cross</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mythology</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Care Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <p className="text-neutral-400 mb-4">
                Stay updated with new releases and exclusive offers
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors">
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 Foil Constellations. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FoilConstellationShop;