import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pwaManager } from '@lib/pwa'

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const checkInstallStatus = () => {
      const status = pwaManager.getStatus()
      setCanInstall(status.canInstall)

      // Show prompt after 3 seconds if can install
      if (status.canInstall && !status.isInstalled) {
        const lastPrompt = localStorage.getItem('installPromptLastShown')
        const now = Date.now()

        if (!lastPrompt || now - parseInt(lastPrompt) > 7 * 24 * 60 * 60 * 1000) {
          const timer = setTimeout(() => setShowPrompt(true), 3000)
          return () => clearTimeout(timer)
        }
      }
    }

    checkInstallStatus()
    const interval = setInterval(checkInstallStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleInstall = async () => {
    const success = await pwaManager.install()
    if (success) {
      setShowPrompt(false)
      localStorage.setItem('installPromptLastShown', Date.now().toString())
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptLastShown', Date.now().toString())
  }

  return (
    <AnimatePresence>
      {showPrompt && canInstall && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-40 md:hidden"
        >
          <div className="glass rounded-2xl p-4 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📱</div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Install DevBirthChart</h3>
                <p className="text-sm text-cosmic-text-secondary mb-3">
                  Get the full experience with our mobile app
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1 text-xs bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                  >
                    Not now
                  </button>
                  <button
                    onClick={handleInstall}
                    className="px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:shadow-lg transition-all"
                  >
                    Install
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InstallPrompt