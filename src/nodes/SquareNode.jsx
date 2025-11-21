import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { nodeDefaults } from './nodeDefaults.js';
import { useResize } from '../hooks/useResize.js';

const SquareNode = ({ data, selected, style = {}, id }) => {
  const defaultStyle = nodeDefaults.square;
  const styleOverrides = data.styleOverrides || {};
  const nodeStyle = { ...defaultStyle, ...styleOverrides };

  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(data.label);

  const { isResizing, handleResizeStart } = useResize({
    nodeId: id,
    initialWidth: parseFloat(nodeStyle.minWidth) || 60,
    initialHeight: parseFloat(nodeStyle.minHeight) || 60,
    initialFontSize: parseFloat(nodeStyle.fontSize) || 12,
    minSize: 40,
    onStyleChange: data.onStyleChange,
  });

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

      {/* Node Content */}
      <div
        className="node-content"
        style={nodeStyle}
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

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default SquareNode;
