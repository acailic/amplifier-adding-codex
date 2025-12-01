import React from 'react'
import { motion } from 'framer-motion'

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen safe-area-inset">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
            About Developer Birth Chart
          </h1>

          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">What is Developer Birth Chart?</h2>
              <p className="text-cosmic-text-secondary leading-relaxed">
                Developer Birth Chart is a Progressive Web App that analyzes your GitHub profile to generate personalized insights about your developer personality, coding patterns, and career trajectory. We transform your coding activity into beautiful constellation maps and astrological-style personality analysis.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2 text-cosmic-text-secondary">
                <li>• GitHub profile analysis and personality insights</li>
                <li>• Interactive constellation visualization</li>
                <li>• Team compatibility analysis</li>
                <li>• Career path predictions</li>
                <li>• Mobile-optimized PWA experience</li>
                <li>• Offline functionality</li>
                <li>• Push notifications for cosmic code events</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">How It Works</h2>
              <p className="text-cosmic-text-secondary leading-relaxed">
                We analyze your GitHub activity including commit patterns, language usage, project diversity, collaboration history, and contribution timelines. This data is then mapped to personality traits and visualized as beautiful constellation charts that represent your unique developer DNA.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Privacy</h2>
              <p className="text-cosmic-text-secondary leading-relaxed">
                We only access public GitHub data that you choose to analyze. Your information is processed locally in your browser and never stored on our servers without your explicit consent. We respect your privacy and the GDPR principles.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AboutPage