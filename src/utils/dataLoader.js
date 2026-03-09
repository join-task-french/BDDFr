function stripJsonComments(text) {
  text = text.replace(/^\uFEFF/, '');
  return text.replace(/("(?:\\.|[^\\"])*")|(\/\*[\s\S]*?\*\/)|(\/\/(?:.*)$)/gm, (match, string) => {
    if (string) return string;
    return '';
  });
}

const cache = {}

export async function loadJsonc(path) {
  if (cache[path]) return cache[path]
  const versionedPath = `${path}?v=${__APP_VERSION__}`
  const resp = await fetch(versionedPath)

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

