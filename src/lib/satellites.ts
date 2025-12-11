import { prisma } from './prisma';
import { FALLBACK_TLE, type TLEData, type TLESourceKey } from './satellite-service';

/**
 * Fetch all satellites from the database
 */
export async function getAllSatellites(): Promise<TLEData[]> {
  try {
    const satellites = await prisma.satellite.findMany({
      select: {
        name: true,
        line1: true,
        line2: true,
        noradId: true,
        category: true,
      },
    });

    return satellites.map(sat => ({
      name: sat.name,
      line1: sat.line1,
      line2: sat.line2,
      noradId: sat.noradId,
      category: sat.category,
    }));
  } catch (error) {
    console.error('Failed to fetch satellites from database:', error);
    return FALLBACK_TLE;
  }
}

/**
 * Fetch satellites by category
 */
export async function getSatellitesByCategory(category: TLESourceKey): Promise<TLEData[]> {
  try {
    const satellites = await prisma.satellite.findMany({
      where: { category },
      select: {
        name: true,
        line1: true,
        line2: true,
        noradId: true,
        category: true,
      },
    });

    return satellites.map(sat => ({
      name: sat.name,
      line1: sat.line1,
      line2: sat.line2,
      noradId: sat.noradId,
      category: sat.category,
    }));
  } catch (error) {
    console.error(`Failed to fetch ${category} satellites:`, error);
    return FALLBACK_TLE.filter(s => s.category === category);
  }
}

/**
 * Get satellite counts by category
 */
export async function getSatelliteCounts(): Promise<Record<string, number>> {
  try {
    const counts = await prisma.satellite.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    return counts.reduce((acc, item) => {
      acc[item.category] = item._count.category;
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    console.error('Failed to get satellite counts:', error);
    return {};
  }
}

/**
 * Get the last update timestamp
 */
export async function getLastUpdate(): Promise<Date | null> {
  try {
    const update = await prisma.dataUpdate.findFirst({
      where: { source: 'celestrak' },
      orderBy: { updatedAt: 'desc' },
    });

    return update?.updatedAt ?? null;
  } catch (error) {
    console.error('Failed to get last update:', error);
    return null;
  }
}
