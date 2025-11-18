import React from 'react';
import { Handle, Position } from 'reactflow';
import { nodeDefaults } from './nodeDefaults.js';

const DiamondNode = ({ data, selected, style = {} }) => {
  // Get default styles for this node type
  const defaultStyle = nodeDefaults.diamond;

  // Merge default with styleOverrides from data (not the style prop which is applied to wrapper)
  const styleOverrides = data.styleOverrides || {};
  const nodeStyle = { ...defaultStyle, ...styleOverrides };

  // Extract background and border for SVG
  const backgroundColor = nodeStyle.background;
  const borderColor = nodeStyle.border?.split(' ')[2] || '#1a192b';
  const borderWidth = nodeStyle.border?.split(' ')[0] || '2px';

  // Container needs explicit dimensions for SVG to render
  const containerStyle = {
    width: style.width || '100px',
    height: style.height || '100px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className="node-content" style={containerStyle}>
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
          <div style={{ position: 'absolute', top: -4, left: -4, width: 8, height: 8, background: '#2196F3', border: '1px solid white', borderRadius: '2px' }} />
          <div style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: '#2196F3', border: '1px solid white', borderRadius: '2px' }} />
          <div style={{ position: 'absolute', bottom: -4, left: -4, width: 8, height: 8, background: '#2196F3', border: '1px solid white', borderRadius: '2px' }} />
          <div style={{ position: 'absolute', bottom: -4, right: -4, width: 8, height: 8, background: '#2196F3', border: '1px solid white', borderRadius: '2px' }} />
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

      {/* Diamond Shape using SVG */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <polygon
          points="50,0 100,50 50,100 0,50"
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Node Content */}
      {data.label}

      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default DiamondNode;
