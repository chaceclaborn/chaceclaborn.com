import * as satellite from 'satellite.js';

export interface TLEData {
  name: string;
  line1: string;
  line2: string;
}

export interface SatellitePosition {
  name: string;
  latitude: number;
  longitude: number;
  altitude: number; // km
  x: number; // normalized position
  y: number;
  z: number;
  velocity: number; // km/s
}

// CelesTrak public TLE sources
const TLE_SOURCES = {
  stations: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
  starlink: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle',
  gps: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle',
  geostationary: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=geo&FORMAT=tle',
  active: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
};

// Parse TLE text into array of TLE data
function parseTLE(tleText: string): TLEData[] {
  const lines = tleText.trim().split('\n');
  const tles: TLEData[] = [];

  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      tles.push({
        name: lines[i].trim(),
        line1: lines[i + 1].trim(),
        line2: lines[i + 2].trim(),
      });
    }
  }

  return tles;
}

// Calculate satellite position from TLE at given time
export function calculatePosition(tle: TLEData, date: Date = new Date()): SatellitePosition | null {
  try {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const positionAndVelocity = satellite.propagate(satrec, date);

    if (!positionAndVelocity || !positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
      return null;
    }

    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    // Get geodetic coordinates
    const gmst = satellite.gstime(date);
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);

    // Convert to degrees
    const latitude = satellite.degreesLat(positionGd.latitude);
    const longitude = satellite.degreesLong(positionGd.longitude);
    const altitude = positionGd.height;

    // Convert ECI to normalized 3D position for Three.js (Earth radius = 1)
    const earthRadiusKm = 6371;
    const scale = 1 / earthRadiusKm;
    const x = positionEci.x * scale;
    const y = positionEci.z * scale; // Swap y/z for Three.js coordinate system
    const z = positionEci.y * scale;

    // Calculate velocity magnitude
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
    };
  } catch {
    return null;
  }
}

// Fetch TLE data from CelesTrak
export async function fetchTLEData(source: keyof typeof TLE_SOURCES = 'stations'): Promise<TLEData[]> {
  try {
    const response = await fetch(TLE_SOURCES[source]);
    if (!response.ok) {
      throw new Error(`Failed to fetch TLE data: ${response.status}`);
    }
    const text = await response.text();
    return parseTLE(text);
  } catch (error) {
    console.error('Error fetching TLE data:', error);
    return [];
  }
}

// Sample TLE data for fallback (ISS and other notable satellites)
export const FALLBACK_TLE: TLEData[] = [
  {
    name: 'ISS (ZARYA)',
    line1: '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025',
    line2: '2 25544  51.6400 208.9163 0006703  40.5536 117.4264 15.49560469999999',
  },
  {
    name: 'STARLINK-1007',
    line1: '1 44713U 19074A   24001.50000000  .00001000  00000-0  10000-4 0  9999',
    line2: '2 44713  53.0000 200.0000 0001000  90.0000 270.0000 15.05000000 99999',
  },
  {
    name: 'GPS BIIR-2',
    line1: '1 24876U 97035A   24001.50000000 -.00000002  00000-0  00000+0 0  9999',
    line2: '2 24876  55.7000 120.0000 0100000 270.0000  90.0000  2.00565000 99999',
  },
  {
    name: 'GOES-16',
    line1: '1 41866U 16071A   24001.50000000 -.00000120  00000-0  00000+0 0  9999',
    line2: '2 41866   0.0500 270.0000 0001000  90.0000 270.0000  1.00270000 99999',
  },
];

// Get multiple satellite positions at once
export function calculateMultiplePositions(tles: TLEData[], date: Date = new Date()): SatellitePosition[] {
  return tles
    .map(tle => calculatePosition(tle, date))
    .filter((pos): pos is SatellitePosition => pos !== null);
}

// Classify satellite by orbit type based on altitude
export function getOrbitType(altitude: number): 'LEO' | 'MEO' | 'GEO' {
  if (altitude < 2000) return 'LEO';
  if (altitude < 35000) return 'MEO';
  return 'GEO';
}
