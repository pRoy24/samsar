import React, { useEffect, useRef } from 'react';
import { Group, Rect, Text, Transformer, Path } from 'react-konva';

const ResizableDialogBubble = (props) => {
  const { config, isSelected, onSelect, onUnselect, id, updateToolbarButtonPosition, onChange } = props;
  const shapeRef = useRef(null);
  const transformerRef = useRef(null);

  useEffect(() => {
    if (transformerRef.current && shapeRef.current) {
      if (isSelected) {
        transformerRef.current.nodes([shapeRef.current]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.detach();
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [isSelected]);

  const { x, y, width, height, text, fill, stroke, strokeWidth, cornerRadius } = config;

  const tailSize = 20;
  const tailX = width / 2 - tailSize / 2;
  const tailY = height;

  return (
    <Group
    id={`group_${id}`}
      x={x}
      y={y}
      draggable
      onDragMove={(e) => updateToolbarButtonPosition(id, e.target.x(), e.target.y())}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      ref={shapeRef}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
          width,
          height,
          id,
        });
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          id,
        });
      }}
    >
      <Rect
        width={width}
        height={height}
        fill={fill || 'white'}
        stroke={stroke || 'black'}
        strokeWidth={strokeWidth || 2}
        cornerRadius={cornerRadius || 20}
      />
      <Path
        data={`M${tailX},${tailY} L${tailX + tailSize / 2},${tailY + tailSize} L${tailX + tailSize},${tailY} Z`}
        fill={fill || 'white'}
        stroke={stroke || 'black'}
        strokeWidth={strokeWidth || 2}
      />
      <Text
        x={10}
        y={10}
        width={width - 20}
        height={height - 20}
        text={text}
        fontSize={16}
        fill="black"
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Group>
  );
};

export default ResizableDialogBubble;
