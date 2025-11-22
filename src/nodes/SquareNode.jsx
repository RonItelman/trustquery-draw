import React from 'react';
import BaseNode from './BaseNode.jsx';

const SquareNode = ({ data, selected, style = {}, id }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeType="square"
      uniformScale={true} // Squares must maintain aspect ratio
      renderShape={({ nodeStyle, renderLabel, renderSelection, renderStyleInspector, renderHandles }) => (
        <>
          {renderSelection()}
          {renderStyleInspector()}

          {/* Node Content */}
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

export default SquareNode;
