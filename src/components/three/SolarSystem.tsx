'use client';

import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';
import { Expand, Info, X, ChevronLeft, ChevronRight, Globe, ArrowRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================
// SCIENTIFIC DATA - All values based on NASA/JPL data
// Sources: NASA Planetary Fact Sheets, JPL HORIZONS
// ============================================

// J2000 Epoch: January 1, 2000, 12:00 TT
const J2000 = new Date('2000-01-01T12:00:00Z').getTime();

// Scale factors for visualization (not to true scale - would be invisible)
const DISTANCE_SCALE = 1; // 1 AU = 1 unit
const SIZE_SCALE = 0.025; // Planet sizes scaled for visibility

// Extended scientific data for all celestial bodies
interface CelestialBody {
  name: string;
  type: 'star' | 'planet' | 'dwarf' | 'asteroid' | 'moon';
  color: string;
  radius: number; // km
  semiMajorAxis: number; // AU
  eccentricity: number;
  inclination: number; // degrees
  orbitalPeriod: number; // Earth days
  rotationPeriod: number; // hours
  axialTilt: number; // degrees
  meanLongitudeJ2000: number; // degrees at J2000
  hasRings?: boolean;
  ringInner?: number;
  ringOuter?: number;
  ringColor?: string;
  moons?: MoonData[];
  // Extended scientific info
  mass: string; // kg (scientific notation)
  gravity: number; // m/s²
  escapeVelocity: number; // km/s
  meanTemp: number; // Kelvin
  atmosphere: string;
  composition: string;
  discoveryInfo: string;
  notableFacts: string[];
}

interface MoonData {
  name: string;
  radius: number;
  distance: number; // km from parent
  orbitalPeriod: number; // days
  color: string;
}

// Sun data
const sunData = {
  name: 'Sun',
  type: 'star' as const,
  radius: 696340, // km
  mass: '1.989 × 10³⁰ kg',
  surfaceTemp: 5778, // K
  coreTemp: 15000000, // K
  luminosity: '3.828 × 10²⁶ W',
  age: '4.6 billion years',
  spectralType: 'G2V (Yellow Dwarf)',
  composition: '73% Hydrogen, 25% Helium, 2% heavier elements',
  notableFacts: [
    'Contains 99.86% of the Solar System\'s mass',
    'Light takes 8 minutes 20 seconds to reach Earth',
    'Core fuses 620 million tons of hydrogen per second',
    'Magnetic field reverses every 11 years (solar cycle)',
    'Will become a red giant in ~5 billion years'
  ]
};

// Complete planetary data from NASA Planetary Fact Sheets
const celestialBodies: CelestialBody[] = [
  {
    name: 'Mercury',
    type: 'planet',
    color: '#8c7853',
    radius: 2439.7,
    semiMajorAxis: 0.387,
    eccentricity: 0.2056,
    inclination: 7.0,
    orbitalPeriod: 87.97,
    rotationPeriod: 1407.6,
    axialTilt: 0.03,
    meanLongitudeJ2000: 252.25,
    mass: '3.301 × 10²³ kg',
    gravity: 3.7,
    escapeVelocity: 4.3,
    meanTemp: 440,
    atmosphere: 'Trace amounts of O₂, Na, H₂, He, K',
    composition: 'Iron core (85% of radius), silicate mantle',
    discoveryInfo: 'Known since antiquity, visited by Mariner 10 (1974) and MESSENGER (2011-2015)',
    notableFacts: [
      'Smallest planet in the Solar System',
      'Most eccentric orbit of any planet',
      'Surface temperature ranges from -180°C to 430°C',
      'Has a massive iron core relative to its size',
      'One day on Mercury lasts 176 Earth days'
    ]
  },
  {
    name: 'Venus',
    type: 'planet',
    color: '#e6c87a',
    radius: 6051.8,
    semiMajorAxis: 0.723,
    eccentricity: 0.0068,
    inclination: 3.4,
    orbitalPeriod: 224.7,
    rotationPeriod: -5832.5,
    axialTilt: 177.4,
    meanLongitudeJ2000: 181.98,
    mass: '4.867 × 10²⁴ kg',
    gravity: 8.87,
    escapeVelocity: 10.36,
    meanTemp: 737,
    atmosphere: '96.5% CO₂, 3.5% N₂, trace SO₂',
    composition: 'Iron core, rocky mantle, basaltic crust',
    discoveryInfo: 'Known since antiquity, first successful flyby by Mariner 2 (1962)',
    notableFacts: [
      'Hottest planet due to runaway greenhouse effect',
      'Rotates backwards (retrograde) - sun rises in west',
      'Day longer than year (243 vs 225 Earth days)',
      'Surface pressure 92× Earth\'s atmosphere',
      'Clouds of sulfuric acid reflect 70% of sunlight'
    ]
  },
  {
    name: 'Earth',
    type: 'planet',
    color: '#6b93d6',
    radius: 6371,
    semiMajorAxis: 1.0,
    eccentricity: 0.0167,
    inclination: 0.0,
    orbitalPeriod: 365.25,
    rotationPeriod: 23.93,
    axialTilt: 23.44,
    meanLongitudeJ2000: 100.46,
    mass: '5.972 × 10²⁴ kg',
    gravity: 9.81,
    escapeVelocity: 11.19,
    meanTemp: 288,
    atmosphere: '78% N₂, 21% O₂, 1% Ar, 0.04% CO₂',
    composition: 'Iron-nickel core, silicate mantle, varied crust',
    discoveryInfo: 'Our home planet, only known body with confirmed life',
    notableFacts: [
      'Only planet not named after a god',
      '71% of surface covered by water',
      'Magnetic field protects from solar wind',
      'Plate tectonics unique among rocky planets',
      'Perfect distance from Sun for liquid water'
    ],
    moons: [
      { name: 'Moon', radius: 1737.4, distance: 384400, orbitalPeriod: 27.32, color: '#a0a0a0' }
    ]
  },
  {
    name: 'Mars',
    type: 'planet',
    color: '#c1440e',
    radius: 3389.5,
    semiMajorAxis: 1.524,
    eccentricity: 0.0934,
    inclination: 1.85,
    orbitalPeriod: 686.98,
    rotationPeriod: 24.62,
    axialTilt: 25.19,
    meanLongitudeJ2000: 355.45,
    mass: '6.417 × 10²³ kg',
    gravity: 3.71,
    escapeVelocity: 5.03,
    meanTemp: 210,
    atmosphere: '95% CO₂, 2.7% N₂, 1.6% Ar',
    composition: 'Iron sulfide core, silicate mantle, basaltic crust',
    discoveryInfo: 'Known since antiquity, extensively explored by rovers since 1997',
    notableFacts: [
      'Home to Olympus Mons - largest volcano in Solar System',
      'Has the largest canyon system (Valles Marineris)',
      'Evidence of ancient liquid water on surface',
      'Two small moons: Phobos and Deimos',
      'Target for human exploration in coming decades'
    ],
    moons: [
      { name: 'Phobos', radius: 11.1, distance: 9376, orbitalPeriod: 0.32, color: '#8a7a6a' },
      { name: 'Deimos', radius: 6.2, distance: 23458, orbitalPeriod: 1.26, color: '#9a8a7a' }
    ]
  },
  {
    name: 'Jupiter',
    type: 'planet',
    color: '#d4a574',
    radius: 69911,
    semiMajorAxis: 5.203,
    eccentricity: 0.0489,
    inclination: 1.31,
    orbitalPeriod: 4332.59,
    rotationPeriod: 9.93,
    axialTilt: 3.13,
    meanLongitudeJ2000: 34.40,
    mass: '1.898 × 10²⁷ kg',
    gravity: 24.79,
    escapeVelocity: 59.5,
    meanTemp: 165,
    atmosphere: '90% H₂, 10% He, traces of CH₄, NH₃',
    composition: 'Metallic hydrogen core, liquid hydrogen mantle, gas atmosphere',
    discoveryInfo: 'Known since antiquity, Galileo discovered 4 major moons in 1610',
    notableFacts: [
      'Largest planet - 2.5× mass of all other planets combined',
      'Great Red Spot storm has raged for 400+ years',
      'Has 95 known moons (as of 2023)',
      'Fastest rotation of any planet (9.9 hours)',
      'Strong magnetic field - 20,000× Earth\'s'
    ],
    moons: [
      { name: 'Io', radius: 1821.6, distance: 421700, orbitalPeriod: 1.77, color: '#f0d890' },
      { name: 'Europa', radius: 1560.8, distance: 671034, orbitalPeriod: 3.55, color: '#d4c4a8' },
      { name: 'Ganymede', radius: 2634.1, distance: 1070412, orbitalPeriod: 7.15, color: '#a09080' },
      { name: 'Callisto', radius: 2410.3, distance: 1882709, orbitalPeriod: 16.69, color: '#706050' }
    ]
  },
  {
    name: 'Saturn',
    type: 'planet',
    color: '#e4d4a4',
    radius: 58232,
    semiMajorAxis: 9.537,
    eccentricity: 0.0565,
    inclination: 2.49,
    orbitalPeriod: 10759.22,
    rotationPeriod: 10.66,
    axialTilt: 26.73,
    meanLongitudeJ2000: 49.94,
    hasRings: true,
    ringInner: 1.2,
    ringOuter: 2.3,
    ringColor: '#c9b896',
    mass: '5.683 × 10²⁶ kg',
    gravity: 10.44,
    escapeVelocity: 35.5,
    meanTemp: 134,
    atmosphere: '96% H₂, 3% He, traces of CH₄, NH₃',
    composition: 'Rocky core, metallic hydrogen, liquid hydrogen, gas atmosphere',
    discoveryInfo: 'Known since antiquity, rings discovered by Galileo in 1610',
    notableFacts: [
      'Least dense planet - would float in water',
      'Ring system spans 282,000 km but only 10m thick',
      'Has 146 known moons (as of 2023)',
      'Moon Titan has thick atmosphere and liquid methane lakes',
      'Hexagonal storm at north pole'
    ],
    moons: [
      { name: 'Titan', radius: 2574.7, distance: 1221870, orbitalPeriod: 15.95, color: '#d4a060' },
      { name: 'Rhea', radius: 763.8, distance: 527108, orbitalPeriod: 4.52, color: '#c0c0c0' },
      { name: 'Enceladus', radius: 252.1, distance: 237948, orbitalPeriod: 1.37, color: '#ffffff' }
    ]
  },
  {
    name: 'Uranus',
    type: 'planet',
    color: '#b4e4e4',
    radius: 25362,
    semiMajorAxis: 19.19,
    eccentricity: 0.0457,
    inclination: 0.77,
    orbitalPeriod: 30688.5,
    rotationPeriod: -17.24,
    axialTilt: 97.77,
    meanLongitudeJ2000: 313.23,
    hasRings: true,
    ringInner: 1.6,
    ringOuter: 2.0,
    ringColor: '#404040',
    mass: '8.681 × 10²⁵ kg',
    gravity: 8.87,
    escapeVelocity: 21.3,
    meanTemp: 76,
    atmosphere: '83% H₂, 15% He, 2% CH₄',
    composition: 'Rocky core, water-ammonia-methane ice mantle, hydrogen atmosphere',
    discoveryInfo: 'Discovered by William Herschel in 1781 - first planet found with telescope',
    notableFacts: [
      'Rotates on its side (98° axial tilt)',
      'Coldest planetary atmosphere (-224°C)',
      'Has 27 known moons named after Shakespeare characters',
      'Visited only by Voyager 2 in 1986',
      'Blue-green color from methane in atmosphere'
    ],
    moons: [
      { name: 'Titania', radius: 788.4, distance: 435910, orbitalPeriod: 8.71, color: '#a0a0a0' },
      { name: 'Oberon', radius: 761.4, distance: 583520, orbitalPeriod: 13.46, color: '#909090' }
    ]
  },
  {
    name: 'Neptune',
    type: 'planet',
    color: '#4b70dd',
    radius: 24622,
    semiMajorAxis: 30.07,
    eccentricity: 0.0113,
    inclination: 1.77,
    orbitalPeriod: 60182,
    rotationPeriod: 16.11,
    axialTilt: 28.32,
    meanLongitudeJ2000: 304.88,
    mass: '1.024 × 10²⁶ kg',
    gravity: 11.15,
    escapeVelocity: 23.5,
    meanTemp: 72,
    atmosphere: '80% H₂, 19% He, 1% CH₄',
    composition: 'Rocky core, water-ammonia-methane ice mantle, hydrogen atmosphere',
    discoveryInfo: 'Discovered 1846 by mathematical prediction - first planet found by calculation',
    notableFacts: [
      'Strongest winds in Solar System (2,100 km/h)',
      'Has 16 known moons including Triton',
      'Triton orbits backwards - likely captured',
      'Takes 165 Earth years to orbit the Sun',
      'Deep blue color from methane absorption'
    ],
    moons: [
      { name: 'Triton', radius: 1353.4, distance: 354759, orbitalPeriod: -5.88, color: '#d0c0b0' }
    ]
  },
  {
    name: 'Pluto',
    type: 'dwarf',
    color: '#c9b896',
    radius: 1188.3,
    semiMajorAxis: 39.48,
    eccentricity: 0.2488,
    inclination: 17.16,
    orbitalPeriod: 90560,
    rotationPeriod: -153.3,
    axialTilt: 122.53,
    meanLongitudeJ2000: 238.93,
    mass: '1.303 × 10²² kg',
    gravity: 0.62,
    escapeVelocity: 1.21,
    meanTemp: 44,
    atmosphere: 'Thin N₂, CH₄, CO (expands when closer to Sun)',
    composition: '70% rock, 30% water ice, nitrogen ice surface',
    discoveryInfo: 'Discovered by Clyde Tombaugh in 1930, visited by New Horizons in 2015',
    notableFacts: [
      'Reclassified as dwarf planet in 2006',
      'Has 5 known moons, Charon is half its size',
      'Heart-shaped nitrogen glacier (Tombaugh Regio)',
      'Orbit crosses inside Neptune\'s for 20 years each cycle',
      'Surface has mountains of water ice'
    ],
    moons: [
      { name: 'Charon', radius: 606, distance: 19591, orbitalPeriod: 6.39, color: '#808080' }
    ]
  },
  {
    name: 'Ceres',
    type: 'dwarf',
    color: '#8a8a8a',
    radius: 473,
    semiMajorAxis: 2.77,
    eccentricity: 0.0758,
    inclination: 10.59,
    orbitalPeriod: 1681.63,
    rotationPeriod: 9.07,
    axialTilt: 4,
    meanLongitudeJ2000: 80.0,
    mass: '9.384 × 10²⁰ kg',
    gravity: 0.28,
    escapeVelocity: 0.51,
    meanTemp: 168,
    atmosphere: 'Transient water vapor detected',
    composition: 'Rocky core, ice mantle, dusty clay surface',
    discoveryInfo: 'Discovered by Giuseppe Piazzi in 1801, visited by Dawn spacecraft 2015-2018',
    notableFacts: [
      'Largest object in the asteroid belt',
      'Contains 1/3 of asteroid belt\'s total mass',
      'Bright spots are sodium carbonate deposits',
      'May have subsurface ocean',
      'First asteroid discovered, later classified as dwarf planet'
    ]
  },
  {
    name: 'Eris',
    type: 'dwarf',
    color: '#e0e0e0',
    radius: 1163,
    semiMajorAxis: 67.67,
    eccentricity: 0.4407,
    inclination: 44.19,
    orbitalPeriod: 203830,
    rotationPeriod: 25.9,
    axialTilt: 78,
    meanLongitudeJ2000: 204.0,
    mass: '1.66 × 10²² kg',
    gravity: 0.82,
    escapeVelocity: 1.38,
    meanTemp: 42,
    atmosphere: 'Possible thin methane atmosphere',
    composition: 'Rocky core with methane and nitrogen ice surface',
    discoveryInfo: 'Discovered in 2005 by Mike Brown\'s team, triggered Pluto\'s reclassification',
    notableFacts: [
      'Most massive known dwarf planet',
      'Named after Greek goddess of discord',
      'Has one moon: Dysnomia',
      'Currently 96 AU from the Sun',
      'Takes 558 years to orbit the Sun'
    ]
  }
];

// Calculate orbital position based on real orbital mechanics (Kepler's equation)
function calculateOrbitalPosition(
  body: CelestialBody,
  daysSinceJ2000: number
): { x: number; y: number; z: number } {
  const { semiMajorAxis, eccentricity, inclination, orbitalPeriod, meanLongitudeJ2000 } = body;

  // Mean anomaly
  const meanMotion = 360 / orbitalPeriod;
  const meanAnomaly = ((meanLongitudeJ2000 + meanMotion * daysSinceJ2000) % 360) * Math.PI / 180;

  // Solve Kepler's equation for eccentric anomaly (Newton-Raphson iteration)
  let E = meanAnomaly;
  for (let i = 0; i < 10; i++) {
    E = E - (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
  }

  // True anomaly
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
  );

  // Distance from Sun
  const r = semiMajorAxis * (1 - eccentricity * Math.cos(E));

  // Position in orbital plane
  const xOrbital = r * Math.cos(trueAnomaly);
  const yOrbital = r * Math.sin(trueAnomaly);

  // Apply inclination
  const incRad = inclination * Math.PI / 180;
  const x = xOrbital * DISTANCE_SCALE;
  const y = yOrbital * Math.sin(incRad) * DISTANCE_SCALE;
  const z = yOrbital * Math.cos(incRad) * DISTANCE_SCALE;

  return { x, y, z };
}

// ============================================
// 3D COMPONENTS
// ============================================

function Sun({ onSelect }: { onSelect?: () => void }) {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001;
    }
    if (glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.setScalar(pulse);
    }
    if (coronaRef.current) {
      const coronaPulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      coronaRef.current.scale.setScalar(coronaPulse);
    }
  });

  const sunRadius = 0.15;

  return (
    <group>
      <mesh
        ref={sunRef}
        onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[sunRadius, 64, 64]} />
        <meshBasicMaterial color={hovered ? '#fffaf0' : '#fff5e0'} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[sunRadius * 1.15, 32, 32]} />
        <meshBasicMaterial color="#ffc000" transparent opacity={0.5} />
      </mesh>
      <mesh ref={coronaRef}>
        <sphereGeometry args={[sunRadius * 1.4, 32, 32]} />
        <meshBasicMaterial color="#ff8c00" transparent opacity={0.2} />
      </mesh>
      <pointLight intensity={2.5} distance={150} decay={0.1} color="#fff8e7" />
      <ambientLight intensity={0.1} />

      {hovered && (
        <Html position={[0, sunRadius + 0.1, 0]} center>
          <div className="text-[10px] whitespace-nowrap px-1.5 py-0.5 rounded bg-yellow-500/80 text-black font-medium cursor-pointer">
            Sun (click for info)
          </div>
        </Html>
      )}
    </group>
  );
}

function CelestialBodyMesh({
  body,
  daysSinceJ2000,
  showLabels,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBodyClick: _onBodyClick,
  onBodySelect
}: {
  body: CelestialBody;
  daysSinceJ2000: number;
  showLabels?: boolean;
  onBodyClick?: (name: string) => void;
  onBodySelect?: (body: CelestialBody) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const position = useMemo(() =>
    calculateOrbitalPosition(body, daysSinceJ2000),
    [body, daysSinceJ2000]
  );

  const visualRadius = Math.max(
    0.025,
    Math.log10(body.radius / 1000 + 1) * SIZE_SCALE * 1.0
  );

  useFrame(() => {
    if (meshRef.current && body.rotationPeriod) {
      const rotationSpeed = (2 * Math.PI) / (Math.abs(body.rotationPeriod) * 3600);
      meshRef.current.rotation.y += rotationSpeed * (body.rotationPeriod > 0 ? 1 : -1) * 10;
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh
        ref={meshRef}
        rotation={[0, 0, (body.axialTilt * Math.PI) / 180]}
        onClick={(e) => { e.stopPropagation(); onBodySelect?.(body); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[visualRadius, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : body.color}
          roughness={0.7}
          metalness={0.1}
          emissive={hovered ? body.color : '#000000'}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </mesh>

      {body.hasRings && (
        <mesh rotation={[Math.PI / 2, 0, (body.axialTilt * Math.PI) / 180]}>
          <ringGeometry args={[
            visualRadius * (body.ringInner || 1.2),
            visualRadius * (body.ringOuter || 2.3),
            64
          ]} />
          <meshBasicMaterial
            color={body.ringColor || '#c9b896'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {body.moons?.map((moon) => (
        <MoonMesh
          key={moon.name}
          moon={moon}
          parentRadius={visualRadius}
          daysSinceJ2000={daysSinceJ2000}
        />
      ))}

      {(showLabels || hovered) && (
        <Html position={[0, visualRadius + 0.12, 0]} center>
          <div
            className={`text-[9px] sm:text-[10px] whitespace-nowrap px-1.5 py-0.5 rounded select-none cursor-pointer ${
              body.type === 'dwarf'
                ? 'text-white/70 bg-black/50'
                : 'text-white bg-black/60'
            }`}
            onClick={() => onBodySelect?.(body)}
          >
            {body.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function MoonMesh({
  moon,
  parentRadius,
  daysSinceJ2000
}: {
  moon: MoonData;
  parentRadius: number;
  daysSinceJ2000: number;
}) {
  const moonRef = useRef<THREE.Mesh>(null);
  const orbitRadius = parentRadius * 2 + (moon.distance / 100000) * 0.3;
  const moonRadius = Math.max(0.008, parentRadius * 0.15);

  // Calculate moon position based on real orbital period
  // Use only the daysSinceJ2000 for position - no animation speed multiplier
  const angle = useMemo(() => {
    // Moons complete their orbit in moon.orbitalPeriod days
    // Scale by a visual factor since real-time would be imperceptible
    return (daysSinceJ2000 / Math.abs(moon.orbitalPeriod)) * Math.PI * 2;
  }, [daysSinceJ2000, moon.orbitalPeriod]);

  // Position is static based on simulation date - no per-frame animation
  const position = useMemo(() => ({
    x: Math.cos(angle) * orbitRadius,
    z: Math.sin(angle) * orbitRadius
  }), [angle, orbitRadius]);

  return (
    <mesh ref={moonRef} position={[position.x, 0, position.z]}>
      <sphereGeometry args={[moonRadius, 16, 16]} />
      <meshStandardMaterial color={moon.color} roughness={0.9} />
    </mesh>
  );
}

function OrbitPath({ body }: { body: CelestialBody }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const r = body.semiMajorAxis * (1 - body.eccentricity * body.eccentricity) /
                (1 + body.eccentricity * Math.cos(angle));

      const x = r * Math.cos(angle) * DISTANCE_SCALE;
      const incRad = body.inclination * Math.PI / 180;
      const y = r * Math.sin(angle) * Math.sin(incRad) * DISTANCE_SCALE;
      const z = r * Math.sin(angle) * Math.cos(incRad) * DISTANCE_SCALE;

      pts.push([x, y, z]);
    }
    return pts;
  }, [body]);

  return (
    <Line
      points={points}
      color={body.type === 'dwarf' ? '#404040' : '#ffffff'}
      transparent
      opacity={body.type === 'dwarf' ? 0.15 : 0.2}
      lineWidth={1}
    />
  );
}

// Seeded random number generator for deterministic asteroid positions
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Asteroid belt synced with simulatedDate
// Average orbital period ~4.6 years (typical main belt asteroid at ~2.7 AU)
// Using Kepler's third law: T² = a³ where a is in AU and T is in years
function AsteroidBelt({ daysSinceJ2000 }: { daysSinceJ2000: number }) {
  const asteroidsRef = useRef<THREE.Points>(null);

  // Pre-calculate asteroid orbital data (semi-major axis and initial angles)
  const asteroidData = useMemo(() => {
    const count = 2000;
    const data = [];

    for (let i = 0; i < count; i++) {
      // Semi-major axis between 2.2 and 3.2 AU (main asteroid belt)
      const semiMajorAxis = 2.2 + seededRandom(i * 3) * 1.0;
      // Orbital period in days (Kepler's third law: T = sqrt(a³) years)
      const orbitalPeriodDays = Math.sqrt(Math.pow(semiMajorAxis, 3)) * 365.25;
      // Initial angle (randomized)
      const initialAngle = seededRandom(i * 3 + 1) * Math.PI * 2;
      // Inclination
      const inclination = (seededRandom(i * 3 + 2) - 0.5) * 0.3;
      // Color shade
      const shade = 0.3 + seededRandom(i * 4) * 0.3;

      data.push({ semiMajorAxis, orbitalPeriodDays, initialAngle, inclination, shade });
    }

    return data;
  }, []);

  // Update positions based on current date
  const { positions, colors } = useMemo(() => {
    const count = asteroidData.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const { semiMajorAxis, orbitalPeriodDays, initialAngle, inclination, shade } = asteroidData[i];

      // Calculate current angle based on time
      const meanAnomaly = (daysSinceJ2000 / orbitalPeriodDays) * Math.PI * 2;
      const angle = initialAngle + meanAnomaly;

      positions[i * 3] = semiMajorAxis * Math.cos(angle) * DISTANCE_SCALE;
      positions[i * 3 + 1] = inclination * DISTANCE_SCALE;
      positions[i * 3 + 2] = semiMajorAxis * Math.sin(angle) * DISTANCE_SCALE;

      colors[i * 3] = shade;
      colors[i * 3 + 1] = shade * 0.9;
      colors[i * 3 + 2] = shade * 0.8;
    }

    return { positions, colors };
  }, [asteroidData, daysSinceJ2000]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={asteroidsRef} geometry={geometry}>
      <pointsMaterial size={0.02} vertexColors transparent opacity={0.6} />
    </points>
  );
}

// Kuiper Belt synced with simulatedDate
// Orbital periods range from ~200 years (30 AU) to ~500+ years (50 AU)
function KuiperBelt({ daysSinceJ2000 }: { daysSinceJ2000: number }) {
  // Pre-calculate Kuiper Belt object orbital data
  const kuiperData = useMemo(() => {
    const count = 1500;
    const data = [];

    for (let i = 0; i < count; i++) {
      // Semi-major axis between 30 and 50 AU (Kuiper Belt)
      const semiMajorAxis = 30 + seededRandom(i * 5 + 10000) * 20;
      // Orbital period in days (Kepler's third law)
      const orbitalPeriodDays = Math.sqrt(Math.pow(semiMajorAxis, 3)) * 365.25;
      // Initial angle
      const initialAngle = seededRandom(i * 5 + 10001) * Math.PI * 2;
      // Inclination (wider range than asteroid belt)
      const inclination = (seededRandom(i * 5 + 10002) - 0.5) * 0.5;
      // Color shade
      const shade = 0.4 + seededRandom(i * 5 + 10003) * 0.2;

      data.push({ semiMajorAxis, orbitalPeriodDays, initialAngle, inclination, shade });
    }

    return data;
  }, []);

  const { positions, colors } = useMemo(() => {
    const count = kuiperData.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const { semiMajorAxis, orbitalPeriodDays, initialAngle, inclination, shade } = kuiperData[i];

      // Calculate current angle based on time
      const meanAnomaly = (daysSinceJ2000 / orbitalPeriodDays) * Math.PI * 2;
      const angle = initialAngle + meanAnomaly;

      positions[i * 3] = semiMajorAxis * Math.cos(angle) * DISTANCE_SCALE;
      positions[i * 3 + 1] = inclination * DISTANCE_SCALE;
      positions[i * 3 + 2] = semiMajorAxis * Math.sin(angle) * DISTANCE_SCALE;

      colors[i * 3] = shade * 0.9;
      colors[i * 3 + 1] = shade;
      colors[i * 3 + 2] = shade * 1.1;
    }

    return { positions, colors };
  }, [kuiperData, daysSinceJ2000]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.4} />
    </points>
  );
}

// Custom OrbitControls wrapper that stops auto-rotation on user interaction
function CustomOrbitControls({ autoRotate, onInteraction }: { autoRotate: boolean; onInteraction: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      onInteraction();
    };

    controls.addEventListener('start', handleStart);
    return () => controls.removeEventListener('start', handleStart);
  }, [onInteraction]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={true}
      minDistance={0.5}
      maxDistance={150}
      autoRotate={autoRotate}
      autoRotateSpeed={0.1}
      maxPolarAngle={Math.PI * 0.9}
      minPolarAngle={Math.PI * 0.1}
      target={[0, 0, 0]}
    />
  );
}

function Scene({
  showLabels,
  simulatedDate,
  onBodySelect,
  onSunSelect,
  autoRotate,
  onInteraction
}: {
  showLabels?: boolean;
  simulatedDate: Date;
  onBodySelect?: (body: CelestialBody) => void;
  onSunSelect?: () => void;
  autoRotate: boolean;
  onInteraction: () => void;
}) {
  const daysSinceJ2000 = (simulatedDate.getTime() - J2000) / (1000 * 60 * 60 * 24);

  return (
    <>
      <Stars radius={200} depth={100} count={8000} factor={4} saturation={0} fade />
      <Sun onSelect={onSunSelect} />
      <AsteroidBelt daysSinceJ2000={daysSinceJ2000} />
      <KuiperBelt daysSinceJ2000={daysSinceJ2000} />

      {celestialBodies.map((body) => (
        <group key={body.name}>
          <OrbitPath body={body} />
          <CelestialBodyMesh
            body={body}
            daysSinceJ2000={daysSinceJ2000}
            showLabels={showLabels}
            onBodySelect={onBodySelect}
          />
        </group>
      ))}

      <CustomOrbitControls autoRotate={autoRotate} onInteraction={onInteraction} />
    </>
  );
}

// ============================================
// INFO PANEL COMPONENT
// ============================================

function InfoPanel({
  selectedBody,
  showSunInfo,
  onClose,
  onNavigate
}: {
  selectedBody: CelestialBody | null;
  showSunInfo: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}) {
  if (!selectedBody && !showSunInfo) return null;

  const allBodies = [{ name: 'Sun', type: 'star' }, ...celestialBodies];
  const _currentIndex = showSunInfo ? 0 : allBodies.findIndex(b => b.name === selectedBody?.name);
  void _currentIndex; // Used for navigation context

  if (showSunInfo) {
    return (
      <div className="absolute inset-x-2 sm:inset-x-auto sm:right-2 top-2 sm:top-auto sm:bottom-2 sm:w-72 md:w-80 bg-black/90 backdrop-blur-md rounded-lg border border-yellow-500/30 text-white overflow-hidden z-20 max-h-[50vh] sm:max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-2 sm:p-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('prev')} className="p-1 hover:bg-white/10 rounded" title="Previous">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-base sm:text-lg text-yellow-400">The Sun</h3>
            <button onClick={() => onNavigate('next')} className="p-1 hover:bg-white/10 rounded" title="Next">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-2 sm:p-3 overflow-y-auto text-[11px] sm:text-xs space-y-2 sm:space-y-3">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <div className="bg-white/5 rounded p-1.5 sm:p-2">
              <div className="text-white/50 text-[9px] sm:text-[10px]">Type</div>
              <div className="font-medium">{sunData.spectralType}</div>
            </div>
            <div className="bg-white/5 rounded p-1.5 sm:p-2">
              <div className="text-white/50 text-[9px] sm:text-[10px]">Radius</div>
              <div className="font-medium">{sunData.radius.toLocaleString()} km</div>
            </div>
            <div className="bg-white/5 rounded p-1.5 sm:p-2">
              <div className="text-white/50 text-[9px] sm:text-[10px]">Mass</div>
              <div className="font-medium">{sunData.mass}</div>
            </div>
            <div className="bg-white/5 rounded p-1.5 sm:p-2">
              <div className="text-white/50 text-[9px] sm:text-[10px]">Surface Temp</div>
              <div className="font-medium">{sunData.surfaceTemp.toLocaleString()} K</div>
            </div>
            <div className="bg-white/5 rounded p-1.5 sm:p-2">
              <div className="text-white/50 text-[9px] sm:text-[10px]">Core Temp</div>
              <div className="font-medium">~15 million K</div>
            </div>
            <div className="bg-white/5 rounded p-1.5 sm:p-2">
              <div className="text-white/50 text-[9px] sm:text-[10px]">Age</div>
              <div className="font-medium">{sunData.age}</div>
            </div>
          </div>
          <div className="bg-white/5 rounded p-1.5 sm:p-2">
            <div className="text-white/50 text-[9px] sm:text-[10px] mb-1">Composition</div>
            <div>{sunData.composition}</div>
          </div>
          <div>
            <div className="text-white/50 text-[9px] sm:text-[10px] mb-1">Notable Facts</div>
            <ul className="space-y-1">
              {sunData.notableFacts.map((fact, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-yellow-400">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[9px] sm:text-[10px] text-white/40 pt-1 sm:pt-2 border-t border-white/10">
            Source: NASA Sun Fact Sheet
          </div>
        </div>
      </div>
    );
  }

  if (!selectedBody) return null;

  return (
    <div className="absolute inset-x-2 sm:inset-x-auto sm:right-2 top-2 sm:top-auto sm:bottom-2 sm:w-72 md:w-80 bg-black/90 backdrop-blur-md rounded-lg border border-white/20 text-white overflow-hidden z-20 max-h-[50vh] sm:max-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-white/10 shrink-0" style={{ borderColor: selectedBody.color + '40' }}>
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('prev')} className="p-1 hover:bg-white/10 rounded" title="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedBody.color }} />
            <h3 className="font-bold text-base sm:text-lg">{selectedBody.name}</h3>
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-white/10 rounded capitalize">{selectedBody.type}</span>
          </div>
          <button onClick={() => onNavigate('next')} className="p-1 hover:bg-white/10 rounded" title="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-2 sm:p-3 overflow-y-auto text-[11px] sm:text-xs space-y-2 sm:space-y-3">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <div className="bg-white/5 rounded p-1.5 sm:p-2">
            <div className="text-white/50 text-[9px] sm:text-[10px]">Radius</div>
            <div className="font-medium">{selectedBody.radius.toLocaleString()} km</div>
          </div>
          <div className="bg-white/5 rounded p-1.5 sm:p-2">
            <div className="text-white/50 text-[9px] sm:text-[10px]">Mass</div>
            <div className="font-medium">{selectedBody.mass}</div>
          </div>
          <div className="bg-white/5 rounded p-1.5 sm:p-2">
            <div className="text-white/50 text-[9px] sm:text-[10px]">Gravity</div>
            <div className="font-medium">{selectedBody.gravity} m/s²</div>
          </div>
          <div className="bg-white/5 rounded p-1.5 sm:p-2">
            <div className="text-white/50 text-[9px] sm:text-[10px]">Escape Velocity</div>
            <div className="font-medium">{selectedBody.escapeVelocity} km/s</div>
          </div>
          <div className="bg-white/5 rounded p-1.5 sm:p-2">
            <div className="text-white/50 text-[9px] sm:text-[10px]">Distance from Sun</div>
            <div className="font-medium">{selectedBody.semiMajorAxis} AU</div>
          </div>
          <div className="bg-white/5 rounded p-1.5 sm:p-2">
            <div className="text-white/50 text-[9px] sm:text-[10px]">Orbital Period</div>
            <div className="font-medium">{selectedBody.orbitalPeriod.toLocaleString()} days</div>
          </div>
          <div className="bg-white/5 rounded p-1.5 sm:p-2">
            <div className="text-white/50 text-[9px] sm:text-[10px]">Day Length</div>
            <div className="font-medium">{Math.abs(selectedBody.rotationPeriod).toFixed(1)} hrs</div>
          </div>
          <div className="bg-white/5 rounded p-1.5 sm:p-2">
            <div className="text-white/50 text-[9px] sm:text-[10px]">Mean Temp</div>
            <div className="font-medium">{selectedBody.meanTemp} K ({(selectedBody.meanTemp - 273).toFixed(0)}°C)</div>
          </div>
        </div>
        <div className="bg-white/5 rounded p-1.5 sm:p-2">
          <div className="text-white/50 text-[9px] sm:text-[10px] mb-1">Atmosphere</div>
          <div>{selectedBody.atmosphere}</div>
        </div>
        <div className="bg-white/5 rounded p-1.5 sm:p-2">
          <div className="text-white/50 text-[9px] sm:text-[10px] mb-1">Composition</div>
          <div>{selectedBody.composition}</div>
        </div>
        {selectedBody.moons && selectedBody.moons.length > 0 && (
          <div className="bg-white/5 rounded p-1.5 sm:p-2">
            <div className="text-white/50 text-[9px] sm:text-[10px] mb-1">Major Moons</div>
            <div>{selectedBody.moons.map(m => m.name).join(', ')}</div>
          </div>
        )}
        <div>
          <div className="text-white/50 text-[9px] sm:text-[10px] mb-1">Notable Facts</div>
          <ul className="space-y-1">
            {selectedBody.notableFacts.map((fact, i) => (
              <li key={i} className="flex gap-1.5">
                <span style={{ color: selectedBody.color }}>•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Earth Visit Button */}
        {selectedBody.name === 'Earth' && (
          <Link
            href="/solar-system/earth"
            className="block mt-2 sm:mt-3"
          >
            <div className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px]">
              <div className="relative flex items-center justify-between gap-3 rounded-[7px] bg-black/80 px-3 sm:px-4 py-2.5 sm:py-3 transition-all group-hover:bg-black/60">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-white">Visit Earth</div>
                    <div className="text-[9px] sm:text-[10px] text-white/60">Explore our home planet</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </div>
              {/* Animated gradient border */}
              <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 opacity-50 blur-sm" />
            </div>
          </Link>
        )}

        <div className="text-[9px] sm:text-[10px] text-white/40 pt-1 sm:pt-2 border-t border-white/10">
          {selectedBody.discoveryInfo}
        </div>
        <div className="text-[9px] sm:text-[10px] text-white/30">
          Source: NASA Planetary Fact Sheets
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface SolarSystemProps {
  className?: string;
  showExpandButton?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
  showControls?: boolean;
}

export function SolarSystem({
  className = '',
  showExpandButton = true,
  showLabels = false,
  interactive: _interactive = true,
  showControls = true
}: SolarSystemProps) {
  void _interactive; // Reserved for future use
  const [simulatedDate, setSimulatedDate] = useState(new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(0);
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [showSunInfo, setShowSunInfo] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Real-time update
  useEffect(() => {
    if (isPaused) return;

    if (timeScale === 0) {
      const interval = setInterval(() => {
        setSimulatedDate(new Date());
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setSimulatedDate(prev => new Date(prev.getTime() + 1000 * 60 * 60 * timeScale));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPaused, timeScale]);

  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setAutoRotate(false);
    }
  }, [hasInteracted]);

  const handleBodySelect = useCallback((body: CelestialBody) => {
    setSelectedBody(body);
    setShowSunInfo(false);
  }, []);

  const handleSunSelect = useCallback(() => {
    setShowSunInfo(true);
    setSelectedBody(null);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setSelectedBody(null);
    setShowSunInfo(false);
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    const allBodies = celestialBodies;
    const currentIndex = showSunInfo ? -1 : allBodies.findIndex(b => b.name === selectedBody?.name);

    if (direction === 'next') {
      if (showSunInfo) {
        setShowSunInfo(false);
        setSelectedBody(allBodies[0]);
      } else if (currentIndex < allBodies.length - 1) {
        setSelectedBody(allBodies[currentIndex + 1]);
      } else {
        setShowSunInfo(true);
        setSelectedBody(null);
      }
    } else {
      if (showSunInfo) {
        setShowSunInfo(false);
        setSelectedBody(allBodies[allBodies.length - 1]);
      } else if (currentIndex > 0) {
        setSelectedBody(allBodies[currentIndex - 1]);
      } else {
        setShowSunInfo(true);
        setSelectedBody(null);
      }
    }
  }, [selectedBody, showSunInfo]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 2, 4], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #000000, #0a0a1a)' }}
        gl={{ antialias: true }}
      >
        <Scene
          showLabels={showLabels}
          simulatedDate={simulatedDate}
          onBodySelect={handleBodySelect}
          onSunSelect={handleSunSelect}
          autoRotate={autoRotate}
          onInteraction={handleInteraction}
        />
      </Canvas>

      {/* Time display & controls */}
      {showControls && (
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono">
            <div className="text-[8px] sm:text-[9px] text-green-400/80 uppercase tracking-wider mb-0.5">Real-Time</div>
            <div className="text-xs sm:text-sm font-semibold">{formatDate(simulatedDate)}</div>
            <div className="text-white/70 text-[10px] sm:text-xs">{formatTime(simulatedDate)} UTC</div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="bg-black/80 backdrop-blur-sm text-white p-1.5 rounded-lg hover:bg-black/90 transition-colors"
              title={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Pause className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
            </button>
            <select
              value={timeScale}
              onChange={(e) => setTimeScale(Number(e.target.value))}
              className="bg-black/80 backdrop-blur-sm text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-1.5 rounded-lg border-0 outline-none cursor-pointer"
            >
              <option value={0}>Real Time</option>
              <option value={1}>1 hr/s</option>
              <option value={24}>1 day/s</option>
              <option value={168}>1 week/s</option>
              <option value={720}>1 month/s</option>
            </select>
          </div>

          {/* Info button */}
          <button
            onClick={() => { setShowSunInfo(true); setSelectedBody(null); }}
            className="bg-black/80 backdrop-blur-sm text-white p-1.5 rounded-lg hover:bg-black/90 transition-colors flex items-center gap-1 text-[9px] sm:text-[10px]"
          >
            <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Planet Info</span>
          </button>
        </div>
      )}

      {/* Info Panel */}
      <InfoPanel
        selectedBody={selectedBody}
        showSunInfo={showSunInfo}
        onClose={handleCloseInfo}
        onNavigate={handleNavigate}
      />

      {/* Expand button */}
      {showExpandButton && (
        <Link href="/solar-system" className="absolute bottom-2 right-2">
          <Button variant="secondary" size="sm" className="gap-1.5 bg-black/80 hover:bg-black/90 text-white border-0 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-auto">
            <Expand className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Explore</span>
          </Button>
        </Link>
      )}

      {/* Interaction hint */}
      {!hasInteracted && (
        <div className="absolute bottom-2 left-2 bg-black/60 text-white/60 text-[9px] sm:text-[10px] px-2 py-1 rounded">
          Click & drag to explore • Scroll to zoom • Click planets for info
        </div>
      )}
    </div>
  );
}
