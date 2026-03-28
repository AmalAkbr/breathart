import { useEffect, useState } from 'react';

const PROD_DEVTOOLS_THRESHOLD = 160;

const isDevtoolsShortcut = (event) => {
  const key = event.key?.toLowerCase();
  return (
    event.key === 'F12' ||
    (event.ctrlKey && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
    (event.metaKey && event.altKey && key === 'i')
  );
};

export const useDevtoolsShield = () => {
  const [isDevtoolsOpen, setIsDevtoolsOpen] = useState(false);
  const isProduction =
    import.meta.env?.PROD ||
    import.meta.env?.MODE === 'production' ||
    import.meta.env?.VITE_NODE_ENV === 'production';

  useEffect(() => {
    if (!isProduction) {
      return undefined;
    }

    const detectByViewportGap = () => {
      const widthGap = Math.abs(window.outerWidth - window.innerWidth);
      const heightGap = Math.abs(window.outerHeight - window.innerHeight);
      return widthGap > PROD_DEVTOOLS_THRESHOLD || heightGap > PROD_DEVTOOLS_THRESHOLD;
    };

    const runDetection = () => {
      setIsDevtoolsOpen(detectByViewportGap());
    };

    const handleKeyDown = (event) => {
      if (!isDevtoolsShortcut(event)) {
        return;
      }

      event.preventDefault();
      setIsDevtoolsOpen(true);
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('resize', runDetection);

    runDetection();
    const intervalId = window.setInterval(runDetection, 500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('resize', runDetection);
      window.clearInterval(intervalId);
    };
  }, [isProduction]);

  return {
    isProduction,
    isDevtoolsOpen,
  };
};

export default useDevtoolsShield;
