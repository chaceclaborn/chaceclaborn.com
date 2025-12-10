'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Ring } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Expand, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================
// SCIENTIFIC DATA - All values based on NASA data
// ============================================

// J2000 Epoch: January 1, 2000, 12:00 TT
const J2000 = new Date('2000-01-01T12:00:00Z').getTime();

// Astronomical Unit in km (for reference)
const AU_KM = 149597870.7;

// Scale factors for visualization (not to true scale - would be invisible)
const DISTANCE_SCALE = 1; // 1 AU = 1 unit
const SIZE_SCALE = 0.02; // Planet sizes scaled for visibility
const SUN_SCALE = 0.15; // Sun scaled down more

// Orbital elements at J2000 epoch (semi-major axis in AU, period in Earth days)
interface CelestialBody {
  name: string;
  type: 'planet' | 'dwarf' | 'asteroid' | 'moon';
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
  parent?: string;
}

interface MoonData {
  name: string;
  radius: number;
  distance: number; // km from parent
  orbitalPeriod: number; // days
  color: string;
}

// Real planetary data from NASA
const celestialBodies: CelestialBody[] = [
  // Inner Planets
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
    rotationPeriod: -5832.5, // Retrograde
    axialTilt: 177.4,
    meanLongitudeJ2000: 181.98,
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
    moons: [
      { name: 'Phobos', radius: 11.1, distance: 9376, orbitalPeriod: 0.32, color: '#8a7a6a' },
      { name: 'Deimos', radius: 6.2, distance: 23458, orbitalPeriod: 1.26, color: '#9a8a7a' }
    ]
  },
  // Gas Giants
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
    moons: [
      { name: 'Titan', radius: 2574.7, distance: 1221870, orbitalPeriod: 15.95, color: '#d4a060' },
      { name: 'Rhea', radius: 763.8, distance: 527108, orbitalPeriod: 4.52, color: '#c0c0c0' },
      { name: 'Enceladus', radius: 252.1, distance: 237948, orbitalPeriod: 1.37, color: '#ffffff' }
    ]
  },
  // Ice Giants
  {
    name: 'Uranus',
    type: 'planet',
    color: '#b4e4e4',
    radius: 25362,
    semiMajorAxis: 19.19,
    eccentricity: 0.0457,
    inclination: 0.77,
    orbitalPeriod: 30688.5,
    rotationPeriod: -17.24, // Retrograde
    axialTilt: 97.77,
    meanLongitudeJ2000: 313.23,
    hasRings: true,
    ringInner: 1.6,
    ringOuter: 2.0,
    ringColor: '#404040',
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
    moons: [
      { name: 'Triton', radius: 1353.4, distance: 354759, orbitalPeriod: -5.88, color: '#d0c0b0' }
    ]
  },
  // Dwarf Planets
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
  },
];

// Calculate orbital position based on real orbital mechanics
function calculateOrbitalPosition(
  body: CelestialBody,
  daysSinceJ2000: number
): { x: number; y: number; z: number } {
  const { semiMajorAxis, eccentricity, inclination, orbitalPeriod, meanLongitudeJ2000 } = body;

  // Mean anomaly
  const meanMotion = 360 / orbitalPeriod; // degrees per day
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
// COMPONENTS
// ============================================

function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001;
    }
    if (glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const sunRadius = 696340 * SUN_SCALE * SIZE_SCALE;

  return (
    <group>
      {/* Sun core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[sunRadius, 64, 64]} />
        <meshBasicMaterial color="#fff5e0" />
      </mesh>
      {/* Sun glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[sunRadius * 1.2, 32, 32]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.3} />
      </mesh>
      {/* Sun light */}
      <pointLight intensity={2} distance={100} decay={0.1} color="#fff8e7" />
      <ambientLight intensity={0.08} />
    </group>
  );
}

function CelestialBodyMesh({
  body,
  daysSinceJ2000,
  showLabels,
  onBodyClick,
  isHighlighted
}: {
  body: CelestialBody;
  daysSinceJ2000: number;
  showLabels?: boolean;
  onBodyClick?: (name: string) => void;
  isHighlighted?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const position = useMemo(() =>
    calculateOrbitalPosition(body, daysSinceJ2000),
    [body, daysSinceJ2000]
  );

  // Scale radius for visibility (logarithmic scaling for better visual)
  const visualRadius = Math.max(
    0.02,
    Math.log10(body.radius / 1000 + 1) * SIZE_SCALE * 0.8
  );

  useFrame(() => {
    if (meshRef.current && body.rotationPeriod) {
      const rotationSpeed = (2 * Math.PI) / (Math.abs(body.rotationPeriod) * 3600);
      meshRef.current.rotation.y += rotationSpeed * (body.rotationPeriod > 0 ? 1 : -1) * 10;
    }
  });

  const isClickable = body.name === 'Earth';

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Planet mesh */}
      <mesh
        ref={meshRef}
        rotation={[0, 0, (body.axialTilt * Math.PI) / 180]}
        onClick={(e) => {
          if (isClickable && onBodyClick) {
            e.stopPropagation();
            onBodyClick(body.name);
          }
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[visualRadius, 32, 32]} />
        <meshStandardMaterial
          color={hovered && isClickable ? '#8ab3e8' : body.color}
          roughness={0.7}
          metalness={0.1}
          emissive={hovered && isClickable ? '#4a90d9' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Rings for Saturn/Uranus */}
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

      {/* Moons */}
      {body.moons?.map((moon) => (
        <MoonMesh
          key={moon.name}
          moon={moon}
          parentRadius={visualRadius}
          daysSinceJ2000={daysSinceJ2000}
        />
      ))}

      {/* Label */}
      {(showLabels || hovered) && (
        <Html position={[0, visualRadius + 0.15, 0]} center>
          <div
            className={`text-[10px] whitespace-nowrap px-1.5 py-0.5 rounded select-none ${
              isClickable
                ? 'text-white bg-blue-600/80 cursor-pointer hover:bg-blue-500'
                : body.type === 'dwarf'
                ? 'text-white/60 bg-black/40'
                : 'text-white/80 bg-black/50'
            }`}
            onClick={() => isClickable && onBodyClick?.(body.name)}
          >
            {body.name}
            {isClickable && ' →'}
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

  // Scale moon orbit for visibility
  const orbitRadius = parentRadius * 2 + (moon.distance / 100000) * 0.3;
  const moonRadius = Math.max(0.008, parentRadius * 0.15);

  useFrame((state) => {
    if (moonRef.current) {
      const angle = (daysSinceJ2000 / moon.orbitalPeriod) * Math.PI * 2 + state.clock.elapsedTime * 0.5;
      moonRef.current.position.x = Math.cos(angle) * orbitRadius;
      moonRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[moonRadius, 16, 16]} />
      <meshStandardMaterial color={moon.color} roughness={0.9} />
    </mesh>
  );
}

function OrbitPath({ body }: { body: CelestialBody }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const r = body.semiMajorAxis * (1 - body.eccentricity * body.eccentricity) /
                (1 + body.eccentricity * Math.cos(angle));

      const x = r * Math.cos(angle) * DISTANCE_SCALE;
      const incRad = body.inclination * Math.PI / 180;
      const y = r * Math.sin(angle) * Math.sin(incRad) * DISTANCE_SCALE;
      const z = r * Math.sin(angle) * Math.cos(incRad) * DISTANCE_SCALE;

      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [body]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color={body.type === 'dwarf' ? '#404040' : '#ffffff'}
        transparent
        opacity={body.type === 'dwarf' ? 0.15 : 0.2}
      />
    </line>
  );
}

function AsteroidBelt({ daysSinceJ2000 }: { daysSinceJ2000: number }) {
  const asteroidsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Asteroid belt between Mars and Jupiter (2.2 - 3.2 AU)
      const r = 2.2 + Math.random() * 1.0;
      const angle = Math.random() * Math.PI * 2;
      const inclination = (Math.random() - 0.5) * 0.3;

      positions[i * 3] = r * Math.cos(angle) * DISTANCE_SCALE;
      positions[i * 3 + 1] = inclination * DISTANCE_SCALE;
      positions[i * 3 + 2] = r * Math.sin(angle) * DISTANCE_SCALE;

      // Grayish-brown colors
      const shade = 0.3 + Math.random() * 0.3;
      colors[i * 3] = shade;
      colors[i * 3 + 1] = shade * 0.9;
      colors[i * 3 + 2] = shade * 0.8;
    }

    return { positions, colors };
  }, []);

  useFrame(() => {
    if (asteroidsRef.current) {
      asteroidsRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <points ref={asteroidsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} vertexColors transparent opacity={0.6} />
    </points>
  );
}

function KuiperBelt({ daysSinceJ2000 }: { daysSinceJ2000: number }) {
  const beltRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Kuiper belt (30 - 50 AU)
      const r = 30 + Math.random() * 20;
      const angle = Math.random() * Math.PI * 2;
      const inclination = (Math.random() - 0.5) * 0.5;

      positions[i * 3] = r * Math.cos(angle) * DISTANCE_SCALE;
      positions[i * 3 + 1] = inclination * DISTANCE_SCALE;
      positions[i * 3 + 2] = r * Math.sin(angle) * DISTANCE_SCALE;

      // Icy blue-gray colors
      const shade = 0.4 + Math.random() * 0.2;
      colors[i * 3] = shade * 0.9;
      colors[i * 3 + 1] = shade;
      colors[i * 3 + 2] = shade * 1.1;
    }

    return { positions, colors };
  }, []);

  return (
    <points ref={beltRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.4} />
    </points>
  );
}

function Scene({
  showLabels = false,
  interactive = true,
  onBodyClick,
  simulatedDate,
  isPaused
}: {
  showLabels?: boolean;
  interactive?: boolean;
  onBodyClick?: (name: string) => void;
  simulatedDate: Date;
  isPaused: boolean;
}) {
  const daysSinceJ2000 = (simulatedDate.getTime() - J2000) / (1000 * 60 * 60 * 24);

  return (
    <>
      <Stars radius={200} depth={100} count={8000} factor={4} saturation={0} fade />
      <Sun />
      <AsteroidBelt daysSinceJ2000={daysSinceJ2000} />
      <KuiperBelt daysSinceJ2000={daysSinceJ2000} />

      {celestialBodies.map((body) => (
        <group key={body.name}>
          <OrbitPath body={body} />
          <CelestialBodyMesh
            body={body}
            daysSinceJ2000={daysSinceJ2000}
            showLabels={showLabels}
            onBodyClick={onBodyClick}
          />
        </group>
      ))}

      {interactive && (
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={2}
          maxDistance={100}
          autoRotate={!isPaused}
          autoRotateSpeed={0.2}
          maxPolarAngle={Math.PI * 0.85}
          minPolarAngle={Math.PI * 0.15}
        />
      )}
    </>
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
  interactive = true,
  showControls = true
}: SolarSystemProps) {
  const router = useRouter();
  const [simulatedDate, setSimulatedDate] = useState(new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(0); // 0 = real time, higher = accelerated

  // Update simulation time - real time when timeScale is 0
  useEffect(() => {
    if (isPaused) return;

    if (timeScale === 0) {
      // Real time - just update to current date
      const interval = setInterval(() => {
        setSimulatedDate(new Date());
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // Accelerated time
      const interval = setInterval(() => {
        setSimulatedDate(prev => {
          const newDate = new Date(prev.getTime() + 1000 * 60 * 60 * timeScale);
          return newDate;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPaused, timeScale]);

  const handleBodyClick = (name: string) => {
    if (name === 'Earth') {
      router.push('/solar-system/earth');
    }
  };

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
      hour12: false
    });
  };

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 4, 8], fov: 55 }}
        style={{ background: 'linear-gradient(to bottom, #000000, #0a0a1a)' }}
        gl={{ antialias: true }}
      >
        <Scene
          showLabels={showLabels}
          interactive={interactive}
          onBodyClick={handleBodyClick}
          simulatedDate={simulatedDate}
          isPaused={isPaused}
        />
      </Canvas>

      {/* Time display */}
      {showControls && (
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-mono">
            <div className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Simulated Date</div>
            <div className="text-sm font-semibold">{formatDate(simulatedDate)}</div>
            <div className="text-white/70">{formatTime(simulatedDate)} UTC</div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="bg-black/70 backdrop-blur-sm text-white p-1.5 rounded-lg hover:bg-black/90 transition-colors"
              title={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
            <select
              value={timeScale}
              onChange={(e) => setTimeScale(Number(e.target.value))}
              className="bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1.5 rounded-lg border-0 outline-none cursor-pointer"
            >
              <option value={0}>Real Time</option>
              <option value={1}>1 hr/s</option>
              <option value={24}>1 day/s</option>
              <option value={168}>1 week/s</option>
              <option value={720}>1 month/s</option>
            </select>
          </div>
        </div>
      )}

      {/* Expand button */}
      {showExpandButton && (
        <Link href="/solar-system" className="absolute bottom-3 right-3">
          <Button variant="secondary" size="sm" className="gap-2 bg-black/70 hover:bg-black/90 text-white border-0">
            <Expand className="h-3.5 w-3.5" />
            <span className="text-xs">Explore</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
