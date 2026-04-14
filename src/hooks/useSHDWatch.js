import { useState, useEffect } from 'react';

export const STORAGE_KEY = 'div2_shd_watch';
export const SHD_LEVELS_UPDATED_EVENT = 'shd-levels-updated';

function clampLevel(level) {
  const parsed = Number(level);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(50, Math.round(parsed)));
}

function buildDefaultLevels(montreConfig) {
  const defaults = {};
  if (!montreConfig?.categories) return defaults;

  Object.values(montreConfig.categories).forEach(cat => {
    if (!cat?.stats) return;
    Object.keys(cat.stats).forEach(statId => {
      defaults[statId] = 0;
    });
  });

  return defaults;
}

export function getSHDLevels(montreConfig) {
  const defaults = buildDefaultLevels(montreConfig);
  if (typeof window === 'undefined') return { ...defaults };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...defaults, ...parsed };
      }
    }
  } catch (e) {
    console.error("Failed to load SHD levels", e);
  }
  return { ...defaults };
}

export function saveSHDLevels(levels) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
    // Événement local (même onglet) pour synchroniser les pages Build.
    window.dispatchEvent(new CustomEvent(SHD_LEVELS_UPDATED_EVENT, { detail: levels }));
  } catch (e) {
    console.error("Failed to save SHD levels", e);
  }
}

export function useSHDWatch(montreConfig) {
  const [shdLevels, setShdLevels] = useState(() => getSHDLevels(montreConfig));

  useEffect(() => {
    const handleUpdate = () => {
      setShdLevels(getSHDLevels(montreConfig));
    };

    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        handleUpdate();
      }
    };

    window.addEventListener(SHD_LEVELS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(SHD_LEVELS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [montreConfig]);

  useEffect(() => {
    setShdLevels(getSHDLevels(montreConfig));
  }, [montreConfig]);

  const updateStat = (statId, level) => {
    setShdLevels(prev => {
      const newLevels = { ...prev, [statId]: clampLevel(level) };
      saveSHDLevels(newLevels);
      return newLevels;
    });
  };

  const setAllToMax = () => {
    setShdLevels(prev => {
      const defaultLevels = buildDefaultLevels(montreConfig);
      const keys = Object.keys(defaultLevels).length > 0 ? Object.keys(defaultLevels) : Object.keys(prev || {});
      const newLevels = {};
      keys.forEach(key => {
        newLevels[key] = 50;
      });
      saveSHDLevels(newLevels);
      return newLevels;
    });
  };

  const resetAll = () => {
    setShdLevels(() => {
      const defaultLevels = buildDefaultLevels(montreConfig);
      saveSHDLevels(defaultLevels);
      return defaultLevels;
    });
  };

  return {
    shdLevels,
    updateStat,
    setAllToMax,
    resetAll
  };
}
