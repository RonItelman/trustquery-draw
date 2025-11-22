import React, { useState, useRef, useCallback } from 'react';

const SettingsPanel = ({
  onDefaultStyleChange,
  onExportPNG,
  onExportJSON,
  onImportJSON,
  onClearCanvas,
  onSetInput,
  defaultStyles = {
    fillColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2,
  }
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [styles, setStyles] = useState(defaultStyles);
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleStyleChange = (key, value) => {
    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);
    if (onDefaultStyleChange) {
      onDefaultStyleChange(newStyles);
    }
  };

  const handleImportJSON = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        if (onImportJSON) {
          onImportJSON(jsonData);
        }
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        alert('Failed to parse JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    e.target.value = '';
  }, [onImportJSON]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
      didDrag: false,
    };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    // Check if moved more than 5px (to distinguish drag from click)
    const dx = Math.abs(e.clientX - dragOffset.current.startX);
    const dy = Math.abs(e.clientY - dragOffset.current.startY);
    if (dx > 5 || dy > 5) {
      dragOffset.current.didDrag = true;
    }

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
    // If collapsed and didn't drag, open the panel
    if (!isExpanded && !dragOffset.current.didDrag) {
      setIsExpanded(true);
    }
    setIsDragging(false);
  }, [isExpanded]);

  // Add global mouse listeners when dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const positionStyle = position.x !== null
    ? { left: position.x, top: position.y, right: 'auto' }
    : { right: 12, top: 12 };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        ...positionStyle,
        zIndex: 1000,
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        transition: isDragging ? 'none' : 'width 0.2s ease',
        width: isExpanded ? '280px' : '44px',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* Header - always draggable */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          padding: '10px 12px',
          borderBottom: isExpanded ? '1px solid #e0e0e0' : 'none',
          cursor: 'grab',
          background: '#f5f5f5',
        }}
        onMouseDown={handleMouseDown}
      >
        {isExpanded ? (
          <>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#333',
            }}>
              Settings
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer',
                padding: 0,
                color: '#666',
                lineHeight: 1,
              }}
            >×</button>
          </>
        ) : (
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#666' }}>settings</span>
        )}
      </div>

      {/* Settings content */}
      {isExpanded && (
        <div style={{ padding: '16px 12px' }}>
          {/* Fill Color */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#666',
              display: 'block',
              marginBottom: 6,
            }}>
              Fill Color
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={styles.fillColor}
                onChange={(e) => handleStyleChange('fillColor', e.target.value)}
                style={{
                  width: 40,
                  height: 32,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              />
              <input
                type="text"
                value={styles.fillColor}
                onChange={(e) => handleStyleChange('fillColor', e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          {/* Border Color */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#666',
              display: 'block',
              marginBottom: 6,
            }}>
              Border Color
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={styles.borderColor}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                style={{
                  width: 40,
                  height: 32,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              />
              <input
                type="text"
                value={styles.borderColor}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          {/* Border Width */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#666',
              display: 'block',
              marginBottom: 6,
            }}>
              Border Width
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="range"
                min="1"
                max="10"
                value={styles.borderWidth}
                onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                min="1"
                max="10"
                value={styles.borderWidth}
                onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value))}
                style={{
                  width: 50,
                  padding: '6px 8px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  textAlign: 'center',
                }}
              />
            </div>
          </div>

          {/* Action Buttons Container */}
          <div style={{ marginBottom: 16 }}>
            {/* Export PNG Button */}
            <button
              id="trustquery-settings-export-png-button"
              onClick={(e) => {
                e.stopPropagation();
                if (onExportPNG) onExportPNG();
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              Export to PNG
            </button>

            {/* Export JSON Button */}
            <button
              id="trustquery-settings-export-json-button"
              onClick={(e) => {
                e.stopPropagation();
                if (onExportJSON) {
                  onExportJSON();
                  setShowCopied(true);
                  setTimeout(() => setShowCopied(false), 2000);
                }
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                position: 'relative',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>code</span>
              {showCopied ? 'Copied to clipboard!' : 'Export to JSON'}
            </button>

            {/* Import JSON Button */}
            <button
              id="trustquery-settings-import-json-button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
              Import from JSON
            </button>

            {/* Hidden file input for JSON import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportJSON}
              style={{ display: 'none' }}
            />

            {/* Clear Canvas Button */}
            <button
              id="trustquery-settings-clear-canvas-button"
              onClick={(e) => {
                e.stopPropagation();
                if (onClearCanvas) onClearCanvas();
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
              Clear Canvas
            </button>
          </div>

          {/* Help Examples */}
          <div style={{
            marginTop: 16,
            padding: 12,
            background: '#f9f9f9',
            borderRadius: 6,
            border: '1px solid #eee',
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#666',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>Examples</div>
            {[
              'square->circle',
              'hello-label->world',
              'rectangle->square->circle',
            ].map((example, i) => (
              <div
                key={i}
                onClick={() => onSetInput && onSetInput(example)}
                style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: '#1976d2',
                  cursor: 'pointer',
                  padding: '4px 0',
                  lineHeight: 1.4,
                }}
              >
                {example}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
