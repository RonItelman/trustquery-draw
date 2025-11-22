import ReactFlowHandler from './ReactFlowHandler.jsx';
import { DiagramParser } from './DiagramParser.js';

export default class TrustQueryDraw {
  static instances = new Map();

  /**
   * Render a mermaid diagram and return a DOM element
   * @param {string} mermaidCode - The mermaid diagram code
   * @param {Object} options - Configuration options
   * @param {number} options.width - Canvas width (default: 700)
   * @param {number} options.height - Canvas height (default: 500)
   * @param {boolean} options.enableStyleInspector - Show style inspector (default: true)
   * @param {Function} options.onNodeSelected - Callback when node is selected
   * @param {Function} options.onStyleChange - Callback when style changes
   * @param {Function} options.onCopyStyle - Callback when copying style
   * @param {Function} options.onPasteStyleToChat - Callback when pasting style to chat
   * @returns {HTMLElement} The rendered diagram element
   */
  static renderMermaid(mermaidCode, options = {}) {
    // Create a container for this diagram
    const container = document.createElement('div');
    container.className = 'tq-diagram-mermaid-container';

    // Create a handler instance
    const handler = new ReactFlowHandler(container, {
      canvasWidth: options.width || 700,
      canvasHeight: options.height || 500,
      enableStyleInspector: options.enableStyleInspector !== false,
      onNodeSelected: options.onNodeSelected,
      onStyleChange: options.onStyleChange,
      onCopyStyle: options.onCopyStyle,
      onPasteStyleToChat: options.onPasteStyleToChat,
      ...options
    });

    // Render the diagram
    handler.createVisualization(mermaidCode, 'mermaid');

    // Return the first child (the wrapper with the diagram)
    return container.firstChild;
  }

  /**
   * Initialize TrustQueryDraw
   * @param {string|HTMLElement} textareaId - Textarea to watch
   * @param {string|HTMLElement} outputContainerId - Container for canvas elements
   * @param {Object} options - Configuration
   */
  static init(textareaId, outputContainerId, options = {}) {
    const textarea = typeof textareaId === 'string'
      ? document.getElementById(textareaId)
      : textareaId;

    const outputContainer = typeof outputContainerId === 'string'
      ? document.getElementById(outputContainerId)
      : outputContainerId;

    if (!textarea || !outputContainer) {
      console.error('[TrustQueryDraw] Textarea or output container not found');
      return null;
    }

    const instance = new TrustQueryDraw(textarea, outputContainer, options);
    TrustQueryDraw.instances.set(textarea, instance);
    return instance;
  }

  constructor(textarea, outputContainer, options = {}) {
    this.textarea = textarea;
    this.outputContainer = outputContainer;
    this.options = this.normalizeOptions(options);

    this.triggerMap = null;
    this.drawHandler = new ReactFlowHandler(outputContainer, {
      ...this.options,
      onClearCanvas: () => this.clearDiagram(),
      onSetInput: (text) => {
        this.textarea.value = text;
        this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
        this.textarea.focus();
      },
      onCommandError: (message) => this.showError(message),
    });
    this.diagramParser = new DiagramParser();
    this.diagramHistory = []; // Accumulate all diagram content

    this.init();
  }

  normalizeOptions(options) {
    const triggerMap = options.triggerMap || {};

    return {
      // Mode function (returns 'off', 'mermaid', or 'arrow')
      mode: options.mode || (() => 'off'),

      // Trigger map config
      triggerMapUrl: triggerMap.url || null,
      triggerMapData: triggerMap.data || null,
      triggerMapSource: triggerMap.source || null,

      // Visual settings
      canvasWidth: options.canvasWidth || 600,
      canvasHeight: options.canvasHeight || 400,
      autoRender: options.autoRender !== false,

      // Events
      onDraw: options.onDraw || null,
      onError: options.onError || null
    };
  }

  async init() {
    // Load trigger map
    if (this.options.triggerMapUrl) {
      await this.loadTriggerMap();
    } else if (this.options.triggerMapData) {
      this.updateTriggerMap(this.options.triggerMapData);
    }

    // Listen for Enter key to render (Shift+Enter for newlines)
    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Don't add newline

        // Check if the command is "save"
        const text = this.textarea.value.trim().toLowerCase();
        if (text === 'save') {
          console.log('[TrustQueryDraw] Save command detected - exporting to PNG');
          this.exportToPNG();
          this.textarea.value = ''; // Clear input after save
          return;
        }

        this.scan();
        this.textarea.value = ''; // Clear input after rendering
      }
    });

    console.log('[TrustQueryDraw] Initialized');
  }

  async loadTriggerMap() {
    try {
      const response = await fetch(this.options.triggerMapUrl);
      const data = await response.json();
      this.updateTriggerMap(data);
    } catch (error) {
      console.error('[TrustQueryDraw] Failed to load trigger map:', error);
    }
  }

  updateTriggerMap(triggerMap) {
    this.triggerMap = triggerMap;
    console.log('[TrustQueryDraw] Trigger map updated');
  }

  /**
   * Scan textarea based on current mode
   */
  scan() {
    const text = this.textarea.value.trim();
    const mode = this.options.mode();

    console.log('[TrustQueryDraw] === SCAN START ===');
    console.log('[TrustQueryDraw] Mode:', mode);
    console.log('[TrustQueryDraw] Textarea content:', text);

    // If mode is OFF, do nothing
    if (mode === 'off') {
      console.log('[TrustQueryDraw] Mode is OFF - skipping');
      return;
    }

    // If text is provided, add it to history
    if (text) {
      this.diagramHistory.push(text);
      console.log('[TrustQueryDraw] Added to history. Total lines:', this.diagramHistory.length);
    }

    // Get full accumulated content
    const fullContent = this.diagramHistory.join('\n');

    // If no accumulated content, render empty canvas with grid
    if (!fullContent) {
      console.log('[TrustQueryDraw] No content yet - rendering empty canvas');
      if (mode === 'arrow' || mode === 'shapes' || mode === 'hybrid') {
        this.drawHandler.renderNodes([], [], mode);
      }
      return;
    }

    try {
      if (mode === 'mermaid') {
        console.log('[TrustQueryDraw] Processing as MERMAID syntax');

        // Create visualization with Mermaid code
        this.drawHandler.createVisualization(fullContent, 'mermaid');

        // Trigger callback
        if (this.options.onDraw) {
          this.options.onDraw({ params: fullContent, fullMatch: fullContent, type: 'mermaid' });
        }

      } else if (mode === 'arrow') {
        console.log('[TrustQueryDraw] Processing as ARROW syntax');

        // Only process if text contains arrow syntax
        if (!fullContent.includes('->')) {
          console.log('[TrustQueryDraw] No arrows found yet, skipping');
          return;
        }

        // Create visualization with arrow syntax
        this.drawHandler.createVisualization(fullContent, 'arrow');

        // Trigger callback
        if (this.options.onDraw) {
          this.options.onDraw({ params: fullContent, fullMatch: fullContent, type: 'arrow' });
        }

      } else if (mode === 'shapes') {
        console.log('[TrustQueryDraw] Processing as SHAPES mode');

        // Parse the input using DiagramParser
        const { nodes, edges, commands } = this.diagramParser.getNodesAndEdges(fullContent);

        // Render shapes using the direct node rendering method
        this.drawHandler.renderNodes(nodes, edges, 'shapes', commands);

        // Trigger callback
        if (this.options.onDraw) {
          this.options.onDraw({ params: fullContent, fullMatch: fullContent, type: 'shapes' });
        }

      } else if (mode === 'hybrid') {
        console.log('[TrustQueryDraw] Processing as HYBRID mode');

        // Parse the input using DiagramParser
        const { nodes, edges, commands } = this.diagramParser.getNodesAndEdges(fullContent);

        // Render shapes using the direct node rendering method
        this.drawHandler.renderNodes(nodes, edges, 'hybrid', commands);

        // Trigger callback
        if (this.options.onDraw) {
          this.options.onDraw({ params: fullContent, fullMatch: fullContent, type: 'hybrid' });
        }

      } else {
        console.warn('[TrustQueryDraw] Unknown mode:', mode);
      }

      console.log('[TrustQueryDraw] === SCAN COMPLETE ===');

    } catch (error) {
      console.error('[TrustQueryDraw] Error during scan:', error);

      // Trigger error callback
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  /**
   * Show error message to user
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'tq-diagram-error';
    errorDiv.style.cssText = `
      margin: 20px;
      padding: 16px;
      background: #ffebee;
      border: 2px solid #ef5350;
      border-radius: 8px;
      color: #c62828;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
    `;
    errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;

    this.outputContainer.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  /**
   * Export current diagram to PNG
   * @param {string} filename - The filename for the downloaded PNG
   */
  exportToPNG(filename = 'diagram.png') {
    console.log('[TrustQueryDraw] Exporting to PNG...');
    this.drawHandler.exportToPNG(filename);
  }

  /**
   * Fit view to show all nodes
   */
  fitView() {
    console.log('[TrustQueryDraw] Fitting view...');
    this.drawHandler.fitView();
  }



  /**
   * Enable/disable the extension
   */
  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  /**
   * Clear diagram history and canvas
   */
  clearDiagram() {
    this.diagramHistory = [];

    // Clear ID mappings
    this.diagramParser.getSyntaxManager().clearIDMappings();

    const mode = this.options.mode();
    if (mode !== 'off') {
      this.drawHandler.renderNodes([], [], mode);
    }
    console.log('[TrustQueryDraw] Diagram cleared');
  }

  /**
   * Add a node directly to the canvas without using textarea
   * @param {string} shapeType - The type of shape (rectangle, square, circle, diamond)
   */
  addNode(shapeType) {
    const mode = this.options.mode();
    if (mode === 'off') {
      console.warn('[TrustQueryDraw] Cannot add node - mode is OFF');
      return;
    }

    // Get current nodes to determine next node number
    const { nodes } = this.diagramParser.getNodesAndEdges(this.diagramHistory.join('\n'));
    const nextNodeNumber = nodes.length + 1;

    // Create node ID with shape type and node number
    const nodeId = shapeType === 'rectangle' ? `${nextNodeNumber}` : `${shapeType}:${nextNodeNumber}`;

    // Add node to diagram history
    this.diagramHistory.push(nodeId);

    // Re-render
    this.scan();

    console.log(`[TrustQueryDraw] Added ${shapeType} node: ${nodeId}`);
  }
}
