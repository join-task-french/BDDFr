// Utilitaire pour charger les fichiers JSONC (JSON avec commentaires)
function stripJsonComments(text) {
  return text.replace(/^\s*\/\/.*$/gm, '')
}

const cache = {}

export async function loadJsonc(path) {
  if (cache[path]) return cache[path]
  const resp = await fetch(path)
  const text = await resp.text()
  const data = JSON.parse(stripJsonComments(text))
  cache[path] = data
  return data
}

export function clearCache() {
  Object.keys(cache).forEach(k => delete cache[k])
}

