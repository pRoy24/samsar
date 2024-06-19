import React, { useRef, useEffect, useState } from 'react';
import { Text, Transformer, Group } from 'react-konva';

import { INIT_DIMENSIONS } from './utils/ShapeUtils';

const ResizableText = ({ text, isSelected, onSelect, updateToolbarButtonPosition, updateTargetActiveLayerConfig, ...props }) => {

  const [shapeState, setShapeState] = useState({
    x: props.config.x || INIT_DIMENSIONS.x,
    y: props.config.y || INIT_DIMENSIONS.y,
    width: props.config.width || 100,
    height: props.config.height || 50,
    fontFamily: props.config.fontFamily || 'Arial',
    fontSize: props.config.fontSize || 16,
    fillColor: props.config.fillColor || 'black',
    textDecoration: props.config.underline ? 'underline' : '',
    fontStyle: 'normal',
    align: props.config.align || 'left',
  });

  const [isConfigSet, setIsConfigSet] = useState(false);

  useEffect(() => {
    if (!isConfigSet) {
      setIsConfigSet(true);
      setShapeState((prevState) => ({
        ...prevState,
        x: props.config.x || INIT_DIMENSIONS.x,
        y: props.config.y || INIT_DIMENSIONS.y,
        fontFamily: props.config.fontFamily || 'Arial',
        fontSize: props.config.fontSize || 16,
        fillColor: props.config.fillColor || 'black',
        textDecoration: props.config.underline ? 'underline' : '',
        align: props.config.align || 'left',
      }));
    }
  }, [props.config, isConfigSet]);
  
  const textRef = useRef();
  const trRef = useRef();
  const { config, id } = props;

  useEffect(() => {
    if (trRef.current) {
      if (isSelected && textRef.current) {
        trRef.current.nodes([textRef.current]);
        trRef.current.getLayer().batchDraw();
      } else {
        // Ensure transformer is detached when not selected
        trRef.current.nodes([]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [isSelected]);

  useEffect(() => {
    let fontStyle = 'normal';
    if (config.bold) {
      fontStyle = 'bold';
    }
    if (config.italic) {
      fontStyle = 'italic';
    }
    if (config.bold && config.italic) {
      fontStyle = 'bold italic';
    }

    setShapeState((prevState) => ({
      ...prevState,
      fontStyle: fontStyle,
    }));
  }, [config.bold, config.italic]);

  const handleDragMove = (e) => {
    const node = e.target;
    const newX = node.x();
    const newY = node.y();

    updateToolbarButtonPosition(id, newX, newY);
    updateTargetActiveLayerConfig(id, {
      x: newX,
      y: newY,
    });
  };

  const handleTransformEnd = () => {
    const node = textRef.current;
    const newScale = node.scaleX();

    const newX = node.x() + (node.width() * newScale) / 2;
    const newY = node.y() + (node.height() * newScale) / 2;

    updateTargetActiveLayerConfig(id, {
      x: newX,
      y: newY,
      width: node.width() * newScale,
      height: node.height() * newScale,
      scaleX: newScale,
      scaleY: newScale,
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <Group id={`group_${id}`}>
      <Text
        {...props}
        x={shapeState.x}
        y={shapeState.y}
        offsetX={0}
        offsetY={0}
        fontFamily={shapeState.fontFamily}
        fontSize={shapeState.fontSize}
        fill={shapeState.fillColor}
        textDecoration={shapeState.textDecoration}
        fontStyle={shapeState.fontStyle}
        align={shapeState.align}
        text={text}
        ref={textRef}
        onClick={onSelect}
        onTap={onSelect}
        draggable
        onDragMove={handleDragMove}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit the size of the text box if necessary
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Group>
  );
};

export default ResizableText;
