import { useRef, useCallback } from 'react';

/**
 * Lightweight SFX hook using HTMLAudioElement.
 * Caches Audio instances for instant replay.
 * Silently catches autoplay blocks (expected on first load before user interaction).
 */
export function useSfx() {
  const cache = useRef<Record<string, HTMLAudioElement>>({});

  const play = useCallback((path: string, volume = 0.7) => {
    if (!cache.current[path]) {
      cache.current[path] = new Audio(path);
      cache.current[path].preload = 'auto';
    }
    const a = cache.current[path];
    a.volume = volume;
    a.currentTime = 0;
    a.play().catch(() => { /* silent autoplay block, OK */ });
  }, []);

  return { play };
}
