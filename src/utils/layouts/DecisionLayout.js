/**
 * Decision Layout Handler
 * Finds diamond nodes and arranges their connected nodes:
 * - Input node to the left of diamond
 * - True/Yes node to the right of diamond
 * - False/No node below the diamond
 */

const SPACING = {
  horizontal: 200,
  vertical: 150,
};

export default class DecisionLayout {
  /**
   * Apply decision layout to nodes
   * @param {Array} nodes - Current nodes
   * @param {Array} edges - Current edges
   * @returns {Array} Nodes with updated positions
   */
  static apply(nodes, edges) {
    console.log('[DecisionLayout] Starting layout with nodes:', nodes.length, 'edges:', edges.length);

    // Find diamond nodes
    const diamondNodes = nodes.filter(n => n.type === 'diamond');

    if (diamondNodes.length === 0) {
      console.log('[DecisionLayout] No diamond nodes found');
      return nodes;
    }

    // Create a copy of nodes to modify
    const updatedNodes = [...nodes];
    const nodeMap = new Map(updatedNodes.map(n => [n.id, n]));

    // Center alignment offset: diamond (100px) vs rectangle (60px) = 20px difference
    const CENTER_OFFSET = 20;

    diamondNodes.forEach(diamond => {
      console.log('[DecisionLayout] Processing diamond:', diamond.id);

      // Find edges connected to this diamond
      const incomingEdges = edges.filter(e => e.target === diamond.id);
      const outgoingEdges = edges.filter(e => e.source === diamond.id);

      console.log('[DecisionLayout] Incoming edges:', incomingEdges.length, 'Outgoing:', outgoingEdges.length);

      // Position diamond at a base position
      const diamondX = 300;
      const diamondY = 200;
      diamond.position = { x: diamondX, y: diamondY };

      // Position input node(s) to the left (center-aligned with diamond)
      incomingEdges.forEach((edge, i) => {
        const inputNode = nodeMap.get(edge.source);
        if (inputNode) {
          inputNode.position = {
            x: diamondX - SPACING.horizontal,
            y: diamondY + CENTER_OFFSET,  // Offset down to align centers
          };
          console.log('[DecisionLayout] Positioned input node:', inputNode.id, 'at', inputNode.position);
        }
      });

      // Position output nodes based on edge labels
      outgoingEdges.forEach(edge => {
        const outputNode = nodeMap.get(edge.target);
        if (!outputNode) return;

        const label = (edge.label || '').toLowerCase();

        if (label.includes('yes') || label.includes('true') || label === 'y' || label === 't') {
          // True/Yes - position to the right (center-aligned)
          outputNode.position = {
            x: diamondX + SPACING.horizontal,
            y: diamondY + CENTER_OFFSET,  // Offset down to align centers
          };
          console.log('[DecisionLayout] Positioned TRUE node:', outputNode.id, 'at', outputNode.position);
        } else if (label.includes('no') || label.includes('false') || label === 'n' || label === 'f') {
          // False/No - position below (center-aligned horizontally)
          outputNode.position = {
            x: diamondX,
            y: diamondY + SPACING.vertical + CENTER_OFFSET,  // Also offset for consistency
          };
          console.log('[DecisionLayout] Positioned FALSE node:', outputNode.id, 'at', outputNode.position);
        } else {
          // No label or unknown - position first to right, second below
          const isFirstOutput = outgoingEdges.indexOf(edge) === 0;
          outputNode.position = isFirstOutput
            ? { x: diamondX + SPACING.horizontal, y: diamondY + CENTER_OFFSET }
            : { x: diamondX, y: diamondY + SPACING.vertical + CENTER_OFFSET };
          console.log('[DecisionLayout] Positioned unlabeled node:', outputNode.id, 'at', outputNode.position);
        }
      });
    });

    return updatedNodes;
  }
}
