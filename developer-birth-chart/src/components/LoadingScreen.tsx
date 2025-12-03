import React from 'react'
import { motion } from 'framer-motion'

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-cosmic-bg flex items-center justify-center safe-area-inset">
      {/* Background effects */}
      <div className="fixed inset-0 star-field opacity-30 pointer-events-none" />

      <div className="relative z-10 text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-6xl md:text-8xl mb-8"
        >
          🌟
        </motion.div>

        {/* Loading Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-2xl md:text-3xl font-bold gradient-text mb-4"
        >
          Developer Birth Chart
        </motion.h1>

        {/* Loading Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-cosmic-text-secondary mb-8"
        >
          Discovering your developer DNA...
        </motion.p>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.8 + index * 0.1,
                duration: 0.4,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 0.2
              }}
              className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          ))}
        </div>

        {/* Loading Bar */}
        <div className="w-64 max-w-full mx-auto">
          <div className="h-2 bg-cosmic-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity
              }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
        </div>

        {/* Mobile Touch Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-12 text-cosmic-text-secondary text-sm"
        >
          <p>Loading your cosmic insights...</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-2 text-xl"
          >
            ✨
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoadingScreen