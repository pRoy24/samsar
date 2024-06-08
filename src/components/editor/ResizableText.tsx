import React, { useRef, useEffect } from 'react';
import { Text, Transformer, Group } from 'react-konva';

import { INIT_DIMENSIONS } from './utils/ShapeUtils';

const ResizableText = ({ text, isSelected, onSelect, updateToolbarButtonPosition, ...props }) => {
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


  let textFontStyle = 'normal';
  if (config.bold) {
    textFontStyle = 'bold';
  }
  if (config.italic) {
    textFontStyle = 'italic';
  }
  if (config.bold && config.italic) {
    textFontStyle = 'bold italic';
  }
  return (
    <Group id={`group_${id}`}>
      <Text
        {...props}
        x={INIT_DIMENSIONS.x}
        y={INIT_DIMENSIONS.y}
        fontFamily={config.fontFamily}
        fontSize={config.fontSize}
        fill={config.fillColor}
        textDecoration={config.underline ? 'underline' : ''}
        fontStyle={textFontStyle}
        align={config.align ? config.align : 'left'}
        text={text}
        ref={textRef}
        onClick={onSelect}
        onTap={onSelect}
        draggable
        onDragMove={(e) => updateToolbarButtonPosition(id, e.target.x(), e.target.y())}
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