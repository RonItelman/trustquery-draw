import React from 'react';
import { createRoot } from 'react-dom/client';
import FlowDiagram from './FlowDiagram.jsx';
import MermaidParser from './MermaidParser.js';

/**
 * Handler for rendering ReactFlow diagrams
 */
export default class ReactFlowHandler {
  constructor(outputContainer, options = {}) {
    this.outputContainer = outputContainer;
    this.options = options;
    this.diagrams = new Map(); // Track created diagrams by params
    this.parser = new MermaidParser();
  }

  /**
   * Create a ReactFlow visualization
   * @param {string} params - The mermaid code
   * @param {string} type - Always 'mermaid'
   */
  createVisualization(params, type = 'mermaid') {
    // Create unique key for deduplication
    const key = `${type}:${params}`;

    // Don't duplicate if already created
    if (this.diagrams.has(key)) {
      console.log('[ReactFlowHandler] Diagram already exists for:', params);
      return;
    }

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'tq-draw-reactflow-wrapper';
    wrapper.style.cssText = `
      margin: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    `;

    // Create container for ReactFlow
    const flowContainer = document.createElement('div');
    flowContainer.className = 'tq-reactflow-container';
    flowContainer.style.cssText = `
      background: white;
      border-radius: 4px;
      height: ${this.options.canvasHeight || 500}px;
      width: 100%;
    `;

    wrapper.appendChild(flowContainer);
    this.outputContainer.appendChild(wrapper);

    // Auto-scroll to the new visualization
    setTimeout(() => {
      wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    // Render mermaid diagram
    this.renderMermaidDiagram(params, flowContainer, key, wrapper);
  }

  /**
   * Render a mermaid diagram using ReactFlow
   */
  renderMermaidDiagram(mermaidCode, container, key, wrapper) {
    try {
      // Parse mermaid syntax to ReactFlow format
      const { nodes, edges } = this.parser.parse(mermaidCode);

      // Create React root and render
      const root = createRoot(container);
      root.render(
        <FlowDiagram
          initialNodes={nodes}
          initialEdges={edges}
          enableStyleInspector={this.options.enableStyleInspector}
          onNodeSelected={this.options.onNodeSelected}
          onStyleChange={this.options.onStyleChange}
          onCopyStyle={this.options.onCopyStyle}
          onPasteStyleToChat={this.options.onPasteStyleToChat}
        />
      );

      // Track this diagram
      this.diagrams.set(key, { wrapper, container, root });
    } catch (error) {
      console.error('[ReactFlowHandler] Error parsing/rendering diagram:', error);
      container.innerHTML = `
        <div style="color: red; padding: 20px;">
          Error rendering diagram: ${error.message}
        </div>
      `;
    }
  }

  /**
   * Clear all diagrams
   */
  clearAll() {
    this.diagrams.forEach(({ wrapper, root }) => {
      if (root) {
        root.unmount();
      }
      wrapper.remove();
    });
    this.diagrams.clear();
  }
}
