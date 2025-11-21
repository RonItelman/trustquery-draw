import dagre from 'dagre';
import { MarkerType } from 'reactflow';

export class HybridParser {
  constructor() {
    this.nodes = new Map(); // Map of label -> node
    this.edges = [];
    this.nodeOrder = []; // Track order of node appearance in input

    // Shape keywords that map to specific node types
    this.shapeKeywords = {
      'circle': 'circle',
      'square': 'square',
      'rectangle': 'rectangle',
      'diamond': 'diamond',
      'star': 'star',
      'pentagon': 'pentagon',
      'hexagon': 'hexagon',
    };
  }

  parse(input) {
    console.log('[HybridParser] Starting parse with input:', input);

    this.nodes.clear();
    this.edges = [];
    this.nodeOrder = []; // Reset node order tracking

    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('[HybridParser] Lines to process:', lines);

    lines.forEach((line, index) => {
      console.log(`[HybridParser] Processing line ${index}: "${line}"`);
      this.parseLine(line);
    });

    const result = {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
    };

    console.log('[HybridParser] Parse complete:', result);
    return result;
  }

  parseLine(line) {
    // Check if line contains any arrows
    if (line.includes('->') || line.includes('<-')) {
      this.parseArrowLine(line);
    } else {
      // Single node - create it
      this.ensureNode(line);
      console.log(`[HybridParser] Added standalone node: ${line}`);
    }
  }

  parseArrowLine(line) {
    // Regular expression to match arrow patterns
    // Matches: <-label->, <->, -label->, ->, <-
    const arrowPattern = /<-([^<>]+)->|<->|-([^-<>]+)->|->|<-/g;

    const arrows = [];
    let match;

    // Find all arrows and their positions
    while ((match = arrowPattern.exec(line)) !== null) {
      const arrowType = match[0];
      let edgeLabel = null;
      let direction = 'forward'; // forward, backward, or bidirectional

      if (match[1]) {
        // Bidirectional with label: <-label->
        edgeLabel = match[1].trim();
        direction = 'bidirectional';
      } else if (match[2]) {
        // Forward with label: -label->
        edgeLabel = match[2].trim();
        direction = 'forward';
      } else if (arrowType === '<->') {
        // Bidirectional without label
        direction = 'bidirectional';
      } else if (arrowType === '<-') {
        // Backward arrow
        direction = 'backward';
      } else if (arrowType === '->') {
        // Forward arrow
        direction = 'forward';
      }

      arrows.push({
        index: match.index,
        length: arrowType.length,
        direction,
        edgeLabel,
        raw: arrowType
      });
    }

    if (arrows.length === 0) {
      // No arrows found, treat as single node
      this.ensureNode(line);
      return;
    }

    // Extract node labels between arrows
    let lastIndex = 0;
    const nodes = [];

    arrows.forEach((arrow, i) => {
      // Get text before this arrow
      const nodeLabel = line.substring(lastIndex, arrow.index).trim();
      if (nodeLabel) {
        nodes.push(nodeLabel);
      }

      // If this is the last arrow, get text after it
      if (i === arrows.length - 1) {
        const finalLabel = line.substring(arrow.index + arrow.length).trim();
        if (finalLabel) {
          nodes.push(finalLabel);
        }
      }

      lastIndex = arrow.index + arrow.length;
    });

    // Create nodes
    nodes.forEach(label => {
      this.ensureNode(label);
    });

    // Create edges based on arrow directions
    for (let i = 0; i < arrows.length; i++) {
      const arrow = arrows[i];
      const sourceLabel = nodes[i];
      const targetLabel = nodes[i + 1];

      if (!sourceLabel || !targetLabel) continue;

      if (arrow.direction === 'forward') {
        // source -> target
        this.edges.push({
          id: `${sourceLabel}-${targetLabel}-${this.edges.length}`,
          source: sourceLabel,
          target: targetLabel,
          label: arrow.edgeLabel,
        });
        console.log(`[HybridParser] Created edge: ${sourceLabel} -> ${targetLabel}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);

      } else if (arrow.direction === 'backward') {
        // target <- source (swap them)
        // Edge goes from "that" (right) to "this" (left)
        // Uses default positions: output from right side, input to left side
        this.edges.push({
          id: `${targetLabel}-${sourceLabel}-${this.edges.length}`,
          source: targetLabel,
          target: sourceLabel,
          label: arrow.edgeLabel,
        });
        console.log(`[HybridParser] Created edge: ${targetLabel} <- ${sourceLabel}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);

      } else if (arrow.direction === 'bidirectional') {
        // source <-> target (create both edges)
        this.edges.push({
          id: `${sourceLabel}-${targetLabel}-${this.edges.length}`,
          source: sourceLabel,
          target: targetLabel,
          label: arrow.edgeLabel,
        });
        this.edges.push({
          id: `${targetLabel}-${sourceLabel}-${this.edges.length}`,
          source: targetLabel,
          target: sourceLabel,
          label: arrow.edgeLabel,
        });
        console.log(`[HybridParser] Created bidirectional edge: ${sourceLabel} <-> ${targetLabel}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);
      }
    }
  }

  ensureNode(label) {
    const trimmedLabel = label.trim();

    if (!this.nodes.has(trimmedLabel)) {
      // Determine node type based on label
      const lowerLabel = trimmedLabel.toLowerCase();
      let type = 'rectangle'; // Default type

      // Check if label matches a shape keyword
      if (this.shapeKeywords[lowerLabel]) {
        type = this.shapeKeywords[lowerLabel];
      }

      const node = {
        id: trimmedLabel,
        label: trimmedLabel,
        type: type,
      };

      this.nodes.set(trimmedLabel, node);
      this.nodeOrder.push(trimmedLabel); // Track order of appearance
      console.log(`[HybridParser] Created node: ${trimmedLabel} (type: ${type}, order: ${this.nodeOrder.length - 1})`);
    } else {
      console.log(`[HybridParser] Node already exists: ${trimmedLabel}`);
    }
  }

  layoutGraph(nodes, edges) {
    // Position nodes based on their appearance order in the input
    // This preserves the visual left-to-right order as typed
    const horizontalSpacing = 150;
    const verticalSpacing = 100;
    const startX = 100;
    const startY = 100;

    // Create a map to track which nodes appear on the same line
    const nodePositions = new Map();

    // Find backward edges to offset their targets vertically
    const backwardTargets = new Set();
    edges.forEach(edge => {
      // Check if this is a backward edge (source is to the right of target in nodeOrder)
      const sourceIndex = this.nodeOrder.indexOf(edge.source);
      const targetIndex = this.nodeOrder.indexOf(edge.target);
      if (sourceIndex > targetIndex) {
        backwardTargets.add(edge.target);
      }
    });

    // Simple layout: position nodes left-to-right in order of appearance
    this.nodeOrder.forEach((nodeId, index) => {
      const yOffset = backwardTargets.has(nodeId) ? verticalSpacing : 0;
      nodePositions.set(nodeId, {
        x: startX + (index * horizontalSpacing),
        y: startY + yOffset,
      });
    });

    // Apply positions to nodes
    return nodes.map(node => {
      const position = nodePositions.get(node.id) || { x: startX, y: startY };
      return {
        id: node.id,
        type: node.type,
        position: position,
        data: { label: node.label },
      };
    });
  }

  getNodesAndEdges(input) {
    const { nodes, edges } = this.parse(input);
    const layoutedNodes = this.layoutGraph(nodes, edges);

    const formattedEdges = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }));

    return { nodes: layoutedNodes, edges: formattedEdges };
  }
}
