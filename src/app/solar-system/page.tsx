'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, Eye, EyeOff, Globe, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Dynamic import to avoid SSR issues with Three.js
const SolarSystem = dynamic(
  () => import('@/components/three/SolarSystem').then((mod) => mod.SolarSystem),
  { ssr: false, loading: () => <div className="h-full w-full bg-black flex items-center justify-center text-white">Loading Solar System...</div> }
);

const planetInfo = [
  { name: 'Sun', color: '#fbbf24', description: 'The star at the center of our solar system.', fact: '5,500°C surface' },
  { name: 'Mercury', color: '#9ca3af', description: 'Smallest planet, extreme temperature swings.', fact: '59 Earth day rotation' },
  { name: 'Venus', color: '#f59e0b', description: 'Hottest planet due to runaway greenhouse effect.', fact: '465°C average' },
  { name: 'Earth', color: '#3b82f6', description: 'Our home, the only known planet with life.', fact: 'Click to explore!', link: true },
  { name: 'Mars', color: '#ef4444', description: 'The Red Planet, target for human exploration.', fact: 'Has Olympus Mons' },
  { name: 'Jupiter', color: '#d97706', description: 'Largest planet with the Great Red Spot.', fact: '95 known moons' },
  { name: 'Saturn', color: '#eab308', description: 'Famous for its stunning ring system.', fact: 'Could float on water' },
  { name: 'Uranus', color: '#06b6d4', description: 'Ice giant that rotates on its side.', fact: '98° axial tilt' },
  { name: 'Neptune', color: '#3b82f6', description: 'Windiest planet, storms reach 2,100 km/h.', fact: '14 known moons' },
];

export default function SolarSystemPage() {
  const [showLabels, setShowLabels] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D Solar System */}
      <SolarSystem
        className="h-full w-full"
        showExpandButton={false}
        showLabels={showLabels}
        interactive={true}
      />

      {/* Header Controls - Compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-3 md:top-4 left-3 md:left-4 right-3 md:right-4 flex justify-between items-center z-10"
      >
        <Link href="/">
          <Button variant="secondary" size="sm" className="gap-1.5 md:gap-2 bg-black/70 backdrop-blur-sm border-white/10 text-white hover:bg-white/20 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3">
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>

        <div className="flex gap-1.5 md:gap-2">
          <Link href="/solar-system/earth">
            <Button variant="secondary" size="sm" className="gap-1.5 bg-primary/50 backdrop-blur-sm border-primary/30 text-white hover:bg-primary/70 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3">
              <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Earth</span>
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
            className={`gap-1.5 backdrop-blur-sm border-white/10 text-white hover:bg-white/20 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3 ${showLabels ? 'bg-white/20' : 'bg-black/70'}`}
          >
            {showLabels ? <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />}
            <span className="hidden md:inline">Labels</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className={`backdrop-blur-sm border-white/10 text-white hover:bg-white/20 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3 ${showInfo ? 'bg-white/20' : 'bg-black/70'}`}
          >
            <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Title - Hidden on small mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="hidden sm:block absolute top-14 md:top-16 left-1/2 -translate-x-1/2 text-center z-10"
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">Solar System</h1>
        <p className="text-white/50 text-xs md:text-sm">Drag to rotate • Scroll to zoom</p>
      </motion.div>

      {/* Planet Info Panel - Bottom sheet on mobile, side panel on desktop */}
      <AnimatePresence>
        {showInfo && (
          <>
            {/* Desktop Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 w-60 z-10"
            >
              <Card className="bg-black/70 backdrop-blur-sm border-white/10 rounded-xl">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">Planets</h3>
                    <button
                      onClick={() => setShowInfo(false)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 text-white/50" />
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                    {planetInfo.map((planet, index) => (
                      <button
                        key={planet.name}
                        onClick={() => setSelectedPlanet(selectedPlanet === index ? null : index)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-all ${
                          selectedPlanet === index ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: planet.color }}
                          />
                          <span className="text-white font-medium">{planet.name}</span>
                        </div>
                        <AnimatePresence>
                          {selectedPlanet === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 ml-4.5"
                            >
                              <p className="text-white/60 leading-relaxed">{planet.description}</p>
                              <p className="text-primary mt-1 font-medium">{planet.fact}</p>
                              {planet.link && (
                                <Link href="/solar-system/earth" className="inline-block mt-2">
                                  <Button size="sm" className="h-7 text-xs">
                                    Explore Earth
                                  </Button>
                                </Link>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mobile Bottom Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="md:hidden absolute bottom-0 left-0 right-0 z-20"
            >
              <div className="bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-t-2xl">
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-10 h-1 bg-white/20 rounded-full" />
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">Planets</h3>
                    <button
                      onClick={() => setShowInfo(false)}
                      className="p-1.5 hover:bg-white/10 rounded-lg"
                    >
                      <X className="h-4 w-4 text-white/50" />
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {planetInfo.map((planet, index) => (
                      <button
                        key={planet.name}
                        onClick={() => setSelectedPlanet(selectedPlanet === index ? null : index)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all ${
                          selectedPlanet === index
                            ? 'bg-white/20 ring-1 ring-white/30'
                            : 'bg-white/5'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: planet.color }}
                        />
                        <span className="text-white">{planet.name}</span>
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {selectedPlanet !== null && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 bg-white/5 rounded-xl"
                      >
                        <h4 className="text-white font-semibold mb-1">{planetInfo[selectedPlanet].name}</h4>
                        <p className="text-white/60 text-xs leading-relaxed">{planetInfo[selectedPlanet].description}</p>
                        <p className="text-primary text-xs mt-1 font-medium">{planetInfo[selectedPlanet].fact}</p>
                        {planetInfo[selectedPlanet].link && (
                          <Link href="/solar-system/earth" className="inline-block mt-2">
                            <Button size="sm" className="h-7 text-xs">
                              Explore Earth
                            </Button>
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile hint at bottom when info panel is closed */}
      {!showInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
        >
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 text-white/70 text-xs"
          >
            <ChevronUp className="h-3 w-3" />
            Tap for planet info
          </button>
        </motion.div>
      )}
    </div>
  );
}
