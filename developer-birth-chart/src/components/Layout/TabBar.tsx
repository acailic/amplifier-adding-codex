import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const TabBar: React.FC = () => {
  const location = useLocation()

  const tabs = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/analyze', icon: '🔍', label: 'Analyze' },
    { path: '/my-charts', icon: '📊', label: 'Charts' },
    { path: '/team', icon: '👥', label: 'Team' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-cosmic-surface/95 backdrop-blur-lg border-t border-white/10 safe-area-inset-bottom">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`
                  flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all no-tap-highlight
                  ${isActive
                    ? 'text-white'
                    : 'text-cosmic-text-secondary hover:text-white'
                  }
                `}
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="text-2xl relative z-10"
                  >
                    {tab.icon}
                  </motion.div>
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    scale: isActive ? 1 : 0.9
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`
                    text-xs mt-1 font-medium relative z-10
                    ${isActive ? 'text-white' : 'text-cosmic-text-secondary'}
                  `}
                >
                  {tab.label}
                </motion.span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default TabBar