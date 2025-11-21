import React, { useState, useEffect, useRef, useCallback } from 'react';
import { nodeDefaults } from './nodes/nodeDefaults.js';

const StyleInspector = ({ selectedNode, onStyleChange, onCopyStyle, onPasteStyleToChat, onClose }) => {
  const [style, setStyle] = useState({
    background: '#ffffff',
    borderColor: '#222222',
    borderWidth: '1',
    borderRadius: '3',
    padding: '10',
    color: '#000000',
  });
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);

  // Helper to normalize hex color to 6-digit format
  const normalizeHexColor = (color) => {
    if (!color) return '#ffffff';
    // If it's a 3-digit hex, expand to 6-digit
    if (color.match(/^#[0-9A-Fa-f]{3}$/)) {
      return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    return color;
  };

  useEffect(() => {
    if (selectedNode) {
      // Get default styles for this node type
      const defaults = nodeDefaults[selectedNode.type] || nodeDefaults.rectangle;
      const styleOverrides = selectedNode.data?.styleOverrides || {};

      // Merge defaults with styleOverrides (styleOverrides take precedence)
      const mergedStyle = { ...defaults, ...styleOverrides };

      const extractedStyle = {
        background: normalizeHexColor(mergedStyle.background) || '#ffffff',
        borderColor: normalizeHexColor(mergedStyle.border?.split(' ')[2]) || '#222222',
        borderWidth: mergedStyle.border?.split(' ')[0]?.replace('px', '') || '1',
        borderRadius: mergedStyle.borderRadius?.replace('px', '') || '3',
        padding: mergedStyle.padding?.replace('px', '') || '10',
        color: normalizeHexColor(mergedStyle.color) || '#000000',
      };

      setStyle(extractedStyle);
    }
  }, [selectedNode]);

  const handleChange = (property, value) => {
    const newStyle = { ...style, [property]: value };
    setStyle(newStyle);

    // Convert to ReactFlow style format
    const reactFlowStyle = {
      background: newStyle.background,
      border: `${newStyle.borderWidth}px solid ${newStyle.borderColor}`,
      borderRadius: `${newStyle.borderRadius}px`,
      padding: `${newStyle.padding}px`,
      color: newStyle.color,
    };

    if (onStyleChange) {
      onStyleChange(selectedNode.id, reactFlowStyle);
    }
  };

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const parent = panelRef.current.parentElement;
    const parentRect = parent.getBoundingClientRect();

    let newX = e.clientX - parentRect.left - dragOffset.current.x;
    let newY = e.clientY - parentRect.top - dragOffset.current.y;

    // Keep within bounds
    const panelRect = panelRef.current.getBoundingClientRect();
    newX = Math.max(0, Math.min(newX, parentRect.width - panelRect.width));
    newY = Math.max(0, Math.min(newY, parentRect.height - panelRect.height));

    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!selectedNode) return null;

  const positionStyle = position.x !== null
    ? { left: position.x, top: position.y, right: 'auto' }
    : { right: 10, top: 60 };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        ...positionStyle,
        width: '140px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* Draggable header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #e0e0e0',
          cursor: 'grab',
          background: '#f5f5f5',
          borderRadius: '8px 8px 0 0',
        }}
        onMouseDown={handleMouseDown}
      >
        <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Style Inspector</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            color: '#666',
            lineHeight: 1,
          }}
        >×</button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: '#666' }}>
            Node: {selectedNode.data.label}
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
            Background Color
          </label>
          <input
            type="color"
            value={style.background}
            onChange={(e) => handleChange('background', e.target.value)}
            style={{ width: '100%', height: '32px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
            Border Color
          </label>
          <input
            type="color"
            value={style.borderColor}
            onChange={(e) => handleChange('borderColor', e.target.value)}
            style={{ width: '100%', height: '32px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
            Border Width: {style.borderWidth}px
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={style.borderWidth}
            onChange={(e) => handleChange('borderWidth', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
            Border Radius: {style.borderRadius}px
          </label>
          <input
            type="range"
            min="0"
            max="30"
            value={style.borderRadius}
            onChange={(e) => handleChange('borderRadius', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
            Padding: {style.padding}px
          </label>
          <input
            type="range"
            min="0"
            max="30"
            value={style.padding}
            onChange={(e) => handleChange('padding', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default StyleInspector;
