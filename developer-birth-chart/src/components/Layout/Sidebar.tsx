import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

interface SidebarProps {
  onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation()

  const navigationItems = [
    {
      category: 'Main',
      items: [
        { path: '/', icon: '🏠', label: 'Home', description: 'Welcome page' },
        { path: '/analyze', icon: '🔍', label: 'Analyze', description: 'Generate birth chart' },
        { path: '/my-charts', icon: '📊', label: 'My Charts', description: 'Your saved charts' },
      ]
    },
    {
      category: 'Advanced',
      items: [
        { path: '/compare', icon: '⚖️', label: 'Compare', description: 'Compare developers' },
        { path: '/team', icon: '👥', label: 'Team Analysis', description: 'Team dynamics' },
      ]
    },
    {
      category: 'App',
      items: [
        { path: '/settings', icon: '⚙️', label: 'Settings', description: 'App preferences' },
        { path: '/about', icon: 'ℹ️', label: 'About', description: 'Learn more' },
      ]
    }
  ]

  const handleItemClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="text-3xl"
          >
            🌟
          </motion.div>
          <div>
            <h1 className="text-xl font-bold gradient-text">DevBirthChart</h1>
            <p className="text-xs text-cosmic-text-secondary">Developer DNA Analysis</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {navigationItems.map((category, categoryIndex) => (
          <div key={category.category}>
            <h3 className="text-xs font-semibold text-cosmic-text-secondary uppercase tracking-wider mb-3 px-2">
              {category.category}
            </h3>
            <div className="space-y-1">
              {category.items.map((item) => {
                const isActive = location.pathname === item.path

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleItemClick}
                    className={`
                      relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all no-tap-highlight group
                      ${isActive
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-white/20'
                        : 'text-cosmic-text-secondary hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {/* Active indicator line */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavItem"
                        className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full transform -translate-y-1/2"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        x: isActive ? 4 : 0
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="text-xl flex-shrink-0"
                    >
                      {item.icon}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`
                        font-medium text-sm
                        ${isActive ? 'text-white' : 'text-cosmic-text-secondary group-hover:text-white'}
                      `}>
                        {item.label}
                      </div>
                      <div className="text-xs text-cosmic-text-secondary opacity-70 truncate">
                        {item.description}
                      </div>
                    </div>

                    {/* Chevron for active item */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section - User Info */}
      <div className="p-4 border-t border-white/10">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Guest User</div>
              <div className="text-xs text-cosmic-text-secondary">Sign in to save charts</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-all no-tap-highlight"
          >
            Sign In
          </motion.button>
        </div>
      </div>

      {/* Close button for mobile */}
      {onClose && (
        <div className="md:hidden p-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full px-4 py-2 bg-cosmic-accent text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all no-tap-highlight"
          >
            Close Menu
          </motion.button>
        </div>
      )}
    </div>
  )
}

export default Sidebar