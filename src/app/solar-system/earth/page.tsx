'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Satellite } from 'lucide-react';
import { calculatePosition, SATELLITE_CATEGORIES, getOrbitType, type TLEData, type TLESourceKey } from '@/lib/satellite-service';

const EarthView = dynamic(
  () => import('@/components/three/EarthView').then((mod) => mod.EarthView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
      </div>
    ),
  }
);

const categories: { key: TLESourceKey | null; label: string; color: string }[] = [
  { key: null, label: 'All', color: '#888888' },
  { key: 'stations', label: 'Stations', color: '#ff6b6b' },
  { key: 'starlink', label: 'Starlink', color: '#00bfff' },
  { key: 'gps-ops', label: 'GPS', color: '#f1c40f' },
  { key: 'geo', label: 'GEO', color: '#ff4488' },
  { key: 'weather', label: 'Weather', color: '#74b9ff' },
];

export default function EarthPage() {
  const [category, setCategory] = useState<TLESourceKey | null>(null);
  const [speed, setSpeed] = useState(1);
  const [satellite, setSatellite] = useState<TLEData | null>(null);
  const [position, setPosition] = useState<{ alt: number; vel: number; lat: number; lon: number } | null>(null);
  const [simulatedTime, setSimulatedTime] = useState(new Date());

  useEffect(() => {
    if (!satellite) { setPosition(null); return; }
    const update = () => {
      const pos = calculatePosition(satellite, simulatedTime);
      if (pos) setPosition({ alt: pos.altitude, vel: pos.velocity, lat: pos.latitude, lon: pos.longitude });
    };
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [satellite, simulatedTime]);

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Filter Bar - Between header and content */}
      <div className="shrink-0 bg-black/95 backdrop-blur border-b border-white/10 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Back + Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/solar-system"
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-1.5 flex-wrap">
              <Satellite className="h-3.5 w-3.5 text-white/50" />
              {categories.map((cat) => (
                <button
                  key={cat.key ?? 'all'}
                  onClick={() => setCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    category === cat.key
                      ? 'bg-white/20 text-white ring-1 ring-white/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Time + Speed */}
          <div className="flex items-center gap-2">
            {/* Clock - shows simulated time */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full ${speed === 1 ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
              <span className="text-white font-mono text-xs">{formatTime(simulatedTime)}</span>
              <span className="text-white/40 text-[10px] hidden sm:inline">{formatDate(simulatedTime)}</span>
              {speed > 1 && <span className="text-amber-400 text-[9px] font-medium">SIM</span>}
            </div>

            {/* Speed */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/5 border border-white/10">
              {[
                { label: '1×', value: 1 },
                { label: '60×', value: 60 },
                { label: '600×', value: 600 },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSpeed(s.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    speed === s.value
                      ? 'bg-blue-600 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3D Earth View - Fills remaining space */}
      <div className="flex-1 relative bg-black min-h-0">
        <div className="absolute inset-0">
          <EarthView
            className="w-full h-full"
            showOrbits={true}
            selectedCategory={category}
            speedMultiplier={speed}
            selectedSatellite={satellite}
            onSelectSatellite={setSatellite}
            onTimeUpdate={setSimulatedTime}
          />
        </div>

        {/* Satellite Info Panel */}
        <AnimatePresence>
          {satellite && position && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-4 z-20 w-[220px] bg-black/95 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-3 py-2.5 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{satellite.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {satellite.category && SATELLITE_CATEGORIES[satellite.category as keyof typeof SATELLITE_CATEGORIES] && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${SATELLITE_CATEGORIES[satellite.category as keyof typeof SATELLITE_CATEGORIES].color}25`,
                            color: SATELLITE_CATEGORIES[satellite.category as keyof typeof SATELLITE_CATEGORIES].color,
                          }}
                        >
                          {SATELLITE_CATEGORIES[satellite.category as keyof typeof SATELLITE_CATEGORIES].name}
                        </span>
                      )}
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-white/10 text-white/70">
                        {getOrbitType(position.alt)}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSatellite(null)} className="p-1 rounded-md hover:bg-white/10 transition-colors">
                    <X className="h-3.5 w-3.5 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Live Telemetry */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${speed === 1 ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                    <span className={`${speed === 1 ? 'text-green-400' : 'text-amber-400'} text-[9px] font-semibold uppercase tracking-wider`}>
                      {speed === 1 ? 'Live Telemetry' : 'Simulated'}
                    </span>
                  </div>
                  <span className="text-white/30 text-[8px] font-mono">{formatTime(simulatedTime)}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white/5 rounded px-2 py-1.5">
                    <span className="text-white/50 text-[10px]">Altitude</span>
                    <span className="text-white font-mono text-xs">{position.alt.toFixed(1)} <span className="text-white/40">km</span></span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 rounded px-2 py-1.5">
                    <span className="text-white/50 text-[10px]">Velocity</span>
                    <span className="text-white font-mono text-xs">{position.vel.toFixed(3)} <span className="text-white/40">km/s</span></span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 rounded px-2 py-1.5">
                    <span className="text-white/50 text-[10px]">Latitude</span>
                    <span className="text-white font-mono text-xs">{position.lat >= 0 ? '+' : ''}{position.lat.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 rounded px-2 py-1.5">
                    <span className="text-white/50 text-[10px]">Longitude</span>
                    <span className="text-white font-mono text-xs">{position.lon >= 0 ? '+' : ''}{position.lon.toFixed(4)}°</span>
                  </div>
                </div>

                {satellite.noradId && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between text-[10px]">
                    <span className="text-white/40">NORAD Catalog #</span>
                    <span className="text-white/80 font-mono">{satellite.noradId}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attribution */}
        <a
          href="https://celestrak.org"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-10 text-[10px] text-white/30 hover:text-white/50 transition-colors"
        >
          CelesTrak
        </a>
      </div>
    </div>
  );
}
