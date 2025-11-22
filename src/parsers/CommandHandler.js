/**
 * CommandHandler - Handles special commands
 * Commands are non-persistent and consumed after execution
 *
 * Supported commands:
 * - @node_id - Opens style inspector for the specified node (by ID)
 * - @:number - Opens style inspector for the specified node (by node number)
 * - @node_id fill:#color border:#color - Apply styles directly (future)
 * - =rename(oldId, newLabel) - Rename a node
 * - =layout(decision) - Apply decision layout
 * - =layout(tree) - Apply tree layout
 */
export class CommandHandler {
  constructor() {
    // Regex to match @commands
    this.atCommandPattern = /^@(\S+)(.*)$/;

    // Regex to match =commands with parentheses: =command(args)
    this.equalsCommandPattern = /^=(\w+)\s*\(([^)]*)\)$/;
  }

  /**
   * Detect if input contains a command
   * @param {string} input - Input text
   * @returns {Object|null} Command object or null if no command
   */
  detectCommand(input) {
    const trimmed = input.trim();

    // Check for =commands first (e.g., =rename(old, new) or =layout(decision))
    const equalsMatch = trimmed.match(this.equalsCommandPattern);
    if (equalsMatch) {
      const commandName = equalsMatch[1]; // e.g., "rename" or "layout"
      const argsString = equalsMatch[2]; // e.g., "old, new" or "decision"

      // Parse arguments (split by comma and trim)
      const args = argsString.split(',').map(arg => arg.trim());

      if (commandName === 'rename') {
        return {
          type: 'rename',
          oldId: args[0],
          newLabel: args[1] || '',
          rawCommand: trimmed,
        };
      } else if (commandName === 'layout') {
        return {
          type: 'layout',
          layoutType: args[0] || 'tree',
          rawCommand: trimmed,
        };
      }
    }

    // Check for @commands (e.g., @node_id)
    const atMatch = trimmed.match(this.atCommandPattern);
    if (atMatch) {
      const nodeId = atMatch[1];
      const params = atMatch[2].trim();

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
   * @param {Object} callbacks - Callback functions
   * @returns {boolean} True if command executed successfully
   */
  executeCommand(command, nodes, callbacks = {}) {
    const { onOpenStyleInspector, onSelectNode, onError, onApplyStyle, onRenameNode, onApplyLayout } = callbacks;

    console.log(`[CommandHandler] Executing command:`, command);

    // Handle different command types
    switch (command.type) {
      case 'rename':
        return this.executeRenameCommand(command, nodes, { onRenameNode, onError });

      case 'layout':
        return this.executeLayoutCommand(command, nodes, { onApplyLayout, onError });

      case 'openStyleInspector':
        return this.executeStyleInspectorCommand(command, nodes, { onOpenStyleInspector, onSelectNode, onApplyStyle, onError });

      default:
        console.error(`[CommandHandler] Unknown command type: ${command.type}`);
        return false;
    }
  }

  /**
   * Execute rename command
   */
  executeRenameCommand(command, nodes, callbacks = {}) {
    const { onRenameNode, onError } = callbacks;

    // Find the node
    const node = this.findNode(command.oldId, nodes);

    if (!node) {
      if (onError) {
        onError(`Node '${command.oldId}' not found`);
      }
      console.error(`[CommandHandler] Node '${command.oldId}' not found`);
      return false;
    }

    if (!command.newLabel) {
      if (onError) {
        onError(`New label is required for rename command`);
      }
      return false;
    }

    console.log(`[CommandHandler] Renaming node '${node.id}' to '${command.newLabel}'`);

    if (onRenameNode) {
      onRenameNode(node.id, command.newLabel);
    }

    return true;
  }

  /**
   * Execute layout command
   */
  executeLayoutCommand(command, nodes, callbacks = {}) {
    const { onApplyLayout, onError } = callbacks;

    console.log(`[CommandHandler] Applying layout: ${command.layoutType}`);

    if (onApplyLayout) {
      onApplyLayout(command.layoutType, nodes);
    }

    return true;
  }

  /**
   * Execute style inspector command
   */
  executeStyleInspectorCommand(command, nodes, callbacks = {}) {
    const { onOpenStyleInspector, onSelectNode, onApplyStyle, onError } = callbacks;

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
