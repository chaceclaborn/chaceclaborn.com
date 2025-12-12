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
  | 'weather'
  | 'custom';

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
  custom: { name: 'Custom', color: '#00ff88', icon: '🚀' },
} as const;

// Constellation type - Walker Delta, Walker Star, or other patterns
export type ConstellationType = 'walker-delta' | 'walker-star' | 'polar' | 'geostationary' | 'single' | 'cluster';

// Constellation information with Walker notation where applicable
export interface ConstellationInfo {
  name: string;
  operator: string;
  orbitType: 'LEO' | 'MEO' | 'GEO' | 'HEO';
  constellationType: ConstellationType;
  walker?: string; // Walker notation: i:t/p/f (inclination:total/planes/phasing)
  walkerExplained?: string; // Human-readable explanation
  altitude?: string;
  purpose: string;
  color: string;
  totalSatellites?: number;
}

export const CONSTELLATIONS: Record<string, ConstellationInfo> = {
  // === BROADBAND INTERNET CONSTELLATIONS ===
  STARLINK: {
    name: 'Starlink',
    operator: 'SpaceX',
    orbitType: 'LEO',
    constellationType: 'walker-delta',
    walker: '53°:~12000/72/1',
    walkerExplained: '72 orbital planes at 53° inclination',
    altitude: '540-570 km',
    purpose: 'Broadband Internet',
    color: '#00bfff',
    totalSatellites: 12000,
  },
  ONEWEB: {
    name: 'OneWeb',
    operator: 'Eutelsat OneWeb',
    orbitType: 'LEO',
    constellationType: 'walker-star',
    walker: '87.9°:648/12/1',
    walkerExplained: '12 polar planes, 54 sats each',
    altitude: '1,200 km',
    purpose: 'Broadband Internet',
    color: '#9b59b6',
    totalSatellites: 648,
  },
  KUIPER: {
    name: 'Project Kuiper',
    operator: 'Amazon',
    orbitType: 'LEO',
    constellationType: 'walker-delta',
    walker: '51.9°:3236/98/1',
    walkerExplained: '98 planes at multiple inclinations',
    altitude: '590-630 km',
    purpose: 'Broadband Internet',
    color: '#ff9900',
    totalSatellites: 3236,
  },

  // === COMMUNICATION CONSTELLATIONS ===
  IRIDIUM: {
    name: 'Iridium NEXT',
    operator: 'Iridium Communications',
    orbitType: 'LEO',
    constellationType: 'walker-star',
    walker: '86.4°:66/6/2',
    walkerExplained: '6 polar planes, 11 sats each',
    altitude: '780 km',
    purpose: 'Voice & Data Communications',
    color: '#1abc9c',
    totalSatellites: 66,
  },
  GLOBALSTAR: {
    name: 'Globalstar',
    operator: 'Globalstar Inc.',
    orbitType: 'LEO',
    constellationType: 'walker-delta',
    walker: '52°:48/8/1',
    walkerExplained: '8 planes at 52° inclination',
    altitude: '1,414 km',
    purpose: 'Voice & Data Communications',
    color: '#f39c12',
    totalSatellites: 48,
  },
  ORBCOMM: {
    name: 'ORBCOMM',
    operator: 'ORBCOMM Inc.',
    orbitType: 'LEO',
    constellationType: 'walker-delta',
    walker: '45°:36/6/1',
    walkerExplained: '6 planes for M2M/IoT',
    altitude: '750 km',
    purpose: 'Machine-to-Machine (IoT)',
    color: '#27ae60',
    totalSatellites: 36,
  },

  // === NAVIGATION CONSTELLATIONS (GNSS) ===
  GPS: {
    name: 'GPS (NAVSTAR)',
    operator: 'US Space Force',
    orbitType: 'MEO',
    constellationType: 'walker-delta',
    walker: '55°:24/6/1',
    walkerExplained: '6 planes, 4 sats each, 60° apart',
    altitude: '20,180 km',
    purpose: 'Navigation (GNSS)',
    color: '#f1c40f',
    totalSatellites: 31,
  },
  GLONASS: {
    name: 'GLONASS',
    operator: 'Roscosmos (Russia)',
    orbitType: 'MEO',
    constellationType: 'walker-delta',
    walker: '64.8°:24/3/1',
    walkerExplained: '3 planes, 8 sats each, 120° apart',
    altitude: '19,130 km',
    purpose: 'Navigation (GNSS)',
    color: '#e74c3c',
    totalSatellites: 24,
  },
  GALILEO: {
    name: 'Galileo',
    operator: 'European Union (ESA)',
    orbitType: 'MEO',
    constellationType: 'walker-delta',
    walker: '56°:30/3/1',
    walkerExplained: '3 planes, 10 sats each',
    altitude: '23,222 km',
    purpose: 'Navigation (GNSS)',
    color: '#3498db',
    totalSatellites: 30,
  },
  BEIDOU: {
    name: 'BeiDou-3',
    operator: 'China (CNSA)',
    orbitType: 'MEO',
    constellationType: 'walker-delta',
    walker: '55°:27/3/1',
    walkerExplained: '3 MEO planes + GEO + IGSO',
    altitude: '21,528 km',
    purpose: 'Navigation (GNSS)',
    color: '#e67e22',
    totalSatellites: 35,
  },

  // === WEATHER SATELLITE SYSTEMS ===
  GOES: {
    name: 'GOES',
    operator: 'NOAA (USA)',
    orbitType: 'GEO',
    constellationType: 'geostationary',
    altitude: '35,786 km',
    purpose: 'Weather Monitoring',
    color: '#74b9ff',
    totalSatellites: 4,
  },
  METEOSAT: {
    name: 'Meteosat',
    operator: 'EUMETSAT (Europe)',
    orbitType: 'GEO',
    constellationType: 'geostationary',
    altitude: '35,786 km',
    purpose: 'Weather Monitoring',
    color: '#74b9ff',
    totalSatellites: 4,
  },
  HIMAWARI: {
    name: 'Himawari',
    operator: 'JMA (Japan)',
    orbitType: 'GEO',
    constellationType: 'geostationary',
    altitude: '35,786 km',
    purpose: 'Weather Monitoring',
    color: '#74b9ff',
    totalSatellites: 2,
  },
  FENGYUN: {
    name: 'Fengyun',
    operator: 'CMA (China)',
    orbitType: 'LEO',
    constellationType: 'polar',
    altitude: '836 km (polar) / 35,786 km (GEO)',
    purpose: 'Weather Monitoring',
    color: '#74b9ff',
    totalSatellites: 8,
  },
  NOAA_POLAR: {
    name: 'NOAA POES / JPSS',
    operator: 'NOAA (USA)',
    orbitType: 'LEO',
    constellationType: 'polar',
    walker: '98.7°:sun-sync',
    walkerExplained: 'Sun-synchronous polar orbit',
    altitude: '833 km',
    purpose: 'Weather Monitoring',
    color: '#74b9ff',
    totalSatellites: 4,
  },
  DMSP: {
    name: 'DMSP',
    operator: 'US Space Force',
    orbitType: 'LEO',
    constellationType: 'polar',
    walker: '98.9°:sun-sync',
    walkerExplained: 'Sun-synchronous polar orbit',
    altitude: '833 km',
    purpose: 'Military Weather',
    color: '#74b9ff',
    totalSatellites: 3,
  },

  // === EARTH OBSERVATION ===
  PLANET: {
    name: 'Planet Labs (Dove/Flock)',
    operator: 'Planet Labs',
    orbitType: 'LEO',
    constellationType: 'walker-delta',
    walker: '97.5°:~200/sun-sync',
    walkerExplained: 'Sun-sync imaging swarm',
    altitude: '475 km',
    purpose: 'Earth Imaging',
    color: '#2ecc71',
    totalSatellites: 200,
  },
  SPIRE: {
    name: 'Spire Global',
    operator: 'Spire Global',
    orbitType: 'LEO',
    constellationType: 'walker-delta',
    altitude: '400-650 km',
    purpose: 'Weather & Maritime Tracking',
    color: '#9b59b6',
    totalSatellites: 100,
  },

  // === SPACE STATIONS ===
  ISS: {
    name: 'International Space Station',
    operator: 'NASA/Roscosmos/ESA/JAXA/CSA',
    orbitType: 'LEO',
    constellationType: 'single',
    altitude: '408 km',
    purpose: 'Human Spaceflight & Research',
    color: '#ff6b6b',
    totalSatellites: 1,
  },
  CSS: {
    name: 'China Space Station (Tiangong)',
    operator: 'CNSA (China)',
    orbitType: 'LEO',
    constellationType: 'single',
    altitude: '340-450 km',
    purpose: 'Human Spaceflight & Research',
    color: '#ff6b6b',
    totalSatellites: 1,
  },
  HUBBLE: {
    name: 'Hubble Space Telescope',
    operator: 'NASA/ESA',
    orbitType: 'LEO',
    constellationType: 'single',
    altitude: '540 km',
    purpose: 'Space Telescope',
    color: '#9b59b6',
    totalSatellites: 1,
  },
};

// Human-readable constellation type names
export const CONSTELLATION_TYPE_NAMES: Record<ConstellationType, string> = {
  'walker-delta': 'Walker Delta',
  'walker-star': 'Walker Star',
  'polar': 'Polar Orbit',
  'geostationary': 'Geostationary',
  'single': 'Single Satellite',
  'cluster': 'Satellite Cluster',
};

// Detect constellation from satellite name
export function getConstellation(name: string): ConstellationInfo | null {
  const upperName = name.toUpperCase();

  // Broadband Internet
  if (upperName.includes('STARLINK')) return CONSTELLATIONS.STARLINK;
  if (upperName.includes('ONEWEB')) return CONSTELLATIONS.ONEWEB;
  if (upperName.includes('KUIPER')) return CONSTELLATIONS.KUIPER;

  // Communications
  if (upperName.includes('IRIDIUM')) return CONSTELLATIONS.IRIDIUM;
  if (upperName.includes('GLOBALSTAR')) return CONSTELLATIONS.GLOBALSTAR;
  if (upperName.includes('ORBCOMM')) return CONSTELLATIONS.ORBCOMM;

  // Navigation (GNSS)
  if (upperName.includes('GPS') || upperName.includes('NAVSTAR')) return CONSTELLATIONS.GPS;
  if (upperName.includes('GLONASS')) return CONSTELLATIONS.GLONASS;
  if (upperName.includes('GALILEO') && !upperName.includes('GALILEO-')) return CONSTELLATIONS.GALILEO;
  if (upperName.includes('BEIDOU')) return CONSTELLATIONS.BEIDOU;

  // Weather - Geostationary
  if (upperName.includes('GOES')) return CONSTELLATIONS.GOES;
  if (upperName.includes('METEOSAT')) return CONSTELLATIONS.METEOSAT;
  if (upperName.includes('HIMAWARI')) return CONSTELLATIONS.HIMAWARI;

  // Weather - Polar
  if (upperName.includes('FENGYUN') || upperName.includes('FY-')) return CONSTELLATIONS.FENGYUN;
  if (upperName.includes('NOAA') || upperName.includes('JPSS')) return CONSTELLATIONS.NOAA_POLAR;
  if (upperName.includes('DMSP')) return CONSTELLATIONS.DMSP;

  // Earth Observation
  if (upperName.includes('FLOCK') || upperName.includes('DOVE') || upperName.includes('PLANET')) return CONSTELLATIONS.PLANET;
  if (upperName.includes('SPIRE') || upperName.includes('LEMUR')) return CONSTELLATIONS.SPIRE;

  // Space Stations and Special Satellites
  if (upperName.includes('ISS') || upperName.includes('ZARYA') || upperName.includes('NAUKA') ||
      upperName.includes('PROGRESS') || upperName.includes('DRAGON') || upperName.includes('CREW')) {
    return CONSTELLATIONS.ISS;
  }
  if (upperName.includes('CSS') || upperName.includes('TIANHE') || upperName.includes('WENTIAN') ||
      upperName.includes('MENGTIAN') || upperName.includes('TIANZHOU') || upperName.includes('SHENZHOU')) {
    return CONSTELLATIONS.CSS;
  }
  if (upperName.includes('HUBBLE')) return CONSTELLATIONS.HUBBLE;

  return null;
}

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
