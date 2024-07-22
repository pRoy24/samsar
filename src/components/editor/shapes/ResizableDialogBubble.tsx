import React, { useRef, useEffect, useState } from 'react';
import { Ellipse, Transformer, Group, Shape } from 'react-konva';

const ResizableDialogBubble = ({
  shapeProps = {},
  isSelected,
  onSelect,
  onChange,
  updateTargetActiveLayerConfig,
  id,
  config,
}) => {
  const shapeRef = useRef();
  const transformerRef = useRef();
  const pointerRef = useRef();
  const pointerTransformerRef = useRef();

  const [shapeState, setShapeState] = useState({});
  const [isConfigSet, setIsConfigSet] = useState(false);

  useEffect(() => {
    if (!isConfigSet) {
      setIsConfigSet(true);

      const newState = {
        x: config.x || 0,
        y: config.y || 0,
        width: config.width || 100,
        height: config.height || 50,
        pointerX: config.pointerX || (config.x + (config.width / 2)) || 0,
        pointerY: config.pointerY || (config.y + config.height) || 0,
      };
      setShapeState(newState);
    }
  }, [config]);

  useEffect(() => {
    if (isSelected) {
      transformerRef.current.nodes([shapeRef.current]);
      pointerTransformerRef.current.nodes([pointerRef.current]);
      transformerRef.current.getLayer().batchDraw();
      pointerTransformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const updatePointerPosition = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newPointerX = node.x();
    const newPointerY = node.y() + (node.height() * scaleY / 2);

    setShapeState(prevState => ({
      ...prevState,
      pointerX: newPointerX,
      pointerY: newPointerY,
    }));
  };

  const handleTransformEnd = () => {
    updatePointerPosition();

    const node = shapeRef.current;
    const boundingBox = node.getClientRect();

    const newAttrs = {
      x: boundingBox.x + boundingBox.width / 2,
      y: boundingBox.y + boundingBox.height / 2,
      width: boundingBox.width,
      height: boundingBox.height,
      scaleX: 1,
      scaleY: 1,
      xRadius: boundingBox.width / 2,
      yRadius: boundingBox.height / 2,
      pointerX: boundingBox.x + boundingBox.width / 2,
      pointerY: boundingBox.y + boundingBox.height,
    };

    onChange(newAttrs);
    updateTargetActiveLayerConfig(id, newAttrs);
  };

  const handleDragEnd = () => {
    updatePointerPosition();

    const node = shapeRef.current;
    const boundingBox = node.getClientRect();
    const newAttrs = {
      x: boundingBox.x + boundingBox.width / 2,
      y: boundingBox.y + boundingBox.height / 2,
      pointerX: boundingBox.x + boundingBox.width / 2,
      pointerY: boundingBox.y + boundingBox.height
    };
    updateTargetActiveLayerConfig(id, newAttrs);
  };

  const { x, y, width, height, pointerX, pointerY } = shapeState;
  const pointerWidth = 20;
  const pointerHeight = 20;

  return (
    <Group
      onMouseDown={onSelect}
      onTransformEnd={handleTransformEnd}
      draggable
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      <Ellipse
        id={id}
        x={x}
        y={y}
        width={width}
        height={height}
        fill="white"
        stroke="black"
        strokeWidth={2}
        ref={shapeRef}
        onTransformEnd={handleTransformEnd}
      />
      <Shape
        ref={pointerRef}
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(pointerX - pointerWidth / 2, pointerY);
          context.quadraticCurveTo(pointerX, pointerY + pointerHeight, pointerX + pointerWidth / 2, pointerY);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill="white"
        stroke="black"
        strokeWidth={2}
        draggable
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
      {isSelected && (
        <Transformer
          ref={pointerTransformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) {
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
