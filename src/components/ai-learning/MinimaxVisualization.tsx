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
      value: Math.floor(Math.random() * 21) - 10,
      player: isMax ? 'MAX' : 'MIN',
      children: []
    };
  }

  const numChildren = 2 + Math.floor(Math.random() * 2);
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

// Minimax algorithm
function minimax(node: TreeNode, isMax: boolean, steps: Step[]): number {
  if (node.children.length === 0) {
    steps.push({ node: node.id, action: 'evaluate', value: node.value! });
    return node.value!;
  }

  if (isMax) {
    let maxValue = -Infinity;
    for (const child of node.children) {
      const value = minimax(child, false, steps);
      maxValue = Math.max(maxValue, value);
    }
    node.value = maxValue;
    steps.push({ node: node.id, action: 'max', value: maxValue });
    return maxValue;
  } else {
    let minValue = Infinity;
    for (const child of node.children) {
      const value = minimax(child, true, steps);
      minValue = Math.min(minValue, value);
    }
    node.value = minValue;
    steps.push({ node: node.id, action: 'min', value: minValue });
    return minValue;
  }
}

// Alpha-beta pruning
function alphabeta(node: TreeNode, isMax: boolean, alpha: number, beta: number, steps: Step[]): number {
  if (node.children.length === 0) {
    steps.push({ node: node.id, action: 'evaluate', value: node.value!, alpha, beta });
    return node.value!;
  }

  if (isMax) {
    let maxValue = -Infinity;
    for (const child of node.children) {
      const value = alphabeta(child, false, alpha, beta, steps);
      maxValue = Math.max(maxValue, value);
      alpha = Math.max(alpha, maxValue);
      steps.push({ node: node.id, action: 'max', value: maxValue, alpha, beta });

      if (beta <= alpha) {
        steps.push({ node: node.id, action: 'prune', message: `Beta cutoff: ${beta} <= ${alpha}` });
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
      steps.push({ node: node.id, action: 'min', value: minValue, alpha, beta });

      if (beta <= alpha) {
        steps.push({ node: node.id, action: 'prune', message: `Alpha cutoff: ${beta} <= ${alpha}` });
        break;
      }
    }
    node.value = minValue;
    return minValue;
  }
}

// Tree visualization component
function TreeVisualization({ tree, currentStep, steps }: { tree: TreeNode; currentStep: number; steps: Step[] }) {
  const evaluatedNodes = new Map<string, number>();
  let activeNode = '';

  for (let i = 0; i <= currentStep && i < steps.length; i++) {
    const step = steps[i];
    if (step.action === 'evaluate' || step.action === 'max' || step.action === 'min') {
      evaluatedNodes.set(step.node, step.value!);
    }
    if (i === currentStep) {
      activeNode = step.node;
    }
  }

  const renderNode = (node: TreeNode, depth: number) => {
    const isLeaf = node.children.length === 0;
    const isActive = activeNode === node.id;
    const isEvaluated = evaluatedNodes.has(node.id);
    const displayValue = isEvaluated ? evaluatedNodes.get(node.id) : (isLeaf ? node.value : '?');

    let bgColor = 'bg-card border-border';
    if (isLeaf) {
      bgColor = 'bg-amber-500 border-amber-600';
    } else if (node.player === 'MAX') {
      bgColor = isEvaluated ? 'bg-sage-500 border-sage-600' : 'bg-sage-300 border-sage-400';
    } else {
      bgColor = isEvaluated ? 'bg-red-500 border-red-600' : 'bg-red-300 border-red-400';
    }

    if (isActive) {
      bgColor = 'bg-blue-500 border-blue-400 ring-2 ring-blue-300';
    }

    return (
      <div key={node.id} className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${bgColor} border-2 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md`}
        >
          {displayValue}
        </motion.div>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{node.player}</span>

        {node.children.length > 0 && (
          <div className="flex gap-2 sm:gap-3 mt-3 relative">
            {/* Connector lines drawn with CSS */}
            <div className="absolute -top-3 left-1/2 w-px h-3 bg-sage-600" />
            {node.children.length > 1 && (
              <div
                className="absolute -top-3 h-px bg-sage-600"
                style={{
                  left: `calc(${100 / (2 * node.children.length)}% + 4px)`,
                  right: `calc(${100 / (2 * node.children.length)}% + 4px)`
                }}
              />
            )}
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                {/* Vertical line down to child */}
                <div className="absolute -top-3 left-1/2 w-px h-3 bg-sage-600" />
                {renderNode(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center overflow-x-auto py-4">
      {renderNode(tree, 0)}
    </div>
  );
}

export function MinimaxVisualization() {
  const [depth, setDepth] = useState(3);
  const [algorithm, setAlgorithm] = useState<'minimax' | 'alphabeta'>('minimax');
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [result, setResult] = useState<MinimaxResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('Generate a tree to begin');

  const handleGenerateTree = useCallback(() => {
    const newTree = generateTree(depth);
    setTree(newTree);
    setResult(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setMessage(`Tree generated with depth ${depth}. Click Solve to run algorithm.`);
  }, [depth]);

  const handleSolve = useCallback(() => {
    if (!tree) return;

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
    setMessage(`Running ${algorithm === 'minimax' ? 'Minimax' : 'Alpha-Beta'}...`);
  }, [tree, algorithm]);

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
    }, 700);

    return () => clearInterval(timer);
  }, [isPlaying, result]);

  useEffect(() => {
    handleGenerateTree();
  }, [handleGenerateTree]);

  return (
    <div className="p-4 sm:p-6">
      <div className="grid lg:grid-cols-[200px_1fr] gap-4">
        {/* Controls */}
        <div className="bg-background rounded-xl p-4 border border-border">
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
                name="algo"
                checked={algorithm === 'minimax'}
                onChange={() => setAlgorithm('minimax')}
                className="accent-primary"
              />
              <span className="text-sm">Standard Minimax</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="algo"
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
        </div>

        {/* Tree Visualization */}
        <div className="flex flex-col">
          <div className="min-h-[350px] flex items-center justify-center overflow-x-auto bg-background rounded-xl border border-border">
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
                <span className="text-muted-foreground">Optimal: </span>
                <span className="font-medium">{result.value}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-background rounded-xl p-4 border border-border">
          <h4 className="font-semibold text-primary mb-2">Minimax</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• MAX player tries to maximize score</li>
            <li>• MIN player tries to minimize score</li>
            <li>• Evaluates all possible game states</li>
            <li>• Assumes optimal play from both</li>
          </ul>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <h4 className="font-semibold text-primary mb-2">Alpha-Beta Pruning</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Alpha (α): Best MAX can guarantee</li>
            <li>• Beta (β): Best MIN can guarantee</li>
            <li>• Prunes when α ≥ β</li>
            <li>• Same result, fewer evaluations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
