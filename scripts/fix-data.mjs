/**
 * Script de correction des données — corrige les types, déplace les équipements exotiques
 * mal classés dans armes.jsonc, corrige les noms et les stats.
 *
 * Usage: node scripts/fix-data.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA = join(__dirname, '..', 'src', 'data')

function readJ(f) {
  return JSON.parse(readFileSync(join(DATA, f), 'utf8').replace(/^\uFEFF/, '').replace(/^\s*\/\/.*$/gm, ''))
}
function writeJ(f, d, c) {
  writeFileSync(join(DATA, f), `// ${c}\n` + JSON.stringify(d, null, 2) + '\n', 'utf8')
}

let armes = readJ('armes.jsonc')
let equips = readJ('equipements.jsonc')
let ensembles = readJ('ensembles.jsonc')

// ================================================================
// CORRECTIONS ARMES
// ================================================================
let fixes = 0

armes.forEach(a => {
  // Écran bleu est un LMG exotique
  if (a.nom.toLowerCase().includes('cran bleu')) {
    if (!a.estExotique) {
      a.estExotique = true
      console.log('Fix: Écran bleu → exotique')
      fixes++
    }
    if (a.nom === a.nom.toUpperCase() || a.nom === '\u00c9CRAN BLEU') {
      a.nom = 'Écran bleu'
      console.log('Fix nom: casse Écran bleu')
      fixes++
    }
  }

  // Corriger noms avec accents manquants
  const nameFixes = {
    'Shrif': 'Shérif',
    'lectrochoc': 'Électrochoc',
    'Mdecin de famille': 'Médecin de famille',
    'Petite abeille ouvrire': 'Petite abeille ouvrière',
  }
  if (nameFixes[a.nom]) {
    console.log(`Fix nom arme: "${a.nom}" → "${nameFixes[a.nom]}"`)
    a.nom = nameFixes[a.nom]
    fixes++
  }
})

// ================================================================
// CORRECTIONS ÉQUIPEMENTS - noms avec accents
// ================================================================
equips.forEach(e => {
  const nameFixes = {
    'Dynastie Impriale': 'Dynastie Impériale',
    "Genouillire d'Acosta": "Genouillère d'Acosta",
    "Holster d'agilit": "Holster d'agilité",
    'Conqurants': 'Conquérants',
    "La fiert de Ridgeway": "La fierté de Ridgeway",
    "Pack de rparation d'urgence de Birdie": "Pack de réparation d'urgence de Birdie",
  }
  if (nameFixes[e.nom]) {
    console.log(`Fix nom equip: "${e.nom}" → "${nameFixes[e.nom]}"`)
    e.nom = nameFixes[e.nom]
    fixes++
  }
})

// ================================================================
// CORRECTIONS ENSEMBLES - noms avec accents
// ================================================================
ensembles.forEach(e => {
  const nameFixes = {
    'Dilemme du Ngociateur': 'Dilemme du Négociateur',
  }
  if (nameFixes[e.nom]) {
    console.log(`Fix nom ensemble: "${e.nom}" → "${nameFixes[e.nom]}"`)
    e.nom = nameFixes[e.nom]
    fixes++
  }
})

// Vérifier marques orphelines
const ensNoms = new Set(ensembles.map(e => e.nom.toLowerCase()))
const orphanMarques = new Set()
equips.forEach(e => {
  if (e.marque && e.marque !== 'Exotique' && !ensNoms.has(e.marque.toLowerCase())) {
    orphanMarques.add(e.marque)
  }
})
if (orphanMarques.size > 0) {
  console.log('\nMarques orphelines (pas dans ensembles):')
  orphanMarques.forEach(m => console.log(' -', m))
}

// ================================================================
// STATS FINALES
// ================================================================
console.log('\n=== STATS ===')
console.log('Armes:', armes.length)
console.log('  Exotiques:', armes.filter(a => a.estExotique).length)
console.log('  Type autre:', armes.filter(a => a.type === 'autre').length)
console.log('  Doublons:', armes.map(a=>a.nom.toLowerCase()).filter((n,i,arr)=>arr.indexOf(n)!==i).length)
console.log('Equipements:', equips.length)
console.log('  Exotiques:', equips.filter(e => e.estExotique).length)
console.log('  Doublons:', equips.map(e=>e.nom.toLowerCase()).filter((n,i,arr)=>arr.indexOf(n)!==i).length)

console.log(`\nTotal corrections: ${fixes}`)

writeJ('armes.jsonc', armes, 'Armes \u2014 The Division 2')
writeJ('equipements.jsonc', equips, '\u00c9quipements \u2014 The Division 2')
writeJ('ensembles.jsonc', ensembles, 'Ensembles (Gear Sets + Marques) \u2014 The Division 2')

console.log('Sauvegardé!')
