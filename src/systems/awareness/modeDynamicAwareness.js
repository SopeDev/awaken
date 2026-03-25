import { BASELINE_AWARENESS_MAX } from './baselineAwareness.js'

/**
 * Base awareness deltas for `decision_factors.mode` (before scaling by baseline / 50).
 * `signal_response` and any other API modes are omitted — no delta until explicitly tuned.
 */
export const MODE_BASE_AWARENESS_DELTAS = Object.freeze({
  need_relief: 1,
  habit_relief: -2,
  avoidance: -4,
  stimulation_seeking: -1,
  exploration: 2,
  self_regulation: 2,
  unconscious_loop: -5,
  insight_following: 5
})

export const MODES_WITH_BASE_AWARENESS_DELTA = new Set(Object.keys(MODE_BASE_AWARENESS_DELTAS))

export function getBaseModeAwarenessDelta(mode) {
  if (typeof mode !== 'string') return null
  const k = mode.trim()
  return MODES_WITH_BASE_AWARENESS_DELTA.has(k) ? MODE_BASE_AWARENESS_DELTAS[k] : null
}

/**
 * @param {number} baseDelta
 * @param {number} baselineAwareness - instantaneous baseline 0–50
 */
export function scaleModeDeltaByBaseline(baseDelta, baselineAwareness) {
  const b = Math.max(0, Math.min(BASELINE_AWARENESS_MAX, Number(baselineAwareness) || 0))
  const baselineScale = b / BASELINE_AWARENESS_MAX
  return baseDelta * baselineScale
}
