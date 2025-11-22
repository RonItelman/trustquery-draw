/**
 * List Layout Handler
 * Arranges nodes in a vertical list with right-indentation based on hierarchy depth
 * - Root at top-left
 * - Children indented right and stacked vertically
 * - Grandchildren indented further right
 */

export default class ListLayout {
  /**
   * Apply list layout to nodes
   * @param {Array} nodes - Current nodes
   * @param {Array} edges - Current edges
   * @returns {Array} Nodes with updated positions
   */
  static apply(nodes, edges) {
    console.log('[ListLayout] Starting layout with nodes:', nodes.length, 'edges:', edges.length);

    if (nodes.length === 0) return nodes;

    const updatedNodes = [...nodes];
    const nodeMap = new Map(updatedNodes.map(n => [n.id, n]));

    // Build parent -> children mapping
    const children = new Map();
    const parents = new Map();

    edges.forEach(edge => {
      if (!children.has(edge.source)) {
        children.set(edge.source, []);
      }
      children.get(edge.source).push(edge.target);
      parents.set(edge.target, edge.source);
    });

    // Find root nodes (nodes with no incoming edges)
    const roots = nodes.filter(n => !parents.has(n.id));
    console.log('[ListLayout] Found roots:', roots.map(r => r.id));

    if (roots.length === 0) {
      console.warn('[ListLayout] No root nodes found, using first node');
      roots.push(nodes[0]);
    }

    // Layout parameters
    const startX = 100;
    const startY = 50;
    const indentX = 150; // Horizontal indent per level
    const spacingY = 100; // Vertical spacing between nodes

    let currentY = startY;

    // DFS traversal to position nodes
    const visited = new Set();

    const positionNode = (nodeId, depth) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (node) {
        node.position = {
          x: startX + depth * indentX,
          y: currentY,
        };
        console.log('[ListLayout] Positioned', nodeId, 'at depth', depth, ':', node.position);
        currentY += spacingY;
      }

      // Position children
      const nodeChildren = children.get(nodeId) || [];
      nodeChildren.forEach(childId => positionNode(childId, depth + 1));
    };

    // Position all trees starting from roots
    roots.forEach(root => positionNode(root.id, 0));

    return updatedNodes;
  }
}
