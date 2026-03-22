/**
 * Intuition Pulse attunement: object types with hidden depth can be attuned,
 * then stay marked until synchronicity lands on that object.
 */

import { getObjectType } from '../../data/objectTypes.js'

/** Plain-language noun for first-person "something about the …" lines (object type id → phrase). */
const INTUITION_FOCUS_PHRASE = {
  books: 'book',
  window: 'window',
  phone: 'phone',
  tv: 'TV',
  computer: 'screen',
  couch: 'couch'
}

/**
 * @param {string} objectTypeId
 * @returns {boolean}
 */
export function objectTypeHasHiddenDepth(objectTypeId) {
  const t = getObjectType(objectTypeId)
  return !!(t && t.hasHiddenDepth)
}

/**
 * @returns {{ isAttuned: boolean, attunedAtMs: number|null, synchronicityConsumed: boolean }}
 */
export function createEmptyAttunementRecord() {
  return {
    isAttuned: false,
    attunedAtMs: null,
    synchronicityConsumed: false
  }
}

/**
 * Vague first-person line for the next LLM decision only (one cycle via pending note).
 * @param {string[]} objectTypeIds types with hidden depth that were just attuned
 * @returns {string|null}
 */
export function buildIntuitionFeltLineForObjectTypes(objectTypeIds) {
  const ids = [...new Set((objectTypeIds || []).filter(Boolean).map(String))]
  if (!ids.length) return null

  const phrases = ids
    .map((id) => INTUITION_FOCUS_PHRASE[id] || id.replace(/_/g, ' '))
    .filter(Boolean)

  if (!phrases.length) return null

  if (phrases.length === 1) {
    return `Something about the ${phrases[0]} keeps pulling at me.`
  }
  if (phrases.length === 2) {
    return `Something about the ${phrases[0]} and the ${phrases[1]} keeps pulling at me.`
  }
  const head = phrases.slice(0, -1).join(', the ')
  const last = phrases[phrases.length - 1]
  return `Something about the ${head}, and the ${last}, keeps pulling at me.`
}
