import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile } from '@hooks/useIsMobile'

import Header from './Header'
import TabBar from './TabBar'
import Sidebar from './Sidebar'
import ErrorBoundary from '@components/ErrorBoundary'
import InstallPrompt from '@components/InstallPrompt'

const Layout: React.FC = () => {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-cosmic-bg text-white safe-area-inset">
      {/* Background effects */}
      <div className="fixed inset-0 star-field opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-transparent pointer-events-none" />

      {/* Header */}
      <Header onMenuToggle={handleMenuToggle} />

      {/* Main Content Area */}
      <div className="relative flex">
        {/* Sidebar (Desktop) */}
        <AnimatePresence>
          {(!isMobile || sidebarOpen) && (
            <>
              {/* Overlay for mobile */}
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={handleSidebarClose}
                />
              )}

              {/* Sidebar */}
              <motion.aside
                initial={isMobile ? { x: '-100%' } : { x: 0 }}
                animate={{ x: 0 }}
                exit={isMobile ? { x: '-100%' } : { x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`
                  fixed md:relative top-0 left-0 h-screen bg-cosmic-surface border-r border-white/10 z-50
                  ${isMobile ? 'w-72' : 'w-64'}
                  ${isMobile ? 'pt-safe-top' : ''}
                `}
              >
                <Sidebar onClose={handleSidebarClose} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Tab Bar (Mobile) */}
      {isMobile && <TabBar />}

      {/* Install Prompt */}
      <InstallPrompt />

      {/* Floating Action Buttons */}
      <FloatingActions />
    </div>
  )
}

// Floating Action Buttons for quick access
const FloatingActions: React.FC = () => {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="fixed bottom-safe-bottom right-4 z-40 md:bottom-8">
      {/* Action Buttons */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-2"
          >
            <ActionButton
              icon="📊"
              label="My Charts"
              href="/my-charts"
              color="from-blue-500 to-blue-600"
            />
            <ActionButton
              icon="🔍"
              label="Analyze"
              href="/analyze"
              color="from-purple-500 to-purple-600"
            />
            <ActionButton
              icon="⚙️"
              label="Settings"
              href="/settings"
              color="from-gray-500 to-gray-600"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowActions(!showActions)}
        className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full shadow-lg flex items-center justify-center text-xl no-tap-highlight"
      >
        <motion.span
          animate={{ rotate: showActions ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          ✨
        </motion.span>
      </motion.button>
    </div>
  )
}

// Action Button Component
interface ActionButtonProps {
  icon: string
  label: string
  href: string
  color: string
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, href, color }) => {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${color}
        rounded-full shadow-lg text-white no-tap-highlight
        hover:shadow-xl transition-shadow
      `}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </motion.a>
  )
}

export default Layout