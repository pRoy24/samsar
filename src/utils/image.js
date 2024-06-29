const API_SERVER = process.env.REACT_APP_PROCESSOR_API;

const BASE_HEIGHT = 1024;
const BASE_WIDTH = 1024;

export function getScalingFactor(imageDimensions) {
  let {width, height} = imageDimensions;
  let largerDimension = Math.max(width, height);
  let scalingFactor = 1;
  if (largerDimension > BASE_HEIGHT) {
    scalingFactor = BASE_HEIGHT / largerDimension;
  }
  return scalingFactor;
}


export function getRemoteImageLink(imagePath) {
  console.log(imagePath);
  console.log("EETE");
  
  if (imagePath.includes('generation') || imagePath.includes('outpaint')) {
    return `${API_SERVER}/generations/${imagePath}`;  
  } else if (imagePath.includes('/video/')) {
    return `${API_SERVER}${imagePath}`;
  }
}