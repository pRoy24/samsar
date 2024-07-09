
function decode(rleObj) {
  console.log(rleObj);
  
  const { size, counts } = rleObj;
  const [height, width] = size;
  const mask = new Uint8Array(height * width);
  
  let pos = 0;
  let value = 1;
  
  for (let i = 0; i < counts.length; i++) {
    const count = counts.charCodeAt(i) - 48;
    for (let j = 0; j < count; j++) {
      mask[pos] = value;
      pos++;
    }
    value = 1 - value; // Toggle between 0 and 1
  }
  
  return mask;
}


const extractPixels = (imageData, mask1D) => {
  const [height, width] = [imageData.height, imageData.width];
  
  console.log('Image dimensions:', width, 'x', height);
  console.log('Mask1D length:', mask1D.length);

  // Create a new ImageData object for the entire image
  const extractedData = new ImageData(width, height);
  
  let nonZeroPixels = 0;
  let totalMaskedPixels = 0;
  
  // Iterate through the entire image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const maskIndex = y * width + x;  // Index in the 1D mask
      const imageIndex = maskIndex * 4;
      
      if (mask1D[maskIndex] === 1) {
        totalMaskedPixels++;
      }
      
      // If the mask pixel is set (1), copy the image pixel
      if (mask1D[maskIndex] === 1) {
        extractedData.data[imageIndex] = imageData.data[imageIndex];       // R
        extractedData.data[imageIndex + 1] = imageData.data[imageIndex + 1]; // G
        extractedData.data[imageIndex + 2] = imageData.data[imageIndex + 2]; // B
        extractedData.data[imageIndex + 3] = 255;  // Full opacity for masked pixels
        nonZeroPixels++;
      } else {
        // If the mask pixel is not set, make it transparent
        extractedData.data[imageIndex] = 0;
        extractedData.data[imageIndex + 1] = 0;
        extractedData.data[imageIndex + 2] = 0;
        extractedData.data[imageIndex + 3] = 0;
      }
    }
  }
  
  console.log('Non-zero pixels:', nonZeroPixels);
  console.log('Total masked pixels in mask1D:', totalMaskedPixels);
  console.log('Total pixels in image:', width * height);
  
  return extractedData;
};

onmessage = function (e) {
  const { segmentation, imageData } = e.data;

  // Decode the RLE data
  const binaryMask1D = decode(segmentation);

  const extractedPixels = extractPixels(imageData, binaryMask1D);

  console.log(extractedPixels);
  console.log("MEMEM");

  postMessage({ mask1D: binaryMask1D, extractedPixels }); // Send the 1D mask and extracted pixels back to the main thread
};