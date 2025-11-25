import { useRef, useCallback } from 'react';

export const useSingleTap = (callback: (...args: any[]) => void, delay: number = 1000) => {
  const processing = useRef(false);

  const debouncedCallback = useCallback((...args: any[]) => {
    if (processing.current) {
      console.log('Clique rápido ignorado.');
      return;
    }

    processing.current = true;
    
    callback(...args);

    setTimeout(() => {
      processing.current = false;
    }, delay);

  }, [callback, delay]);

  return debouncedCallback;
};