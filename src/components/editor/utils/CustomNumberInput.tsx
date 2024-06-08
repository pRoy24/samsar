import React, { useState } from 'react';
import { FaMinus , FaPlus } from "react-icons/fa";
import { useColorMode } from '../../../contexts/ColorMode.js';

export default function CustomNumberInput(props) {
  const { value, setValue } = props;

  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-neutral-900';

  const increment = () => setValue(prevValue => prevValue + 1);
  const decrement = () => setValue(prevValue => prevValue - 1);

  return (
    <div className="flex items-center h-[30px]">

      <input 
        type="number" 
        value={value} 
        onChange={e => setValue(Number(e.target.value))}
        className={`w-[80px] h-[22px] text-center border-2 border-gray-300 ${bgColor}`}
      />

    </div>
  );
}
