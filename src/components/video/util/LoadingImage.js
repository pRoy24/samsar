import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useColorMode } from '../../../contexts/ColorMode';

export default function LoadingImage() {
  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'dark' ? 'bg-gray-600 text-neutral-50' : 'bg-gray-200 text-neutral-900';
  
  return (
    <div className={`loading-image h-screen w-full flex justify-center items-center ${bgColor}`}>
      <div className='flex flex-col items-center'>
        <FaSpinner className="animate-spin text-4xl mb-2" />
        <span>Loading</span>
      </div>
    </div>
  );
}
