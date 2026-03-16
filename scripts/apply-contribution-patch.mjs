import fs from 'fs';
import { applyEdits, modify } from 'jsonc-parser';

const body = process.env.ISSUE_BODY;
const regex = /[\s\S]*?```json\n([\s\S]*?)\n```[\s\S]*?/;
const match = body?.match(regex);

if (!match) {
    console.log("Aucune donnée de contribution trouvée dans le corps de l'issue.");
    process.exit(0);
}

let patches;
try {
    patches = JSON.parse(match[1]);
} catch (e) {
    console.error("Erreur fatale : Le bloc JSON de contribution est invalide.");
    process.exit(1);
}

const modifyOptions = {
    formattingOptions: {
        insertSpaces: true,
        tabSize: 2,
        eol: '\n'
    }
};

for (const patch of patches) {
    const { path, upserts } = patch;

    if (!fs.existsSync(path)) {
        console.error(`Erreur fatale : Fichier introuvable : ${path}`);
        process.exit(1);
    }

    let content = fs.readFileSync(path, 'utf8');

    for (const [slug, newItem] of Object.entries(upserts)) {
        const edits = modify(content, [slug], newItem, modifyOptions);
        content = applyEdits(content, edits);
        console.log(`+ Mise à jour de la clé : ${slug} dans ${path}`);
    }

    fs.writeFileSync(path, content, 'utf8');
    console.log(`✅ Fichier ${path} mis à jour avec succès (commentaires préservés).`);
}