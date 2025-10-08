import { useCallback, useEffect, useRef, useState } from 'react';
import orbitalSoundscape from '../assets/audio/orbital-soundscape.wav';

const useAmbientSound = () => {
  const audioRef = useRef(null);
  const retryHandlerRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  const clearGestureRetry = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handler = retryHandlerRef.current;
    if (!handler) {
      return;
    }
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('keydown', handler);
    retryHandlerRef.current = null;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      return undefined;
    }
    const audio = new Audio(orbitalSoundscape);
    audio.loop = true;
    audio.volume = 0.32;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      clearGestureRetry();
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [clearGestureRetry]);

  const attemptPlay = useCallback(() => {
    if (!audioRef.current) {
      return Promise.resolve(false);
    }
    audioRef.current.currentTime = 0;
    return audioRef.current
      .play()
      .then(() => {
        setEnabled(true);
        clearGestureRetry();
        return true;
      })
      .catch(() => false);
  }, [clearGestureRetry]);

  const disable = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setEnabled(false);
    clearGestureRetry();
  }, [clearGestureRetry]);

  const enable = useCallback(() => {
    if (!audioRef.current) {
      return;
    }
    attemptPlay().then((success) => {
      if (success || typeof window === 'undefined' || retryHandlerRef.current) {
        return;
      }
      const handler = () => {
        attemptPlay().then((played) => {
          if (!played) {
            retryHandlerRef.current = null;
          }
        });
      };
      retryHandlerRef.current = handler;
      window.addEventListener('pointerdown', handler, { once: true });
      window.addEventListener('keydown', handler, { once: true });
    });
  }, [attemptPlay]);

  const toggle = useCallback(() => {
    if (enabled) {
      disable();
    } else {
      enable();
    }
  }, [disable, enable, enabled]);

  const setAmbient = useCallback(
    (value) => {
      if (value) {
        enable();
      } else {
        disable();
      }
    },
    [disable, enable]
  );

  return [enabled, toggle, setAmbient];
};

export default useAmbientSound;
