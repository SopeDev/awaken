/**
 * Player signals as felt experience (no mechanics jargon).
 */

const KNOWN = {
  wasd_north: 'something subtly pulls me toward stepping backward in space — a tug I cannot name',
  wasd_south: 'something subtly pulls me forward — a faint forward urge',
  wasd_east: 'something nudges me toward the right — like a lean I did not choose',
  wasd_west: 'something nudges me left — a sideways pull at the edge of attention',
  intuition_pulse: 'a quick inner ping attaches to one thing nearby — my attention snags and will not quite let go',
  synchronicity: 'the room seems to rhyme with itself — coincidence feels too neat, and it sticks with me',
  dream_carryover: 'an image from sleep is still smeared across waking — a fragment I cannot fully shake',
  emotional_resonance: 'a wave of feeling rises without a clear cause — it colors everything for a moment',
  clarity_burst: 'for a second the fog lifts — things line up with unusual sharpness',
  higher_signal: 'something larger than ordinary thought brushes me — quiet but insistent'
}

/**
 * @param {string|null|undefined} signalType backend id or free text
 * @returns {string|null} null to omit from prompt
 */
export function describePlayerSignal(signalType) {
  if (signalType == null || signalType === '') return null
  const key = String(signalType).trim().toLowerCase().replace(/\s+/g, '_')
  if (KNOWN[key]) return KNOWN[key]
  return `something I cannot quite explain is active — it feels like: ${String(signalType).trim()}`
}
