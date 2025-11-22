/**
 * IDManager - Manages numeric IDs for nodes
 * Provides stable, auto-incrementing IDs that persist within a session
 * Supports reference resolution using :N syntax
 */
export class IDManager {
  constructor() {
    this.nodeIdToNumber = new Map(); // "node_label" -> 1
    this.numberToNodeId = new Map(); // 1 -> "node_label"
    this.nextId = 1;
  }

  /**
   * Assign or retrieve numeric ID for a node label
   * If the label already has an ID, returns existing ID
   * Otherwise assigns a new ID and increments counter
   * @param {string} nodeLabel - Node label
   * @returns {number} Numeric ID
   */
  assignId(nodeLabel) {
    // Check if this node already has an ID
    if (this.nodeIdToNumber.has(nodeLabel)) {
      return this.nodeIdToNumber.get(nodeLabel);
    }

    // Assign new ID
    const numericId = this.nextId++;
    this.nodeIdToNumber.set(nodeLabel, numericId);
    this.numberToNodeId.set(numericId, nodeLabel);

    console.log(`[IDManager] Assigned ID ${numericId} to "${nodeLabel}"`);
    return numericId;
  }

  /**
   * Resolve a reference (either :N or label)
   * @param {string} ref - Reference string (:1 or "label")
   * @returns {string} Node label
   * @throws {Error} If ID reference is invalid or not found
   */
  resolveReference(ref) {
    // Check if it's an ID reference (:N)
    if (ref.startsWith(':')) {
      const numericId = parseInt(ref.slice(1));

      // Validate numeric ID
      if (isNaN(numericId)) {
        throw new Error(`Invalid ID reference: ${ref}`);
      }

      // Look up the node label
      const nodeLabel = this.numberToNodeId.get(numericId);
      if (!nodeLabel) {
        throw new Error(`Node with ID ${numericId} not found`);
      }

      console.log(`[IDManager] Resolved ${ref} -> "${nodeLabel}"`);
      return nodeLabel;
    }

    // It's a label reference, return as-is
    return ref;
  }

  /**
   * Get numeric ID for a label (without creating new ID)
   * @param {string} nodeLabel - Node label
   * @returns {number|undefined} Numeric ID or undefined if not found
   */
  getNumericId(nodeLabel) {
    return this.nodeIdToNumber.get(nodeLabel);
  }

  /**
   * Check if a node label has an assigned ID
   * @param {string} nodeLabel - Node label
   * @returns {boolean} True if node exists
   */
  hasNode(nodeLabel) {
    return this.nodeIdToNumber.has(nodeLabel);
  }

  /**
   * Get all node labels with their IDs
   * @returns {Array} Array of {label, id} objects
   */
  getAllNodes() {
    return Array.from(this.nodeIdToNumber.entries()).map(([label, id]) => ({
      label,
      id,
    }));
  }

  /**
   * Clear all ID mappings and reset counter
   * Called when canvas is cleared or session resets
   */
  clear() {
    console.log('[IDManager] Clearing all ID mappings');
    this.nodeIdToNumber.clear();
    this.numberToNodeId.clear();
    this.nextId = 1;
  }

  /**
   * Export mapping to JSON format
   * @returns {Object} Serializable mapping data
   */
  toJSON() {
    return {
      nodeIdToNumber: Object.fromEntries(this.nodeIdToNumber),
      numberToNodeId: Object.fromEntries(
        Array.from(this.numberToNodeId.entries()).map(([k, v]) => [String(k), v])
      ),
      nextId: this.nextId,
    };
  }

  /**
   * Import mapping from JSON format
   * @param {Object} data - Previously exported mapping data
   */
  fromJSON(data) {
    if (!data) return;

    this.nodeIdToNumber = new Map(Object.entries(data.nodeIdToNumber || {}));
    this.numberToNodeId = new Map(
      Object.entries(data.numberToNodeId || {}).map(([k, v]) => [parseInt(k), v])
    );
    this.nextId = data.nextId || 1;

    console.log(`[IDManager] Imported ${this.nodeIdToNumber.size} node mappings`);
  }

  /**
   * Get current state summary for debugging
   * @returns {Object} Current state
   */
  getState() {
    return {
      totalNodes: this.nodeIdToNumber.size,
      nextId: this.nextId,
      nodes: this.getAllNodes(),
    };
  }
}
