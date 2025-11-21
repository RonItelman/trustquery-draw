import dagre from 'dagre';
import { MarkerType } from 'reactflow';

/**
 * ShapesParser - Parse arrow syntax with automatic shape type detection
 *
 * Syntax (same as arrow syntax):
 *   circle                    - Creates a circle node
 *   circle -> diamond         - Circle connected to diamond
 *   circle -label-> diamond   - Connection with label on arrow
 *
 * Smart shape detection:
 *   - If node label is "circle", "diamond", or "rectangle", use that as the type
 *   - Otherwise, default to rectangle type
 */
export default class ShapesHandler {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  /**
   * Parse arrow syntax with shape detection
   * @param {string} input - The input text (can be partial)
   * @returns {Object} - {nodes, edges}
   */
  parse(input) {
    console.log('[ShapesParser] Starting parse with input:', input);
    this.nodes.clear();
    this.edges = [];

    const trimmed = input.trim();
    if (!trimmed) {
      return { nodes: [], edges: [] };
    }

    // Split into lines and process each
    const lines = trimmed.split('\n');
    console.log('[ShapesParser] Lines to process:', lines);

    lines.forEach((line, index) => {
      line = line.trim();
      if (!line) return;

      console.log(`[ShapesParser] Processing line ${index}: "${line}"`);

      // Check if line contains arrow
      if (!line.includes('->')) {
        // Just a single node - add it
        const nodeLabel = line.trim();
        if (nodeLabel) {
          this.ensureNode(nodeLabel);
          console.log(`[ShapesParser] Added standalone node: ${nodeLabel}`);
        }
        return;
      }

      // Split by arrows and process as a chain: A -> B -> C
      const segments = line.split('->').map(s => s.trim());
      console.log(`[ShapesParser] Segments:`, segments);

      // Process each segment and create edges between consecutive nodes
      for (let i = 0; i < segments.length; i++) {
        let segment = segments[i];
        if (!segment) continue;

        let nodeLabel = segment;
        let edgeLabel = null;

        // Check if this segment has a label for the NEXT edge: "A -label" or "A-label"
        // Try with space first, then without
        let labelMatch = segment.match(/^(.+?)\s+-(\w+)$/);
        if (!labelMatch) {
          // Try without space, but only if the part before dash is a shape keyword
          labelMatch = segment.match(/^(\w+)-(\w+)$/);
          if (labelMatch) {
            const possibleShape = labelMatch[1].toLowerCase();
            const shapeKeywords = ['circle', 'square', 'rectangle', 'diamond', 'star', 'pentagon', 'hexagon'];
            // Only treat as shape+label if the first part is a shape keyword
            if (shapeKeywords.includes(possibleShape)) {
              nodeLabel = labelMatch[1].trim();
              edgeLabel = labelMatch[2].trim();
              console.log(`[ShapesParser] Found edge label (no space): "${edgeLabel}"`);
            }
          }
        } else {
          nodeLabel = labelMatch[1].trim();
          edgeLabel = labelMatch[2].trim();
          console.log(`[ShapesParser] Found edge label (with space): "${edgeLabel}"`);
        }

        // Create the node
        if (nodeLabel) {
          this.ensureNode(nodeLabel);
        }

        // Create edge to next node if exists
        if (i < segments.length - 1 && nodeLabel && segments[i + 1]) {
          const nextSegment = segments[i + 1].trim();
          // Extract next node label (might have its own edge label)
          let nextLabelMatch = nextSegment.match(/^(.+?)\s+-(\w+)$/);
          if (!nextLabelMatch) {
            nextLabelMatch = nextSegment.match(/^(\w+)-(\w+)$/);
          }
          const nextNodeLabel = nextLabelMatch ? nextLabelMatch[1].trim() : nextSegment;

          if (nextNodeLabel) {
            console.log(`[ShapesParser] Creating edge: ${nodeLabel} -${edgeLabel || ''}-> ${nextNodeLabel}`);
            this.edges.push({
              from: nodeLabel,
              to: nextNodeLabel,
              label: edgeLabel,
            });
          }
        }
      }
    });

    // Convert to ReactFlow format
    return this.toReactFlow();
  }

  /**
   * Ensure node exists, with smart shape type detection
   * Returns the node ID (which may differ from label for duplicate labels)
   */
  ensureNode(label, forceNew = false) {
    // If forceNew, always create a new node with unique ID
    if (forceNew || !this.nodes.has(label)) {
      // Detect shape type from label
      const lowerLabel = label.toLowerCase();
      let type = 'rectangle'; // Default type

      // Map label to shape type
      const shapeMap = {
        'circle': 'circle',
        'square': 'square',
        'rectangle': 'rectangle',
        'diamond': 'diamond',
        'star': 'star',
        'pentagon': 'pentagon',
        'hexagon': 'hexagon',
      };

      if (shapeMap[lowerLabel]) {
        type = shapeMap[lowerLabel];
      }

      // Generate unique ID if label already exists
      let id = label;
      if (this.nodes.has(label)) {
        let counter = 2;
        while (this.nodes.has(`${label}_${counter}`)) {
          counter++;
        }
        id = `${label}_${counter}`;
      }

      this.nodes.set(id, {
        id: id,
        label: label,
        type: type,
      });

      console.log(`[ShapesParser] Created node: ${id} (type: ${type})`);
      return id;
    }
    return label;
  }

  /**
   * Convert to ReactFlow format with auto-layout
   */
  toReactFlow() {
    const reactFlowNodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      type: node.type,
      data: { label: node.label },
      position: { x: 0, y: 0 },
      draggable: true,
    }));

    const reactFlowEdges = this.edges.map((edge, index) => {
      const isSelfLoop = edge.from === edge.to;
      return {
        id: `e${edge.from}-${edge.to}-${index}`,
        source: edge.from,
        target: edge.to,
        type: isSelfLoop ? 'selfLoop' : 'smoothstep',
        animated: false,
        style: {
          stroke: '#b1b1b7',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#b1b1b7',
        },
        ...(edge.label && {
          label: edge.label,
          labelStyle: { fill: '#000', fontWeight: 500 },
          labelBgStyle: { fill: '#fff' },
        }),
      };
    });

    // Apply auto-layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = this.getLayoutedElements(
      reactFlowNodes,
      reactFlowEdges,
      'LR'
    );

    return {
      nodes: layoutedNodes,
      edges: layoutedEdges,
    };
  }

  /**
   * Apply Dagre layout algorithm
   */
  getLayoutedElements(nodes, edges, direction = 'LR') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({
      rankdir: direction,
      nodesep: 60,  // Reduced spacing between nodes
      ranksep: 80,  // Reduced spacing between ranks
    });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 70, height: 70 });  // Match actual node size
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);

      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 35,  // Center the node (half of width)
          y: nodeWithPosition.y - 35,  // Center the node (half of height)
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }
}
