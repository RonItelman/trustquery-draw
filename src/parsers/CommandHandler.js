/**
 * CommandHandler - Handles special commands starting with @
 * Commands are non-persistent and consumed after execution
 *
 * Supported commands:
 * - @node_id - Opens style inspector for the specified node (by ID)
 * - @:number - Opens style inspector for the specified node (by node number)
 * - @node_id fill:#color border:#color - Apply styles directly (future)
 */
export class CommandHandler {
  constructor() {
    // Regex to match @commands
    // Matches: @node_id or @node_id with optional parameters
    this.commandPattern = /^@(\S+)(.*)$/;
  }

  /**
   * Detect if input contains a command
   * @param {string} input - Input text
   * @returns {Object|null} Command object or null if no command
   */
  detectCommand(input) {
    const trimmed = input.trim();
    const match = trimmed.match(this.commandPattern);

    if (match) {
      const nodeId = match[1];
      const params = match[2].trim();

      return {
        type: 'openStyleInspector',
        nodeId,
        params,
        rawCommand: trimmed,
      };
    }

    return null;
  }

  /**
   * Extract command from input and return cleaned input
   * @param {string} input - Input text
   * @returns {Object} {command: Object|null, cleanedInput: string}
   */
  extractCommand(input) {
    const lines = input.split('\n');
    const commands = [];
    const cleanedLines = [];

    lines.forEach(line => {
      const command = this.detectCommand(line);
      if (command) {
        commands.push(command);
      } else {
        cleanedLines.push(line);
      }
    });

    return {
      commands,
      cleanedInput: cleanedLines.join('\n'),
    };
  }

  /**
   * Parse command parameters for future style application
   * Example: "fill:#ff0000 border:#000000"
   * @param {string} params - Parameter string
   * @returns {Object} Parsed parameters
   */
  parseStyleParams(params) {
    const styles = {};

    // Match patterns like: fill:#color, border:#color, etc.
    const fillMatch = params.match(/fill:\s*([#\w]+)/);
    const borderMatch = params.match(/border:\s*([#\w]+)/);
    const widthMatch = params.match(/width:\s*(\d+)/);

    if (fillMatch) styles.backgroundColor = fillMatch[1];
    if (borderMatch) styles.borderColor = borderMatch[1];
    if (widthMatch) styles.borderWidth = parseInt(widthMatch[1]);

    return styles;
  }

  /**
   * Validate if a node exists
   * @param {string} nodeId - Node ID to check (can be node ID or :number for node number)
   * @param {Array} nodes - Array of existing nodes
   * @returns {Object|null} Node object if found, null otherwise
   */
  findNode(nodeId, nodes) {
    // Check if nodeId is a node number reference (:number)
    if (nodeId.startsWith(':')) {
      const nodeNumber = parseInt(nodeId.substring(1), 10);
      if (!isNaN(nodeNumber)) {
        return nodes.find(node => node.data?.nodeNumber === nodeNumber);
      }
    }

    // Case-insensitive matching by node ID
    const lowerNodeId = nodeId.toLowerCase();
    return nodes.find(node =>
      node.id.toLowerCase() === lowerNodeId
    );
  }

  /**
   * Execute a command
   * @param {Object} command - Command object
   * @param {Array} nodes - Array of existing nodes
   * @param {Function} onOpenStyleInspector - Callback to open style inspector
   * @param {Function} onSelectNode - Callback to select node
   * @param {Function} onError - Callback for errors
   * @returns {boolean} True if command executed successfully
   */
  executeCommand(command, nodes, callbacks = {}) {
    const { onOpenStyleInspector, onSelectNode, onError, onApplyStyle } = callbacks;

    // Find the node
    const node = this.findNode(command.nodeId, nodes);

    if (!node) {
      // Node not found - show error
      if (onError) {
        onError(`Node '${command.nodeId}' not found`);
      }
      console.error(`[CommandHandler] Node '${command.nodeId}' not found`);
      return false;
    }

    console.log(`[CommandHandler] Executing command for node: ${node.id}`);

    // Select the node
    if (onSelectNode) {
      onSelectNode(node);
    }

    // Check if there are style parameters
    if (command.params && onApplyStyle) {
      const styles = this.parseStyleParams(command.params);
      if (Object.keys(styles).length > 0) {
        onApplyStyle(node.id, styles);
        console.log(`[CommandHandler] Applied styles to ${node.id}:`, styles);
      }
    }

    // Open style inspector
    if (onOpenStyleInspector) {
      onOpenStyleInspector(node);
    }

    return true;
  }
}
