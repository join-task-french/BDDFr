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

  // Attributs d'armes (nom + valeur)
  const wa = (state.weaponAttributes || []).map(a => a ? { n: a.nom, v: a.valeur } : null)
  if (wa.some(Boolean)) b.wa = wa
  if (state.sidearmAttribute) b.saa = { n: state.sidearmAttribute.nom, v: state.sidearmAttribute.valeur }

  // Attributs d'équipements
  const ga = {}
  for (const [slot, attrs] of Object.entries(state.gearAttributes || {})) {
    if (!attrs) continue
    const entry = {}
    if (attrs.essentiels?.some(Boolean)) entry.e = attrs.essentiels.map(a => a ? { n: a.nom, v: a.valeur } : null)
    if (attrs.classiques?.some(Boolean)) entry.c = attrs.classiques.map(a => a ? { n: a.nom, v: a.valeur } : null)
    if (Object.keys(entry).length > 0) ga[slot] = entry
  }
  if (Object.keys(ga).length > 0) b.ga = ga

  // Mods d'armes (nom du mod)
  const wm = (state.weaponMods || []).map(m => m ? m.map(mod => mod?.nom || null) : null)
  if (wm.some(Boolean)) b.wm = wm
  if (state.sidearmMods) b.sam = state.sidearmMods.map(mod => mod?.nom || null)

  // Mods d'équipements (statistique du mod)
  const gm = {}
  for (const [slot, mod] of Object.entries(state.gearMods || {})) {
    if (mod) gm[slot] = mod.statistique
  }
  if (Object.keys(gm).length > 0) b.gm = gm

  // Mods de compétences (statistique du mod)
  const sm = (state.skillMods || []).map(m => m ? m.statistique : null)
  if (sm.some(Boolean)) b.sm = sm

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

  // Attributs d'armes
  const resolveAttr = (compactAttr) => {
    if (!compactAttr || !data.attributs) return null
    const ref = data.attributs.find(a => a.nom.toLowerCase() === compactAttr.n.toLowerCase())
    if (!ref) return { nom: compactAttr.n, valeur: compactAttr.v }
    return { nom: ref.nom, valeur: compactAttr.v, min: ref.min, max: ref.max, unite: ref.unite, categorie: ref.categorie }
  }
  build.weaponAttributes = (compact.wa || [null, null]).map(a => resolveAttr(a))
  while (build.weaponAttributes.length < 2) build.weaponAttributes.push(null)
  build.sidearmAttribute = resolveAttr(compact.saa)

  // Attributs d'équipements
  build.gearAttributes = {}
  if (compact.ga) {
    for (const [slot, entry] of Object.entries(compact.ga)) {
      build.gearAttributes[slot] = {
        essentiels: (entry.e || []).map(a => resolveAttr(a)),
        classiques: (entry.c || []).map(a => resolveAttr(a)),
      }
    }
  }

  // Mods d'armes
  const findModArme = (name) => name ? (data.modsArmes || []).find(m => m.nom.toLowerCase() === name.toLowerCase()) || null : null
  build.weaponMods = (compact.wm || [null, null]).map(slotMods =>
    slotMods ? slotMods.map(name => findModArme(name)) : null
  )
  while (build.weaponMods.length < 2) build.weaponMods.push(null)
  build.sidearmMods = compact.sam ? compact.sam.map(name => findModArme(name)) : null

  // Mods d'équipements
  build.gearMods = {}
  if (compact.gm) {
    for (const [slot, stat] of Object.entries(compact.gm)) {
      build.gearMods[slot] = (data.modsEquipements || []).find(m => m.statistique === stat) || null
    }
  }

  // Mods de compétences
  build.skillMods = (compact.sm || [null, null]).map(stat =>
    stat ? (data.modsEquipements || []).find(m => m.statistique === stat) || null : null
  )
  while (build.skillMods.length < 2) build.skillMods.push(null)

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

