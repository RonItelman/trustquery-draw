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
import SquareNode from './nodes/SquareNode.jsx';
import StarNode from './nodes/StarNode.jsx';
import PentagonNode from './nodes/PentagonNode.jsx';
import HexagonNode from './nodes/HexagonNode.jsx';
import StyleInspector from './StyleInspector.jsx';
import SettingsPanel from './SettingsPanel.jsx';
import SelfLoopEdge from './edges/SelfLoopEdge.jsx';

const nodeTypes = {
  rectangle: RectangleNode,
  diamond: DiamondNode,
  circle: CircleNode,
  square: SquareNode,
  star: StarNode,
  pentagon: PentagonNode,
  hexagon: HexagonNode,
  default: RectangleNode, // Fallback to rectangle
};

const edgeTypes = {
  selfLoop: SelfLoopEdge,
};

// Custom styles to override ReactFlow's default selection
const customStyles = `
  .react-flow__node.selected {
    box-shadow: none !important;
  }

  .react-flow__node.selected .react-flow__handle {
    opacity: 1 !important;
  }

  .tq-flow-space-pan .react-flow__pane {
    cursor: grab !important;
  }

  .tq-flow-space-pan .react-flow__pane:active {
    cursor: grabbing !important;
  }
`;

const FlowDiagram = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  enableStyleInspector = true,
  enableSettingsPanel = true,
  onNodeSelected,
  onStyleChange: onStyleChangeProp,
  onCopyStyle,
  onPasteStyleToChat,
  onExportPNG,
  onClearCanvas,
  onSetInput,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showStyleInspector, setShowStyleInspector] = useState(false);
  const [defaultStyles, setDefaultStyles] = useState({
    fillColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2,
  });
  const reactFlowInstance = useRef(null);

  // Update nodes when initialNodes changes
  useEffect(() => {
    setNodes((currentNodes) => {
      // Create a map of current nodes by ID to preserve user changes (position, style)
      const currentNodesMap = new Map(currentNodes.map(n => [n.id, n]));

      // Process new nodes
      const updatedNodes = initialNodes.map((newNode) => {
        const existingNode = currentNodesMap.get(newNode.id);

        if (existingNode) {
          // Node exists - preserve position and styleOverrides, update everything else
          return {
            ...newNode,
            position: existingNode.position, // Keep user's position
            data: {
              ...newNode.data,
              styleOverrides: existingNode.data?.styleOverrides || {}, // Keep user's styles
            },
          };
        } else {
          // New node - apply default styles
          const { style, ...nodeWithoutStyle } = newNode;
          return {
            ...nodeWithoutStyle,
            data: {
              ...nodeWithoutStyle.data,
              styleOverrides: {
                backgroundColor: defaultStyles.fillColor,
                borderColor: defaultStyles.borderColor,
                borderWidth: defaultStyles.borderWidth,
              },
            },
          };
        }
      });

      return updatedNodes;
    });
  }, [initialNodes, setNodes, defaultStyles]);

  // Update edges when initialEdges changes
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Log JSON representation whenever nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const visualization = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          label: node.data.label,
          position: node.position,
          styleOverrides: node.data.styleOverrides,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
        })),
      };
      console.log('[Visualization JSON]', JSON.stringify(visualization, null, 2));
    }
  }, [nodes, edges]);

  // Trigger fitView when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 && reactFlowInstance.current) {
      // Use setTimeout to ensure nodes are rendered before fitting view
      setTimeout(() => {
        reactFlowInstance.current.fitView({ padding: 0.2, duration: 200 });
      }, 50);
    }
  }, [nodes, edges]);

  // Track CMD (Mac) or CTRL (Windows) key state
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        setIsModifierKeyPressed(true);
      }
      // Track spacebar for panning (but not when typing in input/textarea)
      if (e.code === 'Space' && !e.repeat) {
        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isTyping) {
          e.preventDefault(); // Prevent page scroll
          setIsSpacePressed(true);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (!e.metaKey && !e.ctrlKey) {
        setIsModifierKeyPressed(false);
      }
      // Release spacebar
      if (e.code === 'Space') {
        setIsSpacePressed(false);
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
    console.log('[FlowDiagram] selectedNode:', selectedNode);
    console.log('[FlowDiagram] enableStyleInspector:', enableStyleInspector);
    setShowStyleInspector(true);
  }, [selectedNode, enableStyleInspector]);

  // Handle style change from inspector
  const handleStyleChange = useCallback((nodeId, newStyle) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Only update data.styleOverrides - never touch node.style
          // ReactFlow applies node.style to the wrapper, which we don't want
          return {
            ...node,
            data: {
              ...node.data,
              styleOverrides: {
                ...node.data.styleOverrides,
                ...newStyle,
              },
            },
          };
        }
        return node;
      })
    );

    if (onStyleChangeProp) {
      onStyleChangeProp(nodeId, newStyle);
    }
  }, [setNodes, onStyleChangeProp]);

  // Handle label change from double-click editing
  const handleLabelChange = useCallback((nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Handle default style changes from settings panel
  const handleDefaultStyleChange = useCallback((newStyles) => {
    console.log('[FlowDiagram] Default styles changed:', newStyles);
    setDefaultStyles(newStyles);
  }, []);

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

  // Add callbacks to node data for opening style inspector and handling style changes
  const nodesWithCallback = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onOpenStyleInspector: handleOpenStyleInspector,
      onStyleChange: handleStyleChange,
      onLabelChange: handleLabelChange,
    },
  }));

  return (
    <div
      className={`tq-flow-diagram-wrapper ${isSpacePressed ? 'tq-flow-space-pan' : ''}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <style>{customStyles}</style>
      <ReactFlow
        nodes={nodesWithCallback}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
          instance.fitView({ padding: 0.2 });
        }}
        nodesDraggable={!isSpacePressed}
        nodesConnectable={true}
        elementsSelectable={!isSpacePressed}
        noDragClassName="nodrag"
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

      {/* Settings Panel */}
      {enableSettingsPanel && (
        <SettingsPanel
          defaultStyles={defaultStyles}
          onDefaultStyleChange={handleDefaultStyleChange}
          onExportPNG={onExportPNG}
          onClearCanvas={onClearCanvas}
          onSetInput={onSetInput}
        />
      )}

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

      {/* Debug: Show inspector state */}
      {console.log('[FlowDiagram] Render - enableStyleInspector:', enableStyleInspector, 'selectedNode:', selectedNode?.id, 'showStyleInspector:', showStyleInspector)}
    </div>
  );
};

export default FlowDiagram;
