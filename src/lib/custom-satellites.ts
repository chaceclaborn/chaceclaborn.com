/**
 * Custom Satellite & Constellation Creator
 * Scientifically accurate orbital mechanics for user-designed satellites and constellations
 *
 * References:
 * - Walker Constellation Patterns: https://en.wikipedia.org/wiki/Satellite_constellation
 * - TLE Format: https://celestrak.org/NORAD/documentation/tle-fmt.php
 * - SGP4 Propagator: https://github.com/shashwatak/satellite-js
 * - MATLAB Walker Implementation: https://www.mathworks.com/help/aerotbx/ug/satellitescenario.walkerdelta.html
 */

import * as satellite from 'satellite.js';

// Physical constants
const EARTH_RADIUS_KM = 6378.137; // WGS84 equatorial radius
const EARTH_MU = 398600.4418; // Earth's gravitational parameter (km³/s²)
const J2 = 1.08262668e-3; // Earth's J2 perturbation coefficient
const SECONDS_PER_DAY = 86400;
const MINUTES_PER_DAY = 1440;

// Custom satellite definition (user-created)
export interface CustomSatellite {
  id: string;
  name: string;
  altitude: number; // km above Earth's surface
  inclination: number; // degrees (0-180)
  eccentricity: number; // 0-1 (0 = circular, <1 = elliptical)
  raan: number; // Right Ascension of Ascending Node (degrees, 0-360)
  argumentOfPerigee: number; // degrees (0-360)
  meanAnomaly: number; // degrees (0-360) - position in orbit
  color: string;
  size: number; // relative size 1-5
  createdAt: number;
  constellationId?: string; // If part of a constellation
}

// Custom constellation definition
// Walker notation: i:T/P/F where:
// - i = inclination (degrees)
// - T = total number of satellites
// - P = number of orbital planes
// - F = phasing factor (0 to P-1)
export interface CustomConstellation {
  id: string;
  name: string;
  description: string;
  constellationType: 'walker-delta' | 'walker-star' | 'custom';
  // Walker parameters
  altitude: number; // km above Earth's surface
  inclination: number; // degrees
  totalSatellites: number; // T in Walker notation
  planes: number; // P in Walker notation
  phasingFactor: number; // F in Walker notation (0 to P-1)
  color: string;
  createdAt: number;
  satellites: CustomSatellite[];
}

// Storage keys
const CUSTOM_SATELLITES_KEY = 'customSatellites';
const CUSTOM_CONSTELLATIONS_KEY = 'customConstellations';

// Generate a unique ID
export function generateId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate semi-major axis from altitude
 * a = R_earth + altitude
 */
export function calculateSemiMajorAxis(altitudeKm: number): number {
  return EARTH_RADIUS_KM + altitudeKm;
}

/**
 * Calculate orbital period using Kepler's Third Law
 * T = 2π√(a³/μ)
 * Reference: https://en.wikipedia.org/wiki/Orbital_period
 */
export function calculateOrbitalPeriod(altitudeKm: number): number {
  const a = calculateSemiMajorAxis(altitudeKm);
  const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / EARTH_MU);
  return periodSeconds / 60; // Return in minutes
}

/**
 * Calculate mean motion (revolutions per day)
 * n = 1440 / T (where T is period in minutes)
 * This is what SGP4/TLE format uses
 */
export function calculateMeanMotion(altitudeKm: number): number {
  const periodMinutes = calculateOrbitalPeriod(altitudeKm);
  return MINUTES_PER_DAY / periodMinutes;
}

/**
 * Calculate orbital velocity at a given altitude (circular orbit)
 * v = √(μ/r)
 */
export function calculateOrbitalVelocity(altitudeKm: number): number {
  const r = calculateSemiMajorAxis(altitudeKm);
  return Math.sqrt(EARTH_MU / r); // km/s
}

/**
 * Calculate nodal precession rate due to J2 perturbation
 * Ω̇ = -3/2 * J2 * (R_e/a)² * n * cos(i) / (1-e²)²
 * Reference: Vallado, "Fundamentals of Astrodynamics and Applications"
 */
export function calculateNodalPrecession(altitudeKm: number, inclination: number, eccentricity: number = 0): number {
  const a = calculateSemiMajorAxis(altitudeKm);
  const n = calculateMeanMotion(altitudeKm) * 2 * Math.PI / SECONDS_PER_DAY; // rad/s
  const incRad = inclination * Math.PI / 180;
  const p = a * (1 - eccentricity * eccentricity);

  // Nodal precession in rad/s
  const omegaDot = -1.5 * J2 * Math.pow(EARTH_RADIUS_KM / p, 2) * n * Math.cos(incRad);

  // Return in degrees per day
  return omegaDot * SECONDS_PER_DAY * 180 / Math.PI;
}

/**
 * Generate TLE (Two-Line Element) from orbital elements
 * Format specification: https://celestrak.org/NORAD/documentation/tle-fmt.php
 *
 * Line 1 columns:
 *   01      - Line number (1)
 *   03-07   - Satellite number
 *   08      - Classification (U=Unclassified)
 *   10-17   - International Designator
 *   19-32   - Epoch (YYDDD.DDDDDDDD)
 *   34-43   - First derivative of mean motion
 *   45-52   - Second derivative of mean motion (with assumed decimal)
 *   54-61   - BSTAR drag term (with assumed decimal)
 *   63      - Ephemeris type (0)
 *   65-68   - Element set number
 *   69      - Checksum
 *
 * Line 2 columns:
 *   01      - Line number (2)
 *   03-07   - Satellite number
 *   09-16   - Inclination (degrees)
 *   18-25   - RAAN (degrees)
 *   27-33   - Eccentricity (with assumed decimal point)
 *   35-42   - Argument of Perigee (degrees)
 *   44-51   - Mean Anomaly (degrees)
 *   53-63   - Mean Motion (revolutions/day)
 *   64-68   - Revolution number at epoch
 *   69      - Checksum
 */
export function generateTLE(sat: CustomSatellite): { line1: string; line2: string } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const yearShort = year % 100;
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const dayOfYear = (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000) + 1;

  const meanMotion = calculateMeanMotion(sat.altitude);

  // Generate pseudo NORAD ID (99000+ for custom satellites)
  const idHash = sat.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const noradId = 99000 + (idHash % 1000);

  // Calculate checksum: sum of all digits, minus signs count as 1
  const calcChecksum = (line: string): number => {
    let sum = 0;
    for (const char of line.slice(0, 68)) {
      if (char >= '0' && char <= '9') sum += parseInt(char);
      else if (char === '-') sum += 1;
    }
    return sum % 10;
  };

  // Build Line 1 (69 characters)
  // Format: "1 NNNNNC NNNNNAAA YYDDD.DDDDDDDD +.NNNNNNNN +NNNNN-N +NNNNN-N N NNNNN"
  const catNum = noradId.toString().padStart(5, '0');
  const intlDes = '24001A  '; // International designator (8 chars)
  const epochYear = yearShort.toString().padStart(2, '0');
  const epochDay = dayOfYear.toFixed(8).padStart(12, ' ');

  let line1 = `1 ${catNum}U ${intlDes}${epochYear}${epochDay}  .00000000  00000-0  00000-0 0  999`;
  line1 += calcChecksum(line1).toString();

  // Build Line 2 (69 characters)
  // ISS example: "2 25544  51.6394 272.8455 0006999 271.5261 139.1850 15.49987820487123"
  // Format: "2 NNNNN III.IIII RRR.RRRR EEEEEEE AAA.AAAA MMM.MMMM NN.NNNNNNNNRRRRRC"
  //         pos:1-2   3-7   9-16    18-25   27-33   35-42   44-51   53-63   64-68 69

  // Format each orbital element to exact width
  const formatField = (value: number, intPart: number, decPart: number): string => {
    const str = value.toFixed(decPart);
    return str.padStart(intPart + decPart + 1, ' ');
  };

  const inc = formatField(sat.inclination, 3, 4);        // cols 09-16 (8 chars)
  const raan = formatField(sat.raan, 3, 4);              // cols 18-25 (8 chars)
  // Eccentricity: 7 digits with assumed leading decimal (e.g., 0.0006999 -> 0006999)
  const ecc = Math.round(sat.eccentricity * 10000000).toString().padStart(7, '0');
  const argp = formatField(sat.argumentOfPerigee, 3, 4); // cols 35-42 (8 chars)
  const ma = formatField(sat.meanAnomaly, 3, 4);         // cols 44-51 (8 chars)
  const mm = formatField(meanMotion, 2, 8);              // cols 53-63 (11 chars)
  const revNum = '00001'; // Revolution number at epoch (5 chars)

  // Build with exact spacing to match TLE spec (69 chars total)
  // Pos 1-2: "2 " | 3-7: satnum | 8: space | 9-16: inc | 17: space | 18-25: raan | 26: space
  // 27-33: ecc | 34: space | 35-42: argp | 43: space | 44-51: ma | 52: space | 53-63: mm | 64-68: revnum | 69: checksum
  let line2 = `2 ${catNum} ${inc} ${raan} ${ecc} ${argp} ${ma} ${mm}${revNum}`;
  line2 += calcChecksum(line2).toString();

  return { line1, line2 };
}

/**
 * Generate Walker constellation satellites
 *
 * Walker notation: i:T/P/F
 * - i = inclination
 * - T = total satellites
 * - P = number of planes
 * - F = phasing factor (0 to P-1)
 *
 * Walker Delta: RAAN spread over 360°
 *   - RAAN spacing = 360° / P
 *   - Example: Galileo 56°:24/3/1, GPS 55°:24/6/1
 *
 * Walker Star: RAAN spread over 180° (ascending nodes on one side of Earth)
 *   - RAAN spacing = 180° / P
 *   - Example: Iridium 86.4°:66/6/2
 *
 * Reference: https://en.wikipedia.org/wiki/Satellite_constellation
 * Reference: https://www.mathworks.com/help/aerotbx/ug/satellitescenario.walkerdelta.html
 */
export function generateWalkerConstellation(constellation: Omit<CustomConstellation, 'satellites' | 'createdAt' | 'id'>): CustomSatellite[] {
  const satellites: CustomSatellite[] = [];
  const { totalSatellites, planes, phasingFactor, altitude, inclination, color, name, constellationType } = constellation;

  // Satellites per plane (must be integer for Walker pattern)
  const satellitesPerPlane = Math.floor(totalSatellites / planes);

  // RAAN spacing between orbital planes
  // Walker Delta: 360° spread, Walker Star: 180° spread
  const raanSpread = constellationType === 'walker-star' ? 180 : 360;
  const raanSpacing = raanSpread / planes;

  // In-plane spacing (mean anomaly between satellites in same plane)
  const inPlaneSpacing = 360 / satellitesPerPlane;

  // Phasing offset: The angular offset between the first satellite in adjacent planes
  // Formula: Δu = F × (360° / T) where Δu is the phase difference
  // This ensures collision avoidance between planes
  const phasingOffset = (phasingFactor * 360) / totalSatellites;

  for (let plane = 0; plane < planes; plane++) {
    // RAAN for this orbital plane
    const raan = (plane * raanSpacing) % 360;

    for (let satInPlane = 0; satInPlane < satellitesPerPlane; satInPlane++) {
      // Mean anomaly: position of satellite in its orbital plane
      // Each satellite in the plane is evenly spaced
      // Plus the phasing offset based on which plane we're in
      const baseMeanAnomaly = satInPlane * inPlaneSpacing;
      const phaseOffset = plane * phasingOffset;
      const meanAnomaly = (baseMeanAnomaly + phaseOffset) % 360;

      satellites.push({
        id: generateId(),
        name: `${name}-P${plane + 1}S${satInPlane + 1}`,
        altitude,
        inclination,
        eccentricity: 0.0001, // Near circular (typical for Walker constellations)
        raan,
        argumentOfPerigee: 0, // Typically 0 for circular orbits
        meanAnomaly,
        color,
        size: 2,
        createdAt: Date.now(),
      });
    }
  }

  return satellites;
}

/**
 * Get Walker notation string for a constellation
 * Format: i°:T/P/F
 */
export function getWalkerNotation(constellation: CustomConstellation): string {
  const type = constellation.constellationType === 'walker-star' ? 'Star' : 'Delta';
  return `${constellation.inclination}°:${constellation.totalSatellites}/${constellation.planes}/${constellation.phasingFactor} (${type})`;
}

/**
 * Get human-readable explanation of Walker pattern
 */
export function getWalkerExplanation(constellation: CustomConstellation): string {
  const satsPerPlane = Math.floor(constellation.totalSatellites / constellation.planes);
  const raanSpread = constellation.constellationType === 'walker-star' ? 180 : 360;
  const raanSpacing = raanSpread / constellation.planes;

  return `${constellation.planes} planes, ${satsPerPlane} sats each, ${raanSpacing.toFixed(0)}° RAAN spacing`;
}

// Calculate position for a custom satellite
export function calculateCustomPosition(sat: CustomSatellite, date: Date = new Date()) {
  try {
    const tle = generateTLE(sat);
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

    const earthRadiusKm = 6371;
    const scale = 1 / earthRadiusKm;

    let velocity = 0;
    if (velocityEci && typeof velocityEci !== 'boolean') {
      velocity = Math.sqrt(velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2);
    }

    return {
      name: sat.name,
      latitude,
      longitude,
      altitude,
      x: positionEci.x * scale,
      y: positionEci.z * scale,
      z: positionEci.y * scale,
      velocity,
      color: sat.color,
      size: sat.size,
      isCustom: true,
      customId: sat.id,
    };
  } catch {
    return null;
  }
}

// Storage functions
export function saveCustomSatellites(satellites: CustomSatellite[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_SATELLITES_KEY, JSON.stringify(satellites));
  }
}

export function loadCustomSatellites(): CustomSatellite[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CUSTOM_SATELLITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomConstellations(constellations: CustomConstellation[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_CONSTELLATIONS_KEY, JSON.stringify(constellations));
  }
}

export function loadCustomConstellations(): CustomConstellation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CUSTOM_CONSTELLATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Add a single custom satellite
export function addCustomSatellite(satellite: Omit<CustomSatellite, 'id' | 'createdAt'>): CustomSatellite {
  const newSat: CustomSatellite = {
    ...satellite,
    id: generateId(),
    createdAt: Date.now(),
  };

  const existing = loadCustomSatellites();
  saveCustomSatellites([...existing, newSat]);

  return newSat;
}

// Add a custom constellation
export function addCustomConstellation(
  constellation: Omit<CustomConstellation, 'id' | 'createdAt' | 'satellites'>
): CustomConstellation {
  const satellites = generateWalkerConstellation(constellation);

  const newConstellation: CustomConstellation = {
    ...constellation,
    id: generateId(),
    createdAt: Date.now(),
    satellites,
  };

  // Mark satellites as belonging to this constellation
  satellites.forEach(sat => {
    sat.constellationId = newConstellation.id;
  });

  const existingConstellations = loadCustomConstellations();
  saveCustomConstellations([...existingConstellations, newConstellation]);

  // Also save the individual satellites
  const existingSatellites = loadCustomSatellites();
  saveCustomSatellites([...existingSatellites, ...satellites]);

  return newConstellation;
}

// Delete a custom satellite
export function deleteCustomSatellite(id: string): void {
  const satellites = loadCustomSatellites().filter(s => s.id !== id);
  saveCustomSatellites(satellites);
}

// Delete a custom constellation (and its satellites)
export function deleteCustomConstellation(id: string): void {
  const constellations = loadCustomConstellations().filter(c => c.id !== id);
  saveCustomConstellations(constellations);

  // Remove associated satellites
  const satellites = loadCustomSatellites().filter(s => s.constellationId !== id);
  saveCustomSatellites(satellites);
}

// Convert custom satellite to TLEData format for rendering
export function customSatelliteToTLE(sat: CustomSatellite) {
  const tle = generateTLE(sat);
  // Use a hash of the ID to generate a consistent NORAD ID
  const idHash = sat.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    name: sat.name,
    line1: tle.line1,
    line2: tle.line2,
    noradId: 99000 + (idHash % 1000),
    category: 'custom',
    isCustom: true,
    customColor: sat.color,
    customSize: sat.size,
    customId: sat.id,
  };
}

/**
 * Preset orbital configurations for single satellites
 * Based on real-world satellite orbits
 */
export const ORBITAL_PRESETS = {
  LEO_ISS: {
    name: 'ISS Orbit',
    altitude: 420,
    inclination: 51.6,
    description: 'International Space Station orbital parameters'
  },
  LEO_POLAR: {
    name: 'Polar LEO',
    altitude: 800,
    inclination: 98.2,
    description: 'Sun-synchronous polar orbit for Earth observation'
  },
  LEO_STARLINK: {
    name: 'Starlink Shell',
    altitude: 550,
    inclination: 53,
    description: 'SpaceX Starlink first shell altitude'
  },
  MEO_GPS: {
    name: 'GPS Orbit',
    altitude: 20180,
    inclination: 55,
    description: 'US GPS navigation satellite altitude'
  },
  GEO: {
    name: 'Geostationary',
    altitude: 35786,
    inclination: 0,
    description: 'Geostationary orbit (24h period)'
  },
  HEO_MOLNIYA: {
    name: 'Molniya Orbit',
    altitude: 39750,
    inclination: 63.4,
    description: 'Highly elliptical orbit for high-latitude coverage'
  },
};

/**
 * Preset constellation configurations
 * Based on real-world satellite constellations with accurate Walker parameters
 *
 * Walker Delta: RAAN spread over 360° - most common for global coverage
 * Walker Star: RAAN spread over 180° - used for polar/near-polar orbits
 */
export const CONSTELLATION_PRESETS = {
  // Walker Delta examples (360° RAAN spread)
  STARLINK_MINI: {
    name: 'Starlink Mini',
    description: 'Walker Delta pattern similar to SpaceX Starlink shell 1',
    constellationType: 'walker-delta' as const,
    altitude: 550,
    inclination: 53,
    totalSatellites: 22,
    planes: 11,
    phasingFactor: 1,
  },
  GPS_LIKE: {
    name: 'GPS-like',
    description: 'Walker Delta 55°:24/6/1 - US GPS constellation pattern',
    constellationType: 'walker-delta' as const,
    altitude: 20180,
    inclination: 55,
    totalSatellites: 24,
    planes: 6,
    phasingFactor: 1,
  },
  GALILEO_LIKE: {
    name: 'Galileo-like',
    description: 'Walker Delta 56°:24/3/1 - EU Galileo navigation pattern',
    constellationType: 'walker-delta' as const,
    altitude: 23222,
    inclination: 56,
    totalSatellites: 24,
    planes: 3,
    phasingFactor: 1,
  },
  ONEWEB_MINI: {
    name: 'OneWeb Mini',
    description: 'Walker Delta pattern for broadband internet',
    constellationType: 'walker-delta' as const,
    altitude: 1200,
    inclination: 87.9,
    totalSatellites: 18,
    planes: 6,
    phasingFactor: 1,
  },

  // Walker Star examples (180° RAAN spread)
  IRIDIUM_LIKE: {
    name: 'Iridium-like',
    description: 'Walker Star 86.4°:66/6/2 - Iridium NEXT pattern',
    constellationType: 'walker-star' as const,
    altitude: 780,
    inclination: 86.4,
    totalSatellites: 66,
    planes: 6,
    phasingFactor: 2,
  },
  POLAR_STAR: {
    name: 'Polar Star',
    description: 'Walker Star for polar region coverage',
    constellationType: 'walker-star' as const,
    altitude: 650,
    inclination: 85,
    totalSatellites: 24,
    planes: 4,
    phasingFactor: 1,
  },
  GLOBALSTAR_MINI: {
    name: 'Globalstar Mini',
    description: 'Walker Star 52°:24/4/1 - Voice/data constellation',
    constellationType: 'walker-star' as const,
    altitude: 1414,
    inclination: 52,
    totalSatellites: 24,
    planes: 4,
    phasingFactor: 1,
  },
};
