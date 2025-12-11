import * as satellite from 'satellite.js';

export interface TLEData {
  name: string;
  line1: string;
  line2: string;
  noradId?: number;
  category?: string;
}

export interface SatellitePosition {
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  x: number;
  y: number;
  z: number;
  velocity: number;
  noradId?: number;
  category?: string;
}

export type TLESourceKey =
  | 'stations'
  | 'starlink'
  | 'oneweb'
  | 'gps-ops'
  | 'glonass'
  | 'galileo'
  | 'beidou'
  | 'iridium-next'
  | 'geo'
  | 'weather';

// Category display information
export const SATELLITE_CATEGORIES = {
  stations: { name: 'Space Stations', color: '#ff6b6b', icon: '🛸' },
  starlink: { name: 'Starlink', color: '#00bfff', icon: '📡' },
  oneweb: { name: 'OneWeb', color: '#9b59b6', icon: '📡' },
  'gps-ops': { name: 'GPS', color: '#f1c40f', icon: '🛰️' },
  glonass: { name: 'GLONASS', color: '#e74c3c', icon: '🛰️' },
  galileo: { name: 'Galileo', color: '#3498db', icon: '🛰️' },
  beidou: { name: 'BeiDou', color: '#e67e22', icon: '🛰️' },
  'iridium-next': { name: 'Iridium NEXT', color: '#1abc9c', icon: '📱' },
  geo: { name: 'Geostationary', color: '#ff4488', icon: '📺' },
  weather: { name: 'Weather', color: '#74b9ff', icon: '🌤️' },
} as const;

// Calculate satellite position from TLE at given time
export function calculatePosition(tle: TLEData, date: Date = new Date()): SatellitePosition | null {
  try {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);

    if (satrec.error !== 0) {
      return null;
    }

    const positionAndVelocity = satellite.propagate(satrec, date);

    if (!positionAndVelocity || !positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
      return null;
    }

    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    const gmst = satellite.gstime(date);
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);

    const latitude = satellite.degreesLat(positionGd.latitude);
    const longitude = satellite.degreesLong(positionGd.longitude);
    const altitude = positionGd.height;

    if (altitude < 100 || altitude > 100000 || isNaN(altitude)) {
      return null;
    }

    const earthRadiusKm = 6371;
    const scale = 1 / earthRadiusKm;
    const x = positionEci.x * scale;
    const y = positionEci.z * scale;
    const z = positionEci.y * scale;

    let velocity = 0;
    if (velocityEci && typeof velocityEci !== 'boolean') {
      velocity = Math.sqrt(
        velocityEci.x ** 2 +
        velocityEci.y ** 2 +
        velocityEci.z ** 2
      );
    }

    return {
      name: tle.name,
      latitude,
      longitude,
      altitude,
      x,
      y,
      z,
      velocity,
      noradId: tle.noradId,
      category: tle.category,
    };
  } catch {
    return null;
  }
}

// Classify satellite by orbit type based on altitude
export function getOrbitType(altitude: number): 'LEO' | 'MEO' | 'GEO' | 'HEO' {
  if (altitude < 2000) return 'LEO';
  if (altitude < 35000) return 'MEO';
  if (altitude < 36000) return 'GEO';
  return 'HEO';
}

// Get orbit color by type
export function getOrbitColor(altitude: number): string {
  const type = getOrbitType(altitude);
  switch (type) {
    case 'LEO': return '#00ff88';
    case 'MEO': return '#ffaa00';
    case 'GEO': return '#ff4488';
    case 'HEO': return '#9b59b6';
  }
}

// Fallback TLE data (used when database is unavailable)
export const FALLBACK_TLE: TLEData[] = [
  {
    name: 'ISS (ZARYA)',
    line1: '1 25544U 98067A   24350.54166667  .00020954  00000+0  37219-3 0  9991',
    line2: '2 25544  51.6392 201.4723 0007654  33.7249 326.4295 15.49907405485239',
    noradId: 25544,
    category: 'stations',
  },
  {
    name: 'CSS (TIANHE)',
    line1: '1 48274U 21035A   24350.50000000  .00017543  00000+0  20847-3 0  9995',
    line2: '2 48274  41.4700  45.2835 0005683 331.2478 151.8342 15.62154647199546',
    noradId: 48274,
    category: 'stations',
  },
  {
    name: 'HUBBLE SPACE TELESCOPE',
    line1: '1 20580U 90037B   24350.50000000  .00001200  00000+0  60000-4 0  9994',
    line2: '2 20580  28.4700 110.5000 0002700 100.0000 260.0000 15.09000000550000',
    noradId: 20580,
    category: 'stations',
  },
];
