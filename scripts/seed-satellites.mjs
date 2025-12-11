#!/usr/bin/env node

/**
 * Satellite Database Seed Script
 *
 * This script fetches TLE data from CelesTrak and populates the database.
 * Run after setting up Supabase and running prisma migrate.
 *
 * Usage: node scripts/seed-satellites.mjs
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

// Configure pg with explicit connection params and SSL
const pool = new pg.Pool({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.biaxoishtoysdjfiqddl',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

      if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
        const noradId = extractNoradId(line1);
        if (noradId) {
          satellites.push({ name, line1, line2, noradId, category });
        }
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

// Main seed function
async function seedDatabase() {
  console.log('\n🛰️  Satellite Database Seeder\n');
  console.log('Fetching data from CelesTrak...\n');

  const allSatellites = [];
  const seenNoradIds = new Set();

  // Fetch all sources
  for (const [name, url] of Object.entries(TLE_SOURCES)) {
    const satellites = await fetchSource(name, url);

    // Deduplicate by NORAD ID
    for (const sat of satellites) {
      if (!seenNoradIds.has(sat.noradId)) {
        seenNoradIds.add(sat.noradId);
        allSatellites.push(sat);
      }
    }
  }

  console.log(`\nTotal unique satellites: ${allSatellites.length}`);
  console.log('\nSeeding database...\n');

  // Clear existing data
  console.log('  Clearing existing satellites...');
  await prisma.satellite.deleteMany();
  await prisma.dataUpdate.deleteMany();

  // Insert in batches of 1000 for performance
  const batchSize = 1000;
  let inserted = 0;

  for (let i = 0; i < allSatellites.length; i += batchSize) {
    const batch = allSatellites.slice(i, i + batchSize);

    await prisma.satellite.createMany({
      data: batch.map(sat => ({
        noradId: sat.noradId,
        name: sat.name,
        line1: sat.line1,
        line2: sat.line2,
        category: sat.category,
      })),
      skipDuplicates: true,
    });

    inserted += batch.length;
    console.log(`  Inserted ${inserted} / ${allSatellites.length} satellites`);
  }

  // Record the update
  await prisma.dataUpdate.create({
    data: {
      source: 'celestrak',
      totalCount: allSatellites.length,
    },
  });

  console.log('\n✓ Database seeded successfully!');
  console.log(`  Total satellites: ${allSatellites.length}`);
  console.log(`  Last updated: ${new Date().toISOString()}`);
  console.log('\n🎉 Done!\n');
}

// Run the seeder
seedDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
