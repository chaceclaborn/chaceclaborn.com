import { NextResponse } from 'next/server';
import { getAllSatellites, getLastUpdate } from '@/lib/satellites';

// Cache for 1 hour, revalidate in background
export const revalidate = 3600;

export async function GET() {
  try {
    const [satellites, lastUpdated] = await Promise.all([
      getAllSatellites(),
      getLastUpdate(),
    ]);

    return NextResponse.json({
      satellites,
      lastUpdated: lastUpdated?.toISOString() ?? null,
      count: satellites.length,
    });
  } catch (error) {
    console.error('Failed to fetch satellites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch satellites', satellites: [] },
      { status: 500 }
    );
  }
}
