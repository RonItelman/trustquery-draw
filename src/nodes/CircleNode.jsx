import React from 'react';
import BaseNode from './BaseNode.jsx';

const CircleNode = ({ data, selected, style = {}, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeType="circle"
      uniformScale={true} // Circles must maintain aspect ratio
      renderShape={({ nodeStyle, renderLabel, renderSelection, renderStyleInspector, renderNumericId, renderHandles }) => (
        <>
          {renderSelection()}
          {renderStyleInspector()}

          {/* Node Content - fill container with styles */}
          <div
            className="node-content trustquery-diagram-node-label"
            style={{...nodeStyle, whiteSpace: 'pre-wrap'}}
          >
            {renderNumericId()}
            {renderLabel()}
          </div>

          {renderHandles()}
        </>
      )}
    />
  );
};

export default CircleNode;
