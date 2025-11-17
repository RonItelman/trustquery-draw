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

const FlowDiagram = ({ initialNodes = [], initialEdges = [], onNodesChange: onNodesChangeProp, onEdgesChange: onEdgesChangeProp }) => {
  console.log('[FlowDiagram] Received initialNodes:', JSON.stringify(initialNodes, null, 2));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false);

  console.log('[FlowDiagram] Current nodes state:', JSON.stringify(nodes, null, 2));

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

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        zoomOnScroll={isModifierKeyPressed}
        panOnScroll={false}
        zoomOnPinch={true}
        panOnDrag={true}
        preventScrolling={isModifierKeyPressed}
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default FlowDiagram;
