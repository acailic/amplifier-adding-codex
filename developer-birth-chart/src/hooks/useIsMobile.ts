import { useState, useEffect } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  touchSupport: boolean
}

export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getDeviceInfo(breakpoint))

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo(breakpoint))
    }

    const handleOrientationChange = () => {
      // Small delay to get accurate screen dimensions after orientation change
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo(breakpoint))
      }, 100)
    }

    // Add event listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    // Initial check
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [breakpoint])

  return deviceInfo.isMobile
}

// Additional hook to get full device info
export const useDeviceInfo = (breakpoint: number = 768): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getDeviceInfo(breakpoint))

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo(breakpoint))
    }

    const handleOrientationChange = () => {
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo(breakpoint))
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [breakpoint])

  return deviceInfo
}

// Helper function to get device info
function getDeviceInfo(breakpoint: number): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1024,
      screenHeight: 768,
      orientation: 'landscape',
      touchSupport: false
    }
  }

  const width = window.innerWidth || screen.width
  const height = window.innerHeight || screen.height
  const orientation = width > height ? 'landscape' : 'portrait'
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  return {
    isMobile: width < breakpoint,
    isTablet: width >= breakpoint && width < 1024,
    isDesktop: width >= 1024,
    screenWidth: width,
    screenHeight: height,
    orientation,
    touchSupport
  }
}

// Hook for responsive breakpoints
export const useResponsive = () => {
  const [breakpoints, setBreakpoints] = useState(() => ({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
    '3xl': false
  }))

  useEffect(() => {
    const updateBreakpoints = () => {
      if (typeof window === 'undefined') return

      const width = window.innerWidth
      setBreakpoints({
        xs: width >= 475,
        sm: width >= 640,
        md: width >= 768,
        lg: width >= 1024,
        xl: width >= 1280,
        '2xl': width >= 1536,
        '3xl': width >= 1600
      })
    }

    updateBreakpoints()
    window.addEventListener('resize', updateBreakpoints)

    return () => window.removeEventListener('resize', updateBreakpoints)
  }, [])

  return breakpoints
}

// Hook for safe area insets (notched phones)
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState(() => {
    if (typeof window === 'undefined') {
      return { top: 0, bottom: 0, left: 0, right: 0 }
    }

    return {
      top: getSafeAreaValue('safe-area-inset-top'),
      bottom: getSafeAreaValue('safe-area-inset-bottom'),
      left: getSafeAreaValue('safe-area-inset-left'),
      right: getSafeAreaValue('safe-area-inset-right')
    }
  })

  useEffect(() => {
    const updateSafeArea = () => {
      setSafeArea({
        top: getSafeAreaValue('safe-area-inset-top'),
        bottom: getSafeAreaValue('safe-area-inset-bottom'),
        left: getSafeAreaValue('safe-area-inset-left'),
        right: getSafeAreaValue('safe-area-inset-right')
      })
    }

    // Listen for orientation changes as safe areas might change
    window.addEventListener('orientationchange', updateSafeArea)
    window.addEventListener('resize', updateSafeArea)

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea)
      window.removeEventListener('resize', updateArea)
    }
  }, [])

  return safeArea
}

// Helper function to get safe area value
function getSafeAreaValue(property: string): number {
  if (typeof window === 'undefined' || !CSS.supports(property, '0px')) {
    return 0
  }

  const testElement = document.createElement('div')
  testElement.style.position = 'fixed'
  testElement.style.left = '0'
  testElement.style.top = '0'
  testElement.style.width = '0'
  testElement.style.height = '0'
  testElement.style.zIndex = '-1'
  testElement.style.visibility = 'hidden'
  testElement.style.paddingBottom = `env(${property})`

  document.body.appendChild(testElement)

  const computedStyle = window.getComputedStyle(testElement)
  const value = parseFloat(computedStyle.paddingBottom) || 0

  document.body.removeChild(testElement)

  return value
}