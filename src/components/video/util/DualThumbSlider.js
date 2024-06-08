// src/components/util/DualThumbSlider.js
import React, { useEffect, useState } from 'react';
import { FaCircle } from 'react-icons/fa6';
import ReactSlider from 'react-slider';


export default function DualThumbSlider({ min, max, defaultValue, onChange }) {


  const [sliderValues, setSliderValues] = useState(defaultValue);

  const handleSliderChange = (values) => {
    setSliderValues(values);
    onChange(values);
  };

  useEffect(() => {
     setSliderValues(defaultValue);
  }, [defaultValue]);

  return (
    <ReactSlider
      className='dual-thumb-slider'
      thumbClassName='thumb'
      trackClassName='track'
      defaultValue={[min, max]}
      min={min}
      max={max}
      value={sliderValues}
      onChange={handleSliderChange}
      renderThumb={(props, state) => <div {...props}>
      </div>}
      orientation="vertical"
    />
  );
}
