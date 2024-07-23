// imagePreloaderWorkerSingleton.js
let imagePreloaderWorker;

export const getImagePreloaderWorker = () => {
  if (!imagePreloaderWorker) {
    imagePreloaderWorker = new Worker(new URL('./imagePreloaderWorker.js', import.meta.url));
  }
  return imagePreloaderWorker;
};
