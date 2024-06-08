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

