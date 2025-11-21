import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { nodeDefaults } from './nodeDefaults.js';

const PentagonNode = ({ data, selected, style = {}, id }) => {
  const defaultStyle = nodeDefaults.pentagon;
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

  // Calculate size based on text length or custom width from styleOverrides
  const textLength = (data.label || '').length;
  const estimatedWidth = Math.max(70, textLength * 8 + 20);
  const customWidth = styleOverrides.customWidth ? parseFloat(styleOverrides.customWidth) : null;
  const size = customWidth || estimatedWidth;

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size;
    const startFontSize = parseFloat(nodeStyle.fontSize) || 11;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(70, startWidth + deltaX);
      const scale = newWidth / startWidth;
      const newFontSize = Math.max(8, Math.min(24, startFontSize * scale));

      if (data.onStyleChange) {
        data.onStyleChange(id, {
          customWidth: `${newWidth}px`,
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

  const background = nodeStyle.background || '#e0f2f1';
  const borderColor = nodeStyle.border?.split(' ')[2] || '#1a192b';

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

      {/* Pentagon SVG Shape */}
      <div style={{ position: 'relative', width: `${size}px`, height: '70px' }}>
        <svg width={size} height="70" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
          <polygon
            points="50,10 90,40 75,85 25,85 10,40"
            fill={background}
            stroke={borderColor}
            strokeWidth="2"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            maxWidth: `${size - 20}px`,
            fontSize: '11px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          onDoubleClick={handleDoubleClick}
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
                fontSize: '11px',
                width: '100%',
                padding: '2px',
              }}
              className="nodrag"
            />
          ) : (
            data.label
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default PentagonNode;
