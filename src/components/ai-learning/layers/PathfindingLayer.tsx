'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Node {
  id: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  cost: number;
}

interface Graph {
  nodes: Node[];
  edges: Edge[];
}

interface Step {
  type: string;
  current: string;
  openSet: string[];
  closedSet: string[];
  path?: string[];
  cost?: number;
  message: string;
}

interface PathfindingResult {
  algorithm: string;
  path: string[];
  cost: number;
  steps: Step[];
  graph: Graph;
  start: string;
  goal: string;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  start: string;
  goal: string;
}

const algorithms = [
  { id: 'astar-euclidean', name: 'A* (Euclidean)', group: 'Informed' },
  { id: 'astar-manhattan', name: 'A* (Manhattan)', group: 'Informed' },
  { id: 'greedy', name: 'Greedy Best-First', group: 'Informed' },
  { id: 'dijkstra', name: 'Dijkstra', group: 'Uninformed' },
  { id: 'bfs', name: 'BFS', group: 'Uninformed' },
  { id: 'dfs', name: 'DFS', group: 'Uninformed' },
];

const complexityInfo: Record<string, string> = {
  'astar-euclidean': 'O(b^d)',
  'astar-manhattan': 'O(b^d)',
  'dijkstra': 'O((V+E)log V)',
  'bfs': 'O(V+E)',
  'dfs': 'O(V+E)',
  'greedy': 'O(b^m)',
};

export function PathfindingLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('simple');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('astar-euclidean');
  const [result, setResult] = useState<PathfindingResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Select a scenario and algorithm to begin');

  // Fetch scenarios on mount
  useEffect(() => {
    // For now, use hardcoded scenarios (API will be available after deployment)
    setScenarios([
      { id: 'simple', name: 'Simple Grid', description: 'Basic 4x4 grid', start: 'A1', goal: 'D4' },
      { id: 'maze', name: 'Maze', description: 'Path through obstacles', start: 'Start', goal: 'End' },
      { id: 'city', name: 'City Map', description: 'Navigate urban streets', start: 'Home', goal: 'Work' },
    ]);
  }, []);

  // Run algorithm
  const runAlgorithm = useCallback(async () => {
    setLoading(true);
    setMessage('Running algorithm...');

    try {
      const response = await fetch(`/api/pathfinding/run/${selectedScenario}/${selectedAlgorithm}`);
      const data = await response.json();

      if (data.error) {
        setMessage(`Error: ${data.error}`);
        setResult(null);
      } else {
        setResult(data);
        setCurrentStep(0);
        setMessage(data.steps[0]?.message || 'Algorithm loaded');
      }
    } catch (error) {
      // Fallback for local development without API
      setMessage('API not available - using demo data');
      const demoResult = generateDemoResult(selectedScenario, selectedAlgorithm);
      setResult(demoResult);
      setCurrentStep(0);
    }

    setLoading(false);
  }, [selectedScenario, selectedAlgorithm]);

  // Generate demo result for local testing
  const generateDemoResult = (scenarioId: string, algorithm: string): PathfindingResult => {
    const graphs: Record<string, Graph> = {
      simple: {
        nodes: [
          { id: 'A1', x: 80, y: 60 }, { id: 'A2', x: 200, y: 60 }, { id: 'A3', x: 320, y: 60 }, { id: 'A4', x: 440, y: 60 },
          { id: 'B1', x: 80, y: 150 }, { id: 'B2', x: 200, y: 150 }, { id: 'B3', x: 320, y: 150 }, { id: 'B4', x: 440, y: 150 },
          { id: 'C1', x: 80, y: 240 }, { id: 'C2', x: 200, y: 240 }, { id: 'C3', x: 320, y: 240 }, { id: 'C4', x: 440, y: 240 },
          { id: 'D1', x: 80, y: 330 }, { id: 'D2', x: 200, y: 330 }, { id: 'D3', x: 320, y: 330 }, { id: 'D4', x: 440, y: 330 },
        ],
        edges: [
          { from: 'A1', to: 'A2', cost: 1 }, { from: 'A2', to: 'A3', cost: 1 }, { from: 'A3', to: 'A4', cost: 1 },
          { from: 'B1', to: 'B2', cost: 1 }, { from: 'B2', to: 'B3', cost: 1 }, { from: 'B3', to: 'B4', cost: 1 },
          { from: 'C1', to: 'C2', cost: 1 }, { from: 'C2', to: 'C3', cost: 1 }, { from: 'C3', to: 'C4', cost: 1 },
          { from: 'D1', to: 'D2', cost: 1 }, { from: 'D2', to: 'D3', cost: 1 }, { from: 'D3', to: 'D4', cost: 1 },
          { from: 'A1', to: 'B1', cost: 1 }, { from: 'A2', to: 'B2', cost: 1 }, { from: 'A3', to: 'B3', cost: 1 }, { from: 'A4', to: 'B4', cost: 1 },
          { from: 'B1', to: 'C1', cost: 1 }, { from: 'B2', to: 'C2', cost: 1 }, { from: 'B3', to: 'C3', cost: 1 }, { from: 'B4', to: 'C4', cost: 1 },
          { from: 'C1', to: 'D1', cost: 1 }, { from: 'C2', to: 'D2', cost: 1 }, { from: 'C3', to: 'D3', cost: 1 }, { from: 'C4', to: 'D4', cost: 1 },
        ]
      },
      maze: {
        nodes: [
          { id: 'Start', x: 60, y: 180 }, { id: 'A', x: 160, y: 80 }, { id: 'B', x: 160, y: 180 },
          { id: 'C', x: 160, y: 280 }, { id: 'D', x: 280, y: 80 }, { id: 'E', x: 280, y: 180 },
          { id: 'F', x: 280, y: 280 }, { id: 'G', x: 400, y: 130 }, { id: 'H', x: 400, y: 230 },
          { id: 'End', x: 500, y: 180 }
        ],
        edges: [
          { from: 'Start', to: 'A', cost: 3 }, { from: 'Start', to: 'B', cost: 1 }, { from: 'Start', to: 'C', cost: 2 },
          { from: 'A', to: 'D', cost: 2 }, { from: 'B', to: 'E', cost: 1 }, { from: 'C', to: 'F', cost: 2 },
          { from: 'D', to: 'G', cost: 2 }, { from: 'E', to: 'G', cost: 3 }, { from: 'E', to: 'H', cost: 1 },
          { from: 'F', to: 'H', cost: 2 }, { from: 'G', to: 'End', cost: 2 }, { from: 'H', to: 'End', cost: 1 }
        ]
      },
      city: {
        nodes: [
          { id: 'Home', x: 60, y: 200 }, { id: 'Coffee', x: 160, y: 100 }, { id: 'Park', x: 160, y: 200 },
          { id: 'Gym', x: 160, y: 300 }, { id: 'Library', x: 300, y: 100 }, { id: 'Mall', x: 300, y: 200 },
          { id: 'School', x: 300, y: 300 }, { id: 'Office', x: 440, y: 150 }, { id: 'Work', x: 520, y: 200 }
        ],
        edges: [
          { from: 'Home', to: 'Coffee', cost: 3 }, { from: 'Home', to: 'Park', cost: 2 }, { from: 'Home', to: 'Gym', cost: 4 },
          { from: 'Coffee', to: 'Library', cost: 2 }, { from: 'Coffee', to: 'Park', cost: 1 }, { from: 'Park', to: 'Mall', cost: 2 },
          { from: 'Gym', to: 'Park', cost: 2 }, { from: 'Gym', to: 'School', cost: 3 }, { from: 'Library', to: 'Office', cost: 3 },
          { from: 'Mall', to: 'Office', cost: 2 }, { from: 'Mall', to: 'School', cost: 2 }, { from: 'School', to: 'Work', cost: 4 },
          { from: 'Office', to: 'Work', cost: 1 }
        ]
      }
    };

    const starts: Record<string, string> = { simple: 'A1', maze: 'Start', city: 'Home' };
    const goals: Record<string, string> = { simple: 'D4', maze: 'End', city: 'Work' };
    const paths: Record<string, string[]> = {
      simple: ['A1', 'B1', 'C1', 'D1', 'D2', 'D3', 'D4'],
      maze: ['Start', 'B', 'E', 'H', 'End'],
      city: ['Home', 'Park', 'Mall', 'Office', 'Work']
    };

    const graph = graphs[scenarioId] || graphs.simple;
    const path = paths[scenarioId] || paths.simple;

    return {
      algorithm: algorithms.find(a => a.id === algorithm)?.name || algorithm,
      path,
      cost: path.length - 1,
      steps: [
        { type: 'init', current: starts[scenarioId], openSet: [starts[scenarioId]], closedSet: [], message: 'Starting search...' },
        { type: 'explore', current: path[1], openSet: path.slice(1, 3), closedSet: [starts[scenarioId]], message: `Exploring ${path[1]}` },
        { type: 'success', current: goals[scenarioId], openSet: [], closedSet: path, path, cost: path.length - 1, message: 'Path found!' }
      ],
      graph,
      start: starts[scenarioId] || 'A1',
      goal: goals[scenarioId] || 'D4'
    };
  };

  // Draw graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { graph, path, start, goal, steps } = result;
    const step = steps[Math.min(currentStep, steps.length - 1)];

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = '#d4dbc0';
    ctx.lineWidth = 2;
    graph.edges.forEach(edge => {
      const from = graph.nodes.find(n => n.id === edge.from);
      const to = graph.nodes.find(n => n.id === edge.to);
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Draw edge cost
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.fillText(String(edge.cost), midX - 5, midY - 5);
      }
    });

    // Draw path if found
    if (step.path && step.path.length > 1) {
      ctx.strokeStyle = '#7a8e5a';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      for (let i = 0; i < step.path.length - 1; i++) {
        const from = graph.nodes.find(n => n.id === step.path![i]);
        const to = graph.nodes.find(n => n.id === step.path![i + 1]);
        if (from && to) {
          if (i === 0) ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw nodes
    graph.nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 22, 0, 2 * Math.PI);

      // Color based on state
      if (node.id === start) {
        ctx.fillStyle = '#4a5930'; // Primary green - start
      } else if (node.id === goal) {
        ctx.fillStyle = '#dc2626'; // Red - goal
      } else if (step.path?.includes(node.id)) {
        ctx.fillStyle = '#7a8e5a'; // Sage - in path
      } else if (node.id === step.current) {
        ctx.fillStyle = '#f59e0b'; // Amber - current
      } else if (step.closedSet?.includes(node.id)) {
        ctx.fillStyle = '#9ca3af'; // Gray - explored
      } else if (step.openSet?.includes(node.id)) {
        ctx.fillStyle = '#3b82f6'; // Blue - frontier
      } else {
        ctx.fillStyle = '#f0f2ec'; // Card background
      }

      ctx.fill();
      ctx.strokeStyle = '#4a5930';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = ctx.fillStyle === '#f0f2ec' ? '#1a1f17' : '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id, node.x, node.y);
    });

    setMessage(step.message);
  }, [result, currentStep]);

  // Animation playback
  useEffect(() => {
    if (!isPlaying || !result) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= result.steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(timer);
  }, [isPlaying, result]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6" data-allow-scroll>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl font-bold mb-2 text-gradient">Search & Pathfinding</h2>
        <p className="text-muted-foreground">
          Visualize how different algorithms explore graphs to find optimal paths
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[250px_1fr_200px] gap-4">
        {/* Left Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-xl p-4 shadow-soft border border-border h-fit"
        >
          <h3 className="font-semibold mb-3 text-primary">Scenarios</h3>
          <div className="space-y-2 mb-4">
            {scenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  selectedScenario === scenario.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-accent'
                }`}
              >
                {scenario.name}
              </button>
            ))}
          </div>

          <h3 className="font-semibold mb-3 text-primary">Algorithm</h3>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border mb-4"
          >
            <optgroup label="Informed Search">
              {algorithms.filter(a => a.group === 'Informed').map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </optgroup>
            <optgroup label="Uninformed Search">
              {algorithms.filter(a => a.group === 'Uninformed').map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </optgroup>
          </select>

          <button
            onClick={runAlgorithm}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Running...' : '🚀 Run Algorithm'}
          </button>
        </motion.div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 shadow-soft border border-border"
        >
          <canvas
            ref={canvasRef}
            width={560}
            height={400}
            className="w-full border border-border rounded-lg bg-background"
          />

          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!result}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            >
              {isPlaying ? '⏸ Pause' : '▶️ Play'}
            </button>
            <button
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, (result?.steps.length || 1) - 1))}
              disabled={!result}
              className="px-4 py-2 bg-secondary rounded-lg disabled:opacity-50"
            >
              ⏭️ Step
            </button>
            <button
              onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
              disabled={!result}
              className="px-4 py-2 bg-secondary rounded-lg disabled:opacity-50"
            >
              🔄 Reset
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-3">{message}</p>
        </motion.div>

        {/* Right Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-xl p-4 shadow-soft border border-border h-fit"
        >
          <h3 className="font-semibold mb-3 text-primary">Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Algorithm:</span>
              <span className="font-medium">{result?.algorithm || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Path Length:</span>
              <span className="font-medium">{result?.path?.length || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cost:</span>
              <span className="font-medium">{result?.cost ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Steps:</span>
              <span className="font-medium">{result?.steps?.length || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complexity:</span>
              <span className="font-medium">{complexityInfo[selectedAlgorithm] || '-'}</span>
            </div>
          </div>

          <h3 className="font-semibold mb-3 mt-6 text-primary">Legend</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#4a5930]"></span>
              <span>Start Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#dc2626]"></span>
              <span>Goal Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#3b82f6]"></span>
              <span>Frontier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#9ca3af]"></span>
              <span>Explored</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#7a8e5a]"></span>
              <span>Path</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
