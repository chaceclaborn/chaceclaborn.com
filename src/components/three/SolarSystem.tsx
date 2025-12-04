'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Planet data with real relative sizes (scaled for visibility)
const planets = [
  { name: 'Mercury', color: '#8c7853', size: 0.15, distance: 2.5, speed: 4.15, tilt: 0.03 },
  { name: 'Venus', color: '#ffc649', size: 0.35, distance: 3.5, speed: 1.62, tilt: 177.4 },
  { name: 'Earth', color: '#6b93d6', size: 0.4, distance: 5, speed: 1, tilt: 23.4, hasMoon: true },
  { name: 'Mars', color: '#c1440e', size: 0.25, distance: 6.5, speed: 0.53, tilt: 25.2 },
  { name: 'Jupiter', color: '#d8ca9d', size: 1.2, distance: 10, speed: 0.084, tilt: 3.1 },
  { name: 'Saturn', color: '#f4d59e', size: 1, distance: 14, speed: 0.034, tilt: 26.7, hasRings: true },
  { name: 'Uranus', color: '#d1e7e7', size: 0.6, distance: 18, speed: 0.012, tilt: 97.8 },
  { name: 'Neptune', color: '#5b5ddf', size: 0.55, distance: 22, speed: 0.006, tilt: 28.3 },
];

function Sun({ speedMultiplier }: { speedMultiplier: number }) {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.002 * speedMultiplier;
    }
  });

  return (
    <mesh ref={sunRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial color="#fdb813" />
      <pointLight intensity={2} distance={100} decay={0.5} />
    </mesh>
  );
}

function Planet({
  name,
  color,
  size,
  distance,
  speed,
  tilt,
  hasMoon,
  hasRings,
  showLabels,
  onEarthClick,
  speedMultiplier
}: {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  tilt: number;
  hasMoon?: boolean;
  hasRings?: boolean;
  showLabels?: boolean;
  onEarthClick?: () => void;
  speedMultiplier: number;
}) {
  const planetRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const isEarth = name === 'Earth';

  useFrame((state) => {
    if (planetRef.current) {
      const time = state.clock.getElapsedTime() * speed * 0.1 * speedMultiplier;
      planetRef.current.position.x = Math.cos(time) * distance;
      planetRef.current.position.z = Math.sin(time) * distance;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * speedMultiplier;
    }
    if (moonRef.current) {
      const moonTime = state.clock.getElapsedTime() * 2 * speedMultiplier;
      moonRef.current.position.x = Math.cos(moonTime) * (size + 0.4);
      moonRef.current.position.z = Math.sin(moonTime) * (size + 0.4);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (isEarth && onEarthClick) {
      e.stopPropagation();
      onEarthClick();
    }
  };

  return (
    <group ref={planetRef}>
      <mesh
        ref={meshRef}
        rotation={[0, 0, (tilt * Math.PI) / 180]}
        onClick={handleClick}
        onPointerOver={() => isEarth && setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={hovered && isEarth ? '#8ab3e8' : color}
          roughness={0.8}
          emissive={hovered && isEarth ? '#4a90d9' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      {/* Label positioned outside the rotating mesh so it doesn't spin */}
      {showLabels && (
        <Html position={[0, size + 0.3, 0]} center>
          <span
            className={`text-xs whitespace-nowrap px-1.5 py-0.5 rounded ${
              isEarth
                ? 'text-white bg-primary/70 cursor-pointer hover:bg-primary'
                : 'text-white/70 bg-black/50'
            }`}
            onClick={isEarth ? onEarthClick : undefined}
            style={{ cursor: isEarth ? 'pointer' : 'default' }}
          >
            {name} {isEarth && '(Click)'}
          </span>
        </Html>
      )}
      {isEarth && hovered && !showLabels && (
        <Html position={[0, size + 0.3, 0]} center>
          <span
            className="text-xs text-white whitespace-nowrap bg-primary/70 px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary"
            onClick={onEarthClick}
          >
            Click to explore
          </span>
        </Html>
      )}
      {hasRings && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.2, size * 2, 64]} />
          <meshBasicMaterial color="#c9b896" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}
      {hasMoon && (
        <mesh ref={moonRef}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      )}
    </group>
  );
}

function OrbitRing({ distance }: { distance: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[distance - 0.02, distance + 0.02, 128]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Scene({
  showLabels = false,
  interactive = true,
  onEarthClick,
  speedMultiplier
}: {
  showLabels?: boolean;
  interactive?: boolean;
  onEarthClick?: () => void;
  speedMultiplier: number;
}) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={speedMultiplier} />
      <Sun speedMultiplier={speedMultiplier} />
      {planets.map((planet) => (
        <group key={planet.name}>
          <OrbitRing distance={planet.distance} />
          <Planet {...planet} showLabels={showLabels} onEarthClick={onEarthClick} speedMultiplier={speedMultiplier} />
        </group>
      ))}
      {interactive && (
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={50}
          autoRotate
          autoRotateSpeed={0.3 * speedMultiplier}
        />
      )}
    </>
  );
}

interface SolarSystemProps {
  className?: string;
  showExpandButton?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
  speedMultiplier?: number;
}

function SolarSystemInner({
  showLabels,
  interactive,
  speedMultiplier
}: {
  showLabels: boolean;
  interactive: boolean;
  speedMultiplier: number;
}) {
  const router = useRouter();

  const handleEarthClick = () => {
    router.push('/solar-system/earth');
  };

  return (
    <Scene
      showLabels={showLabels}
      interactive={interactive}
      onEarthClick={handleEarthClick}
      speedMultiplier={speedMultiplier}
    />
  );
}

export function SolarSystem({
  className = '',
  showExpandButton = true,
  showLabels = false,
  interactive = true,
  speedMultiplier = 1
}: SolarSystemProps) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 15, 25], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <SolarSystemInner showLabels={showLabels} interactive={interactive} speedMultiplier={speedMultiplier} />
      </Canvas>
      {showExpandButton && (
        <Link href="/solar-system" className="absolute bottom-4 right-4">
          <Button variant="secondary" size="sm" className="gap-2 bg-background/80 backdrop-blur">
            <Expand className="h-4 w-4" />
            Explore
          </Button>
        </Link>
      )}
    </div>
  );
}
