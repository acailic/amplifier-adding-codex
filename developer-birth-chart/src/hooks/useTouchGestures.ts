import { useRef, useEffect, useCallback, useState } from 'react'
import { useSpring, animated } from 'framer-motion'

export interface TouchGestureConfig {
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void
  onPinch?: (scale: number) => void
  onRotate?: (rotation: number) => void
  onTap?: (position: { x: number, y: number }) => void
  onLongPress?: (position: { x: number, y: number }) => void
  onPan?: (deltaX: number, deltaY: number) => void
  swipeThreshold?: number
  longPressDelay?: number
  preventDefault?: boolean
}

export interface TouchGestureState {
  isDragging: boolean
  isPanning: boolean
  scale: number
  rotation: number
  deltaX: number
  deltaY: number
  velocityX: number
  velocityY: number
}

export const useTouchGestures = <T extends HTMLElement>(
  config: TouchGestureConfig = {}
) => {
  const elementRef = useRef<T>(null)
  const [state, setState] = useState<TouchGestureState>({
    isDragging: false,
    isPanning: false,
    scale: 1,
    rotation: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0
  })

  const startDistance = useRef<number>(0)
  const startAngle = useRef<number>(0)
  const startPosition = useRef<{ x: number, y: number }>({ x: 0, y: 0 })
  const lastPosition = useRef<{ x: number, y: number }>({ x: 0, y: 0 })
  const lastTime = useRef<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  // Framer Motion animation values
  const animation = useSpring({
    scale: state.scale,
    rotation: state.rotation,
    x: state.deltaX,
    y: state.deltaY,
    config: { tension: 300, friction: 30 }
  })

  // Calculate distance between two touch points
  const getDistance = (touches: TouchList): number => {
    const touch1 = touches[0]
    const touch2 = touches[1]
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Calculate angle between two touch points
  const getAngle = (touches: TouchList): number => {
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI
  }

  // Calculate velocity
  const getVelocity = (currentX: number, currentY: number, currentTime: number): { vx: number, vy: number } => {
    const dt = currentTime - lastTime.current
    if (dt === 0) return { vx: 0, vy: 0 }

    const dx = currentX - lastPosition.current.x
    const dy = currentY - lastPosition.current.y

    return {
      vx: dx / dt,
      vy: dy / dt
    }
  }

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (config.preventDefault) {
      e.preventDefault()
    }

    const touches = e.touches
    const touch = touches[0]

    // Reset state
    startPosition.current = { x: touch.clientX, y: touch.clientY }
    lastPosition.current = { x: touch.clientX, y: touch.clientY }
    lastTime.current = Date.now()

    setState(prev => ({
      ...prev,
      isDragging: true,
      velocityX: 0,
      velocityY: 0
    }))

    // Handle multi-touch for pinch and rotate
    if (touches.length === 2) {
      startDistance.current = getDistance(touches)
      startAngle.current = getAngle(touches)
    }

    // Set up long press timer
    if (config.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        config.onLongPress?.({ x: touch.clientX, y: touch.clientY })
      }, config.longPressDelay || 500)
    }
  }, [config])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (config.preventDefault) {
      e.preventDefault()
    }

    const touches = e.touches
    const currentTime = Date.now()

    // Clear long press timer on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    if (touches.length === 1) {
      // Single touch - pan
      const touch = touches[0]
      const deltaX = touch.clientX - startPosition.current.x
      const deltaY = touch.clientY - startPosition.current.y
      const velocity = getVelocity(touch.clientX, touch.clientY, currentTime)

      lastPosition.current = { x: touch.clientX, y: touch.clientY }
      lastTime.current = currentTime

      setState(prev => ({
        ...prev,
        deltaX,
        deltaY,
        velocityX: velocity.vx,
        velocityY: velocity.vy,
        isPanning: true
      }))

      config.onPan?.(deltaX, deltaY)

    } else if (touches.length === 2) {
      // Multi-touch - pinch and rotate
      const currentDistance = getDistance(touches)
      const currentAngle = getAngle(touches)

      const scale = currentDistance / startDistance.current
      const rotation = currentAngle - startAngle.current

      setState(prev => ({
        ...prev,
        scale,
        rotation
      }))

      config.onPinch?.(scale)
      config.onRotate?.(rotation)
    }
  }, [config])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (config.preventDefault) {
      e.preventDefault()
    }

    const touches = e.touches
    const touch = e.changedTouches[0]

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // Calculate final velocity
    const velocity = getVelocity(touch.clientX, touch.clientY, Date.now())

    setState(prev => ({
      ...prev,
      isDragging: false,
      isPanning: false,
      velocityX: velocity.vx,
      velocityY: velocity.vy
    }))

    // Check for swipe
    if (config.onSwipe && touches.length === 0) {
      const threshold = config.swipeThreshold || 0.5
      const absVx = Math.abs(velocity.vx)
      const absVy = Math.abs(velocity.vy)
      const velocity = Math.max(absVx, absVy)

      if (velocity > threshold) {
        let direction: 'up' | 'down' | 'left' | 'right'

        if (absVx > absVy) {
          direction = velocity.vx > 0 ? 'right' : 'left'
        } else {
          direction = velocity.vy > 0 ? 'down' : 'up'
        }

        config.onSwipe(direction, velocity)
      }
    }

    // Check for tap
    if (config.onTap && !state.isPanning && state.scale === 1) {
      config.onTap({ x: touch.clientX, y: touch.clientY })
    }

    // Reset scale and rotation gradually
    setState(prev => ({
      ...prev,
      scale: 1,
      rotation: 0
    }))
  }, [config, state.isPanning, state.scale])

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: !config.preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !config.preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: !config.preventDefault })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: !config.preventDefault })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)

      // Clear any pending timers
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, config.preventDefault])

  // Haptic feedback helper
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  return {
    elementRef,
    state,
    animation,
    vibrate
  }
}

// Hook for swipe navigation
export const useSwipeNavigation = (config: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  preventDefault?: boolean
}) => {
  const swipeConfig: TouchGestureConfig = {
    onSwipe: (direction, velocity) => {
      switch (direction) {
        case 'left':
          config.onSwipeLeft?.()
          break
        case 'right':
          config.onSwipeRight?.()
          break
        case 'up':
          config.onSwipeUp?.()
          break
        case 'down':
          config.onSwipeDown?.()
          break
      }
    },
    swipeThreshold: config.threshold || 0.5,
    preventDefault: config.preventDefault || false
  }

  return useTouchGestures(swipeConfig)
}

// Hook for pinch-to-zoom
export const usePinchZoom = (config: {
  onZoom?: (scale: number) => void
  minScale?: number
  maxScale?: number
}) => {
  const [scale, setScale] = useState(1)

  const gestureConfig: TouchGestureConfig = {
    onPinch: (pinchScale) => {
      const newScale = Math.min(
        Math.max(pinchScale, config.minScale || 0.5),
        config.maxScale || 3
      )
      setScale(newScale)
      config.onZoom?.(newScale)
    },
    preventDefault: true
  }

  const gesture = useTouchGestures(gestureConfig)

  const resetZoom = useCallback(() => {
    setScale(1)
    config.onZoom?.(1)
  }, [config])

  return {
    ...gesture,
    scale,
    resetZoom
  }
}

export default useTouchGestures