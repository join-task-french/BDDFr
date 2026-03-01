// Formatteurs et utilitaires d'affichage

export const WEAPON_TYPE_LABELS = {
  fusil_assaut: "Fusil d'assaut",
  fusil: 'Fusil',
  fusil_precision: 'Fusil de précision',
  pistolet_mitrailleur: 'Pistolet mitrailleur',
  fusil_mitrailleur: 'Fusil mitrailleur',
  calibre_12: 'Calibre 12',
  pistolet: 'Pistolet',
  arme_specifique: 'Arme spécifique',
  autre: 'Autre'
}

export const GEAR_SLOT_LABELS = {
  masque: 'Masque',
  torse: 'Torse',
  holster: 'Holster',
  sac_a_dos: 'Sac à dos',
  gants: 'Gants',
  genouilleres: 'Genouillères'
}

export const GEAR_SLOT_ICONS = {
  masque: '🎭',
  torse: '🦺',
  holster: '🔧',
  sac_a_dos: '🎒',
  gants: '🧤',
  genouilleres: '🦿'
}

export const GEAR_SLOTS = ['masque', 'torse', 'holster', 'sac_a_dos', 'gants', 'genouilleres']

export function formatNumber(n) {
  if (!n) return '—'
  return Number(n).toLocaleString('fr-FR')
}

export function formatText(text) {
  if (!text || text === '-' || text === 'n/a') return null
  // Ajoute des retours à la ligne après les points suivis de lettres
  return text.replace(/\.(?=[a-zA-Zà-ÿÀ-ß+])/g, '.\n')
}

