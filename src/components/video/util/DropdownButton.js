import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

function DropdownButton(props) {
  const {
    addLayerToComposition,
    copyCurrentLayerBelow
  } = props;
  const [isOpen, setIsOpen] = useState(false);

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
        className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <FaPlus className="mr-2" />
        <span className="text-xs">Add</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              onClick={addNewLayer}
              className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              Add new 
            </button>
            <button
              onClick={copyCurrentLayer}
              className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              Copy current 
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropdownButton;
