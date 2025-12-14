/**
 * Constellation Accessibility Features
 *
 * Purpose: Ensure constellation visualizations are fully accessible to all users
 * including those with visual impairments, motion sensitivity, and cognitive disabilities
 *
 * Accessibility Features:
 * - Full reduced motion support with alternative data displays
 * - Screen reader compatible with meaningful ARIA labels
 * - Keyboard navigation with logical tab order
 * - High contrast mode support
 * - Focus management and visible focus indicators
 * - Text alternatives for visual information
 * - Responsive touch targets (44x44px minimum)
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';

// ==================== ACCESSIBILITY CONFIGURATION ====================

export const ACCESSIBILITY_CONFIG = {
  // WCAG compliance settings
  minimumTouchTarget: 44, // pixels
  minimumContrastRatio: 4.5, // WCAG AA
  minimumFocusOutline: 2, // pixels

  // Reduced motion alternatives
  reducedMotionAlternatives: {
    breathing: { opacity: 0.8 }, // Static opacity instead of breathing
    pulsing: { scale: 1.1 }, // Single scale instead of pulse
    shooting: { display: 'none' }, // Hide shooting stars
    flowing: { borderStyle: 'dashed' }, // Static dashed lines instead of particles
  },

  // Screen reader announcements
  announcementDebounce: 1000, // ms between announcements
  maxAnnouncementLength: 100, // characters

  // Keyboard navigation
  focusScopeRadius: 50, // pixels for spatial navigation
  navigationWrapAround: true,

  // High contrast
  highContrastColors: {
    background: '#000000',
    foreground: '#ffffff',
    accent: '#ffff00',
    connection: '#808080',
  },
} as const;

// ==================== MOTION PREFERENCE DETECTION ====================

export interface MotionPreferences {
  prefersReduced: boolean;
  prefersNoParallax: boolean;
  prefersReducedTransparency: boolean;
  prefersHighContrast: boolean;
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
}

export const detectMotionPreferences = (): MotionPreferences => {
  // Check for reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersNoParallax = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // Same for now
  const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

  // Check color scheme preference
  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  let prefersColorScheme: 'light' | 'dark' | 'no-preference' = 'no-preference';
  if (colorSchemeQuery.matches) {
    prefersColorScheme = 'dark';
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    prefersColorScheme = 'light';
  }

  return {
    prefersReduced,
    prefersNoParallax,
    prefersReducedTransparency,
    prefersHighContrast,
    prefersColorScheme,
  };
};

// ==================== SCREEN READER MANAGER ====================

export class ScreenReaderManager {
  private liveRegion: HTMLElement | null = null;
  private announcements: string[] = [];
  private lastAnnouncement = 0;

  constructor() {
    this.createLiveRegion();
  }

  private createLiveRegion(): void {
    // Create visually hidden live region for announcements
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    `;
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    const now = Date.now();
    if (now - this.lastAnnouncement < ACCESSIBILITY_CONFIG.announcementDebounce) {
      // Queue the announcement
      this.announcements.push(message);
      return;
    }

    this.deliverAnnouncement(message, priority);
  }

  private deliverAnnouncement(message: string, priority: 'polite' | 'assertive'): void {
    if (!this.liveRegion) return;

    // Truncate if too long
    const truncatedMessage = message.length > ACCESSIBILITY_CONFIG.maxAnnouncementLength
      ? message.substring(0, ACCESSIBILITY_CONFIG.maxAnnouncementLength - 3) + '...'
      : message;

    this.liveRegion.textContent = truncatedMessage;
    this.lastAnnouncement = Date.now();

    // Update politeness level if needed
    if (priority === 'assertive') {
      this.liveRegion.setAttribute('aria-live', 'assertive');
      setTimeout(() => {
        this.liveRegion?.setAttribute('aria-live', 'polite');
      }, 100);
    }
  }

  processQueue(): void {
    if (this.announcements.length > 0) {
      const message = this.announcements.shift()!;
      this.deliverAnnouncement(message, 'polite');
    }
  }

  destroy(): void {
    if (this.liveRegion) {
      this.liveRegion.remove();
      this.liveRegion = null;
    }
    this.announcements = [];
  }
}

// ==================== KEYBOARD NAVIGATION MANAGER ====================

export interface NavigationNode {
  element: HTMLElement;
  x: number;
  y: number;
  id: string;
  label: string;
}

export class KeyboardNavigationManager {
  private nodes: Map<string, NavigationNode> = new Map();
  private currentIndex = 0;
  private keys = new Set<string>();

  constructor() {
    this.setupEventListeners();
  }

  addNode(node: NavigationNode): void {
    this.nodes.set(node.id, node);
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.key);

    const nodeArray = Array.from(this.nodes.values());
    if (nodeArray.length === 0) return;

    let targetNode: NavigationNode | null = null;

    // Spatial navigation with arrow keys
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      targetNode = this.findNearestNode(event.key);
    }

    // Tab navigation
    if (event.key === 'Tab') {
      if (ACCESSIBILITY_CONFIG.navigationWrapAround) {
        event.preventDefault();
        if (event.shiftKey) {
          this.currentIndex = (this.currentIndex - 1 + nodeArray.length) % nodeArray.length;
        } else {
          this.currentIndex = (this.currentIndex + 1) % nodeArray.length;
        }
        targetNode = nodeArray[this.currentIndex];
      }
    }

    // Enter or Space to activate
    if ((event.key === 'Enter' || event.key === ' ') && document.activeElement) {
      const activeNode = Array.from(this.nodes.values())
        .find(node => node.element === document.activeElement);
      if (activeNode) {
        event.preventDefault();
        activeNode.element.click();
      }
    }

    if (targetNode) {
      targetNode.element.focus();
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.key);
  };

  private findNearestNode(direction: string): NavigationNode | null {
    const activeElement = document.activeElement;
    if (!activeElement) return null;

    const activeNode = Array.from(this.nodes.values())
      .find(node => node.element === activeElement);
    if (!activeNode) return null;

    const nodes = Array.from(this.nodes.values());
    let nearest: NavigationNode | null = null;
    let minDistance = Infinity;

    nodes.forEach(node => {
      if (node.id === activeNode.id) return;

      const dx = node.x - activeNode.x;
      const dy = node.y - activeNode.y;
      let distance = 0;

      switch (direction) {
        case 'ArrowUp':
          if (dy < 0 && Math.abs(dy) >= Math.abs(dx)) {
            distance = Math.sqrt(dx * dx + dy * dy);
          }
          break;
        case 'ArrowDown':
          if (dy > 0 && Math.abs(dy) >= Math.abs(dx)) {
            distance = Math.sqrt(dx * dx + dy * dy);
          }
          break;
        case 'ArrowLeft':
          if (dx < 0 && Math.abs(dx) >= Math.abs(dy)) {
            distance = Math.sqrt(dx * dx + dy * dy);
          }
          break;
        case 'ArrowRight':
          if (dx > 0 && Math.abs(dx) >= Math.abs(dy)) {
            distance = Math.sqrt(dx * dx + dy * dy);
          }
          break;
      }

      if (distance > 0 && distance < minDistance) {
        minDistance = distance;
        nearest = node;
      }
    });

    return nearest;
  }

  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.nodes.clear();
  }
}

// ==================== FOCUS MANAGER ====================

export class FocusManager {
  private focusableElements: HTMLElement[] = [];
  private observer: MutationObserver | null = null;

  constructor(private container: HTMLElement) {
    this.updateFocusableElements();
    this.setupObserver();
  }

  private updateFocusableElements(): void {
    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([aria-disabled="true"])',
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(selector)
    ) as HTMLElement[];
  }

  private setupObserver(): void {
    this.observer = new MutationObserver(() => {
      this.updateFocusableElements();
    });

    this.observer.observe(this.container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'aria-disabled'],
    });
  }

  focusFirst(): void {
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  }

  focusLast(): void {
    if (this.focusableElements.length > 0) {
      this.focusableElements[this.focusableElements.length - 1].focus();
    }
  }

  trapFocus(): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (this.focusableElements.length === 0) return;

      const firstElement = this.focusableElements[0];
      const lastElement = this.focusableElements[this.focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    this.container.addEventListener('keydown', handleKeyDown);
    return () => this.container.removeEventListener('keydown', handleKeyDown);
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.focusableElements = [];
  }
}

// ==================== REACT HOOKS ====================

export const useAccessibility = () => {
  const reducedMotion = useReducedMotion();
  const [preferences, setPreferences] = useState<MotionPreferences>(() => detectMotionPreferences());
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const screenReaderManager = useRef<ScreenReaderManager | null>(null);
  const keyboardManager = useRef<KeyboardNavigationManager | null>(null);

  // Initialize managers
  useEffect(() => {
    screenReaderManager.current = new ScreenReaderManager();
    keyboardManager.current = new KeyboardNavigationManager();

    return () => {
      screenReaderManager.current?.destroy();
      keyboardManager.current?.destroy();
    };
  }, []);

  // Detect screen reader
  useEffect(() => {
    // Heuristic detection based on common screen reader behaviors
    const checkScreenReader = () => {
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      setScreenReaderEnabled(hasReducedMotion || hasHighContrast);
    };

    checkScreenReader();

    // Listen for changes
    const mediaQueries = [
      '(prefers-reduced-motion: reduce)',
      '(prefers-contrast: high)',
    ];

    const listeners = mediaQueries.map(query => {
      const mq = window.matchMedia(query);
      const listener = () => checkScreenReader();
      mq.addListener(listener);
      return { mq, listener };
    });

    return () => {
      listeners.forEach(({ mq, listener }) => mq.removeListener(listener));
    };
  }, []);

  // Announce to screen reader
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    screenReaderManager.current?.announce(message, priority);
  }, []);

  // Register keyboard navigation node
  const registerNavigationNode = useCallback((node: NavigationNode) => {
    keyboardManager.current?.addNode(node);
  }, []);

  const unregisterNavigationNode = useCallback((id: string) => {
    keyboardManager.current?.removeNode(id);
  }, []);

  return {
    reducedMotion,
    preferences,
    screenReaderEnabled,
    announce,
    registerNavigationNode,
    unregisterNavigationNode,
  };
};

export const useFocusableElement = (ref: React.RefObject<HTMLElement>, options: {
  label?: string;
  description?: string;
  role?: string;
  tabIndex?: number;
} = {}) => {
  const { registerNavigationNode, unregisterNavigationNode } = useAccessibility();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set accessibility attributes
    if (options.label) {
      element.setAttribute('aria-label', options.label);
    }
    if (options.description) {
      element.setAttribute('aria-describedby', options.description);
    }
    if (options.role) {
      element.setAttribute('role', options.role);
    }
    if (options.tabIndex !== undefined) {
      element.tabIndex = options.tabIndex;
    }

    // Ensure minimum touch target size
    const rect = element.getBoundingClientRect();
    if (rect.width < ACCESSIBILITY_CONFIG.minimumTouchTarget ||
        rect.height < ACCESSIBILITY_CONFIG.minimumTouchTarget) {
      element.style.minWidth = `${ACCESSIBILITY_CONFIG.minimumTouchTarget}px`;
      element.style.minHeight = `${ACCESSIBILITY_CONFIG.minimumTouchTarget}px`;
    }

    // Add focus styles
    const currentOutline = element.style.outline;
    element.style.outline = `${ACCESSIBILITY_CONFIG.minimumFocusOutline}px solid currentColor`;
    element.style.outlineOffset = '2px';

    // Register for keyboard navigation if needed
    if (options.role === 'button' || element.tabIndex >= 0) {
      const nodeRect = element.getBoundingClientRect();
      const containerRect = element.closest('.cosmic-constellation')?.getBoundingClientRect();

      if (containerRect) {
        registerNavigationNode({
          element,
          x: nodeRect.left - containerRect.left + nodeRect.width / 2,
          y: nodeRect.top - containerRect.top + nodeRect.height / 2,
          id: options.label || element.id || `element-${Date.now()}`,
          label: options.label || '',
        });
      }
    }

    return () => {
      // Restore original outline
      element.style.outline = currentOutline;

      // Unregister from navigation
      unregisterNavigationNode(element.id);
    };
  }, [ref, options, registerNavigationNode, unregisterNavigationNode]);
};

export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addListener(listener);

    return () => mediaQuery.removeListener(listener);
  }, []);

  return {
    isHighContrast,
    colors: ACCESSIBILITY_CONFIG.highContrastColors,
  };
};

// ==================== ACCESSIBLE STAR COMPONENT ====================

export interface AccessibleStarProps {
  node: any; // StarNode type
  onClick: () => void;
  onFocus: () => void;
  onBlur: () => void;
  reducedMotion: boolean;
  screenReaderEnabled: boolean;
}

export const AccessibleStar: React.FC<AccessibleStarProps> = ({
  node,
  onClick,
  onFocus,
  onBlur,
  reducedMotion,
  screenReaderEnabled
}) => {
  const ref = useRef<HTMLButtonElement>(null);

  useFocusableElement(ref, {
    label: `Repository: ${node.name}. ${node.commits} commits. Last updated ${node.lastCommit.toLocaleDateString()}`,
    role: 'button',
    tabIndex: 0,
  });

  // Apply reduced motion styles
  const motionStyles = useMemo(() => {
    if (reducedMotion) {
      return ACCESSIBILITY_CONFIG.reducedMotionAlternatives;
    }
    return {};
  }, [reducedMotion]);

  return (
    <button
      ref={ref}
      className={`cosmic-star accessible-star ${screenReaderEnabled ? 'screen-reader-mode' : ''}`}
      style={{
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${ACCESSIBILITY_CONFIG.minimumTouchTarget}px`,
        height: `${ACCESSIBILITY_CONFIG.minimumTouchTarget}px`,
        ...motionStyles,
      }}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-describedby={`star-info-${node.id}`}
    >
      <span className="sr-only">
        Repository: {node.name}, {node.commits} commits
      </span>

      {/* Visual indicator for screen readers */}
      {screenReaderEnabled && (
        <div
          id={`star-info-${node.id}`}
          className="sr-only"
          aria-live="polite"
        >
          {node.name} - {node.commits} commits
        </div>
      )}
    </button>
  );
};

export default {
  ACCESSIBILITY_CONFIG,
  detectMotionPreferences,
  ScreenReaderManager,
  KeyboardNavigationManager,
  FocusManager,
  useAccessibility,
  useFocusableElement,
  useHighContrast,
  AccessibleStar,
};