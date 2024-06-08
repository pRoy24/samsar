import React, { forwardRef, useRef, useEffect, useState } from "react";
import { Stage, Layer, Star, Text, Image, Transformer, Circle, Group } from 'react-konva';
import { useImage } from 'react-konva-utils';
import { getScalingFactor } from '../../utils/image.js';
import { STAGE_DIMENSIONS } from '../../constants/Image.js';

const IMAGE_BASE = `${process.env.REACT_APP_PROCESSOR_API}`;

export default function ResizableImage({ image, isSelected, onSelect, onUnselect, updateToolbarButtonPosition, ...props }) {
  const { isDraggable } = props;

  const imageSrc = image.src;

  const [img, status] = useImage(imageSrc, 'anonymous');



  const shapeRef = useRef();
  const trRef = useRef();
  const { showMask, id } = props;

  const imageDimensions = {
    width: img?.width,
    height: img?.height,
  }
  const scalingFactor = getScalingFactor(imageDimensions);

  useEffect(() => {
    if (img && shapeRef.current) {
      const stageWidth = STAGE_DIMENSIONS.width;
      const stageHeight = STAGE_DIMENSIONS.height;
      const imageDimensions = {
        width: img.width,
        height: img.height,
      };
      const scalingFactor = getScalingFactor(imageDimensions);

      // Set the position of the image to center it on the canvas
      shapeRef.current.setAttrs({
        x: (stageWidth - imageDimensions.width * scalingFactor) / 2,
        y: (stageHeight - imageDimensions.height * scalingFactor) / 2,
        scaleX: scalingFactor,
        scaleY: scalingFactor,
      });

      if (trRef.current && isSelected) {
        trRef.current.nodes([shapeRef.current]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [img]);

  
  useEffect(() => {
    if (trRef.current) {
      const layer = trRef.current.getLayer();

      if (isSelected && layer) {
        trRef.current.nodes([shapeRef.current]);
        trRef.current.getLayer().batchDraw();
      } else if (layer) {
        // Ensure transformer is detached when not selected
        trRef.current.nodes([]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [isSelected]);

  

  return (
    <Group id={id} >
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
        scaleX={scalingFactor}
        scaleY={scalingFactor}
        draggable={showMask || !isDraggable ? false : true}
        onDragMove={(e) => updateToolbarButtonPosition(id, e.target.x(), e.target.y())}
      />
      {isSelected && <Transformer ref={trRef}
        anchorSize={15}
        anchorStyleFunc={(config) => {
          config.attrs.cornerRadius = 20;

          config.attrs.anchorCornerRadius = 20;
        }}

      />}
    </Group>
  );
}