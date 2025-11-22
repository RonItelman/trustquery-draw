import React from 'react';
import { createRoot } from 'react-dom/client';
import FlowDiagram from './FlowDiagram.jsx';
import { toPng } from 'html-to-image';

/**
 * Handler for rendering ReactFlow diagrams
 */
export default class ReactFlowHandler {
  constructor(outputContainer, options = {}) {
    this.outputContainer = outputContainer;
    this.options = options;
    this.diagrams = new Map(); // Track created diagrams by params
    this.reactFlowInstance = null; // Store ReactFlow instance
  }

  /**
   * Create a ReactFlow visualization (deprecated - use renderNodes instead)
   * @param {string} params - The diagram code
   * @param {string} type - 'mermaid' or 'arrow'
   */
  createVisualization(params, type = 'mermaid') {
    console.warn('[ReactFlowHandler] createVisualization is deprecated. Mermaid and arrow modes have been removed. Please use hybrid or shapes mode.');

    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      margin: 20px;
      padding: 16px;
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      color: #856404;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
    `;
    errorDiv.innerHTML = `<strong>Note:</strong> ${type} mode has been removed. Please use 'hybrid' mode instead.`;
    this.outputContainer.appendChild(errorDiv);
  }

  /**
   * Render nodes and edges directly without parsing
   * @param {Array} nodes - ReactFlow nodes
   * @param {Array} edges - ReactFlow edges
   * @param {string} type - Diagram type key
   * @param {Array} commands - Commands to execute (optional)
   * @param {Array} diagramHistory - Command history for export (optional)
   */
  renderNodes(nodes, edges, type = 'shapes', commands = [], diagramHistory = []) {
    // Check if diagram of this type already exists
    const existing = this.diagrams.get(type);

    if (existing) {
      // Update existing diagram
      console.log('[ReactFlowHandler] Updating existing diagram with nodes');
      existing.root.render(
        <FlowDiagram
          initialNodes={nodes}
          initialEdges={edges}
          commands={commands}
          diagramHistory={diagramHistory}
          enableStyleInspector={this.options.enableStyleInspector}
          onNodeSelected={this.options.onNodeSelected}
          onStyleChange={this.options.onStyleChange}
          onCopyStyle={this.options.onCopyStyle}
          onPasteStyleToChat={this.options.onPasteStyleToChat}
          onExportPNG={() => this.exportToPNG()}
          onClearCanvas={this.options.onClearCanvas}
          onSetInput={this.options.onSetInput}
          onCommandError={this.options.onCommandError}
          onReactFlowInit={(instance) => { this.reactFlowInstance = instance; }}
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
        commands={commands}
        diagramHistory={diagramHistory}
        enableStyleInspector={this.options.enableStyleInspector}
        onNodeSelected={this.options.onNodeSelected}
        onStyleChange={this.options.onStyleChange}
        onCopyStyle={this.options.onCopyStyle}
        onPasteStyleToChat={this.options.onPasteStyleToChat}
        onExportPNG={() => this.exportToPNG()}
        onClearCanvas={this.options.onClearCanvas}
        onSetInput={this.options.onSetInput}
        onCommandError={this.options.onCommandError}
        onReactFlowInit={(instance) => { this.reactFlowInstance = instance; }}
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

  /**
   * Fit view to show all nodes
   */
  fitView() {
    if (this.reactFlowInstance) {
      console.log('[ReactFlowHandler] Fitting view to show all nodes');
      this.reactFlowInstance.fitView({ padding: 0.2 });
    } else {
      console.warn('[ReactFlowHandler] ReactFlow instance not available');
    }
  }
}
