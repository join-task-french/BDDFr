// Quick fix for Acosta + remaining checks
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

console.log('AVANT - Armes:', armes.length, '| Equip:', equips.length)
console.log('Type autre:', armes.filter(a => a.type === 'autre').length)

// Trouver et déplacer Acosta
const acosta = armes.find(a => a.nom.includes('Acosta'))
if (acosta) {
  console.log('Acosta trouvé:', acosta.nom)
  armes = armes.filter(a => !a.nom.includes('Acosta'))
  equips.push({
    nom: "Genouillère d'Acosta",
    marque: 'Exotique',
    emplacement: 'genouilleres',
    attributEssentiel: '',
    attribut1: '',
    attributUnique: '',
    talent: '',
    mod: '',
    estNomme: false,
    source: 'exotic',
    estExotique: true,
    talent1: acosta.talent1 || '',
    talent2: acosta.talent2 || '',
    obtention: acosta.obtention || '',
  })
}

// Vérifier qu'il n'y a plus de type 'autre'
const encore = armes.filter(a => a.type === 'autre')
console.log('Type autre restant:', encore.length)
encore.forEach(a => console.log(' -', a.nom))

// Vérifier doublons dans armes
const noms = armes.map(a => a.nom.toLowerCase())
const dupes = noms.filter((n, i) => noms.indexOf(n) !== i)
console.log('Doublons armes:', dupes.length)
dupes.forEach(d => console.log(' -', d))

// Vérifier doublons dans équipements
const eqNoms = equips.map(e => e.nom.toLowerCase())
const eqDupes = eqNoms.filter((n, i) => eqNoms.indexOf(n) !== i)
console.log('Doublons equip:', eqDupes.length)
eqDupes.forEach(d => console.log(' -', d))

// Vérifier équipements avec emplacement incorrect
const badSlots = equips.filter(e =>
  !['masque', 'torse', 'holster', 'sac_a_dos', 'gants', 'genouilleres', 'inconnu'].includes(e.emplacement)
)
console.log('Emplacements invalides:', badSlots.length)
badSlots.forEach(e => console.log(' -', e.nom, e.emplacement))

writeJ('armes.jsonc', armes, 'Armes \u2014 The Division 2')
writeJ('equipements.jsonc', equips, '\u00c9quipements \u2014 The Division 2')

console.log('APRES - Armes:', armes.length, '| Equip:', equips.length)

