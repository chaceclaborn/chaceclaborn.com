'use client';

import { DimensionalLayers, LayerContent } from '@/components/effects/DimensionalLayers';
import { DashboardLayer } from '@/components/ai-learning/layers/DashboardLayer';
import { PathfindingLayer } from '@/components/ai-learning/layers/PathfindingLayer';
import { MinimaxLayer } from '@/components/ai-learning/layers/MinimaxLayer';

// Define the content for each dimensional layer
const aiLearningLayers: LayerContent[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    depth: 0,
    content: <DashboardLayer />,
  },
  {
    id: 'pathfinding',
    label: 'Pathfinding',
    depth: 1,
    content: <PathfindingLayer />,
  },
  {
    id: 'minimax',
    label: 'Minimax',
    depth: 2,
    content: <MinimaxLayer />,
  },
];

export default function AILearningPage() {
  return (
    <DimensionalLayers
      layers={aiLearningLayers}
      initialLayer={0}
    />
  );
}
