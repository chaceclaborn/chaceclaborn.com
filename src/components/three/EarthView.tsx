'use client';

import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { leoSatellites, meoSatellites, geoSatellites, type SatelliteData } from '@/data/satellites';
import {
  fetchTLEData,
  calculateMultiplePositions,
  getOrbitType,
  FALLBACK_TLE,
  type SatellitePosition,
  type TLEData
} from '@/lib/satellite-service';

// Orbit type colors
const orbitColors = {
  LEO: '#00ff88',
  MEO: '#ffaa00',
  GEO: '#ff4488',
};

// Scale altitudes for visualization (Earth radius = 1)
function scaleAltitude(altitudeKm: number): number {
  // Use logarithmic scaling to make all orbits visible
  if (altitudeKm < 2000) {
    return 0.15 + (altitudeKm / 2000) * 0.15; // LEO: 0.15 - 0.30
  } else if (altitudeKm < 25000) {
    return 0.35 + ((altitudeKm - 2000) / 23000) * 0.4; // MEO: 0.35 - 0.75
  } else {
    return 0.8 + ((altitudeKm - 25000) / 15000) * 0.6; // GEO: 0.8 - 1.4
  }
}

// Convert orbital period to radians per millisecond (for real-time animation)
function periodToAngularVelocity(periodMinutes: number): number {
  // Full orbit (2π radians) in periodMinutes * 60 * 1000 milliseconds
  const periodMs = periodMinutes * 60 * 1000;
  return (2 * Math.PI) / periodMs;
}

// Real-time satellite component using TLE data
interface RealTimeSatelliteProps {
  tle: TLEData;
  speedMultiplier: number;
  isSelected: boolean;
  onSelect: (name: string | null) => void;
}

function RealTimeSatellite({ tle, speedMultiplier, isSelected, onSelect }: RealTimeSatelliteProps) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState<SatellitePosition | null>(null);
  const lastUpdateRef = useRef(0);
  const startWallTimeRef = useRef(Date.now());

  // Update position based on real time (with optional speedMultiplier for time lapse)
  useFrame((state) => {
    if (ref.current) {
      // Throttle position updates to every 100ms for performance
      const now = state.clock.getElapsedTime();
      if (now - lastUpdateRef.current < 0.1) return;
      lastUpdateRef.current = now;

      // Calculate simulated time
      // At speedMultiplier=1: real-time (satellites move very slowly, ISS takes 90 min to orbit)
      // At speedMultiplier=60: 1 real second = 1 simulated minute
      // At speedMultiplier=3600: 1 real second = 1 simulated hour
      const realElapsedMs = Date.now() - startWallTimeRef.current;
      const simulatedElapsedMs = realElapsedMs * speedMultiplier;
      const simulatedDate = new Date(startWallTimeRef.current + simulatedElapsedMs);

      // Recalculate position using satellite.js
      const newPos = calculateSinglePosition(tle, simulatedDate);
      if (newPos) {
        setPosition(newPos);
        // Scale position for visualization
        const scale = 1 + scaleAltitude(newPos.altitude);
        const normalizedRadius = Math.sqrt(newPos.x ** 2 + newPos.y ** 2 + newPos.z ** 2);
        if (normalizedRadius > 0) {
          ref.current.position.x = (newPos.x / normalizedRadius) * scale;
          ref.current.position.y = (newPos.y / normalizedRadius) * scale;
          ref.current.position.z = (newPos.z / normalizedRadius) * scale;
        }
      }
    }
  });

  const orbitType = position ? getOrbitType(position.altitude) : 'LEO';
  const color = orbitColors[orbitType];
  const isISS = tle.name.includes('ISS');
  const size = isISS ? 0.05 : 0.025;

  return (
    <group ref={ref}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(isSelected ? null : tle.name);
        }}
      >
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial
          color={isSelected ? '#ffffff' : hovered ? '#ffffff' : color}
          transparent={!isSelected && !hovered}
          opacity={isSelected || hovered ? 1 : 0.8}
        />
      </mesh>
      {(hovered || isSelected) && position && (
        <Html position={[0.08, 0.08, 0]} center>
          <div
            className={`text-xs text-white whitespace-nowrap px-2 py-1 rounded cursor-pointer ${
              isSelected ? 'bg-primary' : 'bg-black/80'
            }`}
            onClick={() => onSelect(isSelected ? null : tle.name)}
          >
            <div className="font-medium">{tle.name}</div>
            <div className="text-[10px] opacity-80">
              Alt: {position.altitude.toFixed(0)} km | {position.velocity.toFixed(1)} km/s
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Helper to calculate single position (moved outside component to avoid recreation)
import { calculatePosition } from '@/lib/satellite-service';
function calculateSinglePosition(tle: TLEData, date: Date): SatellitePosition | null {
  return calculatePosition(tle, date);
}

interface SatelliteProps {
  satellite: SatelliteData;
  index: number;
  speedMultiplier: number;
  isSelected: boolean;
  onSelect: (satellite: SatelliteData | null) => void;
}

function Satellite({ satellite, index, speedMultiplier, isSelected, onSelect }: SatelliteProps) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const startWallTimeRef = useRef(Date.now());

  // Use index to distribute satellites around orbit
  const startAngle = useMemo(() => (index * 137.5 * Math.PI) / 180, [index]);
  const scaledAltitude = useMemo(() => scaleAltitude(satellite.altitude), [satellite.altitude]);
  const angularVelocity = useMemo(() => periodToAngularVelocity(satellite.period), [satellite.period]);
  const color = orbitColors[satellite.type];

  useFrame(() => {
    if (ref.current) {
      // Calculate angle based on wall-clock time (real-time at speedMultiplier=1)
      const elapsedMs = (Date.now() - startWallTimeRef.current) * speedMultiplier;
      const angle = startAngle + elapsedMs * angularVelocity;
      const radius = 1 + scaledAltitude;
      const incRad = (satellite.inclination * Math.PI) / 180;

      ref.current.position.x = Math.cos(angle) * radius;
      ref.current.position.y = Math.sin(angle) * Math.sin(incRad) * radius;
      ref.current.position.z = Math.sin(angle) * Math.cos(incRad) * radius;
    }
  });

  const isISS = satellite.name.includes('ISS');
  const size = isISS ? 0.04 : 0.02;

  return (
    <group ref={ref}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(isSelected ? null : satellite);
        }}
      >
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial
          color={isSelected ? '#ffffff' : hovered ? '#ffffff' : color}
          transparent={!isSelected && !hovered}
          opacity={isSelected || hovered ? 1 : 0.8}
        />
      </mesh>
      {(hovered || isSelected) && (
        <Html position={[0.08, 0.08, 0]} center>
          <div
            className={`text-xs text-white whitespace-nowrap px-2 py-1 rounded cursor-pointer ${
              isSelected ? 'bg-primary' : 'bg-black/80'
            }`}
            onClick={() => onSelect(isSelected ? null : satellite)}
          >
            {satellite.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function OrbitPath({ altitude, inclination, color }: { altitude: number; inclination: number; color: string }) {
  const scaledAltitude = scaleAltitude(altitude);

  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const radius = 1 + scaledAltitude;
    const incRad = (inclination * Math.PI) / 180;

    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * Math.sin(incRad) * radius;
      const z = Math.sin(angle) * Math.cos(incRad) * radius;
      pts.push([x, y, z]);
    }
    return pts;
  }, [scaledAltitude, inclination]);

  return (
    <Line
      points={points}
      color={color}
      transparent
      opacity={0.15}
      lineWidth={1}
    />
  );
}

// Calculate Earth's rotation angle based on current time (GMST - Greenwich Mean Sidereal Time)
function getEarthRotation(): number {
  const now = new Date();
  // Julian date calculation
  const jd = now.getTime() / 86400000 + 2440587.5;
  // Julian centuries since J2000.0
  const T = (jd - 2451545.0) / 36525;
  // Greenwich Mean Sidereal Time in degrees
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  // Normalize to 0-360
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  // Convert to radians
  return (gmst * Math.PI) / 180;
}

// Realistic Earth with NASA textures - real-time rotation
function RealisticEarth({ speedMultiplier }: { speedMultiplier: number }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const nightRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef(Date.now());
  const startRotationRef = useRef(getEarthRotation());

  // Load textures
  const [dayMap, normalMap, specularMap, cloudsMap, nightMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth_daymap.jpg',
    '/textures/earth_normal.jpg',
    '/textures/earth_specular.jpg',
    '/textures/earth_clouds.png',
    '/textures/earth_nightlights.jpg',
  ]);

  useFrame(() => {
    // Calculate real-time Earth rotation
    // Earth completes one rotation in 23h 56m 4s (sidereal day)
    const siderealDayMs = 86164090.5; // milliseconds
    const elapsedMs = (Date.now() - startTimeRef.current) * speedMultiplier;
    const additionalRotation = (elapsedMs / siderealDayMs) * 2 * Math.PI;
    const currentRotation = startRotationRef.current + additionalRotation;

    if (earthRef.current) {
      earthRef.current.rotation.y = currentRotation;
    }
    if (nightRef.current) {
      nightRef.current.rotation.y = currentRotation;
    }
    if (cloudsRef.current) {
      // Clouds drift slightly faster than Earth surface
      cloudsRef.current.rotation.y = currentRotation + (elapsedMs / siderealDayMs) * 0.1;
    }
  });

  return (
    <group>
      {/* Earth surface with realistic textures */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughnessMap={specularMap}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Night lights layer (visible on dark side) */}
      <mesh ref={nightRef}>
        <sphereGeometry args={[1.001, 64, 64]} />
        <meshBasicMaterial
          map={nightMap}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.02, 48, 48]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Simple Earth fallback (no textures)
function SimpleEarth({ speedMultiplier }: { speedMultiplier: number }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002 * speedMultiplier;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0025 * speedMultiplier;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.015, 32, 32]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.25} roughness={1} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.08, 32, 32]} />
        <meshBasicMaterial color="#6eb5ff" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// Earth wrapper that handles texture loading errors
function Earth({ speedMultiplier, useRealisticTextures }: { speedMultiplier: number; useRealisticTextures: boolean }) {
  if (useRealisticTextures) {
    return <RealisticEarth speedMultiplier={speedMultiplier} />;
  }
  return <SimpleEarth speedMultiplier={speedMultiplier} />;
}

interface EarthSceneProps {
  showOrbits: boolean;
  selectedOrbit: string | null;
  speedMultiplier: number;
  selectedSatellite: SatelliteData | null;
  onSelectSatellite: (satellite: SatelliteData | null) => void;
  useRealisticTextures: boolean;
  realTimeTLEs: TLEData[];
  selectedRealTimeSatellite: string | null;
  onSelectRealTimeSatellite: (name: string | null) => void;
}

function EarthScene({
  showOrbits,
  selectedOrbit,
  speedMultiplier,
  selectedSatellite,
  onSelectSatellite,
  useRealisticTextures,
  realTimeTLEs,
  selectedRealTimeSatellite,
  onSelectRealTimeSatellite
}: EarthSceneProps) {
  // Filter satellites based on selected orbit
  const satellites = useMemo(() => {
    if (selectedOrbit === 'LEO') return leoSatellites;
    if (selectedOrbit === 'MEO') return meoSatellites;
    if (selectedOrbit === 'GEO') return geoSatellites;
    if (selectedOrbit === 'Starlink') return leoSatellites.filter(s => s.name.includes('Starlink'));
    if (selectedOrbit === 'Real-Time') return []; // Use real-time satellites instead
    return [...leoSatellites, ...meoSatellites, ...geoSatellites];
  }, [selectedOrbit]);

  // Sample orbits for visualization
  const orbitPaths = useMemo(() => {
    const paths: { altitude: number; inclination: number; color: string }[] = [];

    if (!selectedOrbit || selectedOrbit === 'LEO' || selectedOrbit === 'Starlink') {
      paths.push({ altitude: 400, inclination: 51.6, color: orbitColors.LEO }); // ISS-like
      paths.push({ altitude: 550, inclination: 53, color: '#00bfff' }); // Starlink orbit
      paths.push({ altitude: 700, inclination: 98, color: orbitColors.LEO }); // Sun-sync
    }
    if (!selectedOrbit || selectedOrbit === 'MEO') {
      paths.push({ altitude: 20200, inclination: 55, color: orbitColors.MEO }); // GPS
    }
    if (!selectedOrbit || selectedOrbit === 'GEO') {
      paths.push({ altitude: 35786, inclination: 0, color: orbitColors.GEO }); // GEO
    }

    return paths;
  }, [selectedOrbit]);

  // Only show real-time mode when explicitly selected
  const showRealTimeOnly = selectedOrbit === 'Real-Time';

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={speedMultiplier * 0.5} />

      <Earth speedMultiplier={speedMultiplier} useRealisticTextures={useRealisticTextures} />

      {/* Orbit paths */}
      {showOrbits && orbitPaths.map((orbit, i) => (
        <OrbitPath key={i} altitude={orbit.altitude} inclination={orbit.inclination} color={orbit.color} />
      ))}

      {/* Real-time satellites from TLE data - shown when Real-Time is selected or always shown alongside static */}
      {realTimeTLEs.map((tle) => (
        <RealTimeSatellite
          key={tle.name}
          tle={tle}
          speedMultiplier={speedMultiplier}
          isSelected={selectedRealTimeSatellite === tle.name}
          onSelect={onSelectRealTimeSatellite}
        />
      ))}

      {/* Static satellites (shown when not in real-time only mode) */}
      {!showRealTimeOnly && satellites.map((sat, index) => (
        <Satellite
          key={sat.noradId}
          satellite={sat}
          index={index}
          speedMultiplier={speedMultiplier}
          isSelected={selectedSatellite?.noradId === sat.noradId}
          onSelect={onSelectSatellite}
        />
      ))}

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={2}
        maxDistance={10}
        autoRotate={false}
      />
    </>
  );
}

interface EarthViewProps {
  className?: string;
  showOrbits?: boolean;
  selectedOrbit?: string | null;
  speedMultiplier?: number;
  selectedSatellite?: SatelliteData | null;
  onSelectSatellite?: (satellite: SatelliteData | null) => void;
  useRealisticTextures?: boolean;
}

export function EarthView({
  className = '',
  showOrbits = true,
  selectedOrbit = null,
  speedMultiplier = 1,
  selectedSatellite = null,
  onSelectSatellite = () => {},
  useRealisticTextures = true
}: EarthViewProps) {
  const [realTimeTLEs, setRealTimeTLEs] = useState<TLEData[]>([]);
  const [selectedRealTimeSatellite, setSelectedRealTimeSatellite] = useState<string | null>(null);
  const [tleError, setTleError] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(new Date());
  const startWallTimeRef = useRef(Date.now());

  // Update simulated time display
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedMs = (Date.now() - startWallTimeRef.current) * speedMultiplier;
      setSimulatedTime(new Date(startWallTimeRef.current + elapsedMs));
    }, 100);
    return () => clearInterval(interval);
  }, [speedMultiplier]);

  // Fetch real TLE data on mount
  useEffect(() => {
    async function loadTLEData() {
      try {
        // Try to fetch real satellite data from CelesTrak
        const stationsTLE = await fetchTLEData('stations');
        if (stationsTLE.length > 0) {
          // Get ISS and a few other notable satellites
          const notableSatellites = stationsTLE.slice(0, 10);
          setRealTimeTLEs(notableSatellites);
        } else {
          // Use fallback data if fetch fails
          setRealTimeTLEs(FALLBACK_TLE);
          setTleError(true);
        }
      } catch {
        console.log('Using fallback TLE data');
        setRealTimeTLEs(FALLBACK_TLE);
        setTleError(true);
      }
    }
    loadTLEData();
  }, []);

  // Handle render errors gracefully
  if (renderError) {
    return (
      <div className={`relative flex items-center justify-center bg-black ${className}`}>
        <div className="text-white text-center p-4">
          <p>Unable to load 3D view</p>
          <button
            onClick={() => setRenderError(false)}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 1.5, 3.5], fov: 50 }}
        style={{ background: 'transparent' }}
        onCreated={(state) => {
          // Set up error handling
          state.gl.domElement.addEventListener('webglcontextlost', () => {
            setRenderError(true);
          });
        }}
      >
        <Suspense fallback={null}>
          <EarthScene
            showOrbits={showOrbits}
            selectedOrbit={selectedOrbit}
            speedMultiplier={speedMultiplier}
            selectedSatellite={selectedSatellite}
            onSelectSatellite={onSelectSatellite}
            useRealisticTextures={useRealisticTextures}
            realTimeTLEs={realTimeTLEs}
            selectedRealTimeSatellite={selectedRealTimeSatellite}
            onSelectRealTimeSatellite={setSelectedRealTimeSatellite}
          />
        </Suspense>
      </Canvas>
      {/* Time and status display - responsive positioning */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-xs bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/30 shadow-lg max-w-[200px]">
        {/* Simulated time */}
        <div className="text-foreground font-mono text-xs md:text-sm mb-0.5">
          {simulatedTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <div className="text-foreground font-mono text-base md:text-lg font-medium">
          {simulatedTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })}
          <span className="text-muted-foreground text-xs ml-1">UTC</span>
        </div>

        {/* Status line */}
        {realTimeTLEs.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-border/30 text-muted-foreground text-[10px] md:text-xs">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <span className="truncate">
              {tleError ? 'Simulated' : 'Live'} • {realTimeTLEs.length} sats
              {speedMultiplier !== 1 && ` • ${speedMultiplier}x`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export { orbitColors };
