export const getVideoDurationInSecondsFromFile = (file) => {
  if (!file) {
    return Promise.resolve(0);
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      video.load();
    };

    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const rawDuration = Number(video.duration);
      const durationSeconds = Number.isFinite(rawDuration) && rawDuration > 0
        ? Math.round(rawDuration)
        : 0;

      cleanup();
      resolve(durationSeconds);
    };

    video.onerror = () => {
      cleanup();
      resolve(0);
    };

    video.src = objectUrl;
  });
};
