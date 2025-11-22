import dagre from 'dagre';
import { MarkerType } from 'reactflow';

export class DiagramParser {
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
    };
  }

  parse(input) {
    console.log('[DiagramParser] *** NEW REFACTORED CODE LOADED ***');
    console.log('[DiagramParser] Starting parse with input:', input);

    this.nodes.clear();
    this.edges = [];
    this.nodeOrder = []; // Reset node order tracking

    // Check if input contains arrows
    if (input.includes('->') || input.includes('<-')) {
      console.log('[DiagramParser] Contains arrows - using parseArrowSyntax (supports multi-line labels)');
      // Parse as arrow syntax - this allows multi-line node labels
      this.parseArrowSyntax(input);
    } else {
      console.log('[DiagramParser] No arrows - using parseStandaloneNodes');
      // No arrows - split by lines and create standalone nodes
      this.parseStandaloneNodes(input);
    }

    const result = {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
    };

    console.log('[DiagramParser] Parse complete:', result);
    return result;
  }

  parseStandaloneNodes(input) {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('[DiagramParser] Lines to process (no arrows):', lines);

    lines.forEach((line, index) => {
      console.log(`[DiagramParser] Processing line ${index}: "${line}"`);
      this.ensureNode(line);
    });
  }

  parseArrowSyntax(input) {
    const arrows = this.findArrows(input);
    if (arrows.length === 0) return;

    const nodeLabels = this.extractNodeLabels(input, arrows);
    const nodeNames = nodeLabels.map(label => this.ensureNode(label));

    this.createEdgesFromArrows(arrows, nodeNames);
  }

  findArrows(input) {
    const arrowPattern = /<-([^<>]+)->|<->|-([^-<>]+)->|->|<-/g;
    const arrows = [];
    let match;

    while ((match = arrowPattern.exec(input)) !== null) {
      const arrowType = match[0];
      let edgeLabel = null;
      let direction = 'forward';

      if (match[1]) {
        edgeLabel = match[1].trim();
        direction = 'bidirectional';
      } else if (match[2]) {
        edgeLabel = match[2].trim();
        direction = 'forward';
      } else if (arrowType === '<->') {
        direction = 'bidirectional';
      } else if (arrowType === '<-') {
        direction = 'backward';
      }

      arrows.push({
        index: match.index,
        length: arrowType.length,
        direction,
        edgeLabel,
        raw: arrowType
      });
    }

    return arrows;
  }

  extractNodeLabels(input, arrows) {
    const nodes = [];
    let lastIndex = 0;

    arrows.forEach((arrow, i) => {
      const nodeLabel = input.substring(lastIndex, arrow.index).trim();
      if (nodeLabel) {
        nodes.push(nodeLabel);
      }

      if (i === arrows.length - 1) {
        const finalLabel = input.substring(arrow.index + arrow.length).trim();
        if (finalLabel) {
          nodes.push(finalLabel);
        }
      }

      lastIndex = arrow.index + arrow.length;
    });

    return nodes;
  }

  createEdgesFromArrows(arrows, nodeNames) {
    for (let i = 0; i < arrows.length; i++) {
      const arrow = arrows[i];
      const sourceName = nodeNames[i];
      const targetName = nodeNames[i + 1];

      if (!sourceName || !targetName) continue;

      if (arrow.direction === 'forward') {
        this.createEdge(sourceName, targetName, arrow.edgeLabel);
        console.log(`[DiagramParser] Created edge: ${sourceName} -> ${targetName}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);
      } else if (arrow.direction === 'backward') {
        this.createEdge(targetName, sourceName, arrow.edgeLabel);
        console.log(`[DiagramParser] Created edge: ${targetName} <- ${sourceName}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);
      } else if (arrow.direction === 'bidirectional') {
        this.createEdge(sourceName, targetName, arrow.edgeLabel);
        this.createEdge(targetName, sourceName, arrow.edgeLabel);
        console.log(`[DiagramParser] Created bidirectional edge: ${sourceName} <-> ${targetName}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);
      }
    }
  }

  createEdge(source, target, label) {
    this.edges.push({
      id: `${source}-${target}-${this.edges.length}`,
      source,
      target,
      label,
    });
  }


  ensureNode(label) {
    const trimmed = label.trim();

    // Detect shape type based on the label text itself
    const lowerLabel = trimmed.toLowerCase();
    const type = this.shapeKeywords[lowerLabel] || 'rectangle';

    if (!this.nodes.has(trimmed)) {
      const node = {
        id: trimmed,
        label: trimmed,
        type: type,
      };

      this.nodes.set(trimmed, node);
      this.nodeOrder.push(trimmed); // Track order of appearance
      console.log(`[DiagramParser] Created node: ${trimmed} (type: ${type}, order: ${this.nodeOrder.length - 1})`);
    } else {
      console.log(`[DiagramParser] Node already exists: ${trimmed}`);
    }

    return trimmed; // Return the node ID for edge creation
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
      type: edge.source === edge.target ? 'selfLoop' : 'smoothstep',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }));

    return { nodes: layoutedNodes, edges: formattedEdges };
  }
}
