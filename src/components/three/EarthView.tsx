'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { leoSatellites, meoSatellites, geoSatellites, type SatelliteData } from '@/data/satellites';

// Orbit type colors
const orbitColors = {
  LEO: '#00ff88',
  MEO: '#ffaa00',
  GEO: '#ff4488',
};

// Scale altitudes for visualization (Earth radius = 1)
function scaleAltitude(altitudeKm: number): number {
  const earthRadiusKm = 6371;
  // Use logarithmic scaling to make all orbits visible
  if (altitudeKm < 2000) {
    return 0.15 + (altitudeKm / 2000) * 0.15; // LEO: 0.15 - 0.30
  } else if (altitudeKm < 25000) {
    return 0.35 + ((altitudeKm - 2000) / 23000) * 0.4; // MEO: 0.35 - 0.75
  } else {
    return 0.8 + ((altitudeKm - 25000) / 15000) * 0.6; // GEO: 0.8 - 1.4
  }
}

// Convert orbital period to animation speed
function periodToSpeed(periodMinutes: number): number {
  // ISS period (~93 min) = speed 1.5
  return 140 / periodMinutes;
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

  // Use index to distribute satellites around orbit
  const startAngle = useMemo(() => (index * 137.5 * Math.PI) / 180, [index]);
  const scaledAltitude = useMemo(() => scaleAltitude(satellite.altitude), [satellite.altitude]);
  const speed = useMemo(() => periodToSpeed(satellite.period), [satellite.period]);
  const color = orbitColors[satellite.type];

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime() * speed * speedMultiplier + startAngle;
      const radius = 1 + scaledAltitude;
      const incRad = (satellite.inclination * Math.PI) / 180;

      ref.current.position.x = Math.cos(time) * radius;
      ref.current.position.y = Math.sin(time) * Math.sin(incRad) * radius;
      ref.current.position.z = Math.sin(time) * Math.cos(incRad) * radius;
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

function Earth({ speedMultiplier }: { speedMultiplier: number }) {
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

interface EarthSceneProps {
  showOrbits: boolean;
  selectedOrbit: string | null;
  speedMultiplier: number;
  selectedSatellite: SatelliteData | null;
  onSelectSatellite: (satellite: SatelliteData | null) => void;
}

function EarthScene({ showOrbits, selectedOrbit, speedMultiplier, selectedSatellite, onSelectSatellite }: EarthSceneProps) {
  // Filter satellites based on selected orbit
  const satellites = useMemo(() => {
    if (selectedOrbit === 'LEO') return leoSatellites;
    if (selectedOrbit === 'MEO') return meoSatellites;
    if (selectedOrbit === 'GEO') return geoSatellites;
    if (selectedOrbit === 'Starlink') return leoSatellites.filter(s => s.name.includes('Starlink'));
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

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={speedMultiplier * 0.5} />

      <Earth speedMultiplier={speedMultiplier} />

      {/* Orbit paths */}
      {showOrbits && orbitPaths.map((orbit, i) => (
        <OrbitPath key={i} altitude={orbit.altitude} inclination={orbit.inclination} color={orbit.color} />
      ))}

      {/* Satellites */}
      {satellites.map((sat, index) => (
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
        autoRotate
        autoRotateSpeed={0.15 * speedMultiplier}
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
}

export function EarthView({
  className = '',
  showOrbits = true,
  selectedOrbit = null,
  speedMultiplier = 1,
  selectedSatellite = null,
  onSelectSatellite = () => {}
}: EarthViewProps) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 1.5, 3.5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <EarthScene
          showOrbits={showOrbits}
          selectedOrbit={selectedOrbit}
          speedMultiplier={speedMultiplier}
          selectedSatellite={selectedSatellite}
          onSelectSatellite={onSelectSatellite}
        />
      </Canvas>
    </div>
  );
}

export { orbitColors };
