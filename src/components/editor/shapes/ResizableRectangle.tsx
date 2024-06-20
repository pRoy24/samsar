import React, { useRef, useEffect } from 'react';
import { Rect, Text, Circle, Line, Group, Transformer } from 'react-konva';
import { INIT_DIMENSIONS } from '../utils/ShapeUtils';

export default function ResizableRectangle(props) {
  const { shape, config, isSelected, onSelect, onUnselect, id, updateToolbarButtonPosition } = props;
  const rectangleTransformerRef = useRef();
  const rectangleRef = useRef();



  useEffect(() => {
    // Check if the transformer and circle references are correctly set
    if (rectangleTransformerRef.current && rectangleRef.current) {
      // Set the transformer's node to the circle component
      rectangleTransformerRef.current.nodes([rectangleRef.current]);
      rectangleTransformerRef.current.getLayer().batchDraw();


    }
  }, [isSelected]);

  const { x, y, width, height, fillColor, strokeColor, strokeWidth } = config;

  return (
    <Group id={`group_${id}`}>
      <Rect
        x={x !== undefined ? x : INIT_DIMENSIONS.x}
        y={y !== undefined ? y : INIT_DIMENSIONS.y}
        width={width || 100}
        height={height || 100}
        onClick={(e) => {
          e.cancelBubble = true; // Prevent event from bubbling to the stage
          onSelect();
        }}
        onTap={(e) => {
          e.cancelBubble = true; // Same as above for touch devices
          onSelect();
        }}
        fill={fillColor || 'red'}
        stroke={strokeColor || 'black'}
        strokeWidth={strokeWidth || 4}
        ref={rectangleRef}
        draggable={!config.fixed}
        onDragMove={(e) => updateToolbarButtonPosition(id, e.target.x(), e.target.y())}
      />
      {isSelected && <Transformer
        ref={rectangleTransformerRef}
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

