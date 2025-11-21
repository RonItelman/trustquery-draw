import dagre from 'dagre';
import { MarkerType } from 'reactflow';

/**
 * Parse arrow syntax and convert to ReactFlow nodes and edges
 *
 * Syntax:
 *   A -> B                    (simple edge)
 *   A -yes-> B                (edge with label)
 *   A -no-> C                 (edge with label)
 *
 * Rules:
 *   1. Label = ID (node identity is its label text)
 *   2. Input handles on LEFT, output handles on RIGHT
 *   3. Diamond shape ONLY if has yes/no or true/false labeled outputs
 *   4. Simple JSON format for debugging
 */
export class ArrowSyntaxParser {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  /**
   * Parse arrow syntax and return ReactFlow compatible format
   */
  parse(input) {
    console.log('[ArrowSyntaxParser] Starting parse with input:', input);
    this.nodes.clear();
    this.edges = [];

    // Split into lines and process each
    const lines = input.trim().split('\n');
    console.log('[ArrowSyntaxParser] Lines to process:', lines);

    lines.forEach((line, index) => {
      line = line.trim();
      if (!line) return;

      console.log(`[ArrowSyntaxParser] Processing line ${index}: "${line}"`);

      // Simple approach: split on ->
      if (!line.includes('->')) {
        console.warn(`[ArrowSyntaxParser] Line does not contain arrow: "${line}"`);
        return;
      }

      const arrowIndex = line.indexOf('->');
      const beforeArrow = line.substring(0, arrowIndex).trim();
      const afterArrow = line.substring(arrowIndex + 2).trim();

      console.log(`[ArrowSyntaxParser] Before arrow: "${beforeArrow}"`);
      console.log(`[ArrowSyntaxParser] After arrow: "${afterArrow}"`);

      // Check if there's a label: "A -label" -> extract label
      let fromLabel = beforeArrow;
      let edgeLabel = null;

      const labelMatch = beforeArrow.match(/^(.+?)\s+-(\w+)$/);
      if (labelMatch) {
        fromLabel = labelMatch[1].trim();
        edgeLabel = labelMatch[2].trim();
        console.log(`[ArrowSyntaxParser] Found label: "${edgeLabel}"`);
      }

      const toLabel = afterArrow;

      if (fromLabel && toLabel) {

        console.log(`[ArrowSyntaxParser] Parsed: ${fromLabel} -${edgeLabel || ''}-> ${toLabel}`);

        // Create nodes (label = id)
        this.ensureNode(fromLabel);
        this.ensureNode(toLabel);

        // Create edge in simple format
        this.edges.push({
          from: fromLabel,
          to: toLabel,
          label: edgeLabel,
        });
      }
    });

    // Detect diamond nodes based on yes/no or true/false outputs
    this.detectDiamondNodes();

    // Log simple JSON format
    this.logGraph();

    // Convert to ReactFlow format
    return this.toReactFlow();
  }

  /**
   * Ensure node exists (create if needed)
   */
  ensureNode(label) {
    if (!this.nodes.has(label)) {
      this.nodes.set(label, {
        id: label,           // Label IS the ID
        label: label,
        type: 'rectangle',   // Default type
      });
    }
  }

  /**
   * Detect diamond nodes based on yes/no or true/false labeled outputs
   */
  detectDiamondNodes() {
    this.nodes.forEach((node, nodeId) => {
      // Get outgoing edges for this node
      const outgoingEdges = this.edges.filter(e => e.from === nodeId);
      const labels = outgoingEdges
        .map(e => e.label?.toLowerCase())
        .filter(Boolean);

      // Check for yes/no or true/false pairs
      const hasYesNo = labels.includes('yes') || labels.includes('no');
      const hasTrueFalse = labels.includes('true') || labels.includes('false');

      if (hasYesNo || hasTrueFalse) {
        node.type = 'diamond';
      }
    });
  }

  /**
   * Log simple JSON format for debugging
   */
  logGraph() {
    const graph = {
      nodes: Array.from(this.nodes.values()).map(node => ({
        id: node.id,
        type: node.type,
        label: node.label,
      })),
      edges: this.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        ...(edge.label && { label: edge.label }),
      })),
    };

    console.log('[ArrowSyntaxParser] Graph created:');
    console.log(JSON.stringify(graph, null, 2));

    return graph;
  }

  /**
   * Convert to ReactFlow format with auto-layout
   */
  toReactFlow() {
    // Convert nodes to ReactFlow format
    const reactFlowNodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      type: node.type,
      data: { label: node.label },
      position: { x: 0, y: 0 },  // Will be set by layout
      draggable: true,
    }));

    // Convert edges to ReactFlow format
    const reactFlowEdges = this.edges.map((edge, index) => ({
      id: `e${edge.from}-${edge.to}-${index}`,
      source: edge.from,
      target: edge.to,
      type: 'smoothstep',
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
    }));

    // Apply auto-layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = this.getLayoutedElements(
      reactFlowNodes,
      reactFlowEdges,
      'LR'  // Left-to-right (input left, output right)
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
      rankdir: direction,  // LR = left-to-right (input left, output right)
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

export default ArrowSyntaxParser;
