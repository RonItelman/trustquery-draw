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
   * @param {string} label - Node label (or :N reference)
   * @returns {string} Node ID (resolved label)
   */
  ensureNode(label) {
    const trimmed = label.trim();

    // Resolve :N references if IDManager is available
    let resolvedLabel = trimmed;
    if (this.idManager && trimmed.startsWith(':')) {
      try {
        resolvedLabel = this.idManager.resolveReference(trimmed);
        console.log(`[NodeBuilder] Resolved reference ${trimmed} -> "${resolvedLabel}"`);
      } catch (error) {
        console.error(`[NodeBuilder] Error resolving reference: ${error.message}`);
        throw error;
      }
    }

    // Detect shape type based on the resolved label text
    const lowerLabel = resolvedLabel.toLowerCase();
    const type = this.shapeKeywords[lowerLabel] || 'rectangle';

    if (!this.nodes.has(resolvedLabel)) {
      // Assign node number if IDManager is available
      const nodeNumber = this.idManager ? this.idManager.assignId(resolvedLabel) : null;

      const node = {
        id: resolvedLabel,        // ReactFlow ID (the label)
        type: type,
        nodeNumber: nodeNumber,   // Sequential reference number
      };

      this.nodes.set(resolvedLabel, node);
      this.nodeOrder.push(resolvedLabel);
      console.log(`[NodeBuilder] Created node: ${resolvedLabel} (type: ${type}, nodeNumber: ${nodeNumber}, order: ${this.nodeOrder.length - 1})`);
    } else {
      console.log(`[NodeBuilder] Node already exists: ${resolvedLabel}`);
    }

    return resolvedLabel;
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
