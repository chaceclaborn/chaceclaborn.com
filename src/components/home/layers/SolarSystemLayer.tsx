'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Globe } from 'lucide-react';

// Dynamic import to avoid SSR issues with Three.js
const SolarSystem = dynamic(
  () => import('@/components/three/SolarSystem').then((mod) => mod.SolarSystem),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-b from-black to-[#0a0a1a] flex items-center justify-center rounded-xl">
        <div className="text-center">
          <div className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2 sm:mb-3" />
          <p className="text-white/60 text-xs sm:text-sm">Loading Solar System...</p>
        </div>
      </div>
    )
  }
);

export function SolarSystemLayer() {
  return (
    <div className="w-full h-full flex flex-col items-center px-4 sm:px-6 md:px-8 pt-2 sm:pt-3 pb-20 sm:pb-24">
      {/* Header with Visit Earth Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl flex items-center justify-between mb-2 sm:mb-3 shrink-0 px-1"
      >
        <div className="text-center flex-1">
          <h2 className="text-sm sm:text-lg md:text-xl font-bold mb-0.5">
            Solar System Simulation
          </h2>
          <p className="text-muted-foreground text-[9px] sm:text-xs max-w-[280px] sm:max-w-xs mx-auto leading-tight">
            Real-time orbital positions • NASA/JPL data
          </p>
        </div>

        {/* Visit Earth Button */}
        <Link href="/solar-system/earth" className="shrink-0 ml-2">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="group relative"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all hover:scale-105">
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400">
                <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-blue-300 group-hover:text-blue-200 whitespace-nowrap">
                Visit Earth
              </span>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Solar System Container - Smaller on mobile for easier swiping */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="solar-system-container w-full max-w-3xl rounded-xl overflow-hidden"
        style={{
          height: 'calc(100% - 80px)',
          maxHeight: '500px' // Limit height on mobile
        }}
      >
        <SolarSystem
          className="w-full h-full"
          showExpandButton={true}
          showLabels={false}
          showControls={true}
        />
      </motion.div>

      {/* Swipe hint on mobile */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="sm:hidden text-muted-foreground/50 text-[9px] mt-2 text-center"
      >
        Swipe up or down outside the 3D view to navigate
      </motion.p>
    </div>
  );
}
