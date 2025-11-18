import React, { useState, useEffect } from 'react';
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

      console.log('[StyleInspector] Node type:', selectedNode.type);
      console.log('[StyleInspector] Default style:', defaults);
      console.log('[StyleInspector] Style overrides:', styleOverrides);
      console.log('[StyleInspector] Merged style:', mergedStyle);

      const extractedStyle = {
        background: normalizeHexColor(mergedStyle.background) || '#ffffff',
        borderColor: normalizeHexColor(mergedStyle.border?.split(' ')[2]) || '#222222',
        borderWidth: mergedStyle.border?.split(' ')[0]?.replace('px', '') || '1',
        borderRadius: mergedStyle.borderRadius?.replace('px', '') || '3',
        padding: mergedStyle.padding?.replace('px', '') || '10',
        color: normalizeHexColor(mergedStyle.color) || '#000000',
      };

      console.log('[StyleInspector] Extracted style:', extractedStyle);
      setStyle(extractedStyle);
    }
  }, [selectedNode]);

  const handleChange = (property, value) => {
    console.log('[StyleInspector] Style change requested:', property, value);
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

    console.log('[StyleInspector] Converted to ReactFlow format:', reactFlowStyle);
    console.log('[StyleInspector] Calling onStyleChange for node:', selectedNode.id);

    if (onStyleChange) {
      onStyleChange(selectedNode.id, reactFlowStyle);
    }
  };

  if (!selectedNode) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      width: '140px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '16px',
      zIndex: 1000,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Style Inspector</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            color: '#666',
          }}
        >×</button>
      </div>

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

      <div style={{ marginBottom: '16px' }}>
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
  );
};

export default StyleInspector;
