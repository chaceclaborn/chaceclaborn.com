'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PathfindingVisualization } from '@/components/ai-learning/PathfindingVisualization';
import { MinimaxVisualization } from '@/components/ai-learning/MinimaxVisualization';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'complete' | 'active' | 'planned';
  algorithms: string[];
}

const modules: Module[] = [
  {
    id: 'pathfinding',
    name: 'Search & Pathfinding',
    description: 'A*, Dijkstra, BFS, DFS visualizations',
    icon: '🔍',
    status: 'complete',
    algorithms: ['A*', 'Dijkstra', 'BFS', 'DFS', 'Greedy']
  },
  {
    id: 'minimax',
    name: 'Minimax Algorithm',
    description: 'Game tree with alpha-beta pruning',
    icon: '🎮',
    status: 'active',
    algorithms: ['Minimax', 'Alpha-Beta']
  },
  {
    id: 'genetic',
    name: 'Genetic Algorithms',
    description: 'Evolution-based optimization',
    icon: '🧬',
    status: 'planned',
    algorithms: ['Selection', 'Crossover', 'Mutation']
  },
  {
    id: 'neural',
    name: 'Neural Networks',
    description: 'Backpropagation visualization',
    icon: '🧠',
    status: 'planned',
    algorithms: ['Backprop', 'Gradient Descent']
  }
];

export default function AILearningPage() {
  const [activeModule, setActiveModule] = useState<string>('pathfinding');

  return (
    <div className="min-h-screen py-4 md:py-6">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Compact Header with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              AI Learning Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Interactive algorithm visualizations
            </p>
          </div>

          {/* Module Tabs - inline with header on desktop */}
          <div className="flex flex-wrap gap-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => module.status !== 'planned' && setActiveModule(module.id)}
                disabled={module.status === 'planned'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                  activeModule === module.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : module.status === 'planned'
                    ? 'opacity-40 cursor-not-allowed border-border bg-muted'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <span>{module.icon}</span>
                <span className="font-medium hidden sm:inline">{module.name.split(' ')[0]}</span>
                {module.status === 'planned' && (
                  <span className="text-[9px] px-1 rounded bg-muted-foreground/20">Soon</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Visualization */}
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-2xl shadow-soft-lg border border-border overflow-hidden"
        >
          {activeModule === 'pathfinding' && <PathfindingVisualization />}
          {activeModule === 'minimax' && <MinimaxVisualization />}
        </motion.div>

      </div>
    </div>
  );
}
