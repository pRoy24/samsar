/* eslint-disable no-restricted-globals */

self.onmessage = async function (e) {
  const { layers } = e.data;

  const fetchPromises = layers.flatMap(layer =>
    layer.imageSession?.activeItemList.map(item =>
      fetch(item.imageUrl)
        .then(response => response.blob())
        .then(blob => ({ imageUrl: item.imageUrl, blob }))
        .catch(error => ({ imageUrl: item.imageUrl, error }))
    ) || []
  );

  const fetchedImages = await Promise.all(fetchPromises);
  self.postMessage({ fetchedImages });
};
