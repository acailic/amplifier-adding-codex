import React from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'

const ChartPage: React.FC = () => {
  const { username } = useParams()

  return (
    <div className="min-h-screen safe-area-inset">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-6 text-center">
            Birth Chart for {username}
          </h1>

          <div className="glass rounded-2xl p-8 border border-white/10">
            <p className="text-cosmic-text-secondary text-center">
              Interactive birth chart visualization coming soon! This will show the constellation map and personality insights for {username}.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ChartPage