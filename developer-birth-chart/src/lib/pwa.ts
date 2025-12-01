// PWA Service Worker Registration and Management
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface PWAInstallStatus {
  isSupported: boolean
  isInstalled: boolean
  canInstall: boolean
  isStandalone: boolean
}

export class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null
  private updateReady = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e as BeforeInstallPromptEvent
      this.onInstallAvailable()
    })

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null
      this.onInstalled()
    })

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  }

  // Get current PWA status
  getStatus(): PWAInstallStatus {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://')

    return {
      isSupported: 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window,
      isInstalled: isStandalone,
      canInstall: !!this.deferredPrompt,
      isStandalone
    }
  }

  // Prompt user to install the app
  async install(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false
    }

    try {
      await this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice
      this.deferredPrompt = null
      return outcome === 'accepted'
    } catch (error) {
      console.error('Error installing PWA:', error)
      return false
    }
  }

  // Check for updates
  async checkForUpdates(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready

      // Force update check
      await registration.update()

      // Check if there's an update waiting
      if (registration.waiting) {
        this.updateReady = true
        return true
      }

      return false
    } catch (error) {
      console.error('Error checking for updates:', error)
      return false
    }
  }

  // Apply pending update
  async applyUpdate(): Promise<void> {
    if (!('serviceWorker' in navigator) || !this.updateReady) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    } catch (error) {
      console.error('Error applying update:', error)
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  // Show notification
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    try {
      await navigator.serviceWorker.ready
      navigator.serviceWorker.controller?.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: { title, options }
      })
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  // Share content (Web Share API)
  async shareContent(data: ShareData): Promise<boolean> {
    if (!('share' in navigator)) {
      return false
    }

    try {
      await navigator.share(data)
      return true
    } catch (error) {
      console.error('Error sharing content:', error)
      return false
    }
  }

  // Copy to clipboard
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      return false
    }
  }

  // Vibrate device
  vibrate(pattern: number | number[]): boolean {
    if ('vibrate' in navigator) {
      return navigator.vibrate(pattern)
    }
    return false
  }

  // Get device info
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      connection: (navigator as any).connection,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      webShareSupported: 'share' in navigator,
      webPushSupported: 'PushManager' in window,
      webNotificationsSupported: 'Notification' in window,
      vibrationSupported: 'vibrate' in navigator,
      clipboardSupported: 'clipboard' in navigator
    }
  }

  // Event callbacks (can be overridden)
  private onInstallAvailable() {
    console.log('PWA installation available')
  }

  private onInstalled() {
    console.log('PWA installed successfully')
  }
}

// Create singleton instance
export const pwaManager = new PWAManager()

// Custom hook for PWA functionality
export const usePWA = () => {
  const [status, setStatus] = React.useState<PWAInstallStatus>(pwaManager.getStatus())

  React.useEffect(() => {
    const updateStatus = () => {
      setStatus(pwaManager.getStatus())
    }

    // Update status periodically
    const interval = setInterval(updateStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    ...status,
    install: () => pwaManager.install(),
    checkForUpdates: () => pwaManager.checkForUpdates(),
    applyUpdate: () => pwaManager.applyUpdate(),
    requestNotificationPermission: () => pwaManager.requestNotificationPermission(),
    showNotification: (title: string, options?: NotificationOptions) =>
      pwaManager.showNotification(title, options),
    shareContent: (data: ShareData) => pwaManager.shareContent(data),
    copyToClipboard: (text: string) => pwaManager.copyToClipboard(text),
    vibrate: (pattern: number | number[]) => pwaManager.vibrate(pattern),
    getDeviceInfo: () => pwaManager.getDeviceInfo()
  }
}