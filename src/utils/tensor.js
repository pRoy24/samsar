
import * as tf from '@tensorflow/tfjs';

export function imageDataToImageTensor(imageData) {
  // 1. Extract image data information
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const numChannels = 4; // Assuming RGBA format (adjust if different)

  // 2. Create a new typed array for the image data
  const imageArray = new Uint8Array(width * height * numChannels);

  // 3. Convert RGBA data to format expected by TensorFlow.js (usually RGBA)
  for (let i = 0; i < data.length; i += 4) {
    const rgba = [data[i + 0], data[i + 1], data[i + 2], data[i + 3]]; // RGBA order
    imageArray.set(rgba, i);
  }

  // 4. Reshape the typed array to match image dimensions and number of channels
  const imageShape = [height, width, numChannels];
  const imageTensor = tf.tensor(imageArray, imageShape);

  // 5. (Optional) Normalize the image data if required by your model
  // imageTensor = imageTensor.div(255.0); // Normalize to range [0, 1] (example)

  return imageTensor;
}