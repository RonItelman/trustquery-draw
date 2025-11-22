/**
 * NodeBuilder - Creates and manages nodes
 * Handles node creation and shape type detection
 */
export class NodeBuilder {
  constructor(idManager = null) {
    this.nodes = new Map();
    this.nodeOrder = [];
    this.idManager = idManager;

    // Shape keywords that map to specific node types
    this.shapeKeywords = {
      'circle': 'circle',
      'square': 'square',
      'rectangle': 'rectangle',
      'diamond': 'diamond',
    };
  }

  /**
   * Create or get a node
   * @param {string} label - Node label
   * @returns {string} Node ID
   */
  ensureNode(label) {
    const trimmed = label.trim();

    // Detect shape type based on the label text itself
    const lowerLabel = trimmed.toLowerCase();
    const type = this.shapeKeywords[lowerLabel] || 'rectangle';

    if (!this.nodes.has(trimmed)) {
      // Assign numeric ID if IDManager is available
      const numericId = this.idManager ? this.idManager.assignId(trimmed) : null;

      const node = {
        id: trimmed,
        label: trimmed,
        type: type,
        numericId: numericId,
      };

      this.nodes.set(trimmed, node);
      this.nodeOrder.push(trimmed);
      console.log(`[NodeBuilder] Created node: ${trimmed} (type: ${type}, numericId: ${numericId}, order: ${this.nodeOrder.length - 1})`);
    } else {
      console.log(`[NodeBuilder] Node already exists: ${trimmed}`);
    }

    return trimmed;
  }

  /**
   * Get all nodes
   * @returns {Array} Array of node objects
   */
  getNodes() {
    return Array.from(this.nodes.values());
  }

  /**
   * Get node order
   * @returns {Array} Array of node IDs in order of creation
   */
  getNodeOrder() {
    return this.nodeOrder;
  }

  /**
   * Clear all nodes
   */
  clear() {
    this.nodes.clear();
    this.nodeOrder = [];
  }
}
