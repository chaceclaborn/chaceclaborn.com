'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Globe, Satellite, Info, Pause, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { leoSatellites, meoSatellites, geoSatellites, type SatelliteData } from '@/data/satellites';

// Dynamic import to avoid SSR issues with Three.js
const EarthView = dynamic(
  () => import('@/components/three/EarthView').then((mod) => mod.EarthView),
  { ssr: false, loading: () => <div className="h-full w-full bg-black flex items-center justify-center text-white">Loading Earth View...</div> }
);

// Count Starlink satellites
const starlinkSatellites = leoSatellites.filter(s => s.name.includes('Starlink'));

const orbitTypes = [
  { name: 'LEO', description: 'Low Earth Orbit', altitude: '160-2,000 km', color: '#00ff88', count: leoSatellites.length },
  { name: 'MEO', description: 'Medium Earth Orbit', altitude: '2,000-35,786 km', color: '#ffaa00', count: meoSatellites.length },
  { name: 'GEO', description: 'Geostationary Orbit', altitude: '35,786 km', color: '#ff4488', count: geoSatellites.length },
  { name: 'Starlink', description: 'SpaceX Starlink', altitude: '~550 km', color: '#00bfff', count: starlinkSatellites.length },
];

// Speed presets for visualization
const speedPresets = [
  { label: '1x', value: 1, description: 'Real-time' },
  { label: '60x', value: 60, description: '1 min = 1 hour' },
  { label: '360x', value: 360, description: '10 sec = 1 hour' },
  { label: '1440x', value: 1440, description: '1 min = 1 day' },
];

export default function EarthPage() {
  const [showOrbits, setShowOrbits] = useState(true);
  const [selectedOrbit, setSelectedOrbit] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null);

  // Get satellites for current filter
  const currentSatellites = selectedOrbit === 'LEO' ? leoSatellites
    : selectedOrbit === 'MEO' ? meoSatellites
    : selectedOrbit === 'GEO' ? geoSatellites
    : selectedOrbit === 'Starlink' ? starlinkSatellites
    : [...leoSatellites, ...meoSatellites, ...geoSatellites];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D Earth View */}
      <EarthView
        className="h-full w-full"
        showOrbits={showOrbits}
        selectedOrbit={selectedOrbit}
        speedMultiplier={speed}
        selectedSatellite={selectedSatellite}
        onSelectSatellite={setSelectedSatellite}
      />

      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 right-4 flex justify-between items-start z-10"
      >
        <Link href="/solar-system">
          <Button variant="secondary" size="sm" className="gap-2 bg-black/60 backdrop-blur-sm border-white/10 text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4" />
            Solar System
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowOrbits(!showOrbits)}
            className={`gap-2 backdrop-blur-sm border-white/10 text-white hover:bg-white/20 ${showOrbits ? 'bg-white/20' : 'bg-black/60'}`}
          >
            <Satellite className="h-4 w-4" />
            Orbits
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

      {/* Title - positioned to not cover Earth on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-16 md:top-20 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 text-right md:text-center z-10"
      >
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-1 flex items-center gap-2 justify-end md:justify-center">
          <Globe className="h-5 w-5 md:h-6 md:w-6" />
          Earth & Satellites
        </h1>
        <p className="text-white/50 text-xs md:text-sm hidden md:block">Click satellites to view details • {currentSatellites.length} satellites</p>
      </motion.div>

      {/* Speed Control - hidden on small mobile, shown on larger screens */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute right-4 top-32 md:left-4 md:right-auto md:top-1/2 md:-translate-y-1/2 z-10"
      >
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
          <div className="text-white/40 text-[10px] md:text-xs mb-1.5 md:mb-2 text-center">Speed</div>
          <div className="flex flex-row md:flex-col items-center gap-1">
            {speedPresets.map((preset) => (
              <Button
                key={preset.value}
                variant="ghost"
                size="sm"
                onClick={() => setSpeed(preset.value)}
                className={`text-[10px] md:text-xs h-6 md:h-7 px-2 md:px-3 md:w-full ${speed === preset.value ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="hidden md:block mt-2 pt-2 border-t border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSpeed(speed === 0 ? 1 : 0)}
              className="h-8 w-full text-white hover:bg-white/20"
            >
              {speed === 0 ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
          <div className="hidden md:block mt-2 text-[10px] text-white/30 text-center">
            {speed === 1 ? 'Real-time' : `${speed}x faster`}
          </div>
        </div>
      </motion.div>

      {/* Orbit Filter Buttons - scrollable on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-20 md:bottom-16 left-0 right-0 px-4 z-10"
      >
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 justify-start md:justify-center scrollbar-hide">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setSelectedOrbit(null); setSelectedSatellite(null); }}
            className={`backdrop-blur-sm border-white/10 text-white hover:bg-white/20 text-xs whitespace-nowrap flex-shrink-0 ${!selectedOrbit ? 'bg-white/25 ring-1 ring-white/40' : 'bg-black/60'}`}
          >
            All ({leoSatellites.length + meoSatellites.length + geoSatellites.length})
          </Button>
          {orbitTypes.map((orbit) => (
            <Button
              key={orbit.name}
              variant="secondary"
              size="sm"
              onClick={() => { setSelectedOrbit(selectedOrbit === orbit.name ? null : orbit.name); setSelectedSatellite(null); }}
              className="backdrop-blur-sm border-white/10 text-white hover:bg-white/20 bg-black/60 text-xs whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: selectedOrbit === orbit.name ? `${orbit.color}30` : undefined,
                borderColor: selectedOrbit === orbit.name ? orbit.color : undefined,
              }}
            >
              <span className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0" style={{ backgroundColor: orbit.color }} />
              {orbit.name} ({orbit.count})
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Satellite Details Panel - bottom sheet on mobile, side panel on desktop */}
      <AnimatePresence>
        {selectedSatellite && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute left-4 right-4 bottom-32 md:left-auto md:right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-auto md:w-72 z-20"
          >
            <Card className="bg-black/90 backdrop-blur-sm border-white/20">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-base md:text-lg">{selectedSatellite.name}</h3>
                    <p className="text-white/50 text-[10px] md:text-xs">{selectedSatellite.category}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSatellite(null)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X className="h-4 w-4 text-white/50" />
                  </button>
                </div>

                <p className="text-white/70 text-sm mb-4">{selectedSatellite.description}</p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">Operator</span>
                    <span className="text-white">{selectedSatellite.operator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Country</span>
                    <span className="text-white">{selectedSatellite.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Altitude</span>
                    <span className="text-white">{selectedSatellite.altitude.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Inclination</span>
                    <span className="text-white">{selectedSatellite.inclination}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Period</span>
                    <span className="text-white">{selectedSatellite.period} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Launch Date</span>
                    <span className="text-white">{selectedSatellite.launchDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">NORAD ID</span>
                    <span className="text-white font-mono">{selectedSatellite.noradId}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: `${orbitTypes.find(o => o.name === selectedSatellite.type)?.color}30` }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: orbitTypes.find(o => o.name === selectedSatellite.type)?.color }}
                    />
                    <span className="text-white">{selectedSatellite.type}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Satellite List Panel (when no satellite selected) - hidden on mobile */}
      {showInfo && !selectedSatellite && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 w-64 z-10"
        >
          <Card className="bg-black/60 backdrop-blur-sm border-white/10">
            <CardContent className="p-3">
              <h3 className="text-white font-medium mb-2 text-sm">Satellites ({currentSatellites.length})</h3>
              <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                {currentSatellites.map((sat) => (
                  <button
                    key={sat.noradId}
                    onClick={() => setSelectedSatellite(sat)}
                    className="w-full text-left p-2 rounded text-xs transition-all bg-white/5 hover:bg-white/15 flex items-center gap-2"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: orbitTypes.find(o => o.name === sat.type)?.color }}
                    />
                    <span className="text-white truncate">{sat.name}</span>
                    <span className="text-white/40 ml-auto shrink-0">{sat.altitude.toLocaleString()} km</span>
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
