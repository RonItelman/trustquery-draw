import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, selected }) => {
  return (
    <>
      {/* Selection Indicators */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: -6,
            left: -6,
            right: -6,
            bottom: -6,
            border: '2px solid #2196F3',
            borderRadius: '6px',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          {/* Corner Handles */}
          <div style={{
            position: 'absolute',
            top: -4,
            left: -4,
            width: 8,
            height: 8,
            background: '#2196F3',
            border: '1px solid white',
            borderRadius: '2px',
          }} />
          <div style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 8,
            height: 8,
            background: '#2196F3',
            border: '1px solid white',
            borderRadius: '2px',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -4,
            left: -4,
            width: 8,
            height: 8,
            background: '#2196F3',
            border: '1px solid white',
            borderRadius: '2px',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 8,
            height: 8,
            background: '#2196F3',
            border: '1px solid white',
            borderRadius: '2px',
          }} />
        </div>
      )}

      {/* Style Inspector Button */}
      {selected && data.onOpenStyleInspector && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            data.onOpenStyleInspector();
          }}
          style={{
            position: 'absolute',
            top: -12,
            left: -12,
            width: 24,
            height: 24,
            background: '#2196F3',
            border: '2px solid white',
            borderRadius: '50%',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
          title="Open Style Inspector"
        >
          ⚙
        </div>
      )}

      {/* Node Content - render directly without inner div */}
      {data.label}

      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default CustomNode;
