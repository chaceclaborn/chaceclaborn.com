#!/usr/bin/env node

/**
 * Satellite TLE Data Update Script
 *
 * This script fetches the latest TLE (Two-Line Element) data from CelesTrak
 * and saves it to a local JSON file for use in the application.
 *
 * Run manually: node scripts/update-satellites.mjs
 * Or set up as a cron job / GitHub Action to run daily
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CelesTrak TLE sources
const TLE_SOURCES = {
  stations: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
  starlink: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle',
  oneweb: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=oneweb&FORMAT=tle',
  'gps-ops': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle',
  glonass: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=glo-ops&FORMAT=tle',
  galileo: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=galileo&FORMAT=tle',
  beidou: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=beidou&FORMAT=tle',
  'iridium-next': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-NEXT&FORMAT=tle',
  geo: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=geo&FORMAT=tle',
  weather: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle',
};

// Extract NORAD ID from TLE line 1
function extractNoradId(line1) {
  try {
    const noradStr = line1.substring(2, 7).trim();
    return parseInt(noradStr, 10);
  } catch {
    return null;
  }
}

// Parse TLE text into array of satellite objects
function parseTLE(tleText, category) {
  const lines = tleText.trim().split('\n').filter(line => line.trim());
  const satellites = [];

  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      const name = lines[i].trim();
      const line1 = lines[i + 1].trim();
      const line2 = lines[i + 2].trim();

      // Validate TLE format
      if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
        satellites.push({
          name,
          line1,
          line2,
          noradId: extractNoradId(line1),
          category,
        });
      }
    }
  }

  return satellites;
}

// Fetch TLE data from a single source
async function fetchSource(name, url) {
  try {
    console.log(`  Fetching ${name}...`);
    const response = await fetch(url, {
      headers: { 'Accept': 'text/plain' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    const satellites = parseTLE(text, name);
    console.log(`  ✓ ${name}: ${satellites.length} satellites`);
    return satellites;
  } catch (error) {
    console.error(`  ✗ ${name}: ${error.message}`);
    return [];
  }
}

// Main update function
async function updateSatelliteData() {
  console.log('\n🛰️  Satellite TLE Data Updater\n');
  console.log('Fetching data from CelesTrak...\n');

  const allSatellites = [];
  const seenNoradIds = new Set();

  // Fetch all sources
  for (const [name, url] of Object.entries(TLE_SOURCES)) {
    const satellites = await fetchSource(name, url);

    // Deduplicate by NORAD ID
    for (const sat of satellites) {
      if (sat.noradId && !seenNoradIds.has(sat.noradId)) {
        seenNoradIds.add(sat.noradId);
        allSatellites.push(sat);
      }
    }
  }

  console.log(`\nTotal unique satellites: ${allSatellites.length}`);

  // Create the data object
  const data = {
    lastUpdated: new Date().toISOString(),
    totalCount: allSatellites.length,
    sources: Object.keys(TLE_SOURCES),
    satellites: allSatellites,
  };

  // Ensure the data directory exists
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write the data file
  const outputPath = path.join(dataDir, 'satellites.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n✓ Data saved to: public/data/satellites.json`);

  // Also create a smaller "featured" file with just important satellites
  const featured = allSatellites.filter(sat =>
    sat.category === 'stations' ||
    sat.category === 'weather' ||
    sat.category === 'gps-ops' ||
    sat.category === 'geo'
  );

  const featuredData = {
    lastUpdated: new Date().toISOString(),
    totalCount: featured.length,
    satellites: featured,
  };

  const featuredPath = path.join(dataDir, 'satellites-featured.json');
  fs.writeFileSync(featuredPath, JSON.stringify(featuredData, null, 2));
  console.log(`✓ Featured data saved to: public/data/satellites-featured.json (${featured.length} satellites)`);

  console.log('\n🎉 Update complete!\n');
}

// Run the update
updateSatelliteData().catch(console.error);
