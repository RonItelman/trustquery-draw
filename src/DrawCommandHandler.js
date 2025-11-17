import CanvasRenderer from './CanvasRenderer.js';
import mermaid from 'mermaid';

export default class DrawCommandHandler {
  constructor(outputContainer, options = {}) {
    this.outputContainer = outputContainer;
    this.options = options;
    this.renderer = new CanvasRenderer();
    this.canvases = new Map(); // Track created canvases by params

    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    });
  }

  /**
   * Create a canvas visualization element
   * @param {string} params - The parameters from =draw(params) or mermaid code
   * @param {string} type - 'object' or 'mermaid'
   */
  createVisualization(params, type = 'object') {
    // Create unique key for deduplication
    const key = `${type}:${params}`;

    // Don't duplicate if already created
    if (this.canvases.has(key)) {
      console.log('[DrawCommandHandler] Canvas already exists for:', params);
      return;
    }

    // Create wrapper (like a chat bubble)
    const wrapper = document.createElement('div');
    wrapper.className = 'tq-draw-canvas-wrapper';
    wrapper.style.cssText = `
      margin: 10px 0;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      border: 1px solid #ddd;
    `;

    // Add label showing the params
    const label = document.createElement('div');
    label.className = 'tq-draw-label';
    label.textContent = `Visualization: ${type === 'mermaid' ? 'mermaid' : params.substring(0, 50)}...`;
    label.style.cssText = `
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
      font-family: monospace;
    `;

    wrapper.appendChild(label);

    if (type === 'mermaid') {
      // Render using Mermaid.js
      this.renderMermaid(params, wrapper, key);
    } else {
      // Render using canvas
      this.renderCanvas(params, wrapper, key);
    }

    this.outputContainer.appendChild(wrapper);
    console.log('[DrawCommandHandler] Created visualization for:', type);
  }

  /**
   * Render canvas-based visualization
   */
  renderCanvas(params, wrapper, key) {
    const canvas = document.createElement('canvas');
    const width = this.options.canvasWidth || 600;
    const height = this.options.canvasHeight || 400;
    const dpr = window.devicePixelRatio || 1;

    // Set actual size in memory (multiply by device pixel ratio)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Set display size (css pixels)
    canvas.style.cssText = `
      display: block;
      background: white;
      border-radius: 4px;
      width: ${width}px;
      height: ${height}px;
    `;

    // Scale context to match device pixel ratio
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    wrapper.appendChild(canvas);

    // Render using CanvasRenderer
    this.renderer.render(canvas, params, 'object');

    // Track this canvas
    this.canvases.set(key, { wrapper, canvas });
  }

  /**
   * Render Mermaid diagram
   */
  async renderMermaid(code, wrapper, key) {
    const container = document.createElement('div');
    container.className = 'mermaid-container';
    container.style.cssText = `
      background: white;
      border-radius: 4px;
      padding: 20px;
      overflow: auto;
    `;

    wrapper.appendChild(container);

    try {
      // Generate unique ID for this diagram
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Render mermaid diagram
      const { svg } = await mermaid.render(id, code);
      container.innerHTML = svg;

      // Track this visualization
      this.canvases.set(key, { wrapper, container });
    } catch (error) {
      console.error('[DrawCommandHandler] Mermaid render error:', error);
      container.innerHTML = `<div style="color: red; padding: 10px;">Error rendering Mermaid diagram: ${error.message}</div>`;
    }
  }

  /**
   * Clear all canvases
   */
  clearAll() {
    this.canvases.forEach(({ wrapper }) => {
      wrapper.remove();
    });
    this.canvases.clear();
  }
}
