// Fix remaining issues
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

// Find duplicates
const seen = {}
const dupes = []
armes.forEach((a, i) => {
  const key = a.nom.toLowerCase()
  if (seen[key] !== undefined) {
    dupes.push({ name: a.nom, idx1: seen[key], idx2: i })
  } else {
    seen[key] = i
  }
})

console.log('Doublons trouvés:', dupes.length)

for (const d of dupes) {
  const a1 = armes[d.idx1]
  const a2 = armes[d.idx2]
  console.log(`\nDoublon: "${d.name}"`)
  console.log(`  #1: type=${a1.type} fab=${a1.fabricant} rpm=${a1.rpm} exo=${a1.estExotique} portee=${a1.portee}`)
  console.log(`  #2: type=${a2.type} fab=${a2.fabricant} rpm=${a2.rpm} exo=${a2.estExotique} portee=${a2.portee}`)

  // Merge: keep the one with more data, merge talents from exotic
  const hasStats1 = a1.portee > 0 || a1.rpm > 0
  const hasStats2 = a2.portee > 0 || a2.rpm > 0
  const hasTalent1 = !!a1.talent1
  const hasTalent2 = !!a2.talent1

  let keep, remove
  if (hasStats1 && !hasStats2) { keep = d.idx1; remove = d.idx2 }
  else if (hasStats2 && !hasStats1) { keep = d.idx2; remove = d.idx1 }
  else if (a1.estExotique) { keep = d.idx1; remove = d.idx2 }
  else { keep = d.idx2; remove = d.idx1 }

  // Merge talents from removed into kept
  const kept = armes[keep]
  const removed = armes[remove]
  if (!kept.talent1 && removed.talent1) kept.talent1 = removed.talent1
  if (!kept.talent2 && removed.talent2) kept.talent2 = removed.talent2
  if (!kept.obtention && removed.obtention) kept.obtention = removed.obtention
  if (kept.portee === 0 && removed.portee > 0) kept.portee = removed.portee
  if (kept.rpm === 0 && removed.rpm > 0) kept.rpm = removed.rpm
  if (kept.chargeur === 0 && removed.chargeur > 0) kept.chargeur = removed.chargeur
  if (kept.rechargement === 0 && removed.rechargement > 0) kept.rechargement = removed.rechargement
  if (!kept.headshot && removed.headshot) kept.headshot = removed.headshot
  if (!kept.attributEssentiel && removed.attributEssentiel) kept.attributEssentiel = removed.attributEssentiel
  if (kept.degatsBase === 0 && removed.degatsBase > 0) kept.degatsBase = removed.degatsBase
  if (kept.degatsMax === 0 && removed.degatsMax > 0) kept.degatsMax = removed.degatsMax
  if (kept.fabricant === 'Exotique' && removed.fabricant !== 'Exotique') kept.fabricant = removed.fabricant
  if (kept.type === 'autre' && removed.type !== 'autre') kept.type = removed.type

  // Mark for removal
  armes[remove] = null
  console.log(`  Gardé #${keep === d.idx1 ? 1 : 2}, supprimé #${remove === d.idx1 ? 1 : 2}`)
}

armes = armes.filter(a => a !== null)
console.log('\nArmes finales:', armes.length)
console.log('Type autre:', armes.filter(a => a.type === 'autre').length)

// Final check for doublons
const finalNames = armes.map(a => a.nom.toLowerCase())
const finalDupes = finalNames.filter((n, i) => finalNames.indexOf(n) !== i)
console.log('Doublons restants:', finalDupes.length)

writeJ('armes.jsonc', armes, 'Armes \u2014 The Division 2')
console.log('Sauvegardé!')

