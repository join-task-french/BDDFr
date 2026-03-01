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

let equips = readJ('equipements.jsonc')
let ensembles = readJ('ensembles.jsonc')

const marqueFixes = {
  'China Light Industries Corp': 'China Light Industries Corporation',
  'Alps Summit Armament': 'Alps Summit Armement',
  'Walker, Harris and co': 'Walker, Harris & co',
}

let fixes = 0

equips.forEach(e => {
  if (marqueFixes[e.marque]) {
    console.log(`Fix marque: "${e.marque}" → "${marqueFixes[e.marque]}" (${e.nom})`)
    e.marque = marqueFixes[e.marque]
    fixes++
  }
})

// Habsburg Guard manque dans les ensembles → l'ajouter
const hasHabsburg = ensembles.find(e => e.nom.toLowerCase().includes('habsburg'))
if (!hasHabsburg) {
  ensembles.push({
    nom: 'Habsburg Guard',
    type: 'marque',
    attributsEssentiels: [],
    bonus1piece: '',
    bonus2pieces: '',
    bonus3pieces: '',
    bonus4pieces: '',
    talentTorse: '',
    talentSac: '',
    logo: ''
  })
  console.log('Ajouté ensemble manquant: Habsburg Guard')
  fixes++
}

// Vérifier les marques orphelines restantes
const ensNoms = new Set(ensembles.map(e => e.nom.toLowerCase()))
const orphans = new Set()
equips.forEach(e => {
  if (e.marque && e.marque !== 'Exotique' && !ensNoms.has(e.marque.toLowerCase())) {
    orphans.add(e.marque)
  }
})
console.log('\nMarques orphelines restantes:', orphans.size)
orphans.forEach(m => console.log(' -', m))

console.log(`\nTotal corrections: ${fixes}`)

writeJ('equipements.jsonc', equips, '\u00c9quipements \u2014 The Division 2')
writeJ('ensembles.jsonc', ensembles, 'Ensembles (Gear Sets + Marques) \u2014 The Division 2')
console.log('Sauvegardé!')

