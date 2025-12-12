'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Rocket,
  Globe2,
  Trash2,
  ChevronDown,
  Sparkles,
  Settings,
  Info,
  Orbit,
} from 'lucide-react';
import {
  loadCustomSatellites,
  loadCustomConstellations,
  addCustomSatellite,
  addCustomConstellation,
  deleteCustomSatellite,
  deleteCustomConstellation,
  calculateOrbitalPeriod,
  calculateOrbitalVelocity,
  getWalkerNotation,
  getWalkerExplanation,
  ORBITAL_PRESETS,
  CONSTELLATION_PRESETS,
  type CustomSatellite,
  type CustomConstellation,
} from '@/lib/custom-satellites';

interface SatelliteCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSatellitesChange: () => void;
}

type Tab = 'satellite' | 'constellation' | 'manage';
type ConstellationType = 'walker-delta' | 'walker-star';

const COLORS = [
  { value: '#00ff88', name: 'Green' },
  { value: '#00bfff', name: 'Blue' },
  { value: '#ff6b6b', name: 'Red' },
  { value: '#f1c40f', name: 'Gold' },
  { value: '#9b59b6', name: 'Purple' },
  { value: '#1abc9c', name: 'Teal' },
  { value: '#e74c3c', name: 'Crimson' },
  { value: '#3498db', name: 'Sky' },
  { value: '#e67e22', name: 'Orange' },
  { value: '#ff4488', name: 'Pink' },
];

export function SatelliteCreator({ isOpen, onClose, onSatellitesChange }: SatelliteCreatorProps) {
  const [tab, setTab] = useState<Tab>('satellite');
  const [customSatellites, setCustomSatellites] = useState<CustomSatellite[]>([]);
  const [customConstellations, setCustomConstellations] = useState<CustomConstellation[]>([]);

  // Single satellite form
  const [satName, setSatName] = useState('My Satellite');
  const [satAltitude, setSatAltitude] = useState(550);
  const [satInclination, setSatInclination] = useState(53);
  const [satEccentricity, setSatEccentricity] = useState(0.0001);
  const [satRaan, setSatRaan] = useState(0);
  const [satArgPerigee, setSatArgPerigee] = useState(0);
  const [satMeanAnomaly, setSatMeanAnomaly] = useState(0);
  const [satColor, setSatColor] = useState('#00ff88');

  // Constellation form
  const [constName, setConstName] = useState('My Constellation');
  const [constDescription, setConstDescription] = useState('Custom satellite constellation');
  const [constType, setConstType] = useState<ConstellationType>('walker-delta');
  const [constAltitude, setConstAltitude] = useState(550);
  const [constInclination, setConstInclination] = useState(53);
  const [constTotalSats, setConstTotalSats] = useState(24);
  const [constPlanes, setConstPlanes] = useState(6);
  const [constPhasing, setConstPhasing] = useState(1);
  const [constColor, setConstColor] = useState('#00bfff');

  // Load existing custom satellites and constellations
  useEffect(() => {
    if (isOpen) {
      setCustomSatellites(loadCustomSatellites());
      setCustomConstellations(loadCustomConstellations());
    }
  }, [isOpen]);

  const handleCreateSatellite = () => {
    addCustomSatellite({
      name: satName,
      altitude: satAltitude,
      inclination: satInclination,
      eccentricity: satEccentricity,
      raan: satRaan,
      argumentOfPerigee: satArgPerigee,
      meanAnomaly: satMeanAnomaly,
      color: satColor,
      size: 3,
    });

    setCustomSatellites(loadCustomSatellites());
    onSatellitesChange();

    // Reset form with new name
    setSatName(`My Satellite ${loadCustomSatellites().length + 1}`);
  };

  const handleCreateConstellation = () => {
    addCustomConstellation({
      name: constName,
      description: constDescription,
      constellationType: constType,
      altitude: constAltitude,
      inclination: constInclination,
      totalSatellites: constTotalSats,
      planes: constPlanes,
      phasingFactor: constPhasing,
      color: constColor,
    });

    setCustomSatellites(loadCustomSatellites());
    setCustomConstellations(loadCustomConstellations());
    onSatellitesChange();

    // Reset form
    setConstName(`Constellation ${loadCustomConstellations().length + 1}`);
  };

  const handleDeleteSatellite = (id: string) => {
    deleteCustomSatellite(id);
    setCustomSatellites(loadCustomSatellites());
    onSatellitesChange();
  };

  const handleDeleteConstellation = (id: string) => {
    deleteCustomConstellation(id);
    setCustomSatellites(loadCustomSatellites());
    setCustomConstellations(loadCustomConstellations());
    onSatellitesChange();
  };

  const applyOrbitalPreset = (presetKey: string) => {
    const preset = ORBITAL_PRESETS[presetKey as keyof typeof ORBITAL_PRESETS];
    if (preset) {
      setSatAltitude(preset.altitude);
      setSatInclination(preset.inclination);
    }
  };

  const applyConstellationPreset = (presetKey: string) => {
    const preset = CONSTELLATION_PRESETS[presetKey as keyof typeof CONSTELLATION_PRESETS];
    if (preset) {
      setConstName(preset.name);
      setConstDescription(preset.description);
      setConstType(preset.constellationType);
      setConstAltitude(preset.altitude);
      setConstInclination(preset.inclination);
      setConstTotalSats(preset.totalSatellites);
      setConstPlanes(preset.planes);
      setConstPhasing(preset.phasingFactor);
    }
  };

  // Calculate orbital parameters
  const orbitalPeriod = calculateOrbitalPeriod(satAltitude);
  const orbitalVelocity = calculateOrbitalVelocity(satAltitude);
  const constOrbitalPeriod = calculateOrbitalPeriod(constAltitude);
  const constVelocity = calculateOrbitalVelocity(constAltitude);

  // Get orbit type
  const getOrbitTypeName = (alt: number) => {
    if (alt < 2000) return 'LEO';
    if (alt < 35000) return 'MEO';
    if (alt < 36000) return 'GEO';
    return 'HEO';
  };

  // Count standalone satellites (not in constellations)
  const standaloneSatellites = customSatellites.filter(s => !s.constellationId);

  // Walker calculations for preview
  const raanSpread = constType === 'walker-star' ? 180 : 360;
  const raanSpacing = raanSpread / constPlanes;
  const satsPerPlane = Math.floor(constTotalSats / constPlanes);
  const phasingAngle = (constPhasing * 360) / constTotalSats;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-purple-600/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 border border-white/10">
                  <Rocket className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Satellite Designer</h2>
                  <p className="text-white/50 text-sm">Create custom satellites & constellations</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-white/60" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-5">
              {[
                { id: 'satellite' as Tab, label: 'Single Satellite', icon: Sparkles },
                { id: 'constellation' as Tab, label: 'Constellation', icon: Globe2 },
                { id: 'manage' as Tab, label: `Manage (${customSatellites.length})`, icon: Settings },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Single Satellite Tab */}
            {tab === 'satellite' && (
              <div className="space-y-6">
                {/* Presets */}
                <div>
                  <label className="text-white/70 text-xs font-medium mb-3 block flex items-center gap-2">
                    <Info className="h-3.5 w-3.5" />
                    Orbital Presets (Based on Real Satellites)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(ORBITAL_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        onClick={() => applyOrbitalPreset(key)}
                        className="px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all text-left"
                      >
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{preset.altitude.toLocaleString()} km</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-white/70 text-xs font-medium mb-2 block">Satellite Name</label>
                  <input
                    type="text"
                    value={satName}
                    onChange={e => setSatName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                </div>

                {/* Altitude & Inclination */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-xs font-medium mb-2 block">
                      Altitude: <span className="text-emerald-400">{satAltitude.toLocaleString()} km</span>
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="40000"
                      step="10"
                      value={satAltitude}
                      onChange={e => setSatAltitude(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-white/30 mt-1">
                      <span>200 km (LEO)</span>
                      <span>40,000 km (HEO)</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs font-medium mb-2 block">
                      Inclination: <span className="text-emerald-400">{satInclination.toFixed(1)}°</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="0.1"
                      value={satInclination}
                      onChange={e => setSatInclination(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-white/30 mt-1">
                      <span>0° (Equatorial)</span>
                      <span>90° (Polar)</span>
                    </div>
                  </div>
                </div>

                {/* Advanced Parameters */}
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-white/60 text-xs font-medium hover:text-white/80 transition-colors">
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
                    Advanced Orbital Parameters
                  </summary>
                  <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <label className="text-white/50 text-[10px] mb-1 block">
                        RAAN (Ω): <span className="text-blue-400">{satRaan.toFixed(1)}°</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={satRaan}
                        onChange={e => setSatRaan(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1 block">
                        Mean Anomaly (M): <span className="text-blue-400">{satMeanAnomaly.toFixed(1)}°</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={satMeanAnomaly}
                        onChange={e => setSatMeanAnomaly(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1 block">
                        Arg. of Perigee (ω): <span className="text-blue-400">{satArgPerigee.toFixed(1)}°</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={satArgPerigee}
                        onChange={e => setSatArgPerigee(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1 block">
                        Eccentricity (e): <span className="text-blue-400">{satEccentricity.toFixed(4)}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.001"
                        value={satEccentricity}
                        onChange={e => setSatEccentricity(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                </details>

                {/* Color */}
                <div>
                  <label className="text-white/70 text-xs font-medium mb-3 block">Display Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setSatColor(c.value)}
                        title={c.name}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          satColor === c.value
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Orbital Info Preview */}
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10">
                  <div className="text-white/60 text-xs font-medium mb-3 flex items-center gap-2">
                    <Orbit className="h-4 w-4" />
                    Calculated Orbital Parameters
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-white/40 text-[10px] block">Orbit Type</span>
                      <span className="text-white font-medium">{getOrbitTypeName(satAltitude)}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-white/40 text-[10px] block">Orbital Period</span>
                      <span className="text-white font-mono">{orbitalPeriod.toFixed(1)} min</span>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-white/40 text-[10px] block">Velocity</span>
                      <span className="text-white font-mono">{orbitalVelocity.toFixed(2)} km/s</span>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-white/40 text-[10px] block">Orbits per Day</span>
                      <span className="text-white font-mono">{(1440 / orbitalPeriod).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateSatellite}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="h-5 w-5" />
                  Create Satellite
                </button>
              </div>
            )}

            {/* Constellation Tab */}
            {tab === 'constellation' && (
              <div className="space-y-6">
                {/* Walker Type Selection */}
                <div>
                  <label className="text-white/70 text-xs font-medium mb-3 block flex items-center gap-2">
                    <Globe2 className="h-3.5 w-3.5" />
                    Walker Pattern Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setConstType('walker-delta')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        constType === 'walker-delta'
                          ? 'bg-blue-600/20 border-blue-500/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-semibold text-sm">Walker Delta (Δ)</div>
                      <div className="text-[10px] mt-1 opacity-70">360° RAAN spread</div>
                      <div className="text-[9px] mt-2 opacity-50">GPS, Galileo, Starlink</div>
                    </button>
                    <button
                      onClick={() => setConstType('walker-star')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        constType === 'walker-star'
                          ? 'bg-purple-600/20 border-purple-500/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-semibold text-sm">Walker Star (★)</div>
                      <div className="text-[10px] mt-1 opacity-70">180° RAAN spread</div>
                      <div className="text-[9px] mt-2 opacity-50">Iridium, Globalstar</div>
                    </button>
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <label className="text-white/70 text-xs font-medium mb-3 block">
                    Constellation Presets (Based on Real Constellations)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(CONSTELLATION_PRESETS)
                      .filter(([, preset]) => preset.constellationType === constType)
                      .map(([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => applyConstellationPreset(key)}
                          className="px-3 py-2.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all text-left"
                        >
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-[10px] text-white/40 mt-0.5">
                            {preset.inclination}°:{preset.totalSatellites}/{preset.planes}/{preset.phasingFactor}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Name & Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-xs font-medium mb-2 block">Name</label>
                    <input
                      type="text"
                      value={constName}
                      onChange={e => setConstName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-xs font-medium mb-2 block">Description</label>
                    <input
                      type="text"
                      value={constDescription}
                      onChange={e => setConstDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    />
                  </div>
                </div>

                {/* Walker Parameters */}
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10">
                  <div className="text-white/70 text-xs font-semibold mb-4 flex items-center justify-between">
                    <span>Walker Parameters (i:T/P/F)</span>
                    <span className={`font-mono px-2 py-1 rounded text-[10px] ${
                      constType === 'walker-star' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {constInclination}°:{constTotalSats}/{constPlanes}/{constPhasing}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-white/50 text-[10px] mb-1 block">Total Sats (T)</label>
                      <input
                        type="number"
                        min="2"
                        max="500"
                        value={constTotalSats}
                        onChange={e => setConstTotalSats(Math.max(2, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-center focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1 block">Planes (P)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={constPlanes}
                        onChange={e => setConstPlanes(Math.max(1, Math.min(constTotalSats, Number(e.target.value))))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-center focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1 block">Phasing (F)</label>
                      <input
                        type="number"
                        min="0"
                        max={constPlanes - 1}
                        value={constPhasing}
                        onChange={e => setConstPhasing(Math.max(0, Math.min(constPlanes - 1, Number(e.target.value))))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-center focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1 block">Incl. (i)</label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        step="0.1"
                        value={constInclination}
                        onChange={e => setConstInclination(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-center focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  {/* Calculated Values */}
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-[11px]">
                    <div className="text-center">
                      <span className="text-white/40 block">Sats/Plane</span>
                      <span className="text-white font-mono">{satsPerPlane}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-white/40 block">RAAN Spacing</span>
                      <span className="text-white font-mono">{raanSpacing.toFixed(1)}°</span>
                    </div>
                    <div className="text-center">
                      <span className="text-white/40 block">Phase Offset</span>
                      <span className="text-white font-mono">{phasingAngle.toFixed(1)}°</span>
                    </div>
                  </div>
                </div>

                {/* Altitude */}
                <div>
                  <label className="text-white/70 text-xs font-medium mb-2 block">
                    Orbital Altitude: <span className="text-blue-400">{constAltitude.toLocaleString()} km</span>
                    <span className="text-white/40 ml-2">({getOrbitTypeName(constAltitude)})</span>
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="40000"
                    step="10"
                    value={constAltitude}
                    onChange={e => setConstAltitude(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="text-white/70 text-xs font-medium mb-3 block">Constellation Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setConstColor(c.value)}
                        title={c.name}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          constColor === c.value
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Info Preview */}
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10">
                  <div className="text-white/60 text-xs font-medium mb-3 flex items-center gap-2">
                    <Orbit className="h-4 w-4" />
                    Constellation Preview
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-white/40 text-[10px] block">Orbital Period</span>
                      <span className="text-white font-mono">{constOrbitalPeriod.toFixed(1)} min</span>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-white/40 text-[10px] block">Velocity</span>
                      <span className="text-white font-mono">{constVelocity.toFixed(2)} km/s</span>
                    </div>
                    <div className="col-span-2 bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-white/40 text-[10px] block">Pattern Description</span>
                      <span className="text-white text-xs">
                        {constPlanes} orbital planes, {satsPerPlane} satellites each, {raanSpacing.toFixed(0)}° RAAN spacing
                      </span>
                    </div>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateConstellation}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Globe2 className="h-5 w-5" />
                  Create Constellation ({constTotalSats} satellites)
                </button>
              </div>
            )}

            {/* Manage Tab */}
            {tab === 'manage' && (
              <div className="space-y-6">
                {customConstellations.length === 0 && standaloneSatellites.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    <Rocket className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No custom satellites yet</p>
                    <p className="text-sm mt-2">Create your first satellite or constellation!</p>
                  </div>
                ) : (
                  <>
                    {/* Constellations */}
                    {customConstellations.length > 0 && (
                      <div>
                        <h3 className="text-white/70 text-sm font-semibold mb-3 flex items-center gap-2">
                          <Globe2 className="h-4 w-4" />
                          Constellations ({customConstellations.length})
                        </h3>
                        <div className="space-y-2">
                          {customConstellations.map(c => (
                            <div
                              key={c.id}
                              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.07] transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-4 h-4 rounded-full ring-2 ring-white/20"
                                  style={{ backgroundColor: c.color }}
                                />
                                <div>
                                  <div className="text-white font-medium">{c.name}</div>
                                  <div className="text-white/40 text-xs mt-0.5 flex items-center gap-3">
                                    <span>{c.satellites.length} satellites</span>
                                    <span className={`font-mono ${
                                      c.constellationType === 'walker-star' ? 'text-purple-400' : 'text-blue-400'
                                    }`}>
                                      {getWalkerNotation(c)}
                                    </span>
                                  </div>
                                  <div className="text-white/30 text-[10px] mt-1">
                                    {getWalkerExplanation(c)}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteConstellation(c.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Standalone Satellites */}
                    {standaloneSatellites.length > 0 && (
                      <div>
                        <h3 className="text-white/70 text-sm font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Individual Satellites ({standaloneSatellites.length})
                        </h3>
                        <div className="space-y-2">
                          {standaloneSatellites.map(s => (
                            <div
                              key={s.id}
                              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.07] transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-4 h-4 rounded-full ring-2 ring-white/20"
                                  style={{ backgroundColor: s.color }}
                                />
                                <div>
                                  <div className="text-white font-medium">{s.name}</div>
                                  <div className="text-white/40 text-xs mt-0.5">
                                    {s.altitude.toLocaleString()} km • {s.inclination.toFixed(1)}° • {getOrbitTypeName(s.altitude)}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteSatellite(s.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer with sources */}
          <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02]">
            <div className="text-[10px] text-white/30 flex items-center gap-4">
              <span>Sources:</span>
              <a href="https://celestrak.org/NORAD/documentation/tle-fmt.php" target="_blank" rel="noopener noreferrer" className="hover:text-white/50">CelesTrak TLE Format</a>
              <a href="https://en.wikipedia.org/wiki/Satellite_constellation" target="_blank" rel="noopener noreferrer" className="hover:text-white/50">Walker Patterns</a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
