import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center safe-area-inset">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="text-8xl mb-6">🌌</div>
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Lost in the Cosmos?
          </h2>
          <p className="text-cosmic-text-secondary mb-8">
            The constellation you're looking for doesn't exist. Let's guide you back to discover your developer DNA.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-semibold hover:shadow-lg transition-all no-tap-highlight"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFoundPage