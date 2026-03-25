/**
 * Needs → natural language for LLM.
 *
 * Same wording at every consciousness level:
 * - r0 (0–19): omit need entirely
 * - r1: a little [adjective]
 * - r2: [adjective]
 * - r3: pretty [adjective]
 * - r4: very [adjective]
 *
 * Bands: r4 ≥80, r3 ≥60, r2 ≥40, r1 ≥20, r0 <20.
 */

import { NEED_KEYS } from '../needs/constants.js'

function band5(value) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  if (v >= 80) return 'r4'
  if (v >= 60) return 'r3'
  if (v >= 40) return 'r2'
  if (v >= 20) return 'r1'
  return 'r0'
}

/** One base adjective per need (lowercase). */
const NEED_BASE = {
  hunger: 'hungry',
  thirst: 'thirsty',
  fatigue: 'tired',
  dirtiness: 'dirty',
  boredom: 'bored',
  stress: 'stressed',
  loneliness: 'lonely'
}

function phraseForNeed(key, value) {
  const band = band5(value)
  if (band === 'r0') return null
  const base = NEED_BASE[key]
  if (!base) return null
  if (band === 'r1') return `a little ${base}`
  if (band === 'r2') return base
  if (band === 'r3') return `pretty ${base}`
  if (band === 'r4') return `very ${base}`
  return null
}

/**
 * @param {Record<string, number>} needs
 * @param {number} [_consciousnessLevel] unused; kept for call-site compatibility
 * @returns {string}
 */
export function buildNeedsDescription(needs, _consciousnessLevel = 5) {
  const n = needs || {}
  const parts = []
  for (const key of NEED_KEYS) {
    const v = Math.max(0, Math.min(100, Number(n[key]) || 0))
    const phrase = phraseForNeed(key, v)
    if (phrase) parts.push(phrase)
  }
  if (parts.length === 0) return 'fine'
  return parts.join(', ')
}
