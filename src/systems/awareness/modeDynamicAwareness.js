import { BASELINE_AWARENESS_MAX } from './baselineAwareness.js'

/**
 * Base awareness deltas for `decision_factors.mode` (before scaling by baseline / 50).
 * Keys match `DECISION_FACTOR_MODES` in `systemPrompts.js`.
 */
export const MODE_BASE_AWARENESS_DELTAS = Object.freeze({
  need_relief: 1,
  comfort_seeking: -2,
  avoidance: -4,
  stimulation_seeking: -1,
  exploration: 3,
  self_regulation: 2,
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

/** Combined with mode delta when `decision_factors.unconscious_loop` is true (server-derived). */
export const UNCONSCIOUS_LOOP_BASE_AWARENESS_DELTA = -4
