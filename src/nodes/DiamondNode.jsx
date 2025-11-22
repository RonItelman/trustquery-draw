import React from 'react';
import BaseNode from './BaseNode.jsx';

const DiamondNode = ({ data, selected, style = {}, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeType="diamond"
      uniformScale={true} // Diamonds must maintain aspect ratio
      calculateSize={(label, nodeStyle) => {
        // Calculate dynamic size based on label length
        // Diamond needs more space due to diagonal orientation
        const textLength = (label || '').length;
        const estimatedWidth = Math.max(100, textLength * 9 + 40);
        return {
          width: parseFloat(nodeStyle.width) || parseFloat(nodeStyle.minWidth) || estimatedWidth,
          height: parseFloat(nodeStyle.height) || parseFloat(nodeStyle.minHeight) || estimatedWidth,
          minSize: 60,
        };
      }}
      renderShape={({ nodeStyle, estimatedSize, renderLabel, renderSelection, renderStyleInspector, renderNodeNumber, renderHandles }) => {
        // Extract background and border for SVG
        const backgroundColor = nodeStyle.background;
        const borderColor = nodeStyle.border?.split(' ')[2] || '#1a192b';
        const borderWidth = nodeStyle.border?.split(' ')[0] || '1px';

        // Container needs explicit dimensions for SVG to render
        const containerStyle = {
          width: nodeStyle.width || nodeStyle.minWidth || `${estimatedSize?.width || 100}px`,
          height: nodeStyle.height || nodeStyle.minHeight || `${estimatedSize?.height || 100}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };

        return (
          <div className="node-content" style={containerStyle}>
            {renderSelection()}
            {renderStyleInspector()}

            {/* Diamond Shape using SVG */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
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

            {/* Node Number */}
            {renderNodeNumber()}

            {/* Node Content */}
            {renderLabel()}

            {renderHandles()}
          </div>
        );
      }}
    />
  );
};

export default DiamondNode;
