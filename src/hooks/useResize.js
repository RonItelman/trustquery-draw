import { useState, useCallback } from 'react';

/**
 * Custom hook for handling node resize with uniform scaling
 * @param {Object} options
 * @param {string} options.nodeId - The node ID
 * @param {number} options.initialWidth - Starting width
 * @param {number} options.initialHeight - Starting height (optional, defaults to width for square aspect)
 * @param {number} options.initialFontSize - Starting font size
 * @param {number} options.minSize - Minimum size (default: 40)
 * @param {number} options.minFontSize - Minimum font size (default: 8)
 * @param {number} options.maxFontSize - Maximum font size (default: 24)
 * @param {Function} options.onStyleChange - Callback to update styles
 * @param {boolean} options.uniformScale - Whether to scale uniformly (default: true)
 * @returns {Object} { isResizing, handleResizeStart }
 */
export function useResize({
  nodeId,
  initialWidth,
  initialHeight,
  initialFontSize = 12,
  minSize = 40,
  minFontSize = 8,
  maxFontSize = 24,
  onStyleChange,
  uniformScale = true,
}) {
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = initialWidth;
    const startHeight = initialHeight || initialWidth;
    const startFontSize = initialFontSize;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth, newHeight, scale;

      if (uniformScale) {
        // Use larger delta for uniform scaling
        const delta = Math.max(deltaX, deltaY);
        newWidth = Math.max(minSize, startWidth + delta);
        newHeight = Math.max(minSize, startHeight + delta);
        scale = newWidth / startWidth;
      } else {
        // Independent width/height scaling
        newWidth = Math.max(minSize, startWidth + deltaX);
        newHeight = Math.max(minSize, startHeight + deltaY);
        scale = Math.max(newWidth / startWidth, newHeight / startHeight);
      }

      const newFontSize = Math.max(minFontSize, Math.min(maxFontSize, startFontSize * scale));

      if (onStyleChange) {
        onStyleChange(nodeId, {
          minWidth: `${newWidth}px`,
          minHeight: `${newHeight}px`,
          width: `${newWidth}px`,
          height: `${newHeight}px`,
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
  }, [nodeId, initialWidth, initialHeight, initialFontSize, minSize, minFontSize, maxFontSize, onStyleChange, uniformScale]);

  return { isResizing, handleResizeStart };
}

export default useResize;
