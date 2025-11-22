/**
 * EdgeBuilder - Creates and manages edges
 * Handles edge creation based on arrow directions
 */
export class EdgeBuilder {
  constructor() {
    this.edges = [];
  }

  /**
   * Create an edge
   * @param {string} source - Source node ID
   * @param {string} target - Target node ID
   * @param {string} label - Edge label (optional)
   */
  createEdge(source, target, label = null) {
    this.edges.push({
      id: `${source}-${target}-${this.edges.length}`,
      source,
      target,
      label,
    });
  }

  /**
   * Create edges from arrows and node names
   * @param {Array} arrows - Array of arrow objects
   * @param {Array} nodeNames - Array of node IDs
   */
  createEdgesFromArrows(arrows, nodeNames) {
    for (let i = 0; i < arrows.length; i++) {
      const arrow = arrows[i];
      const sourceName = nodeNames[i];
      const targetName = nodeNames[i + 1];

      if (!sourceName || !targetName) continue;

      if (arrow.direction === 'forward') {
        this.createEdge(sourceName, targetName, arrow.edgeLabel);
        console.log(`[EdgeBuilder] Created edge: ${sourceName} -> ${targetName}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);
      } else if (arrow.direction === 'backward') {
        this.createEdge(targetName, sourceName, arrow.edgeLabel);
        console.log(`[EdgeBuilder] Created edge: ${targetName} <- ${sourceName}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);
      } else if (arrow.direction === 'bidirectional') {
        this.createEdge(sourceName, targetName, arrow.edgeLabel);
        this.createEdge(targetName, sourceName, arrow.edgeLabel);
        console.log(`[EdgeBuilder] Created bidirectional edge: ${sourceName} <-> ${targetName}${arrow.edgeLabel ? ` (${arrow.edgeLabel})` : ''}`);
      }
    }
  }

  /**
   * Get all edges
   * @returns {Array} Array of edge objects
   */
  getEdges() {
    return this.edges;
  }

  /**
   * Clear all edges
   */
  clear() {
    this.edges = [];
  }
}
