import { MarkerType } from 'reactflow';

/**
 * DiagramImporter - Single responsibility class for importing JSON diagrams
 * Handles validation, transformation, and error handling for diagram imports
 */
export class DiagramImporter {
  /**
   * Import and transform JSON data to ReactFlow format
   * @param {Object} jsonData - The JSON data to import
   * @returns {Object} Object containing nodes and edges arrays
   * @throws {Error} If JSON format is invalid
   */
  static importFromJSON(jsonData) {
    // Validate input
    this.validateJSON(jsonData);

    // Transform data
    const nodes = this.transformNodes(jsonData.nodes);
    const edges = this.transformEdges(jsonData.edges || []);

    return { nodes, edges };
  }

  /**
   * Validate JSON structure
   * @param {Object} jsonData - The JSON data to validate
   * @throws {Error} If validation fails
   */
  static validateJSON(jsonData) {
    if (!jsonData) {
      throw new Error('Invalid JSON format: data is null or undefined');
    }

    if (!jsonData.nodes || !Array.isArray(jsonData.nodes)) {
      throw new Error('Invalid JSON format: nodes array is required');
    }

    if (jsonData.nodes.length === 0) {
      throw new Error('Invalid JSON format: nodes array cannot be empty');
    }

    // Validate each node has required fields
    jsonData.nodes.forEach((node, index) => {
      if (!node.id) {
        throw new Error(`Invalid node at index ${index}: id is required`);
      }
      if (!node.position) {
        throw new Error(`Invalid node at index ${index}: position is required`);
      }
      if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        throw new Error(`Invalid node at index ${index}: position must have x and y coordinates`);
      }
    });

    // Validate edges if present
    if (jsonData.edges && Array.isArray(jsonData.edges)) {
      jsonData.edges.forEach((edge, index) => {
        if (!edge.id) {
          throw new Error(`Invalid edge at index ${index}: id is required`);
        }
        if (!edge.source) {
          throw new Error(`Invalid edge at index ${index}: source is required`);
        }
        if (!edge.target) {
          throw new Error(`Invalid edge at index ${index}: target is required`);
        }
      });
    }
  }

  /**
   * Transform imported nodes to ReactFlow format
   * @param {Array} nodes - Array of node objects from JSON
   * @returns {Array} Array of ReactFlow node objects
   */
  static transformNodes(nodes) {
    return nodes.map(node => {
      const defaultStyleOverrides = {
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 1,
        fontSize: '11px',
      };

      return {
        id: node.id,
        type: node.type || 'rectangle',
        position: {
          x: node.position.x,
          y: node.position.y,
        },
        data: {
          label: node.id,
          nodeNumber: node.nodeNumber || null,
          styleOverrides: node.styleOverrides
            ? { ...defaultStyleOverrides, ...node.styleOverrides }
            : defaultStyleOverrides,
        },
      };
    });
  }

  /**
   * Transform imported edges to ReactFlow format
   * @param {Array} edges - Array of edge objects from JSON
   * @returns {Array} Array of ReactFlow edge objects
   */
  static transformEdges(edges) {
    return edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label || null,
      type: edge.type || 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }));
  }

  /**
   * Import from JSON string
   * @param {string} jsonString - JSON string to parse and import
   * @returns {Object} Object containing nodes and edges arrays
   * @throws {Error} If parsing or validation fails
   */
  static importFromJSONString(jsonString) {
    try {
      const jsonData = JSON.parse(jsonString);
      return this.importFromJSON(jsonData);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format: unable to parse JSON string');
      }
      throw error;
    }
  }
}
