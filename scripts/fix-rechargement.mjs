import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const armesPath = path.join(__dirname, '../src/data/armes.jsonc');

try {
    let rawData = fs.readFileSync(armesPath, 'utf-8');
    const cleanData = rawData.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    const armes = JSON.parse(cleanData);

    let updatedCount = 0;

    for (const [cle, arme] of Object.entries(armes)) {
        if (arme.rechargement && typeof arme.rechargement === 'number' && arme.rechargement > 0) {
            let nouvelleValeur = arme.rechargement / 1.1;
            arme.rechargement = Number(nouvelleValeur.toFixed(2));
            updatedCount++;
        }
    }

    fs.writeFileSync(armesPath, JSON.stringify(armes, null, 2), 'utf-8');

    console.log(`✅ Succès ! ${updatedCount} armes ont vu leur temps de rechargement corrigé.`);

} catch (error) {
    console.error("❌ Une erreur est survenue lors du traitement :", error.message);
}