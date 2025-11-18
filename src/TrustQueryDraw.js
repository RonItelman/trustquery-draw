import ReactFlowHandler from './ReactFlowHandler.jsx';

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
    container.className = 'tq-draw-mermaid-container';

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
    this.drawHandler = new ReactFlowHandler(outputContainer, this.options);

    this.init();
  }

  normalizeOptions(options) {
    const triggerMap = options.triggerMap || {};

    return {
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

    // Listen to textarea input
    this.textarea.addEventListener('input', () => this.scan());

    // Also listen for Enter key (when user "sends" the message)
    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        setTimeout(() => this.scan(), 0);
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
   * Scan textarea for =mermaid` commands and ```mermaid markdown blocks
   */
  scan() {
    const text = this.textarea.value;

    // Find all =mermaid` commands
    const mermaidCommands = this.findMermaidCommands(text);

    // Find all ```mermaid markdown blocks
    const markdownBlocks = this.findMarkdownMermaidBlocks(text);

    // Process =mermaid` commands
    mermaidCommands.forEach(({ code, fullMatch }) => {
      console.log('[TrustQueryDraw] Detected =mermaid command:', fullMatch);

      // Create visualization with Mermaid code
      this.drawHandler.createVisualization(code, 'mermaid');

      // Trigger callback
      if (this.options.onDraw) {
        this.options.onDraw({ params: code, fullMatch, type: 'mermaid' });
      }
    });

    // Process ```mermaid markdown blocks
    markdownBlocks.forEach(({ code, fullMatch }) => {
      console.log('[TrustQueryDraw] Detected ```mermaid block:', fullMatch);

      // Create visualization with Mermaid code
      this.drawHandler.createVisualization(code, 'mermaid');

      // Trigger callback
      if (this.options.onDraw) {
        this.options.onDraw({ params: code, fullMatch, type: 'mermaid' });
      }
    });
  }

  /**
   * Find all =mermaid` commands in text
   * @param {string} text - Text to search
   * @returns {Array} Array of {code, fullMatch} objects
   */
  findMermaidCommands(text) {
    const commands = [];
    const pattern = /=mermaid`/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const startIndex = match.index;
      const codeStart = pattern.lastIndex;

      // Find the closing backtick
      let i = codeStart;
      let escaped = false;

      while (i < text.length) {
        const char = text[i];

        if (escaped) {
          escaped = false;
          i++;
          continue;
        }

        if (char === '\\') {
          escaped = true;
          i++;
          continue;
        }

        if (char === '`') {
          // Found closing backtick
          const code = text.substring(codeStart, i);
          const fullMatch = text.substring(startIndex, i + 1);

          commands.push({
            code: code.trim(),
            fullMatch
          });

          // Move pattern index past this match
          pattern.lastIndex = i + 1;
          break;
        }

        i++;
      }
    }

    return commands;
  }

  /**
   * Find all ```mermaid markdown code blocks in text
   * @param {string} text - Text to search
   * @returns {Array} Array of {code, fullMatch} objects
   */
  findMarkdownMermaidBlocks(text) {
    const blocks = [];
    const pattern = /```mermaid\n/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const startIndex = match.index;
      const codeStart = pattern.lastIndex;

      // Find the closing ```
      const closingPattern = /\n```/;
      const remainingText = text.substring(codeStart);
      const closingMatch = closingPattern.exec(remainingText);

      if (closingMatch) {
        const code = remainingText.substring(0, closingMatch.index);
        const endIndex = codeStart + closingMatch.index + closingMatch[0].length;
        const fullMatch = text.substring(startIndex, endIndex);

        blocks.push({
          code: code.trim(),
          fullMatch
        });

        // Move pattern index past this match
        pattern.lastIndex = endIndex;
      }
    }

    return blocks;
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
}
