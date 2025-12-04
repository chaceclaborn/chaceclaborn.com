'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Eye, EyeOff, Globe, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Dynamic import to avoid SSR issues with Three.js
const SolarSystem = dynamic(
  () => import('@/components/three/SolarSystem').then((mod) => mod.SolarSystem),
  { ssr: false, loading: () => <div className="h-full w-full bg-black flex items-center justify-center text-white">Loading Solar System...</div> }
);

const planetInfo = [
  { name: 'Sun', description: 'The star at the center of our solar system.', fact: '5,500°C surface' },
  { name: 'Mercury', description: 'Smallest planet, extreme temperature swings.', fact: '59 Earth day rotation' },
  { name: 'Venus', description: 'Hottest planet due to runaway greenhouse effect.', fact: '465°C average' },
  { name: 'Earth', description: 'Our home, the only known planet with life.', fact: 'Click to explore!' },
  { name: 'Mars', description: 'The Red Planet, target for human exploration.', fact: 'Has Olympus Mons' },
  { name: 'Jupiter', description: 'Largest planet with the Great Red Spot.', fact: '95 known moons' },
  { name: 'Saturn', description: 'Famous for its stunning ring system.', fact: 'Could float on water' },
  { name: 'Uranus', description: 'Ice giant that rotates on its side.', fact: '98° axial tilt' },
  { name: 'Neptune', description: 'Windiest planet, storms reach 2,100 km/h.', fact: '14 known moons' },
];

export default function SolarSystemPage() {
  const [showLabels, setShowLabels] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D Solar System */}
      <SolarSystem
        className="h-full w-full"
        showExpandButton={false}
        showLabels={showLabels}
        interactive={true}
        speedMultiplier={speed}
      />

      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 right-4 flex justify-between items-start z-10"
      >
        <Link href="/">
          <Button variant="secondary" size="sm" className="gap-2 bg-black/60 backdrop-blur-sm border-white/10 text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href="/solar-system/earth">
            <Button variant="secondary" size="sm" className="gap-2 bg-primary/40 backdrop-blur-sm border-white/10 text-white hover:bg-primary/60">
              <Globe className="h-4 w-4" />
              Earth
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
            className={`gap-2 backdrop-blur-sm border-white/10 text-white hover:bg-white/20 ${showLabels ? 'bg-white/20' : 'bg-black/60'}`}
          >
            {showLabels ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Labels
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className={`gap-2 backdrop-blur-sm border-white/10 text-white hover:bg-white/20 ${showInfo ? 'bg-white/20' : 'bg-black/60'}`}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-16 left-1/2 -translate-x-1/2 text-center z-10"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Solar System Explorer</h1>
        <p className="text-white/50 text-sm">Drag to rotate • Scroll to zoom • <Link href="/solar-system/earth" className="text-primary hover:text-primary/80 underline underline-offset-2">Click Earth to explore</Link></p>
      </motion.div>

      {/* Speed Control */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
      >
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-white/40 text-xs mb-2 text-center">Speed</div>
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSpeed(Math.min(3, speed + 0.5))}
              className="h-7 w-7 text-white hover:bg-white/20"
            >
              <span className="text-lg">+</span>
            </Button>
            <div className="py-2 text-center">
              <span className="text-white font-medium text-sm">{speed.toFixed(1)}x</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSpeed(Math.max(0, speed - 0.5))}
              className="h-7 w-7 text-white hover:bg-white/20"
            >
              <span className="text-lg">−</span>
            </Button>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSpeed(speed === 0 ? 1 : 0)}
              className="h-8 w-full text-white hover:bg-white/20"
            >
              {speed === 0 ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Planet Info Panel */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-56 z-10"
        >
          <Card className="bg-black/60 backdrop-blur-sm border-white/10">
            <CardContent className="p-3">
              <h3 className="text-white font-medium mb-2 text-sm">Planets</h3>
              <div className="space-y-1 max-h-[55vh] overflow-y-auto">
                {planetInfo.map((planet, index) => (
                  <button
                    key={planet.name}
                    onClick={() => setSelectedPlanet(selectedPlanet === index ? null : index)}
                    className={`w-full text-left p-1.5 rounded text-xs transition-colors ${
                      selectedPlanet === index ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-white font-medium">{planet.name}</span>
                    {selectedPlanet === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-1"
                      >
                        <p className="text-white/60 leading-relaxed">{planet.description}</p>
                        <p className="text-primary/80 mt-1">{planet.fact}</p>
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
  );
}
