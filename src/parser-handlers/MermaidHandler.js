import dagre from 'dagre';
import { MarkerType } from 'reactflow';

/**
 * Parse Mermaid flowchart syntax and convert to ReactFlow nodes and edges
 * Supports basic flowchart syntax like:
 * flowchart TD
 *   A[Start] --> B{Decision}
 *   B -->|Yes| C[OK]
 *   B -->|No| D[End]
 */
export class MermaidHandler {
  constructor() {
    this.nodeCounter = 0;
  }

  /**
   * Parse mermaid flowchart code and return ReactFlow compatible nodes and edges
   */
  parse(mermaidCode) {
    const lines = mermaidCode.trim().split('\n');
    const nodes = new Map();
    const edges = [];

    // Skip the first line (flowchart TD/LR/etc)
    const flowchartDirection = this.getDirection(lines[0]);

    // Process each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%')) continue; // Skip empty lines and comments

      this.parseLine(line, nodes, edges);
    }

    // Convert nodes Map to array
    const nodesArray = Array.from(nodes.values());

    // Apply auto-layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = this.getLayoutedElements(
      nodesArray,
      edges,
      flowchartDirection
    );

    return {
      nodes: layoutedNodes,
      edges: layoutedEdges,
    };
  }

  /**
   * Get flowchart direction from first line
   */
  getDirection(firstLine) {
    if (firstLine.includes('LR')) return 'LR';
    if (firstLine.includes('RL')) return 'RL';
    if (firstLine.includes('TB') || firstLine.includes('TD')) return 'TB';
    if (firstLine.includes('BT')) return 'BT';
    return 'TB'; // default
  }

  /**
   * Parse a single line of mermaid code
   */
  parseLine(line, nodes, edges) {
    // Match patterns like: A[Text] --> B{Question}
    // Supports: -->, -->|label|, -.->, -.->|label|
    const connectionPattern = /([A-Za-z0-9_]+)(\[[^\]]+\]|\{[^\}]+\}|\([^\)]+\)|>\([^\)]+\)>)?[\s]*(-->|-.->|==>)(\|[^\|]+\|)?[\s]*([A-Za-z0-9_]+)(\[[^\]]+\]|\{[^\}]+\}|\([^\)]+\)|>\([^\)]+\)>)?/;

    const match = line.match(connectionPattern);

    if (match) {
      const sourceId = match[1];
      const sourceLabel = match[2];
      const edgeType = match[3];
      const edgeLabel = match[4];
      const targetId = match[5];
      const targetLabel = match[6];

      // Create source node if doesn't exist
      if (!nodes.has(sourceId)) {
        nodes.set(sourceId, this.createNode(sourceId, sourceLabel));
      }

      // Create target node if doesn't exist
      if (!nodes.has(targetId)) {
        nodes.set(targetId, this.createNode(targetId, targetLabel));
      }

      // Create edge
      edges.push(this.createEdge(sourceId, targetId, edgeLabel, edgeType));
    } else {
      // Try to match standalone node definition: A[Text]
      const nodePattern = /([A-Za-z0-9_]+)(\[[^\]]+\]|\{[^\}]+\}|\([^\)]+\)|>\([^\)]+\)>)/;
      const nodeMatch = line.match(nodePattern);

      if (nodeMatch) {
        const nodeId = nodeMatch[1];
        const nodeLabel = nodeMatch[2];

        if (!nodes.has(nodeId)) {
          nodes.set(nodeId, this.createNode(nodeId, nodeLabel));
        }
      }
    }
  }

  /**
   * Create a ReactFlow node from mermaid syntax
   */
  createNode(id, labelWithBrackets) {
    let label = id;
    let type = 'rectangle'; // Default to rectangle node type

    if (labelWithBrackets) {
      // Extract label and determine node type based on brackets
      if (labelWithBrackets.startsWith('[')) {
        // Rectangle: [Text]
        label = labelWithBrackets.slice(1, -1);
        type = 'rectangle';
      } else if (labelWithBrackets.startsWith('{')) {
        // Diamond: {Text}
        label = labelWithBrackets.slice(1, -1);
        type = 'diamond';
      } else if (labelWithBrackets.startsWith('(')) {
        // Circle: (Text)
        label = labelWithBrackets.slice(1, -1);
        type = 'circle';
      }
    }

    // MermaidParser only converts syntax to ReactFlow config
    // Node components handle their own styling
    return {
      id,
      type,
      data: {
        label,
      },
      position: { x: 0, y: 0 }, // Will be set by layout algorithm
      draggable: true,
    };
  }

  /**
   * Create a ReactFlow edge from mermaid syntax
   */
  createEdge(source, target, labelWithPipes, edgeType) {
    const edge = {
      id: `e${source}-${target}`,
      source,
      target,
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
    };

    // Add label if present
    if (labelWithPipes) {
      edge.label = labelWithPipes.slice(1, -1); // Remove | pipes
      edge.labelStyle = { fill: '#000', fontWeight: 500 };
      edge.labelBgStyle = { fill: '#fff' };
    }

    // Handle different edge types
    if (edgeType === '-.->') {
      edge.style.strokeDasharray = '5,5';
    } else if (edgeType === '==>') {
      edge.style.strokeWidth = 3;
    }

    return edge;
  }

  /**
   * Apply Dagre layout algorithm to position nodes
   */
  getLayoutedElements(nodes, edges, direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR' || direction === 'RL';
    dagreGraph.setGraph({
      rankdir: direction,
      nodesep: 100,
      ranksep: 100,
    });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 150, height: 50 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);

      const position = {
        x: nodeWithPosition.x - 75, // Center the node
        y: nodeWithPosition.y - 25,
      };

      return {
        ...node,
        position,
      };
    });

    return { nodes: layoutedNodes, edges };
  }
}

export default MermaidHandler;
