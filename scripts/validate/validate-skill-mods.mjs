import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'jsonc-parser'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', '..', 'src', 'data')

const COMPETENCES_FILE = 'competences.jsonc'
const MODS_FILE = 'mods-competences.jsonc'

/**
 * Charge et parse un fichier JSONC.
 */
function loadJsonc(filename) {
    try {
        const filepath = join(DATA_DIR, filename)
        const content = readFileSync(filepath, 'utf8')
        return parse(content)
    } catch (e) {
        console.error(`❌ Erreur lors du chargement de ${filename} : ${e.message}`)
        process.exit(1)
    }
}

console.log('🔍 Validation des emplacements des mods de compétences...')

const competences = loadJsonc(COMPETENCES_FILE)
const mods = loadJsonc(MODS_FILE)

let errors = []
let checkedCount = 0

for (const [modId, modData] of Object.entries(mods)) {
    const { competence: competenceId, emplacement } = modData
    
    if (!competenceId) {
        errors.push(`Mod "${modId}": La propriété "competence" est manquante.`)
        continue
    }

    if (!emplacement) {
        errors.push(`Mod "${modId}": La propriété "emplacement" est manquante.`)
        continue
    }

    // Vérifier si la compétence existe
    if (!competences[competenceId]) {
        errors.push(`Mod "${modId}": La compétence "${competenceId}" n'existe pas dans ${COMPETENCES_FILE}`)
        continue
    }
    
    const competenceData = competences[competenceId]
    const validEmplacements = (competenceData.emplacementsMods || []).map(e => e.emplacement)
    
    if (!validEmplacements.includes(emplacement)) {
        errors.push(`Mod "${modId}": L'emplacement "${emplacement}" n'est pas valide pour la compétence "${competenceId}". Emplacements valides: ${validEmplacements.length > 0 ? validEmplacements.join(', ') : 'Aucun'}`)
    }
    
    checkedCount++
}

if (errors.length > 0) {
    console.error(`\n❌ Validation échouée : ${errors.length} erreur(s) trouvée(s) sur ${checkedCount} mods vérifiés :`)
    errors.forEach(err => console.error(`  - ${err}`))
    process.exit(1)
} else {
    console.log(`\n✅ Validation réussie : ${checkedCount} mods de compétences vérifiés avec succès.`)
    process.exit(0)
}
