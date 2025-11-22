import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { nodeDefaults } from './nodeDefaults.js';
import { useResize } from '../hooks/useResize.js';

/**
 * BaseNode - Common node component that all shape nodes extend
 * Handles editing, selection, resizing, and connection points
 */
const BaseNode = ({
  id,
  data,
  selected,
  nodeType = 'rectangle',
  uniformScale = true,
  calculateSize = null, // Optional function to calculate dynamic size based on label
  renderShape, // Function that renders the shape-specific part
}) => {
  const defaultStyle = nodeDefaults[nodeType];
  const styleOverrides = data.styleOverrides || {};
  const nodeStyle = { ...defaultStyle, ...styleOverrides };

  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(data.label);

  // Calculate size (allow shapes to override)
  const estimatedSize = calculateSize ? calculateSize(data.label, nodeStyle) : null;

  const { isResizing, handleResizeStart } = useResize({
    nodeId: id,
    initialWidth: estimatedSize?.width || parseFloat(nodeStyle.width) || parseFloat(nodeStyle.minWidth) || 60,
    initialHeight: estimatedSize?.height || parseFloat(nodeStyle.height) || parseFloat(nodeStyle.minHeight) || 60,
    initialFontSize: parseFloat(nodeStyle.fontSize) || 11,
    minSize: estimatedSize?.minSize || 40,
    onStyleChange: data.onStyleChange,
    uniformScale,
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedLabel(data.label);
    }
  };

  // Render label (used by all shapes)
  const renderLabel = (labelStyle = {}) => (
    <div
      className="trustquery-diagram-node-label"
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'relative',
        zIndex: 1,
        whiteSpace: 'pre-wrap',
        fontSize: nodeStyle.fontSize,
        ...labelStyle,
      }}
    >
      {isEditing ? (
        <textarea
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
            resize: 'none',
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
          }}
          className="nodrag"
        />
      ) : (
        data.label
      )}
    </div>
  );

  // Selection indicators (used by all shapes)
  const renderSelection = () => (
    selected && (
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
    )
  );

  // Style inspector button (used by all shapes)
  const renderStyleInspector = () => (
    selected && data.onOpenStyleInspector && (
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
    )
  );

  // Numeric ID display (top-left corner inside node)
  const renderNumericId = () => (
    data.numericId != null && (
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 6,
          fontSize: '9px',
          color: '#999',
          fontWeight: '500',
          pointerEvents: 'none',
          zIndex: 2,
          fontFamily: 'monospace',
          userSelect: 'none',
        }}
        title={`Node ID: ${data.numericId}`}
      >
        :{data.numericId}
      </div>
    )
  );

  // Connection handles (used by all shapes)
  const renderHandles = () => (
    <>
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
    </>
  );

  // Call the shape-specific renderer with all the common utilities
  return renderShape({
    nodeStyle,
    estimatedSize,
    renderLabel,
    renderSelection,
    renderStyleInspector,
    renderNumericId,
    renderHandles,
  });
};

export default BaseNode;
