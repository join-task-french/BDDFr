import { useState, useEffect } from 'react';

const STORAGE_KEY = 'div2_shd_watch';

const DEFAULT_SHD_LEVELS = {
  // Offensif
  degats_arme: 0,
  degats_coup_critique: 0,
  probabilite_coup_critique: 0,
  degats_headshot: 0,
  // Défensif
  protection: 0,
  resistance_alterations: 0,
  regeneration_protection: 0,
  sante: 0,
  // Utilitaire
  degats_competence: 0,
  recuperation_competence: 0,
  duree_competence: 0,
  reparation_competence: 0,
  // Maniement
  precision: 0,
  stabilite: 0,
  vitesse_rechargement: 0,
  vitesse_echange: 0,
};

export function getSHDLevels() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SHD_LEVELS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load SHD levels", e);
  }
  return { ...DEFAULT_SHD_LEVELS };
}

export function saveSHDLevels(levels) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
    // Déclencher un événement personnalisé pour informer les autres composants
    window.dispatchEvent(new Event('shd-levels-updated'));
  } catch (e) {
    console.error("Failed to save SHD levels", e);
  }
}

export function useSHDWatch() {
  const [shdLevels, setShdLevels] = useState(getSHDLevels());

  useEffect(() => {
    const handleUpdate = () => {
      setShdLevels(getSHDLevels());
    };
    window.addEventListener('shd-levels-updated', handleUpdate);
    return () => window.removeEventListener('shd-levels-updated', handleUpdate);
  }, []);

  const updateStat = (statId, level) => {
    const newLevels = { ...shdLevels, [statId]: level };
    setShdLevels(newLevels);
    saveSHDLevels(newLevels);
  };

  const setAllToMax = () => {
    const newLevels = {};
    Object.keys(DEFAULT_SHD_LEVELS).forEach(key => {
      newLevels[key] = 50;
    });
    setShdLevels(newLevels);
    saveSHDLevels(newLevels);
  };

  const resetAll = () => {
    setShdLevels(DEFAULT_SHD_LEVELS);
    saveSHDLevels(DEFAULT_SHD_LEVELS);
  };

  return {
    shdLevels,
    updateStat,
    setAllToMax,
    resetAll
  };
}
