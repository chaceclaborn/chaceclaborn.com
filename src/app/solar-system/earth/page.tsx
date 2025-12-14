'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Satellite, Settings, Eye, Search } from 'lucide-react';
import { calculatePosition, SATELLITE_CATEGORIES, getOrbitType, getConstellation, CONSTELLATION_TYPE_NAMES, type TLEData, type TLESourceKey } from '@/lib/satellite-service';
import { SatelliteCreator } from '@/components/satellites/SatelliteCreator';

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

// Real satellite categories (excludes custom)
const categories: { key: TLESourceKey | null; label: string; color: string }[] = [
  { key: null, label: 'All', color: '#888888' },
  { key: 'stations', label: 'Stations', color: '#ff6b6b' },
  { key: 'starlink', label: 'Starlink', color: '#00bfff' },
  { key: 'oneweb', label: 'OneWeb', color: '#9b59b6' },
  { key: 'iridium-next', label: 'Iridium', color: '#1abc9c' },
  { key: 'gps-ops', label: 'GPS', color: '#f1c40f' },
  { key: 'glonass', label: 'GLONASS', color: '#e74c3c' },
  { key: 'galileo', label: 'Galileo', color: '#3498db' },
  { key: 'beidou', label: 'BeiDou', color: '#e67e22' },
  { key: 'geo', label: 'GEO', color: '#ff4488' },
  { key: 'weather', label: 'Weather', color: '#74b9ff' },
];

const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

// Clock display component that updates via ref without causing parent re-renders
function ClockDisplay({ timeRef, speed }: { timeRef: React.RefObject<Date | null>; speed: number }) {
  const [displayTime, setDisplayTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client mount
    setDisplayTime(timeRef.current || new Date());
    const interval = setInterval(() => {
      if (timeRef.current) {
        setDisplayTime(new Date(timeRef.current.getTime()));
      }
    }, 200);
    return () => clearInterval(interval);
  }, [timeRef]);

  // Don't render time until client-side
  if (!displayTime) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-white font-mono text-xs">--:--:--</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
      <div className={`w-1.5 h-1.5 rounded-full ${speed === 1 ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
      <span className="text-white font-mono text-xs">{formatTime(displayTime)}</span>
      <span className="text-white/40 text-[10px] hidden sm:inline">{formatDate(displayTime)}</span>
      {speed > 1 && <span className="text-amber-400 text-[9px] font-medium">SIM</span>}
    </div>
  );
}

// Small time display for telemetry panel
function TelemetryTime({ timeRef }: { timeRef: React.RefObject<Date | null> }) {
  const [displayTime, setDisplayTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client mount
    setDisplayTime(timeRef.current || new Date());
    const interval = setInterval(() => {
      if (timeRef.current) {
        setDisplayTime(new Date(timeRef.current.getTime()));
      }
    }, 200);
    return () => clearInterval(interval);
  }, [timeRef]);

  if (!displayTime) {
    return <span className="text-white/30 text-[8px] font-mono">--:--:--</span>;
  }

  return <span className="text-white/30 text-[8px] font-mono">{formatTime(displayTime)}</span>;
}

export default function EarthPage() {
  const [category, setCategory] = useState<TLESourceKey | 'custom' | null>(null);
  const [speed, setSpeed] = useState(1);
  const [satellite, setSatellite] = useState<TLEData | null>(null);
  const [position, setPosition] = useState<{ alt: number; vel: number; lat: number; lon: number } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [customSatellitesKey, setCustomSatellitesKey] = useState(0); // Trigger reload of custom satellites
  const [showCustomSatellites, setShowCustomSatellites] = useState(true); // Toggle visibility of custom satellites
  // Educational visualization toggles
  const [showOrbitalPlanes, setShowOrbitalPlanes] = useState(false);
  const [showEquatorialPlane, setShowEquatorialPlane] = useState(false);
  const [showInclinationGuides, setShowInclinationGuides] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false); // Dropdown visibility

  // Search functionality
  const [allSatellites, setAllSatellites] = useState<TLEData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Use ref for simulated time to avoid re-renders
  const simulatedTimeRef = useRef<Date | null>(new Date());

  // Callback that updates ref without causing re-render
  const handleTimeUpdate = useCallback((date: Date) => {
    simulatedTimeRef.current = date;
  }, []);

  // Reset to live time
  const handleGoLive = useCallback(() => {
    setResetKey(k => k + 1);
    setSpeed(1);
    setIsLive(true);
  }, []);

  // Handle satellites loaded from EarthView
  const handleSatellitesLoaded = useCallback((satellites: TLEData[]) => {
    setAllSatellites(satellites);
  }, []);

  // Filter satellites based on search query
  const searchResults = searchQuery.trim()
    ? allSatellites.filter(sat =>
        sat.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 50) // Limit to 50 results for performance
    : [];

  // Track when we go non-live
  useEffect(() => {
    if (speed !== 1) {
      setIsLive(false);
    }
  }, [speed]);

  // Close view options dropdown when clicking outside
  useEffect(() => {
    if (!showViewOptions) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-view-dropdown]')) {
        setShowViewOptions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showViewOptions]);

  // Update satellite position based on ref (separate from render cycle)
  useEffect(() => {
    if (!satellite) { setPosition(null); return; }
    const update = () => {
      const time = simulatedTimeRef.current || new Date();
      const pos = calculatePosition(satellite, time);
      if (pos) setPosition({ alt: pos.altitude, vel: pos.velocity, lat: pos.latitude, lon: pos.longitude });
    };
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [satellite]);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Filter Bar - Between header and content */}
      <div className="shrink-0 bg-black/95 backdrop-blur border-b border-white/10 px-4 py-2 overflow-visible relative z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 overflow-visible">
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

              {/* Divider */}
              <div className="h-5 w-px bg-white/10 mx-1" />

              {/* My Satellites Filter - same style as other category filters */}
              <button
                onClick={() => {
                  if (category === 'custom') {
                    setCategory(null); // Go back to all
                  } else {
                    setCategory('custom'); // Show only custom
                    setShowCustomSatellites(true); // Make sure they're visible
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  category === 'custom'
                    ? 'bg-white/20 text-white ring-1 ring-white/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                My Sats
              </button>

              {/* Manage Button */}
              <button
                onClick={() => setShowCreator(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border border-emerald-500/30 text-emerald-400 hover:from-emerald-600/30 hover:to-blue-600/30 hover:text-emerald-300 transition-all"
              >
                <Settings className="h-3 w-3" />
                Manage
              </button>

              {/* Search Button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  showSearch
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Search className="h-3 w-3" />
                Search
              </button>
            </div>
          </div>

          {/* Right: Time + Speed */}
          <div className="flex items-center gap-2 overflow-visible">
            {/* Clock - shows simulated time (isolated component to prevent re-renders) */}
            <ClockDisplay timeRef={simulatedTimeRef} speed={speed} />

            {/* LIVE button */}
            <button
              onClick={handleGoLive}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                isLive
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600/80 text-white hover:bg-red-600 animate-pulse'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-300' : 'bg-red-300'}`} />
              LIVE
            </button>

            {/* View Options Dropdown */}
            <div className="relative" data-view-dropdown>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewOptions(!showViewOptions);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  showOrbitalPlanes || showEquatorialPlane || showInclinationGuides
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </button>

              <AnimatePresence>
                {showViewOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 sm:right-0 top-full mt-2 w-[280px] sm:w-64 bg-black/98 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-[100]"
                    style={{ maxHeight: 'calc(100vh - 120px)' }}
                  >
                    <div className="p-2 space-y-0.5">
                      {/* Equatorial Plane */}
                      <button
                        onClick={() => setShowEquatorialPlane(!showEquatorialPlane)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all ${
                          showEquatorialPlane
                            ? 'bg-white/10 text-white'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-sm border transition-colors ${showEquatorialPlane ? 'bg-white border-white' : 'border-white/30'}`} />
                        <span>Equatorial Plane</span>
                      </button>

                      {/* Inclination Guides */}
                      <button
                        onClick={() => setShowInclinationGuides(!showInclinationGuides)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all ${
                          showInclinationGuides
                            ? 'bg-white/10 text-white'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-sm border transition-colors ${showInclinationGuides ? 'bg-white border-white' : 'border-white/30'}`} />
                        <span>Inclination Guides</span>
                      </button>

                      {/* Constellation Orbital Planes */}
                      <button
                        onClick={() => setShowOrbitalPlanes(!showOrbitalPlanes)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all ${
                          showOrbitalPlanes
                            ? 'bg-white/10 text-white'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-sm border transition-colors ${showOrbitalPlanes ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'}`} />
                        <span>Constellation Planes</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
            onTimeUpdate={handleTimeUpdate}
            resetToLive={resetKey}
            customSatellitesKey={customSatellitesKey}
            showCustomSatellites={showCustomSatellites}
            showOrbitalPlanes={showOrbitalPlanes}
            showEquatorialPlane={showEquatorialPlane}
            showInclinationGuides={showInclinationGuides}
            onSatellitesLoaded={handleSatellitesLoaded}
          />
        </div>

        {/* Search Panel */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-4 left-4 z-20 w-[280px] bg-black/95 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden"
            >
              {/* Search Header */}
              <div className="px-3 py-2.5 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-semibold text-sm">Search Satellites</span>
                  </div>
                  <button onClick={() => setShowSearch(false)} className="p-1 rounded-md hover:bg-white/10 transition-colors">
                    <X className="h-3.5 w-3.5 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Search Input */}
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                    autoFocus
                  />
                </div>
                <div className="mt-2 text-[10px] text-white/40">
                  {allSatellites.length.toLocaleString()} satellites loaded
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {searchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    <div className="p-1">
                      {searchResults.map((sat, index) => {
                        const catInfo = sat.category ? SATELLITE_CATEGORIES[sat.category as keyof typeof SATELLITE_CATEGORIES] : null;
                        return (
                          <button
                            key={sat.noradId || `${sat.name}-${index}`}
                            onClick={() => {
                              setSatellite(sat);
                              setSearchQuery('');
                              setShowSearch(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:bg-white/10 ${
                              satellite?.name === sat.name ? 'bg-blue-600/20 border border-blue-500/30' : ''
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: catInfo?.color || '#888' }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-xs font-medium truncate">{sat.name}</div>
                              {catInfo && (
                                <div className="text-[9px] text-white/40">{catInfo.name}</div>
                              )}
                            </div>
                            {sat.noradId && (
                              <span className="text-[9px] text-white/30 font-mono">#{sat.noradId}</span>
                            )}
                          </button>
                        );
                      })}
                      {searchResults.length === 50 && (
                        <div className="text-center text-[10px] text-white/40 py-2">
                          Showing first 50 results...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-white/40 text-sm">
                      No satellites found
                    </div>
                  )
                ) : (
                  <div className="p-6 text-center text-white/40 text-sm">
                    Type to search...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

              {/* Constellation Info */}
              {(() => {
                const constellation = getConstellation(satellite.name);
                if (!constellation) return null;
                return (
                  <div className="px-3 py-2.5 border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
                    {/* Constellation Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-semibold"
                        style={{ backgroundColor: `${constellation.color}30`, color: constellation.color }}
                      >
                        {constellation.name}
                      </span>
                      <span
                        className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-medium"
                      >
                        {CONSTELLATION_TYPE_NAMES[constellation.constellationType]}
                      </span>
                    </div>

                    {/* Purpose & Operator */}
                    <div className="text-[9px] text-white/50 mb-2">{constellation.purpose}</div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
                      <span className="text-white/40">Operator</span>
                      <span className="text-white/70 truncate">{constellation.operator}</span>

                      {/* Walker notation with explanation */}
                      {constellation.walker && (
                        <>
                          <span className="text-white/40">Constellation</span>
                          <span className="text-cyan-400 font-mono text-[8px]">{constellation.walker}</span>
                        </>
                      )}
                      {constellation.walkerExplained && (
                        <>
                          <span className="text-white/40"></span>
                          <span className="text-white/50 text-[8px]">{constellation.walkerExplained}</span>
                        </>
                      )}

                      {constellation.altitude && (
                        <>
                          <span className="text-white/40">Design Alt</span>
                          <span className="text-white/70">{constellation.altitude}</span>
                        </>
                      )}

                      {constellation.totalSatellites && constellation.totalSatellites > 1 && (
                        <>
                          <span className="text-white/40">Fleet Size</span>
                          <span className="text-white/70">{constellation.totalSatellites.toLocaleString()} sats</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Live Telemetry */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${speed === 1 ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                    <span className={`${speed === 1 ? 'text-green-400' : 'text-amber-400'} text-[9px] font-semibold uppercase tracking-wider`}>
                      {speed === 1 ? 'Live Telemetry' : 'Simulated'}
                    </span>
                  </div>
                  <TelemetryTime timeRef={simulatedTimeRef} />
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

        {/* Inclination Legend - shows when guides are enabled */}
        <AnimatePresence>
          {showInclinationGuides && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10"
            >
              <div className="text-[9px] text-white/40 mb-1.5 font-medium">Inclination</div>
              <div className="space-y-1">
                {[
                  { angle: '0°', label: 'Equatorial', color: '#ffd700' },
                  { angle: '51.6°', label: 'ISS', color: '#00ff88' },
                  { angle: '55°', label: 'GPS', color: '#00bfff' },
                  { angle: '90°', label: 'Polar', color: '#bf5fff' },
                ].map(({ angle, label, color }) => (
                  <div key={angle} className="flex items-center gap-2 text-[9px]">
                    <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-white/50 w-7">{angle}</span>
                    <span className="text-white/30">{label}</span>
                  </div>
                ))}
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

      {/* Satellite Creator Modal */}
      <SatelliteCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onSatellitesChange={() => setCustomSatellitesKey(k => k + 1)}
      />
    </div>
  );
}
