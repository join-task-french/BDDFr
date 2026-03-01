// Utilitaire pour charger les fichiers JSONC (JSON avec commentaires)
function stripJsonComments(text) {
  // Remove BOM + single-line comments
  return text.replace(/^\uFEFF/, '').replace(/^\s*\/\/.*$/gm, '')
}

const cache = {}

export async function loadJsonc(path) {
  if (cache[path]) return cache[path]
  const resp = await fetch(path)
  if (!resp.ok) {
    throw new Error(`Erreur chargement ${path}: ${resp.status} ${resp.statusText}`)
  }
  const text = await resp.text()
  try {
    const data = JSON.parse(stripJsonComments(text))
    cache[path] = data
    return data
  } catch (e) {
    throw new Error(`Erreur parsing ${path}: ${e.message}`)
  }
}

export function clearCache() {
  Object.keys(cache).forEach(k => delete cache[k])
}

