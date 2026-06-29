// Encode/decode app state into the URL hash so a single link carries
// the full settlement — no backend needed.

const EMPTY = { people: [], activities: [] }

// Unicode-safe base64 (btoa only handles Latin1).
function toBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function fromBase64(b64) {
  const bin = atob(b64)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeState(state) {
  try {
    return toBase64(JSON.stringify(state))
  } catch {
    return ''
  }
}

export function decodeState() {
  try {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return structuredClone(EMPTY)
    const obj = JSON.parse(fromBase64(hash))
    if (!obj || !Array.isArray(obj.people) || !Array.isArray(obj.activities)) {
      return structuredClone(EMPTY)
    }
    return obj
  } catch {
    return structuredClone(EMPTY)
  }
}

// Write state to the hash without adding browser history entries.
export function writeHash(state) {
  const encoded = encodeState(state)
  const url = `${window.location.pathname}${window.location.search}#${encoded}`
  window.history.replaceState(null, '', url)
}
