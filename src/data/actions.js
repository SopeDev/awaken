/**
 * Global action registry. Actions are scene-agnostic; each targets an object type and has duration + label.
 * Used by any scene that supports interactions (e.g. Room). Needs system uses action ids for ACTION_EFFECTS.
 */

import { ACTION_DEFS_BY_ACTION_ID } from './objectTypes.js'

export const ACTIONS = ACTION_DEFS_BY_ACTION_ID

export const AVAILABLE_ACTION_IDS = Object.keys(ACTIONS)

/** A–Z for LLM prompts and any non-LLM fallback (not `Object.keys` order). */
export const AVAILABLE_ACTION_IDS_ALPHABETICAL = [...AVAILABLE_ACTION_IDS].sort((a, b) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' })
)

/** When the decision API cannot be used — uniform random, not score-weighted. */
export function pickUniformRandomActionId(allowedIds) {
  const list =
    Array.isArray(allowedIds) && allowedIds.length
      ? [...allowedIds]
      : [...AVAILABLE_ACTION_IDS_ALPHABETICAL]
  return list[Math.floor(Math.random() * list.length)]
}

/** Duration (ms) to tween avatar to target. */
export const MOVE_DURATION = 600

/** Default duration (ms) when an action has no durationMs. */
export const INTERACTION_DURATION = 800

export function getActionLabel(actionId) {
  const a = ACTIONS[actionId]
  return a ? a.label : actionId.replace(/_/g, ' ')
}

/** Past-tense first verb for activity diary lines (e.g. "watch TV" → "watched TV"). */
const IRREGULAR_PAST_VERB = {
  go: 'went',
  get: 'got',
  sit: 'sat',
  take: 'took',
  read: 'read',
}

export function imperativeLabelToPastPhrase(imperativeLabel) {
  const s = String(imperativeLabel || '').trim()
  if (!s) return s
  const parts = s.split(/\s+/)
  const firstRaw = parts[0]
  const first = firstRaw.toLowerCase()
  const rest = parts.slice(1)
  let past = IRREGULAR_PAST_VERB[first]
  if (!past) {
    past = first.endsWith('e') ? `${first}d` : `${first}ed`
  }
  return [past, ...rest].join(' ')
}

export function getActionPastPhrase(actionId) {
  return imperativeLabelToPastPhrase(getActionLabel(actionId))
}
