import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'

// Layout Components
import Layout from '@components/Layout'
import LoadingScreen from '@components/LoadingScreen'
import ErrorBoundary from '@components/ErrorBoundary'

// Page Components (lazy loaded)
const HomePage = React.lazy(() => import('@pages/HomePage'))
const AnalyzePage = React.lazy(() => import('@pages/AnalyzePage'))
const ChartPage = React.lazy(() => import('@pages/ChartPage'))
const MyChartsPage = React.lazy(() => import('@pages/MyChartsPage'))
const ComparePage = React.lazy(() => import('@pages/ComparePage'))
const TeamAnalysisPage = React.lazy(() => import('@pages/TeamAnalysisPage'))
const SettingsPage = React.lazy(() => import('@pages/SettingsPage'))
const AboutPage = React.lazy(() => import('@pages/AboutPage'))
const NotFoundPage = React.lazy(() => import('@pages/NotFoundPage'))

// Hook to check if device is mobile
import { useIsMobile } from '@hooks/useIsMobile'

const App: React.FC = () => {
  const isMobile = useIsMobile()

  return (
    <>
      <Helmet>
        <title>Developer Birth Chart - Discover Your Developer Personality</title>
        <meta name="description" content="Analyze your GitHub profile to generate personalized astrological-style insights about your developer personality and career path." />
        <meta name="keywords" content="GitHub, developer, personality, astrology, birth chart, coding, career" />

        {/* Open Graph */}
        <meta property="og:title" content="Developer Birth Chart" />
        <meta property="og:description" content="Discover your developer personality through GitHub analysis" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Developer Birth Chart" />
        <meta name="twitter:description" content="Discover your developer personality" />
        <meta name="twitter:image" content="/twitter-image.png" />

        {/* Mobile specific */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />

        {/* Theme */}
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5.0" />
      </Helmet>

      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Home/Landing Page */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />

                {/* Core Features */}
                <Route path="analyze" element={<AnalyzePage />} />
                <Route path="chart/:username" element={<ChartPage />} />
                <Route path="my-charts" element={<MyChartsPage />} />
                <Route path="compare" element={<ComparePage />} />
                <Route path="team" element={<TeamAnalysisPage />} />

                {/* App Pages */}
                <Route path="settings" element={<SettingsPage />} />
                <Route path="about" element={<AboutPage />} />

                {/* Fallback */}
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </AnimatePresence>
      </ErrorBoundary>

      {/* Mobile-specific global components */}
      {isMobile && (
        <>
          {/* Install Prompt Banner */}
          <InstallPromptBanner />

          {/* Offline Indicator */}
          <OfflineIndicator />

          {/* Update Notification */}
          <UpdateNotification />
        </>
      )}
    </>
  )
}

// Install Prompt Banner for mobile
const InstallPromptBanner: React.FC = () => {
  const [showPrompt, setShowPrompt] = React.useState(false)

  React.useEffect(() => {
    // Check if should show install prompt
    const lastPromptTime = localStorage.getItem('installPromptLastShown')
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches

    if (!isInstalled && (!lastPromptTime ||
        Date.now() - parseInt(lastPromptTime) > 7 * 24 * 60 * 60 * 1000)) {
      // Show prompt if not installed and not shown in last 7 days
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    // Trigger PWA installation
    if ('beforeinstallprompt' in window) {
      setShowPrompt(false)
      localStorage.setItem('installPromptLastShown', Date.now().toString())
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptLastShown', Date.now().toString())
  }

  if (!showPrompt) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-safe-bottom left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 z-50 safe-area-inset"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-sm">Install Dev Birth Chart</p>
          <p className="text-xs opacity-90">Get the full experience with our mobile app</p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleDismiss}
            className="px-3 py-1 text-xs bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1 text-xs bg-white text-purple-600 rounded-full hover:bg-gray-100 transition-colors font-medium"
          >
            Install
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Offline Indicator
const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-safe-top left-0 right-0 bg-yellow-500 text-black px-4 py-2 text-sm text-center z-50">
      You are currently offline. Some features may be limited.
    </div>
  )
}

// Update Notification
const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = React.useState(false)

  React.useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    window.location.reload()
  }

  if (!showUpdate) return null

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed top-safe-top right-4 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-xs"
    >
      <p className="font-semibold text-sm mb-2">Update Available!</p>
      <p className="text-xs mb-3">A new version of the app is ready to install.</p>
      <button
        onClick={handleUpdate}
        className="w-full bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
      >
        Update Now
      </button>
    </motion.div>
  )
}

export default App