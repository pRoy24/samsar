import React, { useEffect, useRef } from 'react';
import { Circle, Group , Transformer } from 'react-konva';

import { INIT_DIMENSIONS } from '../utils/ShapeUtils';

export default function ResizableCircle(props: any) {
  const { config, isSelected, onSelect, onUnselect, id , updateToolbarButtonPosition} = props;
  const circleRef = useRef(null);
  const transformerCircleRef = useRef(null);


  useEffect(() => {
    // Check if the transformer and circle references are correctly set
    if (transformerCircleRef.current && circleRef.current) {
      // Set the transformer's node to the circle component
      transformerCircleRef.current.nodes([circleRef.current]);
      transformerCircleRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);


  const { x, y, width, height, radius,  fillColor, strokeColor,  strokeWidth } = config;
  return (
    <Group id={`group_${id}`}>
      <Circle
        x={INIT_DIMENSIONS.x}
        y={INIT_DIMENSIONS.y}
        radius={50}
        radius={radius || 70}
        fill={fillColor || 'red'}
        stroke={strokeColor || 'black'}
        strokeWidth={strokeWidth || 4}
        draggable
        onDragMove={(e) => updateToolbarButtonPosition(id, e.target.x(), e.target.y())}
        ref={circleRef}
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
        ref={transformerCircleRef}
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