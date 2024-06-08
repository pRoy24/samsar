

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

