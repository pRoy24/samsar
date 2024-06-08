import React from 'react';
import { FaRegClone, FaCut, FaRedo, FaTimes } from 'react-icons/fa';
import { FaCheck, FaCopy, } from 'react-icons/fa6';

import { MdOutlineRefresh } from "react-icons/md";

const ShapeSelectToolbar = ({ pos, onResetShape,  onCopyShape, onReplaceShape }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        background: '#030712',
        borderRadius: '5px',
        padding: '5px',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div className='grid grid-cols-3 w-full text-center'>
        <button onClick={onResetShape} style={{ margin: '0 5px' }}>
        <MdOutlineRefresh className='inline-flex' />
          Reset
        </button>
        <button onClick={onCopyShape} style={{ margin: '0 5px' }}>
        <FaCheck className='inline-flex' />
         Copy
        </button>
        <button onClick={onReplaceShape} style={{ margin: '0 5px' }}>
        <FaCheck className='inline-flex' />
         Replace
        </button>

      </div>
    </div>
  );
};

export default ShapeSelectToolbar;
