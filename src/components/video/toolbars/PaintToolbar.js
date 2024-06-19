import React, { useState } from 'react';
import { useColorMode } from '../../../contexts/ColorMode.js';
import { FaCheck, FaCopy, } from 'react-icons/fa6';

import { MdOutlineRefresh } from "react-icons/md";


export default function PaintToolbar(props) {
  const {
    pos,
    addPaintImage,
    resetPaintImage
  } = props;

  const { colorMode } = useColorMode();

  const iconColor = colorMode === 'dark' ? 'text-neutral-200' : 'text-grey-800';

  return (
    <div key={pos.id} style={{
      position: 'absolute', left: pos.x, top: pos.y, background: "#030712",
      width: "350px", borderRadius: "5px", padding: "5px", display: "flex", flexDirection: "column", alignItems: "center",
      zIndex: 1000
    }}>

      <div className='grid grid-cols-2 w-full text-center'>
        <div onClick={() => resetPaintImage()}>
          <MdOutlineRefresh className='inline-flex' />
          Reset
        </div>
        <div onClick={() => addPaintImage()}>
          <FaCheck className='inline-flex'  />
          Apply
        </div>
      </div>
    </div>
  );
}
