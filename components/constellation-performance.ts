/**
 * Constellation Performance Optimizations
 *
 * Purpose: Ensure smooth 60fps animations for constellation visualizations
 * through GPU acceleration, efficient rendering, and memory management
 *
 * Performance Strategies:
 * - GPU acceleration through transform/opacity only
 * - Offscreen canvas for particle effects
 * - Intersection Observer for viewport culling
 * - RequestAnimationFrame scheduling
 * - Object pooling for dynamic elements
 * - Efficient event delegation
 * - Memory leak prevention
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';

// ==================== PERFORMANCE CONFIGURATION ====================

export const PERFORMANCE_CONFIG = {
  // Frame timing for consistent 60fps
  targetFPS: 60,
  frameTime: 1000 / 60, // 16.67ms per frame

  // GPU acceleration thresholds
  maxParticles: 50,
  maxActiveAnimations: 100,
  minParticleSize: 2,

  // Viewport culling
  cullingMargin: 100, // pixels outside viewport

  // Memory management
  particlePoolSize: 20,
  cleanupInterval: 30000, // 30 seconds

  // Quality settings based on device capability
  qualityLevels: {
    low: {
      maxParticles: 10,
      particleSize: 2,
      animationDetail: 'minimal',
      updateFrequency: 2, // Update every 2 frames
    },
    medium: {
      maxParticles: 25,
      particleSize: 3,
      animationDetail: 'normal',
      updateFrequency: 1,
    },
    high: {
      maxParticles: 50,
      particleSize: 4,
      animationDetail: 'full',
      updateFrequency: 1,
    },
  },
} as const;

// ==================== DEVICE CAPABILITY DETECTION ====================

export interface DeviceCapabilities {
  gpuTier: 'low' | 'medium' | 'high';
  cores: number;
  memory: number;
  pixelRatio: number;
  supportsWebGL: boolean;
  supportsOffscreenCanvas: boolean;
}

export const detectDeviceCapabilities = (): DeviceCapabilities => {
  // Detect GPU capabilities
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  let gpuTier: 'low' | 'medium' | 'high' = 'medium';
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      // Heuristic GPU tier detection
      if (renderer.includes('NVIDIA') && (renderer.includes('RTX') || renderer.includes('GTX 10'))) {
        gpuTier = 'high';
      } else if (renderer.includes('Intel') && renderer.includes('HD Graphics')) {
        gpuTier = 'low';
      }
    }
  }

  // Detect cores (approximate)
  const cores = navigator.hardwareConcurrency || 4;

  // Detect memory (if available)
  let memory = 4; // Default 4GB
  if ('deviceMemory' in navigator) {
    memory = (navigator as any).deviceMemory;
  }

  // Detect pixel ratio
  const pixelRatio = window.devicePixelRatio || 1;

  return {
    gpuTier,
    cores,
    memory,
    pixelRatio,
    supportsWebGL: !!gl,
    supportsOffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
  };
};

// ==================== PARTICLE POOL FOR MEMORY EFFICIENCY ====================

export class ParticlePool {
  private pool: HTMLElement[] = [];
  private active: Set<HTMLElement> = new Set();
  private maxSize: number;

  constructor(maxSize: number = PERFORMANCE_CONFIG.particlePoolSize) {
    this.maxSize = maxSize;
  }

  get(): HTMLElement {
    // Try to reuse from pool
    if (this.pool.length > 0) {
      const particle = this.pool.pop()!;
      this.active.add(particle);
      return particle;
    }

    // Create new particle if under limit
    if (this.active.size < this.maxSize) {
      const particle = document.createElement('div');
      particle.className = 'cosmic-particle';
      particle.style.cssText = `
        position: absolute;
        pointer-events: none;
        will-change: transform, opacity;
        backface-visibility: hidden;
      `;
      this.active.add(particle);
      return particle;
    }

    // Pool exhausted, recycle oldest
    const oldestParticle = this.active.values().next().value;
    this.active.delete(oldestParticle);
    this.active.add(oldestParticle);
    return oldestParticle;
  }

  release(particle: HTMLElement): void {
    if (this.active.has(particle)) {
      this.active.delete(particle);

      // Reset particle state
      particle.style.transform = '';
      particle.style.opacity = '0';
      particle.className = 'cosmic-particle';

      // Return to pool
      if (this.pool.length < this.maxSize) {
        this.pool.push(particle);
      } else {
        particle.remove();
      }
    }
  }

  cleanup(): void {
    // Clear all active particles
    this.active.forEach(particle => particle.remove());
    this.active.clear();

    // Clear pool
    this.pool.forEach(particle => particle.remove());
    this.pool = [];
  }

  getStats() {
    return {
      poolSize: this.pool.length,
      activeSize: this.active.size,
      maxSize: this.maxSize,
    };
  }
}

// ==================== VIEWPORT CULLING ====================

export class ViewportCuller {
  private observer: IntersectionObserver | null = null;
  private trackedElements = new Map<Element, { callback: (isVisible: boolean) => void }>();

  constructor(private margin: number = PERFORMANCE_CONFIG.cullingMargin) {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: `${margin}px`,
          threshold: 0,
        }
      );
    }
  }

  observe(element: Element, callback: (isVisible: boolean) => void): void {
    if (this.observer) {
      this.trackedElements.set(element, callback);
      this.observer.observe(element);
    } else {
      // Fallback: always consider visible
      callback(true);
    }
  }

  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
      this.trackedElements.delete(element);
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const callback = this.trackedElements.get(entry.target);
      if (callback) {
        callback(entry.isIntersecting);
      }
    });
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.trackedElements.clear();
  }
}

// ==================== FRAME SCHEDULER ====================

export class FrameScheduler {
  private frameId: number | null = null;
  private callbacks = new Map<number, () => void>();
  private nextId = 0;
  private lastFrameTime = 0;
  private targetFrameTime: number;

  constructor(targetFPS: number = PERFORMANCE_CONFIG.targetFPS) {
    this.targetFrameTime = 1000 / targetFPS;
  }

  schedule(callback: () => void, priority: 'high' | 'normal' | 'low' = 'normal'): number {
    const id = this.nextId++;

    // Insert callback based on priority
    const entries = Array.from(this.callbacks.entries());
    const insertIndex = priority === 'high' ? 0 :
                       priority === 'low' ? entries.length :
                       Math.floor(entries.length / 2);

    this.callbacks.set(id, callback);

    // Start scheduler if not running
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.tick.bind(this));
    }

    return id;
  }

  unschedule(id: number): void {
    this.callbacks.delete(id);

    // Stop scheduler if no callbacks
    if (this.callbacks.size === 0 && this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private tick = (currentTime: number): void => {
    // Frame rate limiting
    if (currentTime - this.lastFrameTime >= this.targetFrameTime) {
      // Execute all callbacks
      this.callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Frame scheduler callback error:', error);
        }
      });

      this.lastFrameTime = currentTime;
    }

    // Continue if callbacks remain
    if (this.callbacks.size > 0) {
      this.frameId = requestAnimationFrame(this.tick);
    } else {
      this.frameId = null;
    }
  };

  getStats() {
    return {
      activeCallbacks: this.callbacks.size,
      targetFPS: this.targetFPS,
      isRunning: this.frameId !== null,
    };
  }
}

// ==================== PERFORMANCE MONITORING ====================

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  activeAnimations: number;
  visibleElements: number;
  droppedFrames: number;
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private droppedFrames = 0;
  private metrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    activeAnimations: 0,
    visibleElements: 0,
    droppedFrames: 0,
  };

  private observers = new Set<(metrics: PerformanceMetrics) => void>();

  start(): void {
    this.lastTime = performance.now();
    this.measureFrame();
  }

  stop(): void {
    // Stop measurements
  }

  private measureFrame = (): void => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    this.frameCount++;

    // Update FPS every second
    if (deltaTime >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.metrics.frameTime = deltaTime / this.frameCount;
      this.metrics.droppedFrames = this.droppedFrames;

      // Check memory if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }

      // Notify observers
      this.observers.forEach(callback => callback(this.metrics));

      // Reset counters
      this.frameCount = 0;
      this.droppedFrames = 0;
      this.lastTime = currentTime;
    }

    // Check for dropped frames
    if (deltaTime > PERFORMANCE_CONFIG.frameTime * 2) {
      this.droppedFrames++;
    }

    requestAnimationFrame(this.measureFrame);
  };

  updateMetrics(updates: Partial<PerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...updates };
    this.observers.forEach(callback => callback(this.metrics));
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// ==================== REACT HOOKS ====================

export const usePerformanceOptimizations = () => {
  const capabilities = useMemo(() => detectDeviceCapabilities(), []);
  const qualityLevel = useMemo(() => {
    // Determine quality based on device capabilities
    if (capabilities.gpuTier === 'low' || capabilities.memory < 4) {
      return PERFORMANCE_CONFIG.qualityLevels.low;
    } else if (capabilities.gpuTier === 'high' && capabilities.memory > 8) {
      return PERFORMANCE_CONFIG.qualityLevels.high;
    }
    return PERFORMANCE_CONFIG.qualityLevels.medium;
  }, [capabilities]);

  const particlePool = useMemo(() => new ParticlePool(qualityLevel.maxParticles), [qualityLevel.maxParticles]);
  const viewportCuller = useMemo(() => new ViewportCuller(), []);
  const frameScheduler = useMemo(() => new FrameScheduler(), []);
  const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);

  const reducedMotion = useReducedMotion();

  // Start monitoring
  useEffect(() => {
    if (!reducedMotion) {
      performanceMonitor.start();
    }

    return () => {
      performanceMonitor.stop();
    };
  }, [reducedMotion, performanceMonitor]);

  // Cleanup
  useEffect(() => {
    return () => {
      particlePool.cleanup();
      viewportCuller.destroy();
    };
  }, [particlePool, viewportCuller]);

  return {
    capabilities,
    qualityLevel,
    particlePool,
    viewportCuller,
    frameScheduler,
    performanceMonitor,
    reducedMotion,
  };
};

export const useOptimizedAnimation = (
  animate: boolean,
  reducedMotion: boolean,
  qualityLevel: typeof PERFORMANCE_CONFIG.qualityLevels[keyof typeof PERFORMANCE_CONFIG.qualityLevels]
) => {
  const shouldAnimate = animate && !reducedMotion && qualityLevel.animationDetail !== 'minimal';

  const animationProps = useMemo(() => {
    if (!shouldAnimate) {
      return {
        initial: false,
        animate: false,
        transition: { duration: 0 },
      };
    }

    return {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: {
        duration: qualityLevel.animationDetail === 'full' ? 0.5 : 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      },
    };
  }, [shouldAnimate, qualityLevel]);

  return {
    shouldAnimate,
    animationProps,
  };
};

// ==================== UTILITY FUNCTIONS ====================

export const optimizeElement = (element: HTMLElement, options: {
  gpuAccelerated?: boolean;
  willChange?: string[];
  backfaceVisibility?: 'hidden' | 'visible';
} = {}): void => {
  const {
    gpuAccelerated = true,
    willChange = ['transform', 'opacity'],
    backfaceVisibility = 'hidden'
  } = options;

  if (gpuAccelerated) {
    element.style.transform = 'translateZ(0)'; // Force GPU layer
    element.style.backfaceVisibility = backfaceVisibility;
  }

  if (willChange.length > 0) {
    element.style.willChange = willChange.join(', ');
  }
};

export const debounceRAF = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 0
): T => {
  let frameId: number | null = null;

  return ((...args: any[]) => {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }

    frameId = requestAnimationFrame(() => {
      callback(...args);
      frameId = null;
    });
  }) as T;
};

export const throttleRAF = <T extends (...args: any[]) => void>(
  callback: T
): T => {
  let scheduled = false;

  return ((...args: any[]) => {
    if (scheduled) return;

    scheduled = true;
    requestAnimationFrame(() => {
      callback(...args);
      scheduled = false;
    });
  }) as T;
};

export default {
  PERFORMANCE_CONFIG,
  detectDeviceCapabilities,
  ParticlePool,
  ViewportCuller,
  FrameScheduler,
  PerformanceMonitor,
  usePerformanceOptimizations,
  useOptimizedAnimation,
  optimizeElement,
  debounceRAF,
  throttleRAF,
};