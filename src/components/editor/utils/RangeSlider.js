import React, { useState } from 'react';

function RangeSlider(props) {
  const { editBrushWidth, setEditBrushWidth } = props;



  const handleSliderChange = (event) => {
    setEditBrushWidth(event.target.value);
  };

  return (
    <div >

      <input
        type="range"
        min="5"
        max="100"
        value={editBrushWidth}
        onChange={handleSliderChange}
        className='w-full'
        style={{

          background: `linear-gradient(to right, #ddd 0%, #ddd ${(editBrushWidth - 5) / 45 * 100}%, #fff ${(editBrushWidth - 5) / 45 * 100}%, #fff 100%)`,
          height: '8px',
          borderRadius: '5px',
          outline: 'none',
          transition: 'background 0.3s ease-in-out',
        }}
      />
            <div className='text-xs text-center font-bold'>
          Brush width
        </div>

    </div>
  );
}

export default RangeSlider;
