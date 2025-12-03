import React from 'react'
import { motion } from 'framer-motion'

const ComparePage: React.FC = () => {
  return (
    <div className="min-h-screen safe-area-inset">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
            Compare Developers
          </h1>

          <div className="glass rounded-2xl p-8 border border-white/10">
            <p className="text-cosmic-text-secondary text-center">
              Developer comparison feature coming soon! Compare birth charts to see personality similarities and team dynamics.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ComparePage