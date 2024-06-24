import React, { useState } from 'react';
import { useColorMode  } from '../../../contexts/ColorMode.js';
import SecondaryButton from '../../common/SecondaryButton.tsx';
import { getRemoteImageLink } from '../../../utils/image.js'

const API_SERVER = process.env.REACT_APP_PROCESSOR_API;


export default function ImageLibrary(props) {
  const { generationImages, addImageItemToActiveList } = props;
  const [selectedImage, setSelectedImage] = useState(null);

  const { colorMode } = useColorMode();

  const handleImageClick = (imageLink) => {
    setSelectedImage(imageLink);
  };

  const handleSelect = (imageLink) => {
    const imagePath = imageLink.replace(`${API_SERVER}`, '');
    const newItem = {
      src: imagePath,
      id: `item_${Math.random().toString(36).substr(2, 9)}`,
      type: 'image',
      x: 0,
      y: 0,
      width: 1024,
      height: 1024,
    };
    addImageItemToActiveList(newItem);
    
    setSelectedImage(null);
  };

  const bgColor = colorMode === 'dark' ? 'bg-gray-800 ' : 'bg-gray-200';

  const textColor = colorMode === 'dark' ? 'text-white' : 'text-black';

  const imagesLinks = generationImages.map((image) => {
    const imageLink =  getRemoteImageLink(image);


    return (
      <div key={image} className="image-item">
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
    <div className='grid grid-cols-4 gap-1'>
      {imagesLinks}
    </div>
  );
}
