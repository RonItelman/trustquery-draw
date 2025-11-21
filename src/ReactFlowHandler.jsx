import React from 'react';
import { createRoot } from 'react-dom/client';
import FlowDiagram from './FlowDiagram.jsx';
import MermaidParser from './MermaidParser.js';
import ArrowSyntaxParser from './ArrowSyntaxParser.js';
import { toPng } from 'html-to-image';

/**
 * Handler for rendering ReactFlow diagrams
 */
export default class ReactFlowHandler {
  constructor(outputContainer, options = {}) {
    this.outputContainer = outputContainer;
    this.options = options;
    this.diagrams = new Map(); // Track created diagrams by params
    this.mermaidParser = new MermaidParser();
    this.arrowParser = new ArrowSyntaxParser();
  }

  /**
   * Create a ReactFlow visualization
   * @param {string} params - The diagram code
   * @param {string} type - 'mermaid' or 'arrow'
   */
  createVisualization(params, type = 'mermaid') {
    // Use type as key so we reuse the same container
    const key = type;

    // Check if diagram of this type already exists
    const existing = this.diagrams.get(key);

    if (existing) {
      // Update existing diagram by reusing the React root
      console.log('[ReactFlowHandler] Updating existing diagram');
      if (type === 'arrow') {
        this.renderArrowDiagram(params, existing.container, key, existing.wrapper, existing.root);
      } else {
        this.renderMermaidDiagram(params, existing.container, key, existing.wrapper, existing.root);
      }
      return;
    }

    // Create wrapper (full height/width of container)
    console.log('[ReactFlowHandler] ✨ CREATING NEW CARD for type:', type);
    const wrapper = document.createElement('div');
    wrapper.className = 'tq-diagram-reactflow-wrapper';
    wrapper.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #f5f5f5;
    `;

    // Create container for ReactFlow
    const flowContainer = document.createElement('div');
    flowContainer.className = 'tq-reactflow-container';
    flowContainer.style.cssText = `
      background: white;
      height: 100%;
      width: 100%;
    `;

    wrapper.appendChild(flowContainer);
    this.outputContainer.appendChild(wrapper);

    // Render diagram based on type
    if (type === 'arrow') {
      this.renderArrowDiagram(params, flowContainer, key, wrapper);
    } else {
      this.renderMermaidDiagram(params, flowContainer, key, wrapper);
    }
  }

  /**
   * Render an arrow syntax diagram using ReactFlow
   */
  renderArrowDiagram(arrowCode, container, key, wrapper, existingRoot = null) {
    try {
      // Parse arrow syntax to ReactFlow format
      const { nodes, edges } = this.arrowParser.parse(arrowCode);

      // Reuse existing root or create new one
      const root = existingRoot || createRoot(container);
      root.render(
        <FlowDiagram
          initialNodes={nodes}
          initialEdges={edges}
          enableStyleInspector={this.options.enableStyleInspector}
          onNodeSelected={this.options.onNodeSelected}
          onStyleChange={this.options.onStyleChange}
          onCopyStyle={this.options.onCopyStyle}
          onPasteStyleToChat={this.options.onPasteStyleToChat}
          onExportPNG={() => this.exportToPNG()}
          onClearCanvas={this.options.onClearCanvas}
        />
      );

      // Track this diagram (only if new)
      if (!existingRoot) {
        this.diagrams.set(key, { wrapper, container, root });
      }
    } catch (error) {
      console.error('[ReactFlowHandler] Error parsing/rendering arrow diagram:', error);
      container.innerHTML = `
        <div style="color: red; padding: 20px;">
          Error rendering diagram: ${error.message}
        </div>
      `;
    }
  }

  /**
   * Render a mermaid diagram using ReactFlow
   */
  renderMermaidDiagram(mermaidCode, container, key, wrapper, existingRoot = null) {
    try {
      // Parse mermaid syntax to ReactFlow format
      const { nodes, edges } = this.mermaidParser.parse(mermaidCode);

      // Reuse existing root or create new one
      const root = existingRoot || createRoot(container);
      root.render(
        <FlowDiagram
          initialNodes={nodes}
          initialEdges={edges}
          enableStyleInspector={this.options.enableStyleInspector}
          onNodeSelected={this.options.onNodeSelected}
          onStyleChange={this.options.onStyleChange}
          onCopyStyle={this.options.onCopyStyle}
          onPasteStyleToChat={this.options.onPasteStyleToChat}
          onExportPNG={() => this.exportToPNG()}
          onClearCanvas={this.options.onClearCanvas}
        />
      );

      // Track this diagram (only if new)
      if (!existingRoot) {
        this.diagrams.set(key, { wrapper, container, root });
      }
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
   * Render nodes and edges directly without parsing
   * @param {Array} nodes - ReactFlow nodes
   * @param {Array} edges - ReactFlow edges
   * @param {string} type - Diagram type key
   */
  renderNodes(nodes, edges, type = 'shapes') {
    // Check if diagram of this type already exists
    const existing = this.diagrams.get(type);

    if (existing) {
      // Update existing diagram
      console.log('[ReactFlowHandler] Updating existing diagram with nodes');
      existing.root.render(
        <FlowDiagram
          initialNodes={nodes}
          initialEdges={edges}
          enableStyleInspector={this.options.enableStyleInspector}
          onNodeSelected={this.options.onNodeSelected}
          onStyleChange={this.options.onStyleChange}
          onCopyStyle={this.options.onCopyStyle}
          onPasteStyleToChat={this.options.onPasteStyleToChat}
          onExportPNG={() => this.exportToPNG()}
          onClearCanvas={this.options.onClearCanvas}
        />
      );
      return;
    }

    // Create new diagram
    console.log('[ReactFlowHandler] Creating new diagram with nodes');
    const wrapper = document.createElement('div');
    wrapper.className = 'tq-diagram-reactflow-wrapper';
    wrapper.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #f5f5f5;
    `;

    const flowContainer = document.createElement('div');
    flowContainer.className = 'tq-reactflow-container';
    flowContainer.style.cssText = `
      background: white;
      height: 100%;
      width: 100%;
    `;

    wrapper.appendChild(flowContainer);
    this.outputContainer.appendChild(wrapper);

    const root = createRoot(flowContainer);
    root.render(
      <FlowDiagram
        initialNodes={nodes}
        initialEdges={edges}
        enableStyleInspector={this.options.enableStyleInspector}
        onNodeSelected={this.options.onNodeSelected}
        onStyleChange={this.options.onStyleChange}
        onCopyStyle={this.options.onCopyStyle}
        onPasteStyleToChat={this.options.onPasteStyleToChat}
        onExportPNG={() => this.exportToPNG()}
        onClearCanvas={this.options.onClearCanvas}
      />
    );

    this.diagrams.set(type, { wrapper, container: flowContainer, root });
  }

  /**
   * Clear a specific diagram type
   * @param {string} type - The diagram type to clear
   */
  clearDiagram(type) {
    const diagram = this.diagrams.get(type);
    if (diagram) {
      if (diagram.root) {
        diagram.root.unmount();
      }
      diagram.wrapper.remove();
      this.diagrams.delete(type);
      console.log(`[ReactFlowHandler] Cleared diagram: ${type}`);
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

  /**
   * Export current diagram to PNG
   * @param {string} filename - The filename for the downloaded PNG
   */
  async exportToPNG(filename = 'diagram.png') {
    try {
      // Get the output container which contains the ReactFlow diagram
      const node = this.outputContainer;

      if (!node) {
        console.error('[ReactFlowHandler] No output container found');
        return;
      }

      console.log('[ReactFlowHandler] Exporting to PNG...');

      // Convert to PNG
      const dataUrl = await toPng(node, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2, // Higher quality
      });

      // Create download link
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      console.log('[ReactFlowHandler] PNG exported successfully');
    } catch (error) {
      console.error('[ReactFlowHandler] Error exporting PNG:', error);
    }
  }
}
