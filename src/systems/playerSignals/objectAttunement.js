/**
 * Intuition Pulse attunement: object types with hidden depth can be attuned,
 * then stay marked until synchronicity lands on that object.
 */

import { getObjectType } from '../../data/objectTypes.js'

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
    .map((id) => {
      const t = getObjectType(id)
      return t?.intuitionFocusPhrase || id.replace(/_/g, ' ')
    })
    .filter(Boolean)

  if (!phrases.length) return null

  if (phrases.length === 1) {
    return `*The ${phrases[0]} catches my attention*`
  }
  if (phrases.length === 2) {
    return `*The ${phrases[0]} and the ${phrases[1]} catch my attention*`
  }
  const head = phrases.slice(0, -1).join(', the ')
  const last = phrases[phrases.length - 1]
  return `*The ${head}, and the ${last}, catch my attention*`
}
