/**
 * Constellation Animation System - Living Cosmos Visualizations
 *
 * Purpose: Transform data visualizations into living, breathing cosmic systems
 * with sophisticated animations that tell stories without overwhelming users
 *
 * Core Principles:
 * - Motion as narrative: Each animation reveals data relationships
 * - Performance first: 60fps GPU-accelerated animations only
 * - Accessibility always: Full reduced motion support
 * - Data-driven: Animations respond to actual commit/activity data
 * - Subtle magic: Feels alive, not noisy
 *
 * Animation Philosophy:
 * - Breathing nebulae = ambient data flow
 * - Pulsing stars = commit activity intensity
 * - Gentle drift = organic system evolution
 * - Shooting stars = significant events
 * - Data flow = connection strength
 * - Gravitational hover = natural interaction
 */

// ==================== ANIMATION TIMING SYSTEM ====================

export const COSMIC_TIMING = {
  // Breathing cycles (organic, meditative)
  breathing: {
    inhale: 4000,      // 4s - slow, natural breath
    hold: 800,         // 0.8s - brief pause
    exhale: 3000,      // 3s - gentle release
    pause: 1200,       // 1.2s - rest between cycles
  },

  // Star pulsing (data-driven heartbeat)
  pulse: {
    faint: 2000,       // 2s - minimal activity
    normal: 1200,      // 1.2s - regular activity
    active: 600,       // 0.6s - high activity
    intense: 300,      // 0.3s - peak activity
  },

  // System drift (celestial mechanics)
  drift: {
    rotation: 60000,   // 60s - full rotation cycle
    oscillation: 8000, // 8s - gentle wobble
    wander: 20000,    // 20s - slow position drift
  },

  // Special events (rare, meaningful)
  shootingStar: {
    appearance: 1500,  // 1.5s - from edge to edge
    cooldown: 8000,    // 8s - minimum between events
    probability: 0.15, // 15% chance per cooldown
  },

  // Data flow (connection storytelling)
  flow: {
    particleSpeed: 2000, // 2s - travel time
    particleGap: 400,    // 0.4s - between particles
    pulseSpeed: 800,     // 0.8s - data pulse wave
  },

  // Interaction responses
  hover: {
    attract: 400,       // 0.4s - gravitational pull
    glow: 300,          // 0.3s - gentle illumination
    info: 200,          // 0.2s - information reveal
  },
} as const;

// ==================== EASING FUNCTIONS ====================

export const COSMIC_EASING = {
  // Natural physics-based curves
  breathing: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',  // Smooth, sinusoidal
  starPulse: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',  // Gentle heartbeat
  drift: 'cubic-bezier(0.4, 0, 0.6, 1)',               // Linear with soft edges
  shootingStar: 'cubic-bezier(0.11, 0, 0.5, 0)',       // Fast entry, quick exit
  dataFlow: 'cubic-bezier(0.25, 0.1, 0.25, 1)',        // Smooth continuous
  hoverAttract: 'cubic-bezier(0.34, 1.56, 0.64, 1)',   // Spring physics
  glowSpread: 'cubic-bezier(0.16, 1, 0.3, 1)',         // Gentle bloom
} as const;

// ==================== CSS CUSTOM PROPERTIES ====================

export const COSMIC_CSS_VARS = `
  /* =================================
     COSMIC ANIMATION SYSTEM VARIABLES
     ================================= */

  /* Breathing Animation */
  --cosmic-breathing-duration: 4s;
  --cosmic-breathing-easing: cubic-bezier(0.45, 0.05, 0.55, 0.95);
  --cosmic-breathing-scale-min: 0.95;
  --cosmic-breathing-scale-max: 1.05;
  --cosmic-breathing-opacity-min: 0.7;
  --cosmic-breathing-opacity-max: 0.9;

  /* Star Pulsing */
  --cosmic-pulse-duration: 1.2s;
  --cosmic-pulse-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --cosmic-pulse-scale-min: 0.8;
  --cosmic-pulse-scale-max: 1.3;
  --cosmic-pulse-glow-min: 0.2;
  --cosmic-pulse-glow-max: 0.8;

  /* System Drift */
  --cosmic-drift-duration: 60s;
  --cosmic-drift-easing: cubic-bezier(0.4, 0, 0.6, 1);
  --cosmic-drift-rotation: 360deg;
  --cosmic-drift-oscillation: 5deg;
  --cosmic-drift-wander: 10px;

  /* Shooting Stars */
  --cosmic-shooting-star-duration: 1.5s;
  --cosmic-shooting-star-easing: cubic-bezier(0.11, 0, 0.5, 0);
  --cosmic-shooting-star-length: 300px;
  --cosmic-shooting-star-width: 2px;

  /* Data Flow */
  --cosmic-flow-duration: 2s;
  --cosmic-flow-easing: cubic-bezier(0.25, 0.1, 0.25, 1);
  --cosmic-flow-particle-size: 4px;
  --cosmic-flow-glow-size: 8px;

  /* Hover Gravitational */
  --cosmic-hover-duration: 0.4s;
  --cosmic-hover-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
  --cosmic-hover-pull-strength: 12px;
  --cosmic-hover-glow-radius: 20px;

  /* Performance Optimizations */
  --cosmic-will-change: transform, opacity, filter;
  --cosmic-transform-origin: center center;

  /* Reduced Motion Respect */
  @media (prefers-reduced-motion: reduce) {
    --cosmic-breathing-duration: 0.01ms;
    --cosmic-pulse-duration: 0.01ms;
    --cosmic-drift-duration: 0.01ms;
    --cosmic-shooting-star-duration: 0.01ms;
    --cosmic-flow-duration: 0.01ms;
    --cosmic-hover-duration: 0.01ms;
  }
`;

// ==================== KEYFRAME ANIMATIONS ====================

export const COSMIC_KEYFRAMES = `
  /* =================================
     COSMIC KEYFRAME ANIMATIONS
     ================================= */

  /* Nebula Breathing */
  @keyframes cosmic-breathing {
    0%, 100% {
      transform: scale(var(--cosmic-breathing-scale-min));
      opacity: var(--cosmic-breathing-opacity-min);
      filter: blur(1px);
    }
    25% {
      transform: scale(1);
      opacity: var(--cosmic-breathing-opacity-max);
      filter: blur(0.5px);
    }
    50% {
      transform: scale(var(--cosmic-breathing-scale-max));
      opacity: var(--cosmic-breathing-opacity-min);
      filter: blur(1px);
    }
    75% {
      transform: scale(1);
      opacity: var(--cosmic-breathing-opacity-max);
      filter: blur(0.5px);
    }
  }

  /* Star Pulsing */
  @keyframes cosmic-pulse-faint {
    0%, 100% {
      transform: scale(1);
      filter: brightness(1) drop-shadow(0 0 var(--cosmic-pulse-glow-min) currentColor);
    }
    50% {
      transform: scale(var(--cosmic-pulse-scale-min));
      filter: brightness(1.2) drop-shadow(0 0 var(--cosmic-pulse-glow-min) currentColor);
    }
  }

  @keyframes cosmic-pulse-normal {
    0%, 100% {
      transform: scale(1);
      filter: brightness(1.2) drop-shadow(0 0 var(--cosmic-pulse-glow-min) currentColor);
    }
    50% {
      transform: scale(var(--cosmic-pulse-scale-max));
      filter: brightness(1.5) drop-shadow(0 0 var(--cosmic-pulse-glow-max) currentColor);
    }
  }

  @keyframes cosmic-pulse-active {
    0%, 100% {
      transform: scale(1.1);
      filter: brightness(1.5) drop-shadow(0 0 var(--cosmic-pulse-glow-max) currentColor);
    }
    50% {
      transform: scale(calc(var(--cosmic-pulse-scale-max) * 1.2));
      filter: brightness(2) drop-shadow(0 0 calc(var(--cosmic-pulse-glow-max) * 1.5)) currentColor);
    }
  }

  /* System Drift */
  @keyframes cosmic-drift-rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(var(--cosmic-drift-rotation));
    }
  }

  @keyframes cosmic-drift-oscillation {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(var(--cosmic-drift-oscillation));
    }
    75% {
      transform: rotate(calc(var(--cosmic-drift-oscillation) * -1));
    }
  }

  @keyframes cosmic-drift-wander {
    0% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(var(--cosmic-drift-wander), calc(var(--cosmic-drift-wander) * -0.5));
    }
    50% {
      transform: translate(0, calc(var(--cosmic-drift-wander) * -1));
    }
    75% {
      transform: translate(calc(var(--cosmic-drift-wander) * -1), calc(var(--cosmic-drift-wander) * -0.5));
    }
    100% {
      transform: translate(0, 0);
    }
  }

  /* Shooting Stars */
  @keyframes cosmic-shooting-star {
    0% {
      transform: translateX(-100px) translateY(-100px);
      opacity: 0;
      width: 0;
    }
    10% {
      opacity: 1;
      width: var(--cosmic-shooting-star-length);
    }
    90% {
      opacity: 1;
      width: var(--cosmic-shooting-star-length);
    }
    100% {
      transform: translateX(calc(var(--cosmic-shooting-star-length) + 100px))
                 translateY(calc(var(--cosmic-shooting-star-length) + 100px));
      opacity: 0;
      width: 0;
    }
  }

  /* Data Flow Particles */
  @keyframes cosmic-flow-particle {
    0% {
      transform: translateX(0) scale(0);
      opacity: 0;
    }
    10% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateX(100%) scale(0);
      opacity: 0;
    }
  }

  /* Data Pulse Waves */
  @keyframes cosmic-data-pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }

  /* Gravitational Hover */
  @keyframes cosmic-hover-attract {
    0% {
      transform: scale(1);
      filter: brightness(1);
    }
    100% {
      transform: scale(1.05);
      filter: brightness(1.3) drop-shadow(0 0 var(--cosmic-hover-glow-radius) currentColor);
    }
  }
`;

// ==================== ANIMATION CHOREOGRAPHY ====================

export class CosmicChoreography {
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private shootingStarCooldown: number = 0;
  private activeAnimations: Map<string, any> = new Map();

  constructor(private container: HTMLElement) {
    this.startChoreography();
  }

  // Main animation loop
  private startChoreography = () => {
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      // Update all animation systems
      this.updateShootingStars(deltaTime);
      this.updateDataFlow(deltaTime);
      this.updateStarPulses(deltaTime);

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  };

  // Shooting star management
  private updateShootingStars = (deltaTime: number) => {
    this.shootingStarCooldown -= deltaTime;

    if (this.shootingStarCooldown <= 0) {
      if (Math.random() < COSMIC_TIMING.shootingStar.probability) {
        this.createShootingStar();
        this.shootingStarCooldown = COSMIC_TIMING.shootingStar.cooldown;
      } else {
        this.shootingStarCooldown = 2000; // Check again in 2s
      }
    }
  };

  private createShootingStar = () => {
    const star = document.createElement('div');
    star.className = 'cosmic-shooting-star';
    star.style.cssText = `
      position: absolute;
      width: var(--cosmic-shooting-star-width);
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
      top: ${Math.random() * 100}%;
      left: -100px;
      transform: rotate(${Math.random() * 60 + 30}deg);
      animation: cosmic-shooting-star var(--cosmic-shooting-star-duration) var(--cosmic-shooting-star-easing) forwards;
      pointer-events: none;
      z-index: 10;
    `;

    this.container.appendChild(star);

    // Clean up after animation
    setTimeout(() => {
      star.remove();
    }, COSMIC_TIMING.shootingStar.appearance);
  };

  // Data flow animations
  private updateDataFlow = (deltaTime: number) => {
    // Find all connection lines and add flow particles
    const connections = this.container.querySelectorAll('.cosmic-connection');
    connections.forEach(connection => {
      if (Math.random() < 0.01) { // 1% chance per frame
        this.createFlowParticle(connection as HTMLElement);
      }
    });
  };

  private createFlowParticle = (connection: HTMLElement) => {
    const particle = document.createElement('div');
    particle.className = 'cosmic-flow-particle';

    const rect = connection.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    particle.style.cssText = `
      position: absolute;
      width: var(--cosmic-flow-particle-size);
      height: var(--cosmic-flow-particle-size);
      background: radial-gradient(circle, rgba(100,200,255,0.8), transparent);
      border-radius: 50%;
      left: ${rect.left - containerRect.left}px;
      top: ${rect.top - containerRect.top + rect.height / 2}px;
      transform: translateX(0);
      pointer-events: none;
      z-index: 5;
    `;

    this.container.appendChild(particle);

    // Animate along connection path
    const animation = particle.animate([
      {
        transform: 'translateX(0) scale(0)',
        opacity: 0
      },
      {
        transform: 'translateX(0) scale(1)',
        opacity: 1,
        offset: 0.1
      },
      {
        transform: `translateX(${rect.width}px) scale(1)`,
        opacity: 1,
        offset: 0.9
      },
      {
        transform: `translateX(${rect.width}px) scale(0)`,
        opacity: 0
      }
    ], {
      duration: COSMIC_TIMING.flow.particleSpeed,
      easing: COSMIC_EASING.dataFlow,
      fill: 'forwards'
    });

    animation.onfinish = () => particle.remove();
  };

  // Star pulse updates based on data
  private updateStarPulses = (deltaTime: number) => {
    const stars = this.container.querySelectorAll('.cosmic-star');
    stars.forEach(star => {
      const intensity = this.getStarIntensity(star as HTMLElement);
      this.updateStarPulse(star as HTMLElement, intensity);
    });
  };

  private getStarIntensity = (star: HTMLElement): 'faint' | 'normal' | 'active' | 'intense' => {
    const activity = parseFloat(star.dataset.activity || '0');

    if (activity < 0.2) return 'faint';
    if (activity < 0.5) return 'normal';
    if (activity < 0.8) return 'active';
    return 'intense';
  };

  private updateStarPulse = (star: HTMLElement, intensity: string) => {
    const currentClass = star.className.match(/cosmic-pulse-\w+/)?.[0];
    const newClass = `cosmic-pulse-${intensity}`;

    if (currentClass !== newClass) {
      star.classList.remove(currentClass || '');
      star.classList.add(newClass);

      // Update animation duration based on intensity
      const duration = COSMIC_TIMING.pulse[intensity as keyof typeof COSMIC_TIMING.pulse];
      star.style.animationDuration = `${duration}ms`;
    }
  };

  // Cleanup
  public destroy = () => {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.activeAnimations.clear();
  };
}

// ==================== UTILITY FUNCTIONS ====================

export const createCosmicStyles = () => {
  const styleId = 'cosmic-constellation-styles';

  if (document.getElementById(styleId)) {
    return; // Already loaded
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = COSMIC_CSS_VARS + COSMIC_KEYFRAMES;
  document.head.appendChild(style);
};

export const applyCosmicClasses = (element: HTMLElement, type: string, intensity?: string) => {
  const baseClass = `cosmic-${type}`;
  element.classList.add(baseClass);

  if (intensity) {
    element.classList.add(`${baseClass}-${intensity}`);
  }

  // Performance optimizations
  element.style.willChange = 'transform, opacity, filter';
  element.style.transformOrigin = 'center center';
};

export const getElementActivityLevel = (commits: number, maxCommits: number): number => {
  // Normalize commits to 0-1 range with some sensitivity
  const normalized = commits / (maxCommits || 1);
  return Math.pow(normalized, 0.7); // Non-linear scaling for visual interest
};

// ==================== ACCESSIBILITY HELPERS ====================

export const setupReducedMotion = (element: HTMLElement) => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const updateMotion = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) {
      // Remove all animations, show static states
      element.style.animation = 'none';
      element.querySelectorAll('[class*="cosmic-"]').forEach(child => {
        (child as HTMLElement).style.animation = 'none';
      });
    } else {
      // Restore animations
      element.querySelectorAll('[class*="cosmic-"]').forEach(child => {
        const classes = child.className.split(' ');
        classes.forEach(cls => {
          if (cls.startsWith('cosmic-') && !cls.includes('-particle')) {
            (child as HTMLElement).style.animation = '';
          }
        });
      });
    }
  };

  updateMotion(mediaQuery);
  mediaQuery.addEventListener('change', updateMotion as any);

  return () => mediaQuery.removeEventListener('change', updateMotion as any);
};

export default {
  COSMIC_TIMING,
  COSMIC_EASING,
  COSMIC_CSS_VARS,
  COSMIC_KEYFRAMES,
  CosmicChoreography,
  createCosmicStyles,
  applyCosmicClasses,
  getElementActivityLevel,
  setupReducedMotion,
};