'use client';

import { motion } from 'framer-motion';

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
    description: 'A*, Dijkstra, BFS, DFS, and other search algorithms visualized step-by-step',
    icon: '🔍',
    status: 'complete',
    algorithms: ['A*', 'Dijkstra', 'BFS', 'DFS', 'Greedy']
  },
  {
    id: 'minimax',
    name: 'Minimax Algorithm',
    description: 'Game tree search with alpha-beta pruning for optimal decision making',
    icon: '🎮',
    status: 'active',
    algorithms: ['Minimax', 'Alpha-Beta Pruning']
  },
  {
    id: 'genetic',
    name: 'Genetic Algorithms',
    description: 'Evolution-based optimization techniques',
    icon: '🧬',
    status: 'planned',
    algorithms: ['Selection', 'Crossover', 'Mutation']
  },
  {
    id: 'neural',
    name: 'Neural Networks',
    description: 'Backpropagation visualization and training',
    icon: '🧠',
    status: 'planned',
    algorithms: ['Backpropagation', 'Gradient Descent']
  }
];

const statusColors = {
  complete: 'bg-sage-500/20 text-sage-700 dark:text-sage-300 border-sage-500/30',
  active: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
  planned: 'bg-muted text-muted-foreground border-border'
};

const statusLabels = {
  complete: 'Ready',
  active: 'In Progress',
  planned: 'Coming Soon'
};

export function DashboardLayer() {
  const activeModules = modules.filter(m => m.status === 'complete' || m.status === 'active');
  const totalAlgorithms = modules.reduce((acc, m) => acc + m.algorithms.length, 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
          AI Learning Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore interactive visualizations of AI and algorithm concepts.
          Each module provides hands-on learning with step-by-step animations.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-card rounded-xl p-4 text-center shadow-soft border border-border">
          <div className="text-3xl font-bold text-primary">{modules.length}</div>
          <div className="text-sm text-muted-foreground">Modules</div>
        </div>
        <div className="bg-card rounded-xl p-4 text-center shadow-soft border border-border">
          <div className="text-3xl font-bold text-primary">{totalAlgorithms}</div>
          <div className="text-sm text-muted-foreground">Algorithms</div>
        </div>
        <div className="bg-card rounded-xl p-4 text-center shadow-soft border border-border">
          <div className="text-3xl font-bold text-primary">{activeModules.length}</div>
          <div className="text-sm text-muted-foreground">Available</div>
        </div>
      </motion.div>

      {/* Module Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`bg-card rounded-xl p-6 shadow-soft border border-border card-hover ${
              module.status === 'planned' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-4xl">{module.icon}</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[module.status]}`}>
                {statusLabels[module.status]}
              </span>
            </div>

            <h3 className="text-xl font-semibold mb-2 text-foreground">
              {module.name}
            </h3>

            <p className="text-sm text-muted-foreground mb-4">
              {module.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {module.algorithms.map((algo) => (
                <span
                  key={algo}
                  className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                >
                  {algo}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-muted-foreground mt-8"
      >
        Scroll down or use arrow keys to explore each module
      </motion.p>
    </div>
  );
}
