

export const transformImageHorizontal = (stage, id) => {
  const image = stage.findOne(`#${id}`);
  const scaleX = image.scaleX() * -1;
  const clientRect = image.getClientRect();

  image.to({
    scaleX: scaleX,
    duration: 0.2,
    x: clientRect.x + (scaleX === -1 ? clientRect.width : 0),
  });
};

export const transformImageVertical = (stage, id) => {
  const image = stage.findOne(`#${id}`);
  const scaleY = image.scaleY() * -1;
  const clientRect = image.getClientRect({
    skipTransform: false,
    skipShadow: false,
    skipStroke: false,
  });

  image.to({
    scaleY: scaleY,
    duration: 0.2,
    y: clientRect.y + (scaleY === -1 ? clientRect.height : 0),
  });
};



// utils/ImageUtils.js

export const rleDecode = (segmentation) => {
  const { counts, size } = segmentation;
  const [height, width] = size;
  const decoded = new Uint8Array(height * width);
  let countIndex = 0;
  let value = 0;
  let index = 0;

  while (countIndex < counts.length) {
    let count = 0;
    while (counts[countIndex] !== undefined && !isNaN(counts[countIndex])) {
      count = count * 10 + Number(counts[countIndex]);
      countIndex++;
    }
    countIndex++; // Skip the space character
    for (let i = 0; i < count; i++) {
      decoded[index] = value;
      index++;
    }
    value = 1 - value; // Flip between 0 and 1
  }

  return decoded;
};


export const maskToPoints = (mask, width) => {
  const points = [];
  for (let y = 0; y < mask.length / width; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] === 1) {
        points.push(x, y);
      }
    }
  }
  console.log(points);
  
  return points;
};
