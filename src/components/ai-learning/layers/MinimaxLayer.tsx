'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TreeNode {
  id: string;
  value: number | null;
  player: 'MAX' | 'MIN';
  children: TreeNode[];
}

interface Step {
  node: string;
  action: 'evaluate' | 'max' | 'min' | 'prune';
  value?: number;
  alpha?: number;
  beta?: number;
  message?: string;
}

interface MinimaxResult {
  algorithm: string;
  tree: TreeNode;
  value: number;
  steps: Step[];
}

// Generate a random game tree
function generateTree(depth: number, nodeId: string = 'root', isMax: boolean = true): TreeNode {
  if (depth === 0) {
    return {
      id: nodeId,
      value: Math.floor(Math.random() * 21) - 10, // -10 to 10
      player: isMax ? 'MAX' : 'MIN',
      children: []
    };
  }

  const numChildren = 2 + Math.floor(Math.random() * 2); // 2-3 children
  const children: TreeNode[] = [];

  for (let i = 0; i < numChildren; i++) {
    children.push(generateTree(depth - 1, `${nodeId}-${i}`, !isMax));
  }

  return {
    id: nodeId,
    value: null,
    player: isMax ? 'MAX' : 'MIN',
    children
  };
}

// Run minimax algorithm
function minimax(node: TreeNode, isMax: boolean, steps: Step[]): number {
  if (node.children.length === 0) {
    steps.push({
      node: node.id,
      action: 'evaluate',
      value: node.value!
    });
    return node.value!;
  }

  if (isMax) {
    let maxValue = -Infinity;
    for (const child of node.children) {
      const value = minimax(child, false, steps);
      maxValue = Math.max(maxValue, value);
    }
    node.value = maxValue;
    steps.push({
      node: node.id,
      action: 'max',
      value: maxValue
    });
    return maxValue;
  } else {
    let minValue = Infinity;
    for (const child of node.children) {
      const value = minimax(child, true, steps);
      minValue = Math.min(minValue, value);
    }
    node.value = minValue;
    steps.push({
      node: node.id,
      action: 'min',
      value: minValue
    });
    return minValue;
  }
}

// Run alpha-beta pruning
function alphabeta(
  node: TreeNode,
  isMax: boolean,
  alpha: number,
  beta: number,
  steps: Step[]
): number {
  if (node.children.length === 0) {
    steps.push({
      node: node.id,
      action: 'evaluate',
      value: node.value!,
      alpha,
      beta
    });
    return node.value!;
  }

  if (isMax) {
    let maxValue = -Infinity;
    for (const child of node.children) {
      const value = alphabeta(child, false, alpha, beta, steps);
      maxValue = Math.max(maxValue, value);
      alpha = Math.max(alpha, maxValue);

      steps.push({
        node: node.id,
        action: 'max',
        value: maxValue,
        alpha,
        beta
      });

      if (beta <= alpha) {
        steps.push({
          node: node.id,
          action: 'prune',
          message: `Beta cutoff: ${beta} <= ${alpha}`
        });
        break;
      }
    }
    node.value = maxValue;
    return maxValue;
  } else {
    let minValue = Infinity;
    for (const child of node.children) {
      const value = alphabeta(child, true, alpha, beta, steps);
      minValue = Math.min(minValue, value);
      beta = Math.min(beta, minValue);

      steps.push({
        node: node.id,
        action: 'min',
        value: minValue,
        alpha,
        beta
      });

      if (beta <= alpha) {
        steps.push({
          node: node.id,
          action: 'prune',
          message: `Alpha cutoff: ${beta} <= ${alpha}`
        });
        break;
      }
    }
    node.value = minValue;
    return minValue;
  }
}

// Tree visualization component
function TreeVisualization({ tree, currentStep, steps }: { tree: TreeNode; currentStep: number; steps: Step[] }) {
  const activeNodes = new Set<string>();
  const evaluatedNodes = new Map<string, number>();
  const prunedNodes = new Set<string>();

  // Process steps up to currentStep
  for (let i = 0; i <= currentStep && i < steps.length; i++) {
    const step = steps[i];
    if (step.action === 'evaluate' || step.action === 'max' || step.action === 'min') {
      evaluatedNodes.set(step.node, step.value!);
    }
    if (step.action === 'prune') {
      prunedNodes.add(step.node);
    }
    if (i === currentStep) {
      activeNodes.add(step.node);
    }
  }

  const renderNode = (node: TreeNode, depth: number, index: number, totalAtDepth: number) => {
    const isLeaf = node.children.length === 0;
    const isActive = activeNodes.has(node.id);
    const isEvaluated = evaluatedNodes.has(node.id);
    const displayValue = isEvaluated ? evaluatedNodes.get(node.id) : (isLeaf ? node.value : '?');

    let bgColor = 'bg-card';
    if (isLeaf) {
      bgColor = 'bg-amber-500';
    } else if (node.player === 'MAX') {
      bgColor = isEvaluated ? 'bg-sage-500' : 'bg-sage-300';
    } else {
      bgColor = isEvaluated ? 'bg-red-500' : 'bg-red-300';
    }

    if (isActive) {
      bgColor = 'bg-blue-500 ring-4 ring-blue-300';
    }

    return (
      <div key={node.id} className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white/20`}
        >
          {displayValue}
        </motion.div>
        <span className="text-[10px] text-muted-foreground mt-1">{node.player}</span>

        {node.children.length > 0 && (
          <div className="flex gap-2 mt-3 relative">
            {/* Connection lines */}
            <svg className="absolute -top-3 left-0 w-full h-3 overflow-visible" style={{ pointerEvents: 'none' }}>
              {node.children.map((_, i) => {
                const totalWidth = (node.children.length - 1) * 60;
                const startX = totalWidth / 2;
                const endX = i * 60 - startX + 20;
                return (
                  <line
                    key={i}
                    x1="50%"
                    y1="0"
                    x2={`calc(50% + ${endX}px)`}
                    y2="12"
                    stroke="#4a5930"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
            {node.children.map((child, i) => renderNode(child, depth + 1, i, node.children.length))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center overflow-x-auto py-4">
      {renderNode(tree, 0, 0, 1)}
    </div>
  );
}

export function MinimaxLayer() {
  const [depth, setDepth] = useState(3);
  const [algorithm, setAlgorithm] = useState<'minimax' | 'alphabeta'>('minimax');
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [result, setResult] = useState<MinimaxResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('Generate a tree to begin');

  // Generate new tree
  const handleGenerateTree = useCallback(() => {
    const newTree = generateTree(depth);
    setTree(newTree);
    setResult(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setMessage(`Tree generated with depth ${depth}. Click Solve to run algorithm.`);
  }, [depth]);

  // Solve tree
  const handleSolve = useCallback(() => {
    if (!tree) return;

    // Deep clone tree for solving
    const treeCopy = JSON.parse(JSON.stringify(tree));
    const steps: Step[] = [];
    let value: number;

    if (algorithm === 'minimax') {
      value = minimax(treeCopy, true, steps);
    } else {
      value = alphabeta(treeCopy, true, -Infinity, Infinity, steps);
    }

    setResult({
      algorithm: algorithm === 'minimax' ? 'Standard Minimax' : 'Alpha-Beta Pruning',
      tree: treeCopy,
      value,
      steps
    });
    setCurrentStep(0);
    setMessage(`Running ${algorithm === 'minimax' ? 'Minimax' : 'Alpha-Beta Pruning'}...`);
  }, [tree, algorithm]);

  // Animation playback
  useEffect(() => {
    if (!isPlaying || !result) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= result.steps.length - 1) {
          setIsPlaying(false);
          setMessage(`Complete! Optimal value: ${result.value}`);
          return prev;
        }

        const step = result.steps[prev + 1];
        if (step.action === 'evaluate') {
          setMessage(`Evaluating leaf: ${step.value}`);
        } else if (step.action === 'max') {
          setMessage(`MAX chooses: ${step.value}`);
        } else if (step.action === 'min') {
          setMessage(`MIN chooses: ${step.value}`);
        } else if (step.action === 'prune') {
          setMessage(`Pruning: ${step.message}`);
        }

        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [isPlaying, result]);

  // Generate tree on mount
  useEffect(() => {
    handleGenerateTree();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6" data-allow-scroll>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl font-bold mb-2 text-gradient">Minimax Algorithm</h2>
        <p className="text-muted-foreground">
          Explore game tree search and how Alpha-Beta pruning optimizes decisions
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-4">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-xl p-4 shadow-soft border border-border h-fit"
        >
          <h3 className="font-semibold mb-3 text-primary">Settings</h3>

          <label className="block text-sm mb-1 text-muted-foreground">
            Tree Depth: <span className="font-bold text-primary">{depth}</span>
          </label>
          <input
            type="range"
            min={2}
            max={4}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full mb-4 accent-primary"
          />

          <h3 className="font-semibold mb-3 text-primary">Algorithm</h3>
          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="algorithm"
                checked={algorithm === 'minimax'}
                onChange={() => setAlgorithm('minimax')}
                className="accent-primary"
              />
              <span className="text-sm">Standard Minimax</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="algorithm"
                checked={algorithm === 'alphabeta'}
                onChange={() => setAlgorithm('alphabeta')}
                className="accent-primary"
              />
              <span className="text-sm">Alpha-Beta Pruning</span>
            </label>
          </div>

          <button
            onClick={handleGenerateTree}
            className="w-full bg-secondary text-secondary-foreground py-2 rounded-lg hover:opacity-90 mb-2"
          >
            🌳 Generate Tree
          </button>
          <button
            onClick={handleSolve}
            disabled={!tree}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            🎯 Solve
          </button>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="font-semibold mb-3 text-primary">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-sage-500"></span>
                <span>MAX (maximizes)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500"></span>
                <span>MIN (minimizes)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-500"></span>
                <span>Leaf (score)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500"></span>
                <span>Current node</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tree Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 shadow-soft border border-border"
        >
          <div className="min-h-[350px] flex items-center justify-center overflow-x-auto">
            {result ? (
              <TreeVisualization tree={result.tree} currentStep={currentStep} steps={result.steps} />
            ) : tree ? (
              <TreeVisualization tree={tree} currentStep={-1} steps={[]} />
            ) : (
              <p className="text-muted-foreground">Generating tree...</p>
            )}
          </div>

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

          {/* Stats */}
          {result && (
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Algorithm: </span>
                <span className="font-medium">{result.algorithm}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Steps: </span>
                <span className="font-medium">{result.steps.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Optimal Value: </span>
                <span className="font-medium">{result.value}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl p-6 shadow-soft border border-border mt-6"
      >
        <h3 className="font-semibold text-primary mb-3">How It Works</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-2">Minimax</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• MAX player tries to maximize the score</li>
              <li>• MIN player tries to minimize the score</li>
              <li>• Recursively evaluates all possible moves</li>
              <li>• Assumes both players play optimally</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Alpha-Beta Pruning</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Alpha (α): Best value MAX can guarantee</li>
              <li>• Beta (β): Best value MIN can guarantee</li>
              <li>• Prunes branches when α ≥ β</li>
              <li>• Same result, fewer nodes evaluated</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
