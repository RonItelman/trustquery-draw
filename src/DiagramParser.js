import dagre from 'dagre';
import { MarkerType } from 'reactflow';
import { SyntaxManager } from './parsers/SyntaxManager.js';

export class DiagramParser {
  constructor() {
    this.syntaxManager = new SyntaxManager();
  }

  parse(input) {
    console.log('[DiagramParser] *** NEW REFACTORED CODE WITH SYNTAX MANAGER ***');
    console.log('[DiagramParser] Starting parse with input:', input);

    // Use SyntaxManager to parse input
    const { nodes, edges, commands } = this.syntaxManager.parse(input);

    console.log('[DiagramParser] Parse complete - nodes:', nodes.length, 'edges:', edges.length, 'commands:', commands.length);
    return { nodes, edges, commands };
  }


  layoutGraph(nodes, edges) {
    // Position nodes based on their appearance order in the input
    // This preserves the visual left-to-right order as typed
    const horizontalSpacing = 150;
    const verticalSpacing = 100;
    const startX = 100;
    const startY = 100;

    // Get node order from SyntaxManager
    const nodeOrder = this.syntaxManager.getNodeOrder();

    // Create a map to track which nodes appear on the same line
    const nodePositions = new Map();

    // Find backward edges to offset their targets vertically
    const backwardTargets = new Set();
    edges.forEach(edge => {
      // Check if this is a backward edge (source is to the right of target in nodeOrder)
      const sourceIndex = nodeOrder.indexOf(edge.source);
      const targetIndex = nodeOrder.indexOf(edge.target);
      if (sourceIndex > targetIndex) {
        backwardTargets.add(edge.target);
      }
    });

    // Simple layout: position nodes left-to-right in order of appearance
    nodeOrder.forEach((nodeId, index) => {
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
        data: {
          label: node.label,
          numericId: node.numericId,
        },
      };
    });
  }

  getNodesAndEdges(input) {
    const { nodes, edges, commands } = this.parse(input);
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

    return { nodes: layoutedNodes, edges: formattedEdges, commands };
  }

  /**
   * Get command handler for executing commands
   * @returns {CommandHandler} Command handler instance
   */
  getCommandHandler() {
    return this.syntaxManager.getCommandHandler();
  }

  /**
   * Get syntax manager instance
   * @returns {SyntaxManager} Syntax manager instance
   */
  getSyntaxManager() {
    return this.syntaxManager;
  }
}
