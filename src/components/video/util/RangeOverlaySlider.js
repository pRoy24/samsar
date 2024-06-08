// src/components/util/DualThumbSlider.js
import React, { useEffect, useState } from 'react';
import { MdHorizontalRule } from "react-icons/md";


import ReactSlider from 'react-slider';


export default function DualThumbSlider({ min, max, value, onChange, highlightBoundaries, layerDurationUpdated }) {



  const [sliderValues, setSliderValues] = useState(value);

  const handleSliderChange = (values) => {    
    setSliderValues(values);
    onChange(values);
  };

  useEffect(() => {
    setSliderValues(value);
  }, [value]);


  const { height } = highlightBoundaries;

  return (
    <div style={{
      height: `${height}px`,
    }}>
    <ReactSlider
      className={`range-overlay-slider h-full`}
      thumbClassName='thumb'
      trackClassName='track'
      min={min}
      max={max}
      value={sliderValues}
      onChange={handleSliderChange}
      renderThumb={function(props, state) {
        return (
        <div  {...props} />
        )
      }}
      onAfterChange={layerDurationUpdated}
      orientation="vertical"
    />
    </div>
  );
}
