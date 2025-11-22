import React from 'react';
import BaseNode from './BaseNode.jsx';

const RectangleNode = ({ data, selected, style = {}, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeType="rectangle"
      uniformScale={false} // Rectangles resize non-uniformly
      calculateSize={(label, nodeStyle) => ({
        width: parseFloat(nodeStyle.minWidth) || 100,
        height: parseFloat(nodeStyle.minHeight) || 60,
        minSize: 60,
      })}
      renderShape={({ nodeStyle, renderLabel, renderSelection, renderStyleInspector, renderHandles }) => (
        <>
          {renderSelection()}
          {renderStyleInspector()}

          {/* Node Content - fill container with styles */}
          <div
            className="node-content trustquery-diagram-node-label"
            style={{...nodeStyle, whiteSpace: 'pre-wrap'}}
          >
            {renderLabel()}
          </div>

          {renderHandles()}
        </>
      )}
    />
  );
};

export default RectangleNode;
