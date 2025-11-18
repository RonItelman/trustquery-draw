import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import RectangleNode from './nodes/RectangleNode.jsx';
import DiamondNode from './nodes/DiamondNode.jsx';
import CircleNode from './nodes/CircleNode.jsx';
import StyleInspector from './StyleInspector.jsx';

const nodeTypes = {
  rectangle: RectangleNode,
  diamond: DiamondNode,
  circle: CircleNode,
  default: RectangleNode, // Fallback to rectangle
};

// Custom styles to override ReactFlow's default selection
const customStyles = `
  .react-flow__node.selected {
    box-shadow: none !important;
  }

  .react-flow__node.selected .react-flow__handle {
    opacity: 1 !important;
  }
`;

const FlowDiagram = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  enableStyleInspector = true,
  onNodeSelected,
  onStyleChange: onStyleChangeProp,
  onCopyStyle,
  onPasteStyleToChat,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showStyleInspector, setShowStyleInspector] = useState(false);

  // Clean up nodes when initialNodes changes - remove any appearance styles from node.style
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        // If node has any styles in node.style, remove them completely
        // ReactFlow applies node.style to the wrapper, which we don't want
        if (node.style && Object.keys(node.style).length > 0) {
          console.log('[FlowDiagram] Removing wrapper styles from node:', node.id, node.style);
          const { style, ...nodeWithoutStyle } = node;
          return nodeWithoutStyle;
        }
        return node;
      })
    );
  }, [initialNodes, setNodes]);

  // Track CMD (Mac) or CTRL (Windows) key state
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        setIsModifierKeyPressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (!e.metaKey && !e.ctrlKey) {
        setIsModifierKeyPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }, eds)),
    [setEdges],
  );

  // Handle node selection
  const handleNodeClick = useCallback((event, node) => {
    console.log('[FlowDiagram] Node clicked:', node.id);
    setSelectedNode(node);
    if (onNodeSelected) {
      onNodeSelected(node, node.style);
    }
  }, [onNodeSelected]);

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowStyleInspector(false);
  }, []);

  // Handle opening style inspector
  const handleOpenStyleInspector = useCallback(() => {
    console.log('[FlowDiagram] Opening style inspector');
    setShowStyleInspector(true);
  }, []);

  // Handle style change from inspector
  const handleStyleChange = useCallback((nodeId, newStyle) => {
    console.log('[FlowDiagram] handleStyleChange called for node:', nodeId);
    console.log('[FlowDiagram] New style object:', newStyle);

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          console.log('[FlowDiagram] Found node to update:', node.id);
          console.log('[FlowDiagram] Current node.style:', node.style);
          console.log('[FlowDiagram] Current node.data.styleOverrides:', node.data?.styleOverrides);

          // Only update data.styleOverrides - never touch node.style
          // ReactFlow applies node.style to the wrapper, which we don't want
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              styleOverrides: {
                ...node.data.styleOverrides,
                ...newStyle,
              },
            },
          };

          console.log('[FlowDiagram] Updated node.style:', updatedNode.style);
          console.log('[FlowDiagram] Updated node.data.styleOverrides:', updatedNode.data.styleOverrides);

          return updatedNode;
        }
        return node;
      })
    );

    if (onStyleChangeProp) {
      onStyleChangeProp(nodeId, newStyle);
    }
  }, [setNodes, onStyleChangeProp]);

  // Wrap the state change handlers to notify parent
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    if (onNodesChangeProp) {
      onNodesChangeProp(changes);
    }
  }, [onNodesChange, onNodesChangeProp]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    if (onEdgesChangeProp) {
      onEdgesChangeProp(changes);
    }
  }, [onEdgesChange, onEdgesChangeProp]);

  // Add callback to node data for opening style inspector
  const nodesWithCallback = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onOpenStyleInspector: handleOpenStyleInspector,
    },
  }));

  return (
    <div style={{ width: '100%', height: '500px', position: 'relative' }}>
      <style>{customStyles}</style>
      <ReactFlow
        nodes={nodesWithCallback}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        zoomOnScroll={isModifierKeyPressed}
        panOnScroll={false}
        zoomOnPinch={true}
        panOnDrag={true}
        preventScrolling={isModifierKeyPressed}
      >
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* Style Inspector Overlay */}
      {enableStyleInspector && selectedNode && showStyleInspector && (
        <StyleInspector
          selectedNode={selectedNode}
          onStyleChange={handleStyleChange}
          onCopyStyle={onCopyStyle}
          onPasteStyleToChat={onPasteStyleToChat}
          onClose={() => setShowStyleInspector(false)}
        />
      )}
    </div>
  );
};

export default FlowDiagram;
