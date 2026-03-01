// Encodage/décodage de builds pour partage par URL
// Le build est compressé en un objet compact avec uniquement les noms,
// puis encodé en base64 dans le hash de l'URL.

/**
 * Sérialise le state du build en un objet compact (noms uniquement)
 */
export function serializeBuild(state) {
  const b = {}

  // Arme spécifique (nom)
  if (state.specialWeapon) b.sw = state.specialWeapon.nom

  // Armes classiques (noms)
  const w = (state.weapons || []).map(w => w?.nom || null)
  if (w.some(Boolean)) b.w = w

  // Talents d'armes (noms)
  const wt = (state.weaponTalents || []).map(t => t?.nom || null)
  if (wt.some(Boolean)) b.wt = wt

  // Arme de poing
  if (state.sidearm) b.sa = state.sidearm.nom
  if (state.sidearmTalent) b.sat = state.sidearmTalent.nom

  // Équipements (par slot)
  const g = {}
  for (const [slot, piece] of Object.entries(state.gear || {})) {
    if (piece) g[slot] = piece.nom
  }
  if (Object.keys(g).length > 0) b.g = g

  // Talents d'équipement
  const gt = {}
  for (const [slot, talent] of Object.entries(state.gearTalents || {})) {
    if (talent) gt[slot] = talent.nom
  }
  if (Object.keys(gt).length > 0) b.gt = gt

  // Compétences (variante car unique dans un type)
  const s = (state.skills || []).map(s => s ? { c: s.competence, v: s.variante } : null)
  if (s.some(Boolean)) b.s = s

  return b
}

/**
 * Encode un build sérialisé en string base64 URL-safe
 */
export function encodeBuild(state) {
  const compact = serializeBuild(state)
  if (Object.keys(compact).length === 0) return ''
  const json = JSON.stringify(compact)
  // Encode en base64 URL-safe
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Décode un string base64 URL-safe en objet compact de build
 */
export function decodeBuild(encoded) {
  if (!encoded) return null
  try {
    // Restaurer base64 standard
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const json = decodeURIComponent(escape(atob(b64)))
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Résout un build compact (noms) vers un build complet (objets) en utilisant les données
 */
export function resolveBuild(compact, data) {
  if (!compact || !data) return null

  const findWeapon = (name) =>
    name ? (data.armes || []).find(a => a.nom.toLowerCase() === name.toLowerCase()) || null : null

  const findWeaponTalent = (name) =>
    name ? (data.talentsArmes || []).find(t => t.nom.toLowerCase() === name.toLowerCase()) || null : null

  const findGear = (name) =>
    name ? (data.equipements || []).find(e => e.nom.toLowerCase() === name.toLowerCase()) || null : null

  const findGearTalent = (name) =>
    name ? (data.talentsEquipements || []).find(t => t.nom.toLowerCase() === name.toLowerCase()) || null : null

  const findSkill = (competence, variante) => {
    if (!competence || !variante) return null
    return (data.competences || []).find(s =>
      s.competence.toLowerCase() === competence.toLowerCase() &&
      s.variante.toLowerCase() === variante.toLowerCase()
    ) || null
  }

  const build = {}

  // Arme spécifique
  build.specialWeapon = findWeapon(compact.sw)

  // Armes classiques
  build.weapons = (compact.w || [null, null]).map(n => findWeapon(n))
  while (build.weapons.length < 2) build.weapons.push(null)

  // Talents d'armes
  build.weaponTalents = (compact.wt || [null, null]).map(n => findWeaponTalent(n))
  while (build.weaponTalents.length < 2) build.weaponTalents.push(null)

  // Arme de poing
  build.sidearm = findWeapon(compact.sa)
  build.sidearmTalent = findWeaponTalent(compact.sat)

  // Équipements
  build.gear = { masque: null, torse: null, holster: null, sac_a_dos: null, gants: null, genouilleres: null }
  if (compact.g) {
    for (const [slot, name] of Object.entries(compact.g)) {
      build.gear[slot] = findGear(name)
    }
  }

  // Talents d'équipement
  build.gearTalents = { torse: null, sac_a_dos: null }
  if (compact.gt) {
    for (const [slot, name] of Object.entries(compact.gt)) {
      build.gearTalents[slot] = findGearTalent(name)
    }
  }

  // Compétences
  build.skills = (compact.s || [null, null]).map(s => s ? findSkill(s.c, s.v) : null)
  while (build.skills.length < 2) build.skills.push(null)

  return build
}

/**
 * Génère l'URL complète de partage du build
 */
export function generateShareUrl(state) {
  const encoded = encodeBuild(state)
  if (!encoded) return null
  const base = window.location.href.split('?')[0].split('#')[0]
  return `${base}#/build?b=${encoded}`
}

