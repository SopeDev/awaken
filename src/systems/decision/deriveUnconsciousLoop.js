/**
 * Backend-derived "unconscious loop" — repetitive action that already failed on the current primary,
 * excluding legitimate repeated bodily care (see `bodilyTargets` on actions).
 */

import { NEED_KEYS } from '../needs/constants.js'
import { BODILY_PRIMARY_KEY_SET, isPrimaryOutcomeFailure } from '../character/needOutcomeLabels.js'
import { BODILY_TARGETS_BY_ACTION_ID } from '../../data/objectTypes.js'

/**
 * @param {object} p
 * @param {string} p.chosenActionId
 * @param {string} p.primary - normalized decision_factors.primary ('none' or need key)
 * @param {string[]} p.recentActionIds - IDs of chosen actions before this decision (POST body)
 * @param {Array<{ actionId: string, primary: string, primaryResult: string }>} p.recentCompletionEvaluations
 * @param {string[]} [p.bodilyTargets] - override; default from BODILY_TARGETS_BY_ACTION_ID
 * @returns {boolean}
 */
export function deriveUnconsciousLoop({
  chosenActionId,
  primary,
  recentActionIds,
  recentCompletionEvaluations,
  bodilyTargets: bodilyTargetsOverride
}) {
  const actionId = typeof chosenActionId === 'string' ? chosenActionId.trim() : ''
  if (!actionId) return false

  const primaryNorm = typeof primary === 'string' ? primary.trim().toLowerCase() : ''
  if (!primaryNorm || primaryNorm === 'none') return false
  if (!NEED_KEYS.includes(primaryNorm)) return false

  const ids = Array.isArray(recentActionIds) ? recentActionIds.map(String) : []
  const last3 = ids.length ? ids.slice(-3) : []
  const immediatePrev = ids.length ? ids[ids.length - 1] : null
  const countInLast3 = last3.filter((id) => id === actionId).length
  const repeats =
    (immediatePrev != null && immediatePrev === actionId) || countInLast3 >= 2
  if (!repeats) return false

  const rows = Array.isArray(recentCompletionEvaluations) ? recentCompletionEvaluations : []
  const hadMatchingFailure = rows.some(
    (r) =>
      r &&
      String(r.actionId) === actionId &&
      String(r.primary || '').toLowerCase() === primaryNorm &&
      isPrimaryOutcomeFailure(r.primaryResult)
  )
  if (!hadMatchingFailure) return false

  const bodilyTargets = Array.isArray(bodilyTargetsOverride)
    ? bodilyTargetsOverride
    : BODILY_TARGETS_BY_ACTION_ID[actionId] || []
  const targets = new Set(bodilyTargets.map((k) => String(k).toLowerCase()))
  if (BODILY_PRIMARY_KEY_SET.has(primaryNorm) && targets.has(primaryNorm)) return false

  return true
}
