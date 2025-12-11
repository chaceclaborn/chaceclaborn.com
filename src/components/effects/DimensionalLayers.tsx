'use client';

import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LayerContent {
  id: string;
  label: string;
  content: ReactNode;
  depth: number;
}

interface DimensionalLayersProps {
  layers: LayerContent[];
  initialLayer?: number;
  onLayerChange?: (layerIndex: number) => void;
}

export function DimensionalLayers({
  layers,
  initialLayer = 0,
  onLayerChange
}: DimensionalLayersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState(initialLayer);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const touchStartLayer = useRef(initialLayer);

  const totalLayers = layers.length;

  // Navigate to a specific layer
  const navigateToLayer = useCallback((layerIndex: number) => {
    const clampedIndex = Math.min(totalLayers - 1, Math.max(0, layerIndex));
    if (clampedIndex !== activeLayer && !isTransitioning) {
      setIsTransitioning(true);
      setActiveLayer(clampedIndex);
      onLayerChange?.(clampedIndex);
      // Allow transition to complete before accepting new input
      setTimeout(() => setIsTransitioning(false), 400);
    }
  }, [activeLayer, totalLayers, onLayerChange, isTransitioning]);

  // Handle navigation input (wheel/touch/keyboard)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if the event originated from an interactive element that needs scrolling
      const target = e.target as HTMLElement;
      const isInteractiveElement = target.closest('canvas') ||
                                   target.closest('[data-allow-scroll]') ||
                                   target.closest('.solar-system-container');

      // Allow native scroll behavior for interactive elements
      if (isInteractiveElement) {
        return;
      }

      e.preventDefault();

      const now = Date.now();
      // Debounce wheel events
      if (now - lastScrollTime.current < 400) return;
      lastScrollTime.current = now;

      if (e.deltaY > 30) {
        navigateToLayer(activeLayer + 1);
      } else if (e.deltaY < -30) {
        navigateToLayer(activeLayer - 1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const isInteractiveElement = target.closest('canvas') ||
                                   target.closest('[data-allow-scroll]') ||
                                   target.closest('.solar-system-container');
      if (isInteractiveElement) return;

      touchStartY.current = e.touches[0].clientY;
      touchStartLayer.current = activeLayer;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const isInteractiveElement = target.closest('canvas') ||
                                   target.closest('[data-allow-scroll]') ||
                                   target.closest('.solar-system-container');
      if (isInteractiveElement) return;

      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;

      // Reduced threshold (30px) for easier mobile swiping
      if (Math.abs(deltaY) > 30) {
        if (deltaY > 0) {
          navigateToLayer(touchStartLayer.current + 1);
        } else {
          navigateToLayer(touchStartLayer.current - 1);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keyboard if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        navigateToLayer(activeLayer + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        navigateToLayer(activeLayer - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateToLayer(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateToLayer(totalLayers - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeLayer, totalLayers, navigateToLayer]);

  return (
    <div
      ref={containerRef}
      className="dimensional-container"
      tabIndex={0}
      role="region"
      aria-label="Dimensional navigation - use scroll wheel or arrow keys to navigate between sections"
    >
      {/* Layer content with simple fade transitions */}
      <div className="dimensional-layers-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="dimensional-active-layer"
          >
            {layers[activeLayer]?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle background depth effect */}
      <div className="dimensional-depth-rings" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="dimensional-bg-ring"
            style={{
              width: `${60 + i * 25}%`,
              height: `${60 + i * 25}%`,
              opacity: 0.03 - i * 0.005,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Depth navigation indicator */}
      <nav className="dimensional-nav-dots" aria-label="Layer navigation">
        {layers.map((layer, index) => (
          <button
            key={layer.id}
            className={`dimensional-dot ${activeLayer === index ? 'active' : ''}`}
            onClick={() => navigateToLayer(index)}
            aria-label={`Navigate to ${layer.label}`}
            aria-current={activeLayer === index ? 'true' : undefined}
          >
            <span className="dimensional-dot-tooltip">{layer.label}</span>
          </button>
        ))}
      </nav>

      {/* Current layer label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLayer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="dimensional-current-label"
        >
          <span className="dimensional-label-text">{layers[activeLayer]?.label}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Export a simple wrapper for backwards compatibility
export function DimensionalBackground() {
  return (
    <div className="dimensional-background-only" aria-hidden="true">
      <div className="dimensional-depth-rings">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="dimensional-bg-ring"
            style={{
              width: `${60 + i * 25}%`,
              height: `${60 + i * 25}%`,
              opacity: 0.03 - i * 0.005,
            }}
          />
        ))}
      </div>
    </div>
  );
}
