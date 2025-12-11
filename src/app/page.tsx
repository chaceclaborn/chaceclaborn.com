'use client';

import { DimensionalLayers, LayerContent } from '@/components/effects/DimensionalLayers';
import { HeroLayer } from '@/components/home/layers/HeroLayer';
import { SolarSystemLayer } from '@/components/home/layers/SolarSystemLayer';
import { QuotesLayer } from '@/components/home/layers/QuotesLayer';

// Define the content for each dimensional layer
const homeLayers: LayerContent[] = [
  {
    id: 'hero',
    label: 'Welcome',
    depth: 0,
    content: <HeroLayer />,
  },
  {
    id: 'solar-system',
    label: 'Solar System',
    depth: 1,
    content: <SolarSystemLayer />,
  },
  {
    id: 'quotes',
    label: 'Inspiration',
    depth: 2,
    content: <QuotesLayer />,
  },
];

export default function HomePage() {
  return (
    <DimensionalLayers
      layers={homeLayers}
      initialLayer={0}
    />
  );
}
