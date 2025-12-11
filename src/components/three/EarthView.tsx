'use client';

import React, { useRef, useMemo, useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  calculatePosition,
  getOrbitType,
  FALLBACK_TLE,
  SATELLITE_CATEGORIES,
  type SatellitePosition,
  type TLEData,
  type TLESourceKey,
} from '@/lib/satellite-service';

// ============================================
// CONSTANTS
// ============================================

export const orbitColors = {
  LEO: '#00ff88',
  MEO: '#ffaa00',
  GEO: '#ff4488',
  HEO: '#9b59b6',
};

// No hard limit - we use instanced rendering so we can handle thousands
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _MAX_SATELLITES = 10000;

// Scale altitudes for visualization
function scaleAltitude(altitudeKm: number): number {
  if (altitudeKm < 2000) return 0.08 + (altitudeKm / 2000) * 0.12;
  if (altitudeKm < 25000) return 0.22 + ((altitudeKm - 2000) / 23000) * 0.28;
  return 0.55 + ((altitudeKm - 25000) / 15000) * 0.45;
}

// Earth rotation (GMST)
function getEarthRotation(date: Date = new Date()): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  gmst = ((gmst % 360) + 360) % 360;
  return (gmst * Math.PI) / 180;
}

// ============================================
// INSTANCED SATELLITES - Much more efficient!
// ============================================

interface InstancedSatellitesProps {
  satellites: TLEData[];
  initialDate: Date;
  speedMultiplier: number;
  onSelect: (tle: TLEData | null) => void;
  selectedSatellite: TLEData | null;
  onTimeUpdate?: (date: Date) => void;
}

// Satellite state for smooth animation
interface SatelliteState {
  // Current position (continuously updated)
  x: number;
  y: number;
  z: number;
  // Velocity per millisecond of REAL time
  vx: number;
  vy: number;
  vz: number;
  // Static properties
  altitude: number;
  velocity: number;
  latitude: number;
  longitude: number;
  name: string;
  noradId?: number;
  category?: string;
}

function InstancedSatellites({ satellites, initialDate, speedMultiplier, onSelect, selectedSatellite, onTimeUpdate }: InstancedSatellitesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const statesRef = useRef<Map<number, SatelliteState>>(new Map());
  const positionsRef = useRef<Map<number, SatellitePosition>>(new Map());
  const prevSatellitesLengthRef = useRef<number>(0);

  // Animation state - internal clock is authoritative, never reset by parent
  const animRef = useRef({
    lastFrameTime: performance.now(),
    lastCalcTime: 0,
    currentSimTime: initialDate.getTime(),
    currentSpeed: speedMultiplier,
    initialized: false,
  });

  const { gl } = useThree();

  // Initialize once on mount
  useEffect(() => {
    if (!animRef.current.initialized) {
      animRef.current.currentSimTime = initialDate.getTime();
      animRef.current.initialized = true;
    }
  }, [initialDate]);

  // Only update speed, never reset time from parent
  useEffect(() => {
    animRef.current.currentSpeed = speedMultiplier;
  }, [speedMultiplier]);

  // Report time to parent via separate interval (NOT from useFrame!)
  // This prevents React state updates from interrupting the render loop
  useEffect(() => {
    const interval = setInterval(() => {
      onTimeUpdate?.(new Date(animRef.current.currentSimTime));
    }, 200); // Update UI clock 5 times per second
    return () => clearInterval(interval);
  }, [onTimeUpdate]);

  // Clear states when satellites array changes (e.g., category filter)
  useEffect(() => {
    if (satellites.length !== prevSatellitesLengthRef.current) {
      statesRef.current.clear();
      positionsRef.current.clear();
      animRef.current.lastCalcTime = 0; // Force immediate recalculation
      prevSatellitesLengthRef.current = satellites.length;
    }
  }, [satellites]);

  // Update cursor when hovering
  useEffect(() => {
    const cursor = hovered !== null ? 'pointer' : 'grab';
    gl.domElement.style.cursor = cursor;
  }, [hovered, gl.domElement]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    if (!meshRef.current) return;

    const anim = animRef.current;
    const now = performance.now();
    const realDeltaTime = Math.min(now - anim.lastFrameTime, 100);
    anim.lastFrameTime = now;

    const simDeltaTime = realDeltaTime * anim.currentSpeed;
    anim.currentSimTime += simDeltaTime;

    // At high speeds, calculate SGP4 positions EVERY FRAME for accuracy
    // This is the only way to get smooth orbital motion without snapping
    const currentDate = new Date(anim.currentSimTime);

    // Update ALL satellites every frame using direct SGP4 calculation
    for (let index = 0; index < satellites.length; index++) {
      const tle = satellites[index];
      const pos = calculatePosition(tle, currentDate);

      if (!pos) {
        // Failed calculation - hide satellite
        if (!statesRef.current.has(index)) {
          statesRef.current.set(index, {
            x: 0, y: 0, z: 0,
            vx: 0, vy: 0, vz: 0,
            altitude: 0,
            velocity: 0,
            latitude: 0,
            longitude: 0,
            name: tle.name,
            noradId: tle.noradId,
            category: tle.category,
          });
        }
        dummy.position.set(0, 0, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(index, dummy.matrix);
        continue;
      }

      // Update state with current SGP4 position
      let state = statesRef.current.get(index);
      if (!state) {
        state = {
          x: pos.x, y: pos.y, z: pos.z,
          vx: 0, vy: 0, vz: 0,
          altitude: pos.altitude,
          velocity: pos.velocity,
          latitude: pos.latitude,
          longitude: pos.longitude,
          name: pos.name,
          noradId: pos.noradId,
          category: pos.category,
        };
        statesRef.current.set(index, state);
      } else {
        state.x = pos.x;
        state.y = pos.y;
        state.z = pos.z;
        state.altitude = pos.altitude;
        state.velocity = pos.velocity;
        state.latitude = pos.latitude;
        state.longitude = pos.longitude;
      }

      // Store for tooltips
      positionsRef.current.set(index, {
        x: state.x, y: state.y, z: state.z,
        altitude: state.altitude,
        velocity: state.velocity,
        latitude: state.latitude,
        longitude: state.longitude,
        name: state.name,
        noradId: state.noradId,
        category: state.category,
      });

      const scale = 1 + scaleAltitude(state.altitude);
      const r = Math.sqrt(state.x ** 2 + state.y ** 2 + state.z ** 2);

      if (r > 0) {
        dummy.position.set(
          (state.x / r) * scale,
          (state.y / r) * scale,
          (state.z / r) * scale
        );

        const isStation = tle?.category === 'stations';
        const isSelected = selectedSatellite?.name === tle?.name;
        const isHovered = hovered === index;
        const baseSize = satellites.length > 3000 ? 0.008 : satellites.length > 1000 ? 0.01 : 0.015;
        const size = isStation ? baseSize * 2.5 : baseSize;

        dummy.scale.setScalar(isSelected || isHovered ? size * 1.5 : size);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(index, dummy.matrix);

        const orbitType = getOrbitType(state.altitude);
        const categoryColor = SATELLITE_CATEGORIES[tle?.category as keyof typeof SATELLITE_CATEGORIES]?.color;
        color.set(isSelected ? '#ffffff' : isHovered ? '#ffffff' : categoryColor || orbitColors[orbitType]);
        meshRef.current!.setColorAt(index, color);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const handlePointerMove = useCallback((e: { stopPropagation: () => void; instanceId?: number }) => {
    e.stopPropagation();
    setHovered(e.instanceId ?? null);
  }, []);

  const handlePointerOut = useCallback(() => setHovered(null), []);

  const handleClick = useCallback((e: { stopPropagation: () => void; instanceId?: number }) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && satellites[e.instanceId]) {
      const sat = satellites[e.instanceId];
      onSelect(selectedSatellite?.name === sat.name ? null : sat);
    }
  }, [satellites, selectedSatellite, onSelect]);

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, satellites.length]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial transparent opacity={0.9} />
      </instancedMesh>

      {/* Tooltip for hovered satellite */}
      {hovered !== null && positionsRef.current.get(hovered) && satellites[hovered] && (
        <Html
          position={[
            (positionsRef.current.get(hovered)!.x / Math.sqrt(positionsRef.current.get(hovered)!.x ** 2 + positionsRef.current.get(hovered)!.y ** 2 + positionsRef.current.get(hovered)!.z ** 2)) * (1 + scaleAltitude(positionsRef.current.get(hovered)!.altitude)),
            (positionsRef.current.get(hovered)!.y / Math.sqrt(positionsRef.current.get(hovered)!.x ** 2 + positionsRef.current.get(hovered)!.y ** 2 + positionsRef.current.get(hovered)!.z ** 2)) * (1 + scaleAltitude(positionsRef.current.get(hovered)!.altitude)) + 0.12,
            (positionsRef.current.get(hovered)!.z / Math.sqrt(positionsRef.current.get(hovered)!.x ** 2 + positionsRef.current.get(hovered)!.y ** 2 + positionsRef.current.get(hovered)!.z ** 2)) * (1 + scaleAltitude(positionsRef.current.get(hovered)!.altitude))
          ]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-black/95 backdrop-blur border border-white/20 text-white px-3 py-2 rounded-lg shadow-xl min-w-[140px]">
            <div className="font-semibold text-xs truncate max-w-[180px]">{satellites[hovered]?.name}</div>
            <div className="text-[9px] text-white/50 mt-0.5">
              {satellites[hovered]?.category && SATELLITE_CATEGORIES[satellites[hovered].category as keyof typeof SATELLITE_CATEGORIES]?.name}
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-white/10 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px]">
              <span className="text-white/40">Alt:</span>
              <span className="text-white font-mono text-right">{positionsRef.current.get(hovered)!.altitude.toFixed(0)} km</span>
              <span className="text-white/40">Vel:</span>
              <span className="text-white font-mono text-right">{positionsRef.current.get(hovered)!.velocity.toFixed(2)} km/s</span>
            </div>
            <div className="text-[8px] text-blue-400 mt-1.5 text-center">Click to select</div>
          </div>
        </Html>
      )}
    </>
  );
}

// ============================================
// ORBIT PATH
// ============================================

function OrbitPath({ altitude, inclination, color }: { altitude: number; inclination: number; color: string }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const radius = 1 + scaleAltitude(altitude);
    const incRad = (inclination * Math.PI) / 180;
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push([
        Math.cos(angle) * radius,
        Math.sin(angle) * Math.sin(incRad) * radius,
        Math.sin(angle) * Math.cos(incRad) * radius
      ]);
    }
    return pts;
  }, [altitude, inclination]);

  return <Line points={points} color={color} transparent opacity={0.2} lineWidth={1} />;
}

// ============================================
// EARTH - Uses internal clock for smooth rotation
// ============================================

interface EarthProps {
  initialDate: Date;
  speedMultiplier: number;
  useTextures: boolean;
}

function EarthWithTextures({ initialDate, speedMultiplier }: { initialDate: Date; speedMultiplier: number }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const textures = useLoader(THREE.TextureLoader, [
    '/textures/earth_daymap.jpg',
    '/textures/earth_clouds.png',
  ]);

  // Internal clock for smooth animation - matches satellite clock
  const clockRef = useRef({
    lastFrameTime: performance.now(),
    currentSimTime: initialDate.getTime(),
    currentSpeed: speedMultiplier,
  });

  // Update speed without resetting time
  useEffect(() => {
    clockRef.current.currentSpeed = speedMultiplier;
  }, [speedMultiplier]);

  useFrame(() => {
    const clock = clockRef.current;
    const now = performance.now();
    const realDeltaTime = Math.min(now - clock.lastFrameTime, 100);
    clock.lastFrameTime = now;
    clock.currentSimTime += realDeltaTime * clock.currentSpeed;

    const rotation = getEarthRotation(new Date(clock.currentSimTime));
    if (earthRef.current) earthRef.current.rotation.y = rotation;
    if (cloudsRef.current) cloudsRef.current.rotation.y = rotation * 1.01;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial map={textures[0]} roughness={0.8} />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.01, 32, 32]} />
        <meshStandardMaterial map={textures[1]} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.08, 24, 24]} />
        <meshBasicMaterial color="#4da6ff" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function EarthWithoutTextures({ initialDate, speedMultiplier }: { initialDate: Date; speedMultiplier: number }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Internal clock for smooth animation - matches satellite clock
  const clockRef = useRef({
    lastFrameTime: performance.now(),
    currentSimTime: initialDate.getTime(),
    currentSpeed: speedMultiplier,
  });

  // Update speed without resetting time
  useEffect(() => {
    clockRef.current.currentSpeed = speedMultiplier;
  }, [speedMultiplier]);

  useFrame(() => {
    const clock = clockRef.current;
    const now = performance.now();
    const realDeltaTime = Math.min(now - clock.lastFrameTime, 100);
    clock.lastFrameTime = now;
    clock.currentSimTime += realDeltaTime * clock.currentSpeed;

    const rotation = getEarthRotation(new Date(clock.currentSimTime));
    if (earthRef.current) earthRef.current.rotation.y = rotation;
    if (cloudsRef.current) cloudsRef.current.rotation.y = rotation * 1.01;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.7} />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.01, 32, 32]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.08, 24, 24]} />
        <meshBasicMaterial color="#4da6ff" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function Earth({ initialDate, speedMultiplier, useTextures }: EarthProps) {
  if (useTextures) {
    return <EarthWithTextures initialDate={initialDate} speedMultiplier={speedMultiplier} />;
  }
  return <EarthWithoutTextures initialDate={initialDate} speedMultiplier={speedMultiplier} />;
}

// ============================================
// SCENE
// ============================================

interface SceneProps {
  showOrbits: boolean;
  initialDate: Date;
  speedMultiplier: number;
  selectedSatellite: TLEData | null;
  onSelectSatellite: (tle: TLEData | null) => void;
  satellites: TLEData[];
  useTextures: boolean;
  autoRotate: boolean;
  onInteraction: () => void;
  onTimeUpdate?: (date: Date) => void;
}

function Scene({ showOrbits, initialDate, speedMultiplier, selectedSatellite, onSelectSatellite, satellites, useTextures, autoRotate, onInteraction, onTimeUpdate }: SceneProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const handler = () => onInteraction();
    controls.addEventListener('start', handler);
    return () => controls.removeEventListener('start', handler);
  }, [onInteraction]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <Stars radius={100} depth={50} count={1500} factor={3} fade />

      <Earth initialDate={initialDate} speedMultiplier={speedMultiplier} useTextures={useTextures} />

      {showOrbits && (
        <>
          <OrbitPath altitude={420} inclination={51.6} color={orbitColors.LEO} />
          <OrbitPath altitude={550} inclination={53} color="#00bfff" />
          <OrbitPath altitude={20200} inclination={55} color={orbitColors.MEO} />
          <OrbitPath altitude={35786} inclination={0} color={orbitColors.GEO} />
        </>
      )}

      <InstancedSatellites
        satellites={satellites}
        initialDate={initialDate}
        speedMultiplier={speedMultiplier}
        onSelect={onSelectSatellite}
        selectedSatellite={selectedSatellite}
        onTimeUpdate={onTimeUpdate}
      />

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        minDistance={1.5}
        maxDistance={8}
        autoRotate={autoRotate}
        autoRotateSpeed={0.1}
      />
    </>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface EarthViewProps {
  className?: string;
  showOrbits?: boolean;
  selectedCategory?: string | null;
  speedMultiplier?: number;
  selectedSatellite?: TLEData | null;
  onSelectSatellite?: (tle: TLEData | null) => void;
  useRealisticTextures?: boolean;
  categoriesToLoad?: TLESourceKey[];
  onTimeUpdate?: (date: Date) => void;
}

export function EarthView({
  className = '',
  showOrbits = true,
  selectedCategory = null,
  speedMultiplier = 1,
  selectedSatellite = null,
  onSelectSatellite = () => {},
  useRealisticTextures = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  categoriesToLoad: _categoriesToLoad,
  onTimeUpdate,
}: EarthViewProps) {
  const [allSatellites, setAllSatellites] = useState<TLEData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Initial date is set once on mount and never changes
  const [initialDate] = useState(() => new Date());

  // Handle time updates from InstancedSatellites (the authoritative clock)
  // Simply forward to parent - Earth now has its own internal clock
  const handleTimeUpdate = useCallback((date: Date) => {
    onTimeUpdate?.(date);
  }, [onTimeUpdate]);

  // Load satellites from Supabase API with fallback to local JSON
  useEffect(() => {
    async function load() {
      setIsLoading(true);

      let satellites: TLEData[] = [];
      let source = '';

      // Try API first (Supabase database)
      try {
        const response = await fetch('/api/satellites');
        if (response.ok) {
          const data = await response.json();
          satellites = data.satellites || [];
          source = 'Supabase';
          console.log(`Last updated: ${data.lastUpdated}`);
        }
      } catch (error) {
        console.warn('API unavailable, trying local JSON fallback...');
      }

      // Fallback to local JSON file
      if (satellites.length === 0) {
        try {
          const response = await fetch('/data/satellites.json');
          if (response.ok) {
            const data = await response.json();
            satellites = data.satellites || [];
            source = 'local JSON';
            console.log(`Last updated: ${data.lastUpdated}`);
          }
        } catch (error) {
          console.warn('Local JSON unavailable, using hardcoded fallback...');
        }
      }

      // Final fallback to hardcoded data
      if (satellites.length === 0) {
        satellites = FALLBACK_TLE;
        source = 'hardcoded fallback';
      }

      console.log(`Loaded ${satellites.length} satellites from ${source}`);

      // Prioritize stations at the front
      const stations = satellites.filter((s: TLEData) => s.category === 'stations');
      const others = satellites.filter((s: TLEData) => s.category !== 'stations');
      setAllSatellites([...stations, ...others]);

      setIsLoading(false);
    }
    load();
  }, []);

  // Filter by category
  const filteredSatellites = useMemo(() => {
    if (!selectedCategory) return allSatellites;
    return allSatellites.filter(s => s.category === selectedCategory);
  }, [allSatellites, selectedCategory]);

  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setAutoRotate(false);
    }
  }, [hasInteracted]);

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 1, 2.5], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #000, #0a0a15)' }}
        dpr={[1, 2]} // Higher pixel ratio for crisp rendering
        frameloop="always" // Always render for smooth satellite animation
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Scene
            showOrbits={showOrbits}
            initialDate={initialDate}
            speedMultiplier={speedMultiplier}
            selectedSatellite={selectedSatellite}
            onSelectSatellite={onSelectSatellite}
            satellites={filteredSatellites}
            useTextures={useRealisticTextures}
            autoRotate={autoRotate}
            onInteraction={handleInteraction}
            onTimeUpdate={handleTimeUpdate}
          />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-center">
            <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/70 text-xs">Loading satellites...</p>
          </div>
        </div>
      )}
    </div>
  );
}
