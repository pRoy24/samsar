import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getHeaders } from '../../utils/web';
import { useAlertDialog } from '../../contexts/AlertDialogContext';

const PROCESSOR_API = process.env.REACT_APP_PROCESSOR_API;

export default function ImagePanelContent(props) {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const { openAlertDialog, closeAlertDialog, setAlertComponentHTML } = useAlertDialog();

  useEffect(() => {
    const headers = getHeaders();

    axios.get(`${PROCESSOR_API}/accounts/user_image_generations`, headers ).then((res) => {
      setImages(res.data);
    });
  }, []);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    const adComponent = (
      <div className="">
        <div className="flex justify-between items-center mb-4">
          <a
            href={`${PROCESSOR_API}/generations/${image.url}`}
            download
            className="text-blue-500 underline"
          >
            Download Image
          </a>

        </div>

        <img
          src={`${PROCESSOR_API}/generations/${image.url}`}
          alt={image.prompt}
          className="w-full h-full object-cover"
        />
        <p className="mt-4 text-sm text-white bg-gray-900 bg-opacity-80 p-4 rounded">
          {image.prompt}
        </p>
      </div>
    );
    openAlertDialog(adComponent);
  };

  return (
    <div className="p-4 pt-2">
      <h1 className="text-2xl font-bold mb-4">User Image Generations</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-screen">
        {images.map((image) => (
          <div key={image._id} className="cursor-pointer" onClick={() => handleImageClick(image)}>
            <img
              src={`${PROCESSOR_API}/generations/${image.url}`}
              alt={image.prompt}
              className="w-64 h-64 object-cover"
            />
            <p className="mt-2 text-sm text-gray-700">
              {image.prompt.split(' ').slice(0, 4).join(' ')}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
