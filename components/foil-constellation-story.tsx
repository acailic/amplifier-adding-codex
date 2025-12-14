/**
 * Foil Constellation Story Component
 *
 * Editorial content showcasing the craftsmanship, story, and heritage
 * behind the foil constellation poster collection.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronRight,
  Award,
  Clock,
  Hand,
  Eye,
  Heart,
  Star,
  TrendingUp,
  Users,
  Package,
  Shield,
  Instagram,
  Twitter,
  Facebook,
  Mail
} from 'lucide-react';

// ==================== STORY SECTIONS ====================

const CraftProcess: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const processSteps = [
    {
      id: 1,
      title: 'Astronomical Mapping',
      description: 'Each constellation is mapped using precise astronomical data from NASA\'s star catalogs, ensuring scientific accuracy down to 0.1 arcseconds.',
      duration: '4-6 hours',
      image: '/api/placeholder/600/400',
      craftsman: 'Dr. Sarah Chen - Lead Astronomer',
      detail: 'We use proprietary software that cross-references multiple star databases to create the most accurate representation of each constellation as viewed from Earth.'
    },
    {
      id: 2,
      title: 'Digital Design',
      description: 'Our artists transform astronomical data into beautiful vector artwork, carefully considering each star\'s magnitude and the constellation\'s mythological story.',
      duration: '12-16 hours',
      image: '/api/placeholder/600/400',
      craftsman: 'Marcus Rodriguez - Digital Artist',
      detail: 'Every decision in the design phase is deliberate. Star sizes represent actual magnitude, while the flowing lines between stars follow the traditional constellation patterns recognized for millennia.'
    },
    {
      id: 3,
      title: 'Master Plate Creation',
      description: 'A copper plate is engraved using techniques dating back to the 15th century, creating the negative space for each individual star.',
      duration: '8-10 hours',
      image: '/api/placeholder/600/400',
      craftsman: 'Elena Volkov - Master Engraver',
      detail: 'The engraving process requires extreme precision. Each star is hand-carved to specific depths that will determine how the foil catches light - shallower for dimmer stars, deeper for brighter ones.'
    },
    {
      id: 4,
      title: 'Paper Selection',
      description: 'Only the finest archival papers are selected, tested for weight, texture, and longevity to ensure the artwork lasts centuries.',
      duration: '2 hours',
      image: '/api/placeholder/600/400',
      craftsman: 'James Mitchell - Paper Conservator',
      detail: 'We test each batch of paper for pH neutrality, optical brightness, and tensile strength. The paper must be both beautiful and technically perfect.'
    },
    {
      id: 5,
      title: 'Foil Application',
      description: '22-karat gold leaf is hand-applied using heated presses at precise temperatures and pressures, bonding it permanently to the paper.',
      duration: '6-8 hours per print',
      image: '/api/placeholder/600/400',
      craftsman: 'Takeshi Yamamoto - Foil Master',
      detail: 'Temperature control is crucial. Too hot and the foil burns; too cold and it won\'t adhere. Each press must be perfect.'
    },
    {
      id: 6,
      title: 'Quality Inspection',
      description: 'Each print is examined under magnification for perfect foil adhesion, color accuracy, and overall craftsmanship.',
      duration: '1 hour',
      image: '/api/placeholder/600/400',
      craftsman: 'Maria Santos - Quality Director',
      detail: 'Less than 1% of prints fail inspection, and those that do are destroyed. We refuse to sell anything less than perfect.'
    },
    {
      id: 7,
      title: 'Signing & Numbering',
      description: 'The artist personally signs and numbers each print in pencil, following traditional printmaking conventions.',
      duration: '30 minutes',
      image: '/api/placeholder/600/400',
      craftsman: 'John Smith - Artist',
      detail: 'The signature is the final seal of approval. It represents our commitment to quality and the personal touch that makes each piece unique.'
    },
    {
      id: 8,
      title: 'Archival Packaging',
      description: 'Each print is wrapped in acid-free materials and placed in custom-designed boxes with humidity control.',
      duration: '45 minutes',
      image: '/api/placeholder/600/400',
      craftsman: 'Lisa Chen - Archivist',
      detail: 'Our packaging is designed to protect the artwork for 500+ years. We think like museum conservators, not retailers.'
    }
  ];

  const totalTime = processSteps.reduce((sum, step) => {
    const hours = parseInt(step.duration.split(' ')[0]);
    return sum + hours;
  }, 0);

  return (
    <section className="craft-process py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">The Craft Process</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Each foil constellation takes over {totalTime} hours to create, combining centuries-old techniques
            with modern astronomical precision.
          </p>
        </div>

        {/* Process Timeline */}
        <div className="relative mb-16">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-neutral-300" />
          {processSteps.map((step, index) => (
            <motion.div
              key={step.id}
              className="relative flex items-start mb-12"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative z-10 w-16 h-16 bg-white border-4 border-serbia-red-600 rounded-full flex items-center justify-center text-serbia-red-600 font-bold">
                {step.id}
              </div>
              <div
                className={`ml-8 p-6 rounded-xl cursor-pointer transition-all ${
                  activeStep === index ? 'bg-white shadow-lg' : 'bg-white/50 hover:bg-white'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <span className="text-sm text-neutral-600">{step.duration}</span>
                </div>
                <p className="text-neutral-600 mb-2">{step.description}</p>
                <p className="text-sm text-serbia-red-600 font-medium">{step.craftsman}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded Detail View */}
        <AnimatePresence mode="wait">
          {activeStep !== null && (
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative">
                  <img
                    src={processSteps[activeStep].image}
                    alt={processSteps[activeStep].title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <h4 className="text-2xl font-bold mb-1">{processSteps[activeStep].title}</h4>
                      <p className="text-sm opacity-90">{processSteps[activeStep].craftsman}</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-bold mb-4">Step Details</h4>
                  <p className="text-neutral-600 mb-6">{processSteps[activeStep].detail}</p>

                  {/* Craftsperson Profile */}
                  <div className="bg-neutral-50 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-serbia-red-400 to-serbia-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {processSteps[activeStep].craftsman.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h5 className="font-semibold">{processSteps[activeStep].craftsman}</h5>
                        <p className="text-sm text-neutral-600">Master Craftsperson</p>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600">
                      With over 20 years of experience, our craftsmen represent the pinnacle of their respective fields.
                      Each has been trained in traditional techniques while embracing modern innovations.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const CareInstructions: React.FC = () => {
  const careSections = [
    {
      title: 'Unboxing',
      icon: Package,
      tips: [
        'Open on a clean, flat surface',
        'Handle with clean, dry hands',
        'Use cotton gloves if available',
        'Keep away from sharp objects'
      ]
    },
    {
      title: 'Display',
      icon: Eye,
      tips: [
        'Frame with UV-protective glass',
        'Maintain 40-60% humidity',
        'Avoid direct sunlight',
        'Keep away from heat sources'
      ]
    },
    {
      title: 'Handling',
      icon: Hand,
      tips: [
        'Support from edges and bottom',
        'Never touch foil surface',
        'Store flat, not rolled',
        'Use acid-free materials only'
      ]
    },
    {
      title: 'Preservation',
      icon: Shield,
      tips: [
        'Expected lifetime: 500+ years',
        'Re-frame every 50 years',
        'Professional cleaning only',
        'Document condition regularly'
      ]
    }
  ];

  return (
    <section className="care-instructions py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Care & Preservation</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Your foil constellation is designed to last generations. Follow these guidelines
            to ensure it remains as beautiful as the day it was created.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {careSections.map((section, index) => (
            <motion.div
              key={section.title}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-serbia-red-100 to-serbia-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <section.icon size={32} className="text-serbia-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
              <ul className="text-sm text-neutral-600 space-y-2">
                {section.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-serbia-red-600 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Video Tutorial */}
        <div className="mt-16 bg-neutral-900 rounded-2xl overflow-hidden">
          <div className="relative">
            <img
              src="/api/placeholder/1200/600"
              alt="Care tutorial thumbnail"
              className="w-full h-96 object-cover opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="p-6 bg-serbia-red-600 hover:bg-serbia-red-700 rounded-full transition-colors group">
                <Play size={32} className="text-white ml-1 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Video Care Guide</h3>
            <p className="text-neutral-400 mb-6">
              Watch our detailed video tutorial on unboxing, framing, and caring for your foil constellation.
            </p>
            <button className="px-6 py-3 bg-white text-neutral-900 rounded-lg font-semibold hover:bg-neutral-100 transition-colors">
              Watch Full Tutorial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const ArtistProfile: React.FC = () => {
  const artists = [
    {
      name: 'John Smith',
      role: 'Lead Artist & Founder',
      bio: 'With over 30 years in traditional printmaking, John revolutionized foil art by combining astronomical accuracy with artistic beauty.',
      achievements: [
        'Exhibited in 15+ international galleries',
        'Collections in major museums worldwide',
        'Pioneer of modern foil techniques'
      ],
      image: '/api/placeholder/400/400'
    },
    {
      name: 'Elena Volkov',
      role: 'Master Engraver',
      bio: 'A third-generation engraver trained in Florence, Elena brings Renaissance craftsmanship to modern astronomical art.',
      achievements: [
        'Trained at Accademia di Belle Arti',
        '15+ years museum conservation experience',
        'Revived lost engraving techniques'
      ],
      image: '/api/placeholder/400/400'
    },
    {
      name: 'Dr. Sarah Chen',
      role: 'Astronomical Consultant',
      bio: 'PhD in Astrophysics from Harvard, Sarah ensures every constellation is scientifically accurate while maintaining artistic beauty.',
      achievements: [
        'Former NASA researcher',
        'Published 50+ peer-reviewed papers',
        'Astronomical Artist of the Year 2023'
      ],
      image: '/api/placeholder/400/400'
    }
  ];

  return (
    <section className="artist-profile py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Meet the Artists</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Our team combines traditional craftsmanship with scientific expertise
            to create truly unique astronomical art.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {artists.map((artist, index) => (
            <motion.div
              key={artist.name}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{artist.name}</h3>
                <p className="text-serbia-red-600 font-medium mb-3">{artist.role}</p>
                <p className="text-neutral-600 mb-4">{artist.bio}</p>
                <ul className="space-y-2">
                  {artist.achievements.map((achievement, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                      <Star size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Studio Tour */}
        <div className="mt-16 bg-white rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Visit Our Studio</h3>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-neutral-600 mb-4">
                We invite collectors and art enthusiasts to visit our studio in Brooklyn, NY.
                See firsthand how we create these masterpieces and meet the artists.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Clock size={20} className="text-serbia-red-600" />
                  <span>Open by appointment only</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users size={20} className="text-serbia-red-600" />
                  <span>Small groups (max 6 people)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award size={20} className="text-serbia-red-600" />
                  <span>2-hour guided tour</span>
                </li>
              </ul>
              <button className="px-6 py-3 bg-serbia-red-600 text-white rounded-lg font-semibold hover:bg-serbia-red-700 transition-colors">
                Schedule Studio Visit
              </button>
            </div>
            <img
              src="/api/placeholder/600/400"
              alt="Studio workspace"
              className="rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const SocialProof: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);

  const stats = [
    { value: '250+', label: 'Limited Editions Sold', icon: Star },
    { value: '15', label: 'Museum Collections', icon: Award },
    { value: '98%', label: 'Customer Satisfaction', icon: Heart },
    { value: '500+', label: 'Years Combined Experience', icon: Clock }
  ];

  const testimonials = [
    {
      quote: 'The craftsmanship is unparalleled. This piece is the centerpiece of my collection.',
      author: 'Robert Kensington',
      title: 'Art Collector',
      location: 'Manhattan, NY'
    },
    {
      quote: 'As an astronomer, I appreciate the scientific accuracy. As an art lover, I\'m mesmerized by the beauty.',
      author: 'Dr. Amelia Zhang',
      title: 'Astrophysicist',
      location: 'Cambridge, MA'
    },
    {
      quote: 'Worth every penny. The foil work catches light beautifully throughout the day.',
      author: 'Michael Rodriguez',
      title: 'Interior Designer',
      location: 'Los Angeles, CA'
    }
  ];

  return (
    <section className="social-proof py-20 bg-serbia-red-600 text-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Statistics */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trusted by Collectors Worldwide</h2>
            <p className="text-xl opacity-90">Join the community of art enthusiasts who have discovered the magic of foil constellations</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon size={32} />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">What Collectors Say</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm opacity-80">{testimonial.title} • {testimonial.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Press & Features */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-6">As Featured In</h3>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {['ArtNews', 'Architectural Digest', 'WIRED', 'Smithsonian', 'Astronomy Magazine'].map((publication) => (
              <div key={publication} className="text-white/60 font-semibold text-lg">
                {publication}
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12 pt-8 border-t border-white/20 text-center">
          <p className="mb-4 opacity-80">Follow our journey</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <Instagram size={24} />
            </a>
            <a href="#" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <Twitter size={24} />
            </a>
            <a href="#" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <Facebook size={24} />
            </a>
            <a href="#" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <Mail size={24} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== MAIN COMPONENT ====================

const FoilConstellationStory: React.FC = () => {
  return (
    <div className="foil-constellation-story">
      {/* Hero Section */}
      <section className="hero py-32 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Where Art Meets the Cosmos
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Each foil constellation is a masterpiece born from the intersection of ancient craftsmanship
            and modern astronomical science. Discover the story behind every star.
          </motion.p>
          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button className="px-8 py-4 bg-serbia-red-600 text-white rounded-lg font-semibold hover:bg-serbia-red-700 transition-colors">
              Explore Collection
            </button>
            <button className="px-8 py-4 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Watch Process Video
            </button>
          </motion.div>
        </div>
      </section>

      {/* Story Sections */}
      <CraftProcess />
      <ArtistProfile />
      <CareInstructions />
      <SocialProof />

      {/* CTA Section */}
      <section className="cta py-20 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Begin Your Collection</h2>
          <p className="text-xl text-gray-300 mb-8">
            Own a piece of astronomical history. Each limited edition print is an investment in art
            that will last for generations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-serbia-red-600 text-white rounded-lg font-semibold hover:bg-serbia-red-700 transition-colors flex items-center justify-center gap-2">
              Shop Collection
              <ChevronRight size={20} />
            </button>
            <button className="px-8 py-4 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Download Catalog
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FoilConstellationStory;