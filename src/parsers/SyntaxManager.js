import { QuotedStringParser } from './QuotedStringParser.js';
import { EdgeSyntaxParser } from './EdgeSyntaxParser.js';
import { NodeBuilder } from './NodeBuilder.js';
import { EdgeBuilder } from './EdgeBuilder.js';
import { CommandHandler } from './CommandHandler.js';
import { IDManager } from './IDManager.js';

/**
 * SyntaxManager - Main orchestrator for parsing diagram syntax
 * Coordinates all parser helpers to convert text input into nodes and edges
 *
 * Syntax Rules:
 * - Each line is a separate command
 * - Use quotes for multi-line labels: "Multi\nLine"->node
 * - Arrows: ->, <-, <->
 * - Labeled arrows: -label->
 * - Standalone nodes: just type the label
 * - Commands: @node_id to open style inspector
 */
export class SyntaxManager {
  constructor() {
    this.quotedStringParser = new QuotedStringParser();
    this.edgeSyntaxParser = new EdgeSyntaxParser();
    this.idManager = new IDManager();
    this.nodeBuilder = new NodeBuilder(this.idManager);
    this.edgeBuilder = new EdgeBuilder();
    this.commandHandler = new CommandHandler();
    this.detectedCommands = [];
  }

  /**
   * Parse input text into nodes and edges
   * @param {string} input - Raw input text
   * @returns {Object} {nodes: Array, edges: Array, commands: Array}
   */
  parse(input) {
    console.log('[SyntaxManager] Starting parse with input:', input);

    // Clear previous state
    this.nodeBuilder.clear();
    this.edgeBuilder.clear();
    this.detectedCommands = [];

    // Step 1: Extract commands (like @node_id)
    const { commands, cleanedInput } = this.commandHandler.extractCommand(input);
    this.detectedCommands = commands;
    console.log('[SyntaxManager] Detected commands:', commands);
    console.log('[SyntaxManager] Cleaned input:', cleanedInput);

    // Step 2: Extract quoted strings (for multi-line labels)
    const processedInput = this.quotedStringParser.extractQuotedStrings(cleanedInput);
    console.log('[SyntaxManager] After extracting quotes:', processedInput);

    // Step 3: Split into lines (each line is a command)
    const lines = processedInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    console.log('[SyntaxManager] Lines to process:', lines);

    // Step 4: Process each line
    lines.forEach((line, index) => {
      console.log(`[SyntaxManager] Processing line ${index}: "${line}"`);
      this.parseLine(line);
    });

    const result = {
      nodes: this.nodeBuilder.getNodes(),
      edges: this.edgeBuilder.getEdges(),
      commands: this.detectedCommands,
    };

    console.log('[SyntaxManager] Parse complete:', result);
    return result;
  }

  /**
   * Parse a single line
   * @param {string} line - Line to parse
   */
  parseLine(line) {
    // Check if line contains arrows
    const { nodeLabels, arrows } = this.edgeSyntaxParser.parseLine(line);

    if (arrows.length > 0) {
      // Line has arrows - create nodes and edges
      // Restore quoted strings in node labels
      const restoredLabels = nodeLabels.map(label =>
        this.quotedStringParser.restoreQuotedStrings(label)
      );

      // Create nodes
      const nodeIds = restoredLabels.map(label => this.nodeBuilder.ensureNode(label));

      // Create edges
      this.edgeBuilder.createEdgesFromArrows(arrows, nodeIds);
    } else {
      // No arrows - standalone node
      const restoredLabel = this.quotedStringParser.restoreQuotedStrings(line);
      this.nodeBuilder.ensureNode(restoredLabel);
      console.log(`[SyntaxManager] Added standalone node: ${restoredLabel}`);
    }
  }

  /**
   * Get node order (for layout)
   * @returns {Array} Array of node IDs in creation order
   */
  getNodeOrder() {
    return this.nodeBuilder.getNodeOrder();
  }

  /**
   * Get detected commands
   * @returns {Array} Array of command objects
   */
  getCommands() {
    return this.detectedCommands;
  }

  /**
   * Get command handler
   * @returns {CommandHandler} Command handler instance
   */
  getCommandHandler() {
    return this.commandHandler;
  }

  /**
   * Get ID manager
   * @returns {IDManager} ID manager instance
   */
  getIDManager() {
    return this.idManager;
  }

  /**
   * Clear ID mappings (called when canvas is cleared)
   */
  clearIDMappings() {
    this.idManager.clear();
    console.log('[SyntaxManager] ID mappings cleared');
  }
}
