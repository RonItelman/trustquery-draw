import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { nodeDefaults } from './nodeDefaults.js';

const DiamondNode = ({ data, selected, style = {}, id }) => {
  // Get default styles for this node type
  const defaultStyle = nodeDefaults.diamond;

  // Merge default with styleOverrides from data (not the style prop which is applied to wrapper)
  const styleOverrides = data.styleOverrides || {};
  const nodeStyle = { ...defaultStyle, ...styleOverrides };

  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(data.label);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditedLabel(data.label);
  };

  const handleLabelChange = (e) => {
    setEditedLabel(e.target.value);
  };

  const handleLabelSubmit = () => {
    if (editedLabel.trim() && data.onLabelChange) {
      data.onLabelChange(id, editedLabel.trim());
    }
    setIsEditing(false);
  };

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedLabel(data.label);
    }
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseFloat(nodeStyle.minWidth) || 70;
    const startHeight = parseFloat(nodeStyle.minHeight) || 70;
    const startFontSize = parseFloat(nodeStyle.fontSize) || 11;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const delta = Math.max(deltaX, deltaY); // Use larger delta for uniform scaling

      const newSize = Math.max(40, startWidth + delta);
      const scale = newSize / startWidth;
      const newFontSize = Math.max(8, Math.min(24, startFontSize * scale));

      if (data.onStyleChange) {
        data.onStyleChange(id, {
          minWidth: `${newSize}px`,
          minHeight: `${newSize}px`,
          width: `${newSize}px`,
          height: `${newSize}px`,
          fontSize: `${newFontSize}px`,
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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
          {/* Bottom-right resize handle */}
          <div
            className="nodrag"
            onMouseDown={handleResizeStart}
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 10,
              height: 10,
              background: '#FF9800',
              border: '1px solid white',
              borderRadius: '2px',
              cursor: 'nwse-resize',
              pointerEvents: 'auto',
              zIndex: 20,
            }}
            title="Resize"
          />
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
      <div
        onDoubleClick={handleDoubleClick}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {isEditing ? (
          <input
            type="text"
            value={editedLabel}
            onChange={handleLabelChange}
            onBlur={handleLabelSubmit}
            onKeyDown={handleLabelKeyDown}
            autoFocus
            style={{
              background: 'transparent',
              border: 'none',
              outline: '2px solid #2196F3',
              textAlign: 'center',
              fontSize: nodeStyle.fontSize,
              width: '100%',
              padding: '2px',
            }}
            className="nodrag"
          />
        ) : (
          data.label
        )}
      </div>

      {/* Connection Handles - Input LEFT, Output RIGHT */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default DiamondNode;
