import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

import { useColorMode } from '../../../contexts/ColorMode';
function DropdownButton(props) {
  const {
    addLayerToComposition,
    copyCurrentLayerBelow,
    showBatchLayerDialog
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { colorMode } = useColorMode();

  const bgColor = colorMode === 'dark' ? 'bg-gray-900 hover:bg-gray-700 ' : 'bg-neutral-200 hover:bg-neutral-300';
  const textColor = colorMode === 'dark' ? 'text-neutral-100' : 'text-neutral-700';


  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };



  const addNewLayer = () => {
    console.log('Add new layer');
    addLayerToComposition();
    setIsOpen(false);
  };

  const copyCurrentLayer = () => {
    console.log('Copy current layer');
    copyCurrentLayerBelow();
    setIsOpen(false);
  };



  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className={`inline-flex justify-center w-full px-4 py-2
         text-sm font-medium  border border-gray-300
          rounded-md shadow-sm  focus:outline-none ${textColor} ${bgColor}`}
      >
        <FaPlus className="mr-2" />
        <span className="text-xs">Add</span>
      </button>

      {isOpen && (
        <div className={`absolute right-0  mt-2 w-32 origin-top-right rounded-md
         shadow-lg ring-1 ring-black ring-opacity-5 ${textColor} ${bgColor}`}style={{zIndex: 100}}>
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              onClick={addNewLayer}
              className={`block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${textColor} ${bgColor}`}
              role="menuitem"
            >
              Add new 
            </button>
            <button
              onClick={copyCurrentLayer}
              className={`block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${textColor} ${bgColor}`}
              role="menuitem"
            >
              Copy current 
            </button>
            <button
              onClick={showBatchLayerDialog}
              className={`block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${textColor} ${bgColor}`}
              role="menuitem"
            >
              Add Batch 
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropdownButton;
