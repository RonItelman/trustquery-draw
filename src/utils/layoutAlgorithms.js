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

    // Position input node(s) to the left
    incomingEdges.forEach((edge, i) => {
      const inputNode = nodeMap.get(edge.source);
      if (inputNode) {
        inputNode.position = {
          x: diamondX - SPACING.horizontal,
          y: diamondY + (i * SPACING.vertical / 2),
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
        // True/Yes - position to the right
        outputNode.position = {
          x: diamondX + SPACING.horizontal,
          y: diamondY,
        };
        console.log('[DecisionLayout] Positioned TRUE node:', outputNode.id, 'at', outputNode.position);
      } else if (label.includes('no') || label.includes('false') || label === 'n' || label === 'f') {
        // False/No - position below
        outputNode.position = {
          x: diamondX,
          y: diamondY + SPACING.vertical,
        };
        console.log('[DecisionLayout] Positioned FALSE node:', outputNode.id, 'at', outputNode.position);
      } else {
        // No label or unknown - position first to right, second below
        const isFirstOutput = outgoingEdges.indexOf(edge) === 0;
        outputNode.position = isFirstOutput
          ? { x: diamondX + SPACING.horizontal, y: diamondY }
          : { x: diamondX, y: diamondY + SPACING.vertical };
        console.log('[DecisionLayout] Positioned unlabeled node:', outputNode.id, 'at', outputNode.position);
      }
    });
  });

  return updatedNodes;
};

/**
 * Tree Layout (hierarchical top-down)
 * TODO: Implement tree layout
 */
export const applyTreeLayout = (nodes, edges) => {
  console.log('[TreeLayout] Not yet implemented');
  return nodes;
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
