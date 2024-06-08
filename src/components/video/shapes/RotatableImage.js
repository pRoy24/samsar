import React, { forwardRef, useRef, useEffect, useState } from "react";
import { Image, Transformer, Group } from 'react-konva';
import { useImage } from 'react-konva-utils';
import { getScalingFactor } from '../../utils/image.js';
import { STAGE_DIMENSIONS } from '../../constants/Image.js';

const IMAGE_BASE = `${process.env.REACT_APP_PROCESSOR_API}`;

export default function RotatableImage({ image, isSelected, onSelect, onUnselect, updateToolbarButtonPosition, ...props }) {
  const { isDraggable, showMask, id } = props;
  const imageSrc = image.src;
  const [img] = useImage(imageSrc, 'anonymous');
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (img && shapeRef.current) {
      const stageWidth = STAGE_DIMENSIONS.width;
      const stageHeight = STAGE_DIMENSIONS.height;
      const imageDimensions = {
        width: img.width,
        height: img.height,
      };
      const scalingFactor = getScalingFactor(imageDimensions);

      const x = (stageWidth - imageDimensions.width * scalingFactor) / 2;
      const y = (stageHeight - imageDimensions.height * scalingFactor) / 2;

      shapeRef.current.setAttrs({
        x: x,
        y: y,
        scaleX: scalingFactor,
        scaleY: scalingFactor,
        offsetX: imageDimensions.width / 2,
        offsetY: imageDimensions.height / 2,
      });

      if (trRef.current && isSelected) {
        trRef.current.nodes([shapeRef.current]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [img, isSelected]);

  useEffect(() => {
    if (trRef.current) {
      const layer = trRef.current.getLayer();

      if (isSelected && layer) {
        trRef.current.nodes([shapeRef.current]);
        trRef.current.getLayer().batchDraw();
      } else if (layer) {
        trRef.current.nodes([]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [isSelected]);

  return (
    <Group id={id}>
      <Image
        {...props}
        image={img}
        ref={shapeRef}
        onClick={(e) => {
          e.cancelBubble = true; // Prevent event from bubbling to the stage
          onSelect();
        }}
        onTap={(e) => {
          e.cancelBubble = true; // Same as above for touch devices
          onSelect();
        }}
        draggable={showMask || !isDraggable ? false : true}
        onDragMove={(e) => updateToolbarButtonPosition(id, e.target.x(), e.target.y())}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          anchorSize={15}
          anchorStyleFunc={(anchor) => {
            anchor.cornerRadius(20);
          }}
        />
      )}
    </Group>
  );
}
