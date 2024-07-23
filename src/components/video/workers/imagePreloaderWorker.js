/* eslint-disable no-restricted-globals */
const API_SERVER = process.env.REACT_APP_PROCESSOR_API;

self.onmessage = async function (e) {
  const { layers } = e.data;

  const fetchPromises = layers.flatMap(layer => {
    if (layer.imageSession?.generationStatus === 'COMPLETED') {
      return layer.imageSession?.activeItemList.map(function (item) {
        if (item.type === 'image') {
          const itemUrl = getRemoteImageLink(item.src);
          return fetch(itemUrl).then(response => response.blob());
        }
        return null;
      }).filter(promise => promise !== null) || [];
    }
    return [];
  });

  const fetchedImages = await Promise.all(fetchPromises);
  self.postMessage({ fetchedImages });
};

export function getRemoteImageLink(imagePath) {  
  if (imagePath.includes('generation') || imagePath.includes('outpaint')) {
    // Remove "/generations/" from imagePath if it exists
    const cleanedImagePath = imagePath.replace('/generations/', '');
    return `${API_SERVER}/generations/${cleanedImagePath}`;  
  } else if (imagePath.includes('/video/')) {
    return `${API_SERVER}${imagePath}`;
  }
}
