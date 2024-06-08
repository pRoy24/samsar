import React, { forwardRef, useRef, useEffect } from "react";
import { Stage, Layer, Star, Text, Image, Transformer, Circle, Group } from 'react-konva';
import { useImage } from 'react-konva-utils';

export default function SimpleImage({ image, isSelected, onSelect, onUnselect, updateToolbarButtonPosition, ...props }) {
  const { isDraggable } = props;
  const [img] = useImage(image.src, "anonymous");
  const shapeRef = useRef();
  const trRef = useRef();
  const { showMask, id } = props;



  return (
    <Image
      {...props}
      image={img}
      draggable={true}
    />
    
  );
}