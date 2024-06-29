import React, { useState } from 'react';
import { useColorMode } from '../../../contexts/ColorMode.js';
import SecondaryButton from '../../common/SecondaryButton.tsx';
import { getRemoteImageLink } from '../../../utils/image.js'
import { FaChevronCircleLeft } from 'react-icons/fa';

const API_SERVER = process.env.REACT_APP_PROCESSOR_API;


export default function ImageLibrary(props) {
  const { generationImages, selectImageFromLibrary, resetImageLibrary } = props;
  const [selectedImage, setSelectedImage] = useState(null);

  const { colorMode } = useColorMode();

  const handleImageClick = (imageLink) => {
    setSelectedImage(imageLink);
  };

  const handleSelect = (imageLink) => {
    const imagePath = imageLink.replace(`${API_SERVER}`, '');
    selectImageFromLibrary(imagePath);
    setSelectedImage(null);
  };

  const bgColor = colorMode === 'dark' ? 'bg-gray-800 ' : 'bg-gray-200';

  const textColor = colorMode === 'dark' ? 'text-white' : 'text-black';

  const imagesLinks = generationImages.map((image) => {
    const imageLink = getRemoteImageLink(image.src);
    return (
      <div key={imageLink} className={`image-item `}>
        <img
          src={imageLink}
          alt="generationImage"
          onClick={() => handleImageClick(imageLink)}
          style={{ cursor: 'pointer' }}
        />
        {selectedImage === imageLink && (
          <SecondaryButton onClick={() => handleSelect(imageLink)}
          >Select</SecondaryButton>
        )}
      </div>
    );
  });

  return (
    <div className={`w-full h-full overflow-y-auto ${bgColor}  ${textColor} pl-2 pr-2 pt-4 pb-4 mt-[50px]`}>
      <div className='mb-2 mt-2'>
        <div className='inline-flex float-left' onClick={() => resetImageLibrary()}>
          <FaChevronCircleLeft className='inline-flex ml-2 mr-2 text-lg' />
          <div className='inline-flex '>
            Back
          </div>

        </div>
        <h2 className='text-lg font-bold'>Image Library</h2>
      </div>

      <div className='grid grid-cols-4 gap-1'>
        {imagesLinks}
      </div>
    </div>
  );
}
