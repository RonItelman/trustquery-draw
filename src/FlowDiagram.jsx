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
import CircleNode from './nodes/CircleNode.jsx';
import SquareNode from './nodes/SquareNode.jsx';
import DiamondNode from './nodes/DiamondNode.jsx';
import StyleInspector from './StyleInspector.jsx';
import SettingsPanel from './SettingsPanel.jsx';
import SelfLoopEdge from './edges/SelfLoopEdge.jsx';
import { nodeDefaults } from './nodes/nodeDefaults.js';
import { DiagramParser } from './DiagramParser.js';
import * as layoutAlgorithms from './utils/layoutAlgorithms.js';

const nodeTypes = {
  rectangle: RectangleNode,
  circle: CircleNode,
  square: SquareNode,
  diamond: DiamondNode,
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

  /* Default cursor for pane (normal mode) */
  .react-flow__pane {
    cursor: default !important;
  }

  /* Grab cursor when spacebar is held */
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
  commands = [],
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
  onCommandError,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false);

  // Handle JSON export
  const handleExportJSON = useCallback(() => {
    const exportData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        nodeNumber: node.data.nodeNumber,
        position: node.position,
        styleOverrides: node.data.styleOverrides,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: edge.type,
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(jsonString);
  }, [nodes, edges]);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showStyleInspector, setShowStyleInspector] = useState(false);
  const [defaultStyles, setDefaultStyles] = useState({
    fillColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1,
  });
  const reactFlowInstance = useRef(null);
  const diagramParserRef = useRef(new DiagramParser());
  const prevCommandsRef = useRef([]);

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
          // Get default fontSize for this node type
          const nodeTypeDefaults = nodeDefaults[newNode.type] || nodeDefaults.rectangle;
          const defaultFontSize = nodeTypeDefaults.fontSize || '11px';

          return {
            ...nodeWithoutStyle,
            data: {
              ...nodeWithoutStyle.data,
              styleOverrides: {
                backgroundColor: defaultStyles.fillColor,
                borderColor: defaultStyles.borderColor,
                borderWidth: defaultStyles.borderWidth,
                fontSize: defaultFontSize,
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
    setEdges((currentEdges) => {
      // Create a map of initial edges by ID
      const initialEdgesMap = new Map(initialEdges.map(e => [e.id, e]));

      // Keep manually created edges (ones not in initialEdges)
      const manualEdges = currentEdges.filter(edge => !initialEdgesMap.has(edge.id));

      // Merge: initialEdges + manual edges
      return [...initialEdges, ...manualEdges];
    });
  }, [initialEdges, setEdges]);

  // Log JSON representation whenever nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const visualization = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          nodeNumber: node.data.nodeNumber,
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

  // Execute commands when they change
  useEffect(() => {
    if (commands && commands.length > 0 && nodes.length > 0) {
      console.log('[FlowDiagram] All commands:', commands);
      console.log('[FlowDiagram] Previous commands:', prevCommandsRef.current);

      // Find new commands that weren't in the previous array
      const newCommands = commands.filter(cmd =>
        !prevCommandsRef.current.some(prevCmd =>
          JSON.stringify(prevCmd) === JSON.stringify(cmd)
        )
      );

      console.log('[FlowDiagram] New commands to execute:', newCommands);

      if (newCommands.length === 0) {
        console.log('[FlowDiagram] No new commands to execute');
        return;
      }

      const commandHandler = diagramParserRef.current.getCommandHandler();

      newCommands.forEach(command => {
        console.log('[FlowDiagram] Executing command:', command);

        const success = commandHandler.executeCommand(command, nodes, {
          onSelectNode: (node) => {
            console.log('[FlowDiagram] Selecting node from command:', node.id);
            setSelectedNode(node);
          },
          onOpenStyleInspector: (node) => {
            console.log('[FlowDiagram] Opening style inspector from command for node:', node.id);
            setShowStyleInspector(true);
          },
          onApplyStyle: (nodeId, styles) => {
            console.log('[FlowDiagram] Applying styles from command:', nodeId, styles);
            setNodes((nds) =>
              nds.map((n) => {
                if (n.id === nodeId) {
                  return {
                    ...n,
                    data: {
                      ...n.data,
                      styleOverrides: {
                        ...n.data.styleOverrides,
                        ...styles,
                      },
                    },
                  };
                }
                return n;
              })
            );
          },
          onRenameNode: (nodeId, newLabel) => {
            console.log('[FlowDiagram] Renaming node from command:', nodeId, 'to', newLabel);
            setNodes((nds) =>
              nds.map((n) => {
                if (n.id === nodeId) {
                  return {
                    ...n,
                    data: {
                      ...n.data,
                      label: newLabel,
                    },
                  };
                }
                return n;
              })
            );
          },
          onApplyLayout: (layoutType, currentNodes) => {
            console.log('[FlowDiagram] Applying layout from command:', layoutType);

            let layoutedNodes;
            switch (layoutType) {
              case 'decision':
                layoutedNodes = layoutAlgorithms.applyDecisionLayout(nodes, edges);
                break;
              case 'tree':
                layoutedNodes = layoutAlgorithms.applyTreeLayout(nodes, edges);
                break;
              case 'grid':
                layoutedNodes = layoutAlgorithms.applyGridLayout(nodes, edges);
                break;
              case 'circle':
                layoutedNodes = layoutAlgorithms.applyCircleLayout(nodes, edges);
                break;
              default:
                console.error('[FlowDiagram] Unknown layout type:', layoutType);
                return;
            }

            if (layoutedNodes) {
              setNodes(layoutedNodes);
              console.log('[FlowDiagram] Layout applied successfully');
            }
          },
          onError: (message) => {
            console.error('[FlowDiagram] Command error:', message);
            if (onCommandError) {
              onCommandError(message);
            }
          },
        });

        if (success) {
          console.log('[FlowDiagram] Command executed successfully');
        }
      });

      // Update previous commands
      prevCommandsRef.current = commands;
    }
  }, [commands, nodes, edges, onCommandError]);

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
        panOnScroll={true}
        zoomOnPinch={true}
        panOnDrag={isSpacePressed}
        preventScrolling={true}
      >
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* Settings Panel */}
      {enableSettingsPanel && (
        <SettingsPanel
          defaultStyles={defaultStyles}
          onDefaultStyleChange={handleDefaultStyleChange}
          onExportPNG={onExportPNG}
          onExportJSON={handleExportJSON}
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
