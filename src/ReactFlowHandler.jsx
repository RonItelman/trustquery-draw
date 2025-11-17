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
      margin: 10px 0;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      border: 1px solid #ddd;
    `;

    // Add label
    const label = document.createElement('div');
    label.className = 'tq-draw-label';
    label.textContent = 'Diagram: flowchart';
    label.style.cssText = `
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
      font-family: monospace;
    `;

    wrapper.appendChild(label);

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
      console.log('[ReactFlowHandler] Rendering mermaid diagram with code:', mermaidCode);

      // Parse mermaid syntax to ReactFlow format
      const { nodes, edges } = this.parser.parse(mermaidCode);

      console.log('[ReactFlowHandler] Parsed nodes:', JSON.stringify(nodes, null, 2));
      console.log('[ReactFlowHandler] Parsed edges:', JSON.stringify(edges, null, 2));
      console.log('[ReactFlowHandler] Using ReactFlow (not old mermaid library)');

      // Create React root and render
      const root = createRoot(container);
      root.render(
        <FlowDiagram
          initialNodes={nodes}
          initialEdges={edges}
          onNodesChange={(changes) => {
            console.log('[ReactFlowHandler] Nodes changed:', changes);
          }}
          onEdgesChange={(changes) => {
            console.log('[ReactFlowHandler] Edges changed:', changes);
          }}
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
