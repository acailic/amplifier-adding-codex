import React from 'react'
import { motion } from 'framer-motion'
import { usePWA } from '@lib/pwa'

const SettingsPage: React.FC = () => {
  const { requestNotificationPermission, getDeviceInfo } = usePWA()

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      alert('Notifications enabled! You\'ll receive cosmic code events.')
    }
  }

  const deviceInfo = getDeviceInfo()

  return (
    <div className="min-h-screen safe-area-inset">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
            Settings
          </h1>

          <div className="space-y-6">
            {/* Notifications */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEnableNotifications}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Enable Push Notifications
              </motion.button>
            </div>

            {/* App Info */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">App Information</h2>
              <div className="space-y-2 text-cosmic-text-secondary">
                <p>Version: 1.0.0</p>
                <p>Platform: {deviceInfo.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</p>
                <p>PWA Supported: {deviceInfo.webShareSupported ? 'Yes' : 'No'}</p>
                <p>Vibration: {deviceInfo.vibrationSupported ? 'Supported' : 'Not Supported'}</p>
              </div>
            </div>

            {/* About */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-cosmic-text-secondary">
                Developer Birth Chart analyzes your GitHub profile to generate personalized astrological-style insights about your developer personality and career path.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsPage