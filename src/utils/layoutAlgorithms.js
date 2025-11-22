/**
 * Layout Algorithms - Position nodes according to different patterns
 */

const SPACING = {
  horizontal: 200,
  vertical: 150,
};

/**
 * Decision Layout
 * Finds diamond nodes and arranges their connected nodes:
 * - Input node to the left of diamond
 * - True/Yes node to the right of diamond
 * - False/No node below the diamond
 *
 * @param {Array} nodes - Current nodes
 * @param {Array} edges - Current edges
 * @returns {Array} Nodes with updated positions
 */
export const applyDecisionLayout = (nodes, edges) => {
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
};

/**
 * Tree Layout (hierarchical top-down)
 * Arranges nodes in a tree structure with roots at top
 */
export const applyTreeLayout = (nodes, edges) => {
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
  const levelHeight = 120;
  const nodeSpacing = 150;
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
  const minSpacing = 200; // Minimum spacing between siblings
  const subtreeGap = 100; // Extra gap between subtrees

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

  // Second pass: re-center parents after children have been repositioned by spacing
  roots.forEach(root => centerParents(root.id));

  // Third pass: fix any overlaps created by re-centering parents
  // Only check parent-level nodes (non-leaf nodes with children)
  nodesByLevel.forEach((nodeIds, level) => {
    const sortedNodes = nodeIds
      .map(id => nodeMap.get(id))
      .filter(Boolean)
      .sort((a, b) => a.position.x - b.position.x);

    for (let i = 1; i < sortedNodes.length; i++) {
      const prev = sortedNodes[i - 1];
      const curr = sortedNodes[i];

      const prevSubtreeRight = getSubtreeRight(prev.id);
      const requiredMinX = prevSubtreeRight + subtreeGap;

      if (curr.position.x < requiredMinX) {
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

  return updatedNodes;
};

/**
 * Grid Layout
 * TODO: Implement grid layout
 */
export const applyGridLayout = (nodes, edges) => {
  console.log('[GridLayout] Not yet implemented');
  return nodes;
};

/**
 * Circle Layout
 * TODO: Implement circle layout
 */
export const applyCircleLayout = (nodes, edges) => {
  console.log('[CircleLayout] Not yet implemented');
  return nodes;
};
