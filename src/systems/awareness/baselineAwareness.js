import { NEED_KEYS } from '../needs/constants.js'

/** Foundation meter (needs-only); future dynamic buffer layers on top toward a 0–100 display. */
export const BASELINE_AWARENESS_MAX = 50

/**
 * Unequal weights: stress / loneliness / fatigue dominate; boredom / dirtiness less.
 * Order independent — iteration follows NEED_KEYS.
 */
export const NEED_WEIGHTS_FOR_BASELINE = Object.freeze({
  stress: 1.25,
  loneliness: 1.2,
  fatigue: 1.15,
  hunger: 0.95,
  thirst: 0.95,
  boredom: 0.75,
  dirtiness: 0.55
})

/**
 * @param {Record<string, number>} needs - current need values 0–100 (0 = satisfied)
 * @returns {{
 *   weightedBurden: number,
 *   maxWeightedBurden: number,
 *   burdenRatio: number,
 *   baselineAwareness: number,
 *   weightedTerms: Record<string, { value: number, weight: number, weighted: number }>,
 *   needWeights: Record<string, number>
 * }}
 */
export function computeBaselineAwarenessBreakdown(needs) {
  let weightedBurden = 0
  let maxWeightedBurden = 0
  const weightedTerms = {}

  for (const key of NEED_KEYS) {
    const w = NEED_WEIGHTS_FOR_BASELINE[key] ?? 0
    maxWeightedBurden += w * 100
    const v = Math.max(0, Math.min(100, Number(needs?.[key]) || 0))
    const weighted = v * w
    weightedBurden += weighted
    weightedTerms[key] = { value: v, weight: w, weighted }
  }

  const burdenRatio =
    maxWeightedBurden > 0
      ? Math.max(0, Math.min(1, weightedBurden / maxWeightedBurden))
      : 0

  const raw = BASELINE_AWARENESS_MAX * (1 - burdenRatio)
  const baselineAwareness = Math.max(0, Math.min(BASELINE_AWARENESS_MAX, raw))

  return {
    weightedBurden,
    maxWeightedBurden,
    burdenRatio,
    baselineAwareness,
    weightedTerms,
    needWeights: { ...NEED_WEIGHTS_FOR_BASELINE }
  }
}
