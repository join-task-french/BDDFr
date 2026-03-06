/**
 * Migre le champ headshot de string ("60%", "137% x Bonus") vers number + headshotMultiplier boolean.
 * Appliqué sur src/data/armes.jsonc et public/data/armes.jsonc.
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const files = [
  resolve(root, 'src/data/armes.jsonc'),
  resolve(root, 'public/data/armes.jsonc'),
  resolve(root, 'src/data/class-spe.jsonc'),
  resolve(root, 'public/data/class-spe.jsonc'),
]

for (const file of files) {
  let content = readFileSync(file, 'utf8')

  // Match "headshot": "137% x Bonus" → "headshot": 137, "headshotMultiplier": true
  content = content.replace(
    /"headshot":\s*"(\d+)%\s*x\s*Bonus"/g,
    '"headshot": $1, "headshotMultiplier": true'
  )

  // Match "headshot": "60%" → "headshot": 60
  content = content.replace(
    /"headshot":\s*"(\d+)%"/g,
    '"headshot": $1'
  )

  writeFileSync(file, content, 'utf8')
  console.log(`✅ Migrated: ${file}`)
}

console.log('\nDone! Headshot values converted to numbers.')


