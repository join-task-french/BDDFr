import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const files = [
  resolve(root, 'src/data/armes.jsonc'),
  resolve(root, 'public/data/armes.jsonc'),
]

for (const file of files) {
  let content = readFileSync(file, 'utf8')
  content = content.replace(/, "headshotMultiplier": true/g, '')
  writeFileSync(file, content, 'utf8')

  // Verify
  const after = readFileSync(file, 'utf8')
  const count = (after.match(/headshotMultiplier/g) || []).length
  console.log(`${file}: ${count} occurrences remaining`)
}

