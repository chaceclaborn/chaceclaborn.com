'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamic import to avoid SSR issues with Three.js
const SolarSystem = dynamic(
  () => import('@/components/three/SolarSystem').then((mod) => mod.SolarSystem),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-b from-black to-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/60 text-sm">Loading Solar System...</p>
        </div>
      </div>
    )
  }
);

export function SolarSystemLayer() {
  return (
    <div className="w-full h-full flex flex-col items-center px-3 sm:px-4 pt-2">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-2 shrink-0"
      >
        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-0.5">
          Solar System Simulation
        </h2>
        <p className="text-muted-foreground text-[10px] sm:text-xs max-w-xs mx-auto">
          Real-time orbital positions based on NASA data
        </p>
      </motion.div>

      {/* Solar System Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="solar-system-container w-full max-w-2xl grow min-h-0 mb-10"
        style={{ maxHeight: 'calc(100% - 100px)' }}
      >
        <SolarSystem
          className="w-full h-full"
          showExpandButton={true}
          showLabels={false}
          showControls={true}
        />
      </motion.div>
    </div>
  );
}
