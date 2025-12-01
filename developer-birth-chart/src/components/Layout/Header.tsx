import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useIsMobile } from '@hooks/useIsMobile'
import { pwaManager } from '@lib/pwa'

interface HeaderProps {
  onMenuToggle: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const isMobile = useIsMobile()
  const location = useLocation()
  const [title, setTitle] = useState('Developer Birth Chart')

  // Update title based on route
  React.useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Developer Birth Chart',
      '/analyze': 'Generate Birth Chart',
      '/my-charts': 'My Charts',
      '/compare': 'Compare Developers',
      '/team': 'Team Analysis',
      '/settings': 'Settings',
      '/about': 'About'
    }

    setTitle(titles[location.pathname] || 'Developer Birth Chart')
  }, [location])

  const handleShare = async () => {
    try {
      await pwaManager.shareContent({
        title: 'Developer Birth Chart',
        text: 'Discover your developer personality through GitHub analysis',
        url: window.location.href
      })
    } catch (error) {
      // Fallback to copy to clipboard
      await pwaManager.copyToClipboard(window.location.href)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-cosmic-surface/90 backdrop-blur-lg border-b border-white/10 safe-area-inset-top">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Menu & Logo */}
          <div className="flex items-center gap-4">
            {/* Menu Button (Mobile) */}
            {isMobile && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onMenuToggle}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors no-tap-highlight"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            )}

            {/* Logo & Title */}
            <Link to="/" className="flex items-center gap-3 no-tap-highlight">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-2xl"
              >
                🌟
              </motion.div>
              {!isMobile && (
                <h1 className="text-xl font-bold gradient-text hidden sm:block">
                  Developer Birth Chart
                </h1>
              )}
            </Link>
          </div>

          {/* Center - Page Title (Mobile) */}
          {isMobile && (
            <motion.h1
              key={title}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold text-center absolute left-1/2 transform -translate-x-1/2 max-w-[200px] truncate"
            >
              {title}
            </motion.h1>
          )}

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2">
            {/* Install Button (Desktop) */}
            {!isMobile && <InstallButton />}

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors no-tap-highlight"
              aria-label="Share app"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m9.032 4.026A9.001 9.001 0 012.968 7.326" />
              </svg>
            </motion.button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

// Install Button Component
const InstallButton: React.FC = () => {
  const [canInstall, setCanInstall] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    const status = pwaManager.getStatus()
    setCanInstall(status.canInstall)
    setIsInstalled(status.isInstalled)

    // Listen for install prompt
    const checkInstallStatus = () => {
      const status = pwaManager.getStatus()
      setCanInstall(status.canInstall)
      setIsInstalled(status.isInstalled)
    }

    const interval = setInterval(checkInstallStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleInstall = async () => {
    const success = await pwaManager.install()
    if (success) {
      setIsInstalled(true)
      setCanInstall(false)
    }
  }

  if (isInstalled) return null
  if (!canInstall) return null

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleInstall}
      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-full font-medium shadow-md hover:shadow-lg transition-all no-tap-highlight"
    >
      📱 Install App
    </motion.button>
  )
}

// Theme Toggle Component
const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState(true)

  React.useEffect(() => {
    // Check current theme
    const currentTheme = document.documentElement.classList.contains('dark')
    setIsDark(currentTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)

    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    // Provide haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 180 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors no-tap-highlight"
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
        className="w-5 h-5"
      >
        {isDark ? '🌙' : '☀️'}
      </motion.div>
    </motion.button>
  )
}

export default Header