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
import {
  loadCustomSatellites,
  loadCustomConstellations,
  customSatelliteToTLE,
} from '@/lib/custom-satellites';

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

  // Track initialDate to detect resets
  const prevInitialDateRef = useRef(initialDate.getTime());

  // Initialize on mount and reset when initialDate changes (live reset)
  useEffect(() => {
    const newTime = initialDate.getTime();
    if (!animRef.current.initialized || newTime !== prevInitialDateRef.current) {
      animRef.current.currentSimTime = newTime;
      animRef.current.initialized = true;
      prevInitialDateRef.current = newTime;
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
        key={satellites.length} // Force recreation when satellite count changes
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
// EDUCATIONAL ORBITAL VISUALIZATIONS
// ============================================

interface OrbitalPlaneProps {
  altitude: number;
  inclination: number;
  raan: number; // Right Ascension of Ascending Node
  color: string;
  opacity?: number;
  showPlane?: boolean;
  showOrbit?: boolean;
  showNodes?: boolean;
  label?: string;
}

/**
 * Renders a complete orbital plane with scientifically accurate geometry
 *
 * Orbital mechanics reference:
 * - Inclination (i): Angle between orbital plane and equatorial plane
 * - RAAN (Ω): Right Ascension of Ascending Node - angle from vernal equinox
 *   to ascending node, measured in the equatorial plane
 *
 * Rotation order (standard orbital mechanics):
 * 1. Start with orbit in equatorial plane (XZ plane, Y up)
 * 2. Rotate by inclination around the line of nodes (X axis after RAAN rotation)
 * 3. Rotate by RAAN around the polar axis (Y axis)
 *
 * Reference: Vallado, "Fundamentals of Astrodynamics and Applications", Chapter 2
 */
function OrbitalPlane({
  altitude,
  inclination,
  raan,
  color,
  opacity = 0.15,
  showPlane = true,
  showOrbit = true,
  showNodes = false,
  label
}: OrbitalPlaneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 1 + scaleAltitude(altitude);
  const incRad = (inclination * Math.PI) / 180;
  const raanRad = (raan * Math.PI) / 180;

  // Orbital path points using proper 3D rotation matrices
  const orbitPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;

      // Start with circular orbit in XZ plane (equatorial)
      const x0 = Math.cos(theta) * radius;
      const y0 = 0;
      const z0 = Math.sin(theta) * radius;

      // Step 1: Rotate by inclination around X axis
      // This tilts the orbital plane relative to the equator
      const x1 = x0;
      const y1 = y0 * Math.cos(incRad) - z0 * Math.sin(incRad);
      const z1 = y0 * Math.sin(incRad) + z0 * Math.cos(incRad);

      // Step 2: Rotate by RAAN around Y axis (polar axis)
      // This positions the ascending node at the correct longitude
      const x2 = x1 * Math.cos(raanRad) + z1 * Math.sin(raanRad);
      const y2 = y1;
      const z2 = -x1 * Math.sin(raanRad) + z1 * Math.cos(raanRad);

      pts.push([x2, y2, z2]);
    }
    return pts;
  }, [radius, incRad, raanRad]);

  // Ascending node: where orbit crosses equator going north (y increasing)
  // Located at angle = RAAN from X axis in XZ plane
  const ascendingNode = useMemo(() => {
    const x = Math.cos(raanRad) * radius;
    const z = -Math.sin(raanRad) * radius;
    return [x, 0, z] as [number, number, number];
  }, [radius, raanRad]);

  // Descending node: opposite side of orbit (180° from ascending node)
  const descendingNode = useMemo(() => {
    const x = -Math.cos(raanRad) * radius;
    const z = Math.sin(raanRad) * radius;
    return [x, 0, z] as [number, number, number];
  }, [radius, raanRad]);

  // Create rotation for the plane mesh using Euler angles
  // Order: Y (RAAN) then X (inclination) - 'YXZ' order
  const planeRotation = useMemo(() => {
    const euler = new THREE.Euler(incRad, raanRad, 0, 'YXZ');
    return euler;
  }, [incRad, raanRad]);

  return (
    <group ref={groupRef}>
      {/* Orbital path */}
      {showOrbit && (
        <Line
          points={orbitPoints}
          color={color}
          transparent
          opacity={opacity * 2.5}
          lineWidth={1.5}
        />
      )}

      {/* Semi-transparent orbital plane disk */}
      {showPlane && (
        <mesh rotation={planeRotation} position={[0, 0, 0]}>
          <ringGeometry args={[radius * 0.3, radius, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Ascending node marker (green - going "up" through equator) */}
      {showNodes && (
        <>
          <mesh position={ascendingNode}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
          <Html position={ascendingNode} center style={{ pointerEvents: 'none' }}>
            <div className="text-[8px] text-green-400 bg-black/60 px-1 rounded -mt-4">AN</div>
          </Html>

          <mesh position={descendingNode}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
          <Html position={descendingNode} center style={{ pointerEvents: 'none' }}>
            <div className="text-[8px] text-red-400 bg-black/60 px-1 rounded -mt-4">DN</div>
          </Html>
        </>
      )}

      {/* Label */}
      {label && (
        <Html position={[orbitPoints[0][0] * 1.1, orbitPoints[0][1] * 1.1, orbitPoints[0][2] * 1.1]} center>
          <div className="text-[10px] text-white/70 bg-black/50 px-1 rounded whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

interface ConstellationPlanesProps {
  altitude: number;
  inclination: number;
  planes: number;
  constellationType: 'walker-delta' | 'walker-star';
  color: string;
  showPlanes?: boolean;
  showOrbits?: boolean;
}

/**
 * Renders all orbital planes for a Walker constellation
 * Walker Delta: 360° RAAN spread
 * Walker Star: 180° RAAN spread
 */
function ConstellationPlanes({
  altitude,
  inclination,
  planes,
  constellationType,
  color,
  showPlanes = true,
  showOrbits = true,
}: ConstellationPlanesProps) {
  const raanSpread = constellationType === 'walker-star' ? 180 : 360;
  const raanSpacing = raanSpread / planes;

  return (
    <group>
      {Array.from({ length: planes }).map((_, i) => (
        <OrbitalPlane
          key={i}
          altitude={altitude}
          inclination={inclination}
          raan={i * raanSpacing}
          color={color}
          opacity={0.1}
          showPlane={showPlanes}
          showOrbit={showOrbits}
          showNodes={i === 0} // Only show nodes on first plane
        />
      ))}
    </group>
  );
}

interface EquatorialPlaneProps {
  radius?: number;
  color?: string;
  opacity?: number;
}

/**
 * Reference equatorial plane (0° inclination)
 */
function EquatorialPlane({ radius = 2.5, color = '#ffffff', opacity = 0.05 }: EquatorialPlaneProps) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.05, radius, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Key orbital inclinations used in spaceflight
 * Simplified display showing just the angle value
 */
const INCLINATION_ANGLES = [0, 28.5, 51.6, 55, 63.4, 90];

interface InclinationGuideProps {
  radius?: number;
}

/**
 * Minimal inclination reference guides
 * Shows subtle dashed circles with small angle labels
 */
function InclinationGuides({ radius = 1.6 }: InclinationGuideProps) {
  return (
    <group>
      {INCLINATION_ANGLES.map((angle) => {
        const incRad = (angle * Math.PI) / 180;
        const points: [number, number, number][] = [];

        for (let i = 0; i <= 64; i++) {
          const theta = (i / 64) * Math.PI * 2;
          const x = Math.cos(theta) * radius;
          const z = Math.sin(theta) * radius;
          const y = z * Math.sin(incRad);
          const zRotated = z * Math.cos(incRad);
          points.push([x, y, zRotated]);
        }

        return (
          <group key={angle}>
            <Line
              points={points}
              color="#ffffff"
              transparent
              opacity={0.08}
              lineWidth={1}
              dashed
              dashSize={0.06}
              gapSize={0.06}
            />
            {/* Small angle label at edge of orbit */}
            <Html
              position={[radius + 0.08, radius * Math.sin(incRad) * 0.7, 0]}
              center
              style={{ pointerEvents: 'none' }}
            >
              <div className="text-[9px] text-white/30 font-mono">
                {angle}°
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

interface OrbitalVisualizationProps {
  customConstellations: Array<{
    altitude: number;
    inclination: number;
    planes: number;
    constellationType: 'walker-delta' | 'walker-star';
    color: string;
    name: string;
  }>;
  showEquatorialPlane?: boolean;
  showInclinationGuides?: boolean;
  showConstellationPlanes?: boolean;
  showConstellationOrbits?: boolean;
}

/**
 * Main orbital visualization component that combines all educational elements
 */
function OrbitalVisualization({
  customConstellations,
  showEquatorialPlane = true,
  showInclinationGuides = false,
  showConstellationPlanes = true,
  showConstellationOrbits = true,
}: OrbitalVisualizationProps) {
  return (
    <group>
      {/* Equatorial reference plane */}
      {showEquatorialPlane && <EquatorialPlane />}

      {/* Inclination reference guides - scientifically accurate orbital inclinations */}
      {showInclinationGuides && <InclinationGuides />}

      {/* Custom constellation orbital planes */}
      {customConstellations.map((constellation, idx) => (
        <ConstellationPlanes
          key={idx}
          altitude={constellation.altitude}
          inclination={constellation.inclination}
          planes={constellation.planes}
          constellationType={constellation.constellationType}
          color={constellation.color}
          showPlanes={showConstellationPlanes}
          showOrbits={showConstellationOrbits}
        />
      ))}
    </group>
  );
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
  const prevInitialDateRef = useRef(initialDate.getTime());

  // Update speed and reset time when initialDate changes (live reset)
  useEffect(() => {
    clockRef.current.currentSpeed = speedMultiplier;
    const newTime = initialDate.getTime();
    if (newTime !== prevInitialDateRef.current) {
      clockRef.current.currentSimTime = newTime;
      prevInitialDateRef.current = newTime;
    }
  }, [speedMultiplier, initialDate]);

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
  const prevInitialDateRef = useRef(initialDate.getTime());

  // Update speed and reset time when initialDate changes (live reset)
  useEffect(() => {
    clockRef.current.currentSpeed = speedMultiplier;
    const newTime = initialDate.getTime();
    if (newTime !== prevInitialDateRef.current) {
      clockRef.current.currentSimTime = newTime;
      prevInitialDateRef.current = newTime;
    }
  }, [speedMultiplier, initialDate]);

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

interface ConstellationVisualizationData {
  altitude: number;
  inclination: number;
  planes: number;
  constellationType: 'walker-delta' | 'walker-star';
  color: string;
  name: string;
}

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
  // Educational visualization props
  customConstellations?: ConstellationVisualizationData[];
  showOrbitalPlanes?: boolean;
  showEquatorialPlane?: boolean;
  showInclinationGuides?: boolean;
}

function Scene({
  showOrbits,
  initialDate,
  speedMultiplier,
  selectedSatellite,
  onSelectSatellite,
  satellites,
  useTextures,
  autoRotate,
  onInteraction,
  onTimeUpdate,
  customConstellations = [],
  showOrbitalPlanes = false,
  showEquatorialPlane = false,
  showInclinationGuides = false,
}: SceneProps) {
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

      {/* Standard reference orbits */}
      {showOrbits && (
        <>
          <OrbitPath altitude={420} inclination={51.6} color={orbitColors.LEO} />
          <OrbitPath altitude={550} inclination={53} color="#00bfff" />
          <OrbitPath altitude={20200} inclination={55} color={orbitColors.MEO} />
          <OrbitPath altitude={35786} inclination={0} color={orbitColors.GEO} />
        </>
      )}

      {/* Educational orbital visualizations */}
      {(showOrbitalPlanes || showEquatorialPlane || showInclinationGuides) && (
        <OrbitalVisualization
          customConstellations={customConstellations}
          showEquatorialPlane={showEquatorialPlane}
          showInclinationGuides={showInclinationGuides}
          showConstellationPlanes={showOrbitalPlanes}
          showConstellationOrbits={showOrbitalPlanes}
        />
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
  resetToLive?: number; // Increment to reset simulation to current time
  customSatellitesKey?: number; // Increment to reload custom satellites
  showCustomSatellites?: boolean; // Toggle visibility of custom satellites
  // Educational visualization options
  showOrbitalPlanes?: boolean; // Show orbital plane disks for custom constellations
  showEquatorialPlane?: boolean; // Show reference equatorial plane
  showInclinationGuides?: boolean; // Show inclination reference circles
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
  resetToLive = 0,
  customSatellitesKey = 0,
  showCustomSatellites = true,
  showOrbitalPlanes = false,
  showEquatorialPlane = false,
  showInclinationGuides = false,
}: EarthViewProps) {
  const [realSatellites, setRealSatellites] = useState<TLEData[]>([]);
  const [customTLEs, setCustomTLEs] = useState<TLEData[]>([]);
  const [constellationVizData, setConstellationVizData] = useState<ConstellationVisualizationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Initial date - updates when resetToLive changes
  const [initialDate, setInitialDate] = useState(() => new Date());

  // Reset to live time when resetToLive prop changes
  useEffect(() => {
    if (resetToLive > 0) {
      setInitialDate(new Date());
    }
  }, [resetToLive]);

  // Handle time updates from InstancedSatellites (the authoritative clock)
  // Simply forward to parent - Earth now has its own internal clock
  const handleTimeUpdate = useCallback((date: Date) => {
    onTimeUpdate?.(date);
  }, [onTimeUpdate]);

  // Load custom satellites from localStorage when customSatellitesKey changes
  useEffect(() => {
    const customSats = loadCustomSatellites();
    const constellations = loadCustomConstellations();

    // Convert custom satellites to TLE format
    const customTLEData: TLEData[] = customSats.map(sat => {
      const tleData = customSatelliteToTLE(sat);
      return {
        ...tleData,
        category: 'custom' as TLESourceKey,
      } as TLEData;
    });

    // Also add satellites from constellations that aren't already in the list
    const existingIds = new Set(customTLEData.map(s => s.name));
    for (const constellation of constellations) {
      for (const sat of constellation.satellites) {
        if (!existingIds.has(sat.name)) {
          const tleData = customSatelliteToTLE(sat);
          customTLEData.push({
            ...tleData,
            category: 'custom' as TLESourceKey,
          } as TLEData);
          existingIds.add(sat.name);
        }
      }
    }

    setCustomTLEs(customTLEData);

    // Extract constellation visualization data for orbital plane rendering
    const vizData: ConstellationVisualizationData[] = constellations
      .filter(c => c.constellationType === 'walker-delta' || c.constellationType === 'walker-star')
      .map(c => ({
        altitude: c.altitude,
        inclination: c.inclination,
        planes: c.planes,
        constellationType: c.constellationType as 'walker-delta' | 'walker-star',
        color: c.color,
        name: c.name,
      }));
    setConstellationVizData(vizData);
  }, [customSatellitesKey]);

  // Load satellites from Supabase API with fallback to local JSON
  useEffect(() => {
    async function load() {
      setIsLoading(true);

      let satellites: TLEData[] = [];
      let source = '';

      // Try local JSON first (most reliable for development)
      try {
        const response = await fetch('/data/satellites.json');
        if (response.ok) {
          const data = await response.json();
          satellites = data.satellites || [];
          source = 'local JSON';
          console.log(`Loaded ${satellites.length} satellites from local JSON (updated: ${data.lastUpdated})`);
        }
      } catch (error) {
        console.warn('Local JSON unavailable, trying API...');
      }

      // Also try API and merge any new satellites
      try {
        const response = await fetch('/api/satellites');
        if (response.ok) {
          const data = await response.json();
          const apiSatellites: TLEData[] = data.satellites || [];

          if (apiSatellites.length > 100) {
            // API has real data, merge with local
            const existingIds = new Set(satellites.map(s => s.noradId));
            const newSatellites = apiSatellites.filter(s => s.noradId && !existingIds.has(s.noradId));

            if (newSatellites.length > 0) {
              satellites = [...satellites, ...newSatellites];
              console.log(`Added ${newSatellites.length} new satellites from API`);
            }

            // If API has more data overall, prefer it
            if (apiSatellites.length > satellites.length) {
              satellites = apiSatellites;
              source = 'Supabase API';
            }
          }
        }
      } catch (error) {
        console.warn('API unavailable, using local data only');
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
      setRealSatellites([...stations, ...others]);

      setIsLoading(false);
    }
    load();
  }, []);

  // Combine real satellites with custom satellites (respecting visibility toggle)
  const allSatellites = useMemo(() => {
    if (showCustomSatellites) {
      return [...realSatellites, ...customTLEs];
    }
    return realSatellites;
  }, [realSatellites, customTLEs, showCustomSatellites]);

  // Geostationary weather satellite names (in the 'geo' category but are weather satellites)
  const GEO_WEATHER_NAMES = ['GOES', 'METEOSAT', 'HIMAWARI', 'INSAT', 'ELEKTRO', 'FY-4', 'GEO-KOMPSAT'];

  // Filter by category
  const filteredSatellites = useMemo(() => {
    if (!selectedCategory) return allSatellites;

    // Special case: weather filter should include geostationary weather satellites
    if (selectedCategory === 'weather') {
      return allSatellites.filter(s =>
        s.category === 'weather' ||
        (s.category === 'geo' && GEO_WEATHER_NAMES.some(name => s.name.toUpperCase().includes(name)))
      );
    }

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
            customConstellations={constellationVizData}
            showOrbitalPlanes={showOrbitalPlanes}
            showEquatorialPlane={showEquatorialPlane}
            showInclinationGuides={showInclinationGuides}
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
