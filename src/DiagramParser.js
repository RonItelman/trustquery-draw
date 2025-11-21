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
      'star': 'star',
      'pentagon': 'pentagon',
      'hexagon': 'hexagon',
    };
  }

  parse(input) {
    console.log('[DiagramParser] Starting parse with input:', input);

    this.nodes.clear();
    this.edges = [];
    this.nodeOrder = []; // Reset node order tracking

    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('[DiagramParser] Lines to process:', lines);

    lines.forEach((line, index) => {
      console.log(`[DiagramParser] Processing line ${index}: "${line}"`);
      this.parseLine(line);
    });

    const result = {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
    };

    console.log('[DiagramParser] Parse complete:', result);
    return result;
  }

  parseLine(line) {
    // Check if line contains any arrows
    if (line.includes('->') || line.includes('<-')) {
      this.parseArrowLine(line);
    } else {
      // Single node - create it
      this.ensureNode(line);
      console.log(`[DiagramParser] Added standalone node: ${line}`);
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

    // Create nodes and get their clean names
    const nodeNames = nodes.map(label => this.ensureNode(label));

    // Create edges based on arrow directions
    for (let i = 0; i < arrows.length; i++) {
      const arrow = arrows[i];
      const sourceName = nodeNames[i];
      const targetName = nodeNames[i + 1];

      if (!sourceName || !targetName) continue;

      if (arrow.direction === 'forward') {
        // source -> target
        this.edges.push({
          id: `${sourceName}-${targetName}-${this.edges.length}`,
          source: sourceName,
          target: targetName,
          label: arrow.edgeLabel,
        });
        console.log(`[DiagramParser] Created edge: ${sourceName} -> ${targetName}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);

      } else if (arrow.direction === 'backward') {
        // target <- source (swap them)
        this.edges.push({
          id: `${targetName}-${sourceName}-${this.edges.length}`,
          source: targetName,
          target: sourceName,
          label: arrow.edgeLabel,
        });
        console.log(`[DiagramParser] Created edge: ${targetName} <- ${sourceName}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);

      } else if (arrow.direction === 'bidirectional') {
        // source <-> target (create both edges)
        this.edges.push({
          id: `${sourceName}-${targetName}-${this.edges.length}`,
          source: sourceName,
          target: targetName,
          label: arrow.edgeLabel,
        });
        this.edges.push({
          id: `${targetName}-${sourceName}-${this.edges.length}`,
          source: targetName,
          target: sourceName,
          label: arrow.edgeLabel,
        });
        console.log(`[DiagramParser] Created bidirectional edge: ${sourceName} <-> ${targetName}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);
      }
    }
  }

  /**
   * Parse node label, extracting shape type if specified
   * Supports: "foo(shape:circle)" -> {name: "foo", type: "circle"}
   */
  parseNodeLabel(label) {
    const trimmed = label.trim();

    // Match pattern: name(shape:type)
    const match = trimmed.match(/^(.+?)\(shape:\s*(\w+)\)$/i);

    if (match) {
      const name = match[1].trim();
      const shapeType = match[2].toLowerCase();
      // Validate shape type
      const type = this.shapeKeywords[shapeType] || 'rectangle';
      return { name, type };
    }

    // No explicit shape, use label-based detection
    const lowerLabel = trimmed.toLowerCase();
    const type = this.shapeKeywords[lowerLabel] || 'rectangle';
    return { name: trimmed, type };
  }

  ensureNode(label) {
    const { name, type } = this.parseNodeLabel(label);

    if (!this.nodes.has(name)) {
      const node = {
        id: name,
        label: name,
        type: type,
      };

      this.nodes.set(name, node);
      this.nodeOrder.push(name); // Track order of appearance
      console.log(`[DiagramParser] Created node: ${name} (type: ${type}, order: ${this.nodeOrder.length - 1})`);
    } else {
      console.log(`[DiagramParser] Node already exists: ${name}`);
    }

    return name; // Return the node ID for edge creation
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
