import React from 'react'
import { motion } from 'framer-motion'
import { useIsMobile } from '@hooks/useIsMobile'
import { useSwipeNavigation } from '@hooks/useTouchGestures'

const HomePage: React.FC = () => {
  const isMobile = useIsMobile()

  // Swipe navigation for mobile
  const { elementRef } = useSwipeNavigation({
    onSwipeLeft: () => {
      // Navigate to analyze page
      window.location.href = '/analyze'
    },
    preventDefault: false
  })

  return (
    <div ref={elementRef} className="min-h-screen flex flex-col justify-center safe-area-inset">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          {/* Logo and Title */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
            className="mb-8"
          >
            <div className="text-8xl md:text-9xl mb-4">🌟</div>
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
              Developer Birth Chart
            </h1>
            <p className="text-xl md:text-2xl text-cosmic-text-secondary max-w-2xl mx-auto">
              Discover your developer personality through the cosmic patterns of your GitHub profile
            </p>
          </motion.div>
        </motion.div>

        {/* Main CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <div className="glass rounded-2xl p-8 md:p-12 border border-white/10">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
              Unlock Your Developer DNA
            </h2>
            <p className="text-lg text-cosmic-text-secondary mb-8 text-center max-w-xl mx-auto">
              Analyze your GitHub activity, coding patterns, and project history to reveal insights about your unique developer personality
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/analyze"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all no-tap-highlight"
              >
                🚀 Generate My Birth Chart
              </motion.a>

              {isMobile && (
                <motion.a
                  href="/about"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-cosmic-surface text-white rounded-full font-semibold text-lg border border-white/20 hover:bg-white/10 transition-all no-tap-highlight"
                >
                  📖 Learn More
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <FeatureCard
            icon="🔍"
            title="Personality Analysis"
            description="Discover your coding style, communication patterns, and collaboration tendencies"
            delay={0.9}
          />
          <FeatureCard
            icon="⭐"
            title="Cosmic Constellations"
            description="Visualize your developer journey as beautiful, interactive constellation maps"
            delay={1.0}
          />
          <FeatureCard
            icon="👥"
            title="Team Compatibility"
            description="Find your ideal team roles and discover developers with complementary skills"
            delay={1.1}
          />
        </motion.div>

        {/* Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="glass rounded-2xl p-8 border border-white/10"
        >
          <h3 className="text-2xl font-semibold mb-6 text-center">
            What Your Birth Chart Reveals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <InsightItem icon="💻" label="Coding Style" />
            <InsightItem icon="🕐" label="Peak Hours" />
            <InsightItem icon="🎯" label="Project Focus" />
            <InsightItem icon="🌟" label="Growth Path" />
            <InsightItem icon="🔥" label="Passion Projects" />
            <InsightItem icon="🤝" label="Collaboration" />
            <InsightItem icon="🚀" label="Career Goals" />
            <InsightItem icon="💡" label="Innovation" />
          </div>
        </motion.div>

        {/* Mobile swipe hint */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-center mt-8"
          >
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block text-cosmic-text-secondary"
            >
              ← Swipe left to get started →
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Feature Card Component
interface FeatureCardProps {
  icon: string
  title: string
  description: string
  delay: number
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
      className="glass rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="text-4xl mb-4 text-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-center">{title}</h3>
      <p className="text-cosmic-text-secondary text-sm text-center">{description}</p>
    </motion.div>
  )
}

// Insight Item Component
interface InsightItemProps {
  icon: string
  label: string
}

const InsightItem: React.FC<InsightItemProps> = ({ icon, label }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="text-center"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-cosmic-text-secondary">{label}</div>
    </motion.div>
  )
}

export default HomePage