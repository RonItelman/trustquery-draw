/**
 * Tree Layout Handler
 * Arranges nodes in a hierarchical tree structure with roots at top
 * - Uses width-aware spacing to prevent visual confusion
 * - Centers parents above their children
 * - Maintains proper gaps between subtrees
 */

const SPACING = {
  horizontal: 150,
  vertical: 120,
};

export default class TreeLayout {
  /**
   * Apply tree layout to nodes
   * @param {Array} nodes - Current nodes
   * @param {Array} edges - Current edges
   * @returns {Array} Nodes with updated positions
   */
  static apply(nodes, edges) {
    console.log('[TreeLayout] Starting layout with nodes:', nodes.length, 'edges:', edges.length);

    if (nodes.length === 0) return nodes;

    // Create a copy of nodes to modify
    const updatedNodes = [...nodes];
    const nodeMap = new Map(updatedNodes.map(n => [n.id, n]));

    // Find root nodes (nodes with no incoming edges)
    const incomingCount = new Map();
    nodes.forEach(n => incomingCount.set(n.id, 0));
    edges.forEach(e => {
      incomingCount.set(e.target, (incomingCount.get(e.target) || 0) + 1);
    });

    const roots = nodes.filter(n => incomingCount.get(n.id) === 0);
    console.log('[TreeLayout] Found roots:', roots.map(r => r.id));

    if (roots.length === 0) {
      console.warn('[TreeLayout] No root nodes found, using first node');
      roots.push(nodes[0]);
    }

    // Build tree structure: parent -> children mapping
    const children = new Map();
    edges.forEach(edge => {
      if (!children.has(edge.source)) {
        children.set(edge.source, []);
      }
      children.get(edge.source).push(edge.target);
    });

    // Calculate tree levels (depth-first traversal)
    const levels = new Map(); // nodeId -> level
    const visited = new Set();

    const assignLevels = (nodeId, level) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      levels.set(nodeId, level);

      const nodeChildren = children.get(nodeId) || [];
      nodeChildren.forEach(childId => assignLevels(childId, level + 1));
    };

    roots.forEach(root => assignLevels(root.id, 0));

    // Group nodes by level
    const nodesByLevel = new Map();
    levels.forEach((level, nodeId) => {
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level).push(nodeId);
    });

    // Layout parameters
    const levelHeight = SPACING.vertical;
    const nodeSpacing = SPACING.horizontal;
    const startY = 50;

    // Calculate positions level by level
    nodesByLevel.forEach((nodeIds, level) => {
      const totalWidth = (nodeIds.length - 1) * nodeSpacing;
      const startX = 100 + (roots.length === 1 ? 200 : 0); // Center for single root

      nodeIds.forEach((nodeId, index) => {
        const node = nodeMap.get(nodeId);
        if (node) {
          node.position = {
            x: startX + index * nodeSpacing - totalWidth / 2,
            y: startY + level * levelHeight,
          };
          console.log('[TreeLayout] Positioned', nodeId, 'at level', level, ':', node.position);
        }
      });
    });

    // Center parents above their children
    const centerParents = (nodeId) => {
      const nodeChildren = children.get(nodeId);
      if (!nodeChildren || nodeChildren.length === 0) return;

      // First, center all children
      nodeChildren.forEach(childId => centerParents(childId));

      // Calculate average X of children
      const childNodes = nodeChildren.map(id => nodeMap.get(id)).filter(Boolean);
      if (childNodes.length > 0) {
        const avgX = childNodes.reduce((sum, child) => sum + child.position.x, 0) / childNodes.length;
        const parent = nodeMap.get(nodeId);
        if (parent) {
          parent.position.x = avgX;
        }
      }
    };

    // First pass: center parents based on initial child positions
    roots.forEach(root => centerParents(root.id));

    // Helper: Estimate node width based on text length
    const estimateNodeWidth = (nodeId) => {
      // Approximate character width at 11px font size in system fonts: ~13px per char
      // (Generous estimate to account for font metrics, kerning, whitespace, and browser rendering)
      // Plus padding (12px left + 12px right = 24px) + border (1px * 2 = 2px)
      const charWidth = 13;
      const padding = 26; // 24px padding + 2px border
      const estimatedWidth = nodeId.length * charWidth + padding;

      // Return max of estimated width and minWidth (60px for rectangles)
      return Math.max(estimatedWidth, 60);
    };

    // Calculate subtree bounds (rightmost edge including node width)
    const getSubtreeRight = (nodeId) => {
      const node = nodeMap.get(nodeId);
      if (!node) return 0;

      const nodeChildren = children.get(nodeId);
      if (!nodeChildren || nodeChildren.length === 0) {
        // Return right edge: position + width
        return node.position.x + estimateNodeWidth(nodeId);
      }

      // Return the rightmost edge of all children
      return Math.max(...nodeChildren.map(childId => getSubtreeRight(childId)));
    };

    // Fix overlaps: ensure siblings maintain spacing based on subtree width
    const subtreeGap = 100; // Gap between subtrees

    const applySpacing = () => {
      nodesByLevel.forEach((nodeIds, level) => {
        // Sort siblings by X position
        const sortedNodes = nodeIds
          .map(id => nodeMap.get(id))
          .filter(Boolean)
          .sort((a, b) => a.position.x - b.position.x);

        // Adjust positions to maintain spacing based on subtree widths
        for (let i = 1; i < sortedNodes.length; i++) {
          const prev = sortedNodes[i - 1];
          const curr = sortedNodes[i];

          // Calculate required spacing based on previous node's subtree
          const prevSubtreeRight = getSubtreeRight(prev.id);
          const requiredMinX = prevSubtreeRight + subtreeGap;

          if (curr.position.x < requiredMinX) {
            // Push current node and its entire subtree to the right
            const shift = requiredMinX - curr.position.x;

            const shiftSubtree = (nodeId, shiftAmount) => {
              const node = nodeMap.get(nodeId);
              if (node) {
                node.position.x += shiftAmount;
                const nodeChildren = children.get(nodeId);
                if (nodeChildren) {
                  nodeChildren.forEach(childId => shiftSubtree(childId, shiftAmount));
                }
              }
            };

            shiftSubtree(curr.id, shift);
          }
        }
      });
    };

    // First spacing pass: space all nodes accounting for width
    applySpacing();

    // Second pass: re-center parents after children have been repositioned by spacing
    roots.forEach(root => centerParents(root.id));

    // Third pass: fix any overlaps created by re-centering parents
    applySpacing();

    return updatedNodes;
  }
}
