// Persist app state in localStorage so a reload keeps the draft,
// but the URL stays clean (no state encoded in the link).

const KEY = 'settleup:state'
const ONBOARD_KEY = 'settleup:onboarded'
const EMPTY = { groupName: '', people: [], activities: [] }

function isValid(obj) {
  return obj && Array.isArray(obj.people) && Array.isArray(obj.activities)
}

// One-time migration: older versions stored state in the URL hash.
// If present, decode it and strip the hash from the URL.
function readLegacyHash() {
  try {
    const hash = window.location.hash.replace(/^#/, '')
    if (hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      const bin = atob(hash)
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
      const obj = JSON.parse(new TextDecoder().decode(bytes))
      if (isValid(obj)) return obj
    }
  } catch {
    /* ignore malformed legacy hash */
  }
  return null
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const obj = JSON.parse(raw)
      if (isValid(obj)) return { groupName: '', ...obj }
    }
  } catch {
    /* ignore */
  }
  const legacy = readLegacyHash()
  if (legacy) {
    saveState(legacy)
    return { groupName: '', ...legacy }
  }
  return structuredClone(EMPTY)
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full / unavailable — ignore */
  }
}

// First-visit onboarding flag, kept under a separate key so that
// resetting the data ('초기화') does not re-trigger the walkthrough.
export function isOnboarded() {
  try {
    return localStorage.getItem(ONBOARD_KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboarded() {
  try {
    localStorage.setItem(ONBOARD_KEY, '1')
  } catch {
    /* ignore */
  }
}
