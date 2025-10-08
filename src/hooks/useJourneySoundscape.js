import { useCallback, useEffect, useMemo, useRef } from 'react';
import ignitionSrc from '../assets/audio/journey-ignition.wav';
import selectionSrc from '../assets/audio/journey-select.wav';
import hoverSrc from '../assets/audio/journey-hover.wav';
import advanceSrc from '../assets/audio/journey-stage-advance.wav';
import retreatSrc from '../assets/audio/journey-stage-retreat.wav';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const SOUND_MAP = {
  ignition: ignitionSrc,
  selection: selectionSrc,
  hover: hoverSrc,
  advance: advanceSrc,
  retreat: retreatSrc,
};

const useJourneySoundscape = ({ enabled = true, masterVolume = 0.4 } = {}) => {
  const audioCacheRef = useRef({});

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const cache = audioCacheRef.current;
    Object.entries(SOUND_MAP).forEach(([key, src]) => {
      if (!cache[key]) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = 0;
        audio.load();
        cache[key] = audio;
      }
    });

    return () => {
      Object.keys(cache).forEach((key) => {
        const audio = cache[key];
        if (audio) {
          audio.pause();
          audio.src = '';
          delete cache[key];
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      Object.values(audioCacheRef.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    }
  }, [enabled]);

  const playFromCache = useCallback(
    (key, { volume = 1, playbackRate = 1 } = {}) => {
      if (!enabled) {
        return;
      }
      const base = audioCacheRef.current[key];
      if (!base) {
        return;
      }
      const instance = base.cloneNode(true);
      instance.volume = clamp(masterVolume * volume, 0, 1);
      instance.playbackRate = playbackRate;
      instance.currentTime = 0;
      instance.play().catch(() => {});
    },
    [enabled, masterVolume]
  );

  const playIgnition = useCallback(() => {
    playFromCache('ignition', { volume: 0.9 });
  }, [playFromCache]);

  const playSelection = useCallback(() => {
    playFromCache('selection', { volume: 0.6 });
  }, [playFromCache]);

  const playHover = useCallback(
    (category = 'generic') => {
      const playbackRateMap = {
        seat: 0.94,
        focus: 1.06,
        habitat: 0.9,
        node: 1.08,
        crisis: 0.88,
        timeline: 1.02,
        'stage-action': 1,
      };
      const playbackRate = playbackRateMap[category] ?? 1;
      playFromCache('hover', { volume: 0.35, playbackRate });
    },
    [playFromCache]
  );

  const playStageAdvance = useCallback(() => {
    playFromCache('advance', { volume: 0.75 });
  }, [playFromCache]);

  const playStepBack = useCallback(() => {
    playFromCache('retreat', { volume: 0.6 });
  }, [playFromCache]);

  return useMemo(
    () => ({
      playIgnition,
      playSelection,
      playHover,
      playStageAdvance,
      playStepBack,
    }),
    [playHover, playIgnition, playSelection, playStageAdvance, playStepBack]
  );
};

export default useJourneySoundscape;
