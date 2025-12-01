import React from 'react'
import { motion } from 'framer-motion'

const AnalyzePage: React.FC = () => {
  return (
    <div className="min-h-screen safe-area-inset">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-6 text-center">
            Analyze GitHub Profile
          </h1>

          <div className="glass rounded-2xl p-8 border border-white/10">
            <p className="text-cosmic-text-secondary text-center">
              GitHub profile analysis coming soon! This will analyze your GitHub activity to generate your personalized developer birth chart.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyzePage