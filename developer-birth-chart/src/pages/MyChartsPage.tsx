import React from 'react'
import { motion } from 'framer-motion'

const MyChartsPage: React.FC = () => {
  return (
    <div className="min-h-screen safe-area-inset">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
            My Charts
          </h1>

          <div className="glass rounded-2xl p-8 border border-white/10">
            <p className="text-cosmic-text-secondary text-center">
              Your saved birth charts will appear here soon! You'll be able to view, compare, and manage all your generated charts.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MyChartsPage