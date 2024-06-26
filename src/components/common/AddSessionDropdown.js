import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useColorMode } from '../../contexts/ColorMode.js';

function AddSessionDropdown(props) {
  const {
    createNewSession,
    gotoViewSessionsPage,
  } = props;

  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);

  const bgColor = colorMode === 'dark' ? 'bg-gray-900 hover:bg-blue-700 ' : 'bg-neutral-200 hover:bg-neutral-300';
  const textColor = colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700';

  

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };



  const addNewSession = () => {
    console.log('Add new layer');
    createNewSession();
    setIsOpen(false);
  };

  const viewSessions = () => {
    console.log('Copy current layer');
    gotoViewSessionsPage();
    setIsOpen(false);
  };


  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className={`inline-flex justify-center w-32 px-4 py-4 
         text-sm font-medium 
          rounded-md shadow-sm hover:bg-gray-50 focus:outline-none ${textColor} ${bgColor}`}
      >
        <FaPlus className="mr-2" />
        <span className="text-xs">New Project</span>
      </button>

      {isOpen && (
        <div className="absolute right-0  mt-2 w-32 origin-top-right rounded-md
         shadow-lg ring-1 ring-black ring-opacity-5 " style={{zIndex: 100}}>
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              onClick={addNewSession}
              className={`block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${textColor} ${bgColor}}`}
              role="menuitem"
            >
               Create New
            </button>
            <button
              onClick={viewSessions}
              className={`block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${textColor} ${bgColor}}`}
              role="menuitem"
            >
              View Sessions 
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default AddSessionDropdown;
