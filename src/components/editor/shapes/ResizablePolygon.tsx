import React, { useState, useEffect } from "react";
import { RegularPolygon, Group, Transformer } from 'react-konva';
import { INIT_DIMENSIONS } from '../utils/ShapeUtils';

export default function ResizablePolygon(props) {

  const transformerRef = React.useRef();

  const polygonRef = React.useRef();

  const { config: { x, y, sides, radius, fill, stroke, strokeWidth }, isSelected, onSelect, onUnselect, id,
  updateToolbarButtonPosition } = props;


  useEffect(() => {
    // Check if the transformer and circle references are correctly set
    if (transformerRef.current && polygonRef.current) {
      // Set the transformer's node to the circle component
      transformerRef.current.nodes([polygonRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <Group id={`group_${id}`}>
      <RegularPolygon
        x={x || INIT_DIMENSIONS.x}
        y={y || INIT_DIMENSIONS.y}
        sides={sides || 6}
        radius={radius || 70}
        fill={fill || 'red'}
        stroke={stroke || 'black'}
        strokeWidth={strokeWidth || 4}
        draggable
        onDragMove={(e) => updateToolbarButtonPosition(id, e.target.x(), e.target.y())}
        ref={polygonRef}
        onClick={(e) => {
          e.cancelBubble = true; // Prevent event from bubbling to the stage
          onSelect();
        }}
        onTap={(e) => {
          e.cancelBubble = true; // Same as above for touch devices
          onSelect();
        }}

      />

      {isSelected && <Transformer
        ref={transformerRef}
        boundBoxFunc={(oldBox, newBox) => {
          // Limit the size of the circle (optional)
          if (newBox.width < 5 || newBox.height < 5) {
            return oldBox;
          }
          return newBox;
        }}
      />}
    </Group>
  )
}

