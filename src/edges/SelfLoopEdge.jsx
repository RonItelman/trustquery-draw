import React from 'react';

const SelfLoopEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
}) => {
  // Elbow-style self-loop path
  // Goes: right -> up -> left (across top) -> down -> left to target
  const offset = 20; // How far to extend horizontally
  const topOffset = 40; // How far above the node

  const topY = sourceY - topOffset;

  // Elbow path with right angles
  const path = `
    M ${sourceX} ${sourceY}
    L ${sourceX + offset} ${sourceY}
    L ${sourceX + offset} ${topY}
    L ${targetX - offset} ${topY}
    L ${targetX - offset} ${targetY}
    L ${targetX} ${targetY}
  `;

  const labelX = (sourceX + targetX) / 2;
  const labelY = topY - 10;

  return (
    <>
      <path
        id={id}
        style={{
          strokeWidth: 1,
          stroke: '#b1b1b7',
          fill: 'none',
          ...style,
        }}
        className="react-flow__edge-path"
        d={path}
        markerEnd={markerEnd}
      />
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-20}
            y={-10}
            width={40}
            height={20}
            style={{ fill: '#fff', ...labelBgStyle }}
          />
          <text
            style={{
              fill: '#000',
              fontWeight: 500,
              fontSize: 12,
              ...labelStyle,
            }}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {label}
          </text>
        </g>
      )}
    </>
  );
};

export default SelfLoopEdge;
